import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  sku: string;
  colorName?: string;
  colorHex?: string;
  section: string;
}

interface CartContextType {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (productId: number, colorName?: string) => void;
  update: (productId: number, colorName: string | undefined, quantity: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  vat: number;
  total: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  add: () => {},
  remove: () => {},
  update: () => {},
  clear: () => {},
  count: 0,
  subtotal: 0,
  vat: 0,
  total: 0,
});

const STORAGE_KEY = "mobilus_cart";
const VAT_RATE = 0.21;

function itemKey(productId: number, colorName?: string) {
  return `${productId}::${colorName ?? ""}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = (item: CartItem) => {
    setItems((prev) => {
      const key = itemKey(item.productId, item.colorName);
      const existing = prev.find((i) => itemKey(i.productId, i.colorName) === key);
      if (existing) {
        return prev.map((i) =>
          itemKey(i.productId, i.colorName) === key
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const remove = (productId: number, colorName?: string) => {
    const key = itemKey(productId, colorName);
    setItems((prev) => prev.filter((i) => itemKey(i.productId, i.colorName) !== key));
  };

  const update = (productId: number, colorName: string | undefined, quantity: number) => {
    const key = itemKey(productId, colorName);
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => itemKey(i.productId, i.colorName) !== key));
    } else {
      setItems((prev) =>
        prev.map((i) => (itemKey(i.productId, i.colorName) === key ? { ...i, quantity } : i))
      );
    }
  };

  const clear = () => setItems([]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = Math.round(items.reduce((sum, i) => sum + i.price * i.quantity, 0) / (1 + VAT_RATE));
  const vat = Math.round(items.reduce((sum, i) => sum + i.price * i.quantity, 0)) - subtotal;
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, update, clear, count, subtotal, vat, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
