'use client';

import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T | ((item: T) => string);
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends object>({
  columns,
  data,
  keyField,
  emptyMessage = 'No data found',
  onRowClick,
}: DataTableProps<T>) {
  const getKey = (item: T) =>
    typeof keyField === 'function' ? keyField(item) : String(item[keyField]);

  if (!data.length) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center text-zinc-500 dark:border-zinc-800">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border dark:border-zinc-800">
      <table className="w-full text-sm">
        <thead className="border-b bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={cn('px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={getKey(item)}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'border-b transition-colors dark:border-zinc-800',
                onRowClick && 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900'
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3', col.className)}>
                  {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
