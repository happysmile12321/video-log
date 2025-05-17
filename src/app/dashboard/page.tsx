'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// 左侧菜单项配置
const menuItems = [
  { id: 'home', label: '首页', icon: '🏠' },
  { id: 'knowledge', label: '知 - 资源库', icon: '📚', count: 2 },
  { id: 'action', label: '行 - 提示词', icon: '🎯', count: 3 },
  { id: 'tags', label: '标签', icon: '#️⃣' },
  { id: 'subscription', label: '订阅', icon: '🔔' },
  { id: 'explore', label: '探索', icon: '🔍' }
];

export default function Dashboard() {
  const { userInfo } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [visualize, setVisualize] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('home');
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);

  useEffect(() => {
    // 确保代码只在客户端运行
    if (typeof window !== 'undefined') {
      if (!userInfo) {
        router.replace('/');
      }
      setIsLoading(false);
    }
  }, [userInfo, router]);

  // 显示加载状态
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  // 如果没有用户信息，返回空（等待重定向）
  if (!userInfo) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* 左侧菜单 */}
      <div className={`${isMenuCollapsed ? 'w-16' : 'w-64'} bg-gray-800 text-white flex flex-col transition-all duration-300`}>
        <div className="flex-none p-4">
          <div className="flex items-center space-x-2">
            <Image
              src={userInfo.avatar_url}
              alt="Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            {!isMenuCollapsed && <span className="font-semibold">BibiGPT</span>}
          </div>
        </div>

        {/* 菜单项 */}
        <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedMenu(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                selectedMenu === item.id ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span>{item.icon}</span>
                {!isMenuCollapsed && <span>{item.label}</span>}
              </div>
              {!isMenuCollapsed && item.count && (
                <span className="bg-gray-600 px-2 rounded-full text-sm">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* 底部用户信息 */}
        <div className="flex-none p-4 border-t border-gray-700">
          <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700">
            <Image
              src={userInfo.avatar_url}
              alt={userInfo.name}
              width={32}
              height={32}
              className="rounded-full"
            />
            {!isMenuCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{userInfo.name}</div>
                <div className="text-xs text-gray-400 truncate">{userInfo.email}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <div className="flex-none bg-gray-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isMenuCollapsed ? '→' : '←'}
            </button>
            <h2 className="text-xl font-semibold">欢迎使用 BibiGPT</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-700 rounded-lg">🔍</button>
            <button className="p-2 hover:bg-gray-700 rounded-lg">⚙️</button>
          </div>
        </div>

        {/* 滚动内容区域 */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-2xl text-white text-center mb-2">
                BibiGPT 让你的视频内容得快，搜得到，用得好
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
        </div>
      </div>
    </div>
  );
} 