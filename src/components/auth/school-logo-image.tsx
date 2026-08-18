'use client';

import { useState } from 'react';

export function SchoolLogoImage({ src, alt, className, schoolName = 'School' }: { src: string; alt: string; className: string; schoolName?: string }) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    // Show initials fallback
    const initials = schoolName
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();

    return (
      <div className="flex items-center justify-center h-32 w-32 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 text-white font-bold text-3xl shadow-lg">
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
    />
  );
}
