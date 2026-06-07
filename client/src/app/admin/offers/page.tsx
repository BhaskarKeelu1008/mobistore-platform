'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { Offer } from '@/types';
import { formatDate } from '@/lib/utils';
import { DataTable } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminOffersPage() {
  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['admin-offers'],
    queryFn: () => fetchApi<Offer[]>('/admin/offers'),
  });

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Offers</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Manage promotional offers and flash sales</p>
      </div>
      <DataTable
        data={offers as unknown as Record<string, unknown>[]}
        keyField="_id"
        columns={[
          { key: 'title', header: 'Offer', render: (o) => <span className="font-medium">{o.title as string}</span> },
          { key: 'discountValue', header: 'Discount', render: (o) => `${o.discountValue}${o.discountType === 'percentage' ? '%' : ' ₹'}` },
          { key: 'validUntil', header: 'Valid Until', render: (o) => formatDate(o.validUntil as string) },
          { key: 'isFlashSale', header: 'Flash Sale', render: (o) => o.isFlashSale ? <Badge>Flash</Badge> : '-' },
          { key: 'isActive', header: 'Status', render: (o) => (
            <Badge variant={o.isActive ? 'default' : 'secondary'}>{o.isActive ? 'Active' : 'Inactive'}</Badge>
          )},
        ]}
      />
    </div>
  );
}
