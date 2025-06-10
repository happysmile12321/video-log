'use client';

import { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle, useLayoutEffect } from 'react';
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
    const blobUrlRef = useRef<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isInitializedRef = useRef(false);
    const mediaSourceRef = useRef<MediaSource | null>(null);
    const sourceBufferRef = useRef<SourceBuffer | null>(null);

    // Format video URL
    const formattedVideoUrl = useCallback((url: string) => {
      if (url.startsWith('http') || url.startsWith('/')) {
        return url;
      }
      if (url.startsWith('public/')) {
        return '/' + url.slice(7);
      }
      return '/' + url;
    }, []);

    // 清理函数
    const cleanup = useCallback(() => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      if (sourceBufferRef.current) {
        try {
          mediaSourceRef.current?.removeSourceBuffer(sourceBufferRef.current);
        } catch (e) {
          console.warn('移除 SourceBuffer 失败:', e);
        }
        sourceBufferRef.current = null;
      }
      if (mediaSourceRef.current) {
        if (mediaSourceRef.current.readyState === 'open') {
          mediaSourceRef.current.endOfStream();
        }
        mediaSourceRef.current = null;
      }
      isInitializedRef.current = false;
    }, []);

    // Initialize player
    useLayoutEffect(() => {
      if (!containerRef.current || isInitializedRef.current) return;

      // 在创建新实例前清理旧实例
      cleanup();

      try {
        const url = formattedVideoUrl(videoUrl);
        console.log('Loading video from:', url);

        // 检查是否支持 FLV
        const isFlv = url.toLowerCase().endsWith('.flv') || url.includes('video/x-flv');
        console.log('视频格式:', isFlv ? 'FLV' : '其他');

        if (isFlv && !flvjs.isSupported()) {
          throw new Error('当前浏览器不支持 FLV 格式');
        }

        // 创建播放器实例
        const createPlayer = async () => {
          if (!containerRef.current) return;

          try {
            setIsLoading(true);
            console.log('开始下载视频...');

            // 检查URL是否有效
            if (!url) {
              throw new Error('视频URL无效');
            }

            // 确保容器是空的
            containerRef.current.innerHTML = '';

            const options: any = {
              container: containerRef.current,
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
                  onSelect: function (item: { html: string; value: number }) {
                    if (playerRef.current) {
                      playerRef.current.playbackRate = item.value;
                    }
                    return item.html;
                  },
                },
              ],
              whitelist: ['*'],
              moreVideoAttr: {
                crossOrigin: 'anonymous',
                preload: 'auto',
              },
            };

            if (isFlv) {
              // FLV 格式使用流式加载
              options.url = url;
              options.customType = {
                flv: function (video: HTMLVideoElement, url: string) {
                  const flvPlayer = flvjs.createPlayer({
                    type: 'flv',
                    url: url,
                    isLive: false,
                    hasAudio: true,
                    hasVideo: true,
                    enableStashBuffer: true,
                    stashInitialSize: 128,
                    enableWorker: true,
                    lazyLoad: true,
                    seekType: 'range',
                  } as any);
                  flvPlayer.attachMediaElement(video);
                  flvPlayer.load();
                  return flvPlayer;
                },
              };
            } else {
              // 其他格式使用内存加载
              const response = await fetch(url, {
                headers: {
                  'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
                },
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const contentType = response.headers.get('content-type');
              console.log('视频Content-Type:', contentType);

              if (!contentType?.includes('video/')) {
                console.warn('警告：响应可能不是视频文件，Content-Type:', contentType);
              }

              const blob = await response.blob();
              console.log('视频下载完成，大小:', blob.size, 'bytes, 类型:', blob.type);

              if (blob.size === 0) {
                throw new Error('下载的视频文件为空');
              }

              const blobUrl = URL.createObjectURL(blob);
              blobUrlRef.current = blobUrl;
              options.url = blobUrl;
            }

            playerRef.current = new Artplayer(options);
            isInitializedRef.current = true;

            // 设置视频属性
            playerRef.current.on('ready', () => {
              console.log('播放器准备就绪');
              if (playerRef.current) {
                const video = playerRef.current.video;
                video.setAttribute('x5-video-player-type', 'h5');
                video.setAttribute('x5-video-player-fullscreen', 'true');
                video.setAttribute('x5-video-orientation', 'portraint');
                video.setAttribute('playsinline', 'true');
                video.setAttribute('webkit-playsinline', 'true');
              }
              setIsLoading(false);
            });

            // 添加事件监听
            playerRef.current.on('video:timeupdate', () => {
              if (onTimeUpdate && playerRef.current) {
                onTimeUpdate(playerRef.current.currentTime);
              }
            });

            playerRef.current.on('error', (error) => {
              console.error('播放器错误:', error);
              setError('视频播放失败，请检查视频文件格式或刷新页面重试');
              setIsLoading(false);
            });

            playerRef.current.on('video:error', (error) => {
              console.error('视频源错误:', error);
              const video = playerRef.current?.video;
              console.log('视频元素状态:', {
                error: video?.error,
                networkState: video?.networkState,
                readyState: video?.readyState,
                src: video?.src,
              });
              setError('视频源不支持或无法访问，请检查视频文件');
              setIsLoading(false);
            });

          } catch (error) {
            console.error('视频加载错误:', error);
            if (error instanceof Error) {
              setError(`视频加载失败: ${error.message}`);
            } else {
              setError('视频加载失败，请刷新页面重试');
            }
            setIsLoading(false);
          }
        };

        createPlayer();

        return cleanup;
      } catch (err) {
        console.error('播放器初始化失败:', err);
        setError('播放器初始化失败，请刷新页面重试');
        setIsLoading(false);
        return cleanup;
      }
    }, [videoUrl, onTimeUpdate, formattedVideoUrl, cleanup]);

    // 组件卸载时清理
    useEffect(() => {
      return cleanup;
    }, [cleanup]);

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