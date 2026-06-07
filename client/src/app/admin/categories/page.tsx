'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { Category, Brand } from '@/types';
import { DataTable } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => fetchApi<Category[]>('/categories'),
  });

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Manage product categories</p>
      </div>
      <DataTable
        data={categories}
        keyField="_id"
        columns={[
          { key: 'icon', header: '', render: (c) => <span className="text-xl">{c.icon as string || '📦'}</span> },
          { key: 'name', header: 'Name', render: (c) => <span className="font-medium">{c.name as string}</span> },
          { key: 'slug', header: 'Slug' },
          { key: 'sortOrder', header: 'Order' },
          { key: 'isActive', header: 'Status', render: (c) => (
            <Badge variant={c.isActive ? 'default' : 'secondary'}>{c.isActive ? 'Active' : 'Inactive'}</Badge>
          )},
        ]}
      />
    </div>
  );
}
