import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Package, ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

type Accessory = {
  id: string; name: string; brand: string; category: string; slug: string;
  image_url: string | null; gallery_images: string[];
  prix: number | null; stock: number; description: string | null; is_coming_soon: boolean;
};

export default function AccessoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [item, setItem] = useState<Accessory | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("installation_accessories")
      .select("*")
      .eq("slug", slug)
      .single()
      .then(({ data }) => {
        if (data) {
          setItem({ ...data, gallery_images: Array.isArray(data.gallery_images) ? data.gallery_images as string[] : [] });
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--c-surface-hero)" }}>
        <p className="font-display text-[11px] uppercase tracking-[0.35em]" style={{ color: "rgba(255,255,255,0.25)" }}>Chargement…</p>
      </div>
    </Layout>
  );

  if (!item) return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--c-surface-hero)" }}>
        <p className="font-display text-[11px] uppercase tracking-[0.35em]" style={{ color: "rgba(255,255,255,0.3)" }}>Accessoire introuvable</p>
        <Link to="/intercoms" className="font-display text-xs uppercase tracking-[0.25em]" style={{ color: "#c9973a" }}>← Retour</Link>
      </div>
    </Layout>
  );

  const images = [item.image_url, ...item.gallery_images].filter(Boolean) as string[];
  const inStock = item.stock > 0 && !item.is_coming_soon;

  const handleAddToCart = () => {
    addItem({
      id: item.id,
      type: "product",
      name: `${item.brand} ${item.name}`,
      price: item.prix ?? 0,
      imageUrl: item.image_url ?? undefined,
    });
    toast.success("Ajouté au panier");
  };

  return (
    <Layout>
      <SEO
        title={`${item.brand} ${item.name} — ${item.category} | Desmet Équipement`}
        description={item.description?.slice(0, 155) ?? `${item.brand} ${item.name} disponible en boutique chez Desmet Équipement à Wavre.`}
        image={item.image_url ?? undefined}
        canonicalPath={`/intercoms/accessoires/${item.slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": `${item.brand} ${item.name}`,
          "brand": { "@type": "Brand", "name": item.brand },
          ...(item.image_url ? { "image": item.image_url } : {}),
          "category": item.category,
          ...(item.description ? { "description": item.description } : {}),
          ...(item.prix != null && item.prix > 0 ? {
            "offers": {
              "@type": "Offer",
              "priceCurrency": "EUR",
              "price": item.prix,
              "availability": item.stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "seller": { "@type": "Organization", "name": "Desmet Équipement" }
            }
          } : {}),
        }}
      />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: "var(--c-surface-hero)", minHeight: "90vh" }}>
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]" style={{ mixBlendMode: "overlay" }} aria-hidden="true">
          <filter id="grain-ad"><feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
          <rect width="100%" height="100%" filter="url(#grain-ad)"/>
        </svg>
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 60% at 70% 40%, rgba(201,151,58,0.07), transparent 60%)" }} />

        <div className="relative container mx-auto px-4 py-12 lg:py-20">
          {/* Back */}
          <Link
            to="/intercoms?section=accessoires"
            className="inline-flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.35em] mb-12 transition-colors"
            style={{ color: "rgba(255,255,255,0.3)" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c9973a"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)"}
          >
            <ArrowLeft className="w-3 h-3" /> Intercoms &amp; Accessoires
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* ── Left: Gallery ── */}
            <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              {images.length > 0 ? (
                <div className="space-y-3">
                  {/* Main image */}
                  <div className="relative overflow-hidden" style={{ border: "1px solid rgba(201,151,58,0.18)", background: "rgba(201,151,58,0.03)" }}>
                    <img
                      key={imgIdx}
                      src={images[imgIdx]}
                      alt={`${item.brand} ${item.name}`}
                      className="w-full object-contain"
                      style={{ display: "block" }}
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setImgIdx(i => Math.max(0, i - 1))}
                          disabled={imgIdx === 0}
                          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center transition-all disabled:opacity-20"
                          style={{ background: "rgba(5,5,5,0.75)", border: "1px solid rgba(201,151,58,0.2)", color: "#fff" }}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setImgIdx(i => Math.min(images.length - 1, i + 1))}
                          disabled={imgIdx === images.length - 1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center transition-all disabled:opacity-20"
                          style={{ background: "rgba(5,5,5,0.75)", border: "1px solid rgba(201,151,58,0.2)", color: "#fff" }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                      {images.map((src, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIdx(i)}
                          className="shrink-0 overflow-hidden transition-all"
                          style={{
                            width: 64, height: 64,
                            border: `1px solid ${i === imgIdx ? "#c9973a" : "rgba(201,151,58,0.15)"}`,
                            opacity: i === imgIdx ? 1 : 0.55,
                            background: "rgba(201,151,58,0.03)",
                          }}
                        >
                          <img src={src} alt="" className="w-full h-full object-contain" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center" style={{ border: "1px solid rgba(201,151,58,0.15)", background: "rgba(201,151,58,0.03)" }}>
                  <Package className="w-16 h-16" style={{ color: "rgba(201,151,58,0.15)" }} />
                </div>
              )}
            </motion.div>

            {/* ── Right: Info ── */}
            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="space-y-8">

              {/* Kicker */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px w-8" style={{ background: "linear-gradient(to right, rgba(201,151,58,0.6), transparent)" }} />
                  <span className="font-display text-[10px] uppercase tracking-[0.5em]" style={{ color: "rgba(201,151,58,0.6)" }}>
                    {item.brand} — {item.category}
                  </span>
                </div>
                <h1
                  className="font-display leading-none mb-3"
                  style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", color: "var(--c-text)", textShadow: "0 0 60px rgba(201,151,58,0.15)" }}
                >
                  {item.name.toUpperCase()}
                </h1>

                {/* Price + stock */}
                <div className="flex items-center gap-5 mt-4">
                  {item.prix != null && (
                    <span className="font-display text-3xl" style={{ color: "#c9973a" }}>
                      {item.prix.toLocaleString("fr-BE", { minimumFractionDigits: 2 })} €
                    </span>
                  )}
                  <span
                    className="font-display text-[10px] uppercase tracking-[0.3em] px-3 py-1"
                    style={{
                      background: inStock ? "rgba(201,151,58,0.12)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${inStock ? "rgba(201,151,58,0.4)" : "rgba(255,255,255,0.1)"}`,
                      color: inStock ? "#c9973a" : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {item.is_coming_soon ? "Bientôt disponible" : inStock ? `En stock — ${item.stock} unité${item.stock > 1 ? "s" : ""}` : "Sur commande"}
                  </span>
                </div>
              </div>

              {/* Description */}
              {item.description && (
                <div className="space-y-3">
                  {item.description.split("\n\n").map((para, i) => (
                    <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--c-text-55)" }}>{para}</p>
                  ))}
                </div>
              )}

              {/* Divider */}
              <div className="h-px" style={{ background: "rgba(201,151,58,0.12)" }} />

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={item.is_coming_soon}
                  className="inline-flex items-center justify-center gap-3 font-display text-sm uppercase tracking-[0.25em] px-8 py-4 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "#c9973a", color: "#050505" }}
                  onMouseEnter={e => { if (!item.is_coming_soon) (e.currentTarget as HTMLElement).style.background = "#d4a44a"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#c9973a"; }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {item.is_coming_soon ? "Bientôt disponible" : "Ajouter au panier"}
                </button>
              </div>

              {/* Notice */}
              <div className="px-4 py-3 text-xs" style={{ background: "rgba(201,151,58,0.04)", borderLeft: "2px solid rgba(201,151,58,0.3)", color: "var(--c-text-40)" }}>
                Disponible en boutique à Wavre — Desmet Équipement
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
