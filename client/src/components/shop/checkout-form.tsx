'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CreditCard, Banknote, Tag } from 'lucide-react';
import api from '@/lib/api';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { Address, Settings } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice, loadRazorpay } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CheckoutFormProps {
  settings?: Settings;
  addresses?: Address[];
}

interface AddressForm {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export function CheckoutForm({ settings, addresses = [] }: CheckoutFormProps) {
  const router = useRouter();
  const { items, getSubtotal, couponCode, couponDiscount, setCoupon, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
  const [selectedAddressId, setSelectedAddressId] = useState(addresses.find((a) => a.isDefault)?._id || '');
  const [couponInput, setCouponInput] = useState(couponCode || '');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<AddressForm>({
    defaultValues: {
      fullName: user?.name || '',
      phone: user?.phone || '',
      label: 'Home',
    },
  });

  const subtotal = getSubtotal();
  const shipping = subtotal >= (settings?.shipping?.freeShippingAbove ?? 999) ? 0 : (settings?.shipping?.defaultShippingCharge ?? 49);
  const total = subtotal + shipping - couponDiscount;

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      const { data } = await api.post('/orders/validate-coupon', { code: couponInput, amount: subtotal });
      setCoupon(couponInput.toUpperCase(), data.data.discount);
      toast.success('Coupon applied!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid coupon';
      toast.error(message);
    }
  };

  const onSubmit = async (addressData: AddressForm) => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      router.push('/login?redirect=/checkout');
      return;
    }
    if (!items.length) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      let shippingAddress: Address;
      if (selectedAddressId && addresses.length) {
        const addr = addresses.find((a) => a._id === selectedAddressId);
        if (!addr) throw new Error('Address not found');
        shippingAddress = addr;
      } else {
        shippingAddress = { ...addressData, isDefault: false };
      }

      const orderPayload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          variantSku: i.variantSku,
        })),
        shippingAddress,
        paymentMethod,
        couponCode: couponCode || undefined,
      };

      const { data } = await api.post('/orders', orderPayload);
      const { order, razorpayOrder } = data.data;

      if (paymentMethod === 'razorpay' && razorpayOrder) {
        const loaded = await loadRazorpay();
        if (!loaded) {
          toast.error('Failed to load payment gateway');
          return;
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency || 'INR',
          name: settings?.shopName || 'MobiStore',
          description: `Order ${order.orderNumber}`,
          order_id: razorpayOrder.id,
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            try {
              await api.post('/orders/verify-payment', {
                orderId: order._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              clearCart();
              router.push(`/order-success?order=${order.orderNumber}`);
            } catch {
              toast.error('Payment verification failed');
            }
          },
          prefill: { name: user?.name, email: user?.email, contact: shippingAddress.phone },
          theme: { color: '#2563eb' },
        };

        const razorpay = new (window as unknown as { Razorpay: new (opts: typeof options) => { open: () => void } }).Razorpay(options);
        razorpay.open();
      } else {
        clearCart();
        router.push(`/order-success?order=${order.orderNumber}`);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const codEnabled = settings?.payment?.codEnabled !== false;
  const razorpayEnabled = settings?.payment?.razorpayEnabled !== false;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {addresses.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Saved Addresses</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr._id}
                  className={cn(
                    'flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors',
                    selectedAddressId === addr._id ? 'border-blue-600 bg-blue-50 dark:bg-blue-950' : 'border-zinc-200 dark:border-zinc-700'
                  )}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr._id}
                    checked={selectedAddressId === addr._id}
                    onChange={() => setSelectedAddressId(addr._id || '')}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium">{addr.fullName} · {addr.label}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-sm text-zinc-500">{addr.phone}</p>
                  </div>
                </label>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedAddressId('')}>
                Use new address
              </Button>
            </CardContent>
          </Card>
        )}

        {!selectedAddressId && (
          <Card>
            <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" {...register('fullName', { required: 'Required' })} className="mt-1.5" />
                {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register('phone', { required: 'Required', pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid phone' } })} className="mt-1.5" />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input id="addressLine1" {...register('addressLine1', { required: 'Required' })} className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input id="addressLine2" {...register('addressLine2')} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register('city', { required: 'Required' })} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input id="state" {...register('state', { required: 'Required' })} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" {...register('pincode', { required: 'Required', pattern: { value: /^\d{6}$/, message: 'Invalid pincode' } })} className="mt-1.5" />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {codEnabled && (
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-4 text-left transition-colors',
                  paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50 dark:bg-blue-950' : 'border-zinc-200 dark:border-zinc-700'
                )}
              >
                <Banknote className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-xs text-zinc-500">Pay when you receive</p>
                </div>
              </button>
            )}
            {razorpayEnabled && (
              <button
                type="button"
                onClick={() => setPaymentMethod('razorpay')}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-4 text-left transition-colors',
                  paymentMethod === 'razorpay' ? 'border-blue-600 bg-blue-50 dark:bg-blue-950' : 'border-zinc-200 dark:border-zinc-700'
                )}
              >
                <CreditCard className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-medium">Pay Online</p>
                  <p className="text-xs text-zinc-500">Cards, UPI, Net Banking</p>
                </div>
              </button>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="sticky top-24">
          <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantSku}`} className="flex justify-between text-sm">
                <span className="line-clamp-1 flex-1 pr-2">{item.name} x{item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Coupon Discount</span>
                <span>-{formatPrice(couponDiscount)}</span>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Coupon code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              />
              <Button type="button" variant="outline" onClick={applyCoupon}>
                <Tag className="h-4 w-4" />
              </Button>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-blue-600">{formatPrice(total)}</span>
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading || !items.length}>
              {loading ? 'Processing...' : 'Place Order'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
