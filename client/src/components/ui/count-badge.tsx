import { cn } from '@/lib/utils';

interface CountBadgeProps {
  count: number;
  className?: string;
}

export function CountBadge({ count, className }: CountBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        'absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white',
        className
      )}
      aria-hidden
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
