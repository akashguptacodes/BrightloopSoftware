import transporter from '../config/mail.js';

/**
 * Send a password reset email.
 */
export async function sendPasswordResetEmail(email, name, resetUrl) {
  if (!transporter) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Password reset link for ${email}: ${resetUrl}`);
    }
    return;
  }

  const fromAddress = process.env.SMTP_FROM || 'noreply@brightloop.com';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Brightloop Software</h2>
          <p style="margin: 0;">Password Reset Request</p>
        </div>
        <div class="content">
          <p>Hi ${name || 'Customer'},</p>
          <p>You requested a password reset for your account. Click the button below to reset your password:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button" style="color: white;">Reset Password</a>
          </p>
          <p>This link will expire in <strong>15 minutes</strong>.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Brightloop Software. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: 'Password Reset Request — Brightloop Software',
      html: htmlContent,
    });
  } catch (error) {
    console.warn(`[EMAIL WARNING] Failed to deliver password reset email to ${email}:`, error.message);
  }
}

/**
 * Send quotation notification email to customer
 */
export async function sendQuotationEmail(email, customerName, quotationNumber, grandTotal, validUntil, quotationId) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const viewUrl = `${frontendUrl}/customer/quotations/${quotationId}`;

  if (!transporter) {
    console.log(`[DEV EMAIL] Quotation ${quotationNumber} sent to ${email} (Total: ₹${grandTotal}). Portal Link: ${viewUrl}`);
    return;
  }

  const fromAddress = process.env.SMTP_FROM || 'noreply@brightloop.com';
  const validUntilStr = validUntil ? new Date(validUntil).toLocaleDateString() : 'N/A';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0f172a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">Brightloop Software</h2>
          <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 14px;">Quotation Offer #${quotationNumber}</p>
        </div>
        <div class="content">
          <p>Dear ${customerName || 'Valued Customer'},</p>
          <p>We have prepared a formal commercial quotation for your requested subscription and software services.</p>
          
          <div class="card">
            <p style="margin: 4px 0;"><strong>Quotation Number:</strong> ${quotationNumber}</p>
            <p style="margin: 4px 0;"><strong>Grand Total:</strong> ₹${Number(grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            <p style="margin: 4px 0;"><strong>Offer Valid Until:</strong> ${validUntilStr}</p>
          </div>

          <p>You can review the full line-item breakdown, specifications, and approve or reject this offer directly in your customer portal:</p>
          
          <p style="text-align: center;">
            <a href="${viewUrl}" class="button" style="color: #ffffff;">Review & Approve Quotation</a>
          </p>

          <p style="font-size: 13px; color: #64748b;">
            Please note this quotation is valid until ${validUntilStr}. If you have any questions, reply directly to your Brightloop account representative.
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Brightloop Software. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `New Quotation #${quotationNumber} from Brightloop Software`,
      html: htmlContent,
    });
  } catch (error) {
    console.warn(`[EMAIL WARNING] Failed to deliver quotation email to ${email}:`, error.message);
  }
}

/**
 * Send quotation status update notification
 */
export async function sendQuotationStatusEmail(email, customerName, quotationNumber, status, reason = null) {
  if (!transporter) {
    console.log(`[DEV EMAIL] Quotation ${quotationNumber} status updated to ${status} for ${email}. Reason: ${reason || 'N/A'}`);
    return;
  }

  const fromAddress = process.env.SMTP_FROM || 'noreply@brightloop.com';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background: #0f172a; color: white; padding: 16px 20px;">
          <h3 style="margin: 0;">Brightloop Software</h3>
        </div>
        <div style="padding: 24px; background: #ffffff;">
          <p>Dear ${customerName},</p>
          <p>Quotation <strong>#${quotationNumber}</strong> has been marked as <strong>${status}</strong>.</p>
          ${reason ? `<p><strong>Notes:</strong> ${reason}</p>` : ''}
          <p>Thank you for partnering with Brightloop Software.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `Quotation #${quotationNumber} Status Update: ${status}`,
      html: htmlContent,
    });
  } catch (error) {
    console.warn(`[EMAIL WARNING] Failed to send quotation status email:`, error.message);
  }
}

/**
 * Send subscription status notification
 */
export async function sendSubscriptionStatusEmail(email, customerName, subscriptionNumber, status, details = {}) {
  if (!transporter) {
    console.log(`[DEV EMAIL] Subscription ${subscriptionNumber} status: ${status} for ${email}`);
    return;
  }

  const fromAddress = process.env.SMTP_FROM || 'noreply@brightloop.com';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background: #0f172a; color: white; padding: 16px 20px;">
          <h3 style="margin: 0;">Brightloop Software</h3>
        </div>
        <div style="padding: 24px; background: #ffffff;">
          <p>Dear ${customerName},</p>
          <p>Your subscription <strong>#${subscriptionNumber}</strong> status is now: <strong style="color: #2563eb;">${status}</strong>.</p>
          ${details.nextBillingDate ? `<p>Next Billing Date: ${new Date(details.nextBillingDate).toLocaleDateString()}</p>` : ''}
          ${details.reason ? `<p>Reason: ${details.reason}</p>` : ''}
          <p>You can review your active services and history in your customer portal anytime.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `Subscription #${subscriptionNumber}: ${status}`,
      html: htmlContent,
    });
  } catch (error) {
    console.warn(`[EMAIL WARNING] Failed to send subscription status email:`, error.message);
  }
}

/**
 * Send Invoice Issued Email to Customer
 */
export async function sendInvoiceIssuedEmail({ invoice, customer }) {
  const email = customer?.email;
  const customerName = customer?.contactPerson || 'Valued Customer';
  const invoiceNumber = invoice.invoiceNumber;
  const totalAmount = Number(invoice.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const dueDate = new Date(invoice.dueDate).toLocaleDateString();

  if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
    console.log(`[DEV EMAIL] Invoice ${invoiceNumber} issued to ${email} for INR ${totalAmount}. Due: ${dueDate}`);
    return;
  }

  const fromAddress = process.env.SMTP_FROM || 'billing@brightloop.com';
  const portalUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background: #1e40af; color: white; padding: 20px;">
          <h2 style="margin: 0;">Brightloop Software — Invoice Issued</h2>
        </div>
        <div style="padding: 24px; background: #ffffff;">
          <p>Dear ${customerName},</p>
          <p>A new invoice <strong>${invoiceNumber}</strong> has been generated for your account.</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
            <p style="margin: 4px 0;"><strong>Total Amount:</strong> ₹${totalAmount}</p>
            <p style="margin: 4px 0;"><strong>Due Date:</strong> ${dueDate}</p>
          </div>
          <p>Please log in to your Customer Portal to view the full itemized breakdown, download the PDF, or pay online.</p>
          <p style="margin-top: 24px;">
            <a href="${portalUrl}/customer/invoices/${invoice.id}" style="background: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View & Pay Invoice
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `Invoice ${invoiceNumber} from Brightloop Software`,
      html: htmlContent,
    });
  } catch (error) {
    console.warn(`[EMAIL WARNING] Failed to send invoice email:`, error.message);
  }
}

/**
 * Send Overdue Invoice Reminder
 */
export async function sendInvoiceOverdueEmail({ invoice, customer }) {
  const email = customer?.email;
  const customerName = customer?.contactPerson || 'Valued Customer';
  const invoiceNumber = invoice.invoiceNumber;
  const amountDue = Number(invoice.amountDue).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
    console.log(`[DEV EMAIL] Invoice ${invoiceNumber} OVERDUE notice to ${email}. Amount Due: INR ${amountDue}`);
    return;
  }

  const fromAddress = process.env.SMTP_FROM || 'billing@brightloop.com';
  const portalUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 8px; overflow: hidden;">
        <div style="background: #dc2626; color: white; padding: 20px;">
          <h2 style="margin: 0;">Payment Reminder: Invoice Overdue</h2>
        </div>
        <div style="padding: 24px; background: #ffffff;">
          <p>Dear ${customerName},</p>
          <p>This is a friendly reminder that invoice <strong>${invoiceNumber}</strong> with an outstanding balance of <strong>₹${amountDue}</strong> is now past due.</p>
          <p>To ensure uninterrupted software service, please settle the outstanding balance promptly.</p>
          <p style="margin-top: 24px;">
            <a href="${portalUrl}/customer/invoices/${invoice.id}" style="background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Pay Overdue Invoice
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `URGENT: Invoice ${invoiceNumber} is Overdue`,
      html: htmlContent,
    });
  } catch (error) {
    console.warn(`[EMAIL WARNING] Failed to send overdue invoice email:`, error.message);
  }
}

/**
 * Send Payment Receipt Email
 */
export async function sendPaymentReceiptEmail({ payment, invoice, customer }) {
  const email = customer?.email;
  const customerName = customer?.contactPerson || 'Valued Customer';
  const paymentRef = payment.paymentReference;
  const amountPaid = Number(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const remainingDue = Number(invoice.amountDue).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
    console.log(`[DEV EMAIL] Payment receipt ${paymentRef} of INR ${amountPaid} for invoice ${invoice.invoiceNumber} sent to ${email}. Remaining Due: INR ${remainingDue}`);
    return;
  }

  const fromAddress = process.env.SMTP_FROM || 'billing@brightloop.com';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; border: 1px solid #dcfce7; border-radius: 8px; overflow: hidden;">
        <div style="background: #16a34a; color: white; padding: 20px;">
          <h2 style="margin: 0;">Payment Receipt — Brightloop Software</h2>
        </div>
        <div style="padding: 24px; background: #ffffff;">
          <p>Dear ${customerName},</p>
          <p>Thank you for your payment! We have successfully received your payment of <strong>₹${amountPaid}</strong>.</p>
          <div style="background: #f0fdf4; padding: 16px; border-radius: 6px; margin: 20px 0; border: 1px solid #bbf7d0;">
            <p style="margin: 4px 0;"><strong>Payment Reference:</strong> ${paymentRef}</p>
            <p style="margin: 4px 0;"><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p style="margin: 4px 0;"><strong>Amount Received:</strong> ₹${amountPaid}</p>
            <p style="margin: 4px 0;"><strong>Remaining Balance Due:</strong> ₹${remainingDue}</p>
            <p style="margin: 4px 0;"><strong>Invoice Status:</strong> ${invoice.status}</p>
          </div>
          <p>Your subscription contract and services remain in good standing.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `Payment Receipt: ${paymentRef} (Invoice ${invoice.invoiceNumber})`,
      html: htmlContent,
    });
  } catch (error) {
    console.warn(`[EMAIL WARNING] Failed to send payment receipt email:`, error.message);
  }
}

/**
 * Send Payment Failed Email
 */
export async function sendPaymentFailedEmail({ invoice, customer, reason }) {
  const email = customer?.email;
  const customerName = customer?.contactPerson || 'Valued Customer';

  if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
    console.log(`[DEV EMAIL] Payment failed notification for ${invoice.invoiceNumber} to ${email}. Reason: ${reason}`);
    return;
  }

  const fromAddress = process.env.SMTP_FROM || 'billing@brightloop.com';

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `Payment Failed for Invoice ${invoice.invoiceNumber}`,
      html: `<p>Dear ${customerName},</p><p>We were unable to process your payment for invoice ${invoice.invoiceNumber}. Reason: ${reason || 'Transaction could not be completed'}.</p><p>Please log in and retry or use an alternative payment method.</p>`,
    });
  } catch (error) {
    console.warn(`[EMAIL WARNING] Failed to send payment failed email:`, error.message);
  }
}

