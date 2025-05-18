'use client';

import { ReactNode } from 'react';
import { GlobalLoading } from './LoadingSpinner';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <>
      {children}
      <GlobalLoading />
    </>
  );
} 