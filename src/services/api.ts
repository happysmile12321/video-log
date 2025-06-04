// API 基础配置
const API_BASE = 'https://open.feishu.cn/anycross/trigger/callback';

// API 端点
export const API_ENDPOINTS = {
  KNOWLEDGE_TYPES: 'MDUwYTI4NGM4MWFlMjcwZDE1NzMyYTY4Yzc2NWZiZTZm',
  VIDEO_LIST: 'MGNhYjhhMDJhNzI3ZGMzNGVmNGU3ZjIyOWU1MjJjZWE0',
  VIDEO_DETAIL: 'MDU3NDFmNmE0ZmIxMTRkZmZkOTBiYmI0NmU2YzgwMjg4',
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
    endTime?: string;
    title: string;
    content: string;
    subChapters?: {
      id: string;
      time: string;
      endTime: string;
      title: string;
      content: string;
    }[];
  }[];
  subtitles: Subtitle[];
  highlights: {
    title: string;
    content: string;
    tags: string[];
  }[];
  thoughts: string[];
  chapterContent: string;
  mindmapContent?: string;
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
  const videos: Video[] = response.items
    .map(item => {
      try {
        // Check if required fields exist and have valid data
        if (!item.fields?.标题?.[0]?.text ||
            !item.record_id ||
            !item.fields?.时间) {
          console.warn('Skipping invalid video item:', item);
          return null;
        }

        const video: Video = {
          id: item.record_id,
          title: item.fields.标题[0].text,
          thumbnail: item.fields?.封面图?.[0]?.url || '/images/default-thumbnail.jpg',
          duration: item.fields?.视频时长?.[0]?.text || '00:00',
          publishedAt: new Date(item.fields.时间).toLocaleDateString(),
          updatedAt: new Date(item.fields.时间).toLocaleDateString(),
          tags: [], // Feishu API doesn't provide tags
          summary: '', // Feishu API doesn't provide summary
        };
        return video;
      } catch (error) {
        console.warn('Error processing video item:', error);
        return null;
      }
    })
    .filter((video): video is Video => video !== null); // Remove null items

  // Calculate total duration
  const totalDuration = videos.reduce((acc, video) => {
    try {
      const [minutes, seconds] = video.duration.split(':').map(Number);
      return acc + (minutes * 60 + seconds);
    } catch (error) {
      console.warn('Error calculating duration for video:', video.id);
      return acc;
    }
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
  try {
    const response = await fetchAPI<Array<{
      record_id: string;
      fields: {
        ID: string;
        内容速览: Array<{
          text: string;
          type: string;
        }>;
        时间: number;
        标签: string[];
        标题: Array<{
          text: string;
          type: string;
        }>;
        章节列表提取: Array<{
          text: string;
          type: string;
        }>;
        章节内容: Array<{
          text: string;
          type: string;
        }>;
        思考启发: Array<{
          text: string;
          type: string;
        }>;
        精彩亮点: Array<{
          text: string;
          type: string;
        }>;
        字幕: Array<{
          text: string;
          type: string;
        }>;
        视频时长: Array<{
          text: string;
          type: string;
        }>;
        思维导图提取内容: Array<{
          text: string;
          type: string;
        }>;
        视频地址: Array<{
          link: string;
        }>;
      };
    }>>(API_ENDPOINTS.VIDEO_DETAIL, {
      method: 'POST',
      body: JSON.stringify({ recordId: id }),
    });

    console.log('原始 API 响应:', JSON.stringify(response, null, 2));

    // 检查响应是否有效
    if (!Array.isArray(response) || response.length === 0) {
      console.error('Invalid API response:', response);
      return null;
    }

    const record = response[0];
    if (!record?.fields) {
      console.error('Invalid record data:', record);
      return null;
    }

    const fields = record.fields;
    console.log('处理后的字段数据:', JSON.stringify(fields, null, 2));
    
    // 检查必要字段是否存在
    if (!fields['标题']?.[0]?.text || !record.record_id) {
      console.error('Missing required fields:', fields);
      return null;
    }

    // Parse chapters from 章节列表提取
    const chaptersText = fields['章节列表提取']?.[0]?.text || '';
    console.log('原始章节列表文本:', chaptersText);
    const chapters = parseChapters(chaptersText);
    console.log('解析后的章节列表数据:', JSON.stringify(chapters, null, 2));

    // Parse chapter content from 章节内容
    const chapterContentText = fields['章节内容']?.[0]?.text || '';
    console.log('原始章节内容文本:', chapterContentText);
    const chapterContent = chapterContentText; // 直接作为原文传递
    // 不再合并章节内容到章节列表

    // Parse subtitles
    const subtitlesText = fields['字幕']?.[0]?.text || '';
    const subtitles = parseSubtitles(subtitlesText);
    console.log('解析后的字幕数据:', JSON.stringify(subtitles, null, 2));

    // Parse mindmap content from 思维导图提取内容
    const mindmapContentText = fields['思维导图提取内容']?.[0]?.text || '';
    console.log('原始思维导图文本:', mindmapContentText);

    // 处理时间戳
    const timestamp = fields['时间'];
    const date = timestamp ? new Date(timestamp) : null;
    const formattedDate = date ? date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '未知';

    // 获取视频地址
    const videoUrl = fields['视频地址']?.[0]?.link || '/videos/sample.mp4';

    // Create video detail object with safe fallbacks
    const videoDetail: VideoDetail = {
      id: record.record_id,
      title: fields['标题'][0].text,
      thumbnail: '/images/default-thumbnail.jpg',
      duration: fields['视频时长']?.[0]?.text || '00:00',
      publishedAt: formattedDate,
      updatedAt: formattedDate,
      tags: fields['标签'] || [],
      summary: fields['内容速览']?.[0]?.text || '',
      videoUrl,
      chapters,
      subtitles,
      highlights: [
        {
          title: '内容速览',
          content: fields['内容速览']?.[0]?.text || '暂无内容概述',
          tags: fields['标签'] || []
        },
        ...(fields['精彩亮点'] || []).map((item, index) => ({
          title: `亮点 ${index + 1}`,
          content: item.text,
          tags: []
        }))
      ],
      thoughts: (fields['思考启发'] || []).map(item => item.text),
      chapterContent,
      mindmapContent: mindmapContentText,
    };

    console.log('最终处理后的视频详情数据:', JSON.stringify(videoDetail, null, 2));

    return videoDetail;
  } catch (error) {
    console.error('Error fetching video detail:', error);
    return null;
  }
}

// Helper function to parse chapters from text
function parseChapters(chaptersText: string) {
  console.log('开始解析章节列表文本:', chaptersText);
  
  const lines = chaptersText.split('\n');
  const chapters = [];
  let chapterCounter = 1;
  let currentChapter = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // 主章节：数字. 标题 (可选时间)
    const mainChapterMatch = trimmedLine.match(/^(\d+)\.\s+(.+?)(?:\s*\((\d{2}:\d{2}:\d{2})~(\d{2}:\d{2}:\d{2})\))?$/);
    // 子章节：- 标题 (时间)
    const subChapterMatch = trimmedLine.match(/^\s*-\s+(.+?)\s*\((\d{2}:\d{2}:\d{2})~(\d{2}:\d{2}:\d{2})\)$/);

    if (mainChapterMatch) {
      // 保存上一个章节
      if (currentChapter) chapters.push(currentChapter);
      currentChapter = {
        id: `chapter-${chapterCounter++}`,
        time: mainChapterMatch[3] || '',
        endTime: mainChapterMatch[4] || '',
        title: mainChapterMatch[2].trim(),
        content: '',
        subChapters: []
      };
      console.log('解析到新主章节:', currentChapter);
    } else if (subChapterMatch && currentChapter) {
      // 子章节归属当前主章节
      const sub = {
        id: `subchapter-${chapterCounter++}`,
        time: subChapterMatch[2],
        endTime: subChapterMatch[3],
        title: subChapterMatch[1].trim(),
        content: ''
      };
      currentChapter.subChapters.push(sub);
      console.log('解析到新子章节:', sub);
    } else if (currentChapter) {
      // 其他内容归为主章节内容
      currentChapter.content += (currentChapter.content ? '\n' : '') + trimmedLine;
    }
  }
  if (currentChapter) chapters.push(currentChapter);
  console.log('最终解析的章节列表:', chapters);
  return chapters;
}

// Helper function to parse subtitles from text
function parseSubtitles(subtitlesText: string) {
  const lines = subtitlesText.split('\n');
  const subtitles = [];
  let currentSubtitle = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Match subtitle pattern like "1 00:00:00,000 --> 00:00:11,680"
    const timeMatch = trimmedLine.match(/^(\d+)\s+(\d{2}:\d{2}:\d{2},\d{3})\s+-->\s+(\d{2}:\d{2}:\d{2},\d{3})/);
    if (timeMatch) {
      if (currentSubtitle) {
        subtitles.push(currentSubtitle);
      }
      currentSubtitle = {
        id: timeMatch[1],
        timestamp: parseTimestamp(timeMatch[2]),
        time: timeMatch[2].split(',')[0],
        speaker: '',
        content: '',
      };
    } else if (currentSubtitle) {
      if (!currentSubtitle.content) {
        currentSubtitle.content = trimmedLine;
      } else {
        currentSubtitle.content += '\n' + trimmedLine;
      }
    }
  }

  if (currentSubtitle) {
    subtitles.push(currentSubtitle);
  }

  return subtitles;
}

// Helper function to parse timestamp to seconds
function parseTimestamp(timestamp: string) {
  const [time, milliseconds] = timestamp.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds + Number(milliseconds) / 1000;
} 