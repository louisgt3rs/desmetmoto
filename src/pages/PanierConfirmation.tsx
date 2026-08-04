import { useLocation, Link } from "react-router-dom";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import type { CartItem } from "@/contexts/CartContext";

type LocationState = {
  items: CartItem[];
  form: { first_name: string; last_name: string; email: string; phone: string; notes: string };
};

export default function PanierConfirmation() {
  const { state } = useLocation() as { state: LocationState | null };

  return (
    <Layout>
      <SEO title="Réservation confirmée — Desmet Équipement" description="Votre demande de réservation a été envoyée." />

      <section style={{ background: "var(--c-surface-page)" }} className="min-h-[80vh] flex items-center">
        <div className="container mx-auto px-4 py-20 max-w-2xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 flex items-center justify-center" style={{ background: "#c9973a" }}>
                <CheckCircle2 className="w-8 h-8" style={{ color: "#050505" }} />
              </div>
            </div>

            <p className="font-display text-[10px] uppercase tracking-[0.5em] mb-3" style={{ color: "rgba(201,151,58,0.7)" }}>Demande envoyée</p>
            <h1 className="font-display text-white leading-tight mb-4" style={{ fontSize: "clamp(2rem,6vw,3.5rem)" }}>
              RÉSERVATION<br />ENREGISTRÉE
            </h1>
            <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: "var(--c-text-50)" }}>
              Votre demande a bien été transmise à notre équipe. Nous vous contacterons rapidement pour confirmer la disponibilité et organiser le retrait en boutique à Wavre.
            </p>
          </div>

          {/* Recap */}
          {state && (
            <div style={{ background: "var(--c-surface-card)", border: "1px solid rgba(201,151,58,0.15)" }} className="p-6 space-y-6">
              {/* Client */}
              <div>
                <p className="font-display text-[10px] uppercase tracking-[0.4em] mb-3" style={{ color: "rgba(201,151,58,0.6)" }}>Vos coordonnées</p>
                <div className="space-y-1 text-sm" style={{ color: "var(--c-text-65)" }}>
                  <p>{state.form.first_name} {state.form.last_name}</p>
                  <p>{state.form.email}</p>
                  <p>{state.form.phone}</p>
                  {state.form.notes && <p className="mt-2 italic" style={{ color: "var(--c-text-40)" }}>{state.form.notes}</p>}
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="font-display text-[10px] uppercase tracking-[0.4em] mb-3" style={{ color: "rgba(201,151,58,0.6)" }}>Articles réservés</p>
                <div className="space-y-2">
                  {state.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm py-2" style={{ borderBottom: "1px solid rgba(201,151,58,0.07)" }}>
                      <span style={{ color: "var(--c-text-65)" }}>{item.name} {item.quantity > 1 && <span style={{ color: "var(--c-text-35)" }}>× {item.quantity}</span>}</span>
                      {item.price != null && (
                        <span className="font-display" style={{ color: "#c9973a" }}>
                          {(item.price * item.quantity).toLocaleString("fr-BE", { minimumFractionDigits: 2 })} €
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Store info */}
              <div className="pt-2" style={{ borderTop: "1px solid rgba(201,151,58,0.12)" }}>
                <p className="font-display text-[10px] uppercase tracking-[0.4em] mb-2" style={{ color: "rgba(201,151,58,0.6)" }}>Retrait en boutique</p>
                <p className="text-sm" style={{ color: "var(--c-text-50)" }}>Chaussée de Louvain 491 — 1300 Wavre</p>
                <p className="text-sm" style={{ color: "var(--c-text-50)" }}>+32 10 84 21 39</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mt-8 justify-center">
            <Link to="/" className="inline-flex items-center gap-2 font-display text-sm uppercase tracking-[0.2em] px-6 py-3 transition-all"
              style={{ background: "#c9973a", color: "#050505" }}>
              Retour à l'accueil
            </Link>
            <Link to="/brands" className="inline-flex items-center gap-2 font-display text-sm uppercase tracking-[0.2em] px-6 py-3 transition-all"
              style={{ border: "1px solid rgba(201,151,58,0.3)", color: "#c9973a" }}>
              <ShoppingBag className="w-4 h-4" /> Continuer les achats
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
