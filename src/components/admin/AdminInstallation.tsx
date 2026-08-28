import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Save, X, Star, Sparkles, Loader2 } from "lucide-react";
import { ImageUploadSingle, ImageUploadMulti } from "./ImageUpload";

type InstBrand   = { id: string; name: string; sort_order: number };
type InstModel   = { id: string; brand_id: string; name: string; is_modular: boolean; is_coming_soon: boolean; sort_order: number };
type InstIntercom = { id: string; brand: string; name: string; image_url: string | null; is_coming_soon: boolean; sort_order: number; gallery_images: string[]; prix: number | null; description: string | null; stock: number | null; pack_duo: boolean; prix_duo: number | null; featured: boolean };
type InstAccessory = { id: string; name: string; brand: string; category: string; slug: string | null; image_url: string | null; gallery_images: string[]; prix: number | null; stock: number; description: string | null; is_coming_soon: boolean; featured: boolean; sort_order: number };

const kicker = "admin-kicker text-[10px] text-[hsl(var(--admin-muted-foreground))]";
const inp    = "admin-input h-9 text-sm";
const rowCls = "flex items-center justify-between gap-3 border border-[hsl(var(--admin-accent)/0.14)] bg-[hsl(var(--admin-background))] px-4 py-2.5";
const comingSoonBadge = "ml-2 text-[10px] uppercase tracking-[0.2em] font-adminDisplay text-[#c9973a]";
const moduleBadge = "ml-2 text-[10px] uppercase tracking-[0.2em] font-adminDisplay text-[hsl(var(--admin-muted-foreground))]";

/* ── small toggle ── */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className="relative w-8 h-4 rounded-full transition-colors"
        style={{ background: checked ? "#c9973a" : "rgba(255,255,255,0.12)" }}
      >
        <div
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform"
          style={{ left: checked ? "calc(100% - 14px)" : "2px" }}
        />
      </div>
      <span className="text-xs uppercase tracking-[0.18em] text-[hsl(var(--admin-muted-foreground))]">{label}</span>
    </label>
  );
}

/* ══════════════════ BRANDS TAB ══════════════════ */
function BrandsTab() {
  const [brands, setBrands] = useState<InstBrand[]>([]);
  const [editing, setEditing] = useState<InstBrand | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const load = async () => {
    const { data } = await supabase.from("installation_brands").select("*").order("sort_order");
    if (data) setBrands(data as InstBrand[]);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!name.trim()) { toast.error("NOM REQUIS"); return; }
    if (editing) {
      const { error } = await supabase.from("installation_brands").update({ name }).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("MARQUE MODIFIÉE");
    } else {
      const { error } = await supabase.from("installation_brands").insert({ name, sort_order: brands.length });
      if (error) { toast.error(error.message); return; }
      toast.success("MARQUE AJOUTÉE");
    }
    setAdding(false); setEditing(null); setName(""); load();
  };

  const del = async (id: string) => {
    if (!confirm("SUPPRIMER CETTE MARQUE ET TOUS SES MODÈLES ?")) return;
    const { error } = await supabase.from("installation_brands").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("MARQUE SUPPRIMÉE"); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className={kicker}>MARQUES DE CASQUES ({brands.length})</p>
        <Button onClick={() => { setAdding(true); setEditing(null); setName(""); }} className="admin-button h-9 rounded-none px-4 font-adminDisplay text-xs tracking-[0.16em]">
          <Plus className="h-3 w-3" /> AJOUTER
        </Button>
      </div>

      {(adding || editing) && (
        <div className="border border-[hsl(var(--admin-accent)/0.25)] bg-[hsl(var(--admin-card))] p-4 space-y-3">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Arai" className={inp} />
          <div className="flex gap-2">
            <Button onClick={save} className="admin-button h-9 rounded-none px-4 font-adminDisplay text-xs tracking-[0.16em]"><Save className="h-3 w-3" /> ENREGISTRER</Button>
            <Button onClick={() => { setAdding(false); setEditing(null); setName(""); }} className="admin-button-secondary h-9 rounded-none px-4 font-adminDisplay text-xs tracking-[0.16em]"><X className="h-3 w-3" /> ANNULER</Button>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {brands.map(b => (
          <div key={b.id} className={rowCls}>
            <span className="font-adminDisplay text-sm tracking-[0.12em] text-[hsl(var(--admin-foreground))]">{b.name}</span>
            <div className="flex gap-1">
              <Button onClick={() => { setEditing(b); setAdding(false); setName(b.name); }} className="h-8 w-8 rounded-none border border-[hsl(var(--admin-accent)/0.2)] bg-transparent p-0 text-[hsl(var(--admin-muted-foreground))] hover:text-[hsl(var(--admin-accent))]"><Pencil className="h-3 w-3" /></Button>
              <Button onClick={() => del(b.id)} className="h-8 w-8 rounded-none border border-destructive/30 bg-transparent p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="h-3 w-3" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════ MODELS TAB ══════════════════ */
function ModelsTab() {
  const [brands, setBrands] = useState<InstBrand[]>([]);
  const [models, setModels] = useState<InstModel[]>([]);
  const [editing, setEditing] = useState<InstModel | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ brand_id: "", name: "", is_modular: false, is_coming_soon: false });

  const load = async () => {
    const [{ data: b }, { data: m }] = await Promise.all([
      supabase.from("installation_brands").select("*").order("sort_order"),
      supabase.from("installation_models").select("*").order("brand_id").order("sort_order"),
    ]);
    if (b) setBrands(b as InstBrand[]);
    if (m) setModels(m as InstModel[]);
  };
  useEffect(() => { load(); }, []);

  const startAdd = () => {
    setAdding(true); setEditing(null);
    setForm({ brand_id: brands[0]?.id || "", name: "", is_modular: false, is_coming_soon: false });
  };

  const save = async () => {
    if (!form.brand_id || !form.name.trim()) { toast.error("MARQUE ET NOM REQUIS"); return; }
    if (editing) {
      const { error } = await supabase.from("installation_models").update(form).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("MODÈLE MODIFIÉ");
    } else {
      const { error } = await supabase.from("installation_models").insert({ ...form, sort_order: models.filter(m => m.brand_id === form.brand_id).length });
      if (error) { toast.error(error.message); return; }
      toast.success("MODÈLE AJOUTÉ");
    }
    setAdding(false); setEditing(null); load();
  };

  const del = async (id: string) => {
    if (!confirm("SUPPRIMER CE MODÈLE ?")) return;
    const { error } = await supabase.from("installation_models").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("MODÈLE SUPPRIMÉ"); load();
  };

  const brandName = (id: string) => brands.find(b => b.id === id)?.name || "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className={kicker}>MODÈLES ({models.length})</p>
        <Button onClick={startAdd} className="admin-button h-9 rounded-none px-4 font-adminDisplay text-xs tracking-[0.16em]">
          <Plus className="h-3 w-3" /> AJOUTER
        </Button>
      </div>

      {(adding || editing) && (
        <div className="border border-[hsl(var(--admin-accent)/0.25)] bg-[hsl(var(--admin-card))] p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className={kicker + " mb-1"}>MARQUE</p>
              <select
                value={form.brand_id}
                onChange={e => setForm(f => ({ ...f, brand_id: e.target.value }))}
                className="admin-input h-9 w-full text-sm"
              >
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <p className={kicker + " mb-1"}>NOM DU MODÈLE</p>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="RX-7V Evo" className={inp} />
            </div>
          </div>
          <div className="flex gap-6">
            <Toggle checked={form.is_modular} onChange={v => setForm(f => ({ ...f, is_modular: v }))} label="MODULABLE" />
            <Toggle checked={form.is_coming_soon} onChange={v => setForm(f => ({ ...f, is_coming_soon: v }))} label="BIENTÔT DISPONIBLE" />
          </div>
          <div className="flex gap-2">
            <Button onClick={save} className="admin-button h-9 rounded-none px-4 font-adminDisplay text-xs tracking-[0.16em]"><Save className="h-3 w-3" /> ENREGISTRER</Button>
            <Button onClick={() => { setAdding(false); setEditing(null); }} className="admin-button-secondary h-9 rounded-none px-4 font-adminDisplay text-xs tracking-[0.16em]"><X className="h-3 w-3" /> ANNULER</Button>
          </div>
        </div>
      )}

      {brands.map(b => {
        const bModels = models.filter(m => m.brand_id === b.id);
        if (bModels.length === 0) return null;
        return (
          <div key={b.id}>
            <p className="mb-1.5 font-adminDisplay text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--admin-accent))]">{b.name}</p>
            <div className="space-y-1">
              {bModels.map(m => (
                <div key={m.id} className={rowCls}>
                  <span className="text-sm text-[hsl(var(--admin-foreground))]">
                    {m.name}
                    {m.is_modular && <span className={moduleBadge}>· MODULABLE</span>}
                    {m.is_coming_soon && <span className={comingSoonBadge}>· BIENTÔT</span>}
                  </span>
                  <div className="flex gap-1">
                    <Button onClick={() => { setEditing(m); setAdding(false); setForm({ brand_id: m.brand_id, name: m.name, is_modular: m.is_modular, is_coming_soon: m.is_coming_soon }); }} className="h-8 w-8 rounded-none border border-[hsl(var(--admin-accent)/0.2)] bg-transparent p-0 text-[hsl(var(--admin-muted-foreground))] hover:text-[hsl(var(--admin-accent))]"><Pencil className="h-3 w-3" /></Button>
                    <Button onClick={() => del(m.id)} className="h-8 w-8 rounded-none border border-destructive/30 bg-transparent p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════ INTERCOMS TAB ══════════════════ */
const EMPTY_FORM = { brand: "", name: "", image_url: "", is_coming_soon: false, gallery_images: [] as string[], prix: "", description: "", stock: "", pack_duo: false, prix_duo: "", featured: false };

function toPayload(form: typeof EMPTY_FORM) {
  return {
    brand: form.brand,
    name: form.name,
    image_url: form.image_url || null,
    is_coming_soon: form.is_coming_soon,
    gallery_images: form.gallery_images,
    description: form.description || null,
    prix: form.prix !== "" ? parseFloat(form.prix) : null,
    stock: form.stock !== "" ? parseInt(form.stock, 10) : null,
    pack_duo: form.pack_duo,
    prix_duo: form.pack_duo && form.prix_duo !== "" ? parseFloat(form.prix_duo) : null,
    featured: form.featured,
  };
}

function formFromRecord(i: InstIntercom): typeof EMPTY_FORM {
  return {
    brand: i.brand,
    name: i.name,
    image_url: i.image_url || "",
    is_coming_soon: i.is_coming_soon,
    gallery_images: i.gallery_images || [],
    description: i.description || "",
    prix: i.prix != null ? String(i.prix) : "",
    stock: i.stock != null ? String(i.stock) : "",
    pack_duo: i.pack_duo,
    prix_duo: i.prix_duo != null ? String(i.prix_duo) : "",
    featured: i.featured,
  };
}

const ANON_KEY_INT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhdHN1ZGdwaWVjem1vZGpieW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTI5OTksImV4cCI6MjA4OTc2ODk5OX0.nyknLVoppUcDeHjQWC-Nmw2wFYQiC4RLGFo51qEEE4w";

function IntercomsTab() {
  const [intercoms, setIntercoms] = useState<InstIntercom[]>([]);
  const [editing, setEditing] = useState<InstIntercom | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [generatingDesc, setGeneratingDesc] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("installation_intercoms").select("*").order("brand").order("sort_order");
    if (data) setIntercoms(data.map(d => ({ ...d, gallery_images: Array.isArray(d.gallery_images) ? (d.gallery_images as string[]) : [], pack_duo: d.pack_duo ?? false })) as InstIntercom[]);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.brand.trim() || !form.name.trim()) { toast.error("MARQUE ET NOM REQUIS"); return; }
    const payload = toPayload(form);
    if (form.featured) {
      await supabase.from("installation_intercoms").update({ featured: false }).neq("id", editing?.id ?? "");
    }
    if (editing) {
      const { error } = await supabase.from("installation_intercoms").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("INTERCOM MODIFIÉ");
    } else {
      const sameB = intercoms.filter(i => i.brand === form.brand).length;
      const { error } = await supabase.from("installation_intercoms").insert({ ...payload, sort_order: sameB });
      if (error) { toast.error(error.message); return; }
      toast.success("INTERCOM AJOUTÉ");
    }
    setAdding(false); setEditing(null); load();
  };

  const del = async (id: string) => {
    if (!confirm("SUPPRIMER CET INTERCOM ?")) return;
    const { error } = await supabase.from("installation_intercoms").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("INTERCOM SUPPRIMÉ"); load();
  };

  const uniqueBrands = [...new Set(intercoms.map(i => i.brand))];

  const generateDescription = async () => {
    if (!form.name.trim()) { toast.error("ENTREZ D'ABORD LE NOM"); return; }
    setGeneratingDesc(true);
    try {
      const res = await fetch("https://qatsudgpieczmodjbynh.supabase.co/functions/v1/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${ANON_KEY_INT}`, "apikey": ANON_KEY_INT },
        body: JSON.stringify({ name: form.name, brand: form.brand, category: "intercom", price: form.prix ? parseFloat(form.prix) : null }),
      });
      if (!res.ok) { toast.error("ERREUR GÉNÉRATION"); return; }
      const json = await res.json();
      if (json.description) setForm(f => ({ ...f, description: json.description }));
      else toast.error("RÉPONSE VIDE");
    } catch { toast.error("ERREUR GÉNÉRATION"); }
    finally { setGeneratingDesc(false); }
  };

  const prixNum = parseFloat(form.prix) || 0;
  const prixDuoNum = parseFloat(form.prix_duo) || 0;
  const economie = form.pack_duo && prixNum > 0 && prixDuoNum > 0 ? Math.max(0, prixNum * 2 - prixDuoNum) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className={kicker}>INTERCOMS ({intercoms.length})</p>
        <Button onClick={() => { setAdding(true); setEditing(null); setForm(EMPTY_FORM); }} className="admin-button h-9 rounded-none px-4 font-adminDisplay text-xs tracking-[0.16em]">
          <Plus className="h-3 w-3" /> AJOUTER
        </Button>
      </div>

      {(adding || editing) && (
        <div className="border border-[hsl(var(--admin-accent)/0.25)] bg-[hsl(var(--admin-card))] p-4 space-y-3">
          {/* Marque + Modèle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className={kicker + " mb-1"}>MARQUE</p>
              <Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="Sena" className={inp} />
            </div>
            <div>
              <p className={kicker + " mb-1"}>MODÈLE</p>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="50S" className={inp} />
            </div>
          </div>

          {/* Prix + Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className={kicker + " mb-1"}>PRIX UNITAIRE (€)</p>
              <Input type="number" min="0" step="0.01" value={form.prix} onChange={e => setForm(f => ({ ...f, prix: e.target.value }))} placeholder="149.99" className={inp} />
            </div>
            <div>
              <p className={kicker + " mb-1"}>STOCK</p>
              <Input type="number" min="0" step="1" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="5" className={inp} />
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className={kicker}>DESCRIPTION</p>
              <button
                type="button"
                onClick={generateDescription}
                disabled={generatingDesc}
                className="inline-flex items-center gap-1.5 px-3 py-1 font-adminDisplay text-[10px] uppercase tracking-[0.18em] border transition-all disabled:opacity-50"
                style={{ borderColor: "rgba(201,151,58,0.35)", color: "#c9973a", background: "rgba(201,151,58,0.06)" }}
                onMouseEnter={e => { if (!generatingDesc) (e.currentTarget as HTMLElement).style.background = "rgba(201,151,58,0.14)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(201,151,58,0.06)"; }}
              >
                {generatingDesc ? <><Loader2 className="h-3 w-3 animate-spin" /> Génération...</> : <><Sparkles className="h-3 w-3" /> Générer avec IA</>}
              </button>
            </div>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Description libre du produit…"
              rows={3}
              className="admin-input w-full text-sm resize-none p-2"
            />
          </div>

          {/* Pack duo */}
          <Toggle checked={form.pack_duo} onChange={v => setForm(f => ({ ...f, pack_duo: v }))} label="PACK DUO DISPONIBLE" />
          {form.pack_duo && (
            <div className="pl-4 border-l-2 border-[hsl(var(--admin-accent)/0.3)] space-y-2">
              <div>
                <p className={kicker + " mb-1"}>PRIX PACK DUO (€)</p>
                <Input type="number" min="0" step="0.01" value={form.prix_duo} onChange={e => setForm(f => ({ ...f, prix_duo: e.target.value }))} placeholder="269.99" className={inp} />
              </div>
              {economie > 0 && (
                <p className="text-[11px]" style={{ color: "#c9973a" }}>Économie : {economie.toFixed(2)} € par rapport à 2× le prix unitaire</p>
              )}
            </div>
          )}

          <Toggle checked={form.is_coming_soon} onChange={v => setForm(f => ({ ...f, is_coming_soon: v }))} label="BIENTÔT DISPONIBLE" />
          <Toggle checked={form.featured} onChange={v => setForm(f => ({ ...f, featured: v }))} label="PHOTO À LA UNE — PAGE D'ACCUEIL" />

          {/* Photos */}
          <div>
            <p className={kicker + " mb-2"}>PHOTO PRINCIPALE (carte)</p>
            <ImageUploadSingle value={form.image_url} onChange={v => setForm(f => ({ ...f, image_url: v }))} folder="intercoms" previewClass="h-24 w-24" />
          </div>
          <div>
            <p className={kicker + " mb-2"}>PHOTOS GALERIE</p>
            <ImageUploadMulti value={form.gallery_images} onChange={v => setForm(f => ({ ...f, gallery_images: v }))} folder="intercoms" label="" />
          </div>

          <div className="flex gap-2">
            <Button onClick={save} className="admin-button h-9 rounded-none px-4 font-adminDisplay text-xs tracking-[0.16em]"><Save className="h-3 w-3" /> ENREGISTRER</Button>
            <Button onClick={() => { setAdding(false); setEditing(null); }} className="admin-button-secondary h-9 rounded-none px-4 font-adminDisplay text-xs tracking-[0.16em]"><X className="h-3 w-3" /> ANNULER</Button>
          </div>
        </div>
      )}

      {uniqueBrands.map(brand => (
        <div key={brand}>
          <p className="mb-1.5 font-adminDisplay text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--admin-accent))]">{brand}</p>
          <div className="space-y-1">
            {intercoms.filter(i => i.brand === brand).map(i => (
              <div key={i.id} className={rowCls}>
                <div className="flex items-center gap-3">
                  {i.image_url ? <img src={i.image_url} alt={i.name} className="h-10 w-10 object-cover rounded" /> : <div className="h-10 w-10 rounded border border-[hsl(var(--admin-accent)/0.15)] bg-[hsl(var(--admin-card))]" />}
                  <div>
                    <span className="text-sm text-[hsl(var(--admin-foreground))] flex items-center gap-1.5">
                      {i.featured && <Star className="h-3 w-3 fill-[#c9973a] text-[#c9973a]" />}
                      {i.name}
                      {i.is_coming_soon && <span className={comingSoonBadge}>· BIENTÔT</span>}
                      {i.pack_duo && <span className="ml-2 text-[10px] uppercase tracking-[0.2em] font-adminDisplay" style={{ color: "#c9973a" }}>· DUO</span>}
                    </span>
                    {i.prix != null && <p className="text-[11px] text-[hsl(var(--admin-muted-foreground))]">{i.prix} € {i.stock != null ? `· Stock : ${i.stock}` : ""}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button onClick={() => { setEditing(i); setAdding(false); setForm(formFromRecord(i)); }} className="h-8 w-8 rounded-none border border-[hsl(var(--admin-accent)/0.2)] bg-transparent p-0 text-[hsl(var(--admin-muted-foreground))] hover:text-[hsl(var(--admin-accent))]"><Pencil className="h-3 w-3" /></Button>
                  <Button onClick={() => del(i.id)} className="h-8 w-8 rounded-none border border-destructive/30 bg-transparent p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════ ACCESSORIES TAB ══════════════════ */
const EMPTY_ACC = { name: "", brand: "", category: "", image_url: "", gallery_images: [] as string[], prix: "", stock: "", description: "", is_coming_soon: false, featured: false };

function makeAccSlug(brand: string, name: string): string {
  return `${brand}-${name}`.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function toAccPayload(form: typeof EMPTY_ACC) {
  return {
    name: form.name,
    brand: form.brand,
    category: form.category,
    slug: makeAccSlug(form.brand, form.name),
    image_url: form.image_url || null,
    gallery_images: form.gallery_images,
    description: form.description || null,
    prix: form.prix !== "" ? parseFloat(form.prix) : null,
    stock: form.stock !== "" ? parseInt(form.stock, 10) : 0,
    is_coming_soon: form.is_coming_soon,
    featured: form.featured,
  };
}

function accFromRecord(a: InstAccessory): typeof EMPTY_ACC {
  return {
    name: a.name,
    brand: a.brand,
    category: a.category,
    image_url: a.image_url || "",
    gallery_images: a.gallery_images || [],
    description: a.description || "",
    prix: a.prix != null ? String(a.prix) : "",
    stock: String(a.stock),
    is_coming_soon: a.is_coming_soon,
    featured: a.featured,
  };
}

const ACC_CATEGORIES = ["Support téléphone", "Support GPS", "Caméra", "Interphone / Intercom", "Chargeur / Alimentation", "Fixation", "Autre"];

const ANON_KEY_ACC = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhdHN1ZGdwaWVjem1vZGpieW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTI5OTksImV4cCI6MjA4OTc2ODk5OX0.nyknLVoppUcDeHjQWC-Nmw2wFYQiC4RLGFo51qEEE4w";

function AccessoriesTab() {
  const [accessories, setAccessories] = useState<InstAccessory[]>([]);
  const [editing, setEditing] = useState<InstAccessory | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<typeof EMPTY_ACC>(EMPTY_ACC);
  const [generatingDesc, setGeneratingDesc] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("installation_accessories").select("*").order("category").order("sort_order");
    if (data) setAccessories(data.map(d => ({ ...d, gallery_images: Array.isArray(d.gallery_images) ? (d.gallery_images as string[]) : [] })) as InstAccessory[]);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name.trim()) { toast.error("NOM REQUIS"); return; }
    const payload = toAccPayload(form);
    if (form.featured) {
      await supabase.from("installation_accessories").update({ featured: false }).neq("id", editing?.id ?? "");
    }
    if (editing) {
      const { error } = await supabase.from("installation_accessories").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("ACCESSOIRE MODIFIÉ");
    } else {
      const sameC = accessories.filter(a => a.category === form.category).length;
      const { error } = await supabase.from("installation_accessories").insert({ ...payload, sort_order: sameC });
      if (error) { toast.error(error.message); return; }
      toast.success("ACCESSOIRE AJOUTÉ");
    }
    setAdding(false); setEditing(null); load();
  };

  const del = async (id: string) => {
    if (!confirm("SUPPRIMER CET ACCESSOIRE ?")) return;
    const { error } = await supabase.from("installation_accessories").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("ACCESSOIRE SUPPRIMÉ"); load();
  };

  const uniqueCats = [...new Set(accessories.map(a => a.category || "Autre"))];
  const knownBrands = [...new Set(accessories.map(a => a.brand).filter(Boolean))].sort();

  const generateDescription = async () => {
    if (!form.name.trim()) { toast.error("ENTREZ D'ABORD LE NOM"); return; }
    setGeneratingDesc(true);
    try {
      const res = await fetch("https://qatsudgpieczmodjbynh.supabase.co/functions/v1/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${ANON_KEY_ACC}`, "apikey": ANON_KEY_ACC },
        body: JSON.stringify({ name: form.name, brand: form.brand, category: form.category, price: form.prix ? parseFloat(form.prix) : null, image_url: form.image_url || null }),
      });
      if (!res.ok) { toast.error("ERREUR GÉNÉRATION"); return; }
      const json = await res.json();
      if (json.description) setForm(f => ({ ...f, description: json.description }));
      else toast.error("RÉPONSE VIDE");
    } catch {
      toast.error("ERREUR GÉNÉRATION");
    } finally {
      setGeneratingDesc(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className={kicker}>ACCESSOIRES ({accessories.length})</p>
        <Button onClick={() => { setAdding(true); setEditing(null); setForm(EMPTY_ACC); }} className="admin-button h-9 rounded-none px-4 font-adminDisplay text-xs tracking-[0.16em]">
          <Plus className="h-3 w-3" /> AJOUTER
        </Button>
      </div>

      {(adding || editing) && (
        <div className="border border-[hsl(var(--admin-accent)/0.25)] bg-[hsl(var(--admin-card))] p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className={kicker + " mb-1"}>NOM</p>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Quad Lock Pro" className={inp} />
            </div>
            <div>
              <p className={kicker + " mb-1"}>MARQUE</p>
              <input
                list="acc-brands-list"
                value={form.brand}
                onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                placeholder="Quad Lock"
                className={`admin-input h-9 w-full text-sm ${inp}`}
              />
              <datalist id="acc-brands-list">
                {knownBrands.map(b => <option key={b} value={b} />)}
              </datalist>
            </div>
          </div>

          <div>
            <p className={kicker + " mb-1"}>CATÉGORIE</p>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="admin-input h-9 w-full text-sm"
            >
              <option value="">— Choisir —</option>
              {ACC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className={kicker + " mb-1"}>PRIX (€)</p>
              <Input type="number" min="0" step="0.01" value={form.prix} onChange={e => setForm(f => ({ ...f, prix: e.target.value }))} placeholder="49.99" className={inp} />
            </div>
            <div>
              <p className={kicker + " mb-1"}>STOCK</p>
              <Input type="number" min="0" step="1" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="10" className={inp} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <p className={kicker}>DESCRIPTION</p>
              <button
                type="button"
                onClick={generateDescription}
                disabled={generatingDesc}
                className="inline-flex items-center gap-1.5 px-3 py-1 font-adminDisplay text-[10px] uppercase tracking-[0.18em] border transition-all disabled:opacity-50"
                style={{ borderColor: "rgba(201,151,58,0.35)", color: "#c9973a", background: "rgba(201,151,58,0.06)" }}
                onMouseEnter={e => { if (!generatingDesc) (e.currentTarget as HTMLElement).style.background = "rgba(201,151,58,0.14)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(201,151,58,0.06)"; }}
              >
                {generatingDesc ? <><Loader2 className="h-3 w-3 animate-spin" /> Génération...</> : <><Sparkles className="h-3 w-3" /> Générer avec IA</>}
              </button>
            </div>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Description de l'accessoire…"
              rows={3}
              className="admin-input w-full text-sm resize-none p-2"
            />
          </div>

          <Toggle checked={form.is_coming_soon} onChange={v => setForm(f => ({ ...f, is_coming_soon: v }))} label="BIENTÔT DISPONIBLE" />
          <Toggle checked={form.featured} onChange={v => setForm(f => ({ ...f, featured: v }))} label="MIS EN AVANT" />

          <div>
            <p className={kicker + " mb-2"}>PHOTO PRINCIPALE</p>
            <ImageUploadSingle value={form.image_url} onChange={v => setForm(f => ({ ...f, image_url: v }))} folder="accessories" previewClass="h-24 w-24" />
          </div>
          <div>
            <p className={kicker + " mb-2"}>PHOTOS GALERIE</p>
            <ImageUploadMulti value={form.gallery_images} onChange={v => setForm(f => ({ ...f, gallery_images: v }))} folder="accessories" label="" />
          </div>

          <div className="flex gap-2">
            <Button onClick={save} className="admin-button h-9 rounded-none px-4 font-adminDisplay text-xs tracking-[0.16em]"><Save className="h-3 w-3" /> ENREGISTRER</Button>
            <Button onClick={() => { setAdding(false); setEditing(null); }} className="admin-button-secondary h-9 rounded-none px-4 font-adminDisplay text-xs tracking-[0.16em]"><X className="h-3 w-3" /> ANNULER</Button>
          </div>
        </div>
      )}

      {uniqueCats.map(cat => (
        <div key={cat}>
          <p className="mb-1.5 font-adminDisplay text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--admin-accent))]">{cat}</p>
          <div className="space-y-1">
            {accessories.filter(a => (a.category || "Autre") === cat).map(a => (
              <div key={a.id} className={rowCls}>
                <div className="flex items-center gap-3">
                  {a.image_url ? <img src={a.image_url} alt={a.name} className="h-10 w-10 object-cover rounded" /> : <div className="h-10 w-10 rounded border border-[hsl(var(--admin-accent)/0.15)] bg-[hsl(var(--admin-card))]" />}
                  <div>
                    <span className="text-sm text-[hsl(var(--admin-foreground))] flex items-center gap-1.5">
                      {a.featured && <Star className="h-3 w-3 fill-[#c9973a] text-[#c9973a]" />}
                      {a.name}
                      {a.brand && <span className="text-[hsl(var(--admin-muted-foreground))] text-[11px]">· {a.brand}</span>}
                      {a.is_coming_soon && <span className={comingSoonBadge}>· BIENTÔT</span>}
                    </span>
                    {a.prix != null && <p className="text-[11px] text-[hsl(var(--admin-muted-foreground))]">{a.prix} € · Stock : {a.stock}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button onClick={() => { setEditing(a); setAdding(false); setForm(accFromRecord(a)); }} className="h-8 w-8 rounded-none border border-[hsl(var(--admin-accent)/0.2)] bg-transparent p-0 text-[hsl(var(--admin-muted-foreground))] hover:text-[hsl(var(--admin-accent))]"><Pencil className="h-3 w-3" /></Button>
                  <Button onClick={() => del(a.id)} className="h-8 w-8 rounded-none border border-destructive/30 bg-transparent p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════ MAIN ══════════════════ */
export default function AdminInstallation() {
  return (
    <div className="admin-card rounded-none p-5">
      <div className="mb-5 border-b border-[hsl(var(--admin-accent)/0.2)] pb-5">
        <p className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">SERVICE</p>
        <h2 className="font-adminDisplay text-3xl text-[hsl(var(--admin-foreground))]">CATALOGUE INSTALLATION</h2>
      </div>

      <Tabs defaultValue="brands">
        <TabsList className="h-auto gap-0 rounded-none bg-transparent p-0 mb-6 border-b border-[hsl(var(--admin-accent)/0.18)] overflow-x-auto flex-nowrap w-full" style={{ scrollbarWidth: "none" }}>
          {[
            { value: "brands", label: "MARQUES DE CASQUES" },
            { value: "models", label: "MODÈLES DE CASQUES" },
            { value: "intercoms", label: "INTERCOMS" },
            { value: "accessories", label: "ACCESSOIRES" },
          ].map(t => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="rounded-none border-b-2 border-transparent shrink-0 px-3 py-3 font-adminDisplay text-xs tracking-[0.1em] text-[hsl(var(--admin-muted-foreground))] data-[state=active]:border-[hsl(var(--admin-accent))] data-[state=active]:bg-transparent data-[state=active]:text-[hsl(var(--admin-accent))]"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="brands"   className="m-0"><BrandsTab /></TabsContent>
        <TabsContent value="models"   className="m-0"><ModelsTab /></TabsContent>
        <TabsContent value="intercoms"   className="m-0"><IntercomsTab /></TabsContent>
        <TabsContent value="accessories" className="m-0"><AccessoriesTab /></TabsContent>
      </Tabs>
    </div>
  );
}
