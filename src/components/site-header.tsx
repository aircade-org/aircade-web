'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
  Code,
  Gamepad2,
  LogOut,
  Monitor,
  Settings,
  Tv,
  User,
} from 'lucide-react';
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
      <div className="flex h-14 w-full items-center justify-between px-2 sm:px-0">
        <div className="flex items-center gap-2 sm:gap-0">
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 sm:pl-4"
          >
            <Monitor className="size-4 sm:size-5" />
            <span className="text-sm font-bold sm:text-base">AirCade</span>
          </Link>

          <nav className="ml-2 hidden items-center gap-1 sm:ml-6 md:flex">
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

          <nav className="ml-2 flex items-center gap-0.5 sm:ml-4 md:hidden">
            {navItems.map(({ href, icon: Icon }) => (
              <Button
                key={href}
                variant="ghost"
                size="icon-sm"
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
                </Link>
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 sm:pr-4">
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
                  <Link href={`/users/${user.username}`}>
                    <User className="size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="size-4" />
                    Settings
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
                className="hidden sm:inline-flex"
              >
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button
                size="sm"
                asChild
              >
                <Link href="/signup">
                  <span className="hidden sm:inline">Sign Up</span>
                  <span className="sm:hidden">Join</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
