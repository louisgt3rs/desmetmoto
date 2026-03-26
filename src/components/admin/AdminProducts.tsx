import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { AlertTriangle, Pencil, Plus, Save, Search, Trash2, Palette } from "lucide-react";
import { ImageUploadSingle, ImageUploadMulti } from "./ImageUpload";
import SizeStockGrid, { calcTotalFromSizes } from "./SizeStockGrid";
import type { AdminBrand, AdminProduct } from "./types";

interface ProductColorway {
  id: string;
  product_id: string;
  name: string;
  image_url: string | null;
  gallery_images: string[];
  stock_by_size: Record<string, number>;
  sort_order: number;
}

interface AdminProductsProps {
  brands: AdminBrand[];
  onRefresh: () => Promise<void>;
  products: AdminProduct[];
}

const CATEGORY_OPTIONS = ["Casques", "Blousons", "Gants", "Bottes", "Combinaisons", "Accessoires"] as const;

const formatPrice = (price?: number | null) =>
  typeof price === "number"
    ? new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" }).format(price)
    : "Prix non défini";

function parseSbs(v: unknown): Record<string, number> {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, number>;
  return {};
}

export default function AdminProducts({ products, brands, onRefresh }: AdminProductsProps) {
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    brand_id: "",
    category: "Casques",
    price: "",
    image_url: "",
  });

  // Colorways state
  const [colorways, setColorways] = useState<ProductColorway[]>([]);
  const [cwForm, setCwForm] = useState({ name: "", image_url: "", stock_by_size: {} as Record<string, number> });
  const [editingCwId, setEditingCwId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) =>
      [product.name, product.brand, product.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [products, search]);

  // Load colorways when editing a product
  useEffect(() => {
    if (editing) {
      supabase.from("product_colorways").select("*").eq("product_id", editing.id).order("sort_order").then(({ data }) => {
        setColorways((data || []).map(d => ({ ...d, stock_by_size: parseSbs(d.stock_by_size) })) as ProductColorway[]);
      });
    } else {
      setColorways([]);
    }
  }, [editing?.id]);

  const getTotalStock = () => {
    if (colorways.length === 0) return 0;
    return colorways.reduce((sum, cw) => sum + calcTotalFromSizes(cw.stock_by_size), 0);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("NOM REQUIS"); return; }

    setSaving(true);
    const selectedBrand = brands.find((brand) => brand.id === form.brand_id);
    const totalStock = getTotalStock();

    const payload: any = {
      name: form.name,
      description: form.description || null,
      brand_id: form.brand_id || null,
      brand: selectedBrand?.name || null,
      category: form.category,
      price: form.price ? Number(form.price) : null,
      stock_quantity: totalStock,
      in_stock: totalStock > 0,
      image_url: form.image_url || (colorways[0]?.image_url) || null,
      images: form.image_url ? [form.image_url] : colorways.filter(c => c.image_url).map(c => c.image_url!),
    };

    if (editing) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) { setSaving(false); toast.error("ERREUR : " + error.message.toUpperCase()); return; }
      toast.success("PRODUIT MODIFIÉ");
    } else {
      const { data, error } = await supabase.from("products").insert({ ...payload, sort_order: products.length + 1 }).select("id").single();
      if (error || !data) { setSaving(false); toast.error("ERREUR : " + (error?.message || "").toUpperCase()); return; }
      // Save pending colorways for new product
      if (colorways.length > 0) {
        const cwPayloads = colorways.map((cw, i) => ({
          product_id: data.id,
          name: cw.name,
          image_url: cw.image_url,
          stock_by_size: cw.stock_by_size,
          sort_order: i,
        }));
        await supabase.from("product_colorways").insert(cwPayloads);
      }
      toast.success("PRODUIT AJOUTÉ");
    }

    setSaving(false);
    cancel();
    await onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("SUPPRIMER CE PRODUIT ?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error("ERREUR : " + error.message.toUpperCase()); return; }
    toast.success("PRODUIT SUPPRIMÉ");
    await onRefresh();
  };

  const startEdit = (p: AdminProduct) => {
    setEditing(p);
    setOpen(true);
    setForm({
      name: p.name,
      description: p.description || "",
      brand_id: p.brand_id || "",
      category: p.category || "Casques",
      price: typeof p.price === "number" ? String(p.price) : "",
      image_url: p.image_url || "",
    });
    setCwForm({ name: "", image_url: "", stock_by_size: {} });
    setEditingCwId(null);
  };

  const startAdd = () => {
    setEditing(null);
    setOpen(true);
    setForm({ name: "", description: "", brand_id: "", category: "Casques", price: "", image_url: "" });
    setColorways([]);
    setCwForm({ name: "", image_url: "", stock_by_size: {} });
    setEditingCwId(null);
  };

  const cancel = () => {
    setEditing(null);
    setOpen(false);
    setEditingCwId(null);
  };

  // --- Colorway CRUD ---
  const addColorway = async () => {
    if (!cwForm.name.trim()) { toast.error("NOM DE COLORIS REQUIS"); return; }
    if (editing) {
      const { data, error } = await supabase.from("product_colorways").insert({
        product_id: editing.id,
        name: cwForm.name.trim(),
        image_url: cwForm.image_url || null,
        stock_by_size: cwForm.stock_by_size,
        sort_order: colorways.length,
      }).select("*").single();
      if (error) { toast.error(error.message); return; }
      setColorways(prev => [...prev, { ...data, stock_by_size: parseSbs(data.stock_by_size) } as ProductColorway]);
    } else {
      // For new product, store temporarily
      setColorways(prev => [...prev, {
        id: `temp-${Date.now()}`,
        product_id: "",
        name: cwForm.name.trim(),
        image_url: cwForm.image_url || null,
        stock_by_size: cwForm.stock_by_size,
        sort_order: colorways.length,
      }]);
    }
    setCwForm({ name: "", image_url: "", stock_by_size: {} });
    toast.success("COLORIS AJOUTÉ");
  };

  const updateColorway = async () => {
    if (!editingCwId || !cwForm.name.trim()) return;
    if (editing && !editingCwId.startsWith("temp-")) {
      const { error } = await supabase.from("product_colorways").update({
        name: cwForm.name.trim(),
        image_url: cwForm.image_url || null,
        stock_by_size: cwForm.stock_by_size,
      }).eq("id", editingCwId);
      if (error) { toast.error(error.message); return; }
    }
    setColorways(prev => prev.map(cw => cw.id === editingCwId ? { ...cw, name: cwForm.name.trim(), image_url: cwForm.image_url || null, stock_by_size: cwForm.stock_by_size } : cw));
    setEditingCwId(null);
    setCwForm({ name: "", image_url: "", stock_by_size: {} });
    toast.success("COLORIS MODIFIÉ");
  };

  const deleteColorway = async (id: string) => {
    if (!confirm("SUPPRIMER CE COLORIS ?")) return;
    if (!id.startsWith("temp-")) {
      await supabase.from("product_colorways").delete().eq("id", id);
    }
    setColorways(prev => prev.filter(cw => cw.id !== id));
    toast.success("COLORIS SUPPRIMÉ");
  };

  const startEditCw = (cw: ProductColorway) => {
    setEditingCwId(cw.id);
    setCwForm({ name: cw.name, image_url: cw.image_url || "", stock_by_size: cw.stock_by_size });
  };

  const getBrandName = (id: string | null, fallback?: string | null) => brands.find(b => b.id === id)?.name || fallback || "—";

  const formatStock = (p: AdminProduct) => {
    const sbs = parseSbs(p.stock_by_size);
    const total = Object.keys(sbs).length > 0 ? calcTotalFromSizes(sbs) : (p.stock_quantity || 0);
    return `${total} PCS`;
  };

  return (
    <div className="space-y-6">
      <div className="admin-card rounded-none p-5">
        <div className="mb-5 flex flex-col gap-4 border-b border-[hsl(var(--admin-accent)/0.2)] pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">CATALOGUE</p>
            <h2 className="font-adminDisplay text-3xl text-[hsl(var(--admin-foreground))]">PRODUITS ({products.length})</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--admin-muted-foreground))]" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="RECHERCHER UN PRODUIT" className="admin-input pl-10" />
            </div>
            <Button onClick={startAdd} className="admin-button h-11 rounded-none px-5 font-adminDisplay text-sm tracking-[0.18em]">
              <Plus className="h-4 w-4" /> AJOUTER
            </Button>
          </div>
        </div>

        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow className="border-[hsl(var(--admin-accent)/0.2)] hover:bg-transparent">
                <TableHead className="admin-kicker text-[11px] text-[hsl(var(--admin-muted-foreground))]">NOM</TableHead>
                <TableHead className="admin-kicker text-[11px] text-[hsl(var(--admin-muted-foreground))]">MARQUE</TableHead>
                <TableHead className="admin-kicker text-[11px] text-[hsl(var(--admin-muted-foreground))]">CATÉGORIE</TableHead>
                <TableHead className="admin-kicker text-[11px] text-[hsl(var(--admin-muted-foreground))]">PRIX</TableHead>
                <TableHead className="admin-kicker text-[11px] text-[hsl(var(--admin-muted-foreground))]">STOCK</TableHead>
                <TableHead className="admin-kicker text-right text-[11px] text-[hsl(var(--admin-muted-foreground))]">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((p) => {
                const total = p.stock_quantity || 0;
                const lowStock = total > 0 && total <= 3;

                return (
                  <TableRow key={p.id} className="border-[hsl(var(--admin-accent)/0.12)] bg-transparent hover:bg-[hsl(var(--admin-accent)/0.04)]">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {p.image_url ? <img src={p.image_url} alt={p.name} className="h-12 w-12 object-cover" /> : null}
                        <div>
                          <p className="font-adminDisplay text-lg text-[hsl(var(--admin-foreground))]">{p.name}</p>
                          {p.description ? <p className="line-clamp-1 text-xs uppercase tracking-[0.12em] text-[hsl(var(--admin-muted-foreground))]">{p.description}</p> : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm uppercase tracking-[0.16em] text-[hsl(var(--admin-foreground))]">{getBrandName(p.brand_id, p.brand)}</TableCell>
                    <TableCell className="text-sm uppercase tracking-[0.16em] text-[hsl(var(--admin-muted-foreground))]">{p.category || "—"}</TableCell>
                    <TableCell className="text-sm uppercase tracking-[0.16em] text-[hsl(var(--admin-foreground))]">{formatPrice(p.price)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm uppercase tracking-[0.16em] ${lowStock ? "text-destructive" : "text-[hsl(var(--admin-foreground))]"}`}>
                          {formatStock(p)}
                        </span>
                        {lowStock ? <AlertTriangle className="h-4 w-4 text-destructive" /> : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(p)} className="admin-button-secondary rounded-none border-[hsl(var(--admin-accent)/0.24)]">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(p.id)} className="rounded-none border-destructive/40 bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="grid gap-4 lg:hidden">
          {filteredProducts.map((p) => {
            const total = p.stock_quantity || 0;
            const lowStock = total > 0 && total <= 3;

            return (
              <article key={p.id} className="border border-[hsl(var(--admin-accent)/0.16)] bg-[hsl(var(--admin-background))] p-4">
                <div className="flex gap-4">
                  {p.image_url ? <img src={p.image_url} alt={p.name} className="h-20 w-20 object-cover" /> : <div className="h-20 w-20 border border-[hsl(var(--admin-accent)/0.18)] bg-[hsl(var(--admin-card))]" />}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-adminDisplay text-xl leading-tight text-[hsl(var(--admin-foreground))]">{p.name}</h3>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[hsl(var(--admin-muted-foreground))]">{getBrandName(p.brand_id, p.brand)} • {p.category || "—"}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-sm uppercase tracking-[0.14em] text-[hsl(var(--admin-foreground))]">{formatPrice(p.price)}</span>
                      <span className={`text-sm uppercase tracking-[0.14em] ${lowStock ? "text-destructive" : "text-[hsl(var(--admin-foreground))]"}`}>{formatStock(p)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => startEdit(p)} className="admin-button-secondary h-10 flex-1 rounded-none font-adminDisplay tracking-[0.16em]">MODIFIER</Button>
                  <Button onClick={() => handleDelete(p.id)} className="h-10 rounded-none border border-destructive/40 bg-transparent font-adminDisplay tracking-[0.16em] text-destructive hover:bg-destructive hover:text-destructive-foreground">SUPPRIMER</Button>
                </div>
              </article>
            );
          })}
        </div>

        {!filteredProducts.length ? <div className="mt-4 border border-dashed border-[hsl(var(--admin-accent)/0.18)] p-5 text-center text-sm uppercase tracking-[0.18em] text-[hsl(var(--admin-muted-foreground))]">AUCUN PRODUIT TROUVÉ</div> : null}
      </div>

      <Dialog open={open} onOpenChange={(next) => !next ? cancel() : setOpen(true)}>
        <DialogContent className="admin-card max-h-[90vh] max-w-3xl overflow-y-auto rounded-none border-[hsl(var(--admin-accent)/0.25)] bg-[hsl(var(--admin-card))] p-0 text-[hsl(var(--admin-foreground))]">
          <div className="border-b border-[hsl(var(--admin-accent)/0.18)] p-6">
            <DialogHeader>
              <DialogTitle className="font-adminDisplay text-3xl text-[hsl(var(--admin-foreground))]">{editing ? "MODIFIER PRODUIT" : "AJOUTER PRODUIT"}</DialogTitle>
              <DialogDescription className="text-sm uppercase tracking-[0.14em] text-[hsl(var(--admin-muted-foreground))]">
                GÉREZ LE CATALOGUE PREMIUM DESMET ÉQUIPEMENT.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="grid gap-5 p-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">MODÈLE</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="EX: RX-7V EVO, QUANTIC" className="admin-input" />
            </div>
            <div className="space-y-2">
              <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">MARQUE</Label>
              <Select value={form.brand_id || "none"} onValueChange={(value) => setForm({ ...form, brand_id: value === "none" ? "" : value })}>
                <SelectTrigger className="admin-input rounded-none"><SelectValue placeholder="SÉLECTIONNER" /></SelectTrigger>
                <SelectContent className="border-[hsl(var(--admin-accent)/0.2)] bg-[hsl(var(--admin-card))] text-[hsl(var(--admin-foreground))]">
                  <SelectItem value="none">AUCUNE MARQUE</SelectItem>
                  {brands.map((brand) => <SelectItem key={brand.id} value={brand.id}>{brand.name.toUpperCase()}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">CATÉGORIE</Label>
              <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                <SelectTrigger className="admin-input rounded-none"><SelectValue placeholder="SÉLECTIONNER" /></SelectTrigger>
                <SelectContent className="border-[hsl(var(--admin-accent)/0.2)] bg-[hsl(var(--admin-card))] text-[hsl(var(--admin-foreground))]">
                  {CATEGORY_OPTIONS.map((category) => <SelectItem key={category} value={category}>{category.toUpperCase()}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">PRIX €</Label>
              <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" className="admin-input" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">DESCRIPTION</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="DESCRIPTION COURTE" className="admin-input min-h-[120px]" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">IMAGE PRINCIPALE (OPTIONNELLE)</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className="admin-input" />
            </div>
            <div className="md:col-span-2">
              <ImageUploadSingle value={form.image_url} onChange={(value) => setForm({ ...form, image_url: value })} folder="products" label="OU IMPORTER UNE IMAGE" previewClass="h-28 w-28" />
            </div>

            {/* ─── COLORWAYS SECTION ─── */}
            <div className="md:col-span-2 mt-4 border-t border-[hsl(var(--admin-accent)/0.18)] pt-5">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-5 w-5 text-[hsl(var(--admin-accent))]" />
                <h3 className="font-adminDisplay text-xl text-[hsl(var(--admin-foreground))]">COLORIS ({colorways.length})</h3>
              </div>
              <p className="text-xs uppercase tracking-[0.14em] text-[hsl(var(--admin-muted-foreground))] mb-4">
                STOCK TOTAL TOUS COLORIS : <span className="text-[hsl(var(--admin-accent))]">{getTotalStock()} PCS</span>
              </p>

              {/* Existing colorways list */}
              {colorways.length > 0 && (
                <div className="space-y-3 mb-5">
                  {colorways.map(cw => {
                    const cwTotal = calcTotalFromSizes(cw.stock_by_size);
                    return (
                      <div key={cw.id} className="flex items-center gap-3 border border-[hsl(var(--admin-accent)/0.16)] p-3 bg-[hsl(var(--admin-background))]">
                        {cw.image_url ? (
                          <img src={cw.image_url} alt={cw.name} className="h-14 w-14 object-cover" />
                        ) : (
                          <div className="h-14 w-14 border border-[hsl(var(--admin-accent)/0.2)] flex items-center justify-center bg-[hsl(var(--admin-card))]">
                            <span className="text-[10px] text-[hsl(var(--admin-muted-foreground))]">IMG</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-adminDisplay text-sm text-[hsl(var(--admin-foreground))]">{cw.name}</p>
                          <p className="text-xs text-[hsl(var(--admin-muted-foreground))] uppercase tracking-wider">{cwTotal} PCS</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => startEditCw(cw)} className="admin-button-secondary rounded-none h-8 px-3">
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteColorway(cw.id)} className="rounded-none h-8 px-3 border-destructive/40 bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add/Edit colorway form */}
              <div className="border border-dashed border-[hsl(var(--admin-accent)/0.25)] p-4 space-y-3">
                <p className="admin-kicker text-xs text-[hsl(var(--admin-accent))]">{editingCwId ? "MODIFIER COLORIS" : "AJOUTER UN COLORIS"}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wider text-[hsl(var(--admin-muted-foreground))]">NOM DU COLORIS</Label>
                    <Input value={cwForm.name} onChange={(e) => setCwForm({ ...cwForm, name: e.target.value })} placeholder="EX: DIAMOND WHITE" className="admin-input" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wider text-[hsl(var(--admin-muted-foreground))]">URL IMAGE</Label>
                    <Input value={cwForm.image_url} onChange={(e) => setCwForm({ ...cwForm, image_url: e.target.value })} placeholder="https://..." className="admin-input" />
                  </div>
                </div>
                <div>
                  <ImageUploadSingle value={cwForm.image_url} onChange={(v) => setCwForm({ ...cwForm, image_url: v })} folder="products" label="IMPORTER IMAGE COLORIS" previewClass="h-20 w-20" />
                </div>
                {form.category !== "Accessoires" && (
                  <div>
                    <Label className="text-[10px] uppercase tracking-wider text-[hsl(var(--admin-muted-foreground))] mb-2 block">STOCK PAR TAILLE</Label>
                    <SizeStockGrid
                      category={form.category}
                      value={cwForm.stock_by_size}
                      onChange={(v) => setCwForm({ ...cwForm, stock_by_size: v })}
                    />
                  </div>
                )}
                {form.category === "Accessoires" && (
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wider text-[hsl(var(--admin-muted-foreground))]">STOCK (SANS TAILLE)</Label>
                    <Input
                      type="number" min="0" step="1"
                      value={cwForm.stock_by_size["unique"] ?? 0}
                      onChange={(e) => setCwForm({ ...cwForm, stock_by_size: { unique: Math.max(0, parseInt(e.target.value) || 0) } })}
                      placeholder="0" className="admin-input w-32"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  {editingCwId ? (
                    <>
                      <Button onClick={updateColorway} className="admin-button h-9 rounded-none px-4 text-xs font-adminDisplay tracking-[0.16em]">
                        <Save className="h-3 w-3" /> ENREGISTRER COLORIS
                      </Button>
                      <Button variant="outline" onClick={() => { setEditingCwId(null); setCwForm({ name: "", image_url: "", stock_by_size: {} }); }} className="admin-button-secondary h-9 rounded-none px-4 text-xs font-adminDisplay tracking-[0.16em]">
                        ANNULER
                      </Button>
                    </>
                  ) : (
                    <Button onClick={addColorway} className="admin-button h-9 rounded-none px-4 text-xs font-adminDisplay tracking-[0.16em]">
                      <Plus className="h-3 w-3" /> AJOUTER COLORIS
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-[hsl(var(--admin-accent)/0.18)] p-6 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={cancel} className="admin-button-secondary h-11 rounded-none px-5 font-adminDisplay tracking-[0.18em]">ANNULER</Button>
            <Button onClick={handleSave} disabled={saving} className="admin-button h-11 rounded-none px-5 font-adminDisplay tracking-[0.18em]">
              <Save className="h-4 w-4" /> {saving ? "ENREGISTREMENT..." : "ENREGISTRER"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
