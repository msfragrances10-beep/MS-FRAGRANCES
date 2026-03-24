import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from './firebase';

const sampleProducts = [
  {
    name: "Midnight Oud",
    price: 120,
    description: "A deep, mysterious blend of agarwood, rose, and patchouli. Perfect for evening wear and special occasions.",
    imageURLs: ["https://picsum.photos/seed/oud/800/1000", "https://picsum.photos/seed/oud2/800/1000"],
    category: "Woody",
    stockStatus: "in-stock",
    createdAt: new Date().toISOString()
  },
  {
    name: "Velvet Rose",
    price: 85,
    description: "A romantic bouquet of damask rose, peony, and white musk. Soft, elegant, and timeless.",
    imageURLs: ["https://picsum.photos/seed/rose/800/1000", "https://picsum.photos/seed/rose2/800/1000"],
    category: "Floral",
    stockStatus: "in-stock",
    createdAt: new Date().toISOString()
  },
  {
    name: "Ocean Breeze",
    price: 65,
    description: "Crisp sea salt, citrus, and sage. A refreshing and energetic scent for daily wear.",
    imageURLs: ["https://picsum.photos/seed/ocean/800/1000", "https://picsum.photos/seed/ocean2/800/1000"],
    category: "Fresh",
    stockStatus: "in-stock",
    createdAt: new Date().toISOString()
  },
  {
    name: "Golden Amber",
    price: 110,
    description: "Warm amber, vanilla, and spicy cardamom. A rich and comforting oriental fragrance.",
    imageURLs: ["https://picsum.photos/seed/amber/800/1000", "https://picsum.photos/seed/amber2/800/1000"],
    category: "Oriental",
    stockStatus: "in-stock",
    createdAt: new Date().toISOString()
  },
  {
    name: "Cedar & Bergamot",
    price: 95,
    description: "Earthy cedarwood paired with bright bergamot and black pepper. Sophisticated and grounded.",
    imageURLs: ["https://picsum.photos/seed/cedar/800/1000", "https://picsum.photos/seed/cedar2/800/1000"],
    category: "Woody",
    stockStatus: "in-stock",
    createdAt: new Date().toISOString()
  }
];

export const seedProducts = async () => {
  const productsRef = collection(db, 'products');
  const q = query(productsRef, limit(1));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.log("Seeding sample products...");
    for (const product of sampleProducts) {
      await addDoc(productsRef, product);
    }
    console.log("Sample products seeded successfully!");
  } else {
    console.log("Products already exist, skipping seed.");
  }
};
