import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import officerRoutes from './routes/officerRoutes.js';
import accountRoutes from './routes/accountRoutes.js';

import {
  errorHandler,
  notFound
} from './middleware/error.js';

const app = express();

/*
 * Normalize origins so harmless differences like
 * trailing slashes or spaces do not break CORS.
 */
function normalizeOrigin(value) {
  if (!value) return '';

  return value
    .trim()
    .replace(/\/+$/, '');
}

/*
 * Explicitly allow the deployed MIDSA WishLink frontend,
 * plus local development URLs.
 *
 * Environment variables are still included, but the deployed
 * frontend is hardcoded here so Render cannot fail because of
 * a small environment-variable mismatch.
 */
const allowedOrigins = [
  'https://midsa-wishlink-rnvh.onrender.com',

  process.env.CLIENT_URL,
  process.env.PUBLIC_APP_URL,

  'http://localhost:5173',
  'http://localhost:5174',

  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
]
  .map(normalizeOrigin)
  .filter(Boolean);

console.log(
  'Allowed CORS origins:',
  allowedOrigins
);

const corsOptions = {
  origin(origin, callback) {
    /*
     * Allow requests without an Origin header,
     * such as Render health checks and direct server requests.
     */
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin =
      normalizeOrigin(origin);

    if (
      allowedOrigins.includes(
        normalizedOrigin
      )
    ) {
      return callback(null, true);
    }

    console.warn(
      'Blocked CORS origin:',
      normalizedOrigin
    );

    return callback(
      new Error(
        `Origin ${normalizedOrigin} is not allowed by CORS.`
      )
    );
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ]
};

/*
 * Security headers
 */
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin'
    }
  })
);

/*
 * IMPORTANT:
 * CORS must be registered before routes.
 */
app.use(
  cors(corsOptions)
);

/*
 * Request parsing
 */
app.use(
  express.json({
    limit: '1mb'
  })
);

app.use(
  cookieParser()
);

/*
 * Health check
 */
app.get(
  '/api/health',
  (req, res) => {
    res.json({
      ok: true,
      service: 'MIDSA WishLink API'
    });
  }
);

/*
 * API routes
 */
app.use(
  '/api/auth',
  authRoutes
);

app.use(
  '/api/public',
  publicRoutes
);

app.use(
  '/api/officer',
  officerRoutes
);
app.use(
  '/api/account',
  accountRoutes
);
/*
 * Error handling
 */
app.use(notFound);
app.use(errorHandler);

export default app;