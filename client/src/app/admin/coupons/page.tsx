'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { DataTable } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Coupon {
  _id: string;
  code: string;
  discountType: string;
  discountValue: number;
  usedCount: number;
  usageLimit: number;
  validUntil: string;
  isActive: boolean;
}

export default function AdminCouponsPage() {
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => fetchApi<Coupon[]>('/admin/coupons'),
  });

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Coupons</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Manage discount coupon codes</p>
      </div>
      <DataTable
        data={coupons as unknown as Record<string, unknown>[]}
        keyField="_id"
        columns={[
          { key: 'code', header: 'Code', render: (c) => <code className="font-bold">{c.code as string}</code> },
          { key: 'discountValue', header: 'Discount', render: (c) => `${c.discountValue}${c.discountType === 'percentage' ? '%' : ' ₹'}` },
          { key: 'usedCount', header: 'Usage', render: (c) => `${c.usedCount}/${c.usageLimit}` },
          { key: 'validUntil', header: 'Expires', render: (c) => formatDate(c.validUntil as string) },
          { key: 'isActive', header: 'Status', render: (c) => (
            <Badge variant={c.isActive ? 'default' : 'secondary'}>{c.isActive ? 'Active' : 'Inactive'}</Badge>
          )},
        ]}
      />
    </div>
  );
}
