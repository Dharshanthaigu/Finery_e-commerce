import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import { Product } from "../../src/types";

interface ProductsParams {
  category?: string;
  search?: string;
  skip?: number;
  limit?: number;
}

export const useProducts = (params: ProductsParams = {}) => {
  return useQuery<Product[]>({
    queryKey: ["products", params],
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params.category) query.append("category", params.category);
      if (params.search) query.append("search", params.search);
      if (params.skip !== undefined) query.append("skip", String(params.skip));
      if (params.limit !== undefined) query.append("limit", String(params.limit));
      const res = await api.get(`/products/?${query.toString()}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useProduct = (id: string) => {
  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery<string[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/products/categories");
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });
};