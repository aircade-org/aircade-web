'use client';

import { Suspense, useEffect, useRef } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

import { useAuthStore } from '@/store/auth';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleOAuthCallback = useAuthStore((s) => s.handleOAuthCallback);
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const provider = searchParams.get('provider') as 'google' | 'github' | null;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      toast.error(`OAuth error: ${error}`);
      router.replace('/signin');
      return;
    }

    if (!provider || !code || !state) {
      toast.error('Invalid OAuth callback. Missing parameters.');
      router.replace('/signin');
      return;
    }

    handleOAuthCallback(provider, code, state)
      .then(() => {
        toast.success('Signed in successfully!');
        router.replace('/');
      })
      .catch((err: unknown) => {
        toast.error(
          err instanceof Error ? err.message : 'OAuth sign-in failed.',
        );
        router.replace('/signin');
      });
  }, [searchParams, handleOAuthCallback, router]);

  return (
    <div className="flex h-full items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Signing you in</CardTitle>
          <CardDescription>
            Completing authentication, please wait...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Spinner className="size-8" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Spinner className="size-8" />
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
