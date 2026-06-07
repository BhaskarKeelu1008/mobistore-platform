import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/server-api';
import { ProductDetailResponse } from '@/types';
import { ProductDetail } from '@/components/shop/product-detail';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  try {
    const { slug } = await params;
    const data = await serverFetch<ProductDetailResponse>(`/products/${slug}`);
    return { title: data.product.name, description: data.product.shortDescription || data.product.name };
  } catch {
    return { title: 'Product Not Found' };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  try {
    const data = await serverFetch<ProductDetailResponse>(`/products/${slug}`);
    return (
      <div className="container-shop py-8">
        <ProductDetail product={data.product} reviews={data.reviews} similarProducts={data.similarProducts} />
      </div>
    );
  } catch {
    notFound();
  }
}
