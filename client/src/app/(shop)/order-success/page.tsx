import { Suspense } from 'react';
import OrderSuccessContent from './order-success-content';

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="container-shop py-16"><div className="mx-auto h-64 max-w-md animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" /></div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
