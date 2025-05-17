'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { FeishuSDKExample } from '@/components/FeishuSDKExample';

export default function Home() {
  const { userInfo } = useUser();
  const router = useRouter();

  useEffect(() => {
    // 如果已经有用户信息，自动跳转到仪表板
    if (userInfo) {
      router.push('/dashboard');
    }
  }, [userInfo, router]);

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
