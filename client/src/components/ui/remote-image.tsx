import Image, { type ImageProps } from 'next/image';

const UNOPTIMIZED_HOSTS = /placehold\.co|via\.placeholder\.com/i;

function needsUnoptimized(src: ImageProps['src']): boolean {
  if (typeof src !== 'string') return false;
  return UNOPTIMIZED_HOSTS.test(src);
}

/** Next.js image optimizer fails on some placeholder hosts on Vercel — load them directly. */
export function RemoteImage({ unoptimized, src, ...props }: ImageProps) {
  return <Image src={src} unoptimized={unoptimized ?? needsUnoptimized(src)} {...props} />;
}
