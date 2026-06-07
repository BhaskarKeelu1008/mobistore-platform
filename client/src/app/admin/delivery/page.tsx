'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { DataTable } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';

interface DeliveryZone {
  _id: string;
  name: string;
  pincodes: string[];
  charge: number;
  estimatedDays: number;
  isActive: boolean;
}

export default function AdminDeliveryPage() {
  const { data: zones = [], isLoading } = useQuery({
    queryKey: ['admin-delivery'],
    queryFn: () => fetchApi<DeliveryZone[]>('/admin/delivery-zones'),
  });

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Delivery Management</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Configure delivery zones and charges</p>
      </div>
      <DataTable
        data={zones as unknown as Record<string, unknown>[]}
        keyField="_id"
        columns={[
          { key: 'name', header: 'Zone', render: (z) => <span className="font-medium">{z.name as string}</span> },
          { key: 'pincodes', header: 'Pincodes', render: (z) => (z.pincodes as string[]).slice(0, 3).join(', ') + ((z.pincodes as string[]).length > 3 ? '...' : '') },
          { key: 'charge', header: 'Charge', render: (z) => formatPrice(z.charge as number) },
          { key: 'estimatedDays', header: 'Est. Days', render: (z) => `${z.estimatedDays} days` },
          { key: 'isActive', header: 'Status', render: (z) => (
            <Badge variant={z.isActive ? 'default' : 'secondary'}>{z.isActive ? 'Active' : 'Inactive'}</Badge>
          )},
        ]}
      />
    </div>
  );
}
