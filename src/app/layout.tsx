import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { initializeFirebase } from '@/firebase';
import { FirebaseProvider } from '@/firebase/provider';

export const metadata: Metadata = {
  title: 'NEWSIO - Your Futuristic News Feed',
  description: 'Stay updated with the latest news from around the world with a futuristic UI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { firebaseApp, firestore, auth } = initializeFirebase();
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
          {children}
        </FirebaseProvider>
        <Toaster />
      </body>
    </html>
  );
}
