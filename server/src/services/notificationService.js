import twilio from 'twilio';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

export async function sendDonorLifecycleEmail(wish, event) {
  if (!wish.donor?.email) return;
  const organization = await getPublicOrganizationSettings();
  const nickname = escapeHtml(wish.nickname);
  const items = 'Any gift you choose from the wishlist. There is no expectation to fulfill everything.';
  const contact = [organization.contactName, organization.contactEmail]
    .filter(Boolean).map(escapeHtml).join(' · ');
  const messenger = organization.messengerUrl ? ` <a href="${escapeHtml(organization.messengerUrl)}">Message us on Messenger</a>.` : '';
  if (event === 'manuallyReleased' || event === 'released') {
    const teamName = escapeHtml(organization.contactName || 'MIDSA Holiday Program Team');
    const email = organization.contactEmail || 'midsapartnerships@gmail.com';
    const wishDescription = escapeHtml(wish.wishItems?.filter(Boolean).join(', ') || 'Your choice of gift from the wishlist image');
    const explanation = event === 'manuallyReleased'
      ? `has been released by the ${teamName}.`
      : 'has been automatically released because the drop-off deadline passed without a confirmed drop-off or recorded extension.';
    return sendEmail({
      to: wish.donor.email,
      subject: 'An Update on Your Holiday Wish Reservation \uD83C\uDF81',
      html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;line-height:1.75;color:#23332b">
        <h1 style="font-size:26px;line-height:1.3;color:#086747">An Update on Your Holiday Wish Reservation &#127873;</h1>
        <p>Hello, Holiday Giver! &#10024;</p>
        <p>We wanted to let you know that your reservation for <strong>${nickname}'s holiday wish</strong> ${explanation}</p>
        <div style="margin:24px 0;padding:20px;background:#edf2e7;border-radius:12px">
          <h2 style="font-size:20px;color:#086747;margin-top:0">&#127873; Reservation Details</h2>
          <p style="margin:0"><strong>Recipient:</strong> ${nickname}<br />
          <strong>Wish:</strong> ${wishDescription}<br />
          <strong>Reservation Status:</strong> Released</p>
        </div>
        <p>The wish is now available for another donor to reserve.</p>
        <p>While this reservation has come to an end, we truly appreciate your willingness to share kindness this holiday season. Your interest in giving means a lot to us, and we hope you'll still be part of making someone's holidays a little brighter. &#10084;&#65039;</p>
        <h2 style="font-size:20px;color:#086747">&#128140; Have Questions?</h2>
        <p>If you believe this was a mistake or would like to know more about your reservation, please don't hesitate to contact the <strong>${teamName}</strong> at <a href="mailto:${escapeHtml(encodeURIComponent(email))}" style="color:#086747">${escapeHtml(email)}</a>.</p>
        ${messenger ? `<p>${messenger}</p>` : ''}
        <p>We're happy to help!</p>
        <p>Thank you for being part of the spirit of giving.</p>
        <p>Warmest holiday wishes!</p>
      </div>`
    });
  }
  const messages = {
    received: {
      subject: 'MIDSA WishLink: Gift drop-off confirmed.',
      body: `<p>An officer has confirmed that we received your gift for <strong>${nickname}</strong>.</p>
        <p><strong>Gift:</strong> ${items}</p>
        <p>Thank you for your generosity and for helping make this wish come true!</p>
        <p>If you have questions or believe this was a mistake, please contact ${contact} so we can help.</p>
        <p> <i> Lagi't lagi para sa bayan! </i> </p>`
    },
    reminder: {
      subject: 'MIDSA WishLink: One day left to drop off your gift',
      body: `<p>You have one day or less left to drop off your gift for <strong>${nickname}</strong>.</p>
        <p><strong>Gift:</strong> ${items}<br /><strong>Deadline:</strong> ${escapeHtml(formatPHDate(wish.reservationExpiresAt))}<br />
        <strong>Drop-off location:</strong> ${escapeHtml(organization.dropOffLocation)}</p>
        <p>If you need more time, please contact ${contact} before the deadline so an officer can record an extension.
        Without a recorded extension or confirmed drop-off, your reservation will be released and the wish made available to other donors.</p>`
    }
  };
  const message = messages[event];
  if (!message) throw new Error('Unknown donor notification event.');
  return sendEmail({
    to: wish.donor.email,
    subject: message.subject,
    html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;line-height:1.6;color:#23332b"><h2>${escapeHtml(message.subject)}</h2>${message.body}${messenger ? `<p>${messenger}</p>` : ''}</div>`
  });
}

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
        signal: AbortSignal.timeout(15000),

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
        Holiday wish.
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

  const items = wish.wishItems?.join(', ') || 'Any gift you choose from the wishlist';
  const nickname = escapeHtml(wish.nickname);
  const deadline = formatPHDate(wish.reservationExpiresAt);
  const seasonYear = new Intl.DateTimeFormat('en-PH', {
    year: 'numeric', timeZone: 'Asia/Manila'
  }).format(new Date(wish.reservationExpiresAt || Date.now()));
  const teamName = escapeHtml(organization.contactName || 'MIDSA Holiday Program Team');
  const teamEmail = organization.contactEmail || 'midsapartnerships@gmail.com';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;line-height:1.75;color:#23332b">
      <h1 style="font-size:26px;line-height:1.3;color:#086747">You've Made Someone's Holiday Brighter! &#10024;&#127873;</h1>
      <p>The season of giving just got a little more special!</p>
      <p>Thank you for choosing to share a little kindness this <strong>Holiday Season ${seasonYear}</strong>. Your generosity brings us one step closer to making ${nickname}'s holiday wish come true.</p>
      <div style="margin:24px 0;padding:20px;background:#edf2e7;border-radius:12px">
        <h2 style="font-size:20px;color:#086747;margin-top:0">&#127873; Your Reserved Holiday Wish</h2>
        <p style="margin:0"><strong>Recipient:</strong> ${nickname}<br />
        <strong>Wish:</strong> ${escapeHtml(items)}<br />
        <strong>Drop-off Deadline:</strong> ${escapeHtml(deadline)}<br />
        <strong>Drop-off Location:</strong> ${escapeHtml(organization.dropOffLocation)}</p>
      </div>
      <h2 style="font-size:20px;color:#086747">&#10024; A Friendly Reminder</h2>
      <p>Please have your gift wrapped and ready before dropping it off. A little effort goes a long way in making someone's holiday feel extra special!</p>
      <p>Need more time or have a change of plans? No worries! Reach out to the <strong>${teamName}</strong> at <a href="mailto:${escapeHtml(encodeURIComponent(teamEmail))}" style="color:#086747">${escapeHtml(teamEmail)}</a>, and we'll be happy to assist you.</p>
      ${organization.messengerUrl ? `<p>You can also <a href="${escapeHtml(organization.messengerUrl)}" style="color:#086747">message us on Messenger</a>.</p>` : ''}
      <p>Thank you for being part of something meaningful. Your thoughtful gesture is a reminder that the best part of the holidays is the joy we share with others. &#10084;&#65039;</p>
      <p>Warmest holiday wishes!</p>
    </div>
  `;

  const contact =
    organization.messengerUrl ||
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
        `You've Made Someone's Holiday Brighter! \u2728\uD83C\uDF81`,

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
            organization.messengerUrl
              ? `<br /><a href="${escapeHtml(organization.messengerUrl)}">Message us on Messenger</a>`
              : ''
          }
        </p>
      </div>
    </div>
  `;

  const contact =
    organization.messengerUrl ||
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
