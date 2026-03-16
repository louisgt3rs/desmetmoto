import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, X, Save, GripVertical, ChevronDown, ChevronRight,
  Upload, Image as ImageIcon, Loader2,
} from "lucide-react";

/* ───── types ───── */
interface HelmetModel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sizes: string[] | null;
  sort_order: number | null;
  is_published: boolean | null;
}

interface Colorway {
  id: string;
  model_id: string;
  name: string;
  slug: string;
  available: boolean | null;
  thumbnail_url: string | null;
  main_image_url: string | null;
  gallery_images: string[] | null;
  images_360: string[] | null;
  sort_order: number | null;
}

/* ───── helpers ───── */
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function uploadFile(file: File, folder: string): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("images").upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) { toast.error("Erreur upload: " + error.message); return null; }
  const { data } = supabase.storage.from("images").getPublicUrl(path);
  return data.publicUrl;
}

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════ */
export default function AdminHelmetModels() {
  const [models, setModels] = useState<HelmetModel[]>([]);
  const [colorways, setColorways] = useState<Record<string, Colorway[]>>({});
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  /* model form */
  const [editingModel, setEditingModel] = useState<HelmetModel | null>(null);
  const [addingModel, setAddingModel] = useState(false);
  const [modelForm, setModelForm] = useState({ name: "", description: "", sizes: "", is_published: true });

  /* colorway form */
  const [editingCw, setEditingCw] = useState<Colorway | null>(null);
  const [addingCwFor, setAddingCwFor] = useState<string | null>(null);
  const [cwForm, setCwForm] = useState({ name: "", available: true, thumbnail_url: "", main_image_url: "", gallery_images: "", images_360: "" });

  const [uploading, setUploading] = useState(false);

  /* ── load ── */
  const load = useCallback(async () => {
    const { data: m } = await supabase.from("helmet_models").select("*").order("sort_order");
    if (m) setModels(m as HelmetModel[]);
    const { data: cw } = await supabase.from("helmet_colorways").select("*").order("sort_order");
    if (cw) {
      const grouped: Record<string, Colorway[]> = {};
      (cw as Colorway[]).forEach(c => {
        if (!grouped[c.model_id]) grouped[c.model_id] = [];
        grouped[c.model_id].push(c);
      });
      setColorways(grouped);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── MODEL CRUD ── */
  const startAddModel = () => {
    setAddingModel(true); setEditingModel(null);
    setModelForm({ name: "", description: "", sizes: "", is_published: true });
  };
  const startEditModel = (m: HelmetModel) => {
    setEditingModel(m); setAddingModel(false);
    setModelForm({ name: m.name, description: m.description || "", sizes: (m.sizes || []).join(", "), is_published: m.is_published !== false });
  };
  const cancelModel = () => { setAddingModel(false); setEditingModel(null); };

  const saveModel = async () => {
    if (!modelForm.name.trim()) { toast.error("Le nom est requis"); return; }
    const payload = {
      name: modelForm.name,
      slug: slugify(modelForm.name),
      description: modelForm.description || null,
      sizes: modelForm.sizes.split(",").map(s => s.trim()).filter(Boolean),
      is_published: modelForm.is_published,
    };
    if (editingModel) {
      const { error } = await supabase.from("helmet_models").update(payload).eq("id", editingModel.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Modèle modifié");
    } else {
      const { error } = await supabase.from("helmet_models").insert({ ...payload, sort_order: models.length });
      if (error) { toast.error(error.message); return; }
      toast.success("Modèle ajouté");
    }
    cancelModel(); load();
  };

  const deleteModel = async (id: string) => {
    if (!confirm("Supprimer ce modèle et tous ses coloris ?")) return;
    const { error } = await supabase.from("helmet_models").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Modèle supprimé"); load();
  };

  /* ── COLORWAY CRUD ── */
  const startAddCw = (modelId: string) => {
    setAddingCwFor(modelId); setEditingCw(null);
    setCwForm({ name: "", available: true, thumbnail_url: "", main_image_url: "", gallery_images: "", images_360: "" });
  };
  const startEditCw = (c: Colorway) => {
    setEditingCw(c); setAddingCwFor(null);
    setCwForm({
      name: c.name, available: c.available !== false,
      thumbnail_url: c.thumbnail_url || "", main_image_url: c.main_image_url || "",
      gallery_images: (c.gallery_images || []).join("\n"),
      images_360: (c.images_360 || []).join("\n"),
    });
  };
  const cancelCw = () => { setAddingCwFor(null); setEditingCw(null); };

  const saveCw = async (modelId: string) => {
    if (!cwForm.name.trim()) { toast.error("Le nom du coloris est requis"); return; }
    const payload = {
      model_id: modelId,
      name: cwForm.name,
      slug: slugify(cwForm.name),
      available: cwForm.available,
      thumbnail_url: cwForm.thumbnail_url || null,
      main_image_url: cwForm.main_image_url || null,
      gallery_images: cwForm.gallery_images.split("\n").map(s => s.trim()).filter(Boolean),
      images_360: cwForm.images_360.split("\n").map(s => s.trim()).filter(Boolean),
    };
    if (editingCw) {
      const { error } = await supabase.from("helmet_colorways").update(payload).eq("id", editingCw.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Coloris modifié");
    } else {
      const existing = colorways[modelId] || [];
      const { error } = await supabase.from("helmet_colorways").insert({ ...payload, sort_order: existing.length });
      if (error) { toast.error(error.message); return; }
      toast.success("Coloris ajouté");
    }
    cancelCw(); load();
  };

  const deleteCw = async (id: string) => {
    if (!confirm("Supprimer ce coloris ?")) return;
    const { error } = await supabase.from("helmet_colorways").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Coloris supprimé"); load();
  };

  /* ── IMAGE UPLOAD ── */
  const handleImageUpload = async (field: "thumbnail_url" | "main_image_url", file: File) => {
    setUploading(true);
    const url = await uploadFile(file, "helmets");
    setUploading(false);
    if (url) setCwForm(f => ({ ...f, [field]: url }));
  };

  const handleMultiUpload = async (field: "gallery_images" | "images_360", files: FileList) => {
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadFile(file, field === "images_360" ? "helmets/360" : "helmets/gallery");
      if (url) urls.push(url);
    }
    setUploading(false);
    setCwForm(f => {
      const existing = f[field].split("\n").filter(Boolean);
      return { ...f, [field]: [...existing, ...urls].join("\n") };
    });
  };

  /* ────────── RENDER ────────── */
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-foreground">CASQUES ARAI ({models.length})</h2>
        <Button size="sm" onClick={startAddModel}><Plus className="w-4 h-4 mr-2" /> Ajouter un modèle</Button>
      </div>

      {/* MODEL FORM */}
      {(addingModel || editingModel) && (
        <div className="bg-card border border-primary/30 rounded-lg p-6 mb-6 space-y-4">
          <h3 className="font-display text-lg text-foreground">{editingModel ? "Modifier" : "Nouveau"} modèle</h3>
          <Input placeholder="Nom (ex: RX-7V EVO)" value={modelForm.name} onChange={e => setModelForm({ ...modelForm, name: e.target.value })} className="bg-secondary border-border" />
          <Textarea placeholder="Description" value={modelForm.description} onChange={e => setModelForm({ ...modelForm, description: e.target.value })} className="bg-secondary border-border" />
          <Input placeholder="Tailles (XS, S, M, L, XL, XXL)" value={modelForm.sizes} onChange={e => setModelForm({ ...modelForm, sizes: e.target.value })} className="bg-secondary border-border" />
          <div className="flex items-center gap-2">
            <Switch checked={modelForm.is_published} onCheckedChange={v => setModelForm({ ...modelForm, is_published: v })} />
            <Label className="text-sm text-muted-foreground">Publié</Label>
          </div>
          <div className="flex gap-2">
            <Button onClick={saveModel}><Save className="w-4 h-4 mr-2" /> Enregistrer</Button>
            <Button variant="outline" onClick={cancelModel}><X className="w-4 h-4 mr-2" /> Annuler</Button>
          </div>
        </div>
      )}

      {/* MODEL LIST */}
      <div className="space-y-4">
        {models.map(m => {
          const isExpanded = expandedModel === m.id;
          const mColorways = colorways[m.id] || [];
          return (
            <div key={m.id} className="bg-card border border-border rounded-lg overflow-hidden">
              {/* Model header */}
              <div className="p-4 flex items-center justify-between gap-4 cursor-pointer" onClick={() => setExpandedModel(isExpanded ? null : m.id)}>
                <div className="flex items-center gap-3 min-w-0">
                  <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-foreground font-medium truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{(m.sizes || []).join(", ")} • {mColorways.length} coloris</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" onClick={() => startEditModel(m)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteModel(m.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>

              {/* Expanded: colorways */}
              {isExpanded && (
                <div className="border-t border-border p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">Coloris</h4>
                    <Button size="sm" variant="outline" onClick={() => startAddCw(m.id)}><Plus className="w-3 h-3 mr-1" /> Coloris</Button>
                  </div>

                  {/* CW FORM */}
                  {(addingCwFor === m.id || (editingCw && editingCw.model_id === m.id)) && (
                    <div className="bg-secondary/50 border border-border rounded-lg p-4 space-y-3">
                      <h5 className="text-sm font-medium text-foreground">{editingCw ? "Modifier" : "Nouveau"} coloris</h5>
                      <Input placeholder="Nom du coloris" value={cwForm.name} onChange={e => setCwForm({ ...cwForm, name: e.target.value })} className="bg-secondary border-border" />
                      <div className="flex items-center gap-2">
                        <Switch checked={cwForm.available} onCheckedChange={v => setCwForm({ ...cwForm, available: v })} />
                        <Label className="text-xs text-muted-foreground">Disponible</Label>
                      </div>

                      {/* Thumbnail */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Miniature</Label>
                        <div className="flex gap-2 items-center">
                          <Input placeholder="URL miniature" value={cwForm.thumbnail_url} onChange={e => setCwForm({ ...cwForm, thumbnail_url: e.target.value })} className="bg-secondary border-border flex-1 text-xs" />
                          <label className="cursor-pointer">
                            <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload("thumbnail_url", e.target.files[0])} />
                            <Button variant="outline" size="sm" asChild><span><Upload className="w-3 h-3" /></span></Button>
                          </label>
                        </div>
                        {cwForm.thumbnail_url && <img src={cwForm.thumbnail_url} alt="" className="w-12 h-12 object-cover rounded" />}
                      </div>

                      {/* Main image */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Image principale</Label>
                        <div className="flex gap-2 items-center">
                          <Input placeholder="URL image principale" value={cwForm.main_image_url} onChange={e => setCwForm({ ...cwForm, main_image_url: e.target.value })} className="bg-secondary border-border flex-1 text-xs" />
                          <label className="cursor-pointer">
                            <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload("main_image_url", e.target.files[0])} />
                            <Button variant="outline" size="sm" asChild><span><Upload className="w-3 h-3" /></span></Button>
                          </label>
                        </div>
                        {cwForm.main_image_url && <img src={cwForm.main_image_url} alt="" className="w-24 h-16 object-cover rounded" />}
                      </div>

                      {/* Gallery */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Galerie (une URL par ligne)</Label>
                        <Textarea placeholder="URLs des images galerie" value={cwForm.gallery_images} onChange={e => setCwForm({ ...cwForm, gallery_images: e.target.value })} rows={3} className="bg-secondary border-border text-xs" />
                        <label className="cursor-pointer inline-block">
                          <input type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && handleMultiUpload("gallery_images", e.target.files)} />
                          <Button variant="outline" size="sm" asChild><span><ImageIcon className="w-3 h-3 mr-1" /> Upload images</span></Button>
                        </label>
                      </div>

                      {/* 360 */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Images 360° (une URL par ligne, optionnel)</Label>
                        <Textarea placeholder="URLs des images 360°" value={cwForm.images_360} onChange={e => setCwForm({ ...cwForm, images_360: e.target.value })} rows={3} className="bg-secondary border-border text-xs" />
                        <label className="cursor-pointer inline-block">
                          <input type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && handleMultiUpload("images_360", e.target.files)} />
                          <Button variant="outline" size="sm" asChild><span><ImageIcon className="w-3 h-3 mr-1" /> Upload 360°</span></Button>
                        </label>
                      </div>

                      {uploading && <p className="text-xs text-primary flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Upload en cours…</p>}

                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveCw(m.id)}><Save className="w-3 h-3 mr-1" /> Enregistrer</Button>
                        <Button size="sm" variant="outline" onClick={cancelCw}><X className="w-3 h-3 mr-1" /> Annuler</Button>
                      </div>
                    </div>
                  )}

                  {/* CW LIST */}
                  {mColorways.length === 0 && <p className="text-xs text-muted-foreground">Aucun coloris ajouté.</p>}
                  {mColorways.map(c => (
                    <div key={c.id} className="bg-secondary/30 border border-border rounded-lg p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {c.thumbnail_url ? (
                          <img src={c.thumbnail_url} alt={c.name} className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center"><ImageIcon className="w-4 h-4 text-muted-foreground" /></div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm text-foreground truncate">{c.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.available !== false ? "✓ Disponible" : "✗ Indisponible"}
                            {(c.images_360 || []).length > 0 && " • 360°"}
                            {(c.gallery_images || []).length > 0 && ` • ${(c.gallery_images || []).length} photos`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => startEditCw(c)}><Pencil className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteCw(c.id)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
