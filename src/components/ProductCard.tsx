import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '@/src/types';
import { useCart } from '@/src/context/CartContext';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { formatPrice } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm transition-all hover:shadow-md"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        <img
          src={product.imageURLs[0] || 'https://picsum.photos/seed/perfume/400/500'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Link to={`/product/${product.id}`}>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Eye size={18} />
            </Button>
          </Link>
          <Button
            variant="primary"
            size="icon"
            className="rounded-full"
            onClick={() => addToCart(product)}
            disabled={product.stockStatus === 'out-of-stock'}
          >
            <ShoppingCart size={18} />
          </Button>
        </div>
        {product.stockStatus === 'out-of-stock' && (
          <Badge variant="destructive" className="absolute left-3 top-3">
            Out of Stock
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            {product.category}
          </span>
          <span className="text-sm font-bold text-black">
            {formatPrice(product.price)}
          </span>
        </div>
        <Link to={`/product/${product.id}`} className="mb-2 block">
          <h3 className="text-lg font-semibold leading-tight text-neutral-900 hover:text-black">
            {product.name}
          </h3>
        </Link>
        <p className="mb-4 line-clamp-2 text-sm text-neutral-500">
          {product.description}
        </p>
        <Button
          variant="outline"
          className="mt-auto w-full"
          onClick={() => addToCart(product)}
          disabled={product.stockStatus === 'out-of-stock'}
        >
          {product.stockStatus === 'out-of-stock' ? 'Sold Out' : 'Add to Cart'}
        </Button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
