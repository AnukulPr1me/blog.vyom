import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import slugifyLib from 'slugify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function makeSlug(text: string): string {
  return slugifyLib(text, { lower: true, strict: true, trim: true });
}

export function calcReadingTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function generateExcerpt(content: string, length = 160): string {
  const plain = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return plain.length <= length ? plain : plain.slice(0, length).trim() + '…';
}

export function formatDate(date: string | Date | undefined): string {
  if (!date) return '';
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateLong(date: string | Date | undefined): string {
  if (!date) return '';
  return format(new Date(date), 'MMMM d, yyyy');
}

export function formatRelative(date: string | Date | undefined): string {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function readingTimeLabel(min: number): string {
  return `${min} min read`;
}

export function truncate(str: string, len = 120): string {
  if (!str) return '';
  return str.length <= len ? str : str.slice(0, len).trim() + '…';
}

export function absoluteUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://vyom.quest').replace(/\/$/, '');
  return `${base}${path}`;
}

export function shareUrl(platform: string, url: string, title: string): string {
  const e = encodeURIComponent;
  const map: Record<string, string> = {
    twitter: `https://twitter.com/intent/tweet?url=${e(url)}&text=${e(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}`,
    whatsapp: `https://wa.me/?text=${e(title + ' ' + url)}`,
    reddit: `https://reddit.com/submit?url=${e(url)}&title=${e(title)}`,
  };
  return map[platform] || url;
}

/**
 * Detect a video URL and return an embeddable iframe src, or null if not a
 * recognized video link. Supports YouTube, Vimeo, and direct video files
 * (.mp4, .webm, .ogg).
 */
export function parseVideoUrl(url: string): { type: 'youtube' | 'vimeo' | 'file'; embedUrl: string } | null {
  const trimmed = url.trim();

  // YouTube: youtube.com/watch?v=, youtu.be/, youtube.com/shorts/, youtube.com/embed/
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }

  // Vimeo: vimeo.com/12345678
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  // Direct video file
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(trimmed)) {
    return { type: 'file', embedUrl: trimmed };
  }

  return null;
}
