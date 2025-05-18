import { useCallback, useEffect, useState, useRef } from 'react';

interface ResizerProps {
  children: [React.ReactNode, React.ReactNode];
  defaultRatio?: number;
  minRatio?: number;
  maxRatio?: number;
  className?: string;
}

export function Resizer({
  children,
  defaultRatio = 0.4, // 默认比例为 40%
  minRatio = 0.3, // 最小 30%
  maxRatio = 0.7, // 最大 70%
  className = '',
}: ResizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(defaultRatio);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing && containerRef.current) {
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const mouseX = e.clientX - containerRect.left;
        
        // 计算新的比例
        let newRatio = mouseX / containerWidth;
        
        // 限制比例范围
        newRatio = Math.max(minRatio, Math.min(maxRatio, newRatio));
        
        setRatio(newRatio);
      }
    },
    [isResizing, minRatio, maxRatio]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  return (
    <div ref={containerRef} className={`flex h-full relative ${className}`}>
      <div 
        style={{ 
          width: `${ratio * 100}%`,
          transition: isResizing ? 'none' : 'width 0.1s ease'
        }}
        className="h-full"
      >
        {children[0]}
      </div>
      <div
        className={`absolute top-0 bottom-0 w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors ${
          isResizing ? 'bg-blue-500' : ''
        }`}
        style={{
          left: `${ratio * 100}%`,
          transform: 'translateX(-50%)',
        }}
        onMouseDown={startResizing}
      />
      <div style={{ width: `${(1 - ratio) * 100}%` }} className="h-full">
        {children[1]}
      </div>
    </div>
  );
} 