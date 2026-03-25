import React, { useEffect, useState, useRef } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '@/src/firebase';
import { Product } from '@/src/types';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Label } from '@/src/components/ui/Label';
import { Textarea } from '@/src/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { formatPrice } from '@/src/lib/utils';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Upload, Link as LinkIcon, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

const ProductsManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
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

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct?.name || !currentProduct?.price || !currentProduct?.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const productData = {
        ...currentProduct,
        price: Number(currentProduct.price),
        imageURLs: currentProduct.imageURLs || [],
        stockStatus: currentProduct.stockStatus || 'in-stock',
        createdAt: currentProduct.createdAt || new Date().toISOString(),
        updatedAt: serverTimestamp(),
      };

      if (currentProduct.id) {
        const docRef = doc(db, 'products', currentProduct.id);
        try {
          await updateDoc(docRef, productData);
          toast.success('Product updated successfully!');
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `products/${currentProduct.id}`);
        }
      } else {
        try {
          await addDoc(collection(db, 'products'), productData);
          toast.success('Product added successfully!');
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'products');
        }
      }
      setIsEditing(false);
      setCurrentProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted successfully!');
      setIsDeleting(null);
      fetchProducts();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const addImageUrl = () => {
    if (!newImageUrl) return;
    setCurrentProduct((prev) => ({
      ...prev,
      imageURLs: [...(prev?.imageURLs || []), newImageUrl],
    }));
    setNewImageUrl('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('Selected file for upload:', file.name);
    setUploading(true);
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      console.log('File uploaded successfully. URL:', downloadURL);
      
      setCurrentProduct((prev) => ({
        ...prev,
        imageURLs: [...(prev?.imageURLs || []), downloadURL],
      }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImageUrl = (index: number) => {
    setCurrentProduct((prev) => ({
      ...prev,
      imageURLs: prev?.imageURLs?.filter((_, i) => i !== index),
    }));
  };

  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tighter text-black uppercase">Products</h1>
          <p className="text-neutral-500">Manage your fragrance collection and inventory.</p>
        </div>
        <Button onClick={() => { setIsEditing(true); setCurrentProduct({ imageURLs: [], stockStatus: 'in-stock' }); }} className="gap-2 rounded-xl h-12 px-6 shadow-lg shadow-black/10">
          <Plus size={18} /> Add New Product
        </Button>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
          <ImageIcon size={18} />
        </div>
        <Input 
          placeholder="Search products by name or category..." 
          className="pl-12 h-14 rounded-2xl border-none bg-white shadow-sm focus-visible:ring-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <AnimatePresence>
        {isDeleting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          >
            <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-tight">Confirm Deletion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">Are you sure you want to delete this product? This action cannot be undone and will remove the item from the shop.</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" onClick={() => setIsDeleting(null)} className="rounded-xl">Cancel</Button>
                <Button variant="destructive" onClick={() => handleDeleteProduct(isDeleting)} className="rounded-xl px-8">Delete</Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl"
            >
              <Card className="max-h-[85vh] overflow-y-auto border-none shadow-2xl rounded-3xl">
                <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-100 pb-6">
                  <CardTitle className="text-3xl font-bold tracking-tight uppercase">
                    {currentProduct?.id ? 'Edit Product' : 'New Product'}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="rounded-full hover:bg-neutral-100">
                    <X size={24} />
                  </Button>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSaveProduct} className="space-y-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-neutral-400">Product Name</Label>
                        <Input
                          id="name"
                          value={currentProduct?.name || ''}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                          placeholder="e.g. Midnight Oud"
                          className="h-12 rounded-xl border-neutral-200"
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="price" className="text-xs font-bold uppercase tracking-widest text-neutral-400">Price ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={currentProduct?.price || ''}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                          placeholder="99.99"
                          className="h-12 rounded-xl border-neutral-200"
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="category" className="text-xs font-bold uppercase tracking-widest text-neutral-400">Category</Label>
                        <select
                          id="category"
                          className="flex h-12 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                          value={currentProduct?.category || ''}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="Woody">Woody</option>
                          <option value="Floral">Floral</option>
                          <option value="Fresh">Fresh</option>
                          <option value="Oriental">Oriental</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="stockStatus" className="text-xs font-bold uppercase tracking-widest text-neutral-400">Stock Status</Label>
                        <select
                          id="stockStatus"
                          className="flex h-12 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                          value={currentProduct?.stockStatus || 'in-stock'}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, stockStatus: e.target.value as any })}
                        >
                          <option value="in-stock">In Stock</option>
                          <option value="out-of-stock">Out of Stock</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-neutral-400">Description</Label>
                      <Textarea
                        id="description"
                        value={currentProduct?.description || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                        placeholder="Describe the fragrance notes and character..."
                        className="min-h-[120px] rounded-xl border-neutral-200 p-4"
                        required
                      />
                    </div>

                    <div className="space-y-6">
                      <Label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Product Images</Label>
                      
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Local Upload */}
                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Upload from Device</Label>
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex h-14 cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 transition-all hover:bg-neutral-100 hover:border-black/20"
                          >
                            {uploading ? (
                              <Loader2 className="animate-spin text-neutral-400" size={20} />
                            ) : (
                              <>
                                <Upload size={20} className="text-neutral-400" />
                                <span className="text-sm font-medium text-neutral-600">Choose File</span>
                              </>
                            )}
                          </div>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={uploading}
                          />
                        </div>

                        {/* URL Link */}
                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Add via URL</Label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                              <Input
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                placeholder="https://..."
                                className="pl-11 h-14 rounded-xl border-neutral-200"
                              />
                            </div>
                            <Button type="button" onClick={addImageUrl} variant="secondary" className="h-14 rounded-xl px-6">Add</Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
                        {currentProduct?.imageURLs?.map((url, index) => (
                          <div key={index} className="relative aspect-square rounded-2xl bg-neutral-100 overflow-hidden group border border-neutral-200 shadow-sm">
                            <img src={url} alt="Product" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => removeImageUrl(index)}
                              className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500 scale-90 group-hover:scale-100"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        {(!currentProduct?.imageURLs || currentProduct.imageURLs.length === 0) && (
                          <div className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 text-neutral-300">
                            <ImageIcon size={32} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-neutral-100">
                      <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl h-12 px-8">Cancel</Button>
                      <Button type="submit" className="rounded-xl h-12 px-12 shadow-lg shadow-black/10">Save Product</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        {filteredProducts.map((product) => (
          <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            key={product.id}
          >
            <Card className="border-none shadow-sm overflow-hidden group rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                {product.imageURLs && product.imageURLs.length > 0 ? (
                  <img
                    src={product.imageURLs[0]}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-300">
                    <ImageIcon size={64} />
                  </div>
                )}
                <div className="absolute left-4 top-4">
                  <Badge variant={product.stockStatus === 'in-stock' ? 'success' : 'destructive'} className="rounded-full px-3 py-1 text-[10px] uppercase tracking-widest shadow-sm">
                    {product.stockStatus === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{product.category}</span>
                  <span className="text-xl font-bold text-black">{formatPrice(product.price)}</span>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <p className="line-clamp-2 text-sm text-neutral-500 leading-relaxed">{product.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between gap-2 border-t border-neutral-50 pt-6 px-6 pb-6">
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2 rounded-xl border-neutral-200 hover:bg-neutral-50" 
                  onClick={() => { setCurrentProduct(product); setIsEditing(true); }}
                >
                  <Edit2 size={16} /> Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600" 
                  onClick={() => setIsDeleting(product.id)}
                >
                  <Trash2 size={18} />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100 text-neutral-300">
              <Package size={48} />
            </div>
            <h3 className="text-2xl font-bold text-neutral-400 uppercase tracking-tight">No products found</h3>
            <p className="text-neutral-500">Try adjusting your search or add a new product.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsManager;
