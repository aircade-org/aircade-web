'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Code, Gamepad2, Monitor, Tv } from 'lucide-react';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

const navItems = [
  { href: '/studio', label: 'Studio', icon: Code },
  { href: '/console', label: 'Console', icon: Tv },
  { href: '/controller', label: 'Controller', icon: Gamepad2 },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="flex h-14 w-full items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 pl-4"
          >
            <Monitor className="size-5" />
            <span className="font-bold">AirCade</span>
          </Link>

          <nav className="ml-6 flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Button
                key={href}
                variant="ghost"
                size="sm"
                asChild
              >
                <Link
                  href={href}
                  className={cn(
                    pathname?.startsWith(href) &&
                      'bg-accent text-accent-foreground',
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 pr-4">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button
            size="sm"
            asChild
          >
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
