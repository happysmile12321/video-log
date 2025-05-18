'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import Image from 'next/image';
import { useKnowledgeContext } from '@/contexts/KnowledgeContext';

interface MenuItem {
  id: 'home' | 'knowledge' | 'action' | 'tags' | 'subscription' | 'explore';
  label: string;
  icon: string;
  path: string;
  count?: number;
}

// 左侧菜单项配置
export const menuItems: MenuItem[] = [
  { id: 'home', label: '首页', icon: '🏠', path: '/dashboard' },
  { id: 'knowledge', label: '知 - 资源库', icon: '📚', path: '/knowledge' },
  { id: 'action', label: '行 - 提示词', icon: '🎯', count: 3, path: '/action' },
  { id: 'tags', label: '标签', icon: '#️⃣', path: '/tags' },
  { id: 'subscription', label: '订阅', icon: '🔔', path: '/subscription' },
  { id: 'explore', label: '探索', icon: '🔍', path: '/explore' }
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPath: string;
}

export function DashboardLayout({ children, currentPath }: DashboardLayoutProps) {
  const { userInfo } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const { knowledgeTypes = [], isLoading } = useKnowledgeContext();
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);

  const handleMenuClick = (item: MenuItem) => {
    if (pathname !== item.path) {
      router.push(item.path);
    }
  };

  const handleExpandClick = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡到菜单项
    setExpandedMenuId(expandedMenuId === itemId ? null : itemId);
  };

  const handleKnowledgeTypeClick = (typeId: string) => {
    router.push(`/knowledge/type/${typeId}`);
  };

  const getItemCount = (item: MenuItem): number => {
    if (item.id === 'knowledge') {
      return knowledgeTypes.reduce((sum, type) => sum + type.count, 0);
    }
    return item.count || 0;
  };

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
          {menuItems.map((item) => {
            const count = getItemCount(item);
            const isActive = pathname === item.path;
            const isExpanded = expandedMenuId === item.id;
            
            return (
              <div key={item.id}>
                <div
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span>{item.icon}</span>
                    {!isMenuCollapsed && (
                      <span>{item.label}</span>
                    )}
                  </div>
                  {!isMenuCollapsed && (
                    <div className="flex items-center space-x-2">
                      {count > 0 && (
                        <span className="bg-gray-600 px-2 rounded-full text-sm">
                          {count}
                        </span>
                      )}
                      {item.id === 'knowledge' && (
                        <button
                          onClick={(e) => handleExpandClick(item.id, e)}
                          className="ml-2 p-1 hover:bg-gray-600 rounded transition-colors"
                        >
                          {isExpanded ? '▼' : '▶'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* 知识库子菜单 */}
                {!isMenuCollapsed && item.id === 'knowledge' && isExpanded && (
                  <div className="ml-8 mt-2 space-y-1">
                    {isLoading ? (
                      <div className="text-gray-400 text-sm px-4 py-1">加载中...</div>
                    ) : (
                      knowledgeTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => handleKnowledgeTypeClick(type.id)}
                          className="w-full text-left px-4 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded cursor-pointer truncate flex items-center justify-between"
                        >
                          <span>{type.name}</span>
                          <span className="text-xs bg-gray-600 px-2 rounded-full">
                            {type.count}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* 底部用户信息 */}
        <div className="flex-none p-4 border-t border-gray-700">
          <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 cursor-pointer">
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
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              {isMenuCollapsed ? '→' : '←'}
            </button>
            <h2 className="text-xl font-semibold">欢迎使用 BibiGPT</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-700 rounded-lg cursor-pointer">🔍</button>
            <button className="p-2 hover:bg-gray-700 rounded-lg cursor-pointer">⚙️</button>
          </div>
        </div>

        {/* 滚动内容区域 */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
} 