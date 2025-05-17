'use client';

import { useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { userInfo } = useUser();
  const router = useRouter();

  useEffect(() => {
    // 如果没有用户信息，重定向到登录页
    if (!userInfo) {
      router.push('/');
    }
  }, [userInfo, router]);

  if (!userInfo) {
    return null; // 重定向时不显示任何内容
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