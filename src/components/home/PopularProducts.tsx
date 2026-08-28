import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Package, ArrowRight } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useLanguage } from "@/contexts/LanguageContext";

type Product = Tables<"products"> & {
  brands?: { name: string } | null;
};

function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

const CATEGORIES = [
  { label: "Tous", value: "all" },
  { label: "Casques", value: "casques" },
  { label: "Vestes", value: "vestes" },
  { label: "Gants", value: "gants" },
  { label: "Bottes", value: "bottes" },
];

export default function PopularProducts() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [active, setActive] = useState("all");

  useEffect(() => {
    supabase
      .from("products")
      .select("*, brands(name)")
      .order("sort_order")
      .limit(8)
      .then(({ data }) => { if (data) setProducts(data as Product[]); });
  }, []);

  const filtered = active === "all"
    ? products
    : products.filter(p => (p.category || "").toLowerCase() === active);

  return (
    <section className="py-20" style={{ background: "var(--c-surface-page)" }}>
      <div className="container mx-auto px-4">
        <SectionHeading title="PRODUITS POPULAIRES" subtitle="Notre sélection d'équipements phares" />

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActive(cat.value)}
              className="shrink-0 px-5 py-2 font-display text-[10px] uppercase tracking-[0.25em] transition-all"
              style={{
                background: active === cat.value ? "rgba(201,151,58,0.12)" : "transparent",
                border: `1px solid ${active === cat.value ? "rgba(201,151,58,0.5)" : "rgba(201,151,58,0.15)"}`,
                color: active === cat.value ? "#c9973a" : "var(--c-text-35)",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mx-auto max-w-sm py-20 text-center">
            <div className="mb-6 flex items-center justify-center gap-3">
              <div className="h-px w-12" style={{ background: "linear-gradient(to right, transparent, rgba(201,151,58,0.4))" }} />
              <div className="h-1 w-1 rotate-45" style={{ background: "rgba(201,151,58,0.4)" }} />
              <div className="h-px w-12" style={{ background: "linear-gradient(to left, transparent, rgba(201,151,58,0.4))" }} />
            </div>
            <p className="font-display text-lg uppercase tracking-widest mb-3" style={{ color: "var(--c-text-65)" }}>
              Collection à venir
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--c-text-35)" }}>
              Cette catégorie sera bientôt disponible en boutique.<br />N'hésitez pas à nous contacter pour toute demande.
            </p>
          </div>
        ) : (
          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: "rgba(201,151,58,0.08)" }}>
            {filtered.map((product, i) => {
              const brandSlug = product.brands?.name ? nameToSlug(product.brands.name) : null;
              const inStock = (product.stock_quantity ?? 0) > 0;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
                  className="group cursor-pointer relative overflow-hidden"
                  style={{ background: "var(--c-surface-page)" }}
                  onClick={() => brandSlug && navigate(`/marques/${brandSlug}/${product.id}`)}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: "3/4", background: "var(--c-surface-hero)" }}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain p-6"
                        loading="lazy"
                        style={{ transition: "transform 0.7s cubic-bezier(0.16,1,0.3,1)" }}
                        onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)"}
                        onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"}
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
                        <Package className="h-8 w-8" style={{ color: "rgba(201,151,58,0.2)" }} />
                        <p className="font-display text-[9px] uppercase tracking-[0.35em] text-center" style={{ color: "rgba(255,255,255,0.18)" }}>
                          Photo disponible en boutique
                        </p>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end"
                      style={{ background: "linear-gradient(to top, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.2) 50%, transparent 100%)" }}
                    >
                      <div className="p-5 w-full">
                        <p className="font-display text-xs uppercase tracking-[0.2em] text-white flex items-center gap-2">
                          Voir &amp; réserver <ArrowRight className="w-3 h-3" />
                        </p>
                      </div>
                    </div>

                    {/* Stock badge */}
                    <div
                      className={`absolute top-3 left-3 px-2.5 py-1 font-display text-[8px] uppercase tracking-[0.22em]`}
                      style={inStock
                        ? { background: "#c9973a", color: "#050505" }
                        : { border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.3)" }
                      }
                    >
                      {inStock ? t("in_stock") : t("out_of_stock")}
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4" style={{ borderTop: "1px solid rgba(201,151,58,0.08)" }}>
                    {product.brands?.name && (
                      <p className="font-display text-[9px] uppercase tracking-[0.4em] mb-1" style={{ color: "rgba(201,151,58,0.5)" }}>
                        {product.brands.name}
                      </p>
                    )}
                    <h3 className="font-display text-sm uppercase tracking-[0.1em] leading-tight" style={{ color: "var(--c-text)" }}>
                      {product.name}
                    </h3>
                    {product.price && (
                      <p className="font-display text-sm mt-2" style={{ color: "#c9973a" }}>
                        {Number(product.price).toLocaleString("fr-BE", { minimumFractionDigits: 2 })} €
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
