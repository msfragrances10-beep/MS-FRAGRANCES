import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { Product } from '@/src/types';
import ProductCard from '@/src/components/ProductCard';
import { Input } from '@/src/components/ui/Input';
import { Search as SearchIcon, X } from 'lucide-react';
import { motion } from 'motion/react';

const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-12 flex flex-col items-center justify-center text-center">
        <h1 className="mb-8 text-4xl font-bold tracking-tight text-black">Find Your Fragrance</h1>
        <div className="relative w-full max-w-2xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={24} />
          <Input
            className="h-16 rounded-full pl-14 pr-14 text-xl shadow-lg border-none focus-visible:ring-black"
            placeholder="Search by name, category, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-neutral-100 p-2 text-neutral-500 hover:bg-neutral-200 hover:text-black transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
        </div>
      ) : (
        <>
          <div className="mb-8 flex items-center justify-between">
            <p className="text-lg text-neutral-600">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'} found
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-xl text-neutral-500">No fragrances match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;
