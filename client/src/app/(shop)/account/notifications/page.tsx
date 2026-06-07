'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bell, CheckCheck } from 'lucide-react';
import api, { fetchApi } from '@/lib/api';
import { Notification } from '@/types';
import { formatDate, cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchApi<Notification[]>('/public/notifications'),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.put('/public/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-counts'] });
      toast.success('All notifications marked as read');
    },
  });

  const markRead = async (id: string) => {
    await api.put(`/public/notifications/${id}/read`);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['unread-counts'] });
  };

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Notifications</h2>
        {notifications.some((n) => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {!notifications.length ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <Bell className="mb-4 h-12 w-12 text-zinc-400" />
            <p>No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        notifications.map((n) => (
          <Card
            key={n._id}
            className={cn(!n.isRead && 'border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20')}
          >
            <CardContent className="flex items-start gap-4 p-4">
              <Bell className={cn('mt-1 h-5 w-5 shrink-0', !n.isRead ? 'text-blue-600' : 'text-zinc-400')} />
              <div className="flex-1">
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{n.message}</p>
                <p className="mt-1 text-xs text-zinc-500">{formatDate(n.createdAt)}</p>
                {n.link && (
                  <Link href={n.link} className="mt-2 inline-block text-sm text-blue-600 hover:underline">
                    View details
                  </Link>
                )}
              </div>
              {!n.isRead && (
                <Button variant="ghost" size="sm" onClick={() => markRead(n._id)}>Mark read</Button>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
