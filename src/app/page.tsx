'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { FeishuSDKExample } from '@/components/FeishuSDKExample';

export default function Home() {
  const { userInfo } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 确保代码只在客户端运行
    if (typeof window !== 'undefined') {
      if (userInfo) {
        router.replace('/knowledge');
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

  return (
    <main className="min-h-screen p-24">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to Video Log</h1>
        <p className="text-xl text-gray-600 mb-8">Please login to continue</p>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <FeishuSDKExample />
        </div>
      </div>
    </main>
  );
}
