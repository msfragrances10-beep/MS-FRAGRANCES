import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/firebase';
import { Order, OrderStatus } from '@/src/types';
import { Button } from '@/src/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { formatPrice, cn } from '@/src/lib/utils';
import { ShoppingBag, Phone, MapPin, Clock, CheckCircle2, Truck, Package, Trash2, X, Search, Calendar, User } from 'lucide-react';
import { Input } from '@/src/components/ui/Input';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

const OrdersManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { status });
      toast.success(`Order status updated to ${status}`);
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      toast.success('Order deleted successfully');
      setIsDeleting(null);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `orders/${orderId}`);
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return <Clock size={16} />;
      case 'Confirmed': return <CheckCircle2 size={16} />;
      case 'Out for Delivery': return <Truck size={16} />;
      case 'Delivered': return <Package size={16} />;
      case 'Cancelled': return <X size={16} />;
      default: return <Package size={16} />;
    }
  };

  const getBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Confirmed': return 'secondary';
      case 'Out for Delivery': return 'warning';
      case 'Cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Out for Delivery': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

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
        <h1 className="text-4xl font-bold tracking-tighter text-black uppercase">Orders</h1>
        <p className="text-neutral-500">Track and manage customer orders and fulfillment.</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <Input 
            placeholder="Search by customer or order ID..." 
            className="pl-12 h-14 rounded-2xl border-none bg-white shadow-sm focus-visible:ring-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['All', 'Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'primary' : 'outline'}
              onClick={() => setFilterStatus(status as any)}
              className={cn(
                "rounded-full px-6 h-10 text-[10px] font-bold uppercase tracking-widest transition-all",
                filterStatus === status ? "shadow-lg shadow-black/10" : "border-neutral-200 hover:bg-neutral-50"
              )}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isDeleting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          >
            <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-tight">Confirm Deletion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">Are you sure you want to delete this order? This action cannot be undone.</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" onClick={() => setIsDeleting(null)} className="rounded-xl">Cancel</Button>
                <Button variant="destructive" onClick={() => handleDeleteOrder(isDeleting)} className="rounded-xl px-8">Delete</Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl"
            >
              <Card className="max-h-[85vh] overflow-y-auto border-none shadow-2xl rounded-3xl">
                <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-100 pb-6">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-2xl font-bold tracking-tight uppercase">Order Details</CardTitle>
                    <p className="text-xs font-mono text-neutral-400">#{selectedOrder.id}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)} className="rounded-full hover:bg-neutral-100">
                    <X size={24} />
                  </Button>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Customer Information</h3>
                        <div className="rounded-2xl bg-neutral-50 p-6 space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm text-black">
                              <ShoppingBag size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-black">{selectedOrder.customerName}</p>
                              <p className="text-xs text-neutral-500">{selectedOrder.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4 pt-4 border-t border-neutral-100">
                            <MapPin size={18} className="mt-1 text-neutral-400" />
                            <p className="text-sm text-neutral-600 leading-relaxed">{selectedOrder.address}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Update Status</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {['Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'].map((status) => (
                            <Button
                              key={status}
                              variant={selectedOrder.status === status ? 'primary' : 'outline'}
                              onClick={() => updateOrderStatus(selectedOrder.id, status as OrderStatus)}
                              className={cn(
                                "rounded-xl h-12 text-[10px] font-bold uppercase tracking-widest justify-start px-4",
                                selectedOrder.status === status ? "shadow-md" : "border-neutral-100"
                              )}
                            >
                              <div className={cn("mr-3 h-2 w-2 rounded-full", getStatusColor(status as OrderStatus).split(' ')[0])} />
                              {status}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Order Summary</h3>
                      <div className="rounded-2xl border border-neutral-100 overflow-hidden">
                        <div className="divide-y divide-neutral-100">
                          {selectedOrder.products.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 bg-white">
                              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-50 border border-neutral-100">
                                {item.imageURL ? (
                                  <img src={item.imageURL} alt={item.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-neutral-300">
                                    <Package size={24} />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-black truncate">{item.name}</p>
                                <p className="text-xs text-neutral-500">{item.quantity} x {formatPrice(item.price)}</p>
                              </div>
                              <p className="text-sm font-bold text-black">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>
                        <div className="bg-neutral-50 p-6 space-y-3">
                          <div className="flex justify-between text-sm text-neutral-500">
                            <span>Subtotal</span>
                            <span>{formatPrice(selectedOrder.totalPrice)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-neutral-500">
                            <span>Shipping</span>
                            <span className="text-emerald-600 font-medium">Free</span>
                          </div>
                          <div className="flex justify-between pt-3 border-t border-neutral-200">
                            <span className="text-base font-bold text-black uppercase tracking-tight">Total</span>
                            <span className="text-xl font-bold text-black">{formatPrice(selectedOrder.totalPrice)}</span>
                          </div>
                        </div>
                      </div>
                      {selectedOrder.notes && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Customer Notes</h4>
                          <p className="bg-amber-50 p-4 rounded-xl text-sm text-amber-900 italic border border-amber-100">"{selectedOrder.notes}"</p>
                        </div>
                      )}
                      <div className="flex justify-end pt-4">
                        <Button 
                          variant="ghost" 
                          className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl"
                          onClick={() => setIsDeleting(selectedOrder.id)}
                        >
                          <Trash2 size={18} className="mr-2" /> Delete Order
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredOrders.map((order) => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={order.id}
          >
            <Card 
              className="border-none shadow-sm overflow-hidden group rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <CardHeader className="pb-4 border-b border-neutral-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-black">
                    <ShoppingBag size={18} />
                  </div>
                  <Badge className={cn("rounded-full px-3 py-1 text-[10px] uppercase tracking-widest border shadow-sm", getStatusColor(order.status))}>
                    {order.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold tracking-tight truncate">{order.customerName}</CardTitle>
                  <p className="text-xs font-mono text-neutral-400">#{order.id.slice(-8).toUpperCase()}</p>
                </div>
              </CardHeader>
              <CardContent className="py-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Clock size={14} />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Package size={14} />
                    <span>{order.products.length} items</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600 line-clamp-1">
                  <MapPin size={14} className="flex-shrink-0 text-neutral-400" />
                  <span className="truncate">{order.address}</span>
                </div>
              </CardContent>
              <CardFooter className="bg-neutral-50/50 flex items-center justify-between py-4 px-6 border-t border-neutral-50">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Total Amount</span>
                <span className="text-xl font-bold text-black">{formatPrice(order.totalPrice)}</span>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
        {filteredOrders.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100 text-neutral-300">
              <ShoppingBag size={48} />
            </div>
            <h3 className="text-2xl font-bold text-neutral-400 uppercase tracking-tight">No orders found</h3>
            <p className="text-neutral-500">Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManager;
