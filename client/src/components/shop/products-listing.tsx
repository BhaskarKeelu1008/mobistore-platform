'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Product } from '@/types';
import { ProductGrid } from '@/components/shop/product-grid';
import { ProductFilters } from '@/components/shop/product-filters';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductsListingProps {
  title: string;
  description?: string;
  basePath?: string;
  fixedParams?: Record<string, string>;
}

export function ProductsListing({ title, description, basePath = '/products', fixedParams = {} }: ProductsListingProps) {
  const searchParams = useSearchParams();
  const page = searchParams.get('page') || '1';

  const params: Record<string, string> = {
    page,
    limit: '12',
    sort: searchParams.get('sort') || 'latest',
    ...fixedParams,
  };

  ['search', 'category', 'brand', 'minPrice', 'maxPrice', 'rating', 'availability', 'ram', 'storage', 'color'].forEach((key) => {
    const val = searchParams.get(key);
    if (val) params[key] = val;
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const { data: res } = await api.get('/products', { params });
      return { products: res.data as Product[], pagination: res.pagination };
    },
  });

  const products = data?.products || [];
  const pagination = data?.pagination;

  const buildPageUrl = (p: number) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('page', String(p));
    return `${basePath}?${sp.toString()}`;
  };

  return (
    <div className="container-shop py-8">
      <div className="mb-8">
        <h1 className="section-title">{title}</h1>
        {description && <p className="mt-2 text-zinc-600 dark:text-zinc-400">{description}</p>}
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <ProductFilters basePath={basePath} />
        </aside>

        <div className="lg:col-span-3">
          {isError && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {(error as Error)?.message || 'Failed to load products'}
            </div>
          )}

          <ProductGrid products={products} loading={isLoading} />

          {pagination && pagination.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button variant="outline" size="sm" disabled={pagination.page <= 1} asChild={pagination.page > 1}>
                {pagination.page > 1 ? (
                  <a href={buildPageUrl(pagination.page - 1)}><ChevronLeft className="h-4 w-4" /> Prev</a>
                ) : (
                  <span><ChevronLeft className="h-4 w-4" /> Prev</span>
                )}
              </Button>
              <span className="text-sm text-zinc-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages} asChild={pagination.page < pagination.pages}>
                {pagination.page < pagination.pages ? (
                  <a href={buildPageUrl(pagination.page + 1)}>Next <ChevronRight className="h-4 w-4" /></a>
                ) : (
                  <span>Next <ChevronRight className="h-4 w-4" /></span>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
