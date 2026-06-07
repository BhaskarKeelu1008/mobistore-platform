'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Brand, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductFiltersProps {
  basePath?: string;
}

export function ProductFilters({ basePath = '/products' }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchApi<Category[]>('/categories'),
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => fetchApi<Brand[]>('/categories/brands'),
  });

  const updateParams = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete('page');
      router.push(`${basePath}?${params.toString()}`);
    },
    [router, searchParams, basePath]
  );

  const clearFilters = () => router.push(basePath);

  const hasFilters = searchParams.toString().length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Filters</CardTitle>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-xs">
            <X className="h-3 w-3" /> Clear
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search products..."
            defaultValue={searchParams.get('search') || ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateParams('search', (e.target as HTMLInputElement).value || null);
            }}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="sort">Sort By</Label>
          <Select
            id="sort"
            value={searchParams.get('sort') || 'latest'}
            onChange={(e) => updateParams('sort', e.target.value)}
            className="mt-1.5"
          >
            <option value="latest">Latest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Popular</option>
            <option value="rating">Top Rated</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            id="category"
            value={searchParams.get('category') || ''}
            onChange={(e) => updateParams('category', e.target.value || null)}
            className="mt-1.5"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="brand">Brand</Label>
          <Select
            id="brand"
            value={searchParams.get('brand') || ''}
            onChange={(e) => updateParams('brand', e.target.value || null)}
            className="mt-1.5"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="minPrice">Min Price</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="0"
              defaultValue={searchParams.get('minPrice') || ''}
              onBlur={(e) => updateParams('minPrice', e.target.value || null)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="maxPrice">Max Price</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="99999"
              defaultValue={searchParams.get('maxPrice') || ''}
              onBlur={(e) => updateParams('maxPrice', e.target.value || null)}
              className="mt-1.5"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="rating">Min Rating</Label>
          <Select
            id="rating"
            value={searchParams.get('rating') || ''}
            onChange={(e) => updateParams('rating', e.target.value || null)}
            className="mt-1.5"
          >
            <option value="">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="inStock"
            checked={searchParams.get('availability') === 'in_stock'}
            onCheckedChange={(checked) => updateParams('availability', checked ? 'in_stock' : null)}
          />
          <Label htmlFor="inStock" className="cursor-pointer">In Stock Only</Label>
        </div>
      </CardContent>
    </Card>
  );
}
