'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useKnowledgeContext } from '@/contexts/KnowledgeContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SkeletonLoader } from '@/components/SkeletonLoader';

export default function KnowledgePage() {
  const { userInfo } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { types, isLoading } = useKnowledgeContext();

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
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-white">知识库</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {types.map((type) => (
                <div
                  key={type}
                  className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => console.log('Clicked:', type)}
                >
                  <h2 className="text-xl font-semibold mb-2 text-white">{type}</h2>
                  <p className="text-gray-400">
                    这里是 {type} 的简介描述...
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 