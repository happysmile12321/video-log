'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { userInfo } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

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
      <main className="min-h-screen p-24 flex items-center justify-center">
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
    <main className="min-h-screen p-24">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Hello, {userInfo.name}!</h1>
          <p className="text-gray-600">Welcome to your dashboard.</p>
        </div>
      </div>
    </main>
  );
} 