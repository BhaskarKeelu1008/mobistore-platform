import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  savedForLater: CartItem[];
  couponCode: string | null;
  couponDiscount: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantSku?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantSku?: string) => void;
  saveForLater: (productId: string, variantSku?: string) => void;
  moveToCart: (productId: string, variantSku?: string) => void;
  setCoupon: (code: string | null, discount: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      savedForLater: [],
      couponCode: null,
      couponDiscount: 0,

      addItem: (item) => {
        const items = get().items;
        const existing = items.find(
          (i) => i.productId === item.productId && i.variantSku === item.variantSku
        );
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === item.productId && i.variantSku === item.variantSku
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },

      removeItem: (productId, variantSku) => {
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.variantSku === variantSku)
          ),
        });
      },

      updateQuantity: (productId, quantity, variantSku) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantSku);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.variantSku === variantSku
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i
          ),
        });
      },

      saveForLater: (productId, variantSku) => {
        const item = get().items.find(
          (i) => i.productId === productId && i.variantSku === variantSku
        );
        if (item) {
          get().removeItem(productId, variantSku);
          set({ savedForLater: [...get().savedForLater, item] });
        }
      },

      moveToCart: (productId, variantSku) => {
        const item = get().savedForLater.find(
          (i) => i.productId === productId && i.variantSku === variantSku
        );
        if (item) {
          set({
            savedForLater: get().savedForLater.filter(
              (i) => !(i.productId === productId && i.variantSku === variantSku)
            ),
          });
          get().addItem(item);
        }
      },

      setCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),

      clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0 }),

      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
);
