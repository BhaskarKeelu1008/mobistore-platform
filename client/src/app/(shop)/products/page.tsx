import { Suspense } from 'react';
import { ProductsListing } from '@/components/shop/products-listing';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = { title: 'All Products' };

function ProductsFallback() {
  return (
    <div className="container-shop py-8">
      <Skeleton className="mb-8 h-10 w-64" />
      <div className="grid gap-8 lg:grid-cols-4">
        <Skeleton className="h-96 rounded-xl" />
        <div className="grid grid-cols-2 gap-4 lg:col-span-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsFallback />}>
      <ProductsListing title="All Products" description="Browse our complete collection of smartphones and accessories." />
    </Suspense>
  );
}
