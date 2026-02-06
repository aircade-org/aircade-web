'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Copy, File, FileImage, FileMusic, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import type { GameAsset } from '@/types/game';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import * as gameService from '@/services/game';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AssetIcon({ fileType }: { fileType: string }) {
  if (fileType.startsWith('image/'))
    return <FileImage className="size-4 shrink-0" />;
  if (fileType.startsWith('audio/'))
    return <FileMusic className="size-4 shrink-0" />;
  return <File className="size-4 shrink-0" />;
}

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

interface AssetBrowserProps {
  gameId: string;
  /** Called with the asset URL to insert into the editor */
  onInsert: (url: string) => void;
}

export function AssetBrowser({ gameId, onInsert }: AssetBrowserProps) {
  const [assets, setAssets] = useState<GameAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await gameService.getGameAssets(gameId);
      setAssets(data.data);
    } catch (_err) {
      toast.error('Failed to load assets.');
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleUpload = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Unsupported file type.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum 5 MB.');
      return;
    }
    setIsUploading(true);
    try {
      const { data: asset } = await gameService.uploadGameAsset(gameId, file);
      setAssets((prev) => [asset, ...prev]);
      toast.success(`${file.name} uploaded.`);
    } catch (_err) {
      toast.error('Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  const handleDelete = async (assetId: string) => {
    setDeletingIds((prev) => new Set(prev).add(assetId));
    try {
      await gameService.deleteGameAsset(gameId, assetId);
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

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success('URL copied to clipboard.');
    });
  };

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Assets</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="size-3.5" />
          {isUploading ? 'Uploading…' : 'Upload'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      <p className="text-muted-foreground text-xs">
        Click an asset URL to insert it, or drag to copy.
      </p>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-10 rounded-lg"
              />
            ))}
          </div>
        )}

        {!isLoading && assets.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-xs">
            No assets yet.
          </p>
        )}

        {!isLoading && assets.length > 0 && (
          <div className="space-y-1">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="hover:bg-accent group flex items-center gap-2 rounded-md p-2 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', asset.storageUrl);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
              >
                <AssetIcon fileType={asset.fileType} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">
                    {asset.fileName}
                  </p>
                  <p className="text-muted-foreground text-[10px]">
                    {formatBytes(asset.fileSize)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onInsert(asset.storageUrl)}
                        className="size-6"
                      >
                        <Copy className="size-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Insert URL</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleCopyUrl(asset.storageUrl)}
                        className="size-6"
                        title="Copy URL"
                      >
                        <File className="size-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Copy URL</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={deletingIds.has(asset.id)}
                        onClick={() => handleDelete(asset.id)}
                        className="text-muted-foreground hover:text-destructive size-6"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Delete</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
