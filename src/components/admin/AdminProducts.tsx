import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { ImageUploadSingle } from "./ImageUpload";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;
type Brand = Tables<"brands">;

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", brand_id: "", category: "", sizes: "", image_url: "", price_range: "" });

  const load = async () => {
    const [{ data: p }, { data: b }] = await Promise.all([
      supabase.from("products").select("*").order("sort_order"),
      supabase.from("brands").select("*").order("name"),
    ]);
    if (p) setProducts(p);
    if (b) setBrands(b);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Le nom est requis"); return; }
    const payload = {
      name: form.name, description: form.description,
      brand_id: form.brand_id || null, category: form.category,
      sizes: form.sizes.split(",").map(s => s.trim()).filter(Boolean),
      image_url: form.image_url || null, price_range: form.price_range || null,
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
      name: p.name, description: p.description || "", brand_id: p.brand_id || "",
      category: p.category || "", sizes: (p.sizes || []).join(", "),
      image_url: p.image_url || "", price_range: p.price_range || "",
    });
  };

  const startAdd = () => { setAdding(true); setEditing(null); setForm({ name: "", description: "", brand_id: "", category: "", sizes: "", image_url: "", price_range: "" }); };
  const cancel = () => { setAdding(false); setEditing(null); };

  const getBrandName = (id: string | null) => brands.find(b => b.id === id)?.name || "—";

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
          <Select value={form.brand_id} onValueChange={v => setForm({...form, brand_id: v})}>
            <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Marque" /></SelectTrigger>
            <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Catégorie" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="bg-secondary border-border" />
          <Input placeholder="Tailles (séparées par des virgules: XS, S, M, L)" value={form.sizes} onChange={e => setForm({...form, sizes: e.target.value})} className="bg-secondary border-border" />
          <ImageUploadSingle value={form.image_url} onChange={v => setForm({...form, image_url: v})} folder="products" label="Image du produit" />
          <Input placeholder="Fourchette de prix (optionnel)" value={form.price_range} onChange={e => setForm({...form, price_range: e.target.value})} className="bg-secondary border-border" />
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
                <p className="text-xs text-muted-foreground truncate">{getBrandName(p.brand_id)} • {p.category} • {(p.sizes || []).join(", ")}</p>
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
