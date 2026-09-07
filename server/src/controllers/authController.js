import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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

    /*
     * Render frontend and backend use different
     * subdomains, so production needs SameSite=None.
     */
    sameSite: isProduction
      ? 'none'
      : 'lax',

    /*
     * SameSite=None requires Secure=true.
     */
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

export async function login(
  req,
  res
) {
  const {
    email,
    password,
  } = req.body;

  const normalizedEmail =
    String(
      email || ''
    )
      .trim()
      .toLowerCase();

  const user =
    await User.findOne({
      email: normalizedEmail,
    }).select('+password');

  if (
    !user ||
    !user.isActive ||
    !(await user.comparePassword(
      password || ''
    ))
  ) {
    return res
      .status(401)
      .json({
        message:
          'Invalid email or password.',
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

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
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
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
}