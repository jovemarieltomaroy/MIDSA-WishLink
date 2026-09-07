import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getPublicWish, reserveWish } from '../controllers/publicController.js';
const router = Router();
const reservationLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });
router.get('/wishes/:code', getPublicWish);
router.post('/wishes/:code/reserve', reservationLimiter, reserveWish);
export default router;
