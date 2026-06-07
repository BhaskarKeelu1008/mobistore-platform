'use client';

import { MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { Settings } from '@/types';
import { getWhatsAppLink } from '@/lib/utils';

export function WhatsAppButton() {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => fetchApi<Settings>('/public/settings'),
  });

  const number = settings?.chat?.whatsappNumber;
  if (!number) return null;

  return (
    <a
      href={getWhatsAppLink('Hi! I need help with MobiStore.')}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-105 hover:bg-green-600 sm:bottom-6"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
