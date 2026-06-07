import { CMSPage } from '@/components/shop/cms-page';

export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <CMSPage
      page="privacyPolicy"
      title="Privacy Policy"
      fallback="We respect your privacy and are committed to protecting your personal data. We collect information necessary to process orders and improve our services. We do not sell your data to third parties."
    />
  );
}
