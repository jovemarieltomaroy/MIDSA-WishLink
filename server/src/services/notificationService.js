import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { formatPHDate } from '../utils/dates.js';

function contactBlock() {
  return {
    name:
      process.env.ORG_CONTACT_NAME ||
      'MIDSA Christmas Program Team',

    email:
      process.env.ORG_CONTACT_EMAIL ||
      '',

    phone:
      process.env.ORG_CONTACT_PHONE ||
      '',

    dropOff:
      process.env.DROP_OFF_LOCATION ||
      'MIDSA designated drop-off point'
  };
}

function emailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

function smsConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,

    port: Number(
      process.env.SMTP_PORT || 587
    ),

    secure:
      String(
        process.env.SMTP_SECURE
      ).toLowerCase() === 'true',

    auth: {
      user:
        process.env.SMTP_USER,

      pass:
        process.env.SMTP_PASS
    }
  });
}

async function sendEmail({
  to,
  subject,
  html
}) {
  if (!emailConfigured()) {
    console.log(
      `[EMAIL MOCK] To: ${to} | ${subject}`
    );

    return {
      mocked: true
    };
  }

  try {
    const transporter =
      createTransporter();

    console.log(
      `[EMAIL] Attempting to send to ${to}`
    );

    const info =
      await transporter.sendMail({
        from:
          process.env.EMAIL_FROM ||
          `"MIDSA WishLink" <${process.env.SMTP_USER}>`,

        to,
        subject,
        html
      });

    console.log(
      `[EMAIL SENT] To: ${to} | Message ID: ${info.messageId}`
    );

    return info;
  } catch (error) {
    console.error(
      `[EMAIL ERROR] To: ${to}`
    );

    console.error(
      'Message:',
      error.message
    );

    if (error.code) {
      console.error(
        'Code:',
        error.code
      );
    }

    if (error.response) {
      console.error(
        'SMTP Response:',
        error.response
      );
    }

    throw error;
  }
}

async function sendSms({
  to,
  body
}) {
  if (!smsConfigured()) {
    console.log(
      `[SMS MOCK] To: ${to} | ${body}`
    );

    return {
      mocked: true
    };
  }

  try {
    const client =
      twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

    const result =
      await client.messages.create({
        from:
          process.env.TWILIO_PHONE_NUMBER,

        to,
        body
      });

    console.log(
      `[SMS SENT] To: ${to} | SID: ${result.sid}`
    );

    return result;
  } catch (error) {
    console.error(
      `[SMS ERROR] To: ${to}`
    );

    console.error(
      error.message
    );

    throw error;
  }
}

function logNotificationResults(
  results
) {
  const [
    emailResult,
    smsResult
  ] = results;

  if (
    emailResult.status ===
    'rejected'
  ) {
    console.error(
      '[NOTIFICATION] Email failed:',
      emailResult.reason?.message ||
        emailResult.reason
    );
  }

  if (
    smsResult.status ===
    'rejected'
  ) {
    console.error(
      '[NOTIFICATION] SMS failed:',
      smsResult.reason?.message ||
        smsResult.reason
    );
  }
}

export async function sendReservationConfirmation(
  wish
) {
  const c =
    contactBlock();

  const items =
    wish.wishItems.join(', ');

  const campaignName =
    wish.campaign?.name ||
    'MIDSA WishLink campaign';

  const deadline =
    formatPHDate(
      wish.reservationExpiresAt
    );

  const publicUrl =
    `${
      process.env.PUBLIC_APP_URL ||
      process.env.CLIENT_URL
    }/wish/${wish.ornamentCode}`;

  const html = `
    <div
      style="
        font-family: Arial, sans-serif;
        max-width: 620px;
        margin: auto;
        line-height: 1.55;
        color: #23332b;
      "
    >
      <h2 style="color:#7c2639;">
        You reserved ${wish.nickname}'s wish 🎁
      </h2>

      <p>
        Thank you for choosing to make this
        giving period a little warmer through
        <strong>${campaignName}</strong>.
      </p>

      <p>
        <strong>Wish:</strong>
        ${items}
        <br />

        <strong>Latest drop-off:</strong>
        ${deadline}
        <br />

        <strong>Drop-off location:</strong>
        ${c.dropOff}
      </p>

      <p>
        If plans change or you need an extension,
        please contact ${c.name}

        ${
          c.email
            ? ` at ${c.email}`
            : ''
        }

        ${
          c.phone
            ? ` / ${c.phone}`
            : ''
        }.
      </p>

      <p>
        <a href="${publicUrl}">
          View the wish page
        </a>
      </p>

      <p
        style="
          font-size: 13px;
          color: #68766f;
        "
      >
        Please do not forward donor details.
        The child's identity is intentionally
        kept anonymous in WishLink.
      </p>
    </div>
  `;

  const sms =
    `MIDSA WishLink: You reserved ` +
    `${wish.nickname}'s wish (${items}). ` +
    `Please drop off by ${deadline} at ` +
    `${c.dropOff}. Contact: ` +
    `${c.phone || c.email}. Thank you!`;

  const results =
    await Promise.allSettled([
      sendEmail({
        to:
          wish.donor.universityEmail,

        subject:
          `MIDSA WishLink: ${wish.nickname}'s wish is reserved for you`,

        html
      }),

      sendSms({
        to:
          wish.donor.phoneNumber,

        body: sms
      })
    ]);

  logNotificationResults(
    results
  );

  return results;
}

export async function sendDeadlineUpdate(
  wish
) {
  const c =
    contactBlock();

  const deadline =
    formatPHDate(
      wish.reservationExpiresAt
    );

  const html = `
    <div
      style="
        font-family: Arial, sans-serif;
        line-height: 1.55;
      "
    >
      <h2>
        Your MIDSA WishLink drop-off date was updated
      </h2>

      <p>
        The latest drop-off for
        <strong>${wish.nickname}</strong>'s wish
        is now
        <strong>${deadline}</strong>.
      </p>

      <p>
        Drop-off:
        ${c.dropOff}
        <br />

        Contact:
        ${c.email}
        ${c.phone}
      </p>
    </div>
  `;

  const results =
    await Promise.allSettled([
      sendEmail({
        to:
          wish.donor.universityEmail,

        subject:
          'MIDSA WishLink: updated drop-off date',

        html
      }),

      sendSms({
        to:
          wish.donor.phoneNumber,

        body:
          `MIDSA WishLink update: ` +
          `${wish.nickname}'s gift drop-off deadline ` +
          `is now ${deadline}. Contact ` +
          `${c.phone || c.email} if needed.`
      })
    ]);

  logNotificationResults(
    results
  );

  return results;
}