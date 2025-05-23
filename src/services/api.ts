// API 基础配置
const API_BASE = 'https://open.feishu.cn/anycross/trigger/callback';

// API 端点
export const API_ENDPOINTS = {
  KNOWLEDGE_TYPES: 'MDUwYTI4NGM4MWFlMjcwZDE1NzMyYTY4Yzc2NWZiZTZm',
  VIDEO_LIST: 'MGNhYjhhMDJhNzI3ZGMzNGVmNGU3ZjIyOWU1MjJjZWE0',
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

// 字幕类型定义
export interface Subtitle {
  id: string;
  timestamp: number;
  time: string;
  speaker: string;
  content: string;
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
  subtitles: Subtitle[];
  highlights: {
    title: string;
    content: string;
    tags: string[];
  }[];
  thoughts: string[];
  transcript?: string;
  mindmap?: string;
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
type KnowledgeTypesResponse = string[];

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
  const response = await fetchAPI<{
    total: number;
    has_more: boolean;
    items: Array<{
      record_id: string;
      fields: {
        封面图: Array<{
          url: string;
          name: string;
          file_token: string;
          type: string;
          size: number;
          tmp_url: string;
        }>;
        时间: number;
        标题: Array<{
          text: string;
          type: string;
        }>;
        视频时长: Array<{
          text: string;
          type: string;
        }>;
      };
    }>;
  }>(API_ENDPOINTS.VIDEO_LIST);

  // Transform the response to match our Video interface
  const videos: Video[] = response.items.map(item => ({
    id: item.record_id,
    title: item.fields.标题[0].text,
    thumbnail: item.fields.封面图[0].url,
    duration: item.fields.视频时长[0].text,
    publishedAt: new Date(item.fields.时间).toLocaleDateString(),
    updatedAt: new Date(item.fields.时间).toLocaleDateString(),
    tags: [], // Feishu API doesn't provide tags
    summary: '', // Feishu API doesn't provide summary
  }));

  // Calculate total duration
  const totalDuration = videos.reduce((acc, video) => {
    const [minutes, seconds] = video.duration.split(':').map(Number);
    return acc + minutes * 60 + seconds;
  }, 0);

  const formattedDuration = `${Math.floor(totalDuration / 60)}分${totalDuration % 60}秒`;

  return {
    total: response.total,
    totalDuration: formattedDuration,
    items: videos,
    currentPage: params.page,
    pageSize: params.pageSize
  };
}

// 获取视频详情
export async function getVideoDetail(id: string): Promise<VideoDetail | null> {
  // 使用 mock 数据
  const mockVideoDetail: VideoDetail = {
    id: '1',
    title: '上班宫斗？独立开发？程序员的出路在哪？【阿Test正经比较】',
    thumbnail: '/images/video1.jpg',
    duration: '07:53',
    publishedAt: '4 个月前',
    updatedAt: '4 个月前',
    tags: ['程序员', '职业发展', '内卷', '独立开发', '副业'],
    summary: '这段视频主要探讨了程序员的职业发展路径，尤其是在"内卷"大环境下的选择。视频通过采访多位程序员，分享了他们从上班转为独立开发的经历。',
    videoUrl: '/videos/sample.mp4',
    chapters: [
      {
        id: '1',
        time: '00:00',
        title: '程序员职业现状',
        content: '探讨当前程序员的就业形势和发展机遇。'
      },
      {
        id: '2',
        time: '00:41',
        title: '独立开发之路',
        content: '分析独立开发的机遇与挑战。'
      },
      {
        id: '3',
        time: '01:19',
        title: '新技术机遇',
        content: '探讨鸿蒙等新技术带来的发展机会。'
      }
    ],
    subtitles: [
      {
        id: '1',
        timestamp: 0,
        time: '00:00',
        speaker: '张老师',
        content: '大家好，今天我们来聊聊程序员的职业发展问题。'
      },
      {
        id: '2',
        timestamp: 15,
        time: '00:15',
        speaker: '学生A',
        content: '老师，我听说现在程序员就业压力很大，是真的吗？'
      },
      {
        id: '3',
        timestamp: 30,
        time: '00:30',
        speaker: '张老师',
        content: '确实，但压力同时也意味着机遇。让我们先看看当前的就业形势。'
      }
    ],
    highlights: [
      {
        title: '程序员职业发展现状',
        content: '🔍 深度解析程序员职业发展困境与机遇！在当前就业环境下，程序员面临着前所未有的压力和挑战。但危机中往往蕴含着转机，通过合理规划和把握机会，依然可以实现职业突破。',
        tags: ['职业发展', '就业形势', '机遇']
      },
      {
        title: '独立开发的机遇与挑战',
        content: '💡 想转型独立开发？这些你必须知道！独立开发需要全面考虑技术储备、市场需求和资金规划。虽然风险存在，但通过合理规划和准备，独立开发也能成为一条可行的职业道路。',
        tags: ['独立开发', '创业', '风险控制']
      }
    ],
    thoughts: [
      '💭 在就业压力下，如何找准自己的发展方向？',
      '🤔 独立开发vs就业，如何权衡利弊做出选择？',
      '📱 新技术浪潮下，程序员应该如何提前布局？'
    ]
  };

  return mockVideoDetail;
} 