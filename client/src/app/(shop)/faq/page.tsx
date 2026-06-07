import { serverFetch } from '@/lib/server-api';
import { CMSPageContent } from '@/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const metadata = { title: 'FAQ' };

const defaultFaqs = [
  { question: 'What payment methods do you accept?', answer: 'We accept Cash on Delivery, Credit/Debit Cards, UPI, Net Banking, and Wallets via Razorpay.' },
  { question: 'How long does delivery take?', answer: 'Standard delivery takes 2-5 business days depending on your location.' },
  { question: 'What is your return policy?', answer: 'We offer a 7-day return policy on most products. Items must be unused and in original packaging.' },
  { question: 'Are products covered by warranty?', answer: 'All mobiles come with manufacturer warranty. Accessories have a 6-month shop warranty.' },
  { question: 'How can I track my order?', answer: 'Use the Track Order page with your order number and registered phone number.' },
];

export default async function FAQPage() {
  let faqs = defaultFaqs;

  try {
    const content = await serverFetch<CMSPageContent>('/public/cms/faq');
    if (content.faq?.length) faqs = content.faq;
  } catch {
    // use defaults
  }

  return (
    <div className="container-shop py-8">
      <h1 className="section-title mb-2">Frequently Asked Questions</h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">Find answers to common questions</p>

      <Accordion type="single" collapsible className="max-w-3xl">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-zinc-600 dark:text-zinc-400">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
