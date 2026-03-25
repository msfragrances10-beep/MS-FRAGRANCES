export type Role = "user" | "admin";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageURLs: string[]; // Support multiple images
  category: string;
  stockStatus: "in-stock" | "out-of-stock";
  createdAt: string;
}

export type OrderStatus = "Pending" | "Confirmed" | "Out for Delivery" | "Delivered" | "Cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageURL: string;
}

export interface Order {
  id: string;
  products: OrderItem[];
  totalPrice: number;
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  status: OrderStatus;
  userId: string;
  createdAt: string;
}

export interface CartItem extends Product {
  quantity: number;
}
