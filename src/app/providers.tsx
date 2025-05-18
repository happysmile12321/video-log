'use client';

import { TooltipProvider } from '@radix-ui/react-tooltip';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      {children}
    </TooltipProvider>
  );
} 