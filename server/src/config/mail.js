import nodemailer from 'nodemailer';

let transporter = null;

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (smtpHost && smtpPort && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort, 10),
    secure: parseInt(smtpPort, 10) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  // Verify connection
  transporter.verify()
    .then(() => {
      console.log('SMTP server connection verified');
    })
    .catch((error) => {
      console.warn('SMTP connection verification failed:', error.message);
    });
} else {
  console.warn('SMTP is not configured. Email sending is disabled. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in .env to enable.');
}

export default transporter;
