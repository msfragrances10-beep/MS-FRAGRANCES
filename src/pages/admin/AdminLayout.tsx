import React from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, LogOut, ArrowLeft, Menu } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { signOut } from 'firebase/auth';
import { auth } from '@/src/firebase';
import { cn } from '@/src/lib/utils';

const AdminLayout: React.FC = () => {
  const { isAdmin, loading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  console.log('AdminLayout:', { isAdmin, loading, userEmail: user?.email });

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/" />;

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white p-6">
      <div className="mb-12 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
          <span className="text-xs font-bold">MS</span>
        </div>
        <span className="text-xl font-bold tracking-tighter text-black uppercase">Admin Panel</span>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsSidebarOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold tracking-tight transition-all duration-200",
              location.pathname === item.path
                ? "bg-black text-white shadow-lg shadow-black/20 translate-x-1"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-black"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-3 pt-6 border-t border-neutral-100">
        <Link to="/" className="block">
          <Button variant="outline" className="w-full gap-2 rounded-xl border-neutral-200 hover:bg-neutral-50">
            <ArrowLeft size={16} /> Back to Shop
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          className="w-full gap-2 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600" 
          onClick={handleLogout}
        >
          <LogOut size={16} /> Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-neutral-50/50">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-72 border-r border-neutral-200 bg-white shadow-sm lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 z-40 flex w-full items-center justify-between border-b border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
            <span className="text-[10px] font-bold">MS</span>
          </div>
          <span className="font-bold tracking-tighter uppercase">Admin</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsSidebarOpen(true)}
          className="rounded-full hover:bg-neutral-100"
        >
          <Menu size={20} />
        </Button>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 h-full w-72 shadow-2xl lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pt-16 lg:ml-72 lg:pt-0">
        <div className="mx-auto max-w-7xl p-4 md:p-8 lg:p-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
