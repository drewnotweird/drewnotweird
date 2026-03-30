const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NOTIFY_EMAIL,
    pass: process.env.NOTIFY_APP_PASSWORD,
  },
});

async function notify(subject, text) {
  if (!process.env.NOTIFY_EMAIL || !process.env.NOTIFY_APP_PASSWORD) return;
  try {
    await transporter.sendMail({
      from: process.env.NOTIFY_EMAIL,
      to: process.env.NOTIFY_EMAIL,
      subject,
      text,
    });
  } catch (e) {
    console.error('Notify email failed:', e.message);
  }
}

module.exports = { notify };
