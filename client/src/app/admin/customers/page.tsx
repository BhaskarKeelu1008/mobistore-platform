'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { User } from '@/types';
import { formatDate } from '@/lib/utils';
import { DataTable } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminCustomersPage() {
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => fetchApi<User[]>('/admin/customers'),
  });

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{customers.length} registered customers</p>
      </div>
      <DataTable
        data={customers as unknown as Record<string, unknown>[]}
        keyField="_id"
        columns={[
          { key: 'name', header: 'Name', render: (c) => <span className="font-medium">{c.name as string}</span> },
          { key: 'email', header: 'Email' },
          { key: 'phone', header: 'Phone' },
          { key: 'isVerified', header: 'Verified', render: (c) => (
            <Badge variant={c.isVerified ? 'default' : 'secondary'}>{c.isVerified ? 'Yes' : 'No'}</Badge>
          )},
          { key: 'createdAt', header: 'Joined', render: (c) => formatDate(c.createdAt as string) },
        ]}
      />
    </div>
  );
}
