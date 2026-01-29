'use client';

import { useEffect, useState } from 'react';

import { Mail, User } from 'lucide-react';

import type { FullUserProfile } from '@/types/user';

import { AuthGuard } from '@/components/auth-guard';
import { AvatarUpload } from '@/components/settings/avatar-upload';
import { DeactivateAccountDialog } from '@/components/settings/deactivate-account-dialog';
import { EmailChangeDialog } from '@/components/settings/email-change-dialog';
import { ProfileForm } from '@/components/settings/profile-form';
import { UsernameChangeDialog } from '@/components/settings/username-change-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

import * as userService from '@/services/user';

import { useAuthStore } from '@/store/auth';

function SettingsContent() {
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<FullUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data } = await userService.getCurrentUser();
        setProfile(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load profile';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleAvatarUploadSuccess(avatarUrl: string) {
    if (user) {
      const setSession = useAuthStore.getState().setSession;
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (token && refreshToken) {
        setSession({ ...user, avatarUrl }, token, refreshToken);
      }
    }
  }

  function handleAvatarDeleteSuccess() {
    if (user) {
      const setSession = useAuthStore.getState().setSession;
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (token && refreshToken) {
        setSession({ ...user, avatarUrl: null }, token, refreshToken);
      }
    }
  }

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
          <p className="text-destructive">
            {error || 'Failed to load profile'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and profile.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Upload a profile picture or use the default avatar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            onUploadSuccess={handleAvatarUploadSuccess}
            onDeleteSuccess={handleAvatarDeleteSuccess}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your display name and bio.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Manage your username and email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">Username</span>
              </div>
              <p className="text-muted-foreground text-sm">
                {profile.username}
              </p>
            </div>
            <UsernameChangeDialog>
              <Button
                variant="outline"
                size="sm"
              >
                Change
              </Button>
            </UsernameChangeDialog>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">Email</span>
                {profile.emailVerified ? (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                  >
                    Verified
                  </Badge>
                ) : (
                  <Badge
                    variant="destructive"
                    className="text-xs"
                  >
                    Not Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm">{profile.email}</p>
            </div>
            <EmailChangeDialog authProviders={profile.authProviders}>
              <Button
                variant="outline"
                size="sm"
              >
                Change
              </Button>
            </EmailChangeDialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Linked Accounts</CardTitle>
          <CardDescription>
            Manage your connected authentication providers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.authProviders.map((provider) => (
            <div
              key={provider.provider}
              className="flex items-center justify-between"
            >
              <div className="space-y-1">
                <p className="font-medium capitalize">{provider.provider}</p>
                <p className="text-muted-foreground text-sm">
                  {provider.providerEmail}
                </p>
              </div>
              <Badge variant="secondary">Connected</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Deactivate Account</p>
              <p className="text-muted-foreground text-sm">
                Hide your profile and published games. Contact support to
                restore.
              </p>
            </div>
            <DeactivateAccountDialog authProviders={profile.authProviders}>
              <Button
                variant="destructive"
                size="sm"
              >
                Deactivate
              </Button>
            </DeactivateAccountDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}
