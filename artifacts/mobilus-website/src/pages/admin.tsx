import { useState, useEffect, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import { api, type ApiProduct, type ApiProductInput, type ApiVariantInput, type ApiReview, type ApiInquiry, type ApiOrder, type ApiOrderItem, type ApiDeliveryAddress, type ApiLocation, type ApiDeliveryOption, type ApiAvailabilityEntry } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Pencil, Trash2, LogOut, Save, X, Package,
  ChevronUp, ChevronDown, Search, Star, MessageSquare,
  CheckCircle2, Eye, Mail, Phone, ShoppingBag, AlertCircle, Palette, ShoppingCart,
  MapPin, Truck, Building2
} from "lucide-react";

const STORAGE_KEY = "mobilus_admin_key";
const CATEGORIES = ["Skūteri", "Elektro", "Motocikli", "ATV", "Velo", "Skrituļslidas", "Slēpes", "Snoubords"];

type FormState = Omit<ApiProductInput, "variants">;
type AdminTab = "products" | "reviews" | "inquiries" | "orders" | "availability";

type VariantFormItem = {
  id?: number;
  colorName: string;
  colorHex: string;
  image: string;
  stock: number;
};

const emptyForm = (): FormState => ({
  slug: "",
  name: "",
  price: 0,
  oldPrice: null,
  category: "Skūteri",
  engine: "",
  image: "",
  badge: null,
  stock: 0,
  featured: false,
  descriptionLv: "",
  descriptionEn: "",
  descriptionRu: "",
  specs: [],
  manufacturerLogoUrl: null,
  manufacturerYoutubeId: null,
  manufacturerDescLv: null,
  manufacturerDescEn: null,
  manufacturerDescRu: null,
});

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("lv-LV", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [keyInput, setKeyInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [authed, setAuthed] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>("products");

  // Products state
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState("");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [sortField, setSortField] = useState<keyof ApiProduct>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<ApiProduct | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [variantItems, setVariantItems] = useState<VariantFormItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [activeFormTab, setActiveFormTab] = useState<"basic" | "desc" | "specs" | "manufacturer" | "variants" | "availability">("basic");

  // Availability (locations/delivery/stock) state
  const [locations, setLocations] = useState<ApiLocation[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState<ApiDeliveryOption[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Product-level stock entries (inside product editor modal)
  const [productStockEntries, setProductStockEntries] = useState<ApiAvailabilityEntry[]>([]);
  const [stockEntryForm, setStockEntryForm] = useState<{
    locationId: string; deliveryOptionId: string; variantId: string; quantity: number; serialNumber: string;
  }>({ locationId: "", deliveryOptionId: "", variantId: "", quantity: 1, serialNumber: "" });
  const [savingStockEntry, setSavingStockEntry] = useState(false);

  // Availability tab: location editor state
  const [editingLocation, setEditingLocation] = useState<ApiLocation | null>(null);
  const [locationForm, setLocationForm] = useState({ name: "", address: "", workHours: "", phone: "", email: "", leadTimeDays: 1, isActive: true });
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);

  // Availability tab: delivery option editor state
  const [editingDelivery, setEditingDelivery] = useState<ApiDeliveryOption | null>(null);
  const [deliveryForm, setDeliveryForm] = useState({ name: "", priceMin: 0, priceMax: 0, leadTimeDays: 3, isActive: true });
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [savingDelivery, setSavingDelivery] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<ApiProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Inquiries state
  const [inquiries, setInquiries] = useState<ApiInquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    setProductError("");
    try {
      const data = await api.products.list();
      setProducts(data);
    } catch (e: any) {
      setProductError(e.message);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const loadReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const data = await api.reviews.listAll(adminKey);
      setReviews(data);
    } catch {
    } finally {
      setLoadingReviews(false);
    }
  }, [adminKey]);

  const loadInquiries = useCallback(async () => {
    setLoadingInquiries(true);
    try {
      const data = await api.inquiries.listAll(adminKey);
      setInquiries(data);
    } catch {
    } finally {
      setLoadingInquiries(false);
    }
  }, [adminKey]);

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const data = await api.orders.listAll(adminKey);
      setOrders(data);
    } catch {
    } finally {
      setLoadingOrders(false);
    }
  }, [adminKey]);

  const loadLocations = useCallback(async () => {
    try {
      const data = await api.locations.list();
      setLocations(data);
    } catch {}
  }, []);

  const loadDeliveryOptions = useCallback(async () => {
    try {
      const data = await api.deliveryOptions.list();
      setDeliveryOptions(data);
    } catch {}
  }, []);

  const loadProductStockEntries = useCallback(async (productId: number) => {
    setLoadingAvailability(true);
    try {
      const data = await api.availability.getByProduct(productId);
      setProductStockEntries(data.entries);
    } catch {
      setProductStockEntries([]);
    } finally {
      setLoadingAvailability(false);
    }
  }, []);

  useEffect(() => {
    if (authed) {
      loadProducts();
      loadReviews();
      loadInquiries();
      loadOrders();
      loadLocations();
      loadDeliveryOptions();
    }
  }, [authed, loadProducts, loadReviews, loadInquiries, loadOrders, loadLocations, loadDeliveryOptions]);

  async function handleLogin() {
    setAuthError("");
    try {
      await api.products.update(0, {}, keyInput);
    } catch (e: any) {
      if (e.message === "Unauthorized") { setAuthError("Wrong admin key."); return; }
    }
    localStorage.setItem(STORAGE_KEY, keyInput);
    setAdminKey(keyInput);
    setAuthed(true);
  }

  useEffect(() => {
    if (adminKey) {
      api.products.update(0, {}, adminKey).catch((e) => {
        if (e.message !== "Not Found" && e.message !== "Product not found") {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          setAuthed(true);
        }
      });
    }
  }, []);

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setAdminKey("");
    setAuthed(false);
  }

  function openAdd() {
    setForm(emptyForm());
    setVariantItems([]);
    setEditing(null);
    setFormError("");
    setActiveFormTab("basic");
    setModal("add");
  }

  function openEdit(p: ApiProduct) {
    setForm({
      slug: p.slug, name: p.name, price: p.price, oldPrice: p.oldPrice,
      category: p.category, engine: p.engine, image: p.image, badge: p.badge,
      stock: p.stock, featured: p.featured ?? false, descriptionLv: p.descriptionLv, descriptionEn: p.descriptionEn,
      descriptionRu: p.descriptionRu, specs: p.specs,
      manufacturerLogoUrl: p.manufacturerLogoUrl ?? null,
      manufacturerYoutubeId: p.manufacturerYoutubeId ?? null,
      manufacturerDescLv: p.manufacturerDescLv ?? null,
      manufacturerDescEn: p.manufacturerDescEn ?? null,
      manufacturerDescRu: p.manufacturerDescRu ?? null,
    });
    setVariantItems((p.variants ?? []).map((v) => ({
      id: v.id,
      colorName: v.colorName,
      colorHex: v.colorHex ?? "",
      image: v.image,
      stock: v.stock,
    })));
    setEditing(p);
    setFormError("");
    setActiveFormTab("basic");
    setProductStockEntries([]);
    setStockEntryForm({ locationId: "", deliveryOptionId: "", variantId: "", quantity: 1, serialNumber: "" });
    loadProductStockEntries(p.id);
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setEditing(null);
    setFormError("");
    setVariantItems([]);
    setProductStockEntries([]);
    setStockEntryForm({ locationId: "", deliveryOptionId: "", variantId: "", quantity: 1, serialNumber: "" });
  }

  function addVariant() {
    setVariantItems((v) => [...v, { colorName: "", colorHex: "", image: "", stock: 0 }]);
  }

  function removeVariant(i: number) {
    setVariantItems((v) => v.filter((_, idx) => idx !== i));
  }

  function updateVariant(i: number, field: keyof VariantFormItem, val: string | number) {
    setVariantItems((v) => v.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  }

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === "name" && modal === "add") next.slug = slugify(v as string);
      return next;
    });
  }

  // Spec helpers
  function addSpec() {
    setForm((f) => ({
      ...f,
      specs: [...f.specs, { label: { lv: "", en: "", ru: "" }, value: "" }],
    }));
  }

  function removeSpec(i: number) {
    setForm((f) => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));
  }

  function updateSpec(i: number, field: "lv" | "en" | "ru" | "value", val: string) {
    setForm((f) => {
      const specs = f.specs.map((s, idx) => {
        if (idx !== i) return s;
        if (field === "value") return { ...s, value: val };
        return { ...s, label: { ...s.label, [field]: val } };
      });
      return { ...f, specs };
    });
  }

  function moveSpec(i: number, dir: -1 | 1) {
    setForm((f) => {
      const specs = [...f.specs];
      const j = i + dir;
      if (j < 0 || j >= specs.length) return f;
      [specs[i], specs[j]] = [specs[j], specs[i]];
      return { ...f, specs };
    });
  }

  async function handleSave() {
    setSaving(true);
    setFormError("");
    try {
      const variantsPayload: ApiVariantInput[] = variantItems.map((v) => ({
        colorName: v.colorName,
        colorHex: v.colorHex || null,
        image: v.image,
        stock: v.stock,
      }));
      const payload: ApiProductInput = { ...form, variants: variantsPayload };
      if (modal === "add") {
        const created = await api.products.create(payload, adminKey);
        setProducts((p) => [...p, created]);
      } else if (editing) {
        const updated = await api.products.update(editing.id, payload, adminKey);
        setProducts((p) => p.map((x) => (x.id === updated.id ? updated : x)));
      }
      closeModal();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await api.products.delete(deleteConfirm.id, adminKey);
      setProducts((p) => p.filter((x) => x.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (e: any) {
      setProductError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  async function updateStock(id: number, delta: number) {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const newStock = Math.max(0, product.stock + delta);
    try {
      const updated = await api.products.update(id, { stock: newStock }, adminKey);
      setProducts((p) => p.map((x) => (x.id === updated.id ? updated : x)));
    } catch {}
  }

  async function toggleFeatured(id: number) {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    try {
      const updated = await api.products.update(id, { featured: !product.featured }, adminKey);
      setProducts((p) => p.map((x) => (x.id === updated.id ? updated : x)));
    } catch {}
  }

  async function approveReview(id: number) {
    try {
      const updated = await api.reviews.approve(id, adminKey);
      setReviews((r) => r.map((x) => x.id === id ? updated : x));
    } catch {}
  }

  async function deleteReview(id: number) {
    try {
      await api.reviews.delete(id, adminKey);
      setReviews((r) => r.filter((x) => x.id !== id));
    } catch {}
  }

  async function markInquiryRead(id: number) {
    try {
      const updated = await api.inquiries.markRead(id, adminKey);
      setInquiries((q) => q.map((x) => x.id === id ? updated : x));
    } catch {}
  }

  async function deleteInquiry(id: number) {
    try {
      await api.inquiries.delete(id, adminKey);
      setInquiries((q) => q.filter((x) => x.id !== id));
    } catch {}
  }

  async function updateOrderStatus(id: number, status: string) {
    try {
      const updated = await api.orders.patch(id, { status }, adminKey);
      setOrders((o) => o.map((x) => (x.id === id ? updated : x)));
    } catch {}
  }

  function toggleSort(field: keyof ApiProduct) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  }

  const filtered = products
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        (filterCat === "All" || p.category === filterCat) &&
        (!q || p.name.toLowerCase().includes(q) || p.slug.includes(q))
      );
    })
    .sort((a, b) => {
      const av = a[sortField] ?? 0;
      const bv = b[sortField] ?? 0;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const pendingReviews = reviews.filter((r) => !r.approved).length;
  const unreadInquiries = inquiries.filter((q) => !q.read).length;

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-3xl font-black uppercase tracking-tighter text-foreground mb-1">
              MOBILUS<span className="text-primary">.</span>
            </div>
            <p className="text-muted-foreground text-sm">Admin Panel</p>
          </div>
          <div className="border border-border bg-card shadow-sm p-6">
            <label className="block text-sm text-muted-foreground mb-2">Admin Key</label>
            <Input
              type="password"
              placeholder="Enter admin key"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="mb-3 rounded-none"
            />
            {authError && <p className="text-red-500 text-sm mb-3">{authError}</p>}
            <Button onClick={handleLogin} className="w-full rounded-none bg-primary hover:bg-primary/90">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const SortIcon = ({ field }: { field: keyof ApiProduct }) => (
    <span className="inline-flex flex-col ml-1 opacity-50">
      <ChevronUp className={`h-2.5 w-2.5 ${sortField === field && sortDir === "asc" ? "opacity-100 text-primary" : ""}`} />
      <ChevronDown className={`h-2.5 w-2.5 ${sortField === field && sortDir === "desc" ? "opacity-100 text-primary" : ""}`} />
    </span>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-black uppercase tracking-tighter text-lg">
            MOBILUS<span className="text-primary">.</span>{" "}
            <span className="text-muted-foreground font-normal text-sm tracking-normal">Admin</span>
          </div>
          <div className="flex items-center gap-6">
            {/* Tab nav */}
            <nav className="flex items-center gap-1">
              {([
                { key: "products" as const, label: "Products", icon: ShoppingBag, badge: 0 },
                { key: "reviews" as const, label: "Reviews", icon: Star, badge: pendingReviews },
                { key: "inquiries" as const, label: "Inquiries", icon: MessageSquare, badge: unreadInquiries },
                { key: "orders" as const, label: "Orders", icon: ShoppingCart, badge: orders.filter(o => o.status === "pending").length },
                { key: "availability" as const, label: "Pieejamība", icon: MapPin, badge: 0 },
              ] as { key: AdminTab; label: string; icon: LucideIcon; badge: number }[]).map(({ key, label, icon: Icon, badge }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors rounded-none ${
                    activeTab === key ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                  {badge > 0 && (
                    <span className="bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-black">
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* ===== PRODUCTS TAB ===== */}
        {activeTab === "products" && (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter">Products</h1>
                <p className="text-muted-foreground text-sm">{products.length} total</p>
              </div>
              <Button onClick={openAdd} className="rounded-none bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name or slug..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-none" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["All", ...CATEGORIES].map((c) => (
                  <button key={c} onClick={() => setFilterCat(c)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors ${
                      filterCat === c ? "bg-primary border-primary text-white" : "border-border text-muted-foreground hover:border-foreground/40"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {productError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 mb-4 text-sm">{productError}</div>
            )}

            {loadingProducts ? (
              <div className="text-muted-foreground py-16 text-center">Loading products...</div>
            ) : (
              <div className="overflow-x-auto border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort("id")}>
                        ID <SortIcon field="id" />
                      </th>
                      <th className="text-left px-4 py-3 font-semibold">Image</th>
                      <th className="text-left px-4 py-3 font-semibold cursor-pointer select-none" onClick={() => toggleSort("name")}>
                        Name <SortIcon field="name" />
                      </th>
                      <th className="text-left px-4 py-3 font-semibold cursor-pointer select-none" onClick={() => toggleSort("category")}>
                        Category <SortIcon field="category" />
                      </th>
                      <th className="text-left px-4 py-3 font-semibold cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort("price")}>
                        Price <SortIcon field="price" />
                      </th>
                      <th className="text-left px-4 py-3 font-semibold cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort("stock")}>
                        Stock <SortIcon field="stock" />
                      </th>
                      <th className="text-left px-4 py-3 font-semibold">Featured</th>
                      <th className="text-left px-4 py-3 font-semibold">Specs</th>
                      <th className="text-left px-4 py-3 font-semibold">Manufacturer</th>
                      <th className="text-right px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr><td colSpan={10} className="text-center text-muted-foreground py-12">No products found</td></tr>
                    )}
                    {filtered.map((p) => (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{p.id}</td>
                        <td className="px-4 py-3">
                          <img src={p.image} alt={p.name} className="h-12 w-16 object-contain bg-muted/50 rounded"
                            onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
                            referrerPolicy="no-referrer"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{p.name}</div>
                          <div className="text-muted-foreground text-xs">{p.slug}</div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-semibold">€{p.price.toLocaleString()}</span>
                          {p.oldPrice && <span className="text-muted-foreground line-through ml-2 text-xs">€{p.oldPrice.toLocaleString()}</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateStock(p.id, -1)}
                              className="h-6 w-6 flex items-center justify-center border border-border hover:border-foreground/40 text-muted-foreground hover:text-foreground transition-colors">
                              <ChevronDown className="h-3 w-3" />
                            </button>
                            <span className={`w-8 text-center font-semibold ${p.stock === 0 ? "text-red-500" : p.stock <= 2 ? "text-amber-500" : "text-emerald-600"}`}>
                              {p.stock}
                            </span>
                            <button onClick={() => updateStock(p.id, 1)}
                              className="h-6 w-6 flex items-center justify-center border border-border hover:border-foreground/40 text-muted-foreground hover:text-foreground transition-colors">
                              <ChevronUp className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleFeatured(p.id)}
                            title={p.featured ? "Featured — click to unfeature" : "Not featured — click to feature"}
                            aria-label={p.featured ? `Unfeature ${p.name}` : `Feature ${p.name} on homepage`}
                            className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${p.featured ? "text-amber-400 hover:text-amber-300" : "text-muted-foreground/40 hover:text-amber-400"}`}
                          >
                            <Star className={`h-4 w-4 ${p.featured ? "fill-amber-400" : ""}`} />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {p.specs.length > 0 ? (
                            <span className="text-emerald-600">{p.specs.length} rows</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {p.manufacturerYoutubeId ? (
                            <span className="text-emerald-600">Video ✓</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(p)} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(p)} className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ===== REVIEWS TAB ===== */}
        {activeTab === "reviews" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter">Reviews</h1>
                <p className="text-muted-foreground text-sm">
                  {reviews.length} total · <span className="text-amber-400">{pendingReviews} pending approval</span>
                </p>
              </div>
              <Button variant="outline" onClick={loadReviews} className="rounded-none border-border text-muted-foreground hover:text-foreground">
                Refresh
              </Button>
            </div>

            {loadingReviews ? (
              <div className="text-muted-foreground py-16 text-center">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-20 border border-border">
                <Star className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className={`border p-5 transition-colors ${r.approved ? "border-border bg-card" : "border-amber-400/40 bg-amber-50"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="font-bold text-foreground">{r.name}</span>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "text-primary fill-primary" : "text-muted"}`} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                          <span className="text-xs text-muted-foreground">• {r.productSlug}</span>
                          {r.approved ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs rounded-none">Approved</Badge>
                          ) : (
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs rounded-none">Pending</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">{r.text}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!r.approved && (
                          <Button variant="ghost" size="sm" onClick={() => approveReview(r.id)}
                            className="h-8 px-3 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 text-xs font-bold">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => deleteReview(r.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== INQUIRIES TAB ===== */}
        {activeTab === "inquiries" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter">Inquiries</h1>
                <p className="text-muted-foreground text-sm">
                  {inquiries.length} total · <span className="text-primary">{unreadInquiries} unread</span>
                </p>
              </div>
              <Button variant="outline" onClick={loadInquiries} className="rounded-none border-border text-muted-foreground hover:text-foreground">
                Refresh
              </Button>
            </div>

            {loadingInquiries ? (
              <div className="text-muted-foreground py-16 text-center">Loading inquiries...</div>
            ) : inquiries.length === 0 ? (
              <div className="text-center py-20 border border-border">
                <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No inquiries yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map((q) => (
                  <div key={q.id} className={`border p-5 transition-colors ${q.read ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-3">
                          <span className="font-bold text-foreground">{q.name}</span>
                          {!q.read && (
                            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs rounded-none">New</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">{formatDate(q.createdAt)}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-primary" />
                            <a href={`tel:${q.phone}`} className="text-foreground hover:text-primary transition-colors">{q.phone}</a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-primary" />
                            <a href={`mailto:${q.email}`} className="text-foreground hover:text-primary transition-colors">{q.email}</a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-3.5 w-3.5 text-primary" />
                            <span className="text-muted-foreground truncate">{q.productName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!q.read && (
                          <Button variant="ghost" size="sm" onClick={() => markInquiryRead(q.id)}
                            className="h-8 px-3 text-muted-foreground hover:text-foreground text-xs font-bold">
                            <Eye className="h-3.5 w-3.5 mr-1" /> Mark read
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => deleteInquiry(q.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== ORDERS TAB ===== */}
        {activeTab === "orders" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter">Orders</h1>
                <p className="text-muted-foreground text-sm">
                  {orders.length} total · <span className="text-primary">{orders.filter(o => o.status === "pending").length} pending</span>
                </p>
              </div>
              <Button variant="outline" onClick={loadOrders} className="rounded-none border-border text-muted-foreground hover:text-foreground">
                Refresh
              </Button>
            </div>

            {loadingOrders ? (
              <div className="text-muted-foreground py-16 text-center">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 border border-border">
                <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const isExpanded = expandedOrder === order.id;
                  const addr = order.deliveryAddress as ApiDeliveryAddress & { deliveryMethod?: string };
                  const statusColors: Record<string, string> = {
                    pending: "bg-amber-100 text-amber-700 border-amber-300",
                    confirmed: "bg-blue-100 text-blue-700 border-blue-300",
                    paid: "bg-emerald-100 text-emerald-700 border-emerald-300",
                    shipped: "bg-purple-100 text-purple-700 border-purple-300",
                    completed: "bg-green-100 text-green-700 border-green-300",
                    cancelled: "bg-red-100 text-red-500 border-red-300",
                  };
                  const statusClass = statusColors[order.status] ?? "bg-muted text-foreground border-border";
                  return (
                    <div key={order.id} className={`border transition-colors ${isExpanded ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}>
                      {/* Row header */}
                      <button
                        className="w-full flex items-center justify-between p-5 text-left"
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      >
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="font-black text-foreground text-sm">#{order.id}</span>
                          <span className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</span>
                          <span className="font-bold text-foreground text-sm">{order.customerName}</span>
                          <span className="text-xs text-muted-foreground">{order.paymentMethod}</span>
                          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 border rounded-none ${statusClass}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="font-black text-primary text-base">€{order.total.toLocaleString()}</span>
                          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </button>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="border-t border-border p-5 space-y-5">
                          {/* Status changer */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Change status:</span>
                            {(["pending", "confirmed", "paid", "shipped", "completed", "cancelled"] as const).map((s) => (
                              <button
                                key={s}
                                onClick={() => updateOrderStatus(order.id, s)}
                                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 border transition-colors ${
                                  order.status === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>

                          {/* Contact + address */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Customer</p>
                              <p className="text-sm font-bold text-foreground">{order.customerName}</p>
                              <a href={`mailto:${order.customerEmail}`} className="text-sm text-primary hover:underline block">{order.customerEmail}</a>
                              {order.customerPhone && <a href={`tel:${order.customerPhone}`} className="text-sm text-muted-foreground block">{order.customerPhone}</a>}
                            </div>
                            {addr && (
                              <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Delivery</p>
                                <p className="text-sm text-foreground">{addr.address}, {addr.city} {addr.postalCode}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{addr.deliveryMethod === "riga" ? "Pickup: Rīga" : addr.deliveryMethod === "valmiera" ? "Pickup: Valmiera" : addr.deliveryMethod}</p>
                              </div>
                            )}
                          </div>

                          {/* Items */}
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Items</p>
                            <div className="space-y-2">
                              {(order.items as ApiOrderItem[]).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-sm">
                                  {item.image && <img src={item.image} alt={item.name} className="h-10 w-10 object-cover border border-border" referrerPolicy="no-referrer" />}
                                  <div className="flex-1 min-w-0">
                                    <span className="font-bold text-foreground">{item.name}</span>
                                    {item.colorName && <span className="text-xs text-muted-foreground ml-2">({item.colorName})</span>}
                                  </div>
                                  <span className="text-muted-foreground">×{item.quantity}</span>
                                  <span className="font-bold text-foreground">€{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Totals */}
                          <div className="border-t border-border pt-4 flex flex-col items-end gap-1 text-sm">
                            <div className="flex gap-8">
                              <span className="text-muted-foreground">Subtotal (excl. VAT)</span>
                              <span className="font-bold text-foreground">€{order.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex gap-8">
                              <span className="text-muted-foreground">VAT (21%)</span>
                              <span className="font-bold text-foreground">€{order.vat.toLocaleString()}</span>
                            </div>
                            <div className="flex gap-8 text-base">
                              <span className="font-black text-foreground">Total</span>
                              <span className="font-black text-primary">€{order.total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ===== AVAILABILITY TAB ===== */}
        {activeTab === "availability" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter">Pieejamība</h1>
                <p className="text-muted-foreground text-sm">{locations.length} veikali · {deliveryOptions.length} piegādes iespējas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* ---- VEIKALI ---- */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black uppercase tracking-tighter text-lg flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" /> Veikali
                  </h2>
                  <Button size="sm" className="rounded-none bg-primary hover:bg-primary/90"
                    onClick={() => {
                      setEditingLocation(null);
                      setLocationForm({ name: "", address: "", workHours: "", phone: "", email: "", leadTimeDays: 1, isActive: true });
                      setShowLocationForm(true);
                    }}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Pievienot
                  </Button>
                </div>

                {showLocationForm && (
                  <div className="border border-primary/40 bg-primary/5 p-4 mb-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
                      {editingLocation ? "Rediģēt veikalu" : "Jauns veikals"}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs text-muted-foreground mb-1">Nosaukums *</label>
                        <Input value={locationForm.name} onChange={(e) => setLocationForm(f => ({ ...f, name: e.target.value }))} className="rounded-none text-sm h-8" placeholder="Mobilus Rīga" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-muted-foreground mb-1">Adrese *</label>
                        <Input value={locationForm.address} onChange={(e) => setLocationForm(f => ({ ...f, address: e.target.value }))} className="rounded-none text-sm h-8" placeholder="Dārzciema iela 123, Rīga" />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Darba laiks</label>
                        <Input value={locationForm.workHours} onChange={(e) => setLocationForm(f => ({ ...f, workHours: e.target.value }))} className="rounded-none text-sm h-8" placeholder="P-Pk 9-18" />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Lead time (dienas)</label>
                        <Input type="number" min={0} value={locationForm.leadTimeDays} onChange={(e) => setLocationForm(f => ({ ...f, leadTimeDays: Number(e.target.value) }))} className="rounded-none text-sm h-8" />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Tālrunis</label>
                        <Input value={locationForm.phone} onChange={(e) => setLocationForm(f => ({ ...f, phone: e.target.value }))} className="rounded-none text-sm h-8" placeholder="+371 20 000 000" />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">E-pasts</label>
                        <Input value={locationForm.email} onChange={(e) => setLocationForm(f => ({ ...f, email: e.target.value }))} className="rounded-none text-sm h-8" placeholder="info@mobilus.lv" />
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <input type="checkbox" id="loc-active" checked={locationForm.isActive} onChange={(e) => setLocationForm(f => ({ ...f, isActive: e.target.checked }))} className="h-4 w-4 accent-primary" />
                        <label htmlFor="loc-active" className="text-sm text-foreground cursor-pointer">Aktīvs</label>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="rounded-none bg-primary hover:bg-primary/90"
                        disabled={savingLocation}
                        onClick={async () => {
                          if (!locationForm.name || !locationForm.address) return;
                          setSavingLocation(true);
                          try {
                            const data = { name: locationForm.name, address: locationForm.address, workHours: locationForm.workHours, contacts: { phone: locationForm.phone, email: locationForm.email }, leadTimeDays: locationForm.leadTimeDays, isActive: locationForm.isActive };
                            if (editingLocation) {
                              const updated = await api.locations.update(editingLocation.id, data, adminKey);
                              setLocations(ls => ls.map(l => l.id === updated.id ? updated : l));
                            } else {
                              const created = await api.locations.create(data, adminKey);
                              setLocations(ls => [...ls, created]);
                            }
                            setShowLocationForm(false);
                            setEditingLocation(null);
                          } catch {}
                          setSavingLocation(false);
                        }}>
                        <Save className="h-3.5 w-3.5 mr-1" /> {savingLocation ? "..." : "Saglabāt"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setShowLocationForm(false); setEditingLocation(null); }}>Atcelt</Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {locations.length === 0 && <p className="text-muted-foreground text-sm py-4">Nav veikalu.</p>}
                  {locations.map((loc) => (
                    <div key={loc.id} className={`border p-4 ${loc.isActive ? "border-border bg-card" : "border-border/50 bg-muted/20 opacity-60"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-foreground">{loc.name}</span>
                            {!loc.isActive && <Badge className="text-xs rounded-none border-border text-muted-foreground">Neaktīvs</Badge>}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span>{loc.address}</span>
                          </div>
                          {loc.workHours && <p className="text-xs text-muted-foreground mt-0.5">{loc.workHours}</p>}
                          {(loc.contacts.phone || loc.contacts.email) && (
                            <p className="text-xs text-muted-foreground mt-0.5">{loc.contacts.phone}{loc.contacts.phone && loc.contacts.email ? " · " : ""}{loc.contacts.email}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5">Lead time: {loc.leadTimeDays} d.</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setEditingLocation(loc);
                              setLocationForm({ name: loc.name, address: loc.address, workHours: loc.workHours, phone: loc.contacts.phone ?? "", email: loc.contacts.email ?? "", leadTimeDays: loc.leadTimeDays, isActive: loc.isActive });
                              setShowLocationForm(true);
                            }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                            onClick={async () => {
                              if (!confirm(`Dzēst "${loc.name}"?`)) return;
                              try { await api.locations.delete(loc.id, adminKey); setLocations(ls => ls.filter(l => l.id !== loc.id)); } catch {}
                            }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ---- PIEGĀDES IESPĒJAS ---- */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black uppercase tracking-tighter text-lg flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" /> Piegādes iespējas
                  </h2>
                  <Button size="sm" className="rounded-none bg-primary hover:bg-primary/90"
                    onClick={() => {
                      setEditingDelivery(null);
                      setDeliveryForm({ name: "", priceMin: 0, priceMax: 0, leadTimeDays: 3, isActive: true });
                      setShowDeliveryForm(true);
                    }}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Pievienot
                  </Button>
                </div>

                {showDeliveryForm && (
                  <div className="border border-primary/40 bg-primary/5 p-4 mb-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
                      {editingDelivery ? "Rediģēt piegādi" : "Jauna piegāde"}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs text-muted-foreground mb-1">Nosaukums *</label>
                        <Input value={deliveryForm.name} onChange={(e) => setDeliveryForm(f => ({ ...f, name: e.target.value }))} className="rounded-none text-sm h-8" placeholder="Piegāde uz adresi" />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Cena no (€)</label>
                        <Input type="number" min={0} value={deliveryForm.priceMin} onChange={(e) => setDeliveryForm(f => ({ ...f, priceMin: Number(e.target.value) }))} className="rounded-none text-sm h-8" />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Cena līdz (€)</label>
                        <Input type="number" min={0} value={deliveryForm.priceMax} onChange={(e) => setDeliveryForm(f => ({ ...f, priceMax: Number(e.target.value) }))} className="rounded-none text-sm h-8" />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Lead time (dienas)</label>
                        <Input type="number" min={0} value={deliveryForm.leadTimeDays} onChange={(e) => setDeliveryForm(f => ({ ...f, leadTimeDays: Number(e.target.value) }))} className="rounded-none text-sm h-8" />
                      </div>
                      <div className="flex items-center gap-2 self-end pb-1">
                        <input type="checkbox" id="del-active" checked={deliveryForm.isActive} onChange={(e) => setDeliveryForm(f => ({ ...f, isActive: e.target.checked }))} className="h-4 w-4 accent-primary" />
                        <label htmlFor="del-active" className="text-sm text-foreground cursor-pointer">Aktīvs</label>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="rounded-none bg-primary hover:bg-primary/90"
                        disabled={savingDelivery}
                        onClick={async () => {
                          if (!deliveryForm.name) return;
                          setSavingDelivery(true);
                          try {
                            const data = { name: deliveryForm.name, priceMin: deliveryForm.priceMin, priceMax: deliveryForm.priceMax, leadTimeDays: deliveryForm.leadTimeDays, isActive: deliveryForm.isActive };
                            if (editingDelivery) {
                              const updated = await api.deliveryOptions.update(editingDelivery.id, data, adminKey);
                              setDeliveryOptions(ds => ds.map(d => d.id === updated.id ? updated : d));
                            } else {
                              const created = await api.deliveryOptions.create(data, adminKey);
                              setDeliveryOptions(ds => [...ds, created]);
                            }
                            setShowDeliveryForm(false);
                            setEditingDelivery(null);
                          } catch {}
                          setSavingDelivery(false);
                        }}>
                        <Save className="h-3.5 w-3.5 mr-1" /> {savingDelivery ? "..." : "Saglabāt"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setShowDeliveryForm(false); setEditingDelivery(null); }}>Atcelt</Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {deliveryOptions.length === 0 && <p className="text-muted-foreground text-sm py-4">Nav piegādes iespēju.</p>}
                  {deliveryOptions.map((d) => (
                    <div key={d.id} className={`border p-4 ${d.isActive ? "border-border bg-card" : "border-border/50 bg-muted/20 opacity-60"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-foreground">{d.name}</span>
                            {!d.isActive && <Badge className="text-xs rounded-none border-border text-muted-foreground">Neaktīvs</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            €{d.priceMin}–€{d.priceMax} · {d.leadTimeDays} d.
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setEditingDelivery(d);
                              setDeliveryForm({ name: d.name, priceMin: d.priceMin, priceMax: d.priceMax, leadTimeDays: d.leadTimeDays, isActive: d.isActive });
                              setShowDeliveryForm(true);
                            }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                            onClick={async () => {
                              if (!confirm(`Dzēst "${d.name}"?`)) return;
                              try { await api.deliveryOptions.delete(d.id, adminKey); setDeliveryOptions(ds => ds.filter(x => x.id !== d.id)); } catch {}
                            }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ===== PRODUCT EDIT/ADD MODAL ===== */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-8 px-4">
          <div className="w-full max-w-3xl bg-white border border-border shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-black uppercase tracking-tighter text-lg">
                {modal === "add" ? "Add Product" : `Edit: ${editing?.name}`}
              </h2>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form tabs */}
            <div className="flex border-b border-border overflow-x-auto">
              {([
                { key: "basic" as const, label: "Basic Info" },
                { key: "desc" as const, label: "Descriptions" },
                { key: "specs" as const, label: `Specs (${form.specs.length})` },
                { key: "variants" as const, label: `Colors (${variantItems.length})` },
                { key: "manufacturer" as const, label: "Manufacturer" },
                ...(modal === "edit" ? [{ key: "availability" as const, label: `Stock (${productStockEntries.length})` }] : []),
              ]).map(({ key, label }) => (
                <button key={key} onClick={() => setActiveFormTab(key)}
                  className={`flex-shrink-0 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                    activeFormTab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">

              {/* Basic Info */}
              {activeFormTab === "basic" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs text-muted-foreground mb-1">Name</label>
                    <Input value={form.name} onChange={(e) => setField("name", e.target.value)} className="rounded-none" placeholder="Product name" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Slug</label>
                    <Input value={form.slug} onChange={(e) => setField("slug", e.target.value)} className="rounded-none font-mono text-sm" placeholder="product-slug" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Category</label>
                    <select value={form.category} onChange={(e) => setField("category", e.target.value)}
                      className="w-full bg-background border border-input px-3 py-2 text-sm rounded-none text-foreground">
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Price (€)</label>
                    <Input type="number" value={form.price} onChange={(e) => setField("price", Number(e.target.value))} className="rounded-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Old Price (€, optional)</label>
                    <Input type="number" value={form.oldPrice ?? ""} onChange={(e) => setField("oldPrice", e.target.value ? Number(e.target.value) : null)} className="rounded-none" placeholder="Leave empty if none" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Engine / Type</label>
                    <Input value={form.engine} onChange={(e) => setField("engine", e.target.value)} className="rounded-none" placeholder="49cc / Electric / 125cc" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Stock</label>
                    <Input type="number" min={0} value={form.stock} onChange={(e) => setField("stock", Number(e.target.value))} className="rounded-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Badge (optional)</label>
                    <Input value={form.badge ?? ""} onChange={(e) => setField("badge", e.target.value || null)} className="rounded-none" placeholder="e.g. POPULĀRS / -10%" />
                  </div>
                  <div className="col-span-2 flex items-center gap-3 py-1">
                    <input
                      type="checkbox"
                      id="featured-checkbox"
                      checked={form.featured ?? false}
                      onChange={(e) => setField("featured", e.target.checked)}
                      className="h-4 w-4 accent-primary cursor-pointer"
                    />
                    <label htmlFor="featured-checkbox" className="text-sm text-foreground cursor-pointer select-none">
                      Feature on homepage
                      <span className="ml-2 text-xs text-muted-foreground font-normal">(shows this product in the spotlight section)</span>
                    </label>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-muted-foreground mb-1">
                      Image URL
                      {variantItems.length > 0 && (
                        <span className="ml-2 text-amber-400/80 normal-case font-normal">
                          — auto-synced from first color variant
                        </span>
                      )}
                    </label>
                    {variantItems.length > 0 ? (
                      <div className="border border-border bg-muted/30 px-3 py-2 rounded-none">
                        <div className="flex items-center gap-3">
                          {variantItems[0].image ? (
                            <img
                              src={variantItems[0].image}
                              alt="first variant preview"
                              className="h-14 w-20 object-contain bg-muted/50 flex-shrink-0"
                              onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="h-14 w-20 bg-muted/50 flex-shrink-0 flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No image</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground font-mono truncate">
                              {variantItems[0].image || "—"}
                            </p>
                            <p className="text-xs text-amber-400/70 mt-1">
                              Set this in the Colors tab on the first variant.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Input value={form.image} onChange={(e) => setField("image", e.target.value)} className="rounded-none font-mono text-sm" placeholder="https://..." />
                        {form.image && (
                          <img src={form.image} alt="preview" className="mt-2 h-20 object-contain bg-muted/50 rounded"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Descriptions */}
              {activeFormTab === "desc" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Description (Latvian)</label>
                    <textarea value={form.descriptionLv} onChange={(e) => setField("descriptionLv", e.target.value)} rows={4}
                      className="w-full bg-background border border-input px-3 py-2 text-sm rounded-none text-foreground resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Description (English)</label>
                    <textarea value={form.descriptionEn} onChange={(e) => setField("descriptionEn", e.target.value)} rows={4}
                      className="w-full bg-background border border-input px-3 py-2 text-sm rounded-none text-foreground resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Description (Russian)</label>
                    <textarea value={form.descriptionRu} onChange={(e) => setField("descriptionRu", e.target.value)} rows={4}
                      className="w-full bg-background border border-input px-3 py-2 text-sm rounded-none text-foreground resize-none" />
                  </div>
                </div>
              )}

              {/* Specs Editor */}
              {activeFormTab === "specs" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-muted-foreground">
                      Specs appear as callout boxes on the product page. First 3 specs are shown as highlighted cards.
                    </p>
                    <Button onClick={addSpec} size="sm" className="rounded-none bg-primary hover:bg-primary/90 flex-shrink-0 ml-4">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Spec
                    </Button>
                  </div>

                  {form.specs.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-border">
                      <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">No specs yet. Click "Add Spec" to start.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {form.specs.map((spec, i) => (
                        <div key={i} className="border border-border p-4 bg-muted/20">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Spec #{i + 1}</span>
                            <div className="flex items-center gap-1">
                              <button onClick={() => moveSpec(i, -1)} disabled={i === 0} className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30">
                                <ChevronUp className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => moveSpec(i, 1)} disabled={i === form.specs.length - 1} className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30">
                                <ChevronDown className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => removeSpec(i)} className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-red-400">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Label (LV)</label>
                              <Input value={spec.label.lv} onChange={(e) => updateSpec(i, "lv", e.target.value)} className="rounded-none text-sm h-8" placeholder="Jauda" />
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Label (EN)</label>
                              <Input value={spec.label.en} onChange={(e) => updateSpec(i, "en", e.target.value)} className="rounded-none text-sm h-8" placeholder="Power" />
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Label (RU)</label>
                              <Input value={spec.label.ru} onChange={(e) => updateSpec(i, "ru", e.target.value)} className="rounded-none text-sm h-8" placeholder="Мощность" />
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Value</label>
                              <Input value={spec.value} onChange={(e) => updateSpec(i, "value", e.target.value)} className="rounded-none text-sm h-8 font-mono" placeholder="41 kW" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Color Variants */}
              {activeFormTab === "variants" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Add color variants with individual images and stock counts. Leave empty for single-color products.
                      </p>
                    </div>
                    <Button onClick={addVariant} size="sm" className="rounded-none bg-primary hover:bg-primary/90 flex-shrink-0 ml-4">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Color
                    </Button>
                  </div>

                  {variantItems.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-border">
                      <Palette className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">No color variants. Click "Add Color" to start.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {variantItems.map((v, i) => (
                        <div key={i} className="border border-border p-4 bg-muted/20">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {v.colorHex && (
                                <span
                                  className="h-4 w-4 rounded-full border border-border flex-shrink-0"
                                  style={{ backgroundColor: v.colorHex }}
                                />
                              )}
                              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                                Color #{i + 1} {v.colorName && `— ${v.colorName}`}
                              </span>
                            </div>
                            <button onClick={() => removeVariant(i)} className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-red-400">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Color Name *</label>
                              <Input
                                value={v.colorName}
                                onChange={(e) => updateVariant(i, "colorName", e.target.value)}
                                className="rounded-none text-sm h-8"
                                placeholder="Black/Blue"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Color Hex (optional)</label>
                              <div className="flex gap-2">
                                <Input
                                  value={v.colorHex}
                                  onChange={(e) => updateVariant(i, "colorHex", e.target.value)}
                                  className="rounded-none text-sm h-8 font-mono flex-1"
                                  placeholder="#1a3a5c"
                                />
                                {v.colorHex && (
                                  <span
                                    className="h-8 w-8 rounded-none border border-border flex-shrink-0"
                                    style={{ backgroundColor: v.colorHex }}
                                  />
                                )}
                              </div>
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs text-muted-foreground mb-1">Image URL *</label>
                              <div className="flex gap-2 items-start">
                                <Input
                                  value={v.image}
                                  onChange={(e) => updateVariant(i, "image", e.target.value)}
                                  className="rounded-none text-sm h-8 font-mono flex-1"
                                  placeholder="https://..."
                                />
                                {v.image && (
                                  <img
                                    src={v.image}
                                    alt="preview"
                                    className="h-8 w-12 object-contain bg-muted/50 flex-shrink-0"
                                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
                                    referrerPolicy="no-referrer"
                                  />
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Stock</label>
                              <Input
                                type="number"
                                min={0}
                                value={v.stock}
                                onChange={(e) => updateVariant(i, "stock", Number(e.target.value))}
                                className="rounded-none text-sm h-8"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Availability / Stock entries (edit mode only) */}
              {activeFormTab === "availability" && modal === "edit" && editing && (
                <div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Pievienojiet noliktavas ierakstus šim produktam. Katra rinda norāda daudzumu konkrētā veikalā vai piegādes iespējā.
                  </p>

                  {/* Existing entries */}
                  {loadingAvailability ? (
                    <p className="text-muted-foreground text-sm py-4">Ielādē...</p>
                  ) : productStockEntries.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-border mb-4">
                      <Package className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">Nav noliktavas ierakstu.</p>
                    </div>
                  ) : (
                    <div className="border border-border mb-4 overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/50 border-b border-border">
                          <tr>
                            <th className="text-left px-3 py-2 font-bold">Veikals / Piegāde</th>
                            <th className="text-left px-3 py-2 font-bold">Krāsa</th>
                            <th className="text-left px-3 py-2 font-bold">Daudzums</th>
                            <th className="text-left px-3 py-2 font-bold">Sērijas nr.</th>
                            <th className="text-right px-3 py-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {productStockEntries.map((e) => (
                            <tr key={e.id} className="border-b border-border/50">
                              <td className="px-3 py-2 text-foreground">
                                {e.locationName ? (
                                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary flex-shrink-0" />{e.locationName}</span>
                                ) : e.deliveryName ? (
                                  <span className="flex items-center gap-1"><Truck className="h-3 w-3 text-primary flex-shrink-0" />{e.deliveryName}</span>
                                ) : "—"}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">{e.variantColorName ?? "Base"}</td>
                              <td className="px-3 py-2 font-bold text-foreground">{e.quantity}</td>
                              <td className="px-3 py-2 text-muted-foreground font-mono">{e.serialNumber ?? "—"}</td>
                              <td className="px-3 py-2 text-right">
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-red-400"
                                  onClick={async () => {
                                    try {
                                      await api.availability.delete(e.id, adminKey);
                                      setProductStockEntries(entries => entries.filter(x => x.id !== e.id));
                                    } catch {}
                                  }}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Add entry form */}
                  <div className="border border-primary/30 bg-primary/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Pievienot ierakstu</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Veikals</label>
                        <select value={stockEntryForm.locationId} onChange={(e) => setStockEntryForm(f => ({ ...f, locationId: e.target.value, deliveryOptionId: "" }))}
                          className="w-full bg-background border border-input px-2 py-1 text-xs rounded-none text-foreground h-8">
                          <option value="">— izvēlēties —</option>
                          {locations.filter(l => l.isActive).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Piegāde</label>
                        <select value={stockEntryForm.deliveryOptionId} onChange={(e) => setStockEntryForm(f => ({ ...f, deliveryOptionId: e.target.value, locationId: "" }))}
                          className="w-full bg-background border border-input px-2 py-1 text-xs rounded-none text-foreground h-8">
                          <option value="">— izvēlēties —</option>
                          {deliveryOptions.filter(d => d.isActive).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Krāsas variants</label>
                        <select value={stockEntryForm.variantId} onChange={(e) => setStockEntryForm(f => ({ ...f, variantId: e.target.value }))}
                          className="w-full bg-background border border-input px-2 py-1 text-xs rounded-none text-foreground h-8">
                          <option value="">Base (bez variantu)</option>
                          {variantItems.filter(v => v.id).map(v => <option key={v.id} value={v.id}>{v.colorName}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Daudzums *</label>
                        <Input type="number" min={0} value={stockEntryForm.quantity} onChange={(e) => setStockEntryForm(f => ({ ...f, quantity: Number(e.target.value) }))} className="rounded-none text-xs h-8" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-muted-foreground mb-1">Sērijas numurs (neobligāts)</label>
                        <Input value={stockEntryForm.serialNumber} onChange={(e) => setStockEntryForm(f => ({ ...f, serialNumber: e.target.value }))} className="rounded-none text-xs h-8 font-mono" placeholder="SN12345" />
                      </div>
                    </div>
                    <Button size="sm" className="rounded-none bg-primary hover:bg-primary/90 mt-3"
                      disabled={savingStockEntry || (!stockEntryForm.locationId && !stockEntryForm.deliveryOptionId)}
                      onClick={async () => {
                        setSavingStockEntry(true);
                        try {
                          const created = await api.availability.create(editing.id, {
                            locationId: stockEntryForm.locationId ? Number(stockEntryForm.locationId) : null,
                            deliveryOptionId: stockEntryForm.deliveryOptionId ? Number(stockEntryForm.deliveryOptionId) : null,
                            variantId: stockEntryForm.variantId ? Number(stockEntryForm.variantId) : null,
                            quantity: stockEntryForm.quantity,
                            serialNumber: stockEntryForm.serialNumber || null,
                          }, adminKey);
                          const loc = locations.find(l => l.id === Number(stockEntryForm.locationId));
                          const del = deliveryOptions.find(d => d.id === Number(stockEntryForm.deliveryOptionId));
                          const variant = variantItems.find(v => v.id === Number(stockEntryForm.variantId));
                          const enriched: ApiAvailabilityEntry = {
                            ...created,
                            locationName: loc?.name ?? null,
                            locationAddress: loc?.address ?? null,
                            locationLeadTimeDays: loc?.leadTimeDays ?? null,
                            locationIsActive: loc?.isActive ?? null,
                            deliveryName: del?.name ?? null,
                            deliveryPriceMin: del?.priceMin ?? null,
                            deliveryPriceMax: del?.priceMax ?? null,
                            deliveryLeadTimeDays: del?.leadTimeDays ?? null,
                            deliveryIsActive: del?.isActive ?? null,
                            variantColorName: variant?.colorName ?? null,
                          };
                          setProductStockEntries(entries => [...entries, enriched]);
                          setStockEntryForm({ locationId: "", deliveryOptionId: "", variantId: "", quantity: 1, serialNumber: "" });
                        } catch {}
                        setSavingStockEntry(false);
                      }}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> {savingStockEntry ? "..." : "Pievienot"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Manufacturer */}
              {activeFormTab === "manufacturer" && (
                <div className="space-y-4">
                  <div className="bg-muted/30 border border-border p-4 text-xs text-muted-foreground mb-4">
                    These fields appear in the "Ražotājs" (Manufacturer) tab on the product page. Leave blank to use the default brand info based on the product name.
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Manufacturer Logo URL (optional)</label>
                    <Input value={form.manufacturerLogoUrl ?? ""} onChange={(e) => setField("manufacturerLogoUrl", e.target.value || null)}
                      className="rounded-none font-mono text-sm" placeholder="https://brand.com/logo.png" />
                    {form.manufacturerLogoUrl && (
                      <div className="mt-2 bg-white p-3 inline-block">
                        <img src={form.manufacturerLogoUrl} alt="logo" className="h-8 object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">YouTube Video ID (optional)</label>
                    <Input value={form.manufacturerYoutubeId ?? ""} onChange={(e) => setField("manufacturerYoutubeId", e.target.value || null)}
                      className="rounded-none font-mono text-sm" placeholder="g4bYdBGppyI" />
                    <p className="text-xs text-muted-foreground mt-1">Just the video ID from the YouTube URL (e.g. youtube.com/watch?v=<strong>g4bYdBGppyI</strong>)</p>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Manufacturer Description (Latvian)</label>
                    <textarea value={form.manufacturerDescLv ?? ""} onChange={(e) => setField("manufacturerDescLv", e.target.value || null)} rows={3}
                      className="w-full bg-background border border-input px-3 py-2 text-sm rounded-none text-foreground resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Manufacturer Description (English)</label>
                    <textarea value={form.manufacturerDescEn ?? ""} onChange={(e) => setField("manufacturerDescEn", e.target.value || null)} rows={3}
                      className="w-full bg-background border border-input px-3 py-2 text-sm rounded-none text-foreground resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Manufacturer Description (Russian)</label>
                    <textarea value={form.manufacturerDescRu ?? ""} onChange={(e) => setField("manufacturerDescRu", e.target.value || null)} rows={3}
                      className="w-full bg-background border border-input px-3 py-2 text-sm rounded-none text-foreground resize-none" />
                  </div>
                </div>
              )}
            </div>

            {formError && (
              <div className="mx-6 bg-red-50 border border-red-200 text-red-600 px-4 py-2 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" /> {formError}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {form.specs.length} spec{form.specs.length !== 1 ? "s" : ""} · {variantItems.length} color{variantItems.length !== 1 ? "s" : ""} · {form.image ? "Image set" : "No image"}
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={closeModal} disabled={saving}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving} className="rounded-none bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Product"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm bg-white border border-border p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-6 w-6 text-red-500" />
              <h3 className="font-bold text-lg">Delete Product</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Are you sure you want to delete <span className="text-foreground font-semibold">{deleteConfirm.name}</span>? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setDeleteConfirm(null)} disabled={deleting}>Cancel</Button>
              <Button onClick={handleDelete} disabled={deleting} className="rounded-none bg-red-600 hover:bg-red-700">
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
