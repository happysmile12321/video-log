'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { getKnowledgeTypes } from '@/services/api';

interface KnowledgeType {
  id: string;
  name: string;
  count: number;
}

interface KnowledgeContextType {
  knowledgeTypes: KnowledgeType[];
  isLoading: boolean;
  error: string | null;
}

const KnowledgeContext = createContext<KnowledgeContextType | undefined>(undefined);

export function KnowledgeProvider({ children }: { children: ReactNode }) {
  const [knowledgeTypes, setKnowledgeTypes] = useState<KnowledgeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const types = await getKnowledgeTypes();
        // 将字符串数组转换为所需的格式
        const formattedTypes: KnowledgeType[] = types.map((name, index) => ({
          id: (index + 1).toString(),
          name,
          count: 0 // 这里的count可能需要从其他API获取
        }));
        setKnowledgeTypes(formattedTypes);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <KnowledgeContext.Provider
      value={{
        knowledgeTypes,
        isLoading,
        error
      }}
    >
      {children}
    </KnowledgeContext.Provider>
  );
}

export function useKnowledgeContext() {
  const context = useContext(KnowledgeContext);
  if (context === undefined) {
    throw new Error('useKnowledgeContext must be used within a KnowledgeProvider');
  }
  return context;
} 