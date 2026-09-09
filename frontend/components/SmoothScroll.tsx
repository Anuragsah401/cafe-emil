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
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px',
      }
    );

    const checkAndObserve = () => {
      const targets = document.querySelectorAll('.fade-up, .reveal-on-scroll, .fade-on-scroll');

      targets.forEach((el) => {
        if (el.classList.contains('is-in-view')) return;

        const rect = el.getBoundingClientRect();
        // If element is already in the viewport, make it visible immediately
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('is-in-view');
        } else {
          revealObserver.observe(el);
        }
      });
    };

    checkAndObserve();
    const timer1 = setTimeout(checkAndObserve, 150);
    const timer2 = setTimeout(checkAndObserve, 600);

    // Watch for DOM mutations (debounced to avoid layout thrashing)
    let mutationTimer: ReturnType<typeof setTimeout> | null = null;
    const mutationObserver = new MutationObserver(() => {
      if (mutationTimer) clearTimeout(mutationTimer);
      mutationTimer = setTimeout(() => {
        requestAnimationFrame(checkAndObserve);
      }, 120);
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (mutationTimer) clearTimeout(mutationTimer);
      revealObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return <>{children}</>;
}
