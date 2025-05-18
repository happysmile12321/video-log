'use client';

import { useState, useEffect } from 'react';
import { getKnowledgeTypes, APIError } from '@/services/api';

export function useKnowledgeTypes() {
  const [types, setTypes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getKnowledgeTypes();
      setTypes(data);
    } catch (err) {
      const message = err instanceof APIError ? err.message : '加载知识库类型失败';
      setError(message);
      console.error('Failed to fetch knowledge types:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  return {
    types,
    error,
    isLoading,
    refetch: fetchTypes,
  };
} 