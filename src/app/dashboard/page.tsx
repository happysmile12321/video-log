'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function Dashboard() {
  const { userInfo } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!userInfo) {
      router.replace('/');
    }
  }, [userInfo, router]);

  if (!userInfo) {
    return null;
  }

  return (
    <DashboardLayout currentPath={pathname}>
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl text-white text-center mb-2">
            ReduceVideo 让你的视频内容得快，搜得到，用得好
          </h1>

          {/* 输入框 */}
          <div className="bg-gray-800 rounded-lg p-3 mb-6">
            <div className="flex items-center space-x-2">
              <button className="text-gray-400 hover:text-white">
                <span>💭</span>
              </button>
              <input
                type="text"
                placeholder="请输入任意音视频链接，按下 Enter 键..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500"
              />
              <button className="text-gray-400 hover:text-white">
                <span>🎤</span>
              </button>
            </div>
          </div>

          {/* 快捷模板 */}
          <div className="text-gray-400 text-sm mb-6">
            <span className="mr-2">快速体验:</span>
            <button className="inline-flex items-center space-x-1 bg-gray-800 rounded-full px-3 py-1 mr-2 hover:bg-gray-700">
              <span>🤖</span>
              <span>Self-Hosting Next.js</span>
            </button>
            <button className="inline-flex items-center space-x-1 bg-gray-800 rounded-full px-3 py-1 hover:bg-gray-700">
              <span>📺</span>
              <span>无人知晓</span>
            </button>
          </div>

          {/* 上传区域 */}
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
            <div className="mb-4">
              <div className="text-6xl mb-4">📁</div>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
                选择音视频文件
              </button>
              <input
                type="file"
                className="hidden"
                accept=".mp3,.mp4,.mov,.m4a,.wav,.webm,.avi,.mkv"
                onChange={(e) => {
                  console.log(e.target.files);
                }}
              />
            </div>
            <p className="text-gray-500 text-sm">
              点击上传或拖拽文件到此处 (单个文件大小 ≤ 2G)
            </p>
            <p className="text-gray-500 text-sm">
              支持格式: mp3, mp4, mov, m4a, wav, webm, avi, mkv 等
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="mt-6 flex justify-center">
            <button
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-8 rounded-lg shadow transition-colors"
              onClick={() => {
                console.log('开始处理');
              }}
            >
              一键总结
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 