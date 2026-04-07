import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { ImageUploadSingle, ImageUploadMulti } from "./ImageUpload";

type InstBrand   = { id: string; name: string; sort_order: number };
type InstModel   = { id: string; brand_id: string; name: string; is_modular: boolean; is_coming_soon: boolean; sort_order: number };
type InstIntercom = { id: string; brand: string; name: string; image_url: string | null; is_coming_soon: boolean; sort_order: number; gallery_images: string[] };

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
function IntercomsTab() {
  const [intercoms, setIntercoms] = useState<InstIntercom[]>([]);
  const [editing, setEditing] = useState<InstIntercom | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ brand: "", name: "", image_url: "", is_coming_soon: false, gallery_images: [] as string[] });

  const load = async () => {
    const { data } = await supabase.from("installation_intercoms").select("*").order("brand").order("sort_order");
    if (data) setIntercoms(data.map(d => ({ ...d, gallery_images: Array.isArray(d.gallery_images) ? (d.gallery_images as string[]) : [] })) as InstIntercom[]);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.brand.trim() || !form.name.trim()) { toast.error("MARQUE ET NOM REQUIS"); return; }
    if (editing) {
      const { error } = await supabase.from("installation_intercoms").update(form).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("INTERCOM MODIFIÉ");
    } else {
      const sameB = intercoms.filter(i => i.brand === form.brand).length;
      const { error } = await supabase.from("installation_intercoms").insert({ ...form, sort_order: sameB });
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className={kicker}>INTERCOMS ({intercoms.length})</p>
        <Button onClick={() => { setAdding(true); setEditing(null); setForm({ brand: "", name: "", image_url: "", is_coming_soon: false, gallery_images: [] }); }} className="admin-button h-9 rounded-none px-4 font-adminDisplay text-xs tracking-[0.16em]">
          <Plus className="h-3 w-3" /> AJOUTER
        </Button>
      </div>

      {(adding || editing) && (
        <div className="border border-[hsl(var(--admin-accent)/0.25)] bg-[hsl(var(--admin-card))] p-4 space-y-3">
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
          <Toggle checked={form.is_coming_soon} onChange={v => setForm(f => ({ ...f, is_coming_soon: v }))} label="BIENTÔT DISPONIBLE" />
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
                  <span className="text-sm text-[hsl(var(--admin-foreground))]">
                    {i.name}
                    {i.is_coming_soon && <span className={comingSoonBadge}>· BIENTÔT</span>}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button onClick={() => { setEditing(i); setAdding(false); setForm({ brand: i.brand, name: i.name, image_url: i.image_url || "", is_coming_soon: i.is_coming_soon, gallery_images: i.gallery_images || [] }); }} className="h-8 w-8 rounded-none border border-[hsl(var(--admin-accent)/0.2)] bg-transparent p-0 text-[hsl(var(--admin-muted-foreground))] hover:text-[hsl(var(--admin-accent))]"><Pencil className="h-3 w-3" /></Button>
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

/* ══════════════════ MAIN ══════════════════ */
export default function AdminInstallation() {
  return (
    <div className="admin-card rounded-none p-5">
      <div className="mb-5 border-b border-[hsl(var(--admin-accent)/0.2)] pb-5">
        <p className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">SERVICE</p>
        <h2 className="font-adminDisplay text-3xl text-[hsl(var(--admin-foreground))]">CATALOGUE INSTALLATION</h2>
      </div>

      <Tabs defaultValue="brands">
        <TabsList className="h-auto gap-0 rounded-none bg-transparent p-0 mb-6 border-b border-[hsl(var(--admin-accent)/0.18)]">
          {[
            { value: "brands", label: "MARQUES DE CASQUES" },
            { value: "models", label: "MODÈLES DE CASQUES" },
            { value: "intercoms", label: "INTERCOMS" },
          ].map(t => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="rounded-none border-b-2 border-transparent px-5 py-3 font-adminDisplay text-sm tracking-[0.14em] text-[hsl(var(--admin-muted-foreground))] data-[state=active]:border-[hsl(var(--admin-accent))] data-[state=active]:bg-transparent data-[state=active]:text-[hsl(var(--admin-accent))]"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="brands"   className="m-0"><BrandsTab /></TabsContent>
        <TabsContent value="models"   className="m-0"><ModelsTab /></TabsContent>
        <TabsContent value="intercoms" className="m-0"><IntercomsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
