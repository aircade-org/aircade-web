'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import { useParams } from 'next/navigation';

import { Calendar, GamepadIcon } from 'lucide-react';

import type { PublicUserProfile } from '@/types/user';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

import { resolveAssetUrl } from '@/lib/utils';

import * as userService from '@/services/user';

interface UserGame {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  minPlayers: number;
  maxPlayers: number;
  playCount: number;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
}

function GameCard({ game }: { game: UserGame }) {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className="bg-muted relative aspect-video">
        {game.thumbnailUrl ? (
          <Image
            src={game.thumbnailUrl}
            alt={game.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <GamepadIcon className="text-muted-foreground/50 h-16 w-16" />
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{game.title}</CardTitle>
        {game.description && (
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {game.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-muted-foreground flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <GamepadIcon className="h-4 w-4" />
            <span>
              {game.minPlayers === game.maxPlayers
                ? `${game.minPlayers} player${game.minPlayers > 1 ? 's' : ''}`
                : `${game.minPlayers}-${game.maxPlayers} players`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(game.createdAt)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {game.avgRating > 0 && (
              <Badge variant="secondary">★ {game.avgRating.toFixed(1)}</Badge>
            )}
            <span className="text-muted-foreground">
              {game.playCount.toLocaleString()} plays
            </span>
          </div>
          {game.reviewCount > 0 && (
            <span className="text-muted-foreground">
              {game.reviewCount} review{game.reviewCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function UserProfilePage() {
  const params = useParams();
  const username = params?.username as string;

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [games, setGames] = useState<UserGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!username) return;

      try {
        const [profileRes, gamesRes] = await Promise.all([
          userService.getPublicUserProfile(username),
          userService.getUserGames(username, { offset: 0, limit: 20 }),
        ]);

        setProfile(profileRes.data);
        setGames(gamesRes.data.data);
      } catch (err: unknown) {
        // Handle different error types
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { status?: number } };
          if (axiosError.response?.status === 404) {
            setError(
              'This user does not exist or has no published games. Public profiles are only available for users with published content.',
            );
          } else {
            setError('Failed to load profile. Please try again.');
          }
        } else if (err instanceof Error) {
          setError(
            `Unable to connect to the server. Please ensure the API is running. (${err.message})`,
          );
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [username]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">User Not Found</h2>
          <p className="text-muted-foreground mt-2">
            {error || 'This user does not exist or has no published games.'}
          </p>
        </div>
      </div>
    );
  }

  function getInitials() {
    if (!profile) return '??';
    if (profile.displayName) {
      return profile.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return profile.username.slice(0, 2).toUpperCase();
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });

  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <Avatar className="h-32 w-32">
          <AvatarImage
            src={resolveAssetUrl(profile.avatarUrl)}
            alt={profile.username}
          />
          <AvatarFallback className="text-3xl">{getInitials()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-3xl font-bold">
              {profile.displayName || profile.username}
            </h1>
            {profile.displayName && (
              <p className="text-muted-foreground">@{profile.username}</p>
            )}
          </div>

          {profile.bio && (
            <p className="text-muted-foreground">{profile.bio}</p>
          )}

          <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Joined {formatDate(profile.createdAt)}</span>
            </div>
          </div>

          <div className="flex gap-6 text-sm">
            <div>
              <span className="font-bold">{profile.stats.gamesPublished}</span>{' '}
              <span className="text-muted-foreground">
                game{profile.stats.gamesPublished !== 1 ? 's' : ''}
              </span>
            </div>
            <div>
              <span className="font-bold">
                {profile.stats.totalPlayCount.toLocaleString()}
              </span>{' '}
              <span className="text-muted-foreground">total plays</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="mb-6 text-2xl font-bold">Published Games</h2>

        {games.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-[200px] items-center justify-center">
              <p className="text-muted-foreground">No published games yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
