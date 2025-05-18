import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 从哔哩哔哩视频链接中提取视频ID
 * 支持的格式:
 * - https://www.bilibili.com/video/BV1xx411c7mD
 * - https://b23.tv/BV1xx411c7mD
 * - BV1xx411c7mD
 */
export function extractBilibiliId(url: string): string | null {
  // 如果直接是BV号
  if (url.startsWith('BV')) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    // 标准bilibili.com链接
    if (urlObj.hostname.includes('bilibili.com')) {
      const match = urlObj.pathname.match(/\/video\/(BV[\w]+)/);
      return match ? match[1] : null;
    }
    // b23.tv短链接
    if (urlObj.hostname === 'b23.tv') {
      const match = urlObj.pathname.match(/(BV[\w]+)/);
      return match ? match[1] : null;
    }
  } catch {
    // URL解析失败，尝试直接匹配BV号
    const match = url.match(/(BV[\w]+)/);
    return match ? match[1] : null;
  }

  return null;
}

export function formatTime(seconds: number): string {
  try {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } catch {
    return '00:00';
  }
} 