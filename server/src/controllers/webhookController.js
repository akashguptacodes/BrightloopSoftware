import prisma from '../config/database.js';
import { verifyWebhookSignature } from '../services/razorpayService.js';
import { sendPaymentFailedEmail } from '../services/emailService.js';

/**
 * Handle incoming Razorpay Webhook notifications
 * Path: POST /api/webhooks/razorpay
 */
export async function handleRazorpayWebhook(req, res) {
  const signature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('[Webhook] RAZORPAY_WEBHOOK_SECRET is not configured in .env. Skipping verification.');
  } else if (!signature || !verifyWebhookSignature(req.rawBody, signature, webhookSecret)) {
    console.error('[Webhook] Invalid Razorpay webhook signature');
    return res.status(400).json({ status: 'error', message: 'Invalid webhook signature' });
  }

  const eventPayload = req.body;
  const eventId = eventPayload.event_id || eventPayload.id;
  const eventType = eventPayload.event;

  console.log(`[Webhook] Received Razorpay event: ${eventType} (ID: ${eventId})`);

  try {
    // 1. Idempotency Check: check if event was already received and processed
    if (eventId) {
      const existing = await prisma.razorpayWebhookEvent.findUnique({
        where: { eventId },
      });

      if (existing && existing.isProcessed) {
        console.log(`[Webhook] Event ${eventId} was already processed. Returning 200 OK.`);
        return res.status(200).json({ status: 'ok', message: 'Already processed' });
      }

      if (!existing) {
        await prisma.razorpayWebhookEvent.create({
          data: {
            eventId,
            eventType: eventType || 'unknown',
            payload: eventPayload,
            isProcessed: false,
          },
        });
      }
    }

    // 2. Handle specific events
    if (eventType === 'payment.captured') {
      const paymentEntity = eventPayload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (orderId && paymentId) {
        // Find if a payment record exists or find invoice by notes
        const existingPayment = await prisma.payment.findFirst({
          where: { razorpayOrderId: orderId },
        });

        if (existingPayment && existingPayment.status !== 'SUCCESSFUL') {
          // Mark successful
          await prisma.$transaction(
            async (tx) => {
              await tx.payment.update({
                where: { id: existingPayment.id },
                data: {
                  status: 'SUCCESSFUL',
                  razorpayPaymentId: paymentId,
                  gatewayResponse: paymentEntity,
                },
              });

              // Also check invoice status
              const inv = await tx.invoice.findUnique({ where: { id: existingPayment.invoiceId } });
              if (inv) {
                const newAmountPaid = Number(inv.amountPaid) + Number(existingPayment.amount);
                const newAmountDue = Math.max(0, Number(inv.grandTotal) - newAmountPaid);
                const newStatus = newAmountDue <= 0.001 ? 'PAID' : 'PARTIALLY_PAID';

                await tx.invoice.update({
                  where: { id: inv.id },
                  data: {
                    amountPaid: newAmountPaid,
                    amountDue: newAmountDue,
                    status: newStatus,
                    paidAt: newStatus === 'PAID' ? new Date() : inv.paidAt,
                  },
                });
              }
            },
            { maxWait: 15000, timeout: 30000 }
          );
        }
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = eventPayload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const failureReason = paymentEntity?.error_description || 'Payment failed at gateway';

      if (orderId) {
        const existingPayment = await prisma.payment.findFirst({
          where: { razorpayOrderId: orderId },
          include: { customer: true, invoice: true },
        });

        if (existingPayment) {
          await prisma.payment.update({
            where: { id: existingPayment.id },
            data: {
              status: 'FAILED',
              razorpayPaymentId: paymentId || existingPayment.razorpayPaymentId,
              gatewayResponse: paymentEntity,
              notes: `${existingPayment.notes || ''} [Failure: ${failureReason}]`.trim(),
            },
          });

          // Send payment failure email notification
          if (existingPayment.customer && existingPayment.invoice) {
            sendPaymentFailedEmail({
              customer: existingPayment.customer,
              invoice: existingPayment.invoice,
              reason: failureReason,
            }).catch((err) => console.error('[Webhook] Failed to send failure email:', err));
          }
        }
      }
    }

    // 3. Mark webhook event as processed
    if (eventId) {
      await prisma.razorpayWebhookEvent.update({
        where: { eventId },
        data: {
          isProcessed: true,
          processedAt: new Date(),
        },
      });
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('[Webhook] Processing error:', error);
    // Always return 200 or 500 to gateway
    return res.status(500).json({ status: 'error', message: error.message });
  }
}

