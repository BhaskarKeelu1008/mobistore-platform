'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { getEffectivePrice, getProductImage, getBrandName, isInStock } from '@/lib/product-utils';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { price, originalPrice, discountPercent } = getEffectivePrice(product);
  const image = getProductImage(product);
  const inStock = isInStock(product);
  const addItem = useCartStore((s) => s.addItem);
  const { isAuthenticated } = useAuthStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!inStock) {
      toast.error('Out of stock');
      return;
    }
    addItem({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image,
      price,
      originalPrice,
      quantity: 1,
      stock: product.totalStock,
      gstRate: product.gstRate,
    });
    toast.success('Added to cart');
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
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
    <Card className={cn('group overflow-hidden transition-shadow hover:shadow-lg', className)}>
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {discountPercent > 0 && (
            <Badge className="absolute left-2 top-2" variant="destructive">
              {discountPercent}% OFF
            </Badge>
          )}
          {!inStock && (
            <Badge className="absolute right-2 top-2" variant="secondary">
              Out of Stock
            </Badge>
          )}
          <button
            onClick={handleWishlist}
            className="absolute right-2 bottom-2 rounded-full bg-white/90 p-2 opacity-0 shadow transition-opacity group-hover:opacity-100 dark:bg-zinc-900/90"
            aria-label="Add to wishlist"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
        <CardContent className="p-4">
          {getBrandName(product) && (
            <p className="text-xs font-medium uppercase text-zinc-500">{getBrandName(product)}</p>
          )}
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug">{product.name}</h3>
          {product.averageRating > 0 && (
            <div className="mt-1 flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {product.averageRating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>
          )}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatPrice(price)}</span>
            {discountPercent > 0 && (
              <span className="text-sm text-zinc-400 line-through">{formatPrice(originalPrice)}</span>
            )}
          </div>
        </CardContent>
      </Link>
      <div className="px-4 pb-4">
        <Button className="w-full gap-2" size="sm" disabled={!inStock} onClick={handleAddToCart}>
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </Card>
  );
}
