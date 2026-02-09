import Link from 'next/link';

import { Code, Gamepad2, Tv } from 'lucide-react';

import { Background } from '@/components/decoration/background';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const experiences = [
  {
    title: 'Creative Studio',
    description:
      'Build multiplayer games in the browser with a code editor and live preview.',
    icon: Code,
    href: '/studio',
  },
  {
    title: 'Console',
    description:
      'Host game sessions on a big screen. Display the lobby and game for all players.',
    icon: Tv,
    href: '/console',
  },
  {
    title: 'Controller',
    description:
      'Join a session from your phone and use it as a custom game controller.',
    icon: Gamepad2,
    href: '/controller',
  },
];

export default function Home() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">AirCade</h1>
      <p className="text-muted-foreground mt-4 max-w-md text-center text-lg">
        Create, host, and play multiplayer games - right from the browser.
      </p>

      <div className="mt-12 grid w-full max-w-3xl gap-6 sm:grid-cols-3">
        {experiences.map(({ title, description, icon: Icon, href }) => (
          <Card key={href}>
            <CardHeader>
              <Icon className="text-muted-foreground mb-2 size-8" />
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full"
              >
                <Link href={href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Background />
    </div>
  );
}
