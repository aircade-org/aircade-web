'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import type { FullUserProfile } from '@/types/user';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  type ChangeEmailInput,
  changeEmailSchema,
} from '@/lib/validations/user';

import * as userService from '@/services/user';

import { useAuthStore } from '@/store/auth';

interface EmailChangeDialogProps {
  children: React.ReactNode;
  authProviders: FullUserProfile['authProviders'];
}

export function EmailChangeDialog({
  children,
  authProviders,
}: EmailChangeDialogProps) {
  const user = useAuthStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasEmailProvider = authProviders.some((p) => p.provider === 'email');

  const form = useForm<ChangeEmailInput>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: '',
      password: '',
    },
  });

  async function onSubmit(values: ChangeEmailInput) {
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const payload: ChangeEmailInput = { newEmail: values.newEmail };
      if (hasEmailProvider && values.password) {
        payload.password = values.password;
      }

      const { data } = await userService.changeEmail(payload);

      // Update user in auth store
      if (user) {
        const setSession = useAuthStore.getState().setSession;
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (token && refreshToken) {
          setSession(
            { ...user, email: data.email, emailVerified: data.emailVerified },
            token,
            refreshToken,
          );
        }
      }

      setSuccessMessage(data.message);
      form.reset();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to change email';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      form.reset();
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Email</DialogTitle>
          <DialogDescription>
            Update your email address. You will need to verify your new email.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Current email:</span>{' '}
                <span className="text-muted-foreground">{user?.email}</span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="newEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="new-email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {hasEmailProvider && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Required to confirm your identity.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {!hasEmailProvider && (
              <Alert>
                <AlertDescription>
                  You signed up with OAuth. No password required.
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertDescription>
                After changing your email, you will need to verify the new
                address. A verification link will be sent to the new email.
              </AlertDescription>
            </Alert>

            {successMessage && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {errorMessage}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Changing...' : 'Change Email'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
