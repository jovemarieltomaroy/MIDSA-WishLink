import twilio from 'twilio';

import {
  formatPHDate
} from '../utils/dates.js';

import {
  getPublicOrganizationSettings
} from './organizationSettingsService.js';


function emailConfigured() {
  return Boolean(
    process.env.BREVO_API_KEY &&
    process.env.BREVO_SENDER_EMAIL
  );
}


function smsConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
}


/*
 * Send email through Brevo's HTTPS API.
 *
 * This does not use SMTP, so it works
 * with Render's free web service.
 */
async function sendEmail({
  to,
  subject,
  html
}) {
  if (
    !emailConfigured()
  ) {
    console.log(
      `[EMAIL MOCK] To: ${to} | ${subject}`
    );

    return {
      mocked: true
    };
  }

  console.log(
    `[EMAIL] Sending through Brevo API to ${to}`
  );

  const response =
    await fetch(
      'https://api.brevo.com/v3/smtp/email',
      {
        method: 'POST',

        headers: {
          accept:
            'application/json',

          'api-key':
            process.env.BREVO_API_KEY,

          'content-type':
            'application/json'
        },

        body:
          JSON.stringify({
            sender: {
              name:
                process.env.BREVO_SENDER_NAME ||
                'MIDSA WishLink',

              email:
                process.env.BREVO_SENDER_EMAIL
            },

            to: [
              {
                email:
                  to
              }
            ],

            subject,

            htmlContent:
              html
          })
      }
    );

  let data = {};

  try {
    data =
      await response.json();
  } catch {
    data = {};
  }

  if (
    !response.ok
  ) {
    console.error(
      '[BREVO EMAIL ERROR]',
      data
    );

    throw new Error(
      data?.message ||
      'Unable to send email through Brevo.'
    );
  }

  console.log(
    `[EMAIL SENT] To: ${to} | Message ID: ${data.messageId || 'unknown'}`
  );

  return data;
}


async function sendSms({
  to,
  body
}) {
  if (
    !smsConfigured()
  ) {
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


/*
 * EMAIL VERIFICATION CODE
 */
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
      <h2
        style="
          color:#7c2639;
          margin-bottom: 16px;
        "
      >
        Verify your email
      </h2>

      <p>
        You are one step away from reserving
        <strong>${nickname}'s</strong>
        Christmas wish.
      </p>

      <p>
        Enter this verification code in
        MIDSA WishLink:
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
          color: #17243a;
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
          margin-top: 24px;
        "
      >
        For your security, do not share this code
        with anyone.
      </p>
    </div>
  `;

  return sendEmail({
    to:
      email,

    subject:
      'MIDSA WishLink: Verify your email',

    html
  });
}


/*
 * RESERVATION CONFIRMATION
 */
export async function sendReservationConfirmation(
  wish
) {
  const organization =
    await getPublicOrganizationSettings();

  const items =
    wish.wishItems.join(
      ', '
    );

  const campaignName =
    wish.campaign?.name ||
    'MIDSA WishLink campaign';

  const deadline =
    formatPHDate(
      wish.reservationExpiresAt
    );

  const publicBaseUrl =
    process.env.PUBLIC_APP_URL ||
    process.env.CLIENT_URL ||
    '';

  const publicUrl =
    `${publicBaseUrl}/wish/${wish.ornamentCode}`;

  const html = `
    <div
      style="
        font-family: Arial, sans-serif;
        max-width: 620px;
        margin: auto;
        line-height: 1.6;
        color: #23332b;
      "
    >
      <h2
        style="
          color:#7c2639;
          margin-bottom: 16px;
        "
      >
        You reserved ${wish.nickname}'s wish 🎁
      </h2>

      <p>
        Thank you for choosing to make this
        giving period a little warmer through
        <strong>${campaignName}</strong>.
      </p>

      <div
        style="
          margin: 24px 0;
          padding: 18px;
          background: #f7f9fc;
          border-radius: 10px;
        "
      >
        <p
          style="
            margin: 0 0 8px;
          "
        >
          <strong>Wish:</strong>
          ${items}
        </p>

        <p
          style="
            margin: 0 0 8px;
          "
        >
          <strong>Latest drop-off:</strong>
          ${deadline}
        </p>

        <p
          style="
            margin: 0;
          "
        >
          <strong>Drop-off location:</strong>
          ${organization.dropOffLocation}
        </p>
      </div>

      <p>
        If plans change or you need an extension,
        please contact
        <strong>
          ${organization.contactName}
        </strong>.

        ${
          organization.contactEmail
            ? `<br />Email: ${organization.contactEmail}`
            : ''
        }

        ${
          organization.contactPhone
            ? `<br />Contact number: ${organization.contactPhone}`
            : ''
        }
      </p>

      ${
        publicBaseUrl
          ? `
            <p
              style="
                margin-top: 24px;
              "
            >
              <a
                href="${publicUrl}"
                style="
                  color: #2f62dc;
                  font-weight: 600;
                "
              >
                View the wish page
              </a>
            </p>
          `
          : ''
      }

      <p
        style="
          font-size: 13px;
          color: #68766f;
          margin-top: 26px;
        "
      >
        Please do not forward donor details.
        The child's identity is intentionally
        kept anonymous in WishLink.
      </p>
    </div>
  `;

  const contact =
    organization.contactPhone ||
    organization.contactEmail ||
    'MIDSA';

  const sms =
    `MIDSA WishLink: You reserved ` +
    `${wish.nickname}'s wish (${items}). ` +
    `Please drop off by ${deadline} at ` +
    `${organization.dropOffLocation}. ` +
    `Contact: ${contact}. Thank you!`;

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

      body:
        sms
    })
  ]);
}


/*
 * DEADLINE UPDATE
 */
export async function sendDeadlineUpdate(
  wish
) {
  const organization =
    await getPublicOrganizationSettings();

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
        line-height: 1.6;
        color: #23332b;
      "
    >
      <h2
        style="
          color: #7c2639;
        "
      >
        Your MIDSA WishLink drop-off date was updated
      </h2>

      <p>
        The latest drop-off for
        <strong>${wish.nickname}</strong>'s wish
        is now
        <strong>${deadline}</strong>.
      </p>

      <div
        style="
          margin-top: 22px;
          padding: 18px;
          background: #f7f9fc;
          border-radius: 10px;
        "
      >
        <p>
          <strong>Drop-off:</strong>
          ${organization.dropOffLocation}
        </p>

        <p>
          <strong>Contact:</strong>
          ${organization.contactName}

          ${
            organization.contactEmail
              ? `<br />${organization.contactEmail}`
              : ''
          }

          ${
            organization.contactPhone
              ? `<br />${organization.contactPhone}`
              : ''
          }
        </p>
      </div>
    </div>
  `;

  const contact =
    organization.contactPhone ||
    organization.contactEmail ||
    'MIDSA';

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
        `${contact} if needed.`
    })
  ]);
}