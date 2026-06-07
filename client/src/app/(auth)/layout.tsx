import Link from 'next/link';
import { Smartphone } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <Link href="/" className="mb-8 flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-blue-400">
        <Smartphone className="h-7 w-7" />
        MobiStore
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
