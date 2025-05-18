// API 基础配置
const API_BASE = 'https://open.feishu.cn/anycross/trigger/callback';

// API 端点
export const API_ENDPOINTS = {
  KNOWLEDGE_TYPES: 'MDUwYTI4NGM4MWFlMjcwZDE1NzMyYTY4Yzc2NWZiZTZm',
  VIDEO_LIST: 'video-list',
  VIDEO_DETAIL: 'video-detail',
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

export interface VideoDetail extends Video {
  videoUrl: string;
  chapters: {
    id: string;
    time: string;
    title: string;
    content: string;
  }[];
  highlights: {
    title: string;
    content: string;
    tags: string[];
  }[];
  thoughts: string[];
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

// Mock 数据
const mockVideos: Video[] = [
  {
    id: '1',
    title: '上班宫斗？独立开发？程序员的出路在哪？【阿Test正经比较】',
    thumbnail: '/images/video1.jpg',
    duration: '07:53',
    publishedAt: '4 个月前',
    updatedAt: '4 个月前',
    tags: ['程序员', '职业发展', '内卷', '独立开发', '副业'],
    summary: '这段视频主要探讨了程序员的职业发展路径，尤其是在"内卷"大环境下的选择。视频通过采访多位程序员，分享了他们从上班转为独立开发的经历。'
  },
  {
    id: '2',
    title: '反抗了 62 个月后，TikTok终于还是结束了【差评君】',
    thumbnail: '/images/video2.jpg',
    duration: '12:34',
    publishedAt: '4 个月前',
    updatedAt: '4 个月前',
    tags: ['安全政治', '行政命令', '力量对抗', '政治博弈'],
    summary: '这段视频详细回顾了TikTok在美国被禁的全过程，从最初的安全担忧，到最终的结局。'
  }
];

// 获取视频列表
export async function getVideoList(params: {
  page: number;
  pageSize: number;
  type?: string;
}): Promise<VideoListResponse> {
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

// 获取视频详情
export async function getVideoDetail(id: string): Promise<VideoDetail | null> {
  const video = mockVideos.find(v => v.id === id);
  if (!video) return null;

  return {
    ...video,
    videoUrl: 'https://example.com/video.mp4',
    chapters: [
      {
        id: '1',
        time: '00:00',
        title: '中国独立开发者生存现状',
        content: '探讨当前独立开发者的整体情况和面临的挑战。'
      },
      {
        id: '2',
        time: '00:41',
        title: '鸿蒙还行者',
        content: '分析鸿蒙生态系统对开发者的机遇。'
      },
      {
        id: '3',
        time: '01:19',
        title: '程序员总结之旅',
        content: '总结程序员职业发展的不同路径。'
      }
    ],
    highlights: [
      {
        title: '职业发展现状',
        content: '程序员的职业发展面临挑战，许多人选择在互联网公司或创业公司工作，但收入中位数并不高',
        tags: ['程序员', '职业发展', '内卷']
      },
      {
        title: '独立开发困境',
        content: '独立开发者虽然自由但面临收入不稳定、竞争激烈、资金压力等问题',
        tags: ['独立开发', '机遇', '挑战']
      },
      {
        title: '鸿蒙机遇',
        content: '鸿蒙系统的出现为开发者提供了新的机会，且多终端一体化的特性和便捷的开发体验吸引了许多开发者',
        tags: ['鸿蒙', '多终端一体化']
      },
      {
        title: '创新与交流',
        content: '参加创客创新赛不仅能获得奖项和知名度，还能与其他开发者交流，为独立开发提供了展示的平台',
        tags: ['创新赛', '展光', '交流']
      }
    ],
    thoughts: [
      '独立开发者如何平衡工作和生活？',
      '鸿蒙系统未来的发展前景如何？',
      '普通程序员如何抓住鸿蒙带来的机遇？'
    ]
  };
} 