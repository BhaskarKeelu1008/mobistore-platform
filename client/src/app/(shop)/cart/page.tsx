'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { CartItem } from '@/components/shop/cart-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, savedForLater, getSubtotal, couponDiscount, moveToCart, removeItem } = useCartStore();
  const subtotal = getSubtotal();
  const shipping = subtotal >= 999 ? 0 : 49;
  const total = subtotal + shipping - couponDiscount;

  if (!items.length && !savedForLater.length) {
    return (
      <div className="container-shop flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-zinc-300" />
        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-zinc-500">Add some products to get started</p>
        <Link href="/products" className="mt-6">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-shop py-8">
      <h1 className="section-title mb-8">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <CartItem key={`${item.productId}-${item.variantSku}`} item={item} />
          ))}

          {savedForLater.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-lg font-semibold">Saved for Later</h2>
              <div className="space-y-4">
                {savedForLater.map((item) => (
                  <div key={`saved-${item.productId}-${item.variantSku}`} className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-blue-600">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => moveToCart(item.productId, item.variantSku)}>
                        Move to Cart
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeItem(item.productId, item.variantSku)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({items.length} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">{formatPrice(total)}</span>
              </div>
              {subtotal < 999 && (
                <p className="text-xs text-zinc-500">Add {formatPrice(999 - subtotal)} more for free shipping</p>
              )}
              <Link href="/checkout">
                <Button size="lg" className="w-full" disabled={!items.length}>Proceed to Checkout</Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" className="w-full">Continue Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
