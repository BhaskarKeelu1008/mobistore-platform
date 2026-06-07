'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, Bookmark } from 'lucide-react';
import { CartItem as CartItemType } from '@/types';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem, saveForLater } = useCartStore();

  return (
    <div className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <Link href={`/products/${item.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
        <Image src={item.image} alt={item.name} fill className="object-contain p-2" sizes="96px" />
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex justify-between gap-2">
          <div>
            <Link href={`/products/${item.slug}`} className="font-medium hover:text-blue-600">
              {item.name}
            </Link>
            {item.variant && (
              <p className="mt-0.5 text-xs text-zinc-500">
                {[item.variant.color, item.variant.storage, item.variant.ram].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <p className="font-semibold text-blue-600">{formatPrice(item.price * item.quantity)}</p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantSku)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantSku)}
              disabled={item.quantity >= item.stock}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => saveForLater(item.productId, item.variantSku)}>
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeItem(item.productId, item.variantSku)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
