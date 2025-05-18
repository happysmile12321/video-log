import { VideoListResponse } from '@/types/video';

const API_BASE = 'https://api.reducevideo.co/v1';

export async function getVideoList(params: {
  page: number;
  pageSize: number;
  search?: string;
}): Promise<VideoListResponse> {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
    ...(params.search ? { search: params.search } : {})
  });

  const response = await fetch(`${API_BASE}/videos?${queryParams}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch video list');
  }

  return response.json();
} 