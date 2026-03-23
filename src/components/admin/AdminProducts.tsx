import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { AlertTriangle, Pencil, Plus, Save, Search, Trash2 } from "lucide-react";
import { ImageUploadSingle } from "./ImageUpload";
import type { AdminBrand, AdminProduct } from "./types";

interface AdminProductsProps {
  brands: AdminBrand[];
  onRefresh: () => Promise<void>;
  products: AdminProduct[];
}

const CATEGORY_OPTIONS = ["Casques", "Blousons", "Gants", "Bottes", "Combinaisons"] as const;

const formatPrice = (price?: number | null) =>
  typeof price === "number"
    ? new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" }).format(price)
    : "Prix non défini";

const formatStock = (stock?: number | null) => `${stock || 0} PCS`;

export default function AdminProducts({ products, brands, onRefresh }: AdminProductsProps) {
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    reference_code: "",
    name: "",
    description: "",
    brand_id: "",
    category: "Casques",
    price: "",
    stock_quantity: "0",
    image_url: "",
  });

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) =>
      [product.reference_code, product.name, product.brand, product.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [products, search]);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("NOM REQUIS"); return; }

    setSaving(true);
    const selectedBrand = brands.find((brand) => brand.id === form.brand_id);
    const payload: any = {
      reference_code: form.reference_code.trim() || null,
      name: form.name,
      description: form.description || null,
      brand_id: form.brand_id || null,
      brand: selectedBrand?.name || null,
      category: form.category,
      price: form.price ? Number(form.price) : null,
      stock_quantity: Number(form.stock_quantity) || 0,
      in_stock: (Number(form.stock_quantity) || 0) > 0,
      image_url: form.image_url || null,
      images: form.image_url ? [form.image_url] : [],
    };

    if (editing) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) { setSaving(false); toast.error("ERREUR : " + error.message.toUpperCase()); return; }
      toast.success("PRODUIT MODIFIÉ");
    } else {
      const { error } = await supabase.from("products").insert({ ...payload, sort_order: products.length + 1 });
      if (error) { setSaving(false); toast.error("ERREUR : " + error.message.toUpperCase()); return; }
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
      reference_code: p.reference_code || "",
      name: p.name,
      description: p.description || "",
      brand_id: p.brand_id || "",
      category: p.category || "Casques",
      price: typeof p.price === "number" ? String(p.price) : "",
      stock_quantity: String(p.stock_quantity || 0),
      image_url: p.image_url || "",
    });
  };

  const startAdd = () => {
    setEditing(null);
    setOpen(true);
    setForm({ reference_code: "", name: "", description: "", brand_id: "", category: "Casques", price: "", stock_quantity: "0", image_url: "" });
  };

  const cancel = () => {
    setEditing(null);
    setOpen(false);
  };

  const getBrandName = (id: string | null, fallback?: string | null) => brands.find(b => b.id === id)?.name || fallback || "—";

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
                <TableHead className="admin-kicker text-[11px] text-[hsl(var(--admin-muted-foreground))]">RÉFÉRENCE</TableHead>
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
                const lowStock = (p.stock_quantity || 0) > 0 && (p.stock_quantity || 0) <= 3;

                return (
                  <TableRow key={p.id} className="border-[hsl(var(--admin-accent)/0.12)] bg-transparent hover:bg-[hsl(var(--admin-accent)/0.04)]">
                    <TableCell className="font-adminBody text-xs uppercase tracking-[0.16em] text-[hsl(var(--admin-muted-foreground))]">{p.reference_code || "—"}</TableCell>
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
                          {formatStock(p.stock_quantity)}
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
            const lowStock = (p.stock_quantity || 0) > 0 && (p.stock_quantity || 0) <= 3;

            return (
              <article key={p.id} className="border border-[hsl(var(--admin-accent)/0.16)] bg-[hsl(var(--admin-background))] p-4">
                <div className="flex gap-4">
                  {p.image_url ? <img src={p.image_url} alt={p.name} className="h-20 w-20 object-cover" /> : <div className="h-20 w-20 border border-[hsl(var(--admin-accent)/0.18)] bg-[hsl(var(--admin-card))]" />}
                  <div className="min-w-0 flex-1">
                    <p className="admin-kicker text-[11px] text-[hsl(var(--admin-accent))]">{p.reference_code || "SANS RÉFÉRENCE"}</p>
                    <h3 className="font-adminDisplay text-xl leading-tight text-[hsl(var(--admin-foreground))]">{p.name}</h3>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[hsl(var(--admin-muted-foreground))]">{getBrandName(p.brand_id, p.brand)} • {p.category || "—"}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-sm uppercase tracking-[0.14em] text-[hsl(var(--admin-foreground))]">{formatPrice(p.price)}</span>
                      <span className={`text-sm uppercase tracking-[0.14em] ${lowStock ? "text-destructive" : "text-[hsl(var(--admin-foreground))]"}`}>{formatStock(p.stock_quantity)}</span>
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
        <DialogContent className="admin-card max-w-3xl rounded-none border-[hsl(var(--admin-accent)/0.25)] bg-[hsl(var(--admin-card))] p-0 text-[hsl(var(--admin-foreground))]">
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
              <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">RÉFÉRENCE</Label>
              <Input value={form.reference_code} onChange={(e) => setForm({ ...form, reference_code: e.target.value })} placeholder="EX: ARAI-RX7-01" className="admin-input" />
            </div>
            <div className="space-y-2">
              <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">NOM</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="NOM DU PRODUIT" className="admin-input" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">DESCRIPTION</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="DESCRIPTION COURTE" className="admin-input min-h-[120px]" />
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
            <div className="space-y-2">
              <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">STOCK</Label>
              <Input type="number" min="0" step="1" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} placeholder="0" className="admin-input" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">URL IMAGE</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className="admin-input" />
            </div>
            <div className="md:col-span-2">
              <ImageUploadSingle value={form.image_url} onChange={(value) => setForm({ ...form, image_url: value })} folder="products" label="OU IMPORTER UNE IMAGE" previewClass="h-28 w-28" />
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
