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
