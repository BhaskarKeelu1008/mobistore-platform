'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Menu,
  X,
  ShoppingCart,
  Heart,
  User,
  Smartphone,
  Package,
  Tag,
  Grid3X3,
  Bell,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { CountBadge } from '@/components/ui/count-badge';
import { SearchBar } from '@/components/shop/search-bar';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { useUnreadCounts } from '@/hooks/use-unread-counts';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/products', label: 'Products', icon: Package },
  { href: '/categories', label: 'Categories', icon: Grid3X3 },
  { href: '/brands', label: 'Brands', icon: Smartphone },
  { href: '/offers', label: 'Offers', icon: Tag },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCartStore((s) => s.getTotalItems());
  const { isAuthenticated, user, logout } = useAuthStore();
  const { data: unreadCounts } = useUnreadCounts();

  const isStaff = user && ['admin', 'staff', 'superadmin'].includes(user.role);
  const chatHref = isStaff ? '/admin/chat' : '/account/chat';
  const notificationCount = unreadCounts?.notifications ?? 0;
  const chatCount = unreadCounts?.chat ?? 0;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="container-shop">
        <div className="flex h-16 items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
            <Smartphone className="h-6 w-6" />
            <span className="hidden sm:inline">MobiStore</span>
          </Link>

          <div className="hidden flex-1 md:block md:max-w-md lg:max-w-lg">
            <SearchBar />
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800',
                  pathname.startsWith(href) && 'bg-zinc-100 text-blue-600 dark:bg-zinc-800 dark:text-blue-400'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <ThemeToggle />

            <Button variant="ghost" size="icon" aria-label="Wishlist" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>

            <div className="relative">
              <Button variant="ghost" size="icon" aria-label="Cart" asChild>
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                </Link>
              </Button>
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center px-1 text-[10px]">
                  {cartCount}
                </Badge>
              )}
            </div>

            {isAuthenticated && (
              <>
                <div className="relative">
                  <Button variant="ghost" size="icon" aria-label="Notifications" asChild>
                    <Link href="/account/notifications">
                      <Bell className="h-5 w-5" />
                    </Link>
                  </Button>
                  <CountBadge count={notificationCount} />
                </div>

                <div className="relative">
                  <Button variant="ghost" size="icon" aria-label="Chat support" asChild>
                    <Link href={chatHref}>
                      <MessageSquare className="h-5 w-5" />
                    </Link>
                  </Button>
                  <CountBadge count={chatCount} />
                </div>
              </>
            )}

            {isAuthenticated ? (
              <div className="hidden items-center gap-2 sm:flex">
                <Button variant="ghost" size="sm" className="gap-2" asChild>
                  <Link href="/account">
                    <User className="h-4 w-4" />
                    <span className="max-w-[100px] truncate">{user?.name?.split(' ')[0]}</span>
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => logout()}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button size="sm" className="hidden sm:inline-flex" asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}

            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="pb-3 md:hidden">
          <SearchBar />
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:hidden">
          <nav className="container-shop flex flex-col gap-1 py-4">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <Link href="/track-order" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Track Order
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/account/notifications"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                  {notificationCount > 0 && (
                    <Badge className="ml-auto h-5 min-w-5 justify-center px-1 text-[10px]">{notificationCount}</Badge>
                  )}
                </Link>
                <Link
                  href={chatHref}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat Support
                  {chatCount > 0 && (
                    <Badge className="ml-auto h-5 min-w-5 justify-center px-1 text-[10px]">{chatCount}</Badge>
                  )}
                </Link>
              </>
            )}
            {!isAuthenticated && (
              <Button className="mt-2 w-full" asChild>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  Login / Register
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
