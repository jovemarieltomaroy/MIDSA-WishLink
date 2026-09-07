import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import officerRoutes from './routes/officerRoutes.js';

import {
  errorHandler,
  notFound
} from './middleware/error.js';

const app = express();

/*
 * Normalize URLs before comparing them.
 *
 * This prevents harmless differences such as:
 *
 * https://example.com
 * https://example.com/
 * https://example.com   [with accidental spaces]
 */
function normalizeOrigin(value) {
  if (!value) {
    return '';
  }

  return value
    .trim()
    .replace(/,+$/, '')
    .replace(/\/+$/, '');
}

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.PUBLIC_APP_URL,

  /*
   * Local development addresses.
   */
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
]
  .map(normalizeOrigin)
  .filter(Boolean);

/*
 * This is safe to log because these are public frontend URLs,
 * not passwords or secrets.
 */
console.log(
  'Allowed CORS origins:',
  allowedOrigins
);

const corsOptions = {
  origin(origin, callback) {
    /*
     * Requests without an Origin header are allowed.
     * This includes tools such as server-to-server requests.
     */
    if (!origin) {
      return callback(null, true);
    }

    const normalizedRequestOrigin =
      normalizeOrigin(origin);

    if (
      allowedOrigins.includes(
        normalizedRequestOrigin
      )
    ) {
      return callback(null, true);
    }

    console.warn(
      'Blocked CORS origin:',
      normalizedRequestOrigin
    );

    return callback(
      new Error(
        `Origin ${normalizedRequestOrigin} is not allowed by CORS.`
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
  ],

  optionsSuccessStatus: 204
};

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin'
    }
  })
);

/*
 * CORS must come before all API routes.
 */
app.use(
  cors(corsOptions)
);

app.use(
  express.json({
    limit: '1mb'
  })
);

app.use(
  cookieParser()
);

app.get(
  '/api/health',
  (req, res) => {
    res.json({
      ok: true,
      service:
        'MIDSA WishLink API'
    });
  }
);

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

app.use(notFound);
app.use(errorHandler);

export default app;