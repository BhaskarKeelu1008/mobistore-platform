'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { Address, Settings } from '@/types';
import { CheckoutForm } from '@/components/shop/checkout-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const items = useCartStore((s) => s.items);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && !items.length) {
      router.push('/cart');
    }
  }, [items.length, isLoading, router]);

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => fetchApi<Settings>('/public/settings'),
  });

  const { data: addresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => fetchApi<Address[]>('/public/addresses'),
    enabled: isAuthenticated,
  });

  if (isLoading || settingsLoading || addressesLoading) {
    return (
      <div className="container-shop space-y-6 py-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-8 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-shop py-8">
      <h1 className="section-title mb-8">Checkout</h1>
      <CheckoutForm settings={settings} addresses={addresses} />
    </div>
  );
}
