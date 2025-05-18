'use client';

import { Video } from '@/services/api';
import Image from 'next/image';

interface VideoGridProps {
  videos: Video[];
  onVideoClick?: (videoId: string) => void;
}

export function VideoGrid({ videos, onVideoClick }: VideoGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {videos.map((video) => (
        <div
          key={video.id}
          onClick={() => onVideoClick?.(video.id)}
          className="group cursor-pointer"
        >
          {/* Card Container */}
          <div className="bg-gray-800 rounded-lg overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
            {/* Thumbnail Container - 4:3 aspect ratio */}
            <div className="relative aspect-[4/3]">
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                {video.duration}
              </div>
            </div>

            {/* Content Container */}
            <div className="p-3">
              {/* Title - 2 lines max */}
              <h3 className="text-sm font-medium text-white line-clamp-2 mb-2">
                {video.title}
              </h3>

              {/* Tags Container - show first 2 tags + count */}
              <div className="flex flex-wrap gap-1">
                {video.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-gray-700 text-xs text-gray-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {video.tags.length > 2 && (
                  <span className="px-2 py-0.5 bg-gray-700 text-xs text-gray-300 rounded-full">
                    +{video.tags.length - 2}
                  </span>
                )}
              </div>

              {/* Metadata */}
              <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                <span>{video.publishedAt}</span>
                <span>•</span>
                <span>{video.duration}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 