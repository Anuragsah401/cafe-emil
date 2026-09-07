'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface SmoothScrollProps {
  children: React.ReactNode;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProps) {
  const pathname = usePathname();

  // 1. GLOBAL FADE & REVEAL ON SCROLL OBSERVER (Runs on ALL devices & routes)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.querySelectorAll('.fade-up, .reveal-on-scroll, .fade-on-scroll').forEach((el) => {
        el.classList.add('is-in-view');
      });
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px', // Triggers visibly when item is 40px inside viewport
      }
    );

    const observeElements = () => {
      const targets = document.querySelectorAll(
        '.fade-up, .reveal-on-scroll, .fade-on-scroll, [data-reveal], section > div.max-w-7xl, section > div.max-w-4xl, .dish-card, .review-card, .category-chip'
      );

      targets.forEach((el) => {
        if (!el.classList.contains('fade-up')) {
          el.classList.add('fade-up');
        }

        const rect = el.getBoundingClientRect();
        // If element is already in the viewport on initial mount (e.g. Hero content), show it immediately
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('is-in-view');
        } else if (!el.classList.contains('is-in-view')) {
          revealObserver.observe(el);
        }
      });
    };

    observeElements();
    const timer1 = setTimeout(observeElements, 150);
    const timer2 = setTimeout(observeElements, 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      revealObserver.disconnect();
    };
  }, [pathname]);

  return <>{children}</>;
}
