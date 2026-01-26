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
    <div className="flex h-full flex-col items-center justify-center px-4 py-8 sm:py-0">
      <div className="mx-auto max-w-2xl rounded-3xl px-6 py-5 text-center ring-1 ring-white/5 backdrop-blur-xl sm:px-20 lg:px-40">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          AirCade
        </h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-md text-base sm:mt-4 sm:text-lg">
          Create. Play. Share.
        </p>
      </div>

      <div className="mt-8 grid w-full max-w-3xl gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {experiences.map(({ title, description, icon: Icon, href }) => (
          <Card key={href}>
            <CardHeader className="pb-3">
              <Icon className="text-muted-foreground mb-2 size-7 sm:size-8" />
              <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
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
