import {
  Router,
} from 'express';

import {
  googleLogin,
  logout,
  me,
} from '../controllers/authController.js';

import {
  protect,
} from '../middleware/auth.js';

const router =
  Router();

/*
 * Firebase Google authentication
 */
router.post(
  '/google',
  googleLogin
);

/*
 * End current WishLink session
 */
router.post(
  '/logout',
  logout
);

/*
 * Restore/check current WishLink session
 */
router.get(
  '/me',
  protect,
  me
);

export default router;