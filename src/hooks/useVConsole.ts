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
    if (typeof window !== 'undefined' && !window.vConsole) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/vconsole/dist/vconsole.min.js';
      script.async = true;
      
      script.onload = () => {
        // 初始化 VConsole
        const vConsole = new window.VConsole({
          theme: 'dark',
          maxLogNumber: 1000
        });
        window.vConsole = vConsole;
        setVConsoleReady(true);
      };

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