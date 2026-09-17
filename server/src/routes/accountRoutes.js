import {
  Router
} from 'express';

import {
  protect
} from '../middleware/auth.js';

import {
  changePassword
} from '../controllers/accountController.js';

const router =
  Router();

router.use(
  protect
);

router.patch(
  '/password',
  changePassword
);

export default router;