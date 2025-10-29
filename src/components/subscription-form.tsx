'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Mail, Loader, ArrowRight } from 'lucide-react';
import { subscribe, type SubscriptionState } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="icon" disabled={pending} aria-label="Subscribe">
      {pending ? <Loader className="animate-spin" /> : <ArrowRight />}
    </Button>
  );
}

export function SubscriptionForm() {
  const initialState: SubscriptionState = { message: '', status: 'idle' };
  const [state, formAction] = useFormState(subscribe, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === 'success') {
      toast({
        title: 'Success!',
        description: state.message,
      });
      formRef.current?.reset();
    } else if (state.status === 'error') {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight font-headline">
        <Mail className="w-5 h-5 text-primary" />
        Stay Updated
      </h2>
      <p className="text-sm text-muted-foreground">Subscribe to our newsletter for the latest updates.</p>
      <form ref={formRef} action={formAction} className="flex w-full items-center space-x-2">
        <div className="relative flex-grow">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="pl-9"
          />
        </div>
        <SubmitButton />
      </form>
      <p
        aria-live="polite"
        className={cn('text-sm', {
          'text-destructive': state.status === 'error',
          'text-green-500': state.status === 'success',
        })}
      >
        {state.status !== 'idle' && state.status !== 'success' && state.message}
      </p>
    </div>
  );
}
