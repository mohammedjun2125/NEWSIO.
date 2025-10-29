'use server';

import { z } from 'zod';

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

  // In a real application, you would save this email to your database
  // or a mailing list service like Mailchimp, ConvertKit, etc.
  console.log(`New subscription from: ${validatedEmail.data}`);

  return {
    message: `Thank you for subscribing! A confirmation has been sent to ${validatedEmail.data}.`,
    status: 'success',
  };
}
