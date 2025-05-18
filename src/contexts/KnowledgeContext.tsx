'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useKnowledgeTypes } from '@/hooks/useKnowledgeTypes';

interface KnowledgeContextType {
  types: string[];
  isLoading: boolean;
  error: string | null;
}

const KnowledgeContext = createContext<KnowledgeContextType | undefined>(undefined);

export function KnowledgeProvider({ children }: { children: ReactNode }) {
  const { types, isLoading, error } = useKnowledgeTypes();

  return (
    <KnowledgeContext.Provider value={{ types, isLoading, error }}>
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