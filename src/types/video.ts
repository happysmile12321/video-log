export interface VideoSummary {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  summary: string;
  views: number;
  likes: number;
}

export interface VideoListResponse {
  total: number;
  totalDuration: string;
  items: VideoSummary[];
  currentPage: number;
  pageSize: number;
} 