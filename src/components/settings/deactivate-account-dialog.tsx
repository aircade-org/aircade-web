'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import type { FullUserProfile } from '@/types/user';

import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import {
  type DeactivateAccountInput,
  deactivateAccountSchema,
} from '@/lib/validations/user';

import * as userService from '@/services/user';

import { useAuthStore } from '@/store/auth';

interface DeactivateAccountDialogProps {
  children: React.ReactNode;
  authProviders: FullUserProfile['authProviders'];
}

export function DeactivateAccountDialog({
  children,
  authProviders,
}: DeactivateAccountDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasEmailProvider = authProviders.some((p) => p.provider === 'email');

  const form = useForm<DeactivateAccountInput>({
    resolver: zodResolver(deactivateAccountSchema),
    defaultValues: {
      password: '',
    },
  });

  async function onSubmit(values: DeactivateAccountInput) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: DeactivateAccountInput = {};
      if (hasEmailProvider && values.password) {
        payload.password = values.password;
      }

      await userService.deactivateAccount(payload);

      // Clear session and redirect
      const signOut = useAuthStore.getState().signOut;
      await signOut();
      router.push('/signin');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to deactivate account';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      form.reset();
      setErrorMessage(null);
    }
  }

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate Account</AlertDialogTitle>
          <AlertDialogDescription>
            This action will hide your profile and published games from other
            users. Your data will be retained and can be restored by contacting
            support.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Warning:</strong> Your account will be deactivated. You
                will not be able to sign in until you contact support to restore
                your account.
              </AlertDescription>
            </Alert>

            {hasEmailProvider && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Required to confirm this action.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {!hasEmailProvider && (
              <Alert>
                <AlertDescription>
                  You signed up with OAuth. Click deactivate to confirm.
                </AlertDescription>
              </Alert>
            )}

            {errorMessage && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {errorMessage}
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>
                Cancel
              </AlertDialogCancel>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deactivating...' : 'Deactivate Account'}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
