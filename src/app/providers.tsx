'use client';

import { type ReactNode, useEffect } from 'react';

import { ThemeProvider } from 'next-themes';

import { Toaster } from '@/components/ui/sonner';

import { useAuthStore } from '@/store/auth';

function AuthInitializer({ children }: { children: ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AuthInitializer>{children}</AuthInitializer>
      <Toaster />
    </ThemeProvider>
  );
}
