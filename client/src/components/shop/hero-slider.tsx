'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeroSliderProps {
  banners: Banner[];
}

export function HeroSlider({ banners }: HeroSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  if (!banners.length) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-16 text-white sm:py-24">
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold sm:text-5xl">Welcome to MobiStore</h1>
          <p className="mt-4 text-lg text-blue-100">Discover the latest smartphones at unbeatable prices.</p>
          <Link href="/products" className="mt-6 inline-block">
            <Button size="lg" variant="secondary">Shop Now</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {banners.map((banner) => (
            <div key={banner._id} className="relative min-w-0 flex-[0_0_100%]">
              <div className="relative aspect-[21/9] min-h-[240px] sm:min-h-[360px]">
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                  <div className="container-shop text-white">
                    <h2 className="max-w-lg text-2xl font-bold sm:text-4xl lg:text-5xl">{banner.title}</h2>
                    {banner.subtitle && (
                      <p className="mt-2 max-w-md text-sm text-zinc-200 sm:text-lg">{banner.subtitle}</p>
                    )}
                    {banner.link && (
                      <Link href={banner.link} className="mt-4 inline-block">
                        <Button size="lg">{banner.buttonText || 'Shop Now'}</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 opacity-0 shadow transition-opacity group-hover:opacity-100 dark:bg-zinc-900/90"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 opacity-0 shadow transition-opacity group-hover:opacity-100 dark:bg-zinc-900/90"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={cn(
              'h-2 rounded-full transition-all',
              i === selectedIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
