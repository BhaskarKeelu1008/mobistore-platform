import Link from 'next/link';
import Image from 'next/image';
import { Brand } from '@/types';
import { cn } from '@/lib/utils';

interface BrandGridProps {
  brands: Brand[];
  className?: string;
}

export function BrandGrid({ brands, className }: BrandGridProps) {
  if (!brands.length) {
    return <p className="text-center text-zinc-500">No brands available</p>;
  }

  return (
    <div className={cn('grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6', className)}>
      {brands.map((brand) => (
        <Link
          key={brand._id}
          href={`/brands/${brand.slug}`}
          className="group flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="relative mb-3 h-12 w-full">
            {brand.logo ? (
              <Image src={brand.logo} alt={brand.name} fill className="object-contain" sizes="120px" />
            ) : (
              <span className="flex h-full items-center justify-center text-lg font-bold text-zinc-600">{brand.name}</span>
            )}
          </div>
          <h3 className="text-sm font-medium group-hover:text-blue-600">{brand.name}</h3>
        </Link>
      ))}
    </div>
  );
}
