'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Video } from '@/services/api';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          共 {totalCount} 个视频，总时长 {totalDuration}
        </div>
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

      <div className="space-y-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-48 h-28 relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover rounded"
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                  {video.duration}
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-medium text-white mb-2">
                  {video.title}
                </h3>
                <div className="flex items-center text-sm text-gray-400 mb-2 space-x-4">
                  <span>发布于 {video.publishedAt}</span>
                  <span>更新于 {video.updatedAt}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {video.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {video.summary}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 