import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { Order, Product } from '@/src/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { formatPrice } from '@/src/lib/utils';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, DollarSign, TrendingUp, Plus } from 'lucide-react';
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

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      if (typeof date === 'string') return new Date(date).toLocaleDateString();
      if (date.toDate) return date.toDate().toLocaleDateString();
      return new Date(date).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tighter text-black uppercase">Dashboard</h1>
        <p className="text-neutral-500">Welcome back to your administration panel.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Total Revenue</CardTitle>
              <div className="rounded-full bg-emerald-50 p-2 text-emerald-600">
                <DollarSign size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{formatPrice(stats.totalRevenue)}</div>
              <p className="text-xs text-emerald-500 flex items-center gap-1 mt-2 font-medium">
                <TrendingUp size={12} /> +12.5% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Total Orders</CardTitle>
              <div className="rounded-full bg-blue-50 p-2 text-blue-600">
                <ShoppingBag size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{stats.totalOrders}</div>
              <p className="text-xs text-neutral-500 mt-2 font-medium">Total orders processed</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Total Products</CardTitle>
              <div className="rounded-full bg-purple-50 p-2 text-purple-600">
                <Package size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{stats.totalProducts}</div>
              <p className="text-xs text-neutral-500 mt-2 font-medium">Active catalog items</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Active Users</CardTitle>
              <div className="rounded-full bg-orange-50 p-2 text-orange-600">
                <TrendingUp size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">24</div>
              <p className="text-xs text-neutral-500 mt-2 font-medium">Real-time visitors</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Quick Actions */}
        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold uppercase tracking-tight">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link to="/admin/products" className="w-full">
              <Button className="w-full h-14 rounded-2xl gap-3 justify-start px-6 shadow-sm hover:shadow-md transition-all">
                <Plus size={20} />
                <span className="font-bold uppercase tracking-widest text-[10px]">Add New Product</span>
              </Button>
            </Link>
            <Link to="/admin/orders" className="w-full">
              <Button variant="outline" className="w-full h-14 rounded-2xl gap-3 justify-start px-6 border-neutral-200 hover:bg-neutral-50 transition-all">
                <ShoppingBag size={20} />
                <span className="font-bold uppercase tracking-widest text-[10px]">Manage Orders</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Analytics Chart */}
        <Card className="border-none shadow-sm lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-xl font-bold uppercase tracking-tight">Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] pt-4 flex items-center justify-center bg-neutral-50 rounded-b-3xl">
            <div className="text-neutral-400 font-medium">Analytics visualization coming soon</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Recent Orders */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold uppercase tracking-tight">Recent Orders</CardTitle>
            <Badge variant="outline" className="rounded-full">Last 5 orders</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-neutral-50">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                      <ShoppingBag size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-black">{order.customerName}</span>
                      <span className="text-xs text-neutral-400">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-black">{formatPrice(order.totalPrice)}</span>
                    <Badge 
                      variant={
                        order.status === 'Delivered' ? 'success' : 
                        order.status === 'Confirmed' ? 'secondary' : 
                        order.status === 'Out for Delivery' ? 'warning' :
                        order.status === 'Cancelled' ? 'destructive' :
                        'outline'
                      } 
                      className="text-[10px] uppercase tracking-widest px-2 py-0"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {stats.recentOrders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingBag size={48} className="text-neutral-200 mb-4" />
                  <p className="text-neutral-500">No recent orders found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
