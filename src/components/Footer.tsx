import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-white pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="text-2xl font-bold tracking-tighter uppercase">
              Ms Fragrances
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-neutral-500">
              Curating the world's most exquisite scents. Experience luxury, elegance, and timeless fragrances delivered to your doorstep.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 transition-colors hover:text-black">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-neutral-400 transition-colors hover:text-black">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-neutral-400 transition-colors hover:text-black">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Shop Section */}
          <div>
            <h3 className="mb-6 text-xs font-semibold tracking-widest text-black uppercase">Shop</h3>
            <ul className="space-y-4 text-sm text-neutral-500">
              <li>
                <Link to="/category/Men" className="transition-colors hover:text-black">Men's Fragrances</Link>
              </li>
              <li>
                <Link to="/category/Women" className="transition-colors hover:text-black">Women's Fragrances</Link>
              </li>
              <li>
                <Link to="/category/Unisex" className="transition-colors hover:text-black">Unisex Collection</Link>
              </li>
              <li>
                <Link to="/category/Gift Sets" className="transition-colors hover:text-black">Gift Sets</Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="mb-6 text-xs font-semibold tracking-widest text-black uppercase">Support</h3>
            <ul className="space-y-4 text-sm text-neutral-500">
              <li>
                <Link to="/contact" className="transition-colors hover:text-black">Contact Us</Link>
              </li>
              <li>
                <Link to="#" className="transition-colors hover:text-black">Shipping Policy</Link>
              </li>
              <li>
                <Link to="#" className="transition-colors hover:text-black">Returns & Exchanges</Link>
              </li>
              <li>
                <Link to="#" className="transition-colors hover:text-black">FAQs</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-6 text-xs font-semibold tracking-widest text-black uppercase">Contact</h3>
            <ul className="space-y-4 text-sm text-neutral-500">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-black" />
                <span>123 Fragrance Lane, Luxury District, NY 10001</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="shrink-0 text-black" />
                <span>+1 (555) 000-1234</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="shrink-0 text-black" />
                <span>hello@msfragrances.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-neutral-100 pt-8 text-center">
          <p className="text-xs tracking-wider text-neutral-400 uppercase">
            © {currentYear} Ms Fragrances. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
