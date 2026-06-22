import { create } from "zustand";

interface CartItem {
  product_id: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));