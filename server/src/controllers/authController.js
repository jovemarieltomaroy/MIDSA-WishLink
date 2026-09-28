import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { firebaseAdminAuth } from '../config/firebaseAdmin.js';

function signToken(id) {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: '12h',
    }
  );
}

function cookieOptions() {
  const isProduction =
    process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,

    sameSite: isProduction
      ? 'none'
      : 'lax',

    secure: isProduction,

    maxAge:
      12 * 60 * 60 * 1000,
  };
}

function clearCookieOptions() {
  const isProduction =
    process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,

    sameSite: isProduction
      ? 'none'
      : 'lax',

    secure: isProduction,
  };
}

/*
 * GOOGLE-ONLY LOGIN
 *
 * The frontend signs in through Firebase first.
 * Firebase gives the frontend an ID token.
 *
 * The frontend sends that token here.
 *
 * This backend then:
 * 1. verifies the Firebase token
 * 2. reads the verified Google email
 * 3. checks whether it is the authorized MIDSA account
 * 4. finds or creates the MongoDB user
 * 5. returns the normal WishLink JWT
 */
export async function googleLogin(
  req,
  res,
  next
) {
  try {
    const {
      idToken,
    } = req.body;

    if (!idToken) {
      return res
        .status(400)
        .json({
          message:
            'Google authentication token is required.',
        });
    }

    const decodedToken =
      await firebaseAdminAuth.verifyIdToken(
        idToken
      );

    const email =
      String(
        decodedToken.email || ''
      )
        .trim()
        .toLowerCase();

    if (
      !email ||
      !decodedToken.email_verified
    ) {
      return res
        .status(401)
        .json({
          message:
            'The Google account email could not be verified.',
        });
    }

    const authorizedEmail =
      String(
        process.env.ADMIN_GOOGLE_EMAIL ||
        ''
      )
        .trim()
        .toLowerCase();

    if (!authorizedEmail) {
      console.error(
        'ADMIN_GOOGLE_EMAIL is not configured.'
      );

      return res
        .status(500)
        .json({
          message:
            'Google sign-in is not configured.',
        });
    }

    /*
     * Only the single approved MIDSA Google
     * account is allowed into WishLink.
     */
    if (
      email !== authorizedEmail
    ) {
      return res
        .status(403)
        .json({
          message:
            'This Google account is not authorized to access MIDSA WishLink.',
        });
    }

    let user =
      await User.findOne({
        email,
      });

    /*
     * If the authorized Google account does not
     * exist yet in MongoDB, create it.
     */
    if (!user) {
      user =
        await User.create({
          name:
            decodedToken.name ||
            'MIDSA Administrator',

          email,

          firebaseUid:
            decodedToken.uid,

          authProvider:
            'google',

          role:
            'admin',

          isActive:
            true,
        });
    } else {
      /*
       * Keep the existing user record,
       * but connect it to Firebase if needed.
       */
      let changed = false;

      if (
        !user.firebaseUid
      ) {
        user.firebaseUid =
          decodedToken.uid;

        changed = true;
      }

      if (
        user.authProvider !==
        'google'
      ) {
        user.authProvider =
          'google';

        changed = true;
      }

      if (
        decodedToken.name &&
        !user.name
      ) {
        user.name =
          decodedToken.name;

        changed = true;
      }

      if (changed) {
        await user.save();
      }
    }

    if (
      user.isActive === false
    ) {
      return res
        .status(403)
        .json({
          message:
            'This account is currently inactive.',
        });
    }

    const token =
      signToken(
        user._id
      );

    res.cookie(
      'wishlink_token',
      token,
      cookieOptions()
    );

    return res.json({
      token,

      user: {
        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        role:
          user.role,
      },
    });
  } catch (error) {
    console.error(
      'Google login error:',
      error
    );

    if (
      error?.code ===
        'auth/id-token-expired' ||
      error?.code ===
        'auth/argument-error' ||
      error?.code ===
        'auth/id-token-revoked'
    ) {
      return res
        .status(401)
        .json({
          message:
            'Your Google sign-in session is invalid or expired. Please try again.',
        });
    }

    next(error);
  }
}

export function logout(
  req,
  res
) {
  res.clearCookie(
    'wishlink_token',
    clearCookieOptions()
  );

  res.json({
    message:
      'Logged out.',
  });
}

export async function me(
  req,
  res
) {
  res.json({
    user: {
      id:
        req.user._id,

      name:
        req.user.name,

      email:
        req.user.email,

      role:
        req.user.role,
    },
  });
}