import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/server-api';
import { Brand } from '@/types';
import { ProductsListing } from '@/components/shop/products-listing';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  try {
    const { slug } = await params;
    const brand = await serverFetch<Brand>(`/categories/brands/${slug}`);
    return { title: brand.name, description: brand.description };
  } catch {
    return { title: 'Brand Not Found' };
  }
}

export default async function BrandDetailPage({ params }: Props) {
  const { slug } = await params;

  let brand: Brand;
  try {
    brand = await serverFetch<Brand>(`/categories/brands/${slug}`);
  } catch {
    notFound();
  }

  return (
    <Suspense fallback={<Skeleton className="container-shop h-96 py-8" />}>
      <ProductsListing
        title={brand.name}
        description={brand.description}
        basePath={`/brands/${slug}`}
        fixedParams={{ brand: brand._id }}
      />
    </Suspense>
  );
}
