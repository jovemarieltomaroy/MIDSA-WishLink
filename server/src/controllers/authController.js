import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '12h' });
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 12 * 60 * 60 * 1000
  };
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+password');
  if (!user || !user.isActive || !(await user.comparePassword(password || ''))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  res.cookie('wishlink_token', signToken(user._id), cookieOptions());
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

export function logout(req, res) {
  res.clearCookie('wishlink_token', cookieOptions());
  res.json({ message: 'Logged out.' });
}

export async function me(req, res) {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });
}
