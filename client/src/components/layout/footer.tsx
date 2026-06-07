'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Smartphone, Globe, Share2, Mail, ExternalLink } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Settings } from '@/types';
import { NewsletterForm } from '@/components/shop/newsletter-form';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
  shop: [
    { href: '/products', label: 'All Products' },
    { href: '/categories', label: 'Categories' },
    { href: '/brands', label: 'Brands' },
    { href: '/offers', label: 'Offers' },
  ],
  support: [
    { href: '/track-order', label: 'Track Order' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/about', label: 'About Us' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms & Conditions' },
    { href: '/refund', label: 'Refund Policy' },
  ],
};

export function Footer() {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => fetchApi<Settings>('/public/settings'),
  });

  const shopName = settings?.shopName || 'MobiStore';
  const social = settings?.socialLinks || {};

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container-shop py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
              <Smartphone className="h-6 w-6" />
              {shopName}
            </Link>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              {settings?.shopDescription || 'Your trusted destination for the latest smartphones, accessories, and mobile gadgets.'}
            </p>
            {settings?.storeTimings && (
              <p className="mt-2 text-sm text-zinc-500">Store Hours: {settings.storeTimings}</p>
            )}
            <div className="mt-4 flex gap-3">
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-blue-600" aria-label="Facebook">
                  <Globe className="h-5 w-5" />
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-pink-600" aria-label="Instagram">
                  <Share2 className="h-5 w-5" />
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-sky-500" aria-label="Twitter">
                  <ExternalLink className="h-5 w-5" />
                </a>
              )}
              {social.youtube && (
                <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-red-600" aria-label="YouTube">
                  <Mail className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Newsletter</h3>
            <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">Get deals and new arrivals in your inbox.</p>
            <NewsletterForm />
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-zinc-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {shopName}. All rights reserved.</p>
          <div className="flex gap-4">
            {footerLinks.legal.map(({ href, label }) => (
              <Link key={href} href={href} className="hover:text-blue-600 dark:hover:text-blue-400">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
