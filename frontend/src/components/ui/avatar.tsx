'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
}

export function Avatar({ 
  src, 
  alt = 'Avatar',
  size = 48,
  className 
}: AvatarProps) {
  return (
    <div 
      className={cn(
        "relative rounded-full overflow-hidden bg-muted",
        className
      )}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 bg-muted flex items-center justify-center">
        <svg
          className="h-3/4 w-3/4 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
      {src && (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
} 