export interface ApiProductVariant {
  id: number;
  productId: number;
  colorName: string;
  colorHex: string | null;
  image: string;
  stock: number;
  createdAt: string;
}

export type ApiVariantInput = Omit<ApiProductVariant, "id" | "productId" | "createdAt">;

export type ApiProductInput = Omit<ApiProduct, "id" | "createdAt" | "updatedAt" | "variants"> & {
  variants?: ApiVariantInput[];
};

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
  featured: boolean;
  descriptionLv: string;
  descriptionEn: string;
  descriptionRu: string;
  specs: { label: { lv: string; en: string; ru: string }; value: string }[];
  manufacturerLogoUrl: string | null;
  manufacturerYoutubeId: string | null;
  manufacturerDescLv: string | null;
  manufacturerDescEn: string | null;
  manufacturerDescRu: string | null;
  variants: ApiProductVariant[];
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

export interface ApiLocation {
  id: number;
  name: string;
  address: string;
  workHours: string;
  contacts: { phone?: string; email?: string };
  leadTimeDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ApiLocationInput = Omit<ApiLocation, "id" | "createdAt" | "updatedAt">;

export interface ApiDeliveryOption {
  id: number;
  name: string;
  priceMin: number;
  priceMax: number;
  leadTimeDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ApiDeliveryOptionInput = Omit<ApiDeliveryOption, "id" | "createdAt" | "updatedAt">;

export interface ApiAvailabilityEntry {
  id: number;
  productId: number;
  variantId: number | null;
  locationId: number | null;
  deliveryOptionId: number | null;
  quantity: number;
  locationName: string | null;
  locationAddress: string | null;
  locationLeadTimeDays: number | null;
  locationIsActive: boolean | null;
  deliveryName: string | null;
  deliveryPriceMin: number | null;
  deliveryPriceMax: number | null;
  deliveryLeadTimeDays: number | null;
  deliveryIsActive: boolean | null;
  variantColorName: string | null;
}

export interface ApiAvailabilityEntryAdmin extends ApiAvailabilityEntry {
  serialNumber: string | null;
}

export interface ApiAvailability {
  entries: ApiAvailabilityEntry[];
  totalStock: number;
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

export interface ApiOrderItem {
  productId: number;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  sku: string;
  colorName?: string;
}

export interface ApiDeliveryAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  company?: string;
  buyForCompany?: boolean;
}

export interface ApiOrder {
  id: number;
  status: string;
  paymentMethod: string;
  stripeSessionId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: ApiDeliveryAddress;
  items: ApiOrderItem[];
  subtotal: number;
  vat: number;
  total: number;
  discountCode: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const api = {
  products: {
    list: () => request<ApiProduct[]>("/products"),
    getBySlug: (slug: string) => request<ApiProduct>(`/products/slug/${slug}`),
    create: (data: ApiProductInput, key: string) =>
      request<ApiProduct>("/products", {
        method: "POST",
        headers: adminHeaders(key),
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<ApiProductInput>, key: string) =>
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
  variants: {
    create: (productId: number, data: Omit<ApiProductVariant, "id" | "productId" | "createdAt">, key: string) =>
      request<ApiProductVariant>(`/products/${productId}/variants`, {
        method: "POST",
        headers: adminHeaders(key),
        body: JSON.stringify(data),
      }),
    update: (productId: number, variantId: number, data: Partial<ApiProductVariant>, key: string) =>
      request<ApiProductVariant>(`/products/${productId}/variants/${variantId}`, {
        method: "PUT",
        headers: adminHeaders(key),
        body: JSON.stringify(data),
      }),
    delete: (productId: number, variantId: number, key: string) =>
      request<{ success: boolean }>(`/products/${productId}/variants/${variantId}`, {
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
  orders: {
    listAll: (key: string) =>
      request<ApiOrder[]>("/orders", { headers: adminHeaders(key) }),
    create: (data: Omit<ApiOrder, "id" | "createdAt" | "updatedAt">) =>
      request<ApiOrder>("/orders", {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(data),
      }),
    patch: (id: number, data: Partial<ApiOrder>, key: string) =>
      request<ApiOrder>(`/orders/${id}`, {
        method: "PATCH",
        headers: { ...adminHeaders(key), "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  },
  locations: {
    list: () => request<ApiLocation[]>("/locations"),
    create: (data: ApiLocationInput, key: string) =>
      request<ApiLocation>("/locations", {
        method: "POST",
        headers: adminHeaders(key),
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<ApiLocationInput>, key: string) =>
      request<ApiLocation>(`/locations/${id}`, {
        method: "PATCH",
        headers: adminHeaders(key),
        body: JSON.stringify(data),
      }),
    delete: (id: number, key: string) =>
      request<{ success: boolean }>(`/locations/${id}`, {
        method: "DELETE",
        headers: adminHeaders(key),
      }),
  },
  deliveryOptions: {
    list: () => request<ApiDeliveryOption[]>("/delivery-options"),
    create: (data: ApiDeliveryOptionInput, key: string) =>
      request<ApiDeliveryOption>("/delivery-options", {
        method: "POST",
        headers: adminHeaders(key),
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<ApiDeliveryOptionInput>, key: string) =>
      request<ApiDeliveryOption>(`/delivery-options/${id}`, {
        method: "PATCH",
        headers: adminHeaders(key),
        body: JSON.stringify(data),
      }),
    delete: (id: number, key: string) =>
      request<{ success: boolean }>(`/delivery-options/${id}`, {
        method: "DELETE",
        headers: adminHeaders(key),
      }),
  },
  availability: {
    getByProduct: (productId: number) =>
      request<ApiAvailability>(`/products/${productId}/availability`),
    getByProductAdmin: (productId: number, key: string) =>
      request<{ entries: ApiAvailabilityEntryAdmin[]; totalStock: number }>(`/products/${productId}/availability/admin`, {
        headers: adminHeaders(key),
      }),
    create: (
      productId: number,
      data: { variantId?: number | null; locationId: number; quantity: number; serialNumber?: string | null },
      key: string
    ) =>
      request<ApiAvailabilityEntryAdmin>(`/products/${productId}/availability`, {
        method: "POST",
        headers: adminHeaders(key),
        body: JSON.stringify(data),
      }),
    delete: (entryId: number, key: string) =>
      request<{ success: boolean }>(`/availability/${entryId}`, {
        method: "DELETE",
        headers: adminHeaders(key),
      }),
  },
};
