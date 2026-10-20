import type {
  Product,
  ProductInput,
  ProductListResponse,
  SearchFilters,
  SearchResponse,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      0,
      `Cannot reach API at ${API_URL}. Start it with: docker compose up -d`,
    );
  }

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = (await response.json()) as { detail?: unknown };
      if (typeof body.detail === "string") {
        detail = body.detail;
      } else if (body.detail) {
        detail = JSON.stringify(body.detail);
      }
    } catch {
      // keep statusText
    }
    throw new ApiError(response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getApiBaseUrl(): string {
  return API_URL;
}

export async function searchProducts(
  filters: SearchFilters,
): Promise<SearchResponse> {
  const body = {
    query: filters.query,
    min_price: filters.min_price,
    max_price: filters.max_price,
    sizes: filters.sizes?.length ? filters.sizes : undefined,
    category: filters.category || undefined,
    in_stock_only: Boolean(filters.in_stock_only),
    limit: filters.limit ?? 20,
  };
  return request<SearchResponse>("/search", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listProducts(
  limit = 50,
  offset = 0,
): Promise<ProductListResponse> {
  return request<ProductListResponse>(
    `/products?limit=${limit}&offset=${offset}`,
  );
}

export async function getProduct(id: string): Promise<Product> {
  return request<Product>(`/products/${id}`);
}

export async function createProduct(payload: ProductInput): Promise<Product> {
  return request<Product>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(
  id: string,
  payload: Partial<ProductInput>,
): Promise<Product> {
  return request<Product>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await request<void>(`/products/${id}`, { method: "DELETE" });
}

export async function checkHealth(): Promise<{ status: string; database: string }> {
  return request("/health");
}
