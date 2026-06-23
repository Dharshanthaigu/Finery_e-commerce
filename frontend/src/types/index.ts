export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  brand: string;
}

export interface CartItem {
  product_id: string;
  quantity: number;
  name?: string;
  image_url?: string;
  price?: number;
}

export interface Cart {
  user_id: string;
  items: CartItem[];
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
}