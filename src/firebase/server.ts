import { initializeApp, getApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

function initializeFirebase() {
  const apps = getApps();
  if (!apps.length) {
    initializeApp({
      credential: cert(serviceAccount!),
    });
  }
  const firestore = getFirestore();
  const auth = getAuth();
  return { firestore, auth };
}

export { initializeFirebase };
