import { initializeApp, getApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

let serviceAccount: object | undefined;

if (serviceAccountString) {
  try {
    serviceAccount = JSON.parse(serviceAccountString);
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", error);
  }
}


function initializeFirebase() {
  const apps = getApps();
  if (!apps.length && serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }
  const firestore = getFirestore();
  const auth = getAuth();
  return { firestore, auth };
}

function canUseServerSideFirebase() {
    return !!serviceAccount;
}

export { initializeFirebase, canUseServerSideFirebase };
