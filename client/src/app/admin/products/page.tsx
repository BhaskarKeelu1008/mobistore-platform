'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { DataTable } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';

export default function AdminProductsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => fetchApi<Product[]>('/products?limit=100'),
  });

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Manage your product catalog</p>
        </div>
        <Button asChild><Link href="/admin/products/new"><Plus className="mr-2 h-4 w-4" />Add Product</Link></Button>
      </div>
      <DataTable
        data={(data as Product[]) || []}
        keyField="_id"
        columns={[
          { key: 'name', header: 'Product', render: (p) => <span className="font-medium">{p.name as string}</span> },
          { key: 'basePrice', header: 'Price', render: (p) => formatPrice((p.discountPrice as number) || (p.basePrice as number)) },
          { key: 'totalStock', header: 'Stock', render: (p) => (
            <Badge variant={(p.totalStock as number) <= 10 ? 'destructive' : 'outline'}>{String(p.totalStock)}</Badge>
          )},
          { key: 'soldCount', header: 'Sold' },
          { key: 'isActive', header: 'Status', render: (p) => (
            <Badge variant={p.isActive ? 'default' : 'secondary'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
          )},
        ]}
      />
    </div>
  );
}
