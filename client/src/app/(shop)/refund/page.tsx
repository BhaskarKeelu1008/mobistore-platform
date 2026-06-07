import { CMSPage } from '@/components/shop/cms-page';

export const metadata = { title: 'Refund Policy' };

export default function RefundPage() {
  return (
    <CMSPage
      page="refundPolicy"
      title="Refund Policy"
      fallback="We offer a 7-day return policy on most products. Refunds are processed within 5-7 business days after we receive the returned item. Products must be in original condition with all accessories and packaging."
    />
  );
}
