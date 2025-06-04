import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  code: string;
  className?: string;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    setError(null);
    // 只提取 mermaid 代码块内容，不做任何自动修复
    const match = code.match(/```mermaid\s*([\s\S]*?)```/);
    const diagram = match ? match[1] : code;
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    mermaid.initialize({ startOnLoad: false, theme: 'dark' });
    mermaid.render('mermaid-svg', diagram)
      .then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      })
      .catch((err) => {
        setError(err?.message || 'Mermaid 渲染失败');
      });
  }, [code]);

  return (
    <div className={className}>
      {error ? (
        <div className="text-red-400 bg-gray-900 p-4 rounded">Mermaid 渲染失败: {error}</div>
      ) : (
        <div ref={containerRef} />
      )}
    </div>
  );
}; 