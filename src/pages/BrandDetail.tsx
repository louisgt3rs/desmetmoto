import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Award, Package, ShoppingBag, Wrench, Navigation, Plus, Minus, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { BrandLogo } from "@/components/home/BrandModal";
import type { BrandModalBrand } from "@/components/home/BrandModal";
import { useLanguage } from "@/contexts/LanguageContext";
import imgStore from "@/assets/store-interior-alpinestars.jpeg";

type BrandRow = Tables<"brands">;
type ProductRow = Tables<"products">;

interface ColorwayThumb {
  id: string; product_id: string; name: string; image_url: string | null;
}

/* ── Arai FAQ ── */
const ARAI_FAQ = [
  { q: "Qu'est-ce qu'un Arai Technical Pro Shop ?", a: "C'est le niveau de certification le plus élevé qu'Arai accorde à ses revendeurs. Seules quelques boutiques en Belgique détiennent ce titre. Cela signifie que notre équipe est formée directement par Arai pour conseiller, ajuster et fitter vos casques avec une expertise technique certifiée." },
  { q: "Pourquoi acheter un casque Arai chez un Pro Shop plutôt qu'en ligne ?", a: "Un casque Arai doit être parfaitement adapté à la morphologie de votre tête. Chez Desmet Équipement, nous mesurons votre tête, testons plusieurs modèles et ajustons chaque détail pour garantir confort et sécurité optimaux. C'est un service impossible à obtenir en ligne." },
  { q: "Quels modèles Arai sont disponibles en boutique à Wavre ?", a: "Nous stockons les modèles phares d'Arai : le SZ-R Evo, le Quantic et le RX-7V Evo. Contactez-nous pour vérifier la disponibilité d'un coloris spécifique." },
  { q: "Proposez-vous un service de fitting Arai ?", a: "Oui, nous organisons régulièrement des journées Arai Essais & Fitting en boutique. Réservez votre créneau directement sur notre site pour un ajustement personnalisé par nos experts." },
  { q: "Livrez-vous les casques Arai ?", a: "Nous sommes une boutique physique spécialisée. Nous recommandons fortement l'essai en boutique pour un casque de cette gamme, mais contactez-nous pour toute demande spécifique." },
];

function AraiFAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-24" style={{ background: "var(--c-surface-hero)" }}>
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-10" style={{ background: "linear-gradient(to right, rgba(201,151,58,0.6), transparent)" }} />
            <div className="h-1 w-1 rotate-45" style={{ background: "#c9973a", opacity: 0.7 }} />
            <span className="font-display text-[10px] uppercase tracking-[0.5em]" style={{ color: "rgba(201,151,58,0.7)" }}>Arai Pro Shop</span>
          </div>
          <h2 className="font-display leading-none" style={{ fontSize: "clamp(2rem,5vw,3.2rem)", color: "var(--c-text)" }}>
            QUESTIONS FRÉQUENTES
          </h2>
        </div>
        <div className="divide-y" style={{ borderTop: "1px solid rgba(201,151,58,0.12)", borderBottom: "1px solid rgba(201,151,58,0.12)", borderColor: "rgba(201,151,58,0.12)" }}>
          {ARAI_FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{ borderColor: "rgba(201,151,58,0.1)" }}>
                <button onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center justify-between gap-4 py-5 text-left">
                  <span className="font-display text-sm uppercase tracking-[0.1em] leading-snug transition-colors" style={{ color: isOpen ? "#c9973a" : "var(--c-text-65)" }}>{item.q}</span>
                  <span className="shrink-0" style={{ color: "#c9973a" }}>{isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}</span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <p className="pb-5 text-sm leading-relaxed" style={{ color: "var(--c-text-50)" }}>{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function BrandDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [brand, setBrand] = useState<BrandRow | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [colorways, setColorways] = useState<Record<string, ColorwayThumb[]>>({});
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("tout");

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setLoading(true);
      const { data: allBrands } = await supabase.from("brands").select("*");
      const found = (allBrands ?? []).find(b => b.name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase());
      if (!found) { setBrand(null); setLoading(false); return; }
      setBrand(found);

      const { data: productsData } = await supabase.from("products").select("*").eq("brand_id", found.id).order("name");
      const prods = (productsData ?? []) as ProductRow[];
      setProducts(prods);

      if (prods.length > 0) {
        const { data: cwData } = await supabase.from("product_colorways").select("id, product_id, name, image_url").in("product_id", prods.map(p => p.id)).order("sort_order");
        const grouped: Record<string, ColorwayThumb[]> = {};
        for (const cw of cwData ?? []) {
          if (!grouped[cw.product_id]) grouped[cw.product_id] = [];
          grouped[cw.product_id].push(cw as ColorwayThumb);
        }
        setColorways(grouped);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  const brandForLogo: BrandModalBrand | null = brand
    ? { id: brand.id, name: brand.name, logo_url: brand.logo_url, description: brand.description }
    : null;

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))] as string[];
    return cats;
  }, [products]);

  const filtered = useMemo(() => {
    if (catFilter === "tout") return products;
    return products.filter(p => p.category === catFilter);
  }, [products, catFilter]);

  const WHY_ITEMS = [
    { icon: Award, title: t("why_dealer"), desc: t("why_dealer_desc") },
    { icon: Wrench, title: t("why_test"), desc: t("why_test_desc") },
    { icon: ShoppingBag, title: t("why_reserve"), desc: t("why_reserve_desc") },
  ];

  return (
    <Layout>
      <SEO
        title={brand ? `${brand.name} — Desmet Équipement Wavre` : "Marque — Desmet Équipement"}
        description={brand ? `Découvrez tous les produits ${brand.name} disponibles chez Desmet Équipement à Wavre. Revendeur officiel certifié. ${brand.description ?? ""}`.slice(0, 155).trim() : undefined}
        image={brand?.logo_url ?? undefined}
        canonicalPath={`/marques/${slug}`}
        jsonLd={brand ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": `Produits ${brand.name} — Desmet Équipement`,
          "description": `Tous les produits ${brand.name} disponibles en boutique à Wavre`,
          "url": `https://www.desmetequipement.com/marques/${slug}`,
          "provider": { "@type": "Organization", "name": "Desmet Équipement" }
        } : undefined}
      />

      {loading && (
        <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--c-surface-hero)" }}>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c9973a] border-t-transparent" />
        </div>
      )}

      {!loading && !brand && (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center" style={{ background: "var(--c-surface-hero)" }}>
          <h1 className="font-display text-4xl uppercase tracking-widest mb-4" style={{ color: "var(--c-text)" }}>{t("brand_not_found")}</h1>
          <Link to="/brands" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-[#c9973a] hover:opacity-70 transition-opacity">
            <ArrowLeft className="h-4 w-4" /> {t("back_to_brands")}
          </Link>
        </div>
      )}

      {!loading && brand && (
        <div className="min-h-screen" style={{ background: "var(--c-surface-page)" }}>

          {/* ── HERO ── */}
          <div className="relative overflow-hidden" style={{ background: "var(--c-surface-hero)", minHeight: "100vh" }}>
            {/* Carbon weave */}
            <div className="pointer-events-none absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(60deg,rgba(255,255,255,0.014) 0px,rgba(255,255,255,0.014) 1px,transparent 1px,transparent 7px),repeating-linear-gradient(-60deg,rgba(255,255,255,0.014) 0px,rgba(255,255,255,0.014) 1px,transparent 1px,transparent 7px)`,
            }} />
            {/* Grain */}
            <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]" style={{ mixBlendMode: "overlay" }} aria-hidden="true">
              <filter id="grain-bd"><feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
              <rect width="100%" height="100%" filter="url(#grain-bd)"/>
            </svg>
            {/* Gold halo */}
            <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(201,151,58,0.1), transparent 65%)" }} />
            {/* Vignette */}
            <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 130% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />

            <div className="relative z-10 flex flex-col min-h-screen">
              {/* Back */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                className="container mx-auto px-4 pt-10"
              >
                <Link to="/brands" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] transition-colors" style={{ color: "rgba(255,255,255,0.2)" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c9973a"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.2)"}
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> {t("back_to_brands")}
                </Link>
              </motion.div>

              {/* Center */}
              <div className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">

                {/* Logo */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="relative mb-12"
                  style={{ width: "min(340px, 70vw)", height: "min(200px, 40vw)" }}
                >
                  <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(201,151,58,0.15) 0%, transparent 70%)", filter: "blur(32px)" }} />
                  {brand.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="relative z-10 w-full h-full object-contain"
                    />
                  ) : (
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      <span className="font-display text-white tracking-widest" style={{ fontSize: "clamp(2rem,8vw,5rem)" }}>{brand.name.toUpperCase()}</span>
                    </div>
                  )}
                </motion.div>

                {/* Gold line */}
                <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
                  className="flex items-center gap-3 mb-8"
                >
                  <div className="h-px w-20" style={{ background: "linear-gradient(to right, transparent, rgba(201,151,58,0.6))" }} />
                  <div className="h-1 w-1 rotate-45" style={{ background: "#c9973a" }} />
                  <div className="h-px w-20" style={{ background: "linear-gradient(to left, transparent, rgba(201,151,58,0.6))" }} />
                </motion.div>

                {/* Description */}
                {brand.description && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.5 }}
                    className="max-w-lg text-sm leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    {brand.description}
                  </motion.p>
                )}

                {/* Stats */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }}
                  className="flex items-stretch"
                  style={{ border: "1px solid rgba(201,151,58,0.15)" }}
                >
                  {[
                    { value: products.length.toString(), label: products.length > 1 ? "Modèles" : "Modèle" },
                    { value: products.filter(p => (p.stock_quantity ?? 0) > 0).length.toString(), label: "En stock" },
                    { value: "Wavre", label: "Belgique" },
                  ].map(({ value, label }, i) => (
                    <div key={i} className="px-8 py-4 text-center" style={{ borderLeft: i > 0 ? "1px solid rgba(201,151,58,0.15)" : "none" }}>
                      <p className="font-display text-2xl leading-none" style={{ color: "#c9973a" }}>{value}</p>
                      <p className="font-display text-[9px] uppercase tracking-[0.3em] mt-1" style={{ color: "rgba(255,255,255,0.28)" }}>{label}</p>
                    </div>
                  ))}
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                  className="mt-14 flex flex-col items-center gap-2"
                >
                  <div className="w-px h-10" style={{ background: "linear-gradient(to bottom, rgba(201,151,58,0.4), transparent)" }} />
                </motion.div>
              </div>
            </div>
          </div>

          {/* ── WHY ── */}
          <div style={{ background: "var(--c-surface-hero)", borderTop: "1px solid rgba(201,151,58,0.08)", borderBottom: "1px solid rgba(201,151,58,0.08)" }}>
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: "rgba(201,151,58,0.08)" }}>
                {WHY_ITEMS.map(({ icon: Icon, title, desc }, i) => (
                  <motion.div key={title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex gap-5 px-8 py-10 first:pl-0 last:pr-0" style={{ borderColor: "rgba(201,151,58,0.08)" }}
                  >
                    <Icon className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "rgba(201,151,58,0.5)", strokeWidth: 1.5 }} />
                    <div>
                      <p className="font-display text-[11px] uppercase tracking-[0.28em]" style={{ color: "var(--c-text-65)" }}>{title}</p>
                      <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--c-text-30)" }}>{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* ── PRODUCTS ── */}
          <div className="py-20" style={{ background: "var(--c-surface-page)" }}>
            <div className="container mx-auto px-4">

              {/* Section header */}
              <div className="flex items-end justify-between mb-10">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px w-8" style={{ background: "linear-gradient(to right, rgba(201,151,58,0.6), transparent)" }} />
                    <span className="font-display text-[10px] uppercase tracking-[0.45em]" style={{ color: "rgba(201,151,58,0.6)" }}>Collection</span>
                  </div>
                  <h2 className="font-display leading-none" style={{ fontSize: "clamp(1.8rem,4vw,3rem)", color: "var(--c-text)" }}>
                    TOUS LES MODÈLES
                  </h2>
                </div>
                <span className="font-display text-[10px] uppercase tracking-[0.25em] hidden sm:block" style={{ color: "rgba(255,255,255,0.18)" }}>
                  {products.length} produit{products.length > 1 ? "s" : ""}
                </span>
              </div>

              {/* Category filters */}
              {categories.length > 1 && (
                <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                  {["tout", ...categories].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCatFilter(cat)}
                      className="shrink-0 px-5 py-2 font-display text-[10px] uppercase tracking-[0.25em] transition-all"
                      style={{
                        background: catFilter === cat ? "rgba(201,151,58,0.12)" : "transparent",
                        border: `1px solid ${catFilter === cat ? "rgba(201,151,58,0.5)" : "rgba(201,151,58,0.15)"}`,
                        color: catFilter === cat ? "#c9973a" : "var(--c-text-35)",
                      }}
                    >
                      {cat === "tout" ? "Tout" : cat}
                    </button>
                  ))}
                </div>
              )}

              {filtered.length === 0 ? (
                <div className="mx-auto max-w-md p-12 text-center" style={{ border: "1px solid rgba(201,151,58,0.12)" }}>
                  <Package className="mx-auto mb-4 h-10 w-10" style={{ color: "rgba(201,151,58,0.25)" }} />
                  <p className="font-display text-xl uppercase tracking-widest" style={{ color: "var(--c-text)" }}>{t("brand_no_products")}</p>
                </div>
              ) : (
                <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filtered.map((product, i) => {
                    const cws = colorways[product.id] || [];
                    const inStock = (product.stock_quantity ?? 0) > 0;
                    const mainImg = product.image_url ?? cws[0]?.image_url ?? null;

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
                        className="group cursor-pointer relative overflow-hidden"
                        style={{ background: "var(--c-surface-page)", boxShadow: "inset 0 0 0 1px rgba(201,151,58,0.08)" }}
                        onClick={() => navigate(`/marques/${slug}/${product.id}`)}
                      >
                        {/* Image — portrait 3:4 */}
                        <div className="relative overflow-hidden" style={{ aspectRatio: "3/4", background: "var(--c-surface-hero)" }}>
                          {mainImg ? (
                            <img
                              src={mainImg}
                              alt={product.name}
                              className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-108"
                              loading="lazy"
                              style={{ transform: "scale(1)", transition: "transform 0.7s cubic-bezier(0.16,1,0.3,1)" }}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package className="h-12 w-12" style={{ color: "rgba(255,255,255,0.08)" }} />
                            </div>
                          )}

                          {/* Overlay on hover */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end"
                            style={{ background: "linear-gradient(to top, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.2) 50%, transparent 100%)" }}
                          >
                            <div className="p-5 w-full">
                              <p className="font-display text-xs uppercase tracking-[0.2em] text-white flex items-center gap-2">
                                Voir le produit <ArrowRight className="w-3 h-3" />
                              </p>
                            </div>
                          </div>

                          {/* Stock badge */}
                          <div className={`absolute top-3 left-3 px-2.5 py-1 font-display text-[8px] uppercase tracking-[0.22em] ${inStock ? "bg-[#c9973a] text-[#050505]" : "border text-white/30"}`}
                            style={!inStock ? { borderColor: "rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.6)" } : {}}
                          >
                            {inStock ? t("in_stock") : t("out_of_stock")}
                          </div>

                          {/* Colorways count */}
                          {cws.length > 1 && (
                            <div className="absolute top-3 right-3 px-2 py-1 font-display text-[8px] uppercase tracking-[0.2em]"
                              style={{ background: "rgba(5,5,5,0.75)", color: "rgba(201,151,58,0.8)", border: "1px solid rgba(201,151,58,0.2)" }}
                            >
                              {cws.length} coloris
                            </div>
                          )}
                        </div>

                        {/* Card body */}
                        <div className="p-4" style={{ borderTop: "1px solid rgba(201,151,58,0.08)" }}>
                          {product.category && (
                            <p className="font-display text-[9px] uppercase tracking-[0.4em] mb-1.5" style={{ color: "rgba(201,151,58,0.5)" }}>
                              {product.category}
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

                          {/* Colorway swatches */}
                          {cws.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {cws.slice(0, 6).map(cw => (
                                <div key={cw.id} title={cw.name} className="overflow-hidden"
                                  style={{ width: 18, height: 18, border: "1px solid rgba(255,255,255,0.1)" }}
                                >
                                  {cw.image_url
                                    ? <img src={cw.image_url} alt={cw.name} className="h-full w-full object-cover" />
                                    : <div className="flex h-full w-full items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}><span className="text-[6px]" style={{ color: "rgba(255,255,255,0.3)" }}>{cw.name.charAt(0)}</span></div>
                                  }
                                </div>
                              ))}
                              {cws.length > 6 && (
                                <div className="flex h-[18px] w-[18px] items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                  <span className="text-[7px]" style={{ color: "rgba(255,255,255,0.3)" }}>+{cws.length - 6}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── ARAI FAQ ── */}
          {slug === "arai" && <AraiFAQ />}

          {/* ── STORE ── */}
          <div className="relative overflow-hidden" style={{ minHeight: 480 }}>
            <img src={imgStore} alt="Desmet Équipement" className="absolute inset-0 h-full w-full object-cover" style={{ filter: "brightness(0.22) saturate(0.5)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(5,5,5,0.6) 0%, rgba(5,5,5,0.2) 40%, rgba(5,5,5,0.85) 100%)" }} />
            <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(201,151,58,0.07), transparent 65%)" }} />

            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="container relative z-10 mx-auto flex flex-col items-center px-4 py-24 text-center"
            >
              <p className="mb-5 font-display text-[9px] uppercase tracking-[0.5em]" style={{ color: "rgba(201,151,58,0.55)" }}>Wavre · Belgique</p>
              <h2 className="font-display uppercase text-white leading-tight" style={{ fontSize: "clamp(2rem,6vw,4rem)", letterSpacing: "0.12em", textShadow: "0 0 40px rgba(201,151,58,0.18)" }}>
                {t("store_exp_title")}
              </h2>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-px w-16" style={{ background: "linear-gradient(to right, transparent, rgba(201,151,58,0.4))" }} />
                <div className="h-0.5 w-0.5 rotate-45" style={{ background: "rgba(201,151,58,0.5)" }} />
                <div className="h-px w-16" style={{ background: "linear-gradient(to left, transparent, rgba(201,151,58,0.4))" }} />
              </div>
              <p className="mx-auto mt-7 max-w-md text-sm leading-relaxed italic" style={{ color: "rgba(255,255,255,0.35)" }}>
                &ldquo;{t("store_exp_quote")}&rdquo;
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-3.5 font-display text-[11px] uppercase tracking-[0.28em] transition-all duration-200"
                  style={{ background: "#c9973a", color: "#050505" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#d4a84a"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#c9973a"}
                >
                  {t("store_exp_btn_primary")}
                </Link>
                <a href="https://maps.app.goo.gl/usjUYzvsD9vi72BD8?g_st=ic" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 font-display text-[11px] uppercase tracking-[0.28em] transition-all duration-200"
                  style={{ border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
                >
                  <Navigation className="h-3.5 w-3.5" /> {t("store_exp_btn_secondary")}
                </a>
              </div>
            </motion.div>
          </div>

        </div>
      )}
    </Layout>
  );
}
