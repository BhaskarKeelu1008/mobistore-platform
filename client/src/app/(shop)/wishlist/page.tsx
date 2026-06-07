'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { Product } from '@/types';
import { ProductGrid } from '@/components/shop/product-grid';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/wishlist');
    }
  }, [isAuthenticated, authLoading, router]);

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => fetchApi<Product[]>('/public/wishlist'),
    enabled: isAuthenticated,
  });

  if (authLoading || !isAuthenticated) {
    return (
      <div className="container-shop py-8">
        <Skeleton className="h-10 w-48" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-shop py-8">
      <div className="mb-8 flex items-center gap-3">
        <Heart className="h-8 w-8 text-red-500" />
        <div>
          <h1 className="section-title">My Wishlist</h1>
          <p className="text-zinc-600 dark:text-zinc-400">{products.length} items saved</p>
        </div>
      </div>

      {isError && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950">Failed to load wishlist</div>
      )}

      {!isLoading && !products.length && (
        <div className="flex flex-col items-center py-16 text-center">
          <Heart className="h-16 w-16 text-zinc-300" />
          <p className="mt-4 text-zinc-500">Your wishlist is empty</p>
          <Link href="/products" className="mt-4">
            <Button>Browse Products</Button>
          </Link>
        </div>
      )}

      <ProductGrid products={products} loading={isLoading} emptyMessage="Your wishlist is empty" />
    </div>
  );
}
