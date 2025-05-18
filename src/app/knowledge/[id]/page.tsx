'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { VideoPlayer } from '@/components/VideoPlayer';
import { VideoChapters } from '@/components/VideoChapters';
import { getVideoDetail } from '@/services/api';
import type { VideoDetail } from '@/services/api';

export default function VideoDetailPage() {
  const params = useParams();
  const [videoDetail, setVideoDetail] = useState<VideoDetail | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [leftWidth, setLeftWidth] = useState(40); // 初始宽度40%
  const containerRef = useRef<HTMLDivElement>(null);

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
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;
      
      // 计算百分比，并限制在30%到60%之间
      const newLeftWidth = Math.min(Math.max((mouseX / containerWidth) * 100, 30), 60);
      setLeftWidth(newLeftWidth);
    },
    [isDragging]
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

      {/* 两列内容区域 */}
      <div 
        ref={containerRef}
        className="flex gap-4 px-4 relative max-w-7xl mx-auto"
        style={{ 
          cursor: isDragging ? 'col-resize' : 'auto',
          height: 'calc(100vh - 116px)' // 减去标题区域的高度
        }}
      >
        {/* 左列 - 视频和章节 */}
        <div 
          className="space-y-4 h-full flex flex-col"
          style={{ width: `${leftWidth}%` }}
        >
          {/* 视频播放器 */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden flex-shrink-0">
            <VideoPlayer videoUrl={videoDetail.videoUrl} />
          </div>

          {/* 章节列表 */}
          <div className="bg-gray-800 rounded-lg p-4 flex-1 overflow-y-auto">
            <h2 className="text-white font-medium mb-4 sticky top-0 bg-gray-800 py-2">章节列表</h2>
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
          </div>
        </div>

        {/* 拖拽条 */}
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

        {/* 右列 - 亮点和思考 */}
        <div 
          className="h-full overflow-y-auto pr-4"
          style={{ width: `${100 - leftWidth}%` }}
        >
          <div className="space-y-6">
            {/* 亮点总结 */}
            {videoDetail.highlights.map((highlight, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">
                  {highlight.title}
                </h3>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  {highlight.content}
                </p>
                <div className="flex flex-wrap gap-2">
                  {highlight.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-700 text-sm text-blue-400 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* 思考问题 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">思考</h3>
              <ul className="space-y-3">
                {videoDetail.thoughts.map((thought, index) => (
                  <li
                    key={index}
                    className="flex items-center text-gray-300 hover:text-white"
                  >
                    <span className="mr-3">•</span>
                    {thought}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 