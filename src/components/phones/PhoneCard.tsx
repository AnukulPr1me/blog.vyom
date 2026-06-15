import Link from 'next/link';
import Image from 'next/image';
import { Star, Smartphone } from 'lucide-react';
import type { Phone } from '@/types';

interface Props { phone: Phone; }

export default function PhoneCard({ phone }: Props) {
  return (
    <Link
      href={`/phones/${phone.slug}`}
      className="group card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-square bg-gray-50 dark:bg-gray-800">
        {phone.images?.[0] ? (
          <Image
            src={phone.images[0]}
            alt={`${phone.brand} ${phone.name}`}
            fill
            className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Smartphone size={40} />
          </div>
        )}
        {phone.isFeatured && (
          <span className="absolute top-3 left-3 badge-blue text-[10px]">Featured</span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{phone.brand}</p>
        <h3 className="mt-0.5 font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" style={{ fontFamily: 'var(--font-syne)' }}>
          {phone.name}
        </h3>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-lg font-black text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>
            {phone.currency}{phone.price.toLocaleString()}
          </span>
          {phone.rating != null && (
            <span className="flex items-center gap-1 text-sm font-semibold text-gray-600 dark:text-gray-300">
              <Star size={13} className="text-yellow-400 fill-yellow-400" />
              {phone.rating}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
