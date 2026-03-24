import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { Order, Product } from '@/src/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { formatPrice } from '@/src/lib/utils';
import { ShoppingBag, Package, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    recentOrders: [] as Order[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const productsSnap = await getDocs(collection(db, 'products'));
        const recentOrdersSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5)));

        const orders = ordersSnap.docs.map(doc => doc.data() as Order);
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

        setStats({
          totalOrders: ordersSnap.size,
          totalProducts: productsSnap.size,
          totalRevenue,
          recentOrders: recentOrdersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)),
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const data = [
    { name: 'Total Revenue', value: stats.totalRevenue },
    { name: 'Total Orders', value: stats.totalOrders * 100 }, // Scaled for visualization
    { name: 'Total Products', value: stats.totalProducts * 50 }, // Scaled for visualization
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-black">Dashboard Overview</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
            <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
              <TrendingUp size={12} /> +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-neutral-500 mt-1">Total orders placed</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Total Products</CardTitle>
            <Package className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-neutral-500 mt-1">Active products in shop</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-neutral-500 mt-1">Users online now</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="font-bold text-black">{order.customerName}</span>
                    <span className="text-xs text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-black">{formatPrice(order.totalPrice)}</span>
                    <Badge 
                      variant={
                        order.status === 'Delivered' ? 'success' : 
                        order.status === 'Confirmed' ? 'secondary' : 
                        order.status === 'Out for Delivery' ? 'warning' :
                        order.status === 'Cancelled' ? 'destructive' :
                        'outline'
                      } 
                      className="text-[10px]"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {stats.recentOrders.length === 0 && <p className="text-center text-neutral-500">No orders yet.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Chart */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Performance Analytics</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip cursor={{ fill: '#f5f5f5' }} />
                <Bar dataKey="value" fill="#000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
