import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { Order } from '@/src/types';
import { Button } from '@/src/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/src/components/ui/Card';
import { formatPrice } from '@/src/lib/utils';
import { CheckCircle2, Package, Truck, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="mb-4 text-xl text-neutral-500">Order not found.</p>
        <Button onClick={() => navigate('/')}>Go Back to Shop</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-black">Thank You for Your Order!</h1>
        <p className="text-lg text-neutral-600">Your order #{order.id.slice(-6).toUpperCase()} has been placed successfully.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {order.products.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-md bg-neutral-100">
                    <img src={item.imageURL} alt={item.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <h4 className="text-sm font-bold text-black">{item.name}</h4>
                    <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-black">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-100 pt-4">
              <div className="flex justify-between text-xl font-bold text-black">
                <span>Total Paid</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Shipping & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
                  <Package size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black uppercase tracking-widest">Order Status</h4>
                  <p className="text-sm text-neutral-600">{order.status}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
                  <Truck size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black uppercase tracking-widest">Shipping Address</h4>
                  <p className="text-sm text-neutral-600">{order.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black uppercase tracking-widest">Estimated Delivery</h4>
                  <p className="text-sm text-neutral-600">3-5 Business Days</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/" className="w-full">
              <Button variant="outline" className="w-full gap-2 rounded-full py-6">
                Continue Shopping
                <ArrowRight size={18} />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default OrderConfirmation;
