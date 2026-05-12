import { useState, useEffect, useRef, useCallback } from "react";
import {
  GripVertical, Eye, EyeOff, Lock, CheckCircle,
  Pencil, Palette, LayoutDashboard, Package, Type, FileText,
  Plus, Trash2, Save, X, ChevronUp, ChevronDown, ExternalLink,
} from "lucide-react";
import {
  useGetEditorConfig, useSaveEditorConfig, getGetEditorConfigQueryKey,
  useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct,
  useListCategories, getListProductsQueryKey,
} from "@workspace/api-client-react";
import type { Product, ProductInput } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";

/* ─────────────────────────────────────────
   Auth
───────────────────────────────────────── */
const ADMIN_PW = "evron2026";

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PW) { sessionStorage.setItem("evron-auth", "1"); onUnlock(); }
    else { setErr(true); setPw(""); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-black">EV<span className="text-amber-500">R</span>ON Builder</h1>
          <p className="text-slate-500 text-sm mt-1">Admin access only</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="password" value={pw} autoFocus
            onChange={e => { setPw(e.target.value); setErr(false); }}
            placeholder="Enter admin password"
            className={`w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none ${err ? "border-red-400 bg-red-50" : "border-slate-200 focus:border-amber-400"}`}
          />
          {err && <p className="text-red-500 text-xs">Incorrect password.</p>}
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">
            Unlock Builder
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface Section { id: string; type: string; order: number; visible: boolean; data: Record<string, unknown> }
type Tab = "layout" | "colors" | "products" | "content" | "pages";

const SECTION_META: Record<string, { label: string; icon: string; color: string }> = {
  hero:          { label: "Hero Banner",        icon: "🖼️", color: "border-indigo-200 bg-indigo-50" },
  categories:    { label: "Categories Grid",    icon: "☰",  color: "border-green-200 bg-green-50" },
  featured:      { label: "Featured Products",  icon: "⭐", color: "border-amber-200 bg-amber-50" },
  "new-arrivals":{ label: "New Arrivals",       icon: "✨", color: "border-sky-200 bg-sky-50" },
  promo:         { label: "Promo Banner",       icon: "🏷️", color: "border-rose-200 bg-rose-50" },
};

/* ─────────────────────────────────────────
   Save status badge
───────────────────────────────────────── */
function SaveBadge({ state }: { state: "idle" | "saving" | "saved" }) {
  if (state === "idle") return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      {state === "saving" && <><div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /><span className="text-slate-400">Saving…</span></>}
      {state === "saved"  && <><CheckCircle className="w-4 h-4 text-green-400" /><span className="text-green-400 font-medium">Saved!</span></>}
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 1: Layout
───────────────────────────────────────── */
function LayoutTab({ sections, setSectionsAndSave }: {
  sections: Section[];
  setSectionsAndSave: (s: Section[]) => void;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx]  = useState<number | null>(null);

  const displaySections = sections.filter(s => s.type !== "theme");

  function move(from: number, to: number) {
    const all = sections.filter(s => s.type !== "theme");
    const theme = sections.filter(s => s.type === "theme");
    const next = [...all];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    setSectionsAndSave([...next.map((s, i) => ({ ...s, order: i })), ...theme]);
  }

  function toggleVisible(id: string) {
    setSectionsAndSave(sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500 mb-3">Drag rows to reorder • Toggle switch to show/hide a section</p>
      {displaySections.map((section, idx) => {
        const meta = SECTION_META[section.type] ?? { label: section.type, icon: "□", color: "border-slate-200 bg-white" };
        return (
          <div
            key={section.id}
            onDragOver={e => { e.preventDefault(); setOverIdx(idx); }}
            onDrop={e => { e.preventDefault(); if (dragIdx !== null && dragIdx !== idx) move(dragIdx, idx); setDragIdx(null); setOverIdx(null); }}
            onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
            className={`rounded-xl border-2 ${meta.color} transition-all ${overIdx === idx ? "ring-2 ring-amber-400 ring-offset-1" : ""} ${!section.visible ? "opacity-50" : ""}`}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <div
                draggable
                onDragStart={() => setDragIdx(idx)}
                className="cursor-grab active:cursor-grabbing p-1 rounded-lg hover:bg-black/10 transition-colors"
              >
                <GripVertical className="w-5 h-5 text-slate-400" />
              </div>
              <span className="text-xl">{meta.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm text-slate-800">{meta.label}</p>
                <p className="text-xs text-slate-400">Position {idx + 1}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => idx > 0 && move(idx, idx - 1)} disabled={idx === 0} className="p-1 rounded hover:bg-black/10 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                <button onClick={() => idx < displaySections.length - 1 && move(idx, idx + 1)} disabled={idx === displaySections.length - 1} className="p-1 rounded hover:bg-black/10 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                <div className="w-px h-6 bg-slate-200 mx-1" />
                {section.visible ? <Eye className="w-3.5 h-3.5 text-slate-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                <Switch checked={section.visible} onCheckedChange={() => toggleVisible(section.id)} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 2: Colors
───────────────────────────────────────── */
function ColorsTab({ sections, setSectionsAndSave }: {
  sections: Section[];
  setSectionsAndSave: (s: Section[]) => void;
}) {
  const theme = sections.find(s => s.type === "theme");
  const colors = (theme?.data ?? {}) as { primary?: string; secondary?: string; background?: string };

  function setColor(key: string, value: string) {
    const next = sections.map(s =>
      s.type === "theme" ? { ...s, data: { ...s.data, [key]: value } } : s
    );
    if (!sections.find(s => s.type === "theme")) {
      next.push({ id: "theme", type: "theme", order: 99, visible: false, data: { primary: "#f59e0b", secondary: "#1e2d4f", background: "#f7f8fa", [key]: value } });
    }
    setSectionsAndSave(next);
    document.documentElement.style.setProperty(`--color-${key}`, value);
  }

  const swatches = {
    primary: [
      { label: "Amber (Default)", value: "#f59e0b" },
      { label: "Orange",          value: "#f97316" },
      { label: "Red",             value: "#ef4444" },
      { label: "Pink",            value: "#ec4899" },
      { label: "Purple",          value: "#a855f7" },
      { label: "Blue",            value: "#3b82f6" },
      { label: "Teal",            value: "#14b8a6" },
      { label: "Green",           value: "#22c55e" },
    ],
    secondary: [
      { label: "Navy (Default)",  value: "#1e2d4f" },
      { label: "Dark Slate",      value: "#1e293b" },
      { label: "Dark Purple",     value: "#2d1b69" },
      { label: "Dark Green",      value: "#14532d" },
      { label: "Charcoal",        value: "#374151" },
      { label: "Black",           value: "#0f0f0f" },
      { label: "Dark Teal",       value: "#134e4a" },
      { label: "Dark Red",        value: "#7f1d1d" },
    ],
    background: [
      { label: "Off-white (Default)", value: "#f7f8fa" },
      { label: "Pure White",          value: "#ffffff" },
      { label: "Light Gray",          value: "#f1f5f9" },
      { label: "Warm Beige",          value: "#fdf8f0" },
      { label: "Cool Gray",           value: "#e2e8f0" },
    ],
  };

  return (
    <div className="space-y-8">
      {(["primary", "secondary", "background"] as const).map(key => (
        <div key={key}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-sm text-slate-800 capitalize">{key === "primary" ? "Accent / Button Color" : key === "secondary" ? "Header / Footer Color" : "Page Background"}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {key === "primary" ? "Used for buttons, highlights and links" : key === "secondary" ? "Used for the top bar and footer" : "The main background of all pages"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg border-2 border-white shadow-md" style={{ backgroundColor: colors[key] ?? (key === "primary" ? "#f59e0b" : key === "secondary" ? "#1e2d4f" : "#f7f8fa") }} />
              <input
                type="color"
                value={colors[key] ?? (key === "primary" ? "#f59e0b" : key === "secondary" ? "#1e2d4f" : "#f7f8fa")}
                onChange={e => setColor(key, e.target.value)}
                className="w-10 h-8 rounded cursor-pointer border border-slate-200"
                title="Pick any color"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {swatches[key].map(sw => (
              <button
                key={sw.value}
                onClick={() => setColor(key, sw.value)}
                title={sw.label}
                className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${colors[key] === sw.value ? "border-slate-800 ring-2 ring-slate-400 ring-offset-1" : "border-white shadow-sm"}`}
                style={{ backgroundColor: sw.value }}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <p className="text-xs text-slate-500 font-medium mb-2">Live Preview</p>
        <div className="rounded-lg overflow-hidden border border-slate-200">
          <div className="px-4 py-2.5 flex items-center gap-3" style={{ backgroundColor: colors.secondary ?? "#1e2d4f" }}>
            <span className="font-black text-sm" style={{ color: "#fff" }}>EV<span style={{ color: colors.primary ?? "#f59e0b" }}>R</span>ON</span>
            <div className="flex-1 h-4 rounded-full mx-4 opacity-20 bg-white" />
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: colors.primary ?? "#f59e0b" }} />
          </div>
          <div className="p-4 flex gap-3" style={{ backgroundColor: colors.background ?? "#f7f8fa" }}>
            <button className="px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: colors.primary ?? "#f59e0b", color: colors.secondary ?? "#1e2d4f" }}>
              Shop Now →
            </button>
            <button className="px-4 py-2 rounded-lg text-xs font-semibold border" style={{ borderColor: colors.primary ?? "#f59e0b", color: colors.secondary ?? "#1e2d4f" }}>
              Featured
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 3: Products
───────────────────────────────────────── */
const BLANK_PRODUCT: ProductInput = {
  name: "", description: "", price: 0, originalPrice: null,
  categoryId: 1, colors: [], images: [], stock: 10,
  isFeatured: false, isNewArrival: true,
};

function ProductsTab() {
  const { data: products, isLoading } = useListProducts({ limit: 100 });
  const { data: categories } = useListCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();

  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<ProductInput>(BLANK_PRODUCT);
  const [colorInput, setColorInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [search, setSearch] = useState("");

  function openNew() { setForm(BLANK_PRODUCT); setColorInput(""); setImageInput(""); setEditingId("new"); }
  function openEdit(p: Product) {
    setForm({ name: p.name, description: p.description, price: p.price, originalPrice: p.originalPrice ?? null, categoryId: p.categoryId, colors: [...p.colors], images: [...p.images], stock: p.stock, isFeatured: p.isFeatured, isNewArrival: p.isNewArrival });
    setColorInput(""); setImageInput(""); setEditingId(p.id);
  }
  function closeForm() { setEditingId(null); }

  function handleSave() {
    const invalidate = () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    if (editingId === "new") {
      createProduct.mutate({ data: form }, { onSuccess: () => { invalidate(); closeForm(); } });
    } else if (typeof editingId === "number") {
      updateProduct.mutate({ id: editingId, data: form }, { onSuccess: () => { invalidate(); closeForm(); } });
    }
  }

  function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    deleteProduct.mutate({ id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }) });
  }

  function addColor() {
    const c = colorInput.trim();
    if (c && !form.colors.includes(c)) setForm(f => ({ ...f, colors: [...f.colors, c] }));
    setColorInput("");
  }
  function addImage() {
    const u = imageInput.trim();
    if (u) setForm(f => ({ ...f, images: [...f.images, u] }));
    setImageInput("");
  }

  const filtered = (products ?? []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.categoryName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {editingId !== null ? (
        /* ── Product form ── */
        <div>
          <div className="flex items-center gap-3 mb-5">
            <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4" /></button>
            <h3 className="font-bold text-slate-800">{editingId === "new" ? "Add New Product" : "Edit Product"}</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Product Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="e.g. Samsung Galaxy S24" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Category *</label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
                  {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Description *</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" placeholder="Describe the product..." />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Price (Rs.) *</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Original Price (Rs.)</label>
                <input type="number" value={form.originalPrice ?? ""} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value ? Number(e.target.value) : null }))} placeholder="Leave blank if no discount" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Stock *</label>
                <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="accent-amber-500 w-4 h-4" />
                <span className="text-sm font-medium">⭐ Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isNewArrival} onChange={e => setForm(f => ({ ...f, isNewArrival: e.target.checked }))} className="accent-amber-500 w-4 h-4" />
                <span className="text-sm font-medium">✨ New Arrival</span>
              </label>
            </div>

            {/* Colors */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Colors</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.colors.map(c => (
                  <span key={c} className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    {c}
                    <button onClick={() => setForm(f => ({ ...f, colors: f.colors.filter(x => x !== c) }))} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={colorInput} onChange={e => setColorInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addColor()} placeholder="e.g. Midnight Black" className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                <button onClick={addColor} className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm hover:bg-slate-200 transition-colors">Add</button>
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Image URLs</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt="" className="w-14 h-14 object-cover rounded-lg border border-slate-200" />
                    <button onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={imageInput} onChange={e => setImageInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addImage()} placeholder="Paste image URL..." className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                <button onClick={addImage} className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm hover:bg-slate-200 transition-colors">Add</button>
              </div>
              <p className="text-xs text-slate-400 mt-1">Tip: Use any Unsplash URL like https://images.unsplash.com/photo-...?w=400</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={createProduct.isPending || updateProduct.isPending || !form.name || !form.description}
                className="flex-1 bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {(createProduct.isPending || updateProduct.isPending) ? "Saving…" : editingId === "new" ? "Add Product" : "Save Changes"}
              </button>
              <button onClick={closeForm} className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Product list ── */
        <div>
          <div className="flex items-center gap-3 mb-4">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button onClick={openNew} className="flex items-center gap-2 bg-slate-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm whitespace-nowrap">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No products found</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {filtered.map(p => (
                <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-3 hover:border-slate-300 transition-colors">
                  <img src={p.images[0] ?? "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=80"} alt={p.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">{p.categoryName}</span>
                      <span className="text-xs font-bold text-slate-700">Rs. {p.price.toLocaleString()}</span>
                      {p.isFeatured && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Featured</span>}
                      {p.isNewArrival && <span className="text-xs bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full">New</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-400 mt-3 text-center">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 4: Content
───────────────────────────────────────── */
function ContentTab({ sections, setSectionsAndSave }: {
  sections: Section[];
  setSectionsAndSave: (s: Section[]) => void;
}) {
  function setField(id: string, key: string, value: string) {
    setSectionsAndSave(sections.map(s => s.id === id ? { ...s, data: { ...s.data, [key]: value } } : s));
  }

  const hero = sections.find(s => s.type === "hero");
  const promo = sections.find(s => s.type === "promo");

  const Field = ({ sectionId, fieldKey, label, placeholder, multiline = false }: { sectionId: string; fieldKey: string; label: string; placeholder: string; multiline?: boolean }) => {
    const section = sections.find(s => s.id === sectionId);
    const value = (section?.data?.[fieldKey] as string) ?? "";
    return (
      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1">{label}</label>
        {multiline ? (
          <textarea value={value} onChange={e => setField(sectionId, fieldKey, e.target.value)} rows={2} placeholder={placeholder} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
        ) : (
          <input value={value} onChange={e => setField(sectionId, fieldKey, e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {hero && (
        <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4 space-y-3">
          <h3 className="font-bold text-sm text-indigo-800 flex items-center gap-2"><span>🖼️</span> Hero Banner Text</h3>
          <Field sectionId="hero" fieldKey="heroTitle"    label="Main Title"    placeholder="EVRON" />
          <Field sectionId="hero" fieldKey="heroSlogan"   label="Slogan"        placeholder="The trust we build" />
          <Field sectionId="hero" fieldKey="heroSubtitle" label="Subtitle Line" placeholder="Pakistan's Premium Marketplace" />
        </div>
      )}

      {promo && (
        <div className="bg-rose-50 rounded-xl border border-rose-200 p-4 space-y-3">
          <h3 className="font-bold text-sm text-rose-800 flex items-center gap-2"><span>🏷️</span> Promotional Banner</h3>
          <Field sectionId="promo" fieldKey="promoHeading"    label="Heading"     placeholder="Up to 50% Off" />
          <Field sectionId="promo" fieldKey="promoSubheading" label="Subheading"  placeholder="On selected electronics and more" />
          <Field sectionId="promo" fieldKey="promoCtaText"    label="Button Text" placeholder="Grab the Deals" />
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">Changes auto-save within 1 second</p>
    </div>
  );
}

/* ─────────────────────────────────────────
   Live Preview Panel
───────────────────────────────────────── */
function PreviewPanel({ sections }: { sections: Section[] }) {
  const theme = (sections.find(s => s.type === "theme")?.data ?? {}) as Record<string, string>;
  const primary = theme.primary ?? "#f59e0b";
  const secondary = theme.secondary ?? "#1e2d4f";
  const bg = theme.background ?? "#f7f8fa";
  const visible = sections.filter(s => s.visible && s.type !== "theme").sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200 sticky top-20">
      <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: secondary }}>
        <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400/70" /><div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" /><div className="w-2.5 h-2.5 rounded-full bg-green-400/70" /></div>
        <div className="flex-1 mx-3 h-4 rounded-full bg-white/10" />
        <span className="text-white/60 text-xs">evron.app</span>
      </div>

      <div style={{ backgroundColor: bg }} className="max-h-[620px] overflow-y-auto divide-y divide-slate-100">
        {visible.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">All sections hidden</div>
        ) : visible.map(s => {
          if (s.type === "hero") return (
            <div key={s.id} style={{ background: `linear-gradient(to right, ${secondary}dd, ${secondary}99)` }} className="p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: primary }}>{(s.data.heroSubtitle as string) || "Pakistan's Premium Marketplace"}</p>
              <h1 className="text-3xl font-black">{(s.data.heroTitle as string) || "EVRON"}</h1>
              <p className="text-white/70 italic mt-1 mb-4">{(s.data.heroSlogan as string) || "The trust we build"}</p>
              <div className="flex gap-2">
                <span className="text-xs font-bold px-4 py-2 rounded-lg" style={{ backgroundColor: primary, color: secondary }}>Shop Now →</span>
                <span className="text-xs font-medium px-4 py-2 rounded-lg text-white bg-white/10 border border-white/20">Featured Deals</span>
              </div>
            </div>
          );
          if (s.type === "promo") return (
            <div key={s.id} className="p-4 flex items-center justify-between gap-3" style={{ background: `linear-gradient(to right, ${secondary}cc, ${secondary}88)` }}>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: primary }}>Limited Time</p>
                <p className="font-black text-white">{(s.data.promoHeading as string) || "Up to 50% Off"}</p>
                <p className="text-white/60 text-xs">{(s.data.promoSubheading as string) || "On selected items"}</p>
              </div>
              <span className="text-xs font-bold px-4 py-2 rounded-lg flex-shrink-0" style={{ backgroundColor: primary, color: secondary }}>{(s.data.promoCtaText as string) || "Shop Now"}</span>
            </div>
          );
          const meta = SECTION_META[s.type];
          return (
            <div key={s.id} className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: bg }}>
              <span>{meta?.icon ?? "□"}</span>
              <span className="text-xs font-medium text-slate-600">{meta?.label ?? s.type}</span>
              <span className="ml-auto text-xs text-slate-400">Dynamic content</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 5: Pages
───────────────────────────────────────── */
function PagesTab({ sections, setSectionsAndSave }: {
  sections: Section[];
  setSectionsAndSave: (s: Section[]) => void;
}) {
  const [openPage, setOpenPage] = useState<"about" | "contact" | null>("about");

  function setField(sectionType: string, key: string, value: string) {
    const exists = sections.find(s => s.type === sectionType);
    if (exists) {
      setSectionsAndSave(sections.map(s =>
        s.type === sectionType ? { ...s, data: { ...s.data, [key]: value } } : s
      ));
    }
  }

  function getVal(sectionType: string, key: string, fallback: string) {
    const s = sections.find(s => s.type === sectionType);
    return (s?.data?.[key] as string) || fallback;
  }

  const Field = ({ type, fieldKey, label, placeholder, multiline = false, hint }: {
    type: string; fieldKey: string; label: string; placeholder: string; multiline?: boolean; hint?: string;
  }) => (
    <div>
      <label className="text-xs font-semibold text-slate-600 block mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={getVal(type, fieldKey, "")}
          onChange={e => setField(type, fieldKey, e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      ) : (
        <input
          value={getVal(type, fieldKey, "")}
          onChange={e => setField(type, fieldKey, e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      )}
      {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
    </div>
  );

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 mb-4">Edit the content on your About Us and Contact Us pages. Changes auto-save instantly.</p>

      {/* About Us card */}
      <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 overflow-hidden">
        <button
          onClick={() => setOpenPage(openPage === "about" ? null : "about")}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-100 transition-colors"
        >
          <span className="text-xl">📄</span>
          <div className="flex-1 text-left">
            <p className="font-bold text-sm text-slate-800">About Us Page</p>
            <p className="text-xs text-slate-500">Heading, mission, story, values, team</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/about" target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="p-1.5 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-600 transition-colors"
              title="Preview page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span className="text-slate-400 text-xs">{openPage === "about" ? "▲" : "▼"}</span>
          </div>
        </button>

        {openPage === "about" && (
          <div className="px-4 pb-5 pt-2 border-t border-indigo-200 space-y-3 bg-white">
            <Field type="page-about" fieldKey="heading"  label="Page Heading"     placeholder="About Evron" />
            <Field type="page-about" fieldKey="tagline"  label="Tagline / Slogan" placeholder="The trust we build" />
            <Field type="page-about" fieldKey="mission"  label="Our Mission"      placeholder="Describe your mission..." multiline />
            <Field type="page-about" fieldKey="story"    label="Our Story"        placeholder="Tell your brand story..." multiline />
            <Field type="page-about" fieldKey="values"   label="Our Values"       placeholder="What you stand for..." multiline />
            <Field type="page-about" fieldKey="team"     label="Our Team"         placeholder="Describe your team..." multiline />
          </div>
        )}
      </div>

      {/* Contact Us card */}
      <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 overflow-hidden">
        <button
          onClick={() => setOpenPage(openPage === "contact" ? null : "contact")}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-100 transition-colors"
        >
          <span className="text-xl">✉️</span>
          <div className="flex-1 text-left">
            <p className="font-bold text-sm text-slate-800">Contact Us Page</p>
            <p className="text-xs text-slate-500">Heading, email, phone, address, hours</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/contact" target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-600 transition-colors"
              title="Preview page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span className="text-slate-400 text-xs">{openPage === "contact" ? "▲" : "▼"}</span>
          </div>
        </button>

        {openPage === "contact" && (
          <div className="px-4 pb-5 pt-2 border-t border-rose-200 space-y-3 bg-white">
            <Field type="page-contact" fieldKey="heading"   label="Page Heading"    placeholder="Contact Us" />
            <Field type="page-contact" fieldKey="subtext"   label="Intro Text"      placeholder="We are here to help..." multiline />
            <Field type="page-contact" fieldKey="email"     label="Email Address"   placeholder="support@evron.pk" hint="Shown as a clickable link" />
            <Field type="page-contact" fieldKey="phone"     label="Phone Number"    placeholder="+92 300 0000000" hint="Shown as a clickable link" />
            <Field type="page-contact" fieldKey="address"   label="Address"         placeholder="Karachi, Pakistan" />
            <Field type="page-contact" fieldKey="hours"     label="Business Hours"  placeholder="Monday – Saturday: 9am – 6pm" />
            <Field type="page-contact" fieldKey="extraInfo" label="Extra Note"      placeholder="Any extra info for customers..." multiline />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Builder
───────────────────────────────────────── */
function Builder() {
  const { data: config, isLoading } = useGetEditorConfig();
  const saveConfig = useSaveEditorConfig();
  const queryClient = useQueryClient();

  const [sections, setSections] = useState<Section[]>([]);
  const [tab, setTab] = useState<Tab>("layout");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (config) setSections([...config.sections].sort((a, b) => a.order - b.order));
  }, [config]);

  const setSectionsAndSave = useCallback((next: Section[]) => {
    setSections(next);
    setSaveState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      saveConfig.mutate(
        { data: { sections: next.map((s, i) => ({ ...s, order: s.type === "theme" ? 99 : i })) } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetEditorConfigQueryKey() });
            setSaveState("saved");
            setTimeout(() => setSaveState("idle"), 2500);
          },
        }
      );
    }, 900);
  }, [saveConfig, queryClient]);

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "layout",   label: "Layout",   icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "colors",   label: "Colors",   icon: <Palette className="w-4 h-4" /> },
    { id: "products", label: "Products", icon: <Package className="w-4 h-4" /> },
    { id: "content",  label: "Content",  icon: <Type className="w-4 h-4" /> },
    { id: "pages",    label: "Pages",    icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-3 flex items-center gap-4 sticky top-0 z-50 shadow-xl">
        <div className="text-xl font-black tracking-tight flex-shrink-0">EV<span className="text-amber-400">R</span>ON</div>
        <span className="text-slate-500 text-sm hidden sm:block">Visual Page Builder</span>
        <div className="flex-1" />
        <SaveBadge state={saveState} />
        <a href="/" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm rounded-lg transition-colors whitespace-nowrap">
          View Site ↗
        </a>
        <button onClick={() => { sessionStorage.removeItem("evron-auth"); window.location.reload(); }} className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors" title="Lock">
          <Lock className="w-4 h-4" />
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <aside className="w-[420px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors ${tab === t.id ? "text-slate-900 border-b-2 border-amber-500 bg-amber-50/50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-5">
            {isLoading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />)}</div>
            ) : (
              <>
                {tab === "layout"   && <LayoutTab   sections={sections} setSectionsAndSave={setSectionsAndSave} />}
                {tab === "colors"   && <ColorsTab   sections={sections} setSectionsAndSave={setSectionsAndSave} />}
                {tab === "products" && <ProductsTab />}
                {tab === "content"  && <ContentTab  sections={sections} setSectionsAndSave={setSectionsAndSave} />}
                {tab === "pages"    && <PagesTab    sections={sections} setSectionsAndSave={setSectionsAndSave} />}
              </>
            )}
          </div>
        </aside>

        {/* Right: live preview */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-100">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              Live preview — auto-saves within 1 second of every change
            </div>
            <PreviewPanel sections={sections} />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Entry point
───────────────────────────────────────── */
export default function DragEditor() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("evron-auth") === "1");
  if (!authed) return <PasswordGate onUnlock={() => setAuthed(true)} />;
  return <Builder />;
}
