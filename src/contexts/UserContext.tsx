'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { FeishuUserInfo } from '@/types/user';
import { mockUserInfo } from '@/mocks/userInfo';

interface UserContextType {
  userInfo: FeishuUserInfo | null;
  setUserInfo: (info: FeishuUserInfo | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfo] = useState<FeishuUserInfo | null>(null);

  useEffect(() => {
    // 在开发环境下，自动设置模拟数据
    if (process.env.NODE_ENV === 'development' && !userInfo) {
      setUserInfo(mockUserInfo);
    }
  }, [userInfo]);

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 