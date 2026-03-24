import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { Product } from '@/src/types';
import ProductCard from '@/src/components/ProductCard';
import { Button } from '@/src/components/ui/Button';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { category } = useParams<{ category?: string }>();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'products'));
        if (category) {
          q = query(collection(db, 'products'), where('category', '==', category));
        }
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-4xl font-bold tracking-tight text-black sm:text-5xl"
        >
          {category ? `${category} Fragrances` : 'Discover Your Signature Scent'}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto max-w-2xl text-lg text-neutral-600"
        >
          Explore our curated collection of premium fragrances, crafted for those who appreciate the finer things in life.
        </motion.p>
      </header>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="mb-4 text-xl text-neutral-500">No products found in this category.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
