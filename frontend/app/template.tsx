'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div key={pathname} className="animate-page-enter min-h-screen relative">
      {/* Subtle top ambient red beam during page transition */}
      <div
        className={`fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emil-red to-transparent z-50 transition-opacity duration-500 pointer-events-none ${
          isTransitioning ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {children}
    </div>
  );
}
