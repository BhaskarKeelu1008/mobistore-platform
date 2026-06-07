'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { RemoteImage as Image } from '@/components/ui/remote-image';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { OrderTracker } from '@/components/shop/order-tracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download } from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => fetchApi<Order>(`/orders/${orderNumber}`),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p>Order not found</p>
          <Button asChild className="mt-4"><Link href="/account/orders">Back to Orders</Link></Button>
        </CardContent>
      </Card>
    );
  }

  const downloadInvoice = () => {
    const token = localStorage.getItem('accessToken');
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/public/invoices/${order.invoiceNumber || order.orderNumber}/download`;
    window.open(`${url}?token=${token}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/account/orders"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h2 className="text-xl font-bold">Order #{order.orderNumber}</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Placed on {formatDate(order.createdAt)}</p>
        </div>
      </div>

      <OrderTracker order={order} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Items</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  {item.variant && (
                    <p className="text-sm text-zinc-500">
                      {[item.variant.color, item.variant.storage, item.variant.ram].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <p className="text-sm">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                </div>
                <p className="font-medium">{formatPrice(item.total)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(order.shippingCharges)}</span></div>
            <div className="flex justify-between"><span>GST</span><span>{formatPrice(order.totalGst)}</span></div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>
            )}
            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <span>Total</span><span>{formatPrice(order.total)}</span>
            </div>
            <div className="flex gap-2 pt-2">
              <Badge>{order.paymentMethod.toUpperCase()}</Badge>
              <Badge variant="outline">{order.paymentStatus}</Badge>
            </div>
            {order.invoiceNumber && (
              <Button variant="outline" size="sm" className="mt-4 w-full" onClick={downloadInvoice}>
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
        <CardContent>
          <p className="font-medium">{order.shippingAddress.fullName}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {order.shippingAddress.addressLine1}
            {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
          </p>
          <p className="text-sm">Phone: {order.shippingAddress.phone}</p>
        </CardContent>
      </Card>
    </div>
  );
}
