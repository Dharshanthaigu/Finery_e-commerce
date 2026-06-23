import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { Cart } from "../types";
import toast from "react-hot-toast";

export const useCart = () => {
  return useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await api.get("/cart/");
      return res.data;
    },
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ product_id, quantity }: { product_id: string; quantity: number }) => {
      const res = await api.post("/cart/", { product_id, quantity });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to add to cart");
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product_id: string) => {
      await api.delete(`/cart/${product_id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item removed");
    },
    onError: () => {
      toast.error("Failed to remove item");
    },
  });
};