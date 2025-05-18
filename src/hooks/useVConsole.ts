'use client';

import { useEffect, useState } from 'react';
import type { VConsoleConstructor, VConsoleInstance } from '@/types/vconsole';

declare global {
  interface Window {
    VConsole: VConsoleConstructor;
    vConsole: VConsoleInstance;
  }
}

export const useVConsole = () => {
  const [vConsoleReady, setVConsoleReady] = useState(false);

  useEffect(() => {
    const initVConsole = () => {
      if (typeof window !== 'undefined' && !window.vConsole && window.VConsole) {
        try {
          const vConsole = new window.VConsole({
            theme: 'dark',
            maxLogNumber: 1000
          });
          window.vConsole = vConsole;
          setVConsoleReady(true);
        } catch (error) {
          console.error('VConsole initialization failed:', error);
        }
      }
    };

    if (typeof window !== 'undefined' && !window.vConsole) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/vconsole@latest/dist/vconsole.min.js';
      script.async = true;
      
      script.onload = initVConsole;
      
      document.body.appendChild(script);

      return () => {
        if (window.vConsole) {
          window.vConsole.destroy();
        }
        document.body.removeChild(script);
      };
    }
  }, []);

  return { vConsoleReady };
}; 