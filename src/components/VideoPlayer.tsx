'use client';

import { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import Artplayer from 'artplayer';
import '@/styles/artplayer.css';
import flvjs from 'flv.js';

interface Chapter {
  id: string;
  time: string;
  title: string;
  content: string;
}

interface VideoPlayerProps {
  videoUrl: string;
  chapters?: Chapter[];
  onTimeUpdate?: (currentTime: number) => void;
}

export interface VideoPlayerHandle {
  handleChapterClick: (time: string) => void;
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer({ videoUrl, onTimeUpdate }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<Artplayer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Format video URL
    const formattedVideoUrl = useCallback((url: string) => {
      // If it's already an absolute URL or starts with /, return as is
      if (url.startsWith('http') || url.startsWith('/')) {
        return url;
      }
      // If it's a relative path in public folder, add leading /
      if (url.startsWith('public/')) {
        return '/' + url.slice(7);
      }
      return '/' + url;
    }, []);

    // Initialize player
    useEffect(() => {
      if (!containerRef.current) return;

      try {
        const url = formattedVideoUrl(videoUrl);
        console.log('Loading video from:', url); // Debug log

        playerRef.current = new Artplayer({
          container: containerRef.current,
          url,
          volume: 0.7,
          autoplay: false,
          pip: true,
          screenshot: true,
          setting: true,
          playbackRate: true,
          fullscreen: true,
          miniProgressBar: true,
          theme: '#FADFA3',
          lang: 'zh-cn',
          muted: false,
          icons: {
            loading: '<img src="/loading.gif" width="40" height="40">',
            play: '<img src="/play.svg" width="24" height="24" style="filter: brightness(1);">',
            pause: '<img src="/pause.svg" width="24" height="24" style="filter: brightness(1);">',
          },
          settings: [
            {
              html: '播放速度',
              selector: [
                { html: '0.5x', value: 0.5 },
                { html: '0.75x', value: 0.75 },
                { html: '正常', value: 1, default: true },
                { html: '1.25x', value: 1.25 },
                { html: '1.5x', value: 1.5 },
                { html: '2x', value: 2 },
              ],
              onSelect: function (item) {
                if (playerRef.current) {
                  playerRef.current.playbackRate = item.value;
                }
                return item.html;
              },
            },
          ],
        });

        // Event listeners
        playerRef.current.on('ready', () => {
          console.log('Video player ready'); // Debug log
          setIsLoading(false);
        });

        playerRef.current.on('error', (error) => {
          console.error('Video error:', error); // Debug log
          setError('视频加载失败，请检查视频文件格式或刷新页面重试');
          setIsLoading(false);
        });

        playerRef.current.on('video:error', (error) => {
          console.error('Video source error:', error); // Debug log
          setError('视频源不支持或无法访问，请检查视频文件');
          setIsLoading(false);
        });

        playerRef.current.on('video:timeupdate', () => {
          if (onTimeUpdate && playerRef.current) {
            onTimeUpdate(playerRef.current.currentTime);
          }
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize Artplayer:', err);
        setError('播放器初始化失败，请刷新页面重试');
        setIsLoading(false);
      }

      let flvPlayer;
      if (videoUrl && videoUrl.endsWith('.flv') && flvjs.isSupported()) {
        const video = document.querySelector('video');
        if (video) {
          flvPlayer = flvjs.createPlayer({
            type: 'flv',
            url: videoUrl,
          });
          flvPlayer.attachMediaElement(video);
          flvPlayer.load();
        }
      }

      return () => {
        if (playerRef.current) {
          playerRef.current.destroy();
        }
        if (flvPlayer) {
          flvPlayer.destroy();
        }
      };
    }, [videoUrl, onTimeUpdate, formattedVideoUrl]);

    // Handle chapter click
    const handleChapterClick = useCallback((timeString: string) => {
      if (!playerRef.current) return;
      
      // Split the time string into parts
      const timeParts = timeString.split(':').map(Number);
      
      // Calculate total seconds based on the number of parts
      let totalSeconds = 0;
      if (timeParts.length === 3) {
        // HH:MM:SS format
        totalSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
      } else if (timeParts.length === 2) {
        // MM:SS format
        totalSeconds = timeParts[0] * 60 + timeParts[1];
      } else {
        console.error('Invalid time format:', timeString);
        return;
      }
      
      try {
        playerRef.current.currentTime = totalSeconds;
      } catch (error) {
        console.error('Failed to seek:', error);
      }
    }, []);

    // Expose the handleChapterClick method via ref
    useImperativeHandle(ref, () => ({
      handleChapterClick
    }), [handleChapterClick]);

    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-1">
          {/* Video player */}
          <div className="flex-1 relative bg-black min-w-0">
            <div ref={containerRef} className="w-full h-full absolute inset-0" />
            
            {/* Loading state */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="text-white">加载中...</div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
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
        </div>
      </div>
    );
  }
); 