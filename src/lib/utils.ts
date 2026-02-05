import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Resolves an asset URL returned by the API.
 * The API returns relative paths (e.g. "avatars/abc.png"). This function
 * prepends the API base URL so the browser can fetch the file.
 * Already-absolute URLs (http/https/data:) are returned unchanged.
 */
export function resolveAssetUrl(
  url: string | null | undefined,
): string | undefined {
  if (!url) return undefined;
  if (
    url.startsWith('http') ||
    url.startsWith('data:') ||
    url.startsWith('/')
  ) {
    return url;
  }
  const base = process.env.NEXT_PUBLIC_API ?? process.env.API ?? '';
  return `${base}/${url}`;
}
