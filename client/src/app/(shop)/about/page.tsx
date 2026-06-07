import { CMSPage } from '@/components/shop/cms-page';

export const metadata = { title: 'About Us' };

export default function AboutPage() {
  return (
    <CMSPage
      page="aboutUs"
      title="About Us"
      fallback="MobiStore is your trusted destination for the latest smartphones, accessories, and mobile gadgets. We offer genuine products, competitive prices, and excellent customer service across India."
    />
  );
}
