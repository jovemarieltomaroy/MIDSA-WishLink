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
    process.env.RESEND_API_KEY &&
    process.env.RESEND_FROM
  );
}

function smsConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
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

  console.log(
    `[EMAIL] Sending through Resend HTTP API to ${to}`
  );

  const response =
    await fetch(
      'https://api.resend.com/emails',
      {
        method: 'POST',

        headers: {
          Authorization:
            `Bearer ${process.env.RESEND_API_KEY}`,

          'Content-Type':
            'application/json'
        },

        body: JSON.stringify({
          from:
            process.env.RESEND_FROM,

          to: [to],

          subject,

          html
        })
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    console.error(
      '[EMAIL ERROR]',
      data
    );

    throw new Error(
      data?.message ||
      'Unable to send email.'
    );
  }

  console.log(
    `[EMAIL SENT] To: ${to} | ID: ${data.id}`
  );

  return data;
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

  const client =
    twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

  return client.messages.create({
    from:
      process.env.TWILIO_PHONE_NUMBER,

    to,

    body
  });
}

export async function sendEmailVerificationCode({
  email,
  code,
  nickname
}) {
  const html = `
    <div
      style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        line-height: 1.6;
        color: #23332b;
      "
    >
      <h2 style="color:#7c2639;">
        Verify your email
      </h2>

      <p>
        You are one step away from reserving
        <strong>${nickname}'s</strong> Christmas wish.
      </p>

      <p>
        Enter this verification code in MIDSA WishLink:
      </p>

      <div
        style="
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 8px;
          background: #f5f2ed;
          border-radius: 10px;
          padding: 18px;
          text-align: center;
          margin: 24px 0;
        "
      >
        ${code}
      </div>

      <p>
        This code expires in
        <strong>10 minutes</strong>.
      </p>

      <p>
        If you did not request this verification,
        you may ignore this email.
      </p>

      <p
        style="
          color: #68766f;
          font-size: 13px;
        "
      >
        For your security, do not share this code
        with anyone.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,

    subject:
      'MIDSA WishLink: Verify your email',

    html
  });
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
        ${c.email ? ` at ${c.email}` : ''}
        ${c.phone ? ` / ${c.phone}` : ''}.
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

  return Promise.allSettled([
    sendEmail({
      to:
        wish.donor.email,

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
        max-width: 620px;
        margin: auto;
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

  return Promise.allSettled([
    sendEmail({
      to:
        wish.donor.email,

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
}