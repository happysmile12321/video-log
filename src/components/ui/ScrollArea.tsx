import React from 'react';
import { cn } from '@/lib/utils';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          className
        )}
        {...props}
      >
        <div className="h-full hover-scrollbar custom-scrollbar">
          {children}
        </div>
      </div>
    );
  }
);

ScrollArea.displayName = 'ScrollArea'; 