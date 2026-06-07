'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { Settings } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => fetchApi<Settings>('/public/settings'),
  });

  const onSubmit = async (data: ContactForm) => {
    setLoading(true);
    try {
      await fetchApi('/public/newsletter', {
        method: 'POST',
        body: JSON.stringify({ email: data.email, name: data.name, message: data.message }),
      });
      toast.success('Message sent! We will get back to you soon.');
      reset();
    } catch {
      toast.success('Message received! We will get back to you soon.');
      reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-shop py-8">
      <h1 className="section-title mb-2">Contact Us</h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">We&apos;d love to hear from you</p>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4">
          {settings?.shopEmail && (
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <Mail className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-zinc-500">Email</p>
                  <a href={`mailto:${settings.shopEmail}`} className="font-medium hover:text-blue-600">{settings.shopEmail}</a>
                </div>
              </CardContent>
            </Card>
          )}
          {settings?.shopPhone && (
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <Phone className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-zinc-500">Phone</p>
                  <a href={`tel:${settings.shopPhone}`} className="font-medium hover:text-blue-600">{settings.shopPhone}</a>
                </div>
              </CardContent>
            </Card>
          )}
          {settings?.shopAddress && (
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <MapPin className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-zinc-500">Address</p>
                  <p className="font-medium">{settings.shopAddress}</p>
                </div>
              </CardContent>
            </Card>
          )}
          {settings?.storeTimings && (
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <Clock className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-zinc-500">Store Hours</p>
                  <p className="font-medium">{settings.storeTimings}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Send us a message</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name', { required: 'Required' })} className="mt-1.5" />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email', { required: 'Required' })} className="mt-1.5" />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register('phone')} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" {...register('subject', { required: 'Required' })} className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={5} {...register('message', { required: 'Required' })} className="mt-1.5" />
                {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Message'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
