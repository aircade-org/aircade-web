'use client';

import { Suspense, useEffect, useRef, useState } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { CheckCircle, Mail, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

import { resendVerificationEmail, verifyEmail } from '@/services/auth';

import { useAuthStore } from '@/store/auth';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error',
  );
  const [resending, setResending] = useState(false);
  const processed = useRef(false);

  useEffect(() => {
    if (!token || processed.current) return;
    processed.current = true;

    verifyEmail(token)
      .then(() => {
        setStatus('success');
      })
      .catch(() => {
        setStatus('error');
      });
  }, [token]);

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerificationEmail();
      toast.success('Verification email sent! Check your inbox.');
    } catch {
      toast.error('Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Verifying your email</CardTitle>
            <CardDescription>Please wait...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Spinner className="size-8" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CheckCircle className="text-chart-2 mx-auto mb-2 size-12" />
            <CardTitle className="text-xl">Email verified!</CardTitle>
            <CardDescription>
              Your email has been verified. You can now use all features.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/">Go to home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          {token ? (
            <>
              <XCircle className="text-destructive mx-auto mb-2 size-12" />
              <CardTitle className="text-xl">Verification failed</CardTitle>
              <CardDescription>
                The verification link is invalid or has expired.
              </CardDescription>
            </>
          ) : (
            <>
              <Mail className="text-muted-foreground mx-auto mb-2 size-12" />
              <CardTitle className="text-xl">Check your email</CardTitle>
              <CardDescription>
                We sent a verification link to your email address. Click the
                link to verify your account.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="grid gap-3">
          {user && (
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={resending}
            >
              {resending && <Spinner />}
              Resend verification email
            </Button>
          )}
          <Button
            variant="ghost"
            asChild
          >
            <Link href="/signin">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Spinner className="size-8" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
