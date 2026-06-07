'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, MapPin } from 'lucide-react';
import api, { fetchApi } from '@/lib/api';
import { Address } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => fetchApi<Address[]>('/public/addresses'),
  });

  const { register, handleSubmit, reset } = useForm<Address>({
    defaultValues: { label: 'Home', isDefault: false },
  });

  const onSubmit = async (data: Address) => {
    setLoading(true);
    try {
      await api.post('/public/addresses', data);
      toast.success('Address added');
      reset();
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    } catch {
      toast.error('Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await api.delete(`/public/addresses/${id}`);
      toast.success('Address deleted');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    } catch {
      toast.error('Failed to delete address');
    }
  };

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Saved Addresses</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Address
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Address</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Label</Label><Input {...register('label')} placeholder="Home" /></div>
              <div className="space-y-2"><Label>Full Name</Label><Input {...register('fullName', { required: true })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input {...register('phone', { required: true })} /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Address Line 1</Label><Input {...register('addressLine1', { required: true })} /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Address Line 2</Label><Input {...register('addressLine2')} /></div>
              <div className="space-y-2"><Label>City</Label><Input {...register('city', { required: true })} /></div>
              <div className="space-y-2"><Label>State</Label><Input {...register('state', { required: true })} /></div>
              <div className="space-y-2"><Label>Pincode</Label><Input {...register('pincode', { required: true })} /></div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <input type="checkbox" {...register('isDefault')} id="isDefault" />
                <Label htmlFor="isDefault">Set as default</Label>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Address
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((addr) => (
          <Card key={addr._id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <MapPin className="mt-1 h-5 w-5 text-zinc-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{addr.label}</p>
                      {addr.isDefault && <Badge>Default</Badge>}
                    </div>
                    <p className="text-sm font-medium">{addr.fullName}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{addr.addressLine1}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-sm">{addr.phone}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => addr._id && deleteAddress(addr._id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
