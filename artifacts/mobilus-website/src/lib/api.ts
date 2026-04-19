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
  createdAt: string;
  updatedAt: string;
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
};
