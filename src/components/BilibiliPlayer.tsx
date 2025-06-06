'use client';

import { useEffect, useRef, useState, forwardRef, useCallback } from 'react';
import DPlayer from 'dplayer';
import 'dplayer/dist/DPlayer.min.css';

interface Chapter {
  timeStart: string;
  timeEnd: string;
  content: string;
  children: Chapter[];
}

interface BilibiliPlayerProps {
  videoUrl: string;
  chapters?: Chapter[];
  onTimeUpdate?: (time: number) => void;
}

interface BilibiliPlayerHandle {
  handleChapterClick: (time: string) => void;
}

export const BilibiliPlayer = forwardRef<BilibiliPlayerHandle, BilibiliPlayerProps>(
  function BilibiliPlayer({ videoUrl, chapters = [], onTimeUpdate }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<DPlayer | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentChapter, setCurrentChapter] = useState<string | null>(null);

    // 处理章节点击
    const handleChapterClick = useCallback((timeString: string) => {
      if (!playerRef.current) return;
      
      const [minutes, seconds] = timeString.split(':').map(Number);
      const totalSeconds = minutes * 60 + seconds;
      
      try {
        playerRef.current.seek(totalSeconds);
        setCurrentChapter(timeString);
      } catch (error) {
        console.error('Failed to seek:', error);
      }
    }, []);

    // 暴露方法给父组件
    useEffect(() => {
      if (ref && typeof ref === 'object') {
        ref.current = {
          handleChapterClick
        };
      }
    }, [ref, handleChapterClick]);

    useEffect(() => {
      if (!containerRef.current) return;

      try {
        // 初始化DPlayer
        playerRef.current = new DPlayer({
          container: containerRef.current,
          video: {
            url: videoUrl,
            type: 'auto',
          },
          autoplay: false,
          theme: '#FADFA3',
          lang: 'zh-cn',
          hotkey: true,
          preload: 'auto',
          volume: 0.7,
          playbackSpeed: [0.5, 0.75, 1, 1.25, 1.5, 2],
        });

        // 监听事件
        playerRef.current.on('loadstart', () => setIsLoading(true));
        playerRef.current.on('loadeddata', () => setIsLoading(false));
        playerRef.current.on('error', () => {
          console.error('Video error');
          setError('视频加载失败，请刷新页面重试');
          setIsLoading(false);
        });
        playerRef.current.on('timeupdate', () => {
          if (onTimeUpdate && playerRef.current) {
            onTimeUpdate(playerRef.current.video.currentTime);
          }
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize DPlayer:', err);
        setError('播放器初始化失败，请刷新页面重试');
        setIsLoading(false);
      }

      return () => {
        if (playerRef.current) {
          playerRef.current.destroy();
        }
      };
    }, [videoUrl, onTimeUpdate]);

    return (
      <div className="flex flex-1">
        {/* 视频播放器 */}
        <div className="flex-1 relative bg-black">
          <div ref={containerRef} className="w-full h-full" />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
              <div className="text-white">加载中...</div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
              <div className="text-white text-center px-4">
                <div className="mb-2">{error}</div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  刷新页面
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 章节列表 */}
        {chapters.length > 0 && (
          <div className="w-64 bg-gray-800 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-white font-medium mb-4">章节列表</h3>
              <div className="space-y-2">
                {chapters.map((chapter, index) => (
                  <button
                    key={`chapter-${index}`}
                    onClick={() => handleChapterClick(chapter.timeStart)}
                    className={`w-full text-left p-2 rounded transition-colors group
                      ${currentChapter === chapter.timeStart 
                        ? 'bg-gray-700 text-white' 
                        : 'hover:bg-gray-700'}`}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className={`${currentChapter === chapter.timeStart 
                        ? 'text-white' 
                        : 'text-gray-300 group-hover:text-white'}`}>
                        {chapter.content}
                      </span>
                      <span className={`${currentChapter === chapter.timeStart
                        ? 'text-gray-300'
                        : 'text-gray-400 group-hover:text-gray-300'}`}>
                        {chapter.timeStart}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
); 