import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { ImageUploadSingle } from "./ImageUpload";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products"> & {
  price?: number | null;
  in_stock?: boolean | null;
  brand?: string | null;
};
type Brand = Tables<"brands">;

const CATEGORY_OPTIONS = ["casques", "vestes", "gants", "bottes", "accessoires"] as const;

const formatPrice = (price?: number | null) =>
  typeof price === "number"
    ? new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" }).format(price)
    : "Prix non défini";

const formatCategory = (category?: string | null) =>
  category ? category.charAt(0).toUpperCase() + category.slice(1) : "Sans catégorie";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", brand_id: "", category: "casques", price: "", image_url: "", in_stock: true });

  const load = async () => {
    const [{ data: p }, { data: b }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("brands").select("*").order("name"),
    ]);
    if (p) setProducts(p as Product[]);
    if (b) setBrands(b);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Le nom est requis"); return; }
    const selectedBrand = brands.find((brand) => brand.id === form.brand_id);
    const payload: any = {
      name: form.name,
      description: form.description || null,
      brand_id: form.brand_id || null,
      brand: selectedBrand?.name || null,
      category: form.category,
      price: form.price ? Number(form.price) : null,
      image_url: form.image_url || null,
      images: form.image_url ? [form.image_url] : [],
      in_stock: form.in_stock,
    };
    if (editing) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) { toast.error("Erreur: " + error.message); return; }
      toast.success("Produit modifié");
    } else {
      const { error } = await supabase.from("products").insert({ ...payload, sort_order: products.length + 1 });
      if (error) { toast.error("Erreur: " + error.message); return; }
      toast.success("Produit ajouté");
    }
    cancel(); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error("Erreur: " + error.message); return; }
    toast.success("Produit supprimé"); load();
  };

  const startEdit = (p: Product) => {
    setEditing(p); setAdding(false);
    setForm({
      name: p.name,
      description: p.description || "",
      brand_id: p.brand_id || "",
      category: p.category || "casques",
      price: typeof p.price === "number" ? String(p.price) : "",
      image_url: p.image_url || "",
      in_stock: p.in_stock !== false,
    });
  };

  const startAdd = () => { setAdding(true); setEditing(null); setForm({ name: "", description: "", brand_id: "", category: "casques", price: "", image_url: "", in_stock: true }); };
  const cancel = () => { setAdding(false); setEditing(null); };

  const getBrandName = (id: string | null, fallback?: string | null) => brands.find(b => b.id === id)?.name || fallback || "—";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-foreground">PRODUITS ({products.length})</h2>
        <Button size="sm" onClick={startAdd}><Plus className="w-4 h-4 mr-2" /> Ajouter</Button>
      </div>

      {(adding || editing) && (
        <div className="bg-card border border-primary/30 rounded-lg p-6 mb-6 space-y-4">
          <h3 className="font-display text-lg text-foreground">{editing ? "Modifier" : "Nouveau"} produit</h3>
          <Input placeholder="Nom" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-secondary border-border" />
          <Textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="bg-secondary border-border" />
          <Select value={form.brand_id || "none"} onValueChange={v => setForm({...form, brand_id: v === "none" ? "" : v})}>
            <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Marque" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucune marque</SelectItem>
              {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
            <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Catégorie" /></SelectTrigger>
            <SelectContent>{CATEGORY_OPTIONS.map(category => <SelectItem key={category} value={category}>{formatCategory(category)}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="number" min="0" step="0.01" placeholder="Prix" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="bg-secondary border-border" />
          <ImageUploadSingle value={form.image_url} onChange={v => setForm({...form, image_url: v})} folder="products" label="Image du produit" />
          <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary px-4 py-3">
            <Switch checked={form.in_stock} onCheckedChange={v => setForm({...form, in_stock: v})} />
            <span className="text-sm text-foreground">Produit en stock</span>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Enregistrer</Button>
            <Button variant="outline" onClick={cancel}><X className="w-4 h-4 mr-2" /> Annuler</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {products.map(p => (
          <div key={p.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {p.image_url && <img src={p.image_url} alt={p.name} className="w-12 h-12 object-cover rounded" />}
              <div className="min-w-0">
                <p className="text-foreground font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{getBrandName(p.brand_id, p.brand)} • {formatCategory(p.category)} • {formatPrice(p.price)}</p>
                  <p className="text-xs text-muted-foreground">{p.in_stock === false ? "Rupture de stock" : "En stock"}</p>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => startEdit(p)}><Pencil className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
