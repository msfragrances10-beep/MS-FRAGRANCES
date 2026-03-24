import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/firebase';
import { Order, OrderStatus } from '@/src/types';
import { Button } from '@/src/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { formatPrice, cn } from '@/src/lib/utils';
import { ShoppingBag, Phone, MapPin, Clock, CheckCircle2, Truck, Package, Trash2, X } from 'lucide-react';
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

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-black">Orders Manager</h1>

      <AnimatePresence>
        {isDeleting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <Card className="w-full max-w-md border-none shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Confirm Deletion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">Are you sure you want to delete this order? This action cannot be undone.</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setIsDeleting(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => handleDeleteOrder(isDeleting)}>Delete</Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Orders List */}
        <div className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {orders.map((order) => (
            <Card
              key={order.id}
              className={cn(
                "cursor-pointer border-none shadow-sm transition-all hover:shadow-md",
                selectedOrder?.id === order.id ? "ring-2 ring-black" : ""
              )}
              onClick={() => setSelectedOrder(order)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">#{order.id.slice(-6).toUpperCase()}</span>
                  <Badge variant={getBadgeVariant(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                <h3 className="font-bold text-black">{order.customerName}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className="font-bold text-black">{formatPrice(order.totalPrice)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {orders.length === 0 && <p className="text-center text-neutral-500">No orders found.</p>}
        </div>

        {/* Order Details */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedOrder ? (
              <motion.div
                key={selectedOrder.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="border-none shadow-lg">
                  <CardHeader className="flex flex-col gap-4 border-b border-neutral-100 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold">Order Details</CardTitle>
                      <p className="text-sm text-neutral-500">ID: {selectedOrder.id}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={selectedOrder.status === 'Pending' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => updateOrderStatus(selectedOrder.id, 'Pending')}
                      >
                        Pending
                      </Button>
                      <Button
                        variant={selectedOrder.status === 'Confirmed' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => updateOrderStatus(selectedOrder.id, 'Confirmed')}
                      >
                        Confirm
                      </Button>
                      <Button
                        variant={selectedOrder.status === 'Out for Delivery' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => updateOrderStatus(selectedOrder.id, 'Out for Delivery')}
                      >
                        Out for Delivery
                      </Button>
                      <Button
                        variant={selectedOrder.status === 'Delivered' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => updateOrderStatus(selectedOrder.id, 'Delivered')}
                      >
                        Deliver
                      </Button>
                      <Button
                        variant={selectedOrder.status === 'Cancelled' ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => updateOrderStatus(selectedOrder.id, 'Cancelled')}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => setIsDeleting(selectedOrder.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Customer Info</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-neutral-600">
                            <ShoppingBag size={18} />
                            <span className="font-medium text-black">{selectedOrder.customerName}</span>
                          </div>
                          <div className="flex items-center gap-3 text-neutral-600">
                            <Phone size={18} />
                            <span>{selectedOrder.phone}</span>
                          </div>
                          <div className="flex items-start gap-3 text-neutral-600">
                            <MapPin size={18} className="mt-1" />
                            <span>{selectedOrder.address}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Order Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Status</span>
                            <Badge className="flex items-center gap-1">
                              {getStatusIcon(selectedOrder.status)}
                              {selectedOrder.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Date</span>
                            <span className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-neutral-100">
                            <span className="font-bold text-black">Total Amount</span>
                            <span className="font-bold text-black text-lg">{formatPrice(selectedOrder.totalPrice)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Products</h4>
                      <div className="space-y-4">
                        {selectedOrder.products.map((item, index) => (
                          <div key={index} className="flex items-center gap-4 bg-neutral-50 p-3 rounded-lg">
                            <div className="h-12 w-10 flex-shrink-0 overflow-hidden rounded bg-neutral-200">
                              <img src={item.imageURL} alt={item.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="flex flex-1 flex-col">
                              <h5 className="text-sm font-bold text-black">{item.name}</h5>
                              <p className="text-xs text-neutral-500">Qty: {item.quantity} x {formatPrice(item.price)}</p>
                            </div>
                            <p className="font-bold text-black">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedOrder.notes && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Customer Notes</h4>
                        <p className="bg-yellow-50 p-4 rounded-lg text-sm text-neutral-700 italic">"{selectedOrder.notes}"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center py-20 text-center bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200">
                <ShoppingBag size={48} className="text-neutral-300 mb-4" />
                <h3 className="text-xl font-bold text-neutral-400">Select an order to view details</h3>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default OrdersManager;
