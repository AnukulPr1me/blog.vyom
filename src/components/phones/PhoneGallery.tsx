'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Smartphone } from 'lucide-react';

interface Props { images: string[]; name: string; }

export default function PhoneGallery({ images, name }: Props) {
  const [active, setActive] = useState(0);
  const valid = images.filter(Boolean);

  if (valid.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300">
        <Smartphone size={64} />
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800">
        <Image
          src={valid[active]}
          alt={name}
          fill
          className="object-contain p-8"
          sizes="(max-width: 1024px) 100vw, 480px"
          unoptimized
          priority
        />
      </div>
      {valid.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {valid.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                i === active ? 'border-indigo-500' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
              }`}
            >
              <Image src={img} alt={`${name} ${i + 1}`} fill className="object-contain p-1.5" sizes="64px" unoptimized />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
