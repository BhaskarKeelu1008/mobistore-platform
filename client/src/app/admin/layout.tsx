'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Settings,
  Image,
  Tag,
  Ticket,
  Warehouse,
  BarChart3,
  Menu,
  X,
  LogOut,
  Grid3X3,
  Smartphone,
  Truck,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useUnreadCounts } from '@/hooks/use-unread-counts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Grid3X3 },
  { href: '/admin/brands', label: 'Brands', icon: Smartphone },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/admin/chat', label: 'Chat', icon: MessageSquare },
  { href: '/admin/banners', label: 'Banners', icon: Image },
  { href: '/admin/offers', label: 'Offers', icon: Tag },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { href: '/admin/delivery', label: 'Delivery', icon: Truck },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const { data: unreadCounts } = useUnreadCounts();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user && ['admin', 'staff', 'superadmin'].includes(user.role);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login?redirect=/admin');
    }
  }, [isAuthenticated, isLoading, isAdmin, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-100 dark:bg-zinc-950">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-zinc-200 bg-white transition-transform dark:border-zinc-800 dark:bg-zinc-900 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4 dark:border-zinc-800">
          <Link href="/admin" className="font-bold text-blue-600">MobiStore Admin</Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="space-y-1 p-3">
          {adminLinks.map(({ href, label, icon: Icon, exact }) => {
            const count = href === '/admin/chat' ? unreadCounts?.chat ?? 0 : 0;

            return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                (exact ? pathname === href : pathname.startsWith(href))
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-semibold text-white">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t p-3 dark:border-zinc-800">
          <Link href="/" className="mb-2 block text-center text-sm text-blue-600 hover:underline">View Store</Link>
          <Button variant="ghost" className="w-full justify-start gap-2 text-red-600" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-auto text-sm text-zinc-600 dark:text-zinc-400">
            {user?.name} · <span className="capitalize">{user?.role}</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
