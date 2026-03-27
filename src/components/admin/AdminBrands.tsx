import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Save, ArrowUp, ArrowDown } from "lucide-react";
import { ImageUploadSingle } from "./ImageUpload";
import type { Tables } from "@/integrations/supabase/types";

type Brand = Tables<"brands"> & {
  country?: string | null;
  founded_year?: number | null;
  categories?: string[] | null;
  website_url?: string | null;
};

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", country: "", founded_year: "", description: "", categories: "", website_url: "", logo_url: "" });

  const load = async () => {
    const { data } = await supabase.from("brands").select("*").order("sort_order");
    if (data) setBrands(data);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Le nom est requis"); return; }
    const categories = form.categories.split(",").map((value) => value.trim()).filter(Boolean);
    const payload: any = {
      name: form.name,
      country: form.country || null,
      founded_year: form.founded_year ? Number(form.founded_year) : null,
      description: form.description || null,
      category: categories[0] || null,
      categories,
      website_url: form.website_url || null,
      logo_url: form.logo_url || null,
    };
    if (editing) {
      const { error } = await supabase.from("brands").update(payload).eq("id", editing.id);
      if (error) { toast.error("Erreur: " + error.message); return; }
      toast.success("Marque modifiée");
    } else {
      const { error } = await supabase.from("brands").insert({ ...payload, sort_order: brands.length + 1 });
      if (error) { toast.error("Erreur: " + error.message); return; }
      toast.success("Marque ajoutée");
    }
    setEditing(null); setAdding(false);
    setForm({ name: "", country: "", founded_year: "", description: "", categories: "", website_url: "", logo_url: "" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette marque ?")) return;
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) { toast.error("Erreur: " + error.message); return; }
    toast.success("Marque supprimée");
    load();
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= brands.length) return;
    const a = brands[index];
    const b = brands[swapIdx];
    const aOrder = a.sort_order ?? index;
    const bOrder = b.sort_order ?? swapIdx;
    await Promise.all([
      supabase.from("brands").update({ sort_order: bOrder }).eq("id", a.id),
      supabase.from("brands").update({ sort_order: aOrder }).eq("id", b.id),
    ]);
    load();
  };

  const startEdit = (b: Brand) => {
    setEditing(b); setAdding(false);
    setForm({
      name: b.name,
      country: b.country || "",
      founded_year: b.founded_year ? String(b.founded_year) : "",
      description: b.description || "",
      categories: (b.categories || (b.category ? [b.category] : [])).join(", "),
      website_url: b.website_url || "",
      logo_url: b.logo_url || "",
    });
  };

  const startAdd = () => {
    setAdding(true); setEditing(null);
    setForm({ name: "", country: "", founded_year: "", description: "", categories: "", website_url: "", logo_url: "" });
  };

  const cancel = () => { setAdding(false); setEditing(null); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-foreground">MARQUES ({brands.length})</h2>
        <Button size="sm" onClick={startAdd}><Plus className="w-4 h-4 mr-2" /> Ajouter</Button>
      </div>

      {(adding || editing) && (
        <div className="bg-card border border-primary/30 rounded-lg p-6 mb-6 space-y-4">
          <h3 className="font-display text-lg text-foreground">{editing ? "Modifier" : "Nouvelle"} marque</h3>
          <Input placeholder="Nom" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-secondary border-border" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Pays" value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="bg-secondary border-border" />
            <Input type="number" placeholder="Année de fondation" value={form.founded_year} onChange={e => setForm({...form, founded_year: e.target.value})} className="bg-secondary border-border" />
          </div>
          <Textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="bg-secondary border-border" />
          <Input placeholder="Catégories (séparées par des virgules)" value={form.categories} onChange={e => setForm({...form, categories: e.target.value})} className="bg-secondary border-border" />
          <Input placeholder="Site officiel" value={form.website_url} onChange={e => setForm({...form, website_url: e.target.value})} className="bg-secondary border-border" />
          <ImageUploadSingle value={form.logo_url} onChange={v => setForm({...form, logo_url: v})} folder="brands" label="Logo de la marque" />
          <div className="flex gap-2">
            <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Enregistrer</Button>
            <Button variant="outline" onClick={cancel}><X className="w-4 h-4 mr-2" /> Annuler</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {brands.map(b => (
          <div key={b.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {b.logo_url && <img src={b.logo_url} alt={b.name} className="w-10 h-10 object-contain rounded" />}
              <div className="min-w-0">
                <p className="text-foreground font-medium truncate">{b.name}</p>
                <p className="text-xs text-muted-foreground truncate">{[b.country, b.founded_year ? String(b.founded_year) : null, (b.categories || (b.category ? [b.category] : [])).join(", ")].filter(Boolean).join(" • ")}</p>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => startEdit(b)}><Pencil className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(b.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
