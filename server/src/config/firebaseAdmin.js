import {
  cert,
  getApps,
  initializeApp,
} from 'firebase-admin/app';

import {
  getAuth,
} from 'firebase-admin/auth';

function getPrivateKey() {
  const privateKey =
    process.env.FIREBASE_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error(
      'FIREBASE_PRIVATE_KEY is missing.'
    );
  }

  return privateKey.replace(
    /\\n/g,
    '\n'
  );
}

function initializeFirebaseAdmin() {
  if (
    getApps().length > 0
  ) {
    return getApps()[0];
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID;

  const clientEmail =
    process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId) {
    throw new Error(
      'FIREBASE_PROJECT_ID is missing.'
    );
  }

  if (!clientEmail) {
    throw new Error(
      'FIREBASE_CLIENT_EMAIL is missing.'
    );
  }

  return initializeApp({
    credential: cert({
      projectId,

      clientEmail,

      privateKey:
        getPrivateKey(),
    }),
  });
}

export const firebaseAdminApp =
  initializeFirebaseAdmin();

export const firebaseAdminAuth =
  getAuth(
    firebaseAdminApp
  );