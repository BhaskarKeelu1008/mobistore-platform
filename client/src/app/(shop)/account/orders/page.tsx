'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => fetchApi<Order[]>('/orders/my-orders'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-16">
          <Package className="mb-4 h-12 w-12 text-zinc-400" />
          <p className="text-lg font-medium">No orders yet</p>
          <p className="mb-4 text-zinc-600 dark:text-zinc-400">Start shopping to see your orders here</p>
          <Button asChild><Link href="/products">Browse Products</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      {orders.map((order) => (
        <Card key={order._id}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold">#{order.orderNumber}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={statusColors[order.orderStatus] || ''}>
                  {order.orderStatus.replace(/_/g, ' ')}
                </Badge>
                <Badge variant="outline">{order.paymentStatus}</Badge>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex -space-x-2">
                {order.items.slice(0, 3).map((item, i) => (
                  <div key={i} className="relative h-12 w-12 overflow-hidden rounded-lg border-2 border-white dark:border-zinc-900">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {order.items.length} item(s) · {formatPrice(order.total)}
              </p>
              <Button asChild size="sm" className="ml-auto">
                <Link href={`/account/orders/${order.orderNumber}`}>View Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
