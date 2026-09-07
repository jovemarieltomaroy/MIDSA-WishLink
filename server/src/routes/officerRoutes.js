import express from 'express';

import {
  protect,
  adminOnly,
} from '../middleware/auth.js';

import {
  createCampaign,
  listCampaigns,
  getCampaign,
  updateCampaign,
  activateCampaign,
  completeCampaign,
  archiveCampaign,
  getActiveCampaign,
} from '../controllers/campaignController.js';

import {
  dashboard,
  createWish,
  listWishes,
  getWish,
  updateWish,
  changeStatus,
  extendDeadline,
  qrPng,
  deleteWish,
  listOfficers,
  createOfficer,
} from '../controllers/officerController.js';

const router = express.Router();

/*
 * All officer routes require authentication.
 */
router.use(protect);

/*
 * DASHBOARD
 */
router.get(
  '/dashboard',
  dashboard
);

/*
 * CAMPAIGNS
 */
router.get(
  '/campaigns',
  listCampaigns
);

router.get(
  '/campaigns/active',
  getActiveCampaign
);

router.get(
  '/campaigns/:id',
  getCampaign
);

router.post(
  '/campaigns',
  adminOnly,
  createCampaign
);

router.patch(
  '/campaigns/:id',
  adminOnly,
  updateCampaign
);

router.patch(
  '/campaigns/:id/activate',
  adminOnly,
  activateCampaign
);

router.patch(
  '/campaigns/:id/complete',
  adminOnly,
  completeCampaign
);

router.patch(
  '/campaigns/:id/archive',
  adminOnly,
  archiveCampaign
);

/*
 * WISHES
 */
router.get(
  '/wishes',
  listWishes
);

router.post(
  '/wishes',
  createWish
);

router.get(
  '/wishes/:id',
  getWish
);

router.patch(
  '/wishes/:id',
  updateWish
);

router.patch(
  '/wishes/:id/status',
  changeStatus
);

router.patch(
  '/wishes/:id/deadline',
  extendDeadline
);

router.get(
  '/wishes/:id/qr',
  qrPng
);

router.delete(
  '/wishes/:id',
  deleteWish
);

/*
 * OFFICER MANAGEMENT
 */
router.get(
  '/officers',
  adminOnly,
  listOfficers
);

router.post(
  '/officers',
  adminOnly,
  createOfficer
);

export default router;