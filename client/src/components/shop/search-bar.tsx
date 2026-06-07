'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RemoteImage as Image } from '@/components/ui/remote-image';
import { Search, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Product } from '@/types';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { getEffectivePrice, getProductImage } from '@/lib/product-utils';
import { cn } from '@/lib/utils';

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: suggestions = [], isFetching } = useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: async () => {
      const { data } = await api.get('/products/search/suggestions', { params: { q: query } });
      return data.data as Product[];
    },
    enabled: query.length >= 2,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="search"
            placeholder="Search phones, accessories..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className="pl-9 pr-9"
          />
          {isFetching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-400" />
          )}
        </div>
      </form>

      {open && query.length >= 2 && (
        <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {suggestions.length === 0 && !isFetching ? (
            <p className="p-4 text-sm text-zinc-500">No results found</p>
          ) : (
            suggestions.map((product) => {
              const { price } = getEffectivePrice(product);
              return (
                <Link
                  key={product._id}
                  href={`/products/${product.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 border-b border-zinc-100 p-3 last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                    <Image src={getProductImage(product)} alt="" fill className="object-contain p-1" sizes="40px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-blue-600">{formatPrice(price)}</p>
                  </div>
                </Link>
              );
            })
          )}
          {suggestions.length > 0 && (
            <button
              onClick={() => {
                router.push(`/products?search=${encodeURIComponent(query)}`);
                setOpen(false);
              }}
              className={cn('w-full p-3 text-center text-sm font-medium text-blue-600 hover:bg-zinc-50 dark:hover:bg-zinc-800')}
            >
              View all results for &quot;{query}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
