'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await fetchApi('/public/newsletter', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      toast.success('Subscribed successfully!');
      setEmail('');
    } catch {
      toast.error('Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="pl-9"
        />
      </div>
      <Button type="submit" disabled={loading} size="sm">
        {loading ? '...' : 'Subscribe'}
      </Button>
    </form>
  );
}
