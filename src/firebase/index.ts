'use client';
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';
import { useAuth, useFirebaseApp, useFirestore as useFirestoreContext } from './provider';

function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, firestore: null, auth: null };
  }
  const apps = getApps();
  const firebaseApp = !apps.length ? initializeApp(firebaseConfig) : getApp();
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  return { firebaseApp, firestore, auth };
}

// Re-exporting hooks
export const useFirestore = useFirestoreContext;
export { initializeFirebase, useAuth, useFirebaseApp };
