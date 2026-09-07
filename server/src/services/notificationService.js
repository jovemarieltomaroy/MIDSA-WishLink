import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { formatPHDate } from '../utils/dates.js';

function contactBlock() {
  return {
    name: process.env.ORG_CONTACT_NAME || 'MIDSA Christmas Program Team',
    email: process.env.ORG_CONTACT_EMAIL || '',
    phone: process.env.ORG_CONTACT_PHONE || '',
    dropOff: process.env.DROP_OFF_LOCATION || 'MIDSA designated drop-off point'
  };
}

async function sendEmail({ to, subject, html }) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[EMAIL MOCK] To: ${to} | ${subject}`);
    return { mocked: true };
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  return transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
}

async function sendSms({ to, body }) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.log(`[SMS MOCK] To: ${to} | ${body}`);
    return { mocked: true };
  }
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  return client.messages.create({ from: process.env.TWILIO_PHONE_NUMBER, to, body });
}

export async function sendReservationConfirmation(wish) {
  const c = contactBlock();
  const items = wish.wishItems.join(', ');
  const campaignName = wish.campaign?.name || 'MIDSA WishLink campaign';
  const deadline = formatPHDate(wish.reservationExpiresAt);
  const publicUrl = `${process.env.PUBLIC_APP_URL || process.env.CLIENT_URL}/wish/${wish.ornamentCode}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;line-height:1.55;color:#23332b">
      <h2 style="color:#7c2639">You reserved ${wish.nickname}'s wish 🎁</h2>
      <p>Thank you for choosing to make this giving period a little warmer through <strong>${campaignName}</strong>.</p>
      <p><strong>Wish:</strong> ${items}<br/>
      <strong>Latest drop-off:</strong> ${deadline}<br/>
      <strong>Drop-off location:</strong> ${c.dropOff}</p>
      <p>If plans change or you need an extension, please contact ${c.name} at ${c.email}${c.phone ? ` / ${c.phone}` : ''}.</p>
      <p><a href="${publicUrl}">View the wish page</a></p>
      <p style="font-size:13px;color:#68766f">Please do not forward donor details. The child's identity is intentionally kept anonymous in WishLink.</p>
    </div>`;

  const sms = `MIDSA WishLink: You reserved ${wish.nickname}'s wish (${items}). Please drop off by ${deadline} at ${c.dropOff}. Contact: ${c.phone || c.email}. Thank you!`;

  const results = await Promise.allSettled([
    sendEmail({ to: wish.donor.universityEmail, subject: `MIDSA WishLink: ${wish.nickname}'s wish is reserved for you`, html }),
    sendSms({ to: wish.donor.phoneNumber, body: sms })
  ]);
  return results;
}

export async function sendDeadlineUpdate(wish) {
  const c = contactBlock();
  const deadline = formatPHDate(wish.reservationExpiresAt);
  const html = `<div style="font-family:Arial,sans-serif"><h2>Your MIDSA WishLink drop-off date was updated</h2><p>The latest drop-off for <strong>${wish.nickname}</strong>'s wish is now <strong>${deadline}</strong>.</p><p>Drop-off: ${c.dropOff}<br/>Contact: ${c.email} ${c.phone}</p></div>`;
  return Promise.allSettled([
    sendEmail({ to: wish.donor.universityEmail, subject: 'MIDSA WishLink: updated drop-off date', html }),
    sendSms({ to: wish.donor.phoneNumber, body: `MIDSA WishLink update: ${wish.nickname}'s gift drop-off deadline is now ${deadline}. Contact ${c.phone || c.email} if needed.` })
  ]);
}
