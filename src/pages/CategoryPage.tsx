import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, ShirtIcon, HandMetal, Footprints } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

const CATEGORY_MAP: Record<string, { label: string; dbValue: string }> = {
  vestes: { label: "Vestes & Blousons", dbValue: "Blousons" },
  gants: { label: "Gants", dbValue: "Gants" },
  bottes: { label: "Bottes", dbValue: "Bottes" },
};

const CategoryIcon = ({ slug }: { slug: string }) => {
  const cls = "w-16 h-16 text-[#c9973a]/40";
  if (slug === "vestes") return <ShirtIcon className={cls} />;
  if (slug === "gants") return <HandMetal className={cls} />;
  if (slug === "bottes") return <Footprints className={cls} />;
  return <Package className={cls} />;
};

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [hasProducts, setHasProducts] = useState(false);

  const cat = slug ? CATEGORY_MAP[slug] : null;

  useEffect(() => {
    if (!cat) { setLoading(false); return; }
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category", cat.dbValue)
      .eq("in_stock", true)
      .then(({ count }) => {
        setHasProducts((count ?? 0) > 0);
        setLoading(false);
      });
  }, [slug]);

  if (!cat) {
    return (
      <Layout>
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center" style={{ background: "var(--c-surface-page)" }}>
          <Package className="mb-4 h-12 w-12" style={{ color: "rgba(201,151,58,0.25)" }} />
          <p className="font-display text-2xl uppercase tracking-widest text-white mb-4">Catégorie introuvable</p>
          <Link to="/brands" className="font-display text-[11px] uppercase tracking-[0.3em]" style={{ color: "#c9973a" }}>
            ← Voir toutes les marques
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={`${cat.label} — Desmet Équipement`}
        description={`Découvrez notre sélection de ${cat.label.toLowerCase()} moto disponibles en magasin à Wavre.`}
      />
      <section
        className="min-h-[80vh] flex items-center justify-center py-24"
        style={{ background: "var(--c-surface-page)" }}
      >
        {!loading && !hasProducts && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center px-4"
          >
            {/* Decorative ring */}
            <div className="relative mb-10">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center"
                style={{
                  border: "1px solid rgba(201,151,58,0.2)",
                  background: "radial-gradient(circle, rgba(201,151,58,0.06) 0%, transparent 70%)",
                }}
              >
                <CategoryIcon slug={slug!} />
              </div>
              {/* Outer ring */}
              <div
                className="absolute -inset-3 rounded-full"
                style={{ border: "1px solid rgba(201,151,58,0.08)" }}
              />
            </div>

            {/* Decorative line */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-12" style={{ background: "linear-gradient(to right, transparent, rgba(201,151,58,0.5))" }} />
              <div className="h-1 w-1 rotate-45" style={{ background: "#c9973a", opacity: 0.5 }} />
              <div className="h-px w-12" style={{ background: "linear-gradient(to left, transparent, rgba(201,151,58,0.5))" }} />
            </div>

            <p
              className="font-display text-[9px] uppercase tracking-[0.5em] mb-4"
              style={{ color: "rgba(201,151,58,0.6)" }}
            >
              {cat.label}
            </p>

            <h1
              className="font-display mb-4"
              style={{
                fontSize: "clamp(1.8rem, 6vw, 3.2rem)",
                color: "var(--c-text)",
                lineHeight: 1.1,
              }}
            >
              AUCUN PRODUIT
              <br />
              DISPONIBLE
            </h1>

            <p
              className="text-sm leading-relaxed max-w-xs mb-10"
              style={{ color: "var(--c-text-40)" }}
            >
              Revenez bientôt, nous mettons notre catalogue à jour.
            </p>

            <Link
              to="/"
              className="inline-flex items-center gap-3 font-display text-xs uppercase tracking-[0.3em] px-8 py-4 transition-all duration-300"
              style={{
                border: "1px solid rgba(201,151,58,0.4)",
                color: "#c9973a",
                background: "rgba(201,151,58,0.04)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(201,151,58,0.12)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,151,58,0.7)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(201,151,58,0.04)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,151,58,0.4)";
              }}
            >
              Retour à l'accueil
              <span>→</span>
            </Link>
          </motion.div>
        )}
      </section>
    </Layout>
  );
}
