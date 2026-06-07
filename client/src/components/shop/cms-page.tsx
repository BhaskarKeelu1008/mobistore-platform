import { serverFetch } from '@/lib/server-api';
import { CMSPageContent } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

interface CMSPageProps {
  page: string;
  title: string;
  fallback?: string;
}

export async function CMSPage({ page, title, fallback }: CMSPageProps) {
  let content: CMSPageContent | null = null;
  let error: string | null = null;

  try {
    content = await serverFetch<CMSPageContent>(`/public/cms/${page}`);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load content';
  }

  const htmlContent = (content?.content as string) || fallback || '';

  return (
    <div className="container-shop py-8">
      <h1 className="section-title mb-8">{title}</h1>
      {error && (
        <div className="mb-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950">{error}</div>
      )}
      <Card>
        <CardContent className="prose prose-zinc max-w-none p-6 dark:prose-invert">
          {htmlContent ? (
            <div dangerouslySetInnerHTML={{ __html: htmlContent.replace(/\n/g, '<br/>') }} />
          ) : (
            <p className="text-zinc-500">Content coming soon.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
