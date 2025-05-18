'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { VideoPlayer } from '@/components/VideoPlayer';
import { VideoChapters } from '@/components/VideoChapters';
import { getVideoDetail } from '@/services/api';
import type { VideoDetail } from '@/services/api';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { VideoContent } from '@/components/VideoContent';
import { VideoChat } from '@/components/VideoChat';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Resizer } from '@/components/ui/Resizer';
import { Tooltip } from '@/components/ui/Tooltip';

export default function VideoDetailPage() {
  const params = useParams();
  const [videoDetail, setVideoDetail] = useState<VideoDetail | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChapters, setShowChapters] = useState(true);

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
                            onClick={() => {/* 处理章节点击 */}}
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

          {/* 主要内容区域 */}
          <div className="flex-1 min-w-0">
            {!isMobileView ? (
              <Resizer defaultRatio={0.4} minRatio={0.3} maxRatio={0.7}>
                {/* 左侧：视频播放器和聊天区域 */}
                <div className="h-full flex flex-col gap-4">
                  {/* 视频播放器 */}
                  <div className="flex-none">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <VideoPlayer videoUrl={videoDetail.videoUrl} />
                    </div>
                  </div>
                  {/* 聊天区域 */}
                  <div className="flex-1 min-h-0 bg-gray-800 rounded-lg overflow-hidden">
                    <VideoChat className="h-full" />
                  </div>
                </div>

                {/* 右侧：内容区域 */}
                <div className="h-full pl-4">
                  <div className="h-full bg-gray-800 rounded-lg overflow-hidden">
                    <VideoContent
                      highlights={videoDetail.highlights}
                      thoughts={videoDetail.thoughts}
                      transcript={videoDetail.transcript}
                      mindmap={videoDetail.mindmap}
                    />
                  </div>
                </div>
              </Resizer>
            ) : (
              // 移动端布局
              <div className="h-full flex flex-col gap-4">
                {/* 移动端标题 */}
                <div className="flex-none bg-gray-800 rounded-lg p-4">
                  <Tooltip content={videoDetail.title}>
                    <h1 className="text-lg font-bold text-white mb-2">
                      {videoDetail.title}
                    </h1>
                  </Tooltip>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                    <span>发布于 {videoDetail.publishedAt}</span>
                    <span>时长 {videoDetail.duration}</span>
                    <span>更新于 {videoDetail.updatedAt}</span>
                  </div>
                </div>

                {/* 移动端章节切换按钮 */}
                {!showChapters && (
                  <button
                    onClick={() => setShowChapters(true)}
                    className="flex-none bg-gray-800 text-gray-400 hover:text-white p-2 rounded-lg flex items-center justify-center"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                    <span className="ml-2">显示章节列表</span>
                  </button>
                )}

                {/* 移动端章节列表 */}
                {showChapters && (
                  <div className="flex-none h-80 bg-gray-800 rounded-lg p-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium text-white">章节列表</h2>
                      <button
                        onClick={() => setShowChapters(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <ChevronLeftIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="h-[calc(100%-3rem)] overflow-y-auto">
                      <div className="space-y-2">
                        {videoDetail.chapters.map((chapter) => (
                          <Tooltip key={chapter.id} content={chapter.title}>
                            <div
                              className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg cursor-pointer"
                              onClick={() => {/* 处理章节点击 */}}
                            >
                              <div className="flex items-center">
                                <span className="text-gray-500 w-12">{chapter.time}</span>
                                <span className="flex-1 truncate">{chapter.title}</span>
                              </div>
                            </div>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 视频播放器 */}
                <div className="flex-none">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <VideoPlayer videoUrl={videoDetail.videoUrl} />
                  </div>
                </div>

                {/* 聊天区域 */}
                <div className="flex-1 min-h-0 bg-gray-800 rounded-lg overflow-hidden">
                  <VideoChat className="h-full" />
                </div>

                {/* 内容区域 */}
                <div className="flex-none bg-gray-800 rounded-lg overflow-hidden">
                  <VideoContent
                    highlights={videoDetail.highlights}
                    thoughts={videoDetail.thoughts}
                    transcript={videoDetail.transcript}
                    mindmap={videoDetail.mindmap}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 