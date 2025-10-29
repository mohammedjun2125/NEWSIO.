'use server';

import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server';
import { fetchNewsAndStoreInFirestore, shouldFetchNews } from '@/lib/news';

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

export async function triggerNewsFetch() {
  try {
    if (await shouldFetchNews()) {
      console.log('Stale or empty news collection, triggering fetch...');
      await fetchNewsAndStoreInFirestore();
      return { success: true, message: 'News fetched successfully.' };
    }
    console.log('News is fresh, skipping fetch.');
    return { success: true, message: 'News is already fresh.' };
  } catch (error) {
    console.error('Failed to trigger news fetch:', error);
    return { success: false, message: 'Failed to fetch news.' };
  }
}
