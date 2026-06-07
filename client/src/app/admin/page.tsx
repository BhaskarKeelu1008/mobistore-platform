'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import {
  IndianRupee, ShoppingCart, Users, Package, MessageSquare, AlertTriangle,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { DashboardStats } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function StatCard({ title, value, icon: Icon, sub }: { title: string; value: string; icon: React.ElementType; sub?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-950">
          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {sub && <p className="text-xs text-zinc-500">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => fetchApi<DashboardStats>('/admin/dashboard'),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  const chartData = stats?.monthlyRevenue?.map((d) => ({
    day: `Day ${d._id}`,
    revenue: d.revenue,
    orders: d.orders,
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Overview of your store performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={formatPrice(stats?.totalRevenue || 0)} icon={IndianRupee} sub={`Avg: ${formatPrice(stats?.avgOrderValue || 0)}`} />
        <StatCard title="Total Orders" value={String(stats?.totalOrders || 0)} icon={ShoppingCart} sub={`${stats?.monthlyOrders || 0} this month`} />
        <StatCard title="Customers" value={String(stats?.totalCustomers || 0)} icon={Users} />
        <StatCard title="Products" value={String(stats?.totalProducts || 0)} icon={Package} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Monthly Revenue</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(v) => formatPrice(Number(v))} />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Orders This Month</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentOrders?.slice(0, 5).map((order) => (
                <div key={order._id} className="flex items-center justify-between rounded-lg border p-3 dark:border-zinc-800">
                  <div>
                    <p className="font-medium">#{order.orderNumber}</p>
                    <p className="text-sm text-zinc-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(order.total)}</p>
                    <Badge variant="outline">{order.orderStatus}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle className="text-base">Pending Chats</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.pendingChats || 0}</p>
              <Link href="/admin/chat" className="text-sm text-blue-600 hover:underline">Manage chats</Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-base">Low Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats?.lowStock?.slice(0, 3).map((p) => (
                <div key={p._id} className="flex justify-between text-sm">
                  <span className="truncate">{p.name}</span>
                  <Badge variant="destructive">{p.totalStock} left</Badge>
                </div>
              ))}
              <Link href="/admin/inventory" className="text-sm text-blue-600 hover:underline">View inventory</Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
