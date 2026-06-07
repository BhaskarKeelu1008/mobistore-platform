'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api, { fetchApi } from '@/lib/api';
import { Product } from '@/types';
import { DataTable } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminInventoryPage() {
  const queryClient = useQueryClient();
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [variantSku, setVariantSku] = useState('');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: () => fetchApi<Product[]>('/products?limit=100'),
  });

  const lowStock = products.filter((p) => p.totalStock <= 10);

  const addStock = useMutation({
    mutationFn: () => api.post('/admin/inventory/add', {
      productId,
      quantity: parseInt(quantity, 10),
      variantSku: variantSku || undefined,
    }),
    onSuccess: () => {
      toast.success('Stock added');
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      setQuantity('');
    },
    onError: () => toast.error('Failed to add stock'),
  });

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Track and manage stock levels</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Add Stock</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label>Product ID</Label>
              <Input value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="Product _id" />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Variant SKU (optional)</Label>
              <Input value={variantSku} onChange={(e) => setVariantSku(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={() => addStock.mutate()} disabled={!productId || !quantity || addStock.isPending}>
                Add Stock
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-orange-600">Low Stock Alert ({lowStock.length})</h2>
        <DataTable
          data={lowStock as unknown as Record<string, unknown>[]}
          keyField="_id"
          emptyMessage="All products are well stocked"
          columns={[
            { key: 'name', header: 'Product', render: (p) => <span className="font-medium">{p.name as string}</span> },
            { key: 'totalStock', header: 'Stock', render: (p) => <Badge variant="destructive">{String(p.totalStock)}</Badge> },
            { key: '_id', header: 'Product ID', render: (p) => <code className="text-xs">{p._id as string}</code> },
          ]}
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">All Products Stock</h2>
        <DataTable
          data={products as unknown as Record<string, unknown>[]}
          keyField="_id"
          columns={[
            { key: 'name', header: 'Product' },
            { key: 'totalStock', header: 'Stock', render: (p) => (
              <Badge variant={(p.totalStock as number) <= 10 ? 'destructive' : 'outline'}>{String(p.totalStock)}</Badge>
            )},
            { key: 'soldCount', header: 'Sold' },
          ]}
        />
      </div>
    </div>
  );
}
