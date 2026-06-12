import Image from 'next/image';
import Link from 'next/link';
import { getAdsByPlacement } from '@/lib/server-api';

interface Props {
  placement: 'header' | 'sidebar' | 'in-article' | 'footer' | 'homepage-banner';
  className?: string;
  maxAds?: number;
}

// Aspect ratios & sizing per placement — keeps layout clean and prevents
// content jump (CLS) since the container size is fixed before the image loads.
const PLACEMENT_CONFIG: Record<string, {
  containerClass: string;
  imageClass: string;
  label: string;
  sizes: string;
}> = {
  'homepage-banner': {
    containerClass: 'w-full rounded-2xl overflow-hidden',
    imageClass: 'w-full aspect-[728/90] sm:aspect-[970/90] relative',
    label: 'Advertisement',
    sizes: '(max-width: 768px) 100vw, 970px',
  },
  header: {
    containerClass: 'w-full rounded-xl overflow-hidden',
    imageClass: 'w-full aspect-[728/90] relative',
    label: 'Advertisement',
    sizes: '(max-width: 768px) 100vw, 728px',
  },
  sidebar: {
    containerClass: 'w-full rounded-xl overflow-hidden',
    imageClass: 'w-full aspect-[300/250] relative',
    label: 'Advertisement',
    sizes: '300px',
  },
  'in-article': {
    containerClass: 'w-full max-w-2xl mx-auto rounded-xl overflow-hidden',
    imageClass: 'w-full aspect-[728/90] relative',
    label: 'Sponsored',
    sizes: '728px',
  },
  footer: {
    containerClass: 'w-full rounded-xl overflow-hidden',
    imageClass: 'w-full aspect-[728/90] relative',
    label: 'Advertisement',
    sizes: '(max-width: 768px) 100vw, 728px',
  },
};

/**
 * Server component — fetches ads directly from MongoDB during page render.
 * No client-side fetch, no loading flash, no layout shift.
 * Renders nothing (not even a wrapper div) if there are no active ads
 * for this placement, so disabled/empty placements take up zero space.
 */
export default async function AdBanner({ placement, className = '', maxAds = 1 }: Props) {
  const ads = await getAdsByPlacement(placement, maxAds);

  if (!ads || ads.length === 0) return null;

  const config = PLACEMENT_CONFIG[placement] || PLACEMENT_CONFIG['sidebar'];

  return (
    <div className={`ad-container ${className}`}>
      {(ads as any[]).map(ad => (
        <div key={String(ad._id)} className={config.containerClass}>
          <p className="text-[10px] text-gray-400 text-center mb-1 tracking-widest uppercase">
            {config.label}
          </p>
          <Link
            href={ad.linkUrl}
            target={ad.opensInNewTab ? '_blank' : '_self'}
            rel={ad.opensInNewTab ? 'noopener noreferrer sponsored' : undefined}
            className="block group"
            aria-label={ad.name}
          >
            <div className={`${config.imageClass} bg-gray-100 dark:bg-gray-800 overflow-hidden`}>
              <Image
                src={ad.imageUrl}
                alt={ad.name}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                sizes={config.sizes}
                unoptimized={ad.imageUrl.includes('?') || ad.imageUrl.startsWith('http')}
              />
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
