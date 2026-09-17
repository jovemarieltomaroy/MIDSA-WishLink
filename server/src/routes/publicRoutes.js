import {
  Router
} from 'express';

import rateLimit from 'express-rate-limit';

import {
  getPublicWish,
  requestEmailVerification,
  verifyReservation
} from '../controllers/publicController.js';

const router =
  Router();

/*
 * Normal public GET requests.
 */
router.get(
  '/wishes/:code',
  getPublicWish
);

/*
 * Restrict how frequently a person can request
 * verification emails from one IP address.
 */
const verificationRequestLimiter =
  rateLimit({
    windowMs:
      15 *
      60 *
      1000,

    limit: 5,

    standardHeaders:
      true,

    legacyHeaders:
      false,

    message: {
      message:
        'Too many verification requests. Please wait a few minutes and try again.'
    }
  });

/*
 * Allow several OTP attempts while still
 * protecting the endpoint against abuse.
 */
const verificationAttemptLimiter =
  rateLimit({
    windowMs:
      15 *
      60 *
      1000,

    limit: 20,

    standardHeaders:
      true,

    legacyHeaders:
      false,

    message: {
      message:
        'Too many verification attempts. Please wait a few minutes and try again.'
    }
  });

router.post(
  '/wishes/:code/request-verification',
  verificationRequestLimiter,
  requestEmailVerification
);

router.post(
  '/wishes/:code/verify-reservation',
  verificationAttemptLimiter,
  verifyReservation
);

export default router;