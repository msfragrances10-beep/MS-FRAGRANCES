import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { CartProvider } from '@/src/context/CartContext';
import Navbar from '@/src/components/Navbar';
import Home from '@/src/pages/Home';
import ProductDetails from '@/src/pages/ProductDetails';
import Cart from '@/src/pages/Cart';
import Checkout from '@/src/pages/Checkout';
import OrderConfirmation from '@/src/pages/OrderConfirmation';
import Login from '@/src/pages/Login';
import Search from '@/src/pages/Search';
import Contact from '@/src/pages/Contact';
import AdminLayout from '@/src/pages/admin/AdminLayout';
import AdminDashboard from '@/src/pages/admin/AdminDashboard';
import ProductsManager from '@/src/pages/admin/ProductsManager';
import OrdersManager from '@/src/pages/admin/OrdersManager';
import Footer from '@/src/components/Footer';
import { Toaster } from 'sonner';

const AppContent: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
          <p className="text-lg font-bold tracking-widest text-black uppercase">Ms Fragrances</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 selection:bg-black selection:text-white">
      <Navbar />
      <main className="pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:category" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<Search />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<ProductsManager />} />
            <Route path="orders" element={<OrdersManager />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="top-center" richColors />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
