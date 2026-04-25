'use client';

import * as React from 'react';
import { Waves } from 'lucide-react';

interface ArticleBrandingBarProps {
  fileNo: string;
}

export function ArticleBrandingBar({ fileNo }: ArticleBrandingBarProps) {
  return (
    <div className="absolute top-0 left-0 w-full px-12 py-8 flex items-center justify-between pointer-events-none z-50">
       <div className="flex items-center gap-4 opacity-50">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
             <Waves className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
             <span className="text-[8px] font-bold text-white uppercase tracking-wider leading-none">Borisao</span>
             <span className="text-[10px] font-bold text-primary uppercase tracking-wider leading-none">Archives</span>
          </div>
       </div>
       <div className="text-[8px] font-bold text-white/20 uppercase tracking-wider">
          File No. {fileNo}
       </div>
    </div>
  );
}
