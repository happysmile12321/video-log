import { createContext, useContext, useState, ReactNode } from 'react';
import type { FeishuUserInfo } from '@/types/user';

interface UserContextType {
  userInfo: FeishuUserInfo | null;
  setUserInfo: (info: FeishuUserInfo | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfo] = useState<FeishuUserInfo | null>(null);

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