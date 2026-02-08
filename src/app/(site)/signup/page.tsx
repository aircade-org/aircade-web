import Link from 'next/link';

import { UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function SignUpPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <UserPlus className="text-muted-foreground mb-4 size-12" />
      <h1 className="text-2xl font-bold">Sign Up</h1>
      <p className="text-muted-foreground mt-2">
        Account creation will be implemented in M0.2.0.
      </p>
      <Button
        variant="outline"
        size="sm"
        asChild
        className="mt-6"
      >
        <Link href="/signin">Already have an account?</Link>
      </Button>
    </div>
  );
}
