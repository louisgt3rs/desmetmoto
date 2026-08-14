import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type InstBrand    = { id: string; name: string };
type InstModel    = { id: string; brand_id: string; name: string; is_modular: boolean; is_coming_soon: boolean };
type InstIntercom = { id: string; brand: string; name: string; is_coming_soon: boolean };

const ACCESSORY_OPTIONS = ["Intercom Sena", "Intercom Cardo", "GPS", "Support Quad Lock / SP Connect", "Autre"];
const SENA_BRAND  = "Sena";
const CARDO_BRAND = "Cardo";

const EMPTY_FORM = {
  first_name: "", last_name: "", email: "", phone: "",
  helmet_brand: "", helmet_model: "",
  accessory_type: "Intercom Sena",
  intercom_model: "",
  message: "", rgpd: false,
};

const fs = {
  background: "var(--c-surface-sub)",
  border: "1px solid rgba(201,151,58,0.2)",
  color: "var(--c-text)",
} as React.CSSProperties;

const lbl = "block font-display text-[10px] uppercase tracking-[0.3em] mb-1.5";
const lblColor = { color: "rgba(201,151,58,0.7)" };

interface Props {
  open: boolean;
  onClose: () => void;
  preselectedAccessoryType?: string;
  preselectedIntercomModel?: string;
}

export default function InstallationModal({ open, onClose, preselectedAccessoryType, preselectedIntercomModel }: Props) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [rgpdErr, setRgpdErr] = useState(false);
  const [sending, setSending] = useState(false);

  const [brands, setBrands]     = useState<InstBrand[]>([]);
  const [models, setModels]     = useState<InstModel[]>([]);
  const [intercoms, setIntercoms] = useState<InstIntercom[]>([]);
  const [loadingCat, setLoadingCat] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("installation_brands").select("id, name, sort_order").order("sort_order"),
      supabase.from("installation_models").select("id, brand_id, name, is_modular, is_coming_soon").order("sort_order"),
      supabase.from("installation_intercoms").select("id, brand, name, is_coming_soon").order("brand").order("sort_order"),
    ]).then(([b, m, i]) => {
      if (b.data) setBrands(b.data as InstBrand[]);
      if (m.data) setModels(m.data as InstModel[]);
      if (i.data) setIntercoms(i.data as InstIntercom[]);
      setLoadingCat(false);
    });
  }, []);

  // Apply preselection when modal opens
  useEffect(() => {
    if (!open) return;
    setForm({
      ...EMPTY_FORM,
      accessory_type: preselectedAccessoryType || "Intercom Sena",
      intercom_model: preselectedIntercomModel || "",
    });
    setRgpdErr(false);
  }, [open, preselectedAccessoryType, preselectedIntercomModel]);

  const set = (k: keyof typeof EMPTY_FORM, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  const filteredModels = form.helmet_brand ? models.filter(m => m.brand_id === form.helmet_brand) : [];

  const intercomBrand =
    form.accessory_type === "Intercom Sena" ? SENA_BRAND :
    form.accessory_type === "Intercom Cardo" ? CARDO_BRAND : null;

  const intercomModels = intercomBrand ? intercoms.filter(i => i.brand === intercomBrand) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.rgpd) { setRgpdErr(true); return; }
    setRgpdErr(false);
    setSending(true);
    const selectedHelmetBrand = brands.find(b => b.id === form.helmet_brand)?.name || form.helmet_brand;
    const selectedHelmetModel = models.find(m => m.id === form.helmet_model)?.name || form.helmet_model;
    const accessoryDetail = form.intercom_model
      ? `${form.accessory_type} — ${form.intercom_model}`
      : form.accessory_type;
    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone,
      helmet: `${selectedHelmetBrand} ${selectedHelmetModel}`.trim(),
      accessory_type: accessoryDetail,
      message: form.message || null,
    };

    const { error: dbErr } = await (supabase.from("installation_requests" as any) as any)
      .insert({ ...payload, status: "pending" });

    if (dbErr) {
      setSending(false);
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
      return;
    }

    await supabase.functions.invoke("send-email", {
      body: { type: "installation_request", reservation: payload },
    });

    setSending(false);
    toast.success("Demande envoyée — nous vous recontactons rapidement.");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.88)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg overflow-y-auto max-h-[90vh]"
            style={{ background: "var(--c-surface-page)", border: "1px solid rgba(201,151,58,0.25)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(201,151,58,0.12)" }}>
              <div>
                <p className="font-display text-[10px] uppercase tracking-[0.45em] mb-1" style={{ color: "rgba(201,151,58,0.6)" }}>Desmet Équipement — Wavre</p>
                <h2 className="font-display text-2xl uppercase" style={{ color: "var(--c-text)" }}>Demande d'installation</h2>
              </div>
              <button
                onClick={onClose}
                className="mt-1 transition-colors"
                style={{ color: "var(--c-text-30)" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--c-text)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--c-text-30)"}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl} style={lblColor}>Prénom *</label>
                  <input required value={form.first_name} onChange={e => set("first_name", e.target.value)} className="w-full px-3 py-2.5 text-sm outline-none" style={fs} />
                </div>
                <div>
                  <label className={lbl} style={lblColor}>Nom *</label>
                  <input required value={form.last_name} onChange={e => set("last_name", e.target.value)} className="w-full px-3 py-2.5 text-sm outline-none" style={fs} />
                </div>
              </div>

              <div>
                <label className={lbl} style={lblColor}>Email *</label>
                <input required type="email" value={form.email} onChange={e => set("email", e.target.value)} className="w-full px-3 py-2.5 text-sm outline-none" style={fs} />
              </div>

              <div>
                <label className={lbl} style={lblColor}>Téléphone *</label>
                <input required type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} className="w-full px-3 py-2.5 text-sm outline-none" style={fs} />
              </div>

              {/* Helmet */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl} style={lblColor}>Marque du casque *</label>
                  {loadingCat
                    ? <div className="px-3 py-2.5 text-sm" style={{ ...fs, color: "var(--c-text-40)" }}>Chargement…</div>
                    : (
                      <select required value={form.helmet_brand} onChange={e => setForm(f => ({ ...f, helmet_brand: e.target.value, helmet_model: "" }))} className="w-full px-3 py-2.5 text-sm outline-none" style={fs}>
                        <option value="">Choisir…</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    )}
                </div>
                <div>
                  <label className={lbl} style={lblColor}>Modèle *</label>
                  <select required value={form.helmet_model} onChange={e => set("helmet_model", e.target.value)} disabled={!form.helmet_brand} className="w-full px-3 py-2.5 text-sm outline-none" style={{ ...fs, opacity: form.helmet_brand ? 1 : 0.5 }}>
                    <option value="">Choisir…</option>
                    {filteredModels.map(m => (
                      <option key={m.id} value={m.id} disabled={m.is_coming_soon} style={{ color: m.is_coming_soon ? "#c9973a" : "white" }}>
                        {m.name}{m.is_modular ? " (modulable)" : ""}{m.is_coming_soon ? " — bientôt disponible" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Accessory type */}
              <div>
                <label className={lbl} style={lblColor}>Type d'accessoire *</label>
                <select value={form.accessory_type} onChange={e => setForm(f => ({ ...f, accessory_type: e.target.value, intercom_model: "" }))} className="w-full px-3 py-2.5 text-sm outline-none" style={fs}>
                  {ACCESSORY_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>

              {/* Intercom sub-model (Sena or Cardo) */}
              {intercomBrand && (
                <div>
                  <label className={lbl} style={lblColor}>Modèle {intercomBrand} *</label>
                  <select
                    required
                    value={form.intercom_model}
                    onChange={e => set("intercom_model", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm outline-none"
                    style={fs}
                  >
                    <option value="">Choisir un modèle…</option>
                    {intercomModels.map(i => (
                      <option key={i.id} value={i.name} disabled={i.is_coming_soon} style={{ color: i.is_coming_soon ? "#c9973a" : "white" }}>
                        {i.name}{i.is_coming_soon ? " — bientôt disponible" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className={lbl} style={lblColor}>Message (optionnel)</label>
                <textarea rows={3} value={form.message} onChange={e => set("message", e.target.value)} className="w-full px-3 py-2.5 text-sm outline-none resize-none" style={fs} />
              </div>

              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.rgpd} onChange={e => { set("rgpd", e.target.checked); if (e.target.checked) setRgpdErr(false); }} className="mt-0.5 shrink-0 accent-[#c9973a]" />
                  <span className="text-xs leading-relaxed" style={{ color: "var(--c-text-45)" }}>
                    J'accepte que mes données soient utilisées pour traiter ma demande d'installation. *
                  </span>
                </label>
                {rgpdErr && <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>Vous devez accepter pour continuer.</p>}
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-4 font-display text-sm uppercase tracking-[0.3em] transition-all duration-300"
                style={{ background: sending ? "rgba(201,151,58,0.3)" : "#c9973a", color: "#0e0e0e", cursor: sending ? "not-allowed" : "pointer" }}
              >
                {sending ? "Envoi en cours..." : "Envoyer la demande"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
