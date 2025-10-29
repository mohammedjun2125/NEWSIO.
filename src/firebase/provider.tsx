'use client';
import { createContext, useContext } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

interface FirebaseContextType {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  firebaseApp: null,
  firestore: null,
  auth: null,
});

export const FirebaseProvider: React.FC<{
  children: React.ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}> = ({ children, firebaseApp, firestore, auth }) => {
  return (
    <FirebaseContext.Provider value={{ firebaseApp, firestore, auth }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebaseApp = () => useContext(FirebaseContext)?.firebaseApp;
export const useFirestore = () => useContext(FirebaseContext)?.firestore;
export const useAuth = () => useContext(FirebaseContext)?.auth;
