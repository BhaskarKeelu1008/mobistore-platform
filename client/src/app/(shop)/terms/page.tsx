import { CMSPage } from '@/components/shop/cms-page';

export const metadata = { title: 'Terms & Conditions' };

export default function TermsPage() {
  return (
    <CMSPage
      page="termsConditions"
      title="Terms & Conditions"
      fallback="By using MobiStore, you agree to our terms of service. All products are subject to availability. Prices are inclusive of applicable taxes unless stated otherwise."
    />
  );
}
