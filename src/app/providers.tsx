"use client";

import { Toaster } from "@/components/ui/toaster";
import { initializeFirebase } from "@/firebase";
import { FirebaseProvider } from "@/firebase/provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const { firebaseApp, firestore, auth } = initializeFirebase();

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      firestore={firestore}
      auth={auth}
    >
      {children}
      <Toaster />
    </FirebaseProvider>
  );
}
