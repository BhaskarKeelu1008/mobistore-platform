import { serverFetch } from '@/lib/server-api';
import { Category } from '@/types';
import { CategoryGrid } from '@/components/shop/category-grid';

export const metadata = { title: 'Categories' };

export default async function CategoriesPage() {
  let categories: Category[] = [];
  let error: string | null = null;

  try {
    categories = await serverFetch<Category[]>('/categories');
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load categories';
  }

  return (
    <div className="container-shop py-8">
      <h1 className="section-title mb-2">Categories</h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">Browse products by category</p>
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950">{error}</div>
      )}
      <CategoryGrid categories={categories} />
    </div>
  );
}
