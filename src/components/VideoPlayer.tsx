'use client';

import { useEffect, useRef } from 'react';
import DPlayer from 'dplayer';
import '@/styles/dplayer.css';

interface VideoPlayerProps {
  videoUrl: string;
}

export function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<DPlayer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 初始化 DPlayer
    playerRef.current = new DPlayer({
      container: containerRef.current,
      video: {
        url: videoUrl,
        type: 'auto',
      },
      autoplay: false,
      theme: '#FADFA3',
      lang: 'zh-cn',
      screenshot: true,
      hotkey: true,
      preload: 'auto',
      volume: 0.7,
      playbackSpeed: [0.5, 0.75, 1, 1.25, 1.5, 2],
      contextmenu: [
        {
          text: '哔哩哔哩',
          link: 'https://www.bilibili.com',
        },
        {
          text: 'BibiGPT',
          link: 'https://bibigpt.co',
        },
      ],
      highlight: [
        {
          time: 10,
          text: '这是第一个亮点',
        },
        {
          time: 20,
          text: '这是第二个亮点',
        },
      ],
    });

    // 清理函数
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoUrl]);

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
} 