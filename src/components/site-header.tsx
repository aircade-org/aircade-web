'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Code, Gamepad2, LogOut, Monitor, Tv, User } from 'lucide-react';
import { toast } from 'sonner';

import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';

import { useAuthStore } from '@/store/auth';

const navItems = [
  { href: '/studio', label: 'Studio', icon: Code },
  { href: '/console', label: 'Console', icon: Tv },
  { href: '/controller', label: 'Controller', icon: Gamepad2 },
];

function getUserInitials(username: string, displayName: string | null): string {
  const name = displayName || username || '?';
  return name
    .split(/[\s_-]+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out.');
    router.push('/');
  };

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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full"
                >
                  <Avatar size="sm">
                    {user.avatarUrl && (
                      <AvatarImage
                        src={user.avatarUrl}
                        alt={user.username}
                      />
                    )}
                    <AvatarFallback>
                      {getUserInitials(user.username, user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm leading-none font-medium">
                      {user.displayName ?? user.username}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}
