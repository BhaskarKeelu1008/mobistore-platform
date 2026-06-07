'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, Heart, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Product, Review } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import {
  getEffectivePrice,
  getProductImage,
  getBrandName,
  getCategoryName,
  getUniqueVariantOptions,
  findVariant,
  isInStock,
} from '@/lib/product-utils';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { ReviewSection } from './review-section';
import { ProductGrid } from './product-grid';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface ProductDetailProps {
  product: Product;
  reviews: Review[];
  similarProducts: Product[];
}

export function ProductDetail({ product, reviews, similarProducts }: ProductDetailProps) {
  const { colors, storages, rams } = getUniqueVariantOptions(product);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedStorage, setSelectedStorage] = useState(storages[0]);
  const [selectedRam, setSelectedRam] = useState(rams[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const variant = product.variants.length
    ? findVariant(product, { color: selectedColor, storage: selectedStorage, ram: selectedRam })
    : undefined;

  const { price, originalPrice, discountPercent } = getEffectivePrice(product, variant);
  const images = variant?.images?.length ? variant.images : product.images;
  const inStock = isInStock(product, variant);
  const stock = variant?.stock ?? product.totalStock;

  const addItem = useCartStore((s) => s.addItem);
  const { isAuthenticated } = useAuthStore();

  const handleAddToCart = () => {
    if (!inStock) {
      toast.error('Out of stock');
      return;
    }
    addItem({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: getProductImage(product, variant),
      price,
      originalPrice,
      quantity,
      variantSku: variant?.sku,
      variant: variant ? { color: variant.color, storage: variant.storage, ram: variant.ram } : undefined,
      stock,
      gstRate: product.gstRate,
    });
    toast.success('Added to cart');
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      return;
    }
    try {
      await api.post(`/public/wishlist/${product._id}`);
      toast.success('Wishlist updated');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <div className="space-y-12">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={images[activeImage] || getProductImage(product, variant)}
              alt={product.name}
              fill
              className="object-contain p-6"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {discountPercent > 0 && (
              <Badge className="absolute left-4 top-4" variant="destructive">{discountPercent}% OFF</Badge>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-zinc-100 dark:bg-zinc-800',
                    activeImage === i ? 'border-blue-600' : 'border-transparent'
                  )}
                >
                  <Image src={img} alt="" fill className="object-contain p-1" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              {getBrandName(product) && (
                <Link href={`/brands/${typeof product.brand === 'object' ? product.brand.slug : ''}`} className="text-sm font-medium text-blue-600">
                  {getBrandName(product)}
                </Link>
              )}
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{product.name}</h1>
              {product.averageRating > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-4 w-4',
                          i < Math.round(product.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-zinc-600">{product.averageRating.toFixed(1)} ({product.reviewCount} reviews)</span>
                </div>
              )}
            </div>
            <Button variant="outline" size="icon" onClick={handleWishlist}>
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-blue-600">{formatPrice(price)}</span>
            {discountPercent > 0 && (
              <>
                <span className="text-lg text-zinc-400 line-through">{formatPrice(originalPrice)}</span>
                <Badge variant="success">Save {discountPercent}%</Badge>
              </>
            )}
          </div>

          {product.shortDescription && (
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">{product.shortDescription}</p>
          )}

          {colors.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium">Color: {selectedColor}</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      'rounded-lg border px-4 py-2 text-sm transition-colors',
                      selectedColor === color ? 'border-blue-600 bg-blue-50 dark:bg-blue-950' : 'border-zinc-200 dark:border-zinc-700'
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {storages.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">Storage</p>
              <div className="flex flex-wrap gap-2">
                {storages.map((storage) => (
                  <button
                    key={storage}
                    onClick={() => setSelectedStorage(storage)}
                    className={cn(
                      'rounded-lg border px-4 py-2 text-sm transition-colors',
                      selectedStorage === storage ? 'border-blue-600 bg-blue-50 dark:bg-blue-950' : 'border-zinc-200 dark:border-zinc-700'
                    )}
                  >
                    {storage}
                  </button>
                ))}
              </div>
            </div>
          )}

          {rams.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">RAM</p>
              <div className="flex flex-wrap gap-2">
                {rams.map((ram) => (
                  <button
                    key={ram}
                    onClick={() => setSelectedRam(ram)}
                    className={cn(
                      'rounded-lg border px-4 py-2 text-sm transition-colors',
                      selectedRam === ram ? 'border-blue-600 bg-blue-50 dark:bg-blue-950' : 'border-zinc-200 dark:border-zinc-700'
                    )}
                  >
                    {ram}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700">
              <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.min(stock, quantity + 1))} disabled={quantity >= stock}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-zinc-500">{inStock ? `${stock} in stock` : 'Out of stock'}</p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="flex-1 gap-2" disabled={!inStock} onClick={handleAddToCart}>
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </Button>
            <Link href="/checkout" className="flex-1">
              <Button size="lg" variant="outline" className="w-full" disabled={!inStock} onClick={handleAddToCart}>
                Buy Now
              </Button>
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
            <div className="text-center">
              <Truck className="mx-auto h-5 w-5 text-blue-600" />
              <p className="mt-1 text-xs font-medium">Free Delivery</p>
            </div>
            <div className="text-center">
              <Shield className="mx-auto h-5 w-5 text-blue-600" />
              <p className="mt-1 text-xs font-medium">{product.warranty || 'Warranty'}</p>
            </div>
            <div className="text-center">
              <RotateCcw className="mx-auto h-5 w-5 text-blue-600" />
              <p className="mt-1 text-xs font-medium">{product.returnPolicy || '7-Day Return'}</p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="section-title mb-4">Description</h2>
            <div className="prose prose-zinc max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }} />
          </section>

          {product.specifications.length > 0 && (
            <section>
              <h2 className="section-title mb-4">Specifications</h2>
              <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-sm">
                  <tbody>
                    {product.specifications.map((spec, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-zinc-50 dark:bg-zinc-900' : ''}>
                        <td className="px-4 py-3 font-medium">{spec.label}</td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <ReviewSection productId={product._id} reviews={reviews} reviewCount={product.reviewCount} averageRating={product.averageRating} />
        </div>

        <div>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-zinc-500">Category</p>
              <Link href={`/categories/${typeof product.category === 'object' ? product.category.slug : ''}`} className="font-medium text-blue-600">
                {getCategoryName(product)}
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <section>
          <h2 className="section-title mb-6">Similar Products</h2>
          <ProductGrid products={similarProducts} />
        </section>
      )}
    </div>
  );
}