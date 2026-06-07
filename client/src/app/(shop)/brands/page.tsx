import { serverFetch } from '@/lib/server-api';
import { Brand } from '@/types';
import { BrandGrid } from '@/components/shop/brand-grid';

export const metadata = { title: 'Brands' };

export default async function BrandsPage() {
  let brands: Brand[] = [];
  let error: string | null = null;

  try {
    brands = await serverFetch<Brand[]>('/categories/brands');
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load brands';
  }

  return (
    <div className="container-shop py-8">
      <h1 className="section-title mb-2">Brands</h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">Shop by your favorite mobile brands</p>
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950">{error}</div>
      )}
      <BrandGrid brands={brands} />
    </div>
  );
}
