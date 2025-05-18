// API 基础配置
const API_BASE = 'https://open.feishu.cn/anycross/trigger/callback';

// API 端点
export const API_ENDPOINTS = {
  KNOWLEDGE_TYPES: 'MDUwYTI4NGM4MWFlMjcwZDE1NzMyYTY4Yzc2NWZiZTZm',
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

// 通用请求函数
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}/${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new APIError(
        `HTTP error! status: ${response.status}`,
        response.status,
        await response.json().catch(() => null)
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

// 知识库类型接口
export interface KnowledgeTypesResponse extends Array<string> {}

export async function getKnowledgeTypes(): Promise<KnowledgeTypesResponse> {
  return fetchAPI<KnowledgeTypesResponse>(API_ENDPOINTS.KNOWLEDGE_TYPES);
} 