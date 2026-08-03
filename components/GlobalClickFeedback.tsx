'use client';

import { useState, useEffect } from "react";

export default function GlobalClickFeedback() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest('button, a, [role="button"], input[type="submit"], input[type="button"]');

      if (clickable) {
        setLoading(true);
        setProgress(30);

        if (timer) clearInterval(timer);

        // Animate progress up to 90%
        let currentProgress = 30;
        const interval = setInterval(() => {
          currentProgress += Math.random() * 15;
          if (currentProgress >= 90) {
            currentProgress = 90;
            clearInterval(interval);
          }
          setProgress(currentProgress);
        }, 120);

        // Auto hide after 800ms
        setTimeout(() => {
          clearInterval(interval);
          setProgress(100);
          setTimeout(() => {
            setLoading(false);
            setProgress(0);
          }, 200);
        }, 600);
      }
    };

    window.addEventListener('click', handleClick, true);
    return () => window.removeEventListener('click', handleClick, true);
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none">
      <div
        className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(59,130,246,0.8)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
