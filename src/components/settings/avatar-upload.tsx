'use client';

import { useRef, useState } from 'react';

import { Upload, X } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

import * as userService from '@/services/user';

import { useAuthStore } from '@/store/auth';

interface AvatarUploadProps {
  onUploadSuccess?: (avatarUrl: string) => void;
  onDeleteSuccess?: () => void;
}

export function AvatarUpload({
  onUploadSuccess,
  onDeleteSuccess,
}: AvatarUploadProps) {
  const user = useAuthStore((state) => state.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'image/png',
      'image/jpeg',
      'image/svg+xml',
      'image/gif',
    ];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PNG, JPG, SVG, or GIF image');
      return;
    }

    // Validate file size (2 MB max)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 2 MB');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    handleUpload(file);
  }

  async function handleUpload(file: File) {
    setIsUploading(true);
    setError(null);

    try {
      const { data } = await userService.uploadAvatar(file);
      setPreviewUrl(null);
      onUploadSuccess?.(data.avatarUrl);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to upload avatar';
      setError(errorMessage);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      await userService.deleteAvatar();
      setPreviewUrl(null);
      onDeleteSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete avatar';
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }

  function getInitials() {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.username.slice(0, 2).toUpperCase() ?? '??';
  }

  const currentAvatarUrl = previewUrl || user?.avatarUrl;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-32 w-32">
          <AvatarImage
            src={currentAvatarUrl ?? undefined}
            alt="Profile"
          />
          <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
        </Avatar>
        {(isUploading || isDeleting) && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <Spinner className="h-8 w-8 text-white" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isDeleting}
        >
          <Upload className="mr-2 h-4 w-4" />
          {currentAvatarUrl ? 'Change Avatar' : 'Upload Avatar'}
        </Button>

        {currentAvatarUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isUploading || isDeleting}
          >
            <X className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/gif"
        className="hidden"
        onChange={handleFileSelect}
      />

      {error && <p className="text-destructive text-sm">{error}</p>}

      <p className="text-muted-foreground text-center text-xs">
        PNG, JPG, SVG, or GIF. Max 2 MB.
      </p>
    </div>
  );
}
