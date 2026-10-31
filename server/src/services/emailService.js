import transporter from '../config/mail.js';

/**
 * Send a password reset email.
 * If SMTP is not configured and we're in development, logs the reset URL to console.
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} resetUrl - Full password reset URL
 */
export async function sendPasswordResetEmail(email, name, resetUrl) {
  // If SMTP is not configured, log in development
  if (!transporter) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Password reset link: ${resetUrl}`);
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
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>You requested a password reset for your account. Click the button below to reset your password:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button" style="color: white;">Reset Password</a>
          </p>
          <p>This link will expire in <strong>15 minutes</strong>.</p>
          <p>If you didn't request this, you can safely ignore this email. Your password will not be changed.</p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} BrightLoop. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: fromAddress,
    to: email,
    subject: 'Password Reset Request',
    html: htmlContent,
  });
}
