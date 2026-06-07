import Link from 'next/link';
import { RemoteImage as Image } from '@/components/ui/remote-image';
import { serverFetch } from '@/lib/server-api';
import { Offer } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate } from '@/lib/utils';

export const metadata = { title: 'Offers & Deals' };

export default async function OffersPage() {
  let offers: Offer[] = [];
  let error: string | null = null;

  try {
    offers = await serverFetch<Offer[]>('/public/offers');
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load offers';
  }

  return (
    <div className="container-shop py-8">
      <h1 className="section-title mb-2">Offers & Deals</h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">Grab the best deals before they expire</p>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950">{error}</div>
      )}

      {!offers.length && !error && (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <p className="text-zinc-500">No active offers at the moment. Check back soon!</p>
          <Link href="/products"><Button className="mt-4">Browse Products</Button></Link>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => (
          <Card key={offer._id} className="overflow-hidden">
            {offer.image && (
              <div className="relative aspect-video">
                <Image src={offer.image} alt={offer.title} fill className="object-cover" sizes="400px" />
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Badge variant={offer.isFlashSale ? 'destructive' : 'default'}>
                  {offer.isFlashSale ? 'Flash Sale' : 'Offer'}
                </Badge>
                <span className="text-xs text-zinc-500">Until {formatDate(offer.validUntil)}</span>
              </div>
              <h2 className="mt-3 text-xl font-bold">{offer.title}</h2>
              {offer.description && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{offer.description}</p>
              )}
              <p className="mt-4 text-2xl font-bold text-blue-600">
                {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `${formatPrice(offer.discountValue)} OFF`}
              </p>
              <Link href="/products" className="mt-4 inline-block">
                <Button>Shop Now</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
