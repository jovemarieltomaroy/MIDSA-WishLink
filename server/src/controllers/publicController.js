import crypto from 'crypto';

import Wish from '../models/Wish.js';
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

const OTP_EXPIRY_MINUTES = 10;
const MAX_VERIFICATION_ATTEMPTS = 5;

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

function publicWish(
  wish
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
        process.env
          .ORG_CONTACT_NAME,

      contactEmail:
        process.env
          .ORG_CONTACT_EMAIL,

      contactPhone:
        process.env
          .ORG_CONTACT_PHONE,

      dropOffLocation:
        process.env
          .DROP_OFF_LOCATION,

      campaignDeadline:
        campaign?.deadline ||
        null
    }
  };
}

function normalizeEmail(
  value
) {
  return String(
    value || ''
  )
    .trim()
    .toLowerCase();
}

function isValidEmail(
  email
) {
  /*
   * Intentionally accepts any reasonable
   * email domain.
   *
   * We verify actual inbox access using OTP.
   */
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

function generateOtp() {
  return crypto
    .randomInt(
      100000,
      1000000
    )
    .toString();
}

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
    .update(code)
    .digest('hex');
}

function cleanDonorData(
  body
) {
  return {
    fullName:
      String(
        body.fullName || ''
      ).trim(),

    email:
      normalizeEmail(
        body.email
      ),

    phoneNumber:
      String(
        body.phoneNumber || ''
      ).trim(),

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

function validateDonorData(
  donor
) {
  if (
    !donor.fullName ||
    !donor.email ||
    !donor.phoneNumber ||
    !donor.program ||
    !donor.yearLevel
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

  return null;
}

async function findPublicWish(
  code
) {
  return Wish.findOne({
    ornamentCode: code,
    isPublished: true
  }).populate(
    'campaign'
  );
}

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

  res.json({
    wish:
      publicWish(
        wish
      )
  });
}

/*
 * STEP 1:
 *
 * Validate the donor information and send
 * the 6-digit verification code.
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
   * for this same wish/email combination.
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
        hashOtp(code),

      expiresAt,

      attempts: 0,

      verified: false,

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
 * STEP 2:
 *
 * Verify OTP and atomically reserve the wish.
 */
export async function verifyReservation(
  req,
  res
) {
  await releaseExpiredReservations();

  const {
    verificationId,
    code
  } = req.body;

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
      String(code).trim()
    );

  /*
   * timingSafeEqual avoids leaking useful
   * information through timing differences.
   */
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

  if (!correct) {
    verification.attempts += 1;

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

  /*
   * Atomic status condition prevents two people
   * from reserving the same wish.
   */
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

  await EmailVerification.findByIdAndDelete(
    verification._id
  );

  sendReservationConfirmation(
    wish
  ).catch(
    (error) =>
      console.error(
        'Confirmation notification error:',
        error
      )
  );

  return res
    .status(201)
    .json({
      message:
        'Your email has been verified and your wish reservation is confirmed.',

      wish:
        publicWish(
          wish
        )
    });
}