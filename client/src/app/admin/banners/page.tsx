'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { fetchApi } from '@/lib/api';
import { Banner } from '@/types';
import { DataTable } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminBannersPage() {
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => fetchApi<Banner[]>('/admin/banners'),
  });

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Banners</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Manage homepage banners and sliders</p>
      </div>
      <DataTable
        data={banners as unknown as Record<string, unknown>[]}
        keyField="_id"
        columns={[
          { key: 'image', header: 'Preview', render: (b) => (
            <div className="relative h-12 w-24 overflow-hidden rounded">
              <Image src={b.image as string} alt="" fill className="object-cover" sizes="96px" />
            </div>
          )},
          { key: 'title', header: 'Title', render: (b) => <span className="font-medium">{b.title as string}</span> },
          { key: 'position', header: 'Position', render: (b) => <Badge variant="outline">{b.position as string}</Badge> },
          { key: 'sortOrder', header: 'Order' },
          { key: 'isActive', header: 'Status', render: (b) => (
            <Badge variant={b.isActive ? 'default' : 'secondary'}>{b.isActive ? 'Active' : 'Inactive'}</Badge>
          )},
        ]}
      />
    </div>
  );
}
