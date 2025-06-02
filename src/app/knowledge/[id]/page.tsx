'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { VideoPlayer } from '@/components/VideoPlayer';
import { getVideoDetail } from '@/services/api';
import type { VideoDetail } from '@/services/api';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { VideoContent } from '@/components/VideoContent';
import { VideoChat } from '@/components/VideoChat';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Resizer } from '@/components/ui/Resizer';
import { Tooltip } from '@/components/ui/Tooltip';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function VideoDetailPage() {
  const params = useParams();
  const [videoDetail, setVideoDetail] = useState<VideoDetail | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChapters, setShowChapters] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const videoPlayerRef = useRef<{ handleChapterClick: (time: string) => void }>(null);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
      setShowChapters(!isMobileView);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    
    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, [isMobileView]);

  useEffect(() => {
    const fetchVideoDetail = async () => {
      if (params.id) {
        const detail = await getVideoDetail(params.id as string);
        setVideoDetail(detail);
      }
    };
    fetchVideoDetail();
  }, [params.id]);

  if (!videoDetail) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-gray-400">加载中...</div>
    </div>;
  }

    const handleChapterClick = (time: string) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.handleChapterClick(time);
    }
  };

  const handleTimeClick = (timestamp: number) => {
    if (videoPlayerRef.current) {
      // Convert timestamp to time string (MM:SS format)
      const minutes = Math.floor(timestamp / 60);
      const seconds = Math.floor(timestamp % 60);
      const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      videoPlayerRef.current.handleChapterClick(timeString);
    }
  };

  const handleDownload = () => {
    if (videoDetail?.videoUrl) {
      // 创建一个临时的 a 标签来触发下载
      const link = document.createElement('a');
      link.href = videoDetail.videoUrl;
      link.download = `${videoDetail.title}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col md:h-screen md:overflow-hidden">
      {/* 主内容区域 */}
      <main className="flex-1 px-4 pb-4 md:min-h-0">
        <div className="h-full max-w-[1920px] mx-auto flex flex-col md:flex-row gap-4">
          {/* 左侧章节列表 */}
          {!isMobileView && (
            <aside className="w-64 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden">
              <div className="h-full flex flex-col">
                {/* 标题信息 */}
                <div className="flex-none p-4 border-b border-gray-700">
                  <Tooltip content={videoDetail.title}>
                    <div className="text-lg font-bold text-white mb-2 line-clamp-2">
                      {videoDetail.title}
                    </div>
                  </Tooltip>
                  <div className="flex flex-col gap-1 text-xs text-gray-400">
                    <span>发布于 {videoDetail.publishedAt}</span>
                    <span>时长 {videoDetail.duration}</span>
                    <span>更新于 {videoDetail.updatedAt}</span>
                  </div>
                </div>
                {/* 章节标题 */}
                <div className="flex-none p-4 border-b border-gray-700">
                  <h2 className="text-lg font-medium text-white">章节列表</h2>
                </div>
                {/* 章节列表 */}
                <div className="flex-1 min-h-0 px-4 pb-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-2">
                      {videoDetail.chapters.map((chapter) => (
                        <Tooltip key={chapter.id} content={chapter.title}>
                          <div
                            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg cursor-pointer"
                            onClick={() => handleChapterClick(chapter.time)}
                          >
                            <div className="flex items-center">
                              <span className="text-gray-500 w-12">{chapter.time}</span>
                              <span className="flex-1 truncate">{chapter.title}</span>
                            </div>
                          </div>
                        </Tooltip>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </aside>
          )}

          {/* 中间区域和右侧内容区域 */}
          <Resizer defaultRatio={0.4} minRatio={0.35} maxRatio={0.45} className="flex-1">
            {/* 视频播放器和聊天区域 */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              {/* 视频播放器 */}
              <div className="flex-none bg-black rounded-lg overflow-hidden p-4 relative group hover:shadow-2xl transition-all duration-300">
                {/* 装饰元素 */}
                <div className="absolute top-1/2 -right-4 w-4 h-4 bg-yellow-500 rounded-full opacity-50 animate-spin" />
                
                <div className="aspect-video bg-black rounded-lg overflow-hidden transform group-hover:scale-[1.02] transition-transform duration-300">
                  <VideoPlayer
                    ref={videoPlayerRef}
                    videoUrl={videoDetail.videoUrl}
                    chapters={videoDetail.chapters}
                    onTimeUpdate={setCurrentTime}
                  />
                </div>
                {/* 下载按钮 */}
                <Tooltip content="下载视频">
                  <button
                    onClick={handleDownload}
                    className="absolute top-6 right-6 p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors duration-200"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5 text-white" />
                  </button>
                </Tooltip>
              </div>
              {/* 聊天区域 */}
              <div className="flex-1 min-h-0 bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <VideoChat className="h-full" />
              </div>
            </div>

            {/* 右侧内容区域 */}
            <div className="h-full bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <VideoContent
                highlights={videoDetail.highlights}
                thoughts={videoDetail.thoughts}
                subtitles={videoDetail.subtitles}
                currentTime={currentTime}
                onTimeClick={handleTimeClick}
              />
            </div>
          </Resizer>
        </div>
      </main>

      {/* 移动端底部导航 */}
      {isMobileView && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-2">
          <div className="flex justify-around">
            <button
              onClick={() => setShowChapters(true)}
              className="flex items-center text-gray-400 hover:text-white"
            >
              <ChevronRightIcon className="w-5 h-5" />
              <span className="ml-1">章节</span>
            </button>
            <button className="flex items-center text-gray-400 hover:text-white">
              <span>聊天</span>
            </button>
            <button className="flex items-center text-gray-400 hover:text-white">
              <span>内容</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 