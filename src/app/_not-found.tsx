'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4">404</h2>
        <p className="text-gray-400 mb-8">页面未找到</p>
        <Link 
          href="/"
          className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
} 