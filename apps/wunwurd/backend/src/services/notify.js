const { Resend } = require('resend');

async function notify(subject, text) {
  if (!process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: 'Wunwurd <notifications@wunwurd.com>',
      to: process.env.NOTIFY_EMAIL,
      subject,
      text,
    });
  } catch (e) {
    console.error('Notify email failed:', e.message);
  }
}

module.exports = { notify };
