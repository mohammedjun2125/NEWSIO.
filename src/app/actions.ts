'use server';

import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server';

export type SubscriptionState = {
  message: string;
  status: 'success' | 'error' | 'idle';
};

const emailSchema = z.string().email({ message: 'Please enter a valid email address.' });

export async function subscribe(
  prevState: SubscriptionState,
  formData: FormData
): Promise<SubscriptionState> {
  const email = formData.get('email');
  
  const validatedEmail = emailSchema.safeParse(email);

  if (!validatedEmail.success) {
    return {
      message: validatedEmail.error.errors[0].message,
      status: 'error',
    };
  }

  try {
    const { firestore } = initializeFirebase();
    const subscriptionsCollection = collection(firestore, 'subscriptions');
    await addDoc(subscriptionsCollection, {
      email: validatedEmail.data,
      subscribedAt: serverTimestamp(),
    });
    
    console.log(`New subscription from: ${validatedEmail.data}`);

    return {
      message: `Thank you for subscribing! A confirmation has been sent to ${validatedEmail.data}.`,
      status: 'success',
    };
  } catch (error) {
    console.error('Subscription failed:', error);
    return {
      message: 'Subscription failed. Please try again later.',
      status: 'error',
    }
  }
}
