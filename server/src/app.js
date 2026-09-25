import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import officerRoutes from './routes/officerRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

import {
  errorHandler,
  notFound
} from './middleware/error.js';

const app = express();

function normalizeOrigin(value) {
  if (!value) {
    return '';
  }

  return value
    .trim()
    .replace(
      /\/+$/,
      ''
    );
}

const allowedOrigins = [
  'https://midsa-wishlink-rnvh.onrender.com',

  process.env.CLIENT_URL,
  process.env.PUBLIC_APP_URL,

  'http://localhost:5173',
  'http://localhost:5174',

  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
]
  .map(
    normalizeOrigin
  )
  .filter(
    Boolean
  );

console.log(
  'Allowed CORS origins:',
  allowedOrigins
);

const corsOptions = {
  origin(
    origin,
    callback
  ) {
    if (!origin) {
      return callback(
        null,
        true
      );
    }

    const normalizedOrigin =
      normalizeOrigin(
        origin
      );

    if (
      allowedOrigins.includes(
        normalizedOrigin
      )
    ) {
      return callback(
        null,
        true
      );
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

  credentials:
    true,

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

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy:
        'cross-origin'
    }
  })
);

app.use(
  cors(
    corsOptions
  )
);

app.use(
  express.json({
    limit:
      '1mb'
  })
);

app.use(
  cookieParser()
);

app.get(
  '/api/health',
  (
    req,
    res
  ) => {
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

app.use(
  '/api/account',
  accountRoutes
);

app.use(
  '/api/settings',
  settingsRoutes
);

app.use(
  notFound
);

app.use(
  errorHandler
);

export default app;