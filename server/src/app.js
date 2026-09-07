import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import officerRoutes from './routes/officerRoutes.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = [process.env.CLIENT_URL, process.env.PUBLIC_APP_URL].filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Origin is not allowed by CORS.'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'MIDSA WishLink API' }));
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/officer', officerRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
