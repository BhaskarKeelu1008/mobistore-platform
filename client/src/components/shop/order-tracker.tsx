'use client';

import { Check, Package, Truck } from 'lucide-react';
import { Order } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_STEPS } from '@/lib/product-utils';
import { cn } from '@/lib/utils';

interface OrderTrackerProps {
  order: Order;
}

export function OrderTracker({ order }: OrderTrackerProps) {
  const currentStepIndex = ORDER_STATUS_STEPS.indexOf(
    order.orderStatus as (typeof ORDER_STATUS_STEPS)[number]
  );
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Order #{order.orderNumber}</CardTitle>
            <p className="text-sm text-zinc-500">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <Badge variant={order.orderStatus === 'delivered' ? 'success' : 'secondary'}>
            {ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus}
          </Badge>
        </CardHeader>
        <CardContent>
          {!isCancelled && (
            <div className="relative">
              <div className="absolute left-4 top-0 h-full w-0.5 bg-zinc-200 dark:bg-zinc-700" />
              <div className="space-y-6">
                {ORDER_STATUS_STEPS.map((step, index) => {
                  const isComplete = index <= currentStepIndex;
                  const update = order.trackingUpdates.find((u) => u.status === step);
                  return (
                    <div key={step} className="relative flex gap-4 pl-10">
                      <div
                        className={cn(
                          'absolute left-2.5 flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full border-2',
                          isComplete ? 'border-blue-600 bg-blue-600' : 'border-zinc-300 bg-white dark:bg-zinc-950'
                        )}
                      >
                        {isComplete && <Check className="h-2 w-2 text-white" />}
                      </div>
                      <div>
                        <p className={cn('font-medium', isComplete ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400')}>
                          {ORDER_STATUS_LABELS[step]}
                        </p>
                        {update && (
                          <p className="text-sm text-zinc-500">{update.message} · {formatDate(update.timestamp)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isCancelled && (
            <p className="text-red-600">This order has been cancelled.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-zinc-500">Payment</p>
              <p className="font-medium capitalize">{order.paymentMethod} · {order.paymentStatus}</p>
            </div>
          </CardContent>
        </Card>
        {order.estimatedDelivery && (
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <Truck className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-zinc-500">Estimated Delivery</p>
                <p className="font-medium">{formatDate(order.estimatedDelivery)}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
