import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Search, Menu, X } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useCart } from '@/src/context/CartContext';
import { Button } from '@/src/components/ui/Button';
import { auth } from '@/src/firebase';
import { signOut } from 'firebase/auth';

const Navbar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-black">
            MS FRAGRANCES
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
            <Link to="/" className="hover:text-black transition-colors">Shop All</Link>
            <Link to="/category/Woody" className="hover:text-black transition-colors">Woody</Link>
            <Link to="/category/Floral" className="hover:text-black transition-colors">Floral</Link>
            <Link to="/category/Fresh" className="hover:text-black transition-colors">Fresh</Link>
            <Link to="/contact" className="hover:text-black transition-colors">Contact</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/search" className="p-2 text-neutral-600 hover:text-black transition-colors">
            <Search size={20} />
          </Link>
          <Link to="/cart" className="relative p-2 text-neutral-600 hover:text-black transition-colors">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
          
          {user ? (
            <div className="hidden md:flex items-center gap-4">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">Admin</Button>
                </Link>
              )}
              <div className="flex items-center gap-2 text-sm font-medium">
                <User size={18} />
                <span>{user.name}</span>
              </div>
              <button onClick={handleLogout} className="text-neutral-600 hover:text-black transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:block">
              <Button size="sm">Login</Button>
            </Link>
          )}

          <button 
            className="md:hidden p-2 text-neutral-600 hover:text-black transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 py-6 space-y-4">
          <div className="flex flex-col gap-4 text-lg font-medium">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Shop All</Link>
            <Link to="/category/Woody" onClick={() => setIsMenuOpen(false)}>Woody</Link>
            <Link to="/category/Floral" onClick={() => setIsMenuOpen(false)}>Floral</Link>
            <Link to="/category/Fresh" onClick={() => setIsMenuOpen(false)}>Fresh</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
          </div>
          <div className="pt-4 border-t border-neutral-100">
            {user ? (
              <div className="flex flex-col gap-4">
                {isAdmin && <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>}
                <div className="flex items-center gap-2">
                  <User size={18} />
                  <span>{user.name}</span>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-500">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full">Login</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
