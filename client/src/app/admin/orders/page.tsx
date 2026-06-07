'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api, { fetchApi } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { DataTable } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => fetchApi<Order[]>(`/orders${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, orderStatus }: { id: string; orderStatus: string }) =>
      api.put(`/orders/${id}/status`, { orderStatus, message: `Status updated to ${orderStatus}` }),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelectedOrder(null);
    },
    onError: () => toast.error('Failed to update status'),
  });

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Manage customer orders</p>
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
          <option value="all">All Orders</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </Select>
      </div>

      <DataTable
        data={orders}
        keyField="_id"
        onRowClick={(o) => setSelectedOrder(o as unknown as Order)}
        columns={[
          { key: 'orderNumber', header: 'Order #', render: (o) => <span className="font-medium">{o.orderNumber as string}</span> },
          { key: 'total', header: 'Total', render: (o) => formatPrice(o.total as number) },
          { key: 'paymentMethod', header: 'Payment', render: (o) => <Badge variant="outline">{(o.paymentMethod as string).toUpperCase()}</Badge> },
          { key: 'orderStatus', header: 'Status', render: (o) => <Badge>{(o.orderStatus as string).replace(/_/g, ' ')}</Badge> },
          { key: 'createdAt', header: 'Date', render: (o) => formatDate(o.createdAt as string) },
        ]}
      />

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-zinc-900">
            <h3 className="text-lg font-bold">Update Order #{selectedOrder.orderNumber}</h3>
            <p className="mb-4 text-sm text-zinc-500">Current: {selectedOrder.orderStatus}</p>
            <div className="grid grid-cols-2 gap-2">
              {statuses.map((s) => (
                <Button
                  key={s}
                  variant={selectedOrder.orderStatus === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateStatus.mutate({ id: selectedOrder._id, orderStatus: s })}
                  disabled={updateStatus.isPending}
                >
                  {s.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>
            <Button variant="ghost" className="mt-4 w-full" onClick={() => setSelectedOrder(null)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
