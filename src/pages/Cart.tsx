import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/src/context/CartContext';
import { Button } from '@/src/components/ui/Button';
import { formatPrice } from '@/src/lib/utils';
import { motion } from 'motion/react';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
          <ShoppingBag size={48} />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-black">Your cart is empty</h2>
        <p className="mb-8 text-neutral-500">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/">
          <Button size="lg" className="rounded-full px-8">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-12 text-4xl font-bold tracking-tight text-black">Your Shopping Cart</h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-8">
          {cart.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-6 border-b border-neutral-100 pb-8"
            >
              <div className="h-32 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100 shadow-sm">
                <img
                  src={item.imageURLs[0] || 'https://picsum.photos/seed/perfume/200/300'}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-black">{item.name}</h3>
                    <p className="text-sm text-neutral-500">{item.category}</p>
                  </div>
                  <p className="text-lg font-bold text-black">{formatPrice(item.price * item.quantity)}</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-full border border-neutral-200 p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 rounded-2xl bg-neutral-50 p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-black">Order Summary</h2>
            <div className="space-y-4 border-b border-neutral-200 pb-6">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal ({totalItems} items)</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-medium">FREE</span>
              </div>
            </div>
            <div className="mt-6 flex justify-between text-xl font-bold text-black">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <Button
              size="lg"
              className="mt-8 w-full gap-2 rounded-full py-8 text-lg shadow-lg transition-transform active:scale-95"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
              <ArrowRight size={20} />
            </Button>
            <p className="mt-4 text-center text-xs text-neutral-500">
              Free shipping on all orders. Returns accepted within 30 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
