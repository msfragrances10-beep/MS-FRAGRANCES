import React from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { Button } from '@/src/components/ui/Button';
import { signOut } from 'firebase/auth';
import { auth } from '@/src/firebase';
import { cn } from '@/src/lib/utils';

const AdminLayout: React.FC = () => {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-12 flex items-center gap-2">
          <Link to="/" className="text-xl font-bold tracking-tighter text-black">
            MS ADMIN
          </Link>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-black text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-4">
          <Link to="/">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft size={16} /> Back to Shop
            </Button>
          </Link>
          <Button variant="ghost" className="w-full gap-2 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 w-full p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
