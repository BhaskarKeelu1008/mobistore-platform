import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/server-api';
import { Category } from '@/types';
import { ProductsListing } from '@/components/shop/products-listing';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  try {
    const { slug } = await params;
    const category = await serverFetch<Category>(`/categories/${slug}`);
    return { title: category.name, description: category.description };
  } catch {
    return { title: 'Category Not Found' };
  }
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;

  let category: Category;
  try {
    category = await serverFetch<Category>(`/categories/${slug}`);
  } catch {
    notFound();
  }

  return (
    <Suspense fallback={<Skeleton className="container-shop h-96 py-8" />}>
      <ProductsListing
        title={category.name}
        description={category.description}
        basePath={`/categories/${slug}`}
        fixedParams={{ category: category._id }}
      />
    </Suspense>
  );
}
