'use client';
import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';

export const FirebaseClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { firebaseApp, firestore, auth } = initializeFirebase();

  if (!firebaseApp || !firestore || !auth) {
    // You can return a loader here
    return null;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      firestore={firestore}
      auth={auth}
    >
      {children}
    </FirebaseProvider>
  );
};
