'use client';

import { FC } from 'react';
import { create } from 'zustand';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  size = 'md',
  fullScreen = false,
  text = '加载中...',
}) => {
  const Spinner = () => (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin`}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
        <Spinner />
      </div>
    );
  }

  return <Spinner />;
};

// 创建一个全局 loading 状态管理
interface LoadingStore {
  isLoading: boolean;
  message: string;
  show: (message?: string) => void;
  hide: () => void;
}

export const useLoading = create<LoadingStore>((set) => ({
  isLoading: false,
  message: '',
  show: (message = '加载中...') => set({ isLoading: true, message }),
  hide: () => set({ isLoading: false, message: '' }),
}));

// 全局 Loading 组件
export const GlobalLoading: FC = () => {
  const { isLoading, message } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500"></div>
        <p className="text-white">{message}</p>
      </div>
    </div>
  );
}; 