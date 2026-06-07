import { Product, ProductVariant } from '@/types';
import { getDiscountPercent } from '@/lib/utils';

export function getEffectivePrice(product: Product, variant?: ProductVariant): {
  price: number;
  originalPrice: number;
  discountPercent: number;
} {
  if (variant) {
    const price = variant.discountPrice || variant.flashSalePrice || variant.price;
    const originalPrice = variant.price;
    return {
      price,
      originalPrice,
      discountPercent: originalPrice > price ? getDiscountPercent(originalPrice, price) : 0,
    };
  }
  const price = product.discountPrice || product.flashSalePrice || product.basePrice;
  const originalPrice = product.basePrice;
  return {
    price,
    originalPrice,
    discountPercent: originalPrice > price ? getDiscountPercent(originalPrice, price) : 0,
  };
}

export function getProductImage(product: Product, variant?: ProductVariant): string {
  if (variant?.images?.length) return variant.images[0];
  return product.images[0] || '/placeholder-product.png';
}

export function getBrandName(product: Product): string {
  if (typeof product.brand === 'string') return '';
  return product.brand?.name || '';
}

export function getCategoryName(product: Product): string {
  if (typeof product.category === 'string') return '';
  return product.category?.name || '';
}

export function isInStock(product: Product, variant?: ProductVariant): boolean {
  if (variant) return variant.stock > 0;
  return product.totalStock > 0;
}

export function getUniqueVariantOptions(product: Product) {
  const colors = [...new Set(product.variants.map((v) => v.color).filter(Boolean))] as string[];
  const storages = [...new Set(product.variants.map((v) => v.storage).filter(Boolean))] as string[];
  const rams = [...new Set(product.variants.map((v) => v.ram).filter(Boolean))] as string[];
  return { colors, storages, rams };
}

export function findVariant(
  product: Product,
  options: { color?: string; storage?: string; ram?: string }
): ProductVariant | undefined {
  return product.variants.find(
    (v) =>
      (!options.color || v.color === options.color) &&
      (!options.storage || v.storage === options.storage) &&
      (!options.ram || v.ram === options.ram)
  );
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};

export const ORDER_STATUS_STEPS = [
  'pending',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
] as const;
