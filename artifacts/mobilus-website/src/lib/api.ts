export interface ApiProduct {
  id: number;
  slug: string;
  name: string;
  price: number;
  oldPrice: number | null;
  category: string;
  engine: string;
  image: string;
  badge: string | null;
  stock: number;
  descriptionLv: string;
  descriptionEn: string;
  descriptionRu: string;
  specs: { label: { lv: string; en: string; ru: string }; value: string }[];
  manufacturerLogoUrl: string | null;
  manufacturerYoutubeId: string | null;
  manufacturerDescLv: string | null;
  manufacturerDescEn: string | null;
  manufacturerDescRu: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiReview {
  id: number;
  productId: number;
  productSlug: string;
  name: string;
  rating: number;
  text: string;
  approved: boolean;
  createdAt: string;
}

export interface ApiInquiry {
  id: number;
  productId: number;
  productSlug: string;
  productName: string;
  name: string;
  phone: string;
  email: string;
  read: boolean;
  createdAt: string;
}

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

function adminHeaders(key: string): HeadersInit {
  return { "Content-Type": "application/json", "x-admin-key": key };
}

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

export const api = {
  products: {
    list: () => request<ApiProduct[]>("/products"),
    getBySlug: (slug: string) => request<ApiProduct>(`/products/slug/${slug}`),
    create: (data: Omit<ApiProduct, "id" | "createdAt" | "updatedAt">, key: string) =>
      request<ApiProduct>("/products", {
        method: "POST",
        headers: adminHeaders(key),
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<ApiProduct>, key: string) =>
      request<ApiProduct>(`/products/${id}`, {
        method: "PUT",
        headers: adminHeaders(key),
        body: JSON.stringify(data),
      }),
    delete: (id: number, key: string) =>
      request<{ success: boolean }>(`/products/${id}`, {
        method: "DELETE",
        headers: adminHeaders(key),
      }),
  },
  reviews: {
    listAll: (key: string) =>
      request<ApiReview[]>("/reviews", { headers: adminHeaders(key) }),
    listBySlug: (slug: string) =>
      request<ApiReview[]>(`/reviews/product/${slug}`),
    create: (data: { productId: number; productSlug: string; name: string; rating: number; text: string }) =>
      request<ApiReview>("/reviews", {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(data),
      }),
    approve: (id: number, key: string) =>
      request<ApiReview>(`/reviews/${id}/approve`, {
        method: "PATCH",
        headers: adminHeaders(key),
      }),
    delete: (id: number, key: string) =>
      request<{ success: boolean }>(`/reviews/${id}`, {
        method: "DELETE",
        headers: adminHeaders(key),
      }),
  },
  inquiries: {
    listAll: (key: string) =>
      request<ApiInquiry[]>("/inquiries", { headers: adminHeaders(key) }),
    create: (data: { productId: number; productSlug: string; productName: string; name: string; phone: string; email: string }) =>
      request<ApiInquiry>("/inquiries", {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(data),
      }),
    markRead: (id: number, key: string) =>
      request<ApiInquiry>(`/inquiries/${id}/read`, {
        method: "PATCH",
        headers: adminHeaders(key),
      }),
    delete: (id: number, key: string) =>
      request<{ success: boolean }>(`/inquiries/${id}`, {
        method: "DELETE",
        headers: adminHeaders(key),
      }),
  },
};
