// src/components/shared/ResponsiveImage.tsx
"use client"; // This is a Client Component

import Image from "next/image";
import { useState } from "react";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function ResponsiveImage({
  src,
  alt,
  width = 64,
  height = 64,
  className,
}: ResponsiveImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [error, setError] = useState(false);

  // Fallback image URL
  const fallbackImageUrl = `https://placehold.co/${width}x${height}/E0E0E0/333333?text=No+Image`;

  const handleError = () => {
    if (!error) {
      // Prevent infinite loops
      setImageSrc(fallbackImageUrl);
      setError(true);
    }
  };

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      // Optional: Add loading="lazy" for performance
      loading="lazy"
    />
  );
}
