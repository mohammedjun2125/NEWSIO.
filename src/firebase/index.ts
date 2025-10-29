'use client';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';
import { useAuth, useFirebaseApp, useFirestore as useFirestoreContext } from './provider';

function initializeFirebase() {
  const apps = getApps();
  const firebaseApp = !apps.length ? initializeApp(firebaseConfig) : getApp();
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  return { firebaseApp, firestore, auth };
}

// Re-exporting hooks
export const useFirestore = useFirestoreContext;
export { initializeFirebase, useAuth, useFirebaseApp };
