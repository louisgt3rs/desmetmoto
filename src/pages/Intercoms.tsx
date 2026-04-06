import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Radio } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

type Intercom = { id: string; brand: string; name: string; slug: string | null; description: string | null; is_coming_soon: boolean };

export default function IntercomsPage() {
  const [intercoms, setIntercoms] = useState<Intercom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("installation_intercoms")
      .select("id, brand, name, slug, description, is_coming_soon")
      .order("brand")
      .order("sort_order")
      .then(({ data }) => {
        if (data) setIntercoms(data as Intercom[]);
        setLoading(false);
      });
  }, []);

  const brands = [...new Set(intercoms.map(i => i.brand))];

  const BRAND_TAGLINE: Record<string, string> = {
    Sena: "Technologie Mesh 2.0 — leader mondial de la communication moto",
    Cardo: "DMC Mesh — jusqu'à 15 riders, portée illimitée",
    Alpinestars: "Intégration airbag & communication — le futur de la sécurité moto",
  };

  return (
    <Layout>
      <SEO
        title="Intercoms Moto Sena & Cardo — Installation en boutique à Wavre | Desmet Équipement"
        description="Intercoms moto Sena et Cardo disponibles en boutique à Wavre. Technologie Mesh 2.0, jusqu'à 8 riders. Installation professionnelle sur casque acheté chez nous."
        canonicalPath="/intercoms"
      />

      {/* Hero */}
      <section style={{ background: "var(--c-surface-hero)" }} className="relative py-28 overflow-hidden">
        {/* grain */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]" style={{ mixBlendMode: "overlay" }}>
          <filter id="grain-ic">
            <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain-ic)" />
        </svg>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,151,58,0.12), transparent)" }} />

        <div className="relative container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12" style={{ background: "linear-gradient(to right, transparent, rgba(201,151,58,0.5))" }} />
            <Radio className="w-4 h-4" style={{ color: "#c9973a" }} />
            <div className="h-px w-12" style={{ background: "linear-gradient(to left, transparent, rgba(201,151,58,0.5))" }} />
          </div>
          <p className="font-display text-[10px] uppercase tracking-[0.55em] mb-4" style={{ color: "rgba(201,151,58,0.7)" }}>Disponibles en boutique</p>
          <h1 className="font-display text-white mb-4" style={{ fontSize: "clamp(2.8rem, 10vw, 7rem)", lineHeight: 1 }}>
            INTERCOMS MOTO
          </h1>
          <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: "var(--c-text-45)" }}>
            Sena, Cardo et plus encore — disponibles en boutique à Wavre.
            Installation professionnelle sur votre casque, réservée aux produits achetés chez nous.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20" style={{ background: "var(--c-surface-page)" }}>
        <div className="container mx-auto px-4 space-y-16">
          {loading && (
            <div className="text-center py-20">
              <p className="font-display text-[11px] uppercase tracking-[0.35em]" style={{ color: "rgba(255,255,255,0.3)" }}>Chargement…</p>
            </div>
          )}

          {!loading && brands.map((brand, bi) => {
            const brandItems = intercoms.filter(i => i.brand === brand);
            return (
              <motion.div
                key={brand}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: bi * 0.1 }}
              >
                {/* Brand header */}
                <div className="flex items-end justify-between mb-8 pb-4" style={{ borderBottom: "1px solid rgba(201,151,58,0.12)" }}>
                  <div>
                    <p className="font-display text-[10px] uppercase tracking-[0.5em] mb-1" style={{ color: "rgba(201,151,58,0.5)" }}>Marque</p>
                    <h2 className="font-display text-4xl text-white leading-none">{brand}</h2>
                    {BRAND_TAGLINE[brand] && (
                      <p className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{BRAND_TAGLINE[brand]}</p>
                    )}
                  </div>
                </div>

                {/* Models grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {brandItems.map((item, ii) => {
                    const hasDetail = brand === "Sena" && item.slug;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: ii * 0.07 }}
                        className="group relative flex flex-col"
                        style={{
                          background: "var(--c-surface-card)",
                          border: "1px solid rgba(201,151,58,0.14)",
                          opacity: item.is_coming_soon ? 0.6 : 1,
                        }}
                      >
                        {/* Card body */}
                        <div className="p-5 flex-1">
                          {item.is_coming_soon && (
                            <p className="font-display text-[9px] uppercase tracking-[0.4em] mb-3" style={{ color: "#c9973a" }}>Bientôt disponible</p>
                          )}
                          <p className="font-display text-2xl text-white mb-2 group-hover:text-[#c9973a] transition-colors duration-300">{item.name}</p>
                          <p className="text-xs leading-relaxed" style={{ color: "var(--c-text-45)" }}>{item.description || ""}</p>
                        </div>

                        {/* Card footer */}
                        <div className="px-5 pb-5">
                          {hasDetail ? (
                            <Link
                              to={`/intercoms/${item.slug}`}
                              className="inline-flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.25em] transition-colors duration-200"
                              style={{ color: "#c9973a" }}
                            >
                              Voir le détail <ArrowRight className="w-3 h-3" />
                            </Link>
                          ) : (
                            <span className="font-display text-[11px] uppercase tracking-[0.25em]" style={{ color: "rgba(255,255,255,0.2)" }}>
                              {item.is_coming_soon ? "À venir" : "En boutique"}
                            </span>
                          )}
                        </div>

                        {/* Hover gold border */}
                        {!item.is_coming_soon && (
                          <div className="pointer-events-none absolute inset-0 border border-[#c9973a]/0 group-hover:border-[#c9973a]/30 transition-colors duration-300" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
