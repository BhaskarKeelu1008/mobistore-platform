import Link from 'next/link';
import { RemoteImage as Image } from '@/components/ui/remote-image';
import { Category } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryGridProps {
  categories: Category[];
  className?: string;
}

export function CategoryGrid({ categories, className }: CategoryGridProps) {
  if (!categories.length) {
    return <p className="text-center text-zinc-500">No categories available</p>;
  }

  return (
    <div className={cn('grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6', className)}>
      {categories.map((category) => (
        <Link
          key={category._id}
          href={`/categories/${category.slug}`}
          className="group flex flex-col items-center rounded-xl border border-zinc-200 bg-white p-4 text-center transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="relative mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            {category.image ? (
              <Image src={category.image} alt={category.name} fill className="object-cover" sizes="64px" />
            ) : (
              <span className="text-2xl font-bold text-blue-600">{category.name.charAt(0)}</span>
            )}
          </div>
          <h3 className="text-sm font-medium group-hover:text-blue-600">{category.name}</h3>
        </Link>
      ))}
    </div>
  );
}
