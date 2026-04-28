import { useState, useEffect, useCallback } from "react";
import { api, type ApiProduct, type ApiProductInput, type ApiVariantInput, type ApiReview, type ApiInquiry } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Pencil, Trash2, LogOut, Save, X, Package,
  ChevronUp, ChevronDown, Search, Star, MessageSquare,
  CheckCircle2, Eye, Mail, Phone, ShoppingBag, AlertCircle, Palette
} from "lucide-react";

const STORAGE_KEY = "mobilus_admin_key";
const CATEGORIES = ["Skūteri", "Elektro", "Motocikli", "ATV", "Velo", "Skrituļslidas", "Slēpes", "Snoubords"];

type FormState = Omit<ApiProductInput, "variants">;
type AdminTab = "products" | "reviews" | "inquiries";

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
  const [activeFormTab, setActiveFormTab] = useState<"basic" | "desc" | "specs" | "manufacturer" | "variants">("basic");

  const [deleteConfirm, setDeleteConfirm] = useState<ApiProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Inquiries state
  const [inquiries, setInquiries] = useState<ApiInquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

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

  useEffect(() => {
    if (authed) {
      loadProducts();
      loadReviews();
      loadInquiries();
    }
  }, [authed, loadProducts, loadReviews, loadInquiries]);

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
    setModal("edit");
  }

  function closeModal() { setModal(null); setEditing(null); setFormError(""); setVariantItems([]); }

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
              ] as const).map(({ key, label, icon: Icon, badge }) => (
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
                      <th className="text-left px-4 py-3 font-semibold">Specs</th>
                      <th className="text-left px-4 py-3 font-semibold">Manufacturer</th>
                      <th className="text-right px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr><td colSpan={9} className="text-center text-muted-foreground py-12">No products found</td></tr>
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
