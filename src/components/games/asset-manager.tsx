'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  File,
  FileImage,
  FileMusic,
  ImageIcon,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

import type { GameAsset } from '@/types/game';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { useGameStore } from '@/store/game';

const ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'image/gif',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'font/ttf',
  'font/woff2',
];

const MAX_SIZE_MB = 5;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AssetIcon({ fileType }: { fileType: string }) {
  if (fileType.startsWith('image/')) return <FileImage className="size-5" />;
  if (fileType.startsWith('audio/')) return <FileMusic className="size-5" />;
  return <File className="size-5" />;
}

interface AssetManagerProps {
  gameId: string;
}

export function AssetManager({ gameId }: AssetManagerProps) {
  const getGameAssets = useGameStore((s) => s.getGameAssets);
  const uploadGameAsset = useGameStore((s) => s.uploadGameAsset);
  const deleteGameAsset = useGameStore((s) => s.deleteGameAsset);

  const [assets, setAssets] = useState<GameAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAssets = useCallback(async () => {
    try {
      const result = await getGameAssets(gameId);
      setAssets(result.data);
    } catch (_err) {
      toast.error('Failed to load assets.');
    } finally {
      setIsLoading(false);
    }
  }, [gameId, getGameAssets]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleUpload = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(
        'Unsupported file type. Allowed: PNG, JPG, SVG, GIF, MP3, WAV, OGG, TTF, WOFF2.',
      );
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`);
      return;
    }
    setIsUploading(true);
    try {
      const asset = await uploadGameAsset(gameId, file);
      setAssets((prev) => [asset, ...prev]);
      toast.success(`${file.name} uploaded.`);
    } catch (_err) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDelete = async (assetId: string) => {
    setDeletingIds((prev) => new Set(prev).add(assetId));
    try {
      await deleteGameAsset(gameId, assetId);
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
      toast.success('Asset deleted.');
    } catch (_err) {
      toast.error('Failed to delete asset.');
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(assetId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          onChange={handleFileInput}
          disabled={isUploading}
        />
        <ImageIcon className="text-muted-foreground mb-2 size-8" />
        <p className="text-sm font-medium">
          {isUploading ? 'Uploading…' : 'Drop a file or click to upload'}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          PNG, JPG, SVG, GIF, MP3, WAV, OGG, TTF, WOFF2 — max {MAX_SIZE_MB} MB
        </p>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-14 w-full rounded-lg"
            />
          ))}
        </div>
      )}

      {!isLoading && assets.length === 0 && (
        <p className="text-muted-foreground py-4 text-center text-sm">
          No assets uploaded yet.
        </p>
      )}

      {!isLoading && assets.length > 0 && (
        <div className="space-y-2">
          {assets.map((asset) => (
            <Card key={asset.id}>
              <CardContent className="flex items-center gap-3 py-3">
                <div className="text-muted-foreground shrink-0">
                  <AssetIcon fileType={asset.fileType} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {asset.fileName}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {asset.fileType} · {formatBytes(asset.fileSize)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={deletingIds.has(asset.id)}
                  onClick={() => handleDelete(asset.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete {asset.fileName}</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {assets.length > 0 && (
        <p className="text-muted-foreground text-xs">
          {assets.length} asset{assets.length !== 1 ? 's' : ''}
        </p>
      )}

      {isUploading && (
        <Button
          variant="outline"
          disabled
          className="w-full"
        >
          <Upload className="size-4" />
          Uploading…
        </Button>
      )}
    </div>
  );
}
