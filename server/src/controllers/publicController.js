import crypto from 'crypto';

import Wish from '../models/Wish.js';
import Campaign from '../models/Campaign.js';
import EmailVerification from '../models/EmailVerification.js';

import {
  getDefaultExpiry
} from '../utils/dates.js';

import {
  releaseExpiredReservations
} from '../services/wishService.js';

import {
  sendEmailVerificationCode,
  sendReservationConfirmation
} from '../services/notificationService.js';

import {
  getPublicOrganizationSettings
} from '../services/organizationSettingsService.js';


const OTP_EXPIRY_MINUTES = 10;
const MAX_VERIFICATION_ATTEMPTS = 5;

export async function getPrivateReservation(req, res) {
  res.set('Cache-Control', 'no-store');
  const token = req.body?.token;
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
    return res.status(404).json({ message: 'This reservation link is invalid or no longer available.' });
  }
  await releaseExpiredReservations();
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const wish = await Wish.findOne({ 'donor.reservationAccessHash': hash, status: { $in: ['reserved', 'granted'] } });
  if (!wish) return res.status(404).json({ message: 'This reservation link is invalid or no longer available.' });
  const organization = await getPublicOrganizationSettings();
  return res.json({ reservation: {
    nickname: wish.nickname,
    wishItems: wish.wishItems,
    worksheetImage: wish.childProfile?.worksheetImage || '',
    scheduledDropOffAt: wish.donor.scheduledDropOffAt,
    reservationExpiresAt: wish.reservationExpiresAt,
    status: wish.status,
    organization
  } });
}

export async function getPublicWishes(req, res) {
  await releaseExpiredReservations();
  const page = Math.max(1, Math.min(10000, Number.parseInt(req.query.page, 10) || 1));
  const campaigns = await Campaign.find({ status: 'active', deadline: { $gte: new Date() } }).select('_id');
  const filter = { isPublished: true, campaign: { $in: campaigns.map(campaign => campaign._id) }, status: { $in: ['available', 'reserved', 'granted'] } };
  if (['available', 'reserved', 'granted'].includes(req.query.status)) filter.status = req.query.status;
  const [wishes, total] = await Promise.all([
    Wish.find(filter).select('ornamentCode nickname wishItems ageGroup status campaign reservationExpiresAt').populate('campaign').sort({ createdAt: -1, _id: -1 }).skip((page - 1) * 24).limit(24),
    Wish.countDocuments(filter),
  ]);
  return res.json({ wishes: wishes.map(wish => {
    const safe = publicWish(wish);
    return { ornamentCode: safe.ornamentCode, nickname: safe.nickname, wishItems: safe.wishItems, status: safe.status, campaign: safe.campaign, campaignState: safe.campaignState };
  }), page, total, pages: Math.ceil(total / 24) });
}


/*
 * Check whether the campaign is
 * currently accepting reservations.
 */
function reservationsAllowed(
  campaign
) {
  if (
    !campaign ||
    campaign.status !== 'active'
  ) {
    return false;
  }

  const now =
    new Date();

  return (
    now >=
      new Date(
        campaign.startDate
      ) &&
    now <=
      new Date(
        campaign.deadline
      )
  );
}


/*
 * Determine what state the campaign
 * should appear as on public pages.
 */
function campaignPublicState(
  campaign
) {
  if (!campaign) {
    return 'unassigned';
  }

  const now =
    new Date();

  if (
    campaign.status ===
      'archived' ||
    campaign.status ===
      'completed' ||
    now >
      new Date(
        campaign.deadline
      )
  ) {
    return 'concluded';
  }

  if (
    campaign.status ===
      'draft' ||
    now <
      new Date(
        campaign.startDate
      )
  ) {
    return 'upcoming';
  }

  return 'active';
}


/*
 * Prepare a safe public version of
 * the wish.
 *
 * Donor-sensitive information is not
 * exposed here.
 */
function publicWish(
  wish,
  organization = {}
) {
  const campaign =
    wish.campaign || null;

  const canReserve =
    reservationsAllowed(
      campaign
    );

  const remainingMs =
    wish.reservationExpiresAt
      ? new Date(
          wish.reservationExpiresAt
        ) - new Date()
      : 0;

  return {
    ornamentCode:
      wish.ornamentCode,

    nickname:
      wish.nickname,

    wishItems:
      wish.wishItems,

    childProfile: wish.childProfile ? {
      worksheetImage: wish.childProfile.worksheetImage || ''
    } : null,

    ageGroup:
      wish.ageGroup,

    status:
      wish.status,

    reservationExpiresAt:
      wish.status ===
      'reserved'
        ? wish.reservationExpiresAt
        : null,

    proposedReservationExpiresAt:
      wish.status ===
        'available' &&
      canReserve
        ? getDefaultExpiry(
            campaign?.deadline
          )
        : null,

    daysRemaining:
      wish.status ===
      'reserved'
        ? Math.max(
            0,
            Math.ceil(
              remainingMs /
                86400000
            )
          )
        : null,

    reservationsAllowed:
      canReserve,

    campaignState:
      campaignPublicState(
        campaign
      ),

    campaign:
      campaign
        ? {
            name:
              campaign.name,

            academicPeriod:
              campaign.academicPeriod,

            startDate:
              campaign.startDate,

            deadline:
              campaign.deadline,

            status:
              campaign.status
          }
        : null,

    organization: {
      contactName:
        organization.contactName ||
        process.env.ORG_CONTACT_NAME ||
        'MIDSA Holiday Program Team',

      contactEmail:
        organization.contactEmail ||
        process.env.ORG_CONTACT_EMAIL ||
        '',

      messengerUrl:
        organization.messengerUrl ||
        process.env.ORG_MESSENGER_URL ||
        '',

      dropOffLocation:
        organization.dropOffLocation ||
        process.env.DROP_OFF_LOCATION ||
        'MIDSA designated drop-off point',

      campaignDeadline:
        campaign?.deadline ||
        null
    }
  };
}


/*
 * Normalize email addresses before
 * validating or storing them.
 */
function normalizeEmail(
  value
) {
  return String(
    value || ''
  )
    .trim()
    .toLowerCase();
}


/*
 * Accept a reasonably formatted
 * email address.
 *
 * Actual ownership is confirmed
 * through the verification code.
 */
function isValidEmail(
  email
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}


/*
 * Donor mobile-number validation.
 *
 * Accepted:
 *
 * 09XXXXXXXXX
 * 639XXXXXXXXX
 */
function isValidPhoneNumber(
  phoneNumber
) {
  return /^(09\d{9}|639\d{9})$/.test(
    phoneNumber
  );
}


/*
 * Generate a six-digit OTP.
 */
function generateOtp() {
  return crypto
    .randomInt(
      100000,
      1000000
    )
    .toString();
}


/*
 * Hash OTP before storing it.
 */
function hashOtp(
  code
) {
  const secret =
    process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      'JWT_SECRET is required for OTP hashing.'
    );
  }

  return crypto
    .createHmac(
      'sha256',
      secret
    )
    .update(
      code
    )
    .digest(
      'hex'
    );
}


/*
 * Prepare donor input before it is
 * validated or saved.
 */
function cleanDonorData(
  body
) {
  return {
    scheduledDropOffAt: body.scheduledDropOffAt,
    fullName:
      String(
        body.fullName || ''
      ).trim(),

    email:
      normalizeEmail(
        body.email
      ),

    /*
     * Strip spaces, + signs, dashes,
     * parentheses, letters, etc.
     */
    phoneNumber:
      String(
        body.phoneNumber || ''
      )
        .replace(
          /\D/g,
          ''
        )
        .slice(
          0,
          12
        ),

    program:
      String(
        body.program || ''
      ).trim(),

    yearLevel:
      String(
        body.yearLevel || ''
      ).trim(),

    giftNamePreference:
      body.giftNamePreference ===
      'name'
        ? 'name'
        : 'anonymous'
  };
}


/*
 * Validate donor information.
 */
function validateDonorData(
  donor
) {
  if (
    !donor.fullName ||
    !donor.email ||
    !donor.phoneNumber ||
    !donor.program ||
    !donor.yearLevel ||
    !donor.scheduledDropOffAt
  ) {
    return (
      'Please complete all required donor fields.'
    );
  }

  if (
    !isValidEmail(
      donor.email
    )
  ) {
    return (
      'Please enter a valid email address.'
    );
  }

  if (
    !isValidPhoneNumber(
      donor.phoneNumber
    )
  ) {
    return (
      'Please enter a valid Philippine mobile number using 09XXXXXXXXX or 639XXXXXXXXX.'
    );
  }

  return null;
}


/*
 * Find a published wish using the QR /
 * ornament code and populate its campaign.
 *
 * IMPORTANT:
 * This helper was missing previously,
 * causing "findPublicWish is not defined".
 */
async function findPublicWish(
  code
) {
  return Wish.findOne({
    ornamentCode:
      code,

    isPublished:
      true
  }).populate(
    'campaign'
  );
}


/*
 * PUBLIC:
 * Return one wish for the QR/public page.
 */
export async function getPublicWish(
  req,
  res
) {
  await releaseExpiredReservations();

  const wish =
    await findPublicWish(
      req.params.code
    );

  if (!wish) {
    return res
      .status(404)
      .json({
        message:
          'This wish could not be found.'
      });
  }

  const organization =
    await getPublicOrganizationSettings();

  return res.json({
    wish:
      publicWish(
        wish,
        organization
      )
  });
}


/*
 * STEP 1
 *
 * Validate donor information and send
 * a six-digit email verification code.
 */
export async function requestEmailVerification(
  req,
  res
) {
  await releaseExpiredReservations();

  const donor =
    cleanDonorData(
      req.body
    );

  const validationError =
    validateDonorData(
      donor
    );

  if (
    validationError
  ) {
    return res
      .status(400)
      .json({
        message:
          validationError
      });
  }

  const wish =
    await findPublicWish(
      req.params.code
    );

  if (!wish) {
    return res
      .status(404)
      .json({
        message:
          'This wish could not be found.'
      });
  }

  if (
    wish.status !==
    'available'
  ) {
    return res
      .status(409)
      .json({
        message:
          'This wish is no longer available for reservation.'
      });
  }

  if (
    !reservationsAllowed(
      wish.campaign
    )
  ) {
    return res
      .status(409)
      .json({
        message:
          'This campaign is not currently accepting wish reservations.'
      });
  }

  const appointment = new Date(donor.scheduledDropOffAt);
  const reservationDeadline = getDefaultExpiry(wish.campaign.deadline);
  const phAppointment = new Date(appointment.getTime() + 8 * 60 * 60 * 1000);
  const phMinutes = phAppointment.getUTCHours() * 60 + phAppointment.getUTCMinutes();
  if (Number.isNaN(appointment.getTime()) || appointment <= new Date() || appointment > reservationDeadline || appointment.getTime() % (30 * 60 * 1000) !== 0 || phMinutes < 8 * 60 || phMinutes > 17 * 60 || phAppointment.getUTCDay() === 0 || phAppointment.getUTCDay() === 6) {
    return res.status(400).json({ message: 'Please choose a future drop-off time on a weekday between 8:00 AM and 5:00 PM Philippine time, in 30-minute intervals before the reservation deadline.' });
  }

  const code =
    generateOtp();

  const expiresAt =
    new Date(
      Date.now() +
        OTP_EXPIRY_MINUTES *
          60 *
          1000
    );

  /*
   * Remove an older verification request
   * for the same wish/email combination.
   */
  await EmailVerification.deleteMany({
    ornamentCode:
      wish.ornamentCode,

    email:
      donor.email
  });

  const verification =
    await EmailVerification.create({
      ornamentCode:
        wish.ornamentCode,

      email:
        donor.email,

      codeHash:
        hashOtp(
          code
        ),

      expiresAt,

      attempts:
        0,

      verified:
        false,

      donorData:
        donor
    });

  try {
    await sendEmailVerificationCode({
      email:
        donor.email,

      code,

      nickname:
        wish.nickname
    });
  } catch (error) {
    await EmailVerification.findByIdAndDelete(
      verification._id
    );

    console.error(
      'Verification email error:',
      error
    );

    return res
      .status(502)
      .json({
        message:
          'We could not send the verification email. Please check the email address and try again.'
      });
  }

  return res.json({
    message:
      'We sent a 6-digit verification code to your email.',

    verificationId:
      verification._id,

    email:
      donor.email,

    expiresInMinutes:
      OTP_EXPIRY_MINUTES
  });
}


/*
 * STEP 2
 *
 * Verify the OTP and atomically reserve
 * the wish for the donor.
 */
export async function verifyReservation(
  req,
  res
) {
  await releaseExpiredReservations();

  const {
    verificationId,
    code
  } =
    req.body;

  if (
    !verificationId ||
    !String(
      code || ''
    ).trim()
  ) {
    return res
      .status(400)
      .json({
        message:
          'Please enter the verification code.'
      });
  }

  const verification =
    await EmailVerification.findById(
      verificationId
    );

  if (!verification) {
    return res
      .status(400)
      .json({
        message:
          'This verification request is no longer valid. Please request a new code.'
      });
  }

  if (
    verification.ornamentCode !==
    req.params.code
  ) {
    return res
      .status(400)
      .json({
        message:
          'Invalid verification request.'
      });
  }

  /*
   * Expired OTP.
   */
  if (
    new Date() >
    verification.expiresAt
  ) {
    await EmailVerification.findByIdAndDelete(
      verification._id
    );

    return res
      .status(410)
      .json({
        message:
          'Your verification code has expired. Please request a new code.'
      });
  }

  /*
   * Too many incorrect attempts.
   */
  if (
    verification.attempts >=
    MAX_VERIFICATION_ATTEMPTS
  ) {
    await EmailVerification.findByIdAndDelete(
      verification._id
    );

    return res
      .status(429)
      .json({
        message:
          'Too many incorrect attempts. Please request a new verification code.'
      });
  }

  const suppliedHash =
    hashOtp(
      String(
        code
      ).trim()
    );

  const storedBuffer =
    Buffer.from(
      verification.codeHash,
      'hex'
    );

  const suppliedBuffer =
    Buffer.from(
      suppliedHash,
      'hex'
    );

  const correct =
    storedBuffer.length ===
      suppliedBuffer.length &&
    crypto.timingSafeEqual(
      storedBuffer,
      suppliedBuffer
    );

  /*
   * Incorrect OTP.
   */
  if (!correct) {
    verification.attempts +=
      1;

    await verification.save();

    const attemptsLeft =
      MAX_VERIFICATION_ATTEMPTS -
      verification.attempts;

    return res
      .status(400)
      .json({
        message:
          attemptsLeft > 0
            ? `Incorrect verification code. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.`
            : 'Incorrect verification code. Please request a new code.'
      });
  }

  /*
   * Re-read the wish immediately before
   * reservation so its availability and
   * campaign state are current.
   */
  const current =
    await findPublicWish(
      req.params.code
    );

  if (!current) {
    return res
      .status(404)
      .json({
        message:
          'This wish could not be found.'
      });
  }

  if (
    !reservationsAllowed(
      current.campaign
    )
  ) {
    return res
      .status(409)
      .json({
        message:
          'This campaign is no longer accepting wish reservations.'
      });
  }

  const expiry =
    getDefaultExpiry(
      current.campaign.deadline
    );

  const donor =
    verification.donorData;

  const phScheduled = new Date(new Date(donor.scheduledDropOffAt).getTime() + 8 * 60 * 60 * 1000);
  if (!donor.scheduledDropOffAt || donor.scheduledDropOffAt <= new Date() || donor.scheduledDropOffAt > expiry || phScheduled.getUTCDay() === 0 || phScheduled.getUTCDay() === 6) {
    return res.status(400).json({ message: 'Your selected drop-off time is no longer available. Please request a new verification code and choose another time.' });
  }

  /*
   * Atomic status check prevents two
   * donors from reserving the same wish.
   */
  const reservationToken = crypto.randomBytes(32).toString('hex');
  const reservationAccessHash = crypto.createHash('sha256').update(reservationToken).digest('hex');
  const wish =
    await Wish.findOneAndUpdate(
      {
        ornamentCode:
          req.params.code,

        status:
          'available',

        isPublished:
          true,

        campaign:
          current.campaign._id
      },

      {
        $set: {
          status:
            'reserved',

          donor: {
            fullName:
              donor.fullName,

            email:
              donor.email,

            phoneNumber:
              donor.phoneNumber,

            program:
              donor.program,

            yearLevel:
              donor.yearLevel,

            giftNamePreference:
              donor.giftNamePreference,

            reservedAt:
              new Date(),

            promisedDropOffAt:
              expiry,

            scheduledDropOffAt: donor.scheduledDropOffAt,

            reservationAccessHash,

            lastConfirmationSentAt:
              new Date()
          },

          reservationExpiresAt:
            expiry
        },

        $push: {
          history: {
            action:
              'wish_reserved',

            fromStatus:
              'available',

            toStatus:
              'reserved',

            note:
              'A verified donor committed to grant this wish.',

            actorName:
              donor.fullName,

            actorType:
              'donor',

            at:
              new Date()
          }
        }
      },

      {
        returnDocument:
          'after'
      }
    ).populate(
      'campaign'
    );

  /*
   * If atomic reservation failed,
   * someone else changed the wish first.
   */
  if (!wish) {
    await EmailVerification.findByIdAndDelete(
      verification._id
    );

    const latest =
      await Wish.findOne({
        ornamentCode:
          req.params.code
      });

    return res
      .status(409)
      .json({
        message:
          latest?.status ===
          'granted'
            ? 'This wish has already been granted.'
            : 'Someone else reserved this wish while you were verifying your email. Please choose another wish.'
      });
  }

  /*
   * OTP is no longer needed after a
   * successful reservation.
   */
  await EmailVerification.findByIdAndDelete(
    verification._id
  );

  /*
   * Do not delay the reservation response
   * while waiting for notification delivery.
   */
  sendReservationConfirmation(
    wish, reservationToken
  ).catch(
    (error) =>
      console.error(
        'Confirmation notification error:',
        error
      )
  );

  const organization =
    await getPublicOrganizationSettings();

  return res
    .status(201)
    .json({
      message:
        'Your email has been verified and your wish reservation is confirmed.',

      wish:
        publicWish(
          wish,
          organization
        )
    });
}
