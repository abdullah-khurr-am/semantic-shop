export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: string;
  sizes: string[];
  in_stock: boolean;
  image_url: string | null;
  embedding_model: string | null;
  has_embedding: boolean;
  embedding_pending: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductListResponse = {
  items: Product[];
  total: number;
  limit: number;
  offset: number;
};

export type SearchHit = Product & {
  score: number;
};

export type SearchResponse = {
  query: string;
  items: SearchHit[];
  count: number;
};

export type SearchFilters = {
  query: string;
  min_price?: number;
  max_price?: number;
  sizes?: string[];
  category?: string;
  in_stock_only?: boolean;
  limit?: number;
};

export type ProductInput = {
  name: string;
  description: string;
  category: string;
  brand: string;
  price: string;
  sizes: string[];
  in_stock: boolean;
  image_url?: string | null;
};

export const CATEGORIES = [
  "jackets",
  "tops",
  "bottoms",
  "shoes",
  "accessories",
  "bags",
] as const;

export const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "OS"] as const;
