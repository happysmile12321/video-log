'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { VideoPlayer } from '@/components/VideoPlayer';
import { VideoChapters } from '@/components/VideoChapters';
import { getVideoDetail } from '@/services/api';
import type { VideoDetail } from '@/services/api';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { VideoContent } from '@/components/VideoContent';

export default function VideoDetailPage() {
  const params = useParams();
  const [videoDetail, setVideoDetail] = useState<VideoDetail | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [leftWidth, setLeftWidth] = useState(40); // 初始宽度40%
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    
    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, []);

  useEffect(() => {
    const fetchVideoDetail = async () => {
      if (params.id) {
        const detail = await getVideoDetail(params.id as string);
        setVideoDetail(detail);
      }
    };
    fetchVideoDetail();
  }, [params.id]);

  // 处理拖拽
  const handleMouseDown = useCallback(() => {
    if (isMobileView) return;
    setIsDragging(true);
  }, [isMobileView]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current || isMobileView) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;
      
      // 计算百分比，并限制在30%到60%之间
      const newLeftWidth = Math.min(Math.max((mouseX / containerWidth) * 100, 30), 60);
      setLeftWidth(newLeftWidth);
    },
    [isDragging, isMobileView]
  );

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  if (!videoDetail) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-gray-400">加载中...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 标题和基本信息 */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">
          {videoDetail.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
          <span>发布于 {videoDetail.publishedAt}</span>
          <span>时长 {videoDetail.duration}</span>
          <span>更新于 {videoDetail.updatedAt}</span>
        </div>
      </div>

      {/* 内容区域 */}
      <div
        ref={containerRef}
        className={cn(
          "max-w-7xl mx-auto px-4",
          isMobileView ? "block" : "flex gap-4 relative"
        )}
        style={isMobileView ? undefined : { 
          cursor: isDragging ? 'col-resize' : 'auto',
          height: 'calc(100vh - 116px)' // 减去标题区域的高度
        }}
      >
        {/* 左列 - 视频和章节 */}
        <div 
          className={cn(
            "space-y-4",
            isMobileView ? "mb-4" : "h-full flex flex-col"
          )}
          style={isMobileView ? undefined : { width: `${leftWidth}%` }}
        >
          {/* 视频播放器 */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden flex-shrink-0">
            <VideoPlayer videoUrl={videoDetail.videoUrl} />
          </div>

          {/* 章节列表 */}
          <div className={cn(
            "bg-gray-800 rounded-lg p-4",
            isMobileView ? "max-h-[300px]" : "flex-1"
          )}>
            <h2 className="text-white font-medium mb-4 sticky top-0 bg-gray-800 py-2">章节列表</h2>
            <ScrollArea>
              <div className="space-y-2">
                {videoDetail.chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center">
                      <span className="text-gray-500 w-12">{chapter.time}</span>
                      <span className="flex-1 truncate">{chapter.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* 拖拽条 - 仅在非移动端显示 */}
        {!isMobileView && (
          <div
            className="w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize relative group h-full"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-gray-700 group-hover:bg-blue-500 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-0.5 h-4 bg-gray-400 rounded mx-0.5"></div>
                <div className="w-0.5 h-4 bg-gray-400 rounded mx-0.5"></div>
              </div>
            </div>
          </div>
        )}

        {/* 右列 - 内容区域 */}
        <div 
          className={cn(
            "space-y-4",
            isMobileView ? "" : "h-full pr-4"
          )}
          style={isMobileView ? undefined : { width: `${100 - leftWidth}%` }}
        >
          <VideoContent
            highlights={videoDetail.highlights}
            thoughts={videoDetail.thoughts}
            transcript={videoDetail.transcript}
            mindmap={videoDetail.mindmap}
          />
        </div>
      </div>
    </div>
  );
} 