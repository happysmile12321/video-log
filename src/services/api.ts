// API 基础配置
const API_BASE = 'https://open.feishu.cn/anycross/trigger/callback';

// API 端点
export const API_ENDPOINTS = {
  KNOWLEDGE_TYPES: 'MDUwYTI4NGM4MWFlMjcwZDE1NzMyYTY4Yzc2NWZiZTZm',
  VIDEO_LIST: 'video-list',
} as const;

// 错误类型定义
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// API 响应类型
export interface APIResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 基础 API 调用函数
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new APIError('API request failed', response.status);
  }

  const data = await response.json();
  return data;
}

// 视频类型定义
export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  summary: string;
}

// 视频列表响应类型
export interface VideoListResponse {
  total: number;
  totalDuration: string;
  items: Video[];
  currentPage: number;
  pageSize: number;
}

// 知识库类型接口
export interface KnowledgeTypesResponse extends Array<string> {}

// 获取知识库类型
export async function getKnowledgeTypes(): Promise<KnowledgeTypesResponse> {
  return fetchAPI<KnowledgeTypesResponse>(API_ENDPOINTS.KNOWLEDGE_TYPES);
}

// 获取视频列表
export async function getVideoList(params: {
  page: number;
  pageSize: number;
  type?: string;
}): Promise<VideoListResponse> {
  // 模拟数据
  const mockVideos: Video[] = [
    {
      id: '1',
      title: '上班宫斗？独立开发？程序员的出路在哪？【阿Test正经比较】',
      thumbnail: '/images/video1.jpg',
      duration: '07:52',
      publishedAt: '4 个月前',
      updatedAt: '4 个月前',
      tags: ['程序员', '职业发展', '内卷', '独立开发', '副业'],
      summary: '这段视频主要探讨了程序员的职业发展路径，尤其是在"内卷"大环境下的选择。视频通过采访多位程序员，分享了他们从上班转为独立开发的经历，以及创业选择完整平台还是独立开发的原因和经验。'
    },
    {
      id: '2',
      title: '反抗了 62 个月后，TikTok终于还是结束了【差评君】',
      thumbnail: '/images/video2.jpg',
      duration: '12:34',
      publishedAt: '4 个月前',
      updatedAt: '4 个月前',
      tags: ['安全政治', '行政命令', '力量对抗', '政治博弈'],
      summary: '这段视频详细回顾了TikTok在美国被禁的全过程，从最初的安全担忧，特朗普的行政命令，到拜登政府的立法行动。视频分析了美国政府对TikTok的态度，以及TikTok为应对这些问题所做的努力。'
    }
  ];

  // 模拟分页
  const start = (params.page - 1) * params.pageSize;
  const end = start + params.pageSize;
  const items = mockVideos.slice(start, end);

  return {
    total: mockVideos.length,
    totalDuration: '20分钟',
    items,
    currentPage: params.page,
    pageSize: params.pageSize
  };
} 