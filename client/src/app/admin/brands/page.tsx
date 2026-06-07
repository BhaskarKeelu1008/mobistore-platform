'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { Brand } from '@/types';
import { DataTable } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminBrandsPage() {
  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: () => fetchApi<Brand[]>('/categories/brands'),
  });

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Brands</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Manage product brands</p>
      </div>
      <DataTable
        data={brands}
        keyField="_id"
        columns={[
          { key: 'name', header: 'Brand', render: (b) => <span className="font-medium">{b.name as string}</span> },
          { key: 'slug', header: 'Slug' },
          { key: 'sortOrder', header: 'Order' },
          { key: 'isActive', header: 'Status', render: (b) => (
            <Badge variant={b.isActive ? 'default' : 'secondary'}>{b.isActive ? 'Active' : 'Inactive'}</Badge>
          )},
        ]}
      />
    </div>
  );
}
