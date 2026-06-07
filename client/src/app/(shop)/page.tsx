import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import { serverFetch } from '@/lib/server-api';
import { Banner, Brand, Category, Offer, Product, Review } from '@/types';
import { HeroSlider } from '@/components/shop/hero-slider';
import { ProductGrid } from '@/components/shop/product-grid';
import { CategoryGrid } from '@/components/shop/category-grid';
import { BrandGrid } from '@/components/shop/brand-grid';
import { NewsletterForm } from '@/components/shop/newsletter-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { getEffectivePrice } from '@/lib/product-utils';

async function getHomeData() {
  try {
    const [banners, featured, latest, categories, brands, offers] = await Promise.all([
      serverFetch<Banner[]>('/public/banners'),
      serverFetch<Product[]>('/products/featured'),
      serverFetch<Product[]>('/products/latest'),
      serverFetch<Category[]>('/categories'),
      serverFetch<Brand[]>('/categories/brands'),
      serverFetch<Offer[]>('/public/offers'),
    ]);
    return { banners, featured, latest, categories, brands, offers, error: null };
  } catch (e) {
    return {
      banners: [] as Banner[],
      featured: [] as Product[],
      latest: [] as Product[],
      categories: [] as Category[],
      brands: [] as Brand[],
      offers: [] as Offer[],
      error: e instanceof Error ? e.message : 'Failed to load',
    };
  }
}

export default async function HomePage() {
  const { banners, featured, latest, categories, brands, offers, error } = await getHomeData();

  const topRated = [...featured].sort((a, b) => b.averageRating - a.averageRating).slice(0, 4);

  return (
    <div className="pb-12">
      <section className="container-shop py-6">
        <HeroSlider banners={banners} />
      </section>

      {error && (
        <div className="container-shop mb-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Some content could not be loaded. Make sure the API server is running.
        </div>
      )}

      <section className="container-shop py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="section-title">Shop by Category</h2>
          <Link href="/categories">
            <Button variant="ghost" className="gap-1">View All <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
        <CategoryGrid categories={categories.slice(0, 6)} />
      </section>

      <section className="bg-zinc-50 py-10 dark:bg-zinc-900/50">
        <div className="container-shop">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="section-title">Featured Products</h2>
            <Link href="/products?sort=popular">
              <Button variant="ghost" className="gap-1">View All <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
          <ProductGrid products={featured} emptyMessage="No featured products yet" />
        </div>
      </section>

      {offers.length > 0 && (
        <section className="container-shop py-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="section-title">Hot Offers</h2>
            <Link href="/offers">
              <Button variant="ghost" className="gap-1">View All <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.slice(0, 3).map((offer) => (
              <Card key={offer._id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                    <Badge variant="secondary" className="mb-2 bg-white/20 text-white">
                      {offer.isFlashSale ? 'Flash Sale' : 'Offer'}
                    </Badge>
                    <h3 className="text-xl font-bold">{offer.title}</h3>
                    {offer.description && <p className="mt-1 text-sm text-orange-100">{offer.description}</p>}
                    <p className="mt-3 text-2xl font-bold">
                      {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : formatPrice(offer.discountValue)}
                    </p>
                    <Link href="/offers" className="mt-4 inline-block">
                      <Button variant="secondary" size="sm">Shop Now</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="container-shop py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="section-title">Latest Arrivals</h2>
          <Link href="/products?sort=latest">
            <Button variant="ghost" className="gap-1">View All <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
        <ProductGrid products={latest} emptyMessage="No products yet" />
      </section>

      <section className="bg-zinc-50 py-10 dark:bg-zinc-900/50">
        <div className="container-shop">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="section-title">Top Brands</h2>
            <Link href="/brands">
              <Button variant="ghost" className="gap-1">View All <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
          <BrandGrid brands={brands.slice(0, 6)} />
        </div>
      </section>

      {topRated.some((p) => p.reviewCount > 0) && (
        <section className="container-shop py-10">
          <h2 className="section-title mb-6">Highly Rated</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topRated.filter((p) => p.reviewCount > 0).map((product) => {
              const { price } = getEffectivePrice(product);
              return (
                <Card key={product._id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.round(product.averageRating) ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <Link href={`/products/${product.slug}`} className="mt-2 block font-medium hover:text-blue-600">
                      {product.name}
                    </Link>
                    <p className="mt-1 text-sm text-blue-600 font-semibold">{formatPrice(price)}</p>
                    <p className="text-xs text-zinc-500">{product.reviewCount} reviews</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <section className="container-shop py-10">
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Stay in the loop</h2>
              <p className="mt-2 text-blue-100">Subscribe for exclusive deals and new product alerts.</p>
            </div>
            <div className="w-full max-w-sm">
              <NewsletterForm />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
