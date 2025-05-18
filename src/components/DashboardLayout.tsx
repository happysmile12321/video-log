'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import Image from 'next/image';
import { useKnowledgeContext } from '@/contexts/KnowledgeContext';
import { MobileNavButton } from './MobileNavButton';

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
  currentPath?: string;
}

export function DashboardLayout({ children, currentPath }: DashboardLayoutProps) {
  const { userInfo } = useUser();
  const router = useRouter();
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const { knowledgeTypes = [], isLoading } = useKnowledgeContext();
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 在移动端时自动收起菜单
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 点击导航项时在移动端自动关闭菜单
  const handleMenuClick = (item: MenuItem) => {
    if (currentPath !== item.path) {
      router.push(item.path);
      setIsMobileMenuOpen(false);
    }
  };

  const handleExpandClick = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMenuId(expandedMenuId === itemId ? null : itemId);
  };

  const handleKnowledgeTypeClick = (typeId: string) => {
    router.push(`/knowledge/type/${typeId}`);
    setIsMobileMenuOpen(false);
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

  const renderNavigation = () => (
    <div className={`bg-gray-800 text-white flex flex-col h-full md:h-screen ${
      isMenuCollapsed ? 'w-16' : 'w-64'
    } transition-all duration-300`}>
      <div className="flex-none p-4">
        <div className="flex items-center space-x-2">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          {!isMenuCollapsed && <span className="font-semibold">ReduceVideo</span>}
        </div>
      </div>

      <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
        {menuItems.map((item) => {
          const count = getItemCount(item);
          const isActive = currentPath === item.path;
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
  );

  return (
    <div className="flex h-screen bg-gray-900">
      {/* 桌面端导航 */}
      <div className="hidden md:block h-screen">
        {renderNavigation()}
      </div>

      {/* 移动端导航按钮和菜单 */}
      <MobileNavButton
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isOpen={isMobileMenuOpen}
      />

      {/* 移动端导航菜单 - 磨砂玻璃效果 */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div 
            className="relative w-[90%] max-w-sm max-h-[80vh] bg-gray-800 bg-opacity-90 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {renderNavigation()}
          </div>
        </div>
      )}

      {/* 主要内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <div className="flex-none bg-gray-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer hidden md:block"
            >
              {isMenuCollapsed ? '→' : '←'}
            </button>
            <h2 className="text-xl font-semibold">欢迎使用 ReduceVideo</h2>
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