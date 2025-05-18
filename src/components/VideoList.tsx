'use client';

import { useState } from 'react';
import { Video } from '@/services/api';
import { VideoGrid } from './VideoGrid';
import { Squares2X2Icon as ViewGridIcon, ListBulletIcon as ViewListIcon } from '@heroicons/react/24/outline';

interface VideoListProps {
  videos: Video[];
  totalCount: number;
  totalDuration: string;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function VideoList({
  videos,
  totalCount,
  totalDuration,
  currentPage,
  pageSize,
  onPageChange
}: VideoListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="space-y-6">
      {/* Header with stats and view mode toggle */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="text-sm text-gray-500">
          共 {totalCount} 个视频，总时长 {totalDuration}
        </div>
        <div className="flex items-center space-x-4">
          {/* View mode toggle */}
          <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ViewGridIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ViewListIcon className="w-5 h-5" />
            </button>
          </div>
          {/* Pagination */}
          <div className="flex space-x-2">
            <button
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
            >
              上一页
            </button>
            <span className="px-3 py-1 bg-gray-800 text-white rounded">
              {currentPage}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage * pageSize >= totalCount}
              className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      {/* Video content */}
      {viewMode === 'grid' ? (
        <VideoGrid videos={videos} />
      ) : (
        <div className="space-y-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:gap-4">
                {/* Thumbnail container */}
                <div className="w-full sm:w-48 h-48 sm:h-28 relative mb-4 sm:mb-0 flex-shrink-0">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover rounded"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                
                {/* Video info */}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  
                  <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 text-sm text-gray-400 mb-3">
                    <span>发布于 {video.publishedAt}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>更新于 {video.updatedAt}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {video.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-sm text-gray-400 line-clamp-2 sm:line-clamp-3">
                    {video.summary}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile pagination */}
      <div className="flex justify-center space-x-4 sm:hidden">
        <button
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 w-24"
        >
          上一页
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage * pageSize >= totalCount}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 w-24"
        >
          下一页
        </button>
      </div>
    </div>
  );
} 