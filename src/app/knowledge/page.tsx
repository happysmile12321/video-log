'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { getVideoList, VideoListResponse } from '@/services/api';
import { DashboardLayout } from '@/components/DashboardLayout';
import { VideoList } from '@/components/VideoList';
import { SkeletonLoader } from '@/components/SkeletonLoader';

export default function KnowledgePage() {
  const { userInfo } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [videoData, setVideoData] = useState<VideoListResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (!userInfo) {
      router.replace('/');
      return;
    }

    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const data = await getVideoList({
          page: currentPage,
          pageSize,
        });
        // Filter out any invalid video items
        const validVideos = data.items.filter(video => 
          video && 
          video.id && 
          video.title && 
          video.thumbnail && 
          video.duration
        );
        
        setVideoData({
          ...data,
          items: validVideos,
          total: validVideos.length // Update total to reflect valid items
        });
      } catch (error) {
        console.error('Failed to fetch videos:', error);
        // Set empty data instead of null to prevent UI errors
        setVideoData({
          total: 0,
          totalDuration: '0分0秒',
          items: [],
          currentPage,
          pageSize
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [userInfo, router, currentPage]);

  if (!userInfo) {
    return null;
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <DashboardLayout currentPath={pathname}>
      <div className="p-8">
        {isLoading ? (
          <SkeletonLoader />
        ) : videoData ? (
          <VideoList
            videos={videoData.items}
            totalCount={videoData.total}
            totalDuration={videoData.totalDuration}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        ) : (
          <div className="text-center text-gray-500">暂无数据</div>
        )}
      </div>
    </DashboardLayout>
  );
} 