import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { Product } from '@/src/types';
import { useCart } from '@/src/context/CartContext';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { formatPrice, cn } from '@/src/lib/utils';
import { ShoppingCart, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="mb-4 text-xl text-neutral-500">Product not found.</p>
        <Button onClick={() => navigate('/')}>Go Back to Shop</Button>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.imageURLs.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.imageURLs.length) % product.imageURLs.length);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        className="mb-8 flex items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} /> Back
      </Button>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100 shadow-lg">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={product.imageURLs[currentImageIndex] || 'https://picsum.photos/seed/perfume/800/1000'}
                alt={product.name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>

            {product.imageURLs.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-black shadow-md backdrop-blur-sm transition-colors hover:bg-white"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-black shadow-md backdrop-blur-sm transition-colors hover:bg-white"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {product.imageURLs.map((url, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={cn(
                  "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                  currentImageIndex === index ? "border-black" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img src={url} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <Badge variant="secondary" className="mb-4 uppercase tracking-widest">
              {product.category}
            </Badge>
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-black sm:text-5xl">
              {product.name}
            </h1>
            <p className="text-3xl font-semibold text-neutral-900">
              {formatPrice(product.price)}
            </p>
          </div>

          <div className="mb-8 border-y border-neutral-100 py-8">
            <h3 className="mb-4 text-lg font-semibold text-black uppercase tracking-wider">Description</h3>
            <p className="text-lg leading-relaxed text-neutral-600">
              {product.description}
            </p>
          </div>

          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-neutral-500">Availability:</span>
              <Badge variant={product.stockStatus === 'in-stock' ? 'success' : 'destructive'}>
                {product.stockStatus === 'in-stock' ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full gap-2 rounded-full py-8 text-xl shadow-xl transition-transform active:scale-95"
            onClick={() => addToCart(product)}
            disabled={product.stockStatus === 'out-of-stock'}
          >
            <ShoppingCart size={24} />
            {product.stockStatus === 'out-of-stock' ? 'Sold Out' : 'Add to Cart'}
          </Button>

          <div className="mt-12 grid grid-cols-2 gap-6 border-t border-neutral-100 pt-12">
            <div>
              <h4 className="mb-2 font-bold text-black uppercase text-xs tracking-widest">Free Shipping</h4>
              <p className="text-sm text-neutral-500">On all orders over $150</p>
            </div>
            <div>
              <h4 className="mb-2 font-bold text-black uppercase text-xs tracking-widest">Secure Checkout</h4>
              <p className="text-sm text-neutral-500">Cash on delivery available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
