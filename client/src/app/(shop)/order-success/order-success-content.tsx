'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <div className="container-shop flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      <h1 className="mt-6 text-3xl font-bold">Order Placed Successfully!</h1>
      <p className="mt-2 max-w-md text-zinc-600 dark:text-zinc-400">
        Thank you for your purchase. We&apos;ve received your order and will process it shortly.
      </p>

      {orderNumber && (
        <Card className="mt-8 w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-sm text-zinc-500">Order Number</p>
            <p className="text-2xl font-bold text-blue-600">{orderNumber}</p>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {orderNumber && (
          <Link href={`/track-order?orderNumber=${orderNumber}`}>
            <Button variant="outline" className="gap-2">
              <Package className="h-4 w-4" /> Track Order
            </Button>
          </Link>
        )}
        <Link href="/account/orders">
          <Button variant="outline">View My Orders</Button>
        </Link>
        <Link href="/">
          <Button className="gap-2">
            <Home className="h-4 w-4" /> Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
