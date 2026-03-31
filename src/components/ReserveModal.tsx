import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  coloris?: string | null;
}

export default function ReserveModal({ open, onClose, productId, productName, coloris }: Props) {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Insert reservation row
    const { error: dbErr } = await (supabase.from("store_reservations" as any) as any).insert({
      product_id: productId,
      product_name: productName,
      coloris: coloris || null,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone,
      message: form.message || null,
      status: "pending",
    });

    if (dbErr) {
      setSubmitting(false);
      setError("Une erreur est survenue. Veuillez réessayer.");
      return;
    }

    // Fire email notification (non-blocking — don't fail if email fails)
    supabase.functions.invoke("send-email", {
      body: {
        type: "new_reservation",
        reservation: {
          product_name: productName,
          coloris: coloris || null,
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone: form.phone,
          message: form.message || null,
        },
      },
    }).catch(() => {}); // silently ignore email errors

    setSubmitting(false);
    setSuccess(true);
  };

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => { setSuccess(false); setError(""); setForm({ first_name: "", last_name: "", email: "", phone: "", message: "" }); }, 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-[#0e0e0e] border border-[#c9973a]/25"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#c9973a]/15 px-6 py-5">
              <div>
                <p className="font-display text-[10px] uppercase tracking-[0.28em] text-[#c9973a]">RÉSERVATION EN MAGASIN</p>
                <h2 className="mt-1 font-display text-xl uppercase tracking-widest text-white">{productName}</h2>
                {coloris && <p className="mt-0.5 text-xs uppercase tracking-[0.18em] text-white/40">{coloris}</p>}
              </div>
              <button onClick={handleClose} className="ml-4 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center text-white/30 transition-colors hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              {success ? (
                <div className="py-4 text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center bg-[#c9973a]">
                    <Check className="h-7 w-7 text-[#0e0e0e]" />
                  </div>
                  <p className="font-display text-lg uppercase tracking-widest text-white">DEMANDE ENVOYÉE</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    Votre demande a été envoyée&nbsp;! Nous vous contacterons rapidement.
                  </p>
                  <Button
                    onClick={handleClose}
                    className="mt-6 h-11 w-full rounded-none bg-[#c9973a] font-display text-sm uppercase tracking-[0.2em] text-[#0e0e0e] hover:bg-[#c9973a]/90"
                  >
                    FERMER
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <p className="border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs uppercase tracking-widest text-red-400">{error}</p>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {([
                      { label: "PRÉNOM", field: "first_name", type: "text",  placeholder: "Jean" },
                      { label: "NOM",    field: "last_name",  type: "text",  placeholder: "Dupont" },
                      { label: "EMAIL",  field: "email",      type: "email", placeholder: "jean@email.com" },
                      { label: "TÉLÉPHONE", field: "phone",   type: "tel",   placeholder: "+32 470 000 000" },
                    ] as const).map(({ label, field, type, placeholder }) => (
                      <div key={field} className="space-y-1.5">
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40">{label} *</label>
                        <Input
                          required
                          type={type}
                          value={form[field]}
                          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                          placeholder={placeholder}
                          className="h-10 rounded-none border-white/15 bg-white/5 text-white placeholder:text-white/20 focus:border-[#c9973a] focus-visible:ring-0"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40">MESSAGE (OPTIONNEL)</label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Taille souhaitée, questions..."
                      rows={3}
                      className="w-full rounded-none border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-[#c9973a] focus:outline-none resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-12 w-full rounded-none bg-[#c9973a] font-display text-sm uppercase tracking-[0.2em] text-[#0e0e0e] hover:bg-[#c9973a]/90 disabled:opacity-50"
                  >
                    {submitting ? "ENVOI EN COURS..." : "ENVOYER LA DEMANDE"}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
