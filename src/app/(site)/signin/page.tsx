import Link from 'next/link';

import { LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function SignInPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <LogIn className="text-muted-foreground mb-4 size-12" />
      <h1 className="text-2xl font-bold">Sign In</h1>
      <p className="text-muted-foreground mt-2">
        Authentication will be implemented in M0.2.0.
      </p>
      <Button
        variant="outline"
        size="sm"
        asChild
        className="mt-6"
      >
        <Link href="/signup">Create an account</Link>
      </Button>
    </div>
  );
}
