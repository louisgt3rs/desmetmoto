import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

const inp = "h-10 rounded-none border-white/15 bg-white/5 text-white placeholder:text-white/25 focus:border-[#c9973a] focus-visible:ring-0";

export default function Panier() {
  const { items, totalItems, totalPrice, removeItem, updateQty, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    setError(null);

    try {
      // Insert reservation
      const { data: res, error: resErr } = await supabase
        .from("cart_reservations" as any)
        .insert({ ...form, status: "pending" })
        .select("id")
        .single();

      if (resErr || !res) throw new Error(resErr?.message ?? "Erreur lors de la réservation");

      // Insert items
      const { error: itemsErr } = await supabase
        .from("cart_reservation_items" as any)
        .insert(
          items.map(i => ({
            reservation_id: (res as any).id,
            product_ref: i.id,
            product_name: i.name,
            quantity: i.quantity,
            price_at_reservation: i.price,
          }))
        );

      if (itemsErr) throw new Error(itemsErr.message);

      // Send email notification
      await supabase.functions.invoke("send-email", {
        body: {
          type: "cart_reservation",
          reservation: {
            ...form,
            items,
            total: totalPrice,
          },
        },
      });

      clearCart();
      navigate("/panier/confirmation", {
        state: { items, form },
      });
    } catch (err: any) {
      setError(err.message ?? "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <SEO title="Mon panier — Desmet Équipement" description="Réservez vos articles en magasin à Wavre." />

      <section style={{ background: "var(--c-surface-hero)" }} className="relative overflow-hidden py-20">
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]" style={{ mixBlendMode: "overlay" }} aria-hidden="true">
          <filter id="grain-p"><feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
          <rect width="100%" height="100%" filter="url(#grain-p)"/>
        </svg>
        <div className="relative container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.35em] mb-8 transition-colors" style={{ color: "var(--c-text-30)" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c9973a"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--c-text-30)"}
          >
            <ArrowLeft className="w-3 h-3" /> Continuer mes achats
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="w-5 h-5" style={{ color: "#c9973a" }} />
            <p className="font-display text-[10px] uppercase tracking-[0.5em]" style={{ color: "rgba(201,151,58,0.7)" }}>Réservation en boutique</p>
          </div>
          <h1 className="font-display text-white leading-none" style={{ fontSize: "clamp(2.5rem,8vw,5rem)" }}>
            MON PANIER
          </h1>
          {totalItems > 0 && (
            <p className="mt-2 text-sm" style={{ color: "var(--c-text-40)" }}>{totalItems} article{totalItems > 1 ? "s" : ""}</p>
          )}
        </div>
      </section>

      <section style={{ background: "var(--c-surface-page)" }} className="py-16">
        <div className="container mx-auto px-4">
          {items.length === 0 ? (
            <div className="text-center py-24">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: "#c9973a" }} />
              <p className="font-display text-xl text-white/40 mb-6">Votre panier est vide</p>
              <Link to="/brands" className="inline-flex items-center gap-2 font-display text-sm uppercase tracking-[0.25em] px-6 py-3 transition-all"
                style={{ border: "1px solid rgba(201,151,58,0.4)", color: "#c9973a" }}>
                Découvrir nos produits
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left — items */}
              <div>
                <p className="font-display text-[10px] uppercase tracking-[0.4em] mb-6" style={{ color: "rgba(201,151,58,0.6)" }}>Articles sélectionnés</p>

                <AnimatePresence initial={false}>
                  {items.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="flex gap-4 py-5"
                      style={{ borderBottom: "1px solid rgba(201,151,58,0.1)" }}
                    >
                      {/* Thumbnail */}
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover shrink-0" style={{ border: "1px solid rgba(201,151,58,0.1)" }} />
                      ) : (
                        <div className="w-20 h-20 shrink-0 flex items-center justify-center" style={{ background: "rgba(201,151,58,0.05)", border: "1px solid rgba(201,151,58,0.1)" }}>
                          <ShoppingBag className="w-6 h-6 opacity-20" style={{ color: "#c9973a" }} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm text-white leading-snug mb-1">{item.name}</p>
                        {item.price != null && (
                          <p className="font-display text-[#c9973a] text-sm mb-3">
                            {(item.price * item.quantity).toLocaleString("fr-BE", { minimumFractionDigits: 2 })} €
                            {item.quantity > 1 && <span className="text-[11px] text-white/30 ml-1">({item.price.toLocaleString("fr-BE", { minimumFractionDigits: 2 })} € / u.)</span>}
                          </p>
                        )}

                        <div className="flex items-center gap-3">
                          {/* Qty controls */}
                          <div className="flex items-center" style={{ border: "1px solid rgba(201,151,58,0.2)" }}>
                            <button type="button" onClick={() => updateQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-30 hover:text-[#c9973a]"
                              style={{ color: "var(--c-text-50)" }}>
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-display text-sm text-white">{item.quantity}</span>
                            <button type="button" onClick={() => updateQty(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center transition-colors hover:text-[#c9973a]"
                              style={{ color: "var(--c-text-50)" }}>
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button type="button" onClick={() => removeItem(item.id)}
                            className="w-8 h-8 flex items-center justify-center rounded transition-colors hover:text-red-400"
                            style={{ color: "var(--c-text-30)" }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Total */}
                {totalPrice != null && (
                  <div className="flex justify-between items-center pt-6">
                    <p className="font-display text-[10px] uppercase tracking-[0.4em]" style={{ color: "var(--c-text-35)" }}>Total estimé</p>
                    <p className="font-display text-2xl" style={{ color: "#c9973a" }}>
                      {totalPrice.toLocaleString("fr-BE", { minimumFractionDigits: 2 })} €
                    </p>
                  </div>
                )}

                <p className="mt-4 text-[11px] leading-relaxed" style={{ color: "var(--c-text-25)" }}>
                  Prix indicatifs. La disponibilité et le prix définitif seront confirmés par notre équipe en boutique à Wavre.
                </p>
              </div>

              {/* Right — form */}
              <div>
                <p className="font-display text-[10px] uppercase tracking-[0.4em] mb-6" style={{ color: "rgba(201,151,58,0.6)" }}>Vos coordonnées</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <p className="px-4 py-2 text-xs uppercase tracking-widest text-red-400" style={{ border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.07)" }}>
                      {error}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--c-text-35)" }}>Prénom *</label>
                      <Input required value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="Jean" className={inp} />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--c-text-35)" }}>Nom *</label>
                      <Input required value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Dupont" className={inp} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--c-text-35)" }}>Email *</label>
                    <Input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jean@exemple.com" className={inp} />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--c-text-35)" }}>Téléphone *</label>
                    <Input required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+32 470 00 00 00" className={inp} />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--c-text-35)" }}>Message (optionnel)</label>
                    <textarea
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Ex : Je passerai samedi après-midi…"
                      rows={3}
                      className="w-full resize-none px-3 py-2 text-sm focus:outline-none"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "var(--c-text)",
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = "#c9973a")}
                      onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || items.length === 0}
                    className="w-full h-12 font-display text-sm uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                    style={{ background: "#c9973a", color: "#050505" }}
                    onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLElement).style.background = "#d4a44a"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#c9973a"; }}
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
                    {submitting ? "Envoi en cours…" : "Confirmer ma réservation"}
                  </button>

                  <p className="text-[10px] text-center" style={{ color: "var(--c-text-25)" }}>
                    Aucun paiement en ligne — retrait et règlement en boutique à Wavre.
                  </p>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
