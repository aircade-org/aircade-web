'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

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
  type ChangeUsernameInput,
  changeUsernameSchema,
} from '@/lib/validations/user';

import * as userService from '@/services/user';

import { useAuthStore } from '@/store/auth';

interface UsernameChangeDialogProps {
  children: React.ReactNode;
}

export function UsernameChangeDialog({ children }: UsernameChangeDialogProps) {
  const user = useAuthStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<ChangeUsernameInput>({
    resolver: zodResolver(changeUsernameSchema),
    defaultValues: {
      newUsername: '',
    },
  });

  async function onSubmit(values: ChangeUsernameInput) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { data } = await userService.changeUsername(values);

      // Update user in auth store
      if (user) {
        const setSession = useAuthStore.getState().setSession;
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (token && refreshToken) {
          setSession({ ...user, username: data.username }, token, refreshToken);
        }
      }

      setIsOpen(false);
      form.reset();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to change username';
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
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Username</DialogTitle>
          <DialogDescription>
            Your username is used in your profile URL and @mentions. Choose
            carefully.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Current username:</span>{' '}
                <span className="text-muted-foreground">{user?.username}</span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="newUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="new_username"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    3-30 characters. Must start with a letter. Letters, numbers,
                    hyphens, and underscores allowed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isSubmitting ? 'Changing...' : 'Change Username'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
