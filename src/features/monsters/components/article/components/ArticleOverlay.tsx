'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export function ArticleOverlay() {
  const router = useRouter();
  
  return (
    <div 
      className="absolute inset-0 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-500 cursor-pointer"
      onClick={() => router.back()}
    />
  );
}
