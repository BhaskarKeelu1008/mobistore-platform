'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import api, { fetchApi } from '@/lib/api';
import { Settings } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => fetchApi<Settings>('/admin/settings'),
  });

  const [form, setForm] = useState<Partial<Settings>>({});

  const updateField = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = useMutation({
    mutationFn: (data: Partial<Settings>) => api.put('/admin/settings', data),
    onSuccess: () => {
      toast.success('Settings saved');
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: () => toast.error('Failed to save settings'),
  });

  if (isLoading) return <Skeleton className="h-96" />;

  const s = { ...settings, ...form };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Store Settings</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Customize your shop configuration</p>
        </div>
        <Button onClick={() => save.mutate(form)} disabled={save.isPending || !Object.keys(form).length}>
          {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Shop Information</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Shop Name</Label>
                <Input defaultValue={s.shopName} onChange={(e) => updateField('shopName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue={s.shopPhone} onChange={(e) => updateField('shopPhone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={s.shopEmail} onChange={(e) => updateField('shopEmail', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Store Timings</Label>
                <Input defaultValue={s.storeTimings} onChange={(e) => updateField('storeTimings', e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Address</Label>
                <Textarea defaultValue={s.shopAddress} onChange={(e) => updateField('shopAddress', e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader><CardTitle>Payment Options</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {['razorpayEnabled', 'codEnabled', 'upiEnabled'].map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <Label>{key.replace('Enabled', '').toUpperCase()}</Label>
                  <Switch
                    checked={(s.payment as Record<string, boolean>)?.[key] ?? true}
                    onCheckedChange={(v) => updateField('payment', { ...s.payment, [key]: v })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader><CardTitle>SEO Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input defaultValue={s.seo?.metaTitle} onChange={(e) => updateField('seo', { ...s.seo, metaTitle: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea defaultValue={s.seo?.metaDescription} onChange={(e) => updateField('seo', { ...s.seo, metaDescription: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <Card>
            <CardHeader><CardTitle>Chat Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Chat Enabled</Label>
                <Switch checked={s.chat?.enabled ?? true} onCheckedChange={(v) => updateField('chat', { ...s.chat, enabled: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Admin Online</Label>
                <Switch checked={s.chat?.adminOnline ?? true} onCheckedChange={(v) => updateField('chat', { ...s.chat, adminOnline: v })} />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp Number</Label>
                <Input defaultValue={s.chat?.whatsappNumber} onChange={(e) => updateField('chat', { ...s.chat, whatsappNumber: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
