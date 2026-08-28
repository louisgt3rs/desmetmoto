import { useMemo, useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  AlertTriangle, Check, ChevronRight, Loader2, Pencil, Plus,
  Save, Search, Sparkles, Trash2, Upload, X, ImageIcon,
} from "lucide-react";
import { ImageUploadSingle, ImageUploadMulti, uploadFile } from "./ImageUpload";
import SizeStockGrid, { calcTotalFromSizes } from "./SizeStockGrid";
import type { AdminBrand, AdminProduct } from "./types";

interface ProductColorway {
  id: string; product_id: string; name: string;
  image_url: string | null; gallery_images: string[];
  stock_by_size: Record<string, number>; sort_order: number;
}
interface ProductImage { id: string; image_url: string; position: number; }
interface AdminProductsProps { brands: AdminBrand[]; onRefresh: () => Promise<void>; products: AdminProduct[]; }

const CATEGORY_OPTIONS = ["Casques", "Blousons", "Pantalons", "Gants", "Bottes", "Combinaisons", "Accessoires"];
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhdHN1ZGdwaWVjem1vZGpieW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTI5OTksImV4cCI6MjA4OTc2ODk5OX0.nyknLVoppUcDeHjQWC-Nmw2wFYQiC4RLGFo51qEEE4w";

function parseSbs(v: unknown): Record<string, number> {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, number>;
  return {};
}
const fmt = (p?: number | null) => p != null ? `${p.toFixed(2)} €` : "—";
const totalSbs = (sbs: Record<string, number>) => Object.values(sbs).reduce((a, b) => a + b, 0);

const EMPTY_FORM = { name: "", description: "", brand_id: "", category: "Casques", price: "", image_url: "", stock_by_size: {} as Record<string, number> };
const EMPTY_CW = { name: "", image_url: "", gallery_images: [] as string[], stock_by_size: {} as Record<string, number> };

export default function AdminProducts({ products, brands, onRefresh }: AdminProductsProps) {
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [tab, setTab] = useState<"info" | "photos" | "coloris">("info");
  const [saving, setSaving] = useState(false);
  const [genDesc, setGenDesc] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const restoredRef = useRef(false);

  // Colorways
  const [colorways, setColorways] = useState<ProductColorway[]>([]);
  const [activeCw, setActiveCw] = useState<string | null>(null);
  const [cwForm, setCwForm] = useState({ ...EMPTY_CW });

  // Gallery
  const [gallery, setGallery] = useState<ProductImage[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const galleryRef = useRef<HTMLInputElement>(null);

  // Draft
  const draftKey = () => editing ? `dp-${editing.id}` : "dp-new";
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [draftAt, setDraftAt] = useState<Date | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p =>
      [p.name, p.brand, p.category].some(v => String(v ?? "").toLowerCase().includes(q))
    );
  }, [products, search]);

  // Load colorways + gallery when editing
  useEffect(() => {
    if (!editing) { setColorways([]); setGallery([]); return; }
    supabase.from("product_colorways").select("*").eq("product_id", editing.id).order("sort_order")
      .then(({ data }) => setColorways((data || []).map(d => ({
        ...d, gallery_images: Array.isArray(d.gallery_images) ? d.gallery_images as string[] : [],
        stock_by_size: parseSbs(d.stock_by_size),
      })) as ProductColorway[]));
    (supabase.from("product_images" as any) as any).select("id,image_url,position")
      .eq("product_id", editing.id).order("position")
      .then(({ data }: any) => setGallery(data || []));
  }, [editing?.id]);

  // Restore panel state on mount (when navigating back to admin)
  useEffect(() => {
    if (restoredRef.current || products.length === 0) return;
    restoredRef.current = true;
    const raw = sessionStorage.getItem("admin-panel-state");
    if (!raw) return;
    try {
      const state = JSON.parse(raw) as { editingId: string | null; tab: "info" | "photos" | "coloris" };
      if (state.editingId) {
        const p = products.find(x => x.id === state.editingId);
        if (p) { openEdit(p); setTab(state.tab || "info"); }
      } else {
        openNew(); setTab(state.tab || "info");
      }
    } catch {}
  }, [products]);

  // Persist panel state to sessionStorage
  useEffect(() => {
    if (!panelOpen) { sessionStorage.removeItem("admin-panel-state"); return; }
    sessionStorage.setItem("admin-panel-state", JSON.stringify({ editingId: editing?.id ?? null, tab }));
  }, [panelOpen, editing?.id, tab]);

  // Autosave draft
  useEffect(() => {
    if (!panelOpen) return;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      localStorage.setItem(draftKey(), JSON.stringify({ form, colorways, savedAt: new Date().toISOString() }));
      setDraftAt(new Date());
    }, 800);
    return () => { if (draftTimer.current) clearTimeout(draftTimer.current); };
  }, [form, colorways, panelOpen]);

  const openNew = () => {
    setEditing(null);
    const raw = localStorage.getItem("dp-new");
    let f = { ...EMPTY_FORM }; let cwl: ProductColorway[] = [];
    if (raw) { try { const d = JSON.parse(raw); if (d.form) f = d.form; if (d.colorways) cwl = d.colorways; } catch {} }
    setForm(f); setColorways(cwl); setGallery([]);
    setActiveCw(null); setCwForm({ ...EMPTY_CW }); setTab("info");
    setPanelOpen(true);
  };

  const openEdit = (p: AdminProduct) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || "", brand_id: p.brand_id || "",
      category: p.category || "Casques", price: p.price != null ? String(p.price) : "",
      image_url: p.image_url || "", stock_by_size: parseSbs(p.stock_by_size) });
    setActiveCw(null); setCwForm({ ...EMPTY_CW }); setTab("info");
    setPanelOpen(true);
  };

  const closePanel = () => { setPanelOpen(false); setEditing(null); setDraftAt(null); };

  const generateDesc = async () => {
    if (!form.name.trim()) { toast.error("Entrez d'abord le nom"); return; }
    const brand = brands.find(b => b.id === form.brand_id)?.name || "";
    setGenDesc(true);
    try {
      const res = await fetch("https://qatsudgpieczmodjbynh.supabase.co/functions/v1/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${ANON_KEY}`, "apikey": ANON_KEY },
        body: JSON.stringify({ name: form.name, brand, category: form.category, price: form.price ? Number(form.price) : null }),
      });
      const json = await res.json();
      if (!json.description) throw new Error(json.error || "Réponse vide");
      setForm(f => ({ ...f, description: json.description }));
      toast.success("Description générée");
    } catch (e) { toast.error("Erreur : " + String(e)); }
    finally { setGenDesc(false); }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Nom requis"); return; }
    setSaving(true);
    const brandObj = brands.find(b => b.id === form.brand_id);
    const hasColorways = colorways.length > 0;
    const totalStock = hasColorways
      ? colorways.reduce((s, c) => s + totalSbs(c.stock_by_size), 0)
      : totalSbs(form.stock_by_size);
    const payload: any = {
      name: form.name, description: form.description || null,
      brand_id: form.brand_id || null, brand: brandObj?.name || null,
      category: form.category, price: form.price ? Number(form.price) : null,
      stock_quantity: totalStock, in_stock: totalStock > 0,
      stock_by_size: hasColorways ? null : (Object.keys(form.stock_by_size).length > 0 ? form.stock_by_size : null),
      image_url: form.image_url || colorways[0]?.image_url || null,
    };
    if (editing) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) { setSaving(false); toast.error(error.message); return; }
      localStorage.removeItem(draftKey());
      toast.success("Produit modifié");
    } else {
      const { data, error } = await supabase.from("products").insert({ ...payload, sort_order: products.length + 1 }).select("id").single();
      if (error || !data) { setSaving(false); toast.error(error?.message || "Erreur"); return; }
      if (colorways.length > 0) {
        await supabase.from("product_colorways").insert(colorways.map((cw, i) => ({
          product_id: data.id, name: cw.name, image_url: cw.image_url,
          gallery_images: cw.gallery_images, stock_by_size: cw.stock_by_size, sort_order: i,
        })));
      }
      localStorage.removeItem("dp-new");
      toast.success("Produit ajouté");
    }
    setSaving(false); closePanel(); await onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await supabase.from("products").delete().eq("id", id);
    toast.success("Supprimé"); await onRefresh();
  };

  // Colorway actions
  const saveCw = async () => {
    if (!cwForm.name.trim()) { toast.error("Nom coloris requis"); return; }
    if (activeCw) {
      if (editing && !activeCw.startsWith("temp-")) {
        await supabase.from("product_colorways").update({ name: cwForm.name, image_url: cwForm.image_url || null, gallery_images: cwForm.gallery_images, stock_by_size: cwForm.stock_by_size }).eq("id", activeCw);
      }
      setColorways(p => p.map(c => c.id === activeCw ? { ...c, ...cwForm, image_url: cwForm.image_url || null } : c));
      toast.success("Coloris modifié");
    } else {
      if (editing) {
        const { data, error } = await supabase.from("product_colorways").insert({ product_id: editing.id, name: cwForm.name, image_url: cwForm.image_url || null, gallery_images: cwForm.gallery_images, stock_by_size: cwForm.stock_by_size, sort_order: colorways.length }).select("*").single();
        if (error) { toast.error(error.message); return; }
        setColorways(p => [...p, { ...data, gallery_images: Array.isArray(data.gallery_images) ? data.gallery_images as string[] : [], stock_by_size: parseSbs(data.stock_by_size) } as ProductColorway]);
      } else {
        setColorways(p => [...p, { id: `temp-${Date.now()}`, product_id: "", name: cwForm.name, image_url: cwForm.image_url || null, gallery_images: cwForm.gallery_images, stock_by_size: cwForm.stock_by_size, sort_order: p.length }]);
      }
      toast.success("Coloris ajouté");
    }
    setActiveCw(null); setCwForm({ ...EMPTY_CW });
  };

  const deleteCw = async (id: string) => {
    if (!id.startsWith("temp-")) await supabase.from("product_colorways").delete().eq("id", id);
    setColorways(p => p.filter(c => c.id !== id));
    if (activeCw === id) { setActiveCw(null); setCwForm({ ...EMPTY_CW }); }
    toast.success("Coloris supprimé");
  };

  const editCw = (cw: ProductColorway) => {
    setActiveCw(cw.id); setCwForm({ name: cw.name, image_url: cw.image_url || "", gallery_images: cw.gallery_images || [], stock_by_size: cw.stock_by_size });
  };

  // Gallery actions
  const uploadGallery = async (files: FileList) => {
    if (!editing) return;
    setGalleryLoading(true);
    let pos = gallery.length;
    const newImgs: ProductImage[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadFile(file, "products");
      if (url) {
        const { data } = await (supabase.from("product_images" as any) as any).insert({ product_id: editing.id, image_url: url, position: pos }).select("id,image_url,position").single();
        if (data) { newImgs.push(data); pos++; }
      }
    }
    setGallery(p => [...p, ...newImgs]);
    setGalleryLoading(false);
  };

  const deleteGalleryImg = async (id: string) => {
    await (supabase.from("product_images" as any) as any).delete().eq("id", id);
    setGallery(p => p.filter(i => i.id !== id).map((img, idx) => ({ ...img, position: idx })));
  };

  const getBrand = (p: AdminProduct) => brands.find(b => b.id === p.brand_id)?.name || p.brand || "—";
  const totalColorwaysStock = colorways.reduce((s, c) => s + totalSbs(c.stock_by_size), 0);

  return (
    <div className="flex h-full gap-0" style={{ minHeight: "70vh" }}>
      {/* ── LEFT: Product list ── */}
      <div className={`flex flex-col transition-all duration-300 ${panelOpen ? "w-0 overflow-hidden lg:w-[45%] lg:overflow-visible" : "w-full"}`}>
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[hsl(var(--admin-accent)/0.18)] px-5 py-4">
          <div className="flex-1">
            <p className="admin-kicker text-[10px] text-[hsl(var(--admin-muted-foreground))]">CATALOGUE</p>
            <h2 className="font-adminDisplay text-2xl text-[hsl(var(--admin-foreground))]">PRODUITS <span style={{ color: "hsl(var(--admin-accent))" }}>({products.length})</span></h2>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 font-adminDisplay text-[11px] uppercase tracking-[0.18em] transition-all"
            style={{ background: "hsl(var(--admin-accent))", color: "#050505" }}>
            <Plus className="h-3.5 w-3.5" /> Nouveau
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-[hsl(var(--admin-accent)/0.12)] px-5 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--admin-muted-foreground))]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
              className="w-full bg-transparent pl-9 pr-4 py-2 text-sm text-[hsl(var(--admin-foreground))] placeholder:text-[hsl(var(--admin-muted-foreground))] outline-none border border-[hsl(var(--admin-accent)/0.18)] focus:border-[hsl(var(--admin-accent)/0.5)] transition-colors" />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="py-16 text-center text-xs uppercase tracking-widest text-[hsl(var(--admin-muted-foreground))]">Aucun produit</div>
          )}
          {filtered.map(p => {
            const stock = p.stock_quantity || 0;
            const isActive = editing?.id === p.id && panelOpen;
            return (
              <div key={p.id} onClick={() => openEdit(p)}
                className="group flex cursor-pointer items-center gap-3 border-b border-[hsl(var(--admin-accent)/0.1)] px-5 py-3.5 transition-colors hover:bg-[hsl(var(--admin-accent)/0.05)]"
                style={isActive ? { background: "hsl(var(--admin-accent)/0.08)", borderLeft: "2px solid hsl(var(--admin-accent))" } : {}}>
                {/* Thumb */}
                <div className="h-14 w-14 shrink-0 overflow-hidden" style={{ background: "hsl(var(--admin-background))", border: "1px solid hsl(var(--admin-accent)/0.14)" }}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="h-full w-full object-contain p-1" />
                    : <div className="flex h-full items-center justify-center"><ImageIcon className="h-5 w-5 text-[hsl(var(--admin-muted-foreground)/0.4)]" /></div>
                  }
                </div>
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="font-adminDisplay text-base leading-tight text-[hsl(var(--admin-foreground))] truncate">{p.name}</p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-[hsl(var(--admin-muted-foreground))] truncate">{getBrand(p)} · {p.category || "—"}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    {p.price != null && <span className="text-[11px] font-medium" style={{ color: "hsl(var(--admin-accent))" }}>{p.price.toFixed(2)} €</span>}
                    <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 ${stock > 3 ? "bg-emerald-500/10 text-emerald-400" : stock > 0 ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"}`}>
                      {stock > 0 ? `${stock} pcs` : "Rupture"}
                    </span>
                    {stock > 0 && stock <= 3 && <AlertTriangle className="h-3 w-3 text-amber-400" />}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); handleDelete(p.id); }}
                    className="flex h-7 w-7 items-center justify-center border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <ChevronRight className="h-4 w-4 text-[hsl(var(--admin-muted-foreground))]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT: Editor panel ── */}
      {panelOpen && (
        <div className="flex w-full flex-col lg:w-[55%] border-l border-[hsl(var(--admin-accent)/0.2)]" style={{ background: "hsl(var(--admin-card))" }}>
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-[hsl(var(--admin-accent)/0.18)] px-6 py-4">
            <div>
              <p className="admin-kicker text-[10px] text-[hsl(var(--admin-muted-foreground))]">{editing ? "MODIFIER" : "NOUVEAU PRODUIT"}</p>
              <h3 className="font-adminDisplay text-xl text-[hsl(var(--admin-foreground))]">{form.name || "Sans titre"}</h3>
            </div>
            <div className="flex items-center gap-2">
              {draftAt && <span className="hidden text-[10px] text-[hsl(var(--admin-accent)/0.6)] sm:block">✓ brouillon {draftAt.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}</span>}
              <button onClick={closePanel} className="flex h-8 w-8 items-center justify-center border border-[hsl(var(--admin-accent)/0.2)] hover:border-[hsl(var(--admin-accent)/0.5)] transition-colors text-[hsl(var(--admin-muted-foreground))]">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[hsl(var(--admin-accent)/0.18)]">
            {(["info", "photos", "coloris"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-3 font-adminDisplay text-[11px] uppercase tracking-[0.2em] transition-all"
                style={tab === t
                  ? { color: "hsl(var(--admin-accent))", borderBottom: "2px solid hsl(var(--admin-accent))" }
                  : { color: "hsl(var(--admin-muted-foreground))", borderBottom: "2px solid transparent" }}>
                {t === "info" ? "Infos" : t === "photos" ? `Photos${gallery.length ? ` (${gallery.length})` : ""}` : `Coloris (${colorways.length})`}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* ── INFO TAB ── */}
            {tab === "info" && (
              <>
                {/* Nom + Marque */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--admin-muted-foreground))]">Modèle *</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Ex : RX-7V Evo, Quantic…"
                      className="admin-input w-full px-3 py-2.5 text-base font-adminDisplay bg-transparent border border-[hsl(var(--admin-accent)/0.2)] text-[hsl(var(--admin-foreground))] placeholder:text-[hsl(var(--admin-muted-foreground)/0.5)] focus:border-[hsl(var(--admin-accent)/0.6)] outline-none transition-colors" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--admin-muted-foreground))]">Marque</label>
                    <select value={form.brand_id || ""} onChange={e => setForm({ ...form, brand_id: e.target.value })}
                      className="admin-input w-full px-3 py-2.5 text-sm bg-transparent border border-[hsl(var(--admin-accent)/0.2)] text-[hsl(var(--admin-foreground))] focus:border-[hsl(var(--admin-accent)/0.6)] outline-none transition-colors">
                      <option value="">— Aucune —</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--admin-muted-foreground))]">Prix €</label>
                    <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                      placeholder="0.00"
                      className="admin-input w-full px-3 py-2.5 text-sm bg-transparent border border-[hsl(var(--admin-accent)/0.2)] text-[hsl(var(--admin-foreground))] placeholder:text-[hsl(var(--admin-muted-foreground)/0.5)] focus:border-[hsl(var(--admin-accent)/0.6)] outline-none transition-colors" />
                  </div>
                </div>

                {/* Catégorie pills */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--admin-muted-foreground))]">Catégorie</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_OPTIONS.map(cat => (
                      <button key={cat} type="button" onClick={() => setForm({ ...form, category: cat })}
                        className="px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] transition-all"
                        style={form.category === cat
                          ? { background: "hsl(var(--admin-accent))", color: "#050505" }
                          : { border: "1px solid hsl(var(--admin-accent)/0.25)", color: "hsl(var(--admin-muted-foreground))", background: "transparent" }}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--admin-muted-foreground))]">Description</label>
                    <button type="button" onClick={generateDesc} disabled={genDesc}
                      className="flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase tracking-[0.16em] border transition-all disabled:opacity-40"
                      style={{ borderColor: "hsl(var(--admin-accent)/0.4)", color: "hsl(var(--admin-accent))", background: "hsl(var(--admin-accent)/0.06)" }}>
                      {genDesc ? <><Loader2 className="h-3 w-3 animate-spin" /> Génération…</> : <><Sparkles className="h-3 w-3" /> IA</>}
                    </button>
                  </div>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Description du produit…" rows={4}
                    className="admin-input w-full resize-none px-3 py-2.5 text-sm bg-transparent border border-[hsl(var(--admin-accent)/0.2)] text-[hsl(var(--admin-foreground))] placeholder:text-[hsl(var(--admin-muted-foreground)/0.5)] focus:border-[hsl(var(--admin-accent)/0.6)] outline-none transition-colors" />
                </div>

                {/* Image principale */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--admin-muted-foreground))]">Image principale</label>
                  <ImageUploadSingle value={form.image_url} onChange={v => setForm({ ...form, image_url: v })} folder="products" label="Glisser ou cliquer pour importer" previewClass="h-24 w-24" />
                </div>

                {/* Stock & Tailles — direct sur le produit si pas de coloris */}
                <div className="space-y-2 border-t border-[hsl(var(--admin-accent)/0.15)] pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--admin-muted-foreground))]">
                      Stock &amp; Tailles
                    </label>
                    {colorways.length > 0 && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5" style={{ background: "hsl(var(--admin-accent)/0.1)", color: "hsl(var(--admin-accent))" }}>
                        Géré par les coloris
                      </span>
                    )}
                  </div>
                  {colorways.length > 0 ? (
                    <p className="text-xs text-[hsl(var(--admin-muted-foreground))]">
                      Stock total : <strong style={{ color: "hsl(var(--admin-accent))" }}>{colorways.reduce((s, c) => s + totalSbs(c.stock_by_size), 0)} pcs</strong> — modifiez le stock dans l'onglet Coloris.
                    </p>
                  ) : form.category === "Accessoires" ? (
                    <div className="flex items-center gap-3">
                      <label className="text-[11px] text-[hsl(var(--admin-muted-foreground))]">Quantité</label>
                      <input type="number" min="0" value={form.stock_by_size["unique"] ?? 0}
                        onChange={e => setForm({ ...form, stock_by_size: { unique: Math.max(0, parseInt(e.target.value) || 0) } })}
                        className="admin-input w-24 px-3 py-1.5 text-sm bg-transparent border border-[hsl(var(--admin-accent)/0.2)] text-[hsl(var(--admin-foreground))] outline-none" />
                    </div>
                  ) : (
                    <SizeStockGrid
                      category={form.category}
                      value={form.stock_by_size}
                      onChange={v => setForm({ ...form, stock_by_size: v })}
                    />
                  )}
                </div>
              </>
            )}

            {/* ── PHOTOS TAB ── */}
            {tab === "photos" && (
              <div className="space-y-4">
                {!editing ? (
                  <div className="rounded border border-dashed border-[hsl(var(--admin-accent)/0.25)] p-6 text-center text-xs uppercase tracking-widest text-[hsl(var(--admin-muted-foreground))]">
                    Enregistrez d'abord le produit pour ajouter une galerie
                  </div>
                ) : (
                  <>
                    {gallery.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                        {gallery.map((img, idx) => (
                          <div key={img.id} className="group relative aspect-square overflow-hidden border border-[hsl(var(--admin-accent)/0.16)]">
                            <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                              <button onClick={() => deleteGalleryImg(img.id)}
                                className="flex h-8 w-8 items-center justify-center border border-red-500/50 bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="absolute bottom-1 right-1 bg-black/60 px-1 text-[9px] text-white/60">#{idx + 1}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div onClick={() => galleryRef.current?.click()}
                      className="flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-[hsl(var(--admin-accent)/0.3)] py-10 transition-colors hover:border-[hsl(var(--admin-accent)/0.6)] hover:bg-[hsl(var(--admin-accent)/0.03)]">
                      <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden"
                        onChange={e => e.target.files && uploadGallery(e.target.files)} />
                      {galleryLoading
                        ? <><Loader2 className="h-6 w-6 animate-spin" style={{ color: "hsl(var(--admin-accent))" }} /><span className="text-xs uppercase tracking-widest text-[hsl(var(--admin-muted-foreground))]">Import en cours…</span></>
                        : <><Upload className="h-6 w-6 text-[hsl(var(--admin-muted-foreground))]" /><span className="text-xs uppercase tracking-widest text-[hsl(var(--admin-muted-foreground))]">Cliquer pour ajouter des photos</span><span className="text-[10px] text-[hsl(var(--admin-muted-foreground)/0.5)]">Plusieurs fichiers acceptés</span></>
                      }
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── COLORIS TAB ── */}
            {tab === "coloris" && (
              <div className="space-y-4">
                {/* Stock summary */}
                <div className="flex items-center justify-between rounded border border-[hsl(var(--admin-accent)/0.18)] px-4 py-3">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--admin-muted-foreground))]">Stock total</span>
                  <span className="font-adminDisplay text-lg" style={{ color: "hsl(var(--admin-accent))" }}>{totalColorwaysStock} pcs</span>
                </div>

                {/* Colorway cards */}
                {colorways.map(cw => {
                  const cwStock = totalSbs(cw.stock_by_size);
                  const isEditing = activeCw === cw.id;
                  return (
                    <div key={cw.id} className="border border-[hsl(var(--admin-accent)/0.18)]" style={{ background: "hsl(var(--admin-background))" }}>
                      {/* Card header */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        {cw.image_url
                          ? <img src={cw.image_url} alt={cw.name} className="h-12 w-12 shrink-0 object-contain border border-[hsl(var(--admin-accent)/0.12)]" />
                          : <div className="h-12 w-12 shrink-0 border border-[hsl(var(--admin-accent)/0.12)] flex items-center justify-center text-[10px] text-[hsl(var(--admin-muted-foreground))]">IMG</div>
                        }
                        <div className="flex-1 min-w-0">
                          <p className="font-adminDisplay text-sm text-[hsl(var(--admin-foreground))] truncate">{cw.name}</p>
                          <p className="text-[11px] text-[hsl(var(--admin-muted-foreground))]">{cwStock} pcs</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => isEditing ? (setActiveCw(null), setCwForm({ ...EMPTY_CW })) : editCw(cw)}
                            className="flex h-7 w-7 items-center justify-center border transition-colors"
                            style={isEditing ? { borderColor: "hsl(var(--admin-accent)/0.5)", background: "hsl(var(--admin-accent)/0.1)", color: "hsl(var(--admin-accent))" } : { borderColor: "hsl(var(--admin-accent)/0.2)", color: "hsl(var(--admin-muted-foreground))" }}>
                            {isEditing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={() => deleteCw(cw.id)}
                            className="flex h-7 w-7 items-center justify-center border border-red-500/25 text-red-400 hover:bg-red-500/20 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Inline edit form */}
                      {isEditing && (
                        <div className="border-t border-[hsl(var(--admin-accent)/0.12)] px-4 pb-4 pt-3 space-y-3">
                          <input value={cwForm.name} onChange={e => setCwForm({ ...cwForm, name: e.target.value })}
                            placeholder="Nom du coloris"
                            className="admin-input w-full px-3 py-2 text-sm bg-transparent border border-[hsl(var(--admin-accent)/0.2)] text-[hsl(var(--admin-foreground))] placeholder:text-[hsl(var(--admin-muted-foreground)/0.5)] focus:border-[hsl(var(--admin-accent)/0.5)] outline-none transition-colors" />
                          <ImageUploadSingle value={cwForm.image_url} onChange={v => setCwForm({ ...cwForm, image_url: v })} folder="products" label="Image principale" previewClass="h-16 w-16" />
                          <ImageUploadMulti value={cwForm.gallery_images} onChange={v => setCwForm({ ...cwForm, gallery_images: v })} folder="products" label="Galerie" />
                          {form.category !== "Accessoires" ? (
                            <SizeStockGrid category={form.category} value={cwForm.stock_by_size} onChange={v => setCwForm({ ...cwForm, stock_by_size: v })} />
                          ) : (
                            <div className="flex items-center gap-3">
                              <label className="text-[10px] uppercase tracking-wider text-[hsl(var(--admin-muted-foreground))]">Stock</label>
                              <input type="number" min="0" value={cwForm.stock_by_size["unique"] ?? 0}
                                onChange={e => setCwForm({ ...cwForm, stock_by_size: { unique: Math.max(0, parseInt(e.target.value) || 0) } })}
                                className="admin-input w-24 px-3 py-1.5 text-sm bg-transparent border border-[hsl(var(--admin-accent)/0.2)] text-[hsl(var(--admin-foreground))] outline-none" />
                            </div>
                          )}
                          <button onClick={saveCw} className="flex items-center gap-2 px-4 py-2 font-adminDisplay text-[11px] uppercase tracking-[0.16em] transition-all"
                            style={{ background: "hsl(var(--admin-accent))", color: "#050505" }}>
                            <Save className="h-3.5 w-3.5" /> Enregistrer
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add new colorway */}
                {!activeCw && (
                  <div className="border border-dashed border-[hsl(var(--admin-accent)/0.25)] p-4 space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: "hsl(var(--admin-accent))" }}>+ Nouveau coloris</p>
                    <input value={cwForm.name} onChange={e => setCwForm({ ...cwForm, name: e.target.value })}
                      placeholder="Nom du coloris (ex: Diamond White)"
                      className="admin-input w-full px-3 py-2 text-sm bg-transparent border border-[hsl(var(--admin-accent)/0.2)] text-[hsl(var(--admin-foreground))] placeholder:text-[hsl(var(--admin-muted-foreground)/0.5)] focus:border-[hsl(var(--admin-accent)/0.5)] outline-none transition-colors" />
                    <ImageUploadSingle value={cwForm.image_url} onChange={v => setCwForm({ ...cwForm, image_url: v })} folder="products" label="Image du coloris" previewClass="h-16 w-16" />
                    <ImageUploadMulti value={cwForm.gallery_images} onChange={v => setCwForm({ ...cwForm, gallery_images: v })} folder="products" label="Galerie" />
                    {form.category !== "Accessoires" ? (
                      <SizeStockGrid category={form.category} value={cwForm.stock_by_size} onChange={v => setCwForm({ ...cwForm, stock_by_size: v })} />
                    ) : (
                      <div className="flex items-center gap-3">
                        <label className="text-[10px] uppercase tracking-wider text-[hsl(var(--admin-muted-foreground))]">Stock</label>
                        <input type="number" min="0" value={cwForm.stock_by_size["unique"] ?? 0}
                          onChange={e => setCwForm({ ...cwForm, stock_by_size: { unique: Math.max(0, parseInt(e.target.value) || 0) } })}
                          className="admin-input w-24 px-3 py-1.5 text-sm bg-transparent border border-[hsl(var(--admin-accent)/0.2)] text-[hsl(var(--admin-foreground))] outline-none" />
                      </div>
                    )}
                    <button onClick={saveCw}
                      className="flex items-center gap-2 px-4 py-2 font-adminDisplay text-[11px] uppercase tracking-[0.16em] transition-all"
                      style={{ border: "1px solid hsl(var(--admin-accent)/0.4)", color: "hsl(var(--admin-accent))", background: "hsl(var(--admin-accent)/0.06)" }}>
                      <Plus className="h-3.5 w-3.5" /> Ajouter ce coloris
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Save footer */}
          <div className="flex items-center justify-between border-t border-[hsl(var(--admin-accent)/0.18)] px-6 py-4">
            <button onClick={closePanel} className="px-4 py-2.5 font-adminDisplay text-[11px] uppercase tracking-[0.18em] border border-[hsl(var(--admin-accent)/0.2)] text-[hsl(var(--admin-muted-foreground))] hover:border-[hsl(var(--admin-accent)/0.4)] transition-colors">
              Annuler
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 font-adminDisplay text-[11px] uppercase tracking-[0.18em] transition-all disabled:opacity-50"
              style={{ background: "hsl(var(--admin-accent))", color: "#050505" }}>
              {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Enregistrement…</> : <><Save className="h-3.5 w-3.5" /> Enregistrer</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
