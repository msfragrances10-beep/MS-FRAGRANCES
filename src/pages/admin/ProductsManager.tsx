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
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-black">Products Manager</h1>
        <Button onClick={() => { setIsEditing(true); setCurrentProduct({ imageURLs: [], stockStatus: 'in-stock' }); }} className="gap-2">
          <Plus size={18} /> Add New Product
        </Button>
      </div>

      <AnimatePresence>
        {isDeleting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <Card className="w-full max-w-md border-none shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Confirm Deletion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">Are you sure you want to delete this product? This action cannot be undone.</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setIsDeleting(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => handleDeleteProduct(isDeleting)}>Delete</Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border-none shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-bold">
                  {currentProduct?.id ? 'Edit Product' : 'Add New Product'}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                  <X size={24} />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProduct} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={currentProduct?.name || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                        placeholder="e.g. Midnight Oud"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={currentProduct?.price || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                        placeholder="99.99"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
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
                    <div className="space-y-2">
                      <Label htmlFor="stockStatus">Stock Status</Label>
                      <select
                        id="stockStatus"
                        className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
                        value={currentProduct?.stockStatus || 'in-stock'}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, stockStatus: e.target.value as any })}
                      >
                        <option value="in-stock">In Stock</option>
                        <option value="out-of-stock">Out of Stock</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={currentProduct?.description || ''}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                      placeholder="Describe the fragrance notes and character..."
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Product Images</Label>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {/* Local Upload */}
                      <div className="space-y-2">
                        <Label className="text-xs text-neutral-500">Upload from Device</Label>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-neutral-200 bg-neutral-50 transition-colors hover:bg-neutral-100"
                        >
                          {uploading ? (
                            <Loader2 className="animate-spin text-neutral-400" size={20} />
                          ) : (
                            <>
                              <Upload size={18} className="text-neutral-400" />
                              <span className="text-sm text-neutral-600">Choose File</span>
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
                      <div className="space-y-2">
                        <Label className="text-xs text-neutral-500">Add via URL</Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                            <Input
                              value={newImageUrl}
                              onChange={(e) => setNewImageUrl(e.target.value)}
                              placeholder="https://..."
                              className="pl-9"
                            />
                          </div>
                          <Button type="button" onClick={addImageUrl} variant="secondary" size="sm">Add</Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      {currentProduct?.imageURLs?.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-lg bg-neutral-100 overflow-hidden group border border-neutral-200">
                          <img src={url} alt="Product" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => removeImageUrl(index)}
                            className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {(!currentProduct?.imageURLs || currentProduct.imageURLs.length === 0) && (
                        <div className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 text-neutral-400">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button type="submit" className="px-8">Save Product</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="border-none shadow-sm overflow-hidden group">
            <div className="aspect-[4/3] overflow-hidden bg-neutral-100 flex items-center justify-center">
              {product.imageURLs && product.imageURLs.length > 0 ? (
                <img
                  src={product.imageURLs[0]}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <ImageIcon size={48} className="text-neutral-300" />
              )}
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px] uppercase tracking-widest">{product.category}</Badge>
                <span className="font-bold text-black">{formatPrice(product.price)}</span>
              </div>
              <CardTitle className="text-lg font-bold">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="line-clamp-2 text-sm text-neutral-500">{product.description}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t border-neutral-50 pt-4">
              <Button variant="ghost" size="icon" onClick={() => { setCurrentProduct(product); setIsEditing(true); }}>
                <Edit2 size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => setIsDeleting(product.id)}>
                <Trash2 size={16} />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductsManager;
