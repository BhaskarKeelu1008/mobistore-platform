'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import api from '@/lib/api';
import { Order } from '@/types';
import { OrderTracker } from '@/components/shop/order-tracker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderNumber') || '');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState({ orderNumber: searchParams.get('orderNumber') || '', phone: '' });

  const { data: order, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['track-order', submitted.orderNumber, submitted.phone],
    queryFn: async () => {
      const { data } = await api.get('/orders/track', {
        params: { orderNumber: submitted.orderNumber, phone: submitted.phone },
      });
      return data.data as Order;
    },
    enabled: !!submitted.orderNumber && !!submitted.phone,
    retry: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted({ orderNumber, phone });
    refetch();
  };

  return (
    <div className="container-shop py-8">
      <h1 className="section-title mb-2">Track Your Order</h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">Enter your order number and phone to track delivery status</p>

      <Card className="mb-8 max-w-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. ORD-20240101-1234"
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                required
                pattern="[6-9][0-9]{9}"
                className="mt-1.5"
              />
            </div>
            <Button type="submit" className="w-full gap-2">
              <Search className="h-4 w-4" /> Track Order
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && submitted.orderNumber && (
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      )}

      {isError && submitted.orderNumber && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950">
          {(error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Order not found. Please check your details.'}
        </div>
      )}

      {order && (
        <div className="space-y-6">
          <OrderTracker order={order} />

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 font-semibold">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                      <Image src={item.image} alt={item.name} fill className="object-contain p-1" sizes="64px" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-zinc-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatPrice(item.total)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t border-zinc-200 pt-4 dark:border-zinc-700">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-blue-600">{formatPrice(order.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<Skeleton className="container-shop h-96 py-8" />}>
      <TrackOrderContent />
    </Suspense>
  );
}
