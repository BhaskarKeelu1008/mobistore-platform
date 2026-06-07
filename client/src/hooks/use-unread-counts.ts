'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

export interface UnreadCounts {
  notifications: number;
  chat: number;
}

export function useUnreadCounts() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['unread-counts'],
    queryFn: () => fetchApi<UnreadCounts>('/public/unread-counts'),
    enabled: isAuthenticated,
    refetchInterval: 30_000,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });
}
