import {
  Router
} from 'express';

import {
  protect,
  adminOnly
} from '../middleware/auth.js';

import {
  getSettings,
  updateSettings
} from '../controllers/settingsController.js';

const router =
  Router();

router.use(
  protect
);

router.get(
  '/',
  getSettings
);

router.patch(
  '/',
  adminOnly,
  updateSettings
);

export default router;