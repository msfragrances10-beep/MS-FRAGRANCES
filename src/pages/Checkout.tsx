import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { useCart } from '@/src/context/CartContext';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Label } from '@/src/components/ui/Label';
import { Textarea } from '@/src/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/src/components/ui/Card';
import { formatPrice } from '@/src/lib/utils';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/firebase';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const Checkout: React.FC = () => {
  const { user } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    phone: '',
    address: '',
    notes: '',
  });

  if (!user) {
    return <Navigate to="/login?redirect=/checkout" />;
  }

  if (cart.length === 0) {
    return <Navigate to="/cart" />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        products: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageURL: item.imageURLs[0],
        })),
        totalPrice,
        customerName: formData.customerName,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
        status: 'Pending',
        userId: user.id,
        createdAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp(),
      };

      try {
        const docRef = await addDoc(collection(db, 'orders'), orderData);
        clearCart();
        toast.success('Order placed successfully!');
        navigate(`/order-confirmation/${docRef.id}`);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'orders');
      }
    } catch (error) {
      console.error('Error preparing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-12 text-4xl font-bold tracking-tight text-black">Checkout</h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Checkout Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your full address"
                    className="min-h-[100px]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any special instructions for delivery?"
                    className="min-h-[80px]"
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="w-full rounded-lg bg-neutral-100 p-4 text-center text-sm font-medium text-neutral-600">
                Payment Method: <span className="text-black font-bold">Cash on Delivery</span>
              </div>
              <Button
                size="lg"
                className="w-full rounded-full py-8 text-xl shadow-lg transition-transform active:scale-95"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Placing Order...' : `Place Order (${formatPrice(totalPrice)})`}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <Card className="border-none bg-neutral-50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-md bg-neutral-200">
                    <img src={item.imageURLs[0]} alt={item.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <h4 className="text-sm font-bold text-black">{item.name}</h4>
                    <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-black">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
              <div className="mt-6 space-y-2 border-t border-neutral-200 pt-6">
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-black pt-4">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;
