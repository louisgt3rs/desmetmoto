import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Award, Package, ShoppingBag, Wrench, Navigation, Plus, Minus } from "lucide-react";
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
  id: string;
  product_id: string;
  name: string;
  image_url: string | null;
}

/* ── Arai FAQ ──────────────────────────────────────────────────────── */
const ARAI_FAQ = [
  {
    q: "Qu'est-ce qu'un Arai Technical Pro Shop ?",
    a: "C'est le niveau de certification le plus élevé qu'Arai accorde à ses revendeurs. Seules quelques boutiques en Belgique détiennent ce titre. Cela signifie que notre équipe est formée directement par Arai pour conseiller, ajuster et fitter vos casques avec une expertise technique certifiée.",
  },
  {
    q: "Pourquoi acheter un casque Arai chez un Pro Shop plutôt qu'en ligne ?",
    a: "Un casque Arai doit être parfaitement adapté à la morphologie de votre tête. Chez Desmet Équipement, nous mesurons votre tête, testons plusieurs modèles et ajustons chaque détail pour garantir confort et sécurité optimaux. C'est un service impossible à obtenir en ligne.",
  },
  {
    q: "Quels modèles Arai sont disponibles en boutique à Wavre ?",
    a: "Nous stockons les modèles phares d'Arai : le SZ-R Evo, le Quantic et le RX-7V Evo. Contactez-nous pour vérifier la disponibilité d'un coloris spécifique.",
  },
  {
    q: "Proposez-vous un service de fitting Arai ?",
    a: "Oui, nous organisons régulièrement des journées Arai Essais & Fitting en boutique. Réservez votre créneau directement sur notre site pour un ajustement personnalisé par nos experts.",
  },
  {
    q: "Livrez-vous les casques Arai ?",
    a: "Nous sommes une boutique physique spécialisée. Nous recommandons fortement l'essai en boutique pour un casque de cette gamme, mais contactez-nous pour toute demande spécifique.",
  },
];

function AraiFAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Section heading */}
      <div className="flex flex-col items-center text-center mb-12">
        <p className="font-display text-[10px] uppercase tracking-[0.5em] mb-4" style={{ color: "rgba(201,151,58,0.6)" }}>
          Arai Pro Shop
        </p>
        <h2 className="font-display text-white mb-5" style={{ fontSize: "clamp(1.8rem,5vw,2.8rem)", letterSpacing: "0.1em" }}>
          QUESTIONS FRÉQUENTES
        </h2>
        <div className="flex items-center gap-3">
          <div className="h-px w-16" style={{ background: "linear-gradient(to right, transparent, rgba(201,151,58,0.5))" }} />
          <div className="h-1 w-1 rotate-45" style={{ background: "#c9973a", opacity: 0.7 }} />
          <div className="h-px w-16" style={{ background: "linear-gradient(to left, transparent, rgba(201,151,58,0.5))" }} />
        </div>
      </div>

      {/* Accordion */}
      <div className="max-w-2xl mx-auto space-y-0">
        {ARAI_FAQ.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              style={{
                borderBottom: "1px solid rgba(201,151,58,0.12)",
                borderTop: i === 0 ? "1px solid rgba(201,151,58,0.12)" : "none",
              }}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-start justify-between gap-4 py-5 text-left transition-colors"
                style={{ background: "transparent" }}
              >
                <span
                  className="font-display text-sm uppercase tracking-[0.1em] leading-snug transition-colors"
                  style={{ color: isOpen ? "#c9973a" : "var(--c-text-65)" }}
                >
                  {item.q}
                </span>
                <span className="shrink-0 mt-0.5" style={{ color: "#c9973a" }}>
                  {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p
                      className="pb-5 text-sm leading-relaxed"
                      style={{ color: "var(--c-text-50)" }}
                    >
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Grain texture rendered via SVG feTurbulence
function GrainOverlay() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: 0.04, mixBlendMode: "overlay" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}

export default function BrandDetailPage() {
  const { slug }      = useParams<{ slug: string }>();
  const navigate      = useNavigate();
  const { t }         = useLanguage();
  const [brand,       setBrand]       = useState<BrandRow | null>(null);
  const [products,    setProducts]    = useState<ProductRow[]>([]);
  const [colorways,   setColorways]   = useState<Record<string, ColorwayThumb[]>>({});
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setLoading(true);

      const { data: allBrands } = await supabase.from("brands").select("*");
      const found = (allBrands ?? []).find(
        (b) => b.name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
      );
      if (!found) { setBrand(null); setLoading(false); return; }
      setBrand(found);

      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("brand_id", found.id)
        .order("name");
      const prods = (productsData ?? []) as ProductRow[];
      setProducts(prods);

      if (prods.length > 0) {
        const { data: cwData } = await supabase
          .from("product_colorways")
          .select("id, product_id, name, image_url")
          .in("product_id", prods.map((p) => p.id))
          .order("sort_order");

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

  const WHY_ITEMS = [
    { icon: Award,       title: t("why_dealer"),  desc: t("why_dealer_desc") },
    { icon: Wrench,      title: t("why_test"),    desc: t("why_test_desc") },
    { icon: ShoppingBag, title: t("why_reserve"), desc: t("why_reserve_desc") },
  ];

  return (
    <Layout>
      <SEO
        title={brand ? `${brand.name} — Desmet Équipement` : "Marque — Desmet Équipement"}
        description={brand
          ? `Découvrez les produits ${brand.name} disponibles chez Desmet Équipement à Wavre. ${brand.description ?? ""}`.trim()
          : undefined}
      />

      {/* Loading */}
      {loading && (
        <div className="flex min-h-screen items-center justify-center bg-[#050505]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c9973a] border-t-transparent" />
        </div>
      )}

      {/* Not found */}
      {!loading && !brand && (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] px-4 text-center">
          <h1 className="font-display text-4xl uppercase tracking-widest text-white mb-4">{t("brand_not_found")}</h1>
          <p className="text-white/40 mb-8">{t("brand_not_found_text")}</p>
          <Link
            to="/brands"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-[#c9973a] hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" /> {t("back_to_brands")}
          </Link>
        </div>
      )}

      {/* Main content */}
      {!loading && brand && (
        <div className="min-h-screen bg-[#0a0a0a]">

          {/* ── Hero ─────────────────────────────────────────────────────────── */}
          <div
            className="relative overflow-hidden"
            style={{ background: "var(--c-surface-hero)", minHeight: "88vh" }}
          >
            {/* Carbon fiber diamond-weave texture */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    60deg,
                    rgba(255,255,255,0.016) 0px, rgba(255,255,255,0.016) 1px,
                    transparent 1px, transparent 7px
                  ),
                  repeating-linear-gradient(
                    -60deg,
                    rgba(255,255,255,0.016) 0px, rgba(255,255,255,0.016) 1px,
                    transparent 1px, transparent 7px
                  )
                `,
              }}
            />

            {/* Grain */}
            <GrainOverlay />

            {/* Radial gold glow — centre */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 65% 50% at 50% 42%, rgba(201,151,58,0.09) 0%, transparent 62%)",
              }}
            />

            {/* Subtle vignette */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 130% 100% at 50% 50%, transparent 38%, rgba(0,0,0,0.65) 100%)",
              }}
            />

            <div className="container relative z-10 mx-auto flex flex-col items-center px-4 pb-28 pt-10 text-center">

              {/* Back link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-16 self-start"
              >
                <Link
                  to="/brands"
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/20 transition-colors hover:text-[#c9973a]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> {t("back_to_brands")}
                </Link>
              </motion.div>

              {/* Logo — floating, no box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="relative mb-12 flex items-center justify-center"
                style={{ width: 200, height: 200 }}
              >
                {/* Glow halos */}
                <div
                  className="absolute"
                  style={{
                    inset: -40,
                    background: "radial-gradient(ellipse at center, rgba(201,151,58,0.22) 0%, transparent 68%)",
                    filter: "blur(20px)",
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    inset: -90,
                    background: "radial-gradient(ellipse at center, rgba(201,151,58,0.07) 0%, transparent 62%)",
                    filter: "blur(36px)",
                  }}
                />
                <div className="relative h-full w-full">
                  {brandForLogo && (
                    <BrandLogo brand={brandForLogo} size={200} darkFallback />
                  )}
                </div>
              </motion.div>

              {/* Badge */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="mb-5 font-display text-[9px] uppercase tracking-[0.55em] text-[#c9973a]/60"
              >
                Technical Pro Shop
              </motion.p>

              {/* Brand name — backlit gold glow */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="font-display leading-none text-white"
                style={{
                  fontSize: "clamp(5.5rem, 18vw, 13rem)",
                  letterSpacing: "0.14em",
                  fontWeight: 400,
                  textShadow:
                    "0 0 60px rgba(201,151,58,0.28), 0 0 120px rgba(201,151,58,0.12), 0 0 220px rgba(201,151,58,0.06)",
                }}
              >
                {brand.name.toUpperCase()}
              </motion.h1>

              {/* Description */}
              {brand.description && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.5 }}
                  className="mx-auto mt-6 max-w-md text-[13px] leading-relaxed tracking-wide text-white/30"
                >
                  {brand.description}
                </motion.p>
              )}

              {/* Decorative gold line */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="mt-10 flex items-center gap-3"
              >
                <div
                  className="h-px w-24"
                  style={{
                    background: "linear-gradient(to right, transparent, rgba(201,151,58,0.5))",
                  }}
                />
                <div
                  className="h-1 w-1 rotate-45"
                  style={{ background: "rgba(201,151,58,0.55)" }}
                />
                <div
                  className="h-px w-24"
                  style={{
                    background: "linear-gradient(to left, transparent, rgba(201,151,58,0.5))",
                  }}
                />
              </motion.div>
            </div>
          </div>

          {/* ── Why section — premium, aéré ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="border-b border-[#c9973a]/8 bg-[#080808]"
          >
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 divide-y divide-[#c9973a]/8 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {WHY_ITEMS.map(({ icon: Icon, title, desc }, i) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                    className="flex flex-col gap-4 px-8 py-10 first:pl-0 last:pr-0"
                  >
                    <Icon
                      className="h-[18px] w-[18px] shrink-0"
                      style={{ color: "rgba(201,151,58,0.5)", strokeWidth: 1.5 }}
                    />
                    <div>
                      <p className="font-display text-[11px] uppercase tracking-[0.28em] text-white/65">
                        {title}
                      </p>
                      <p className="mt-2 text-[12px] leading-relaxed text-white/25">
                        {desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Products grid ─────────────────────────────────────────────────── */}
          <div className="container mx-auto px-4 py-16">
            {products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mx-auto max-w-md border border-[#c9973a]/15 bg-[#111] p-12 text-center"
              >
                <Package className="mx-auto mb-4 h-10 w-10 text-[#c9973a]/30" />
                <p className="font-display text-xl uppercase tracking-widest text-white">
                  {t("brand_no_products")}
                </p>
                <p className="mt-2 text-sm text-white/35">
                  {t("brand_no_products_text")}
                </p>
                <Link
                  to="/contact"
                  className="mt-6 inline-flex h-10 items-center gap-2 border border-[#c9973a]/40 px-6 font-display text-xs uppercase tracking-[0.2em] text-[#c9973a] transition-colors hover:border-[#c9973a] hover:bg-[#c9973a]/8"
                >
                  {t("contact_us")}
                </Link>
              </motion.div>
            ) : (
              <>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-10 font-display text-[10px] uppercase tracking-[0.32em] text-white/18"
                >
                  {products.length} {products.length > 1 ? t("brand_products") : t("brand_product")}
                </motion.p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {products.map((product, i) => {
                    const cws = colorways[product.id] || [];
                    const inStock = (product.stock_quantity ?? 0) > 0;

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        onClick={() => navigate(`/marques/${slug}/${product.id}`)}
                        className="group cursor-pointer overflow-hidden transition-all duration-300"
                        style={{
                          background: "var(--c-bg-w025)",
                          border: inStock
                            ? "1px solid rgba(201,151,58,0.18)"
                            : "1px solid rgba(201,151,58,0.10)",
                          backdropFilter: "blur(8px)",
                          WebkitBackdropFilter: "blur(8px)",
                          boxShadow: "none",
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLDivElement;
                          el.style.border = "1px solid rgba(201,151,58,0.38)";
                          el.style.boxShadow = "0 0 40px rgba(201,151,58,0.08), inset 0 0 24px rgba(201,151,58,0.03)";
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLDivElement;
                          el.style.border = inStock
                            ? "1px solid rgba(201,151,58,0.18)"
                            : "1px solid rgba(201,151,58,0.10)";
                          el.style.boxShadow = "none";
                        }}
                      >
                        {/* Image */}
                        <div
                          className="relative aspect-square overflow-hidden"
                          style={{ background: "var(--c-bg-w02)" }}
                        >
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package className="h-12 w-12 text-white/8" />
                            </div>
                          )}

                          {/* Stock badge */}
                          <div
                            className={`absolute left-3 top-3 px-2.5 py-1 font-display text-[8px] uppercase tracking-[0.22em] ${
                              inStock
                                ? "bg-[#c9973a] text-[#050505]"
                                : "border border-white/8 bg-black/60 text-white/25 backdrop-blur-sm"
                            }`}
                          >
                            {inStock ? t("in_stock") : t("out_of_stock")}
                          </div>
                        </div>

                        {/* Card body */}
                        <div
                          className="px-5 py-4"
                          style={{ borderTop: "1px solid rgba(201,151,58,0.08)" }}
                        >
                          <h3 className="font-display text-sm uppercase tracking-[0.1em] text-white/80">
                            {product.name}
                          </h3>

                          {/* Colorway dots */}
                          {cws.length > 0 && (
                            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                              {cws.slice(0, 8).map((cw) => (
                                <div
                                  key={cw.id}
                                  title={cw.name}
                                  className="overflow-hidden"
                                  style={{
                                    width: 20,
                                    height: 20,
                                    border: "1px solid rgba(255,255,255,0.08)",
                                  }}
                                >
                                  {cw.image_url ? (
                                    <img
                                      src={cw.image_url}
                                      alt={cw.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-white/5">
                                      <span className="text-[7px] font-bold text-white/30">
                                        {cw.name.charAt(0)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {cws.length > 8 && (
                                <div
                                  className="flex h-5 w-5 items-center justify-center bg-white/4"
                                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                                >
                                  <span className="text-[8px] text-white/30">+{cws.length - 8}</span>
                                </div>
                              )}
                              <span className="ml-1 text-[10px] uppercase tracking-[0.14em] text-white/22">
                                {cws.length} {t("brand_colorways")}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* ── Arai FAQ ──────────────────────────────────────────────────────── */}
          {slug === "arai" && (
            <div style={{ background: "var(--c-surface-card)" }}>
              <AraiFAQ />
            </div>
          )}

          {/* ── Store experience section ──────────────────────────────────────── */}
          <div className="relative overflow-hidden" style={{ minHeight: 500 }}>

            {/* Background: dim store photo */}
            <img
              src={imgStore}
              alt="Intérieur du magasin Desmet Équipement"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ filter: "brightness(0.22) saturate(0.5)" }}
            />

            {/* Multi-layer overlay for depth */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.25) 40%, rgba(5,5,5,0.80) 100%)",
              }}
            />
            {/* Subtle gold centre bloom */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(201,151,58,0.06) 0%, transparent 65%)",
              }}
            />

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="container relative z-10 mx-auto flex flex-col items-center px-4 py-24 text-center"
            >
              {/* Location label */}
              <p className="mb-5 font-display text-[9px] uppercase tracking-[0.5em] text-[#c9973a]/55">
                Wavre · Belgique
              </p>

              {/* Title */}
              <h2
                className="font-display uppercase text-white leading-tight"
                style={{
                  fontSize: "clamp(2rem, 6vw, 4rem)",
                  letterSpacing: "0.12em",
                  fontWeight: 400,
                  textShadow: "0 0 40px rgba(201,151,58,0.18)",
                }}
              >
                {t("store_exp_title")}
              </h2>

              {/* Decorative line */}
              <div className="mt-6 flex items-center gap-3">
                <div
                  className="h-px w-16"
                  style={{ background: "linear-gradient(to right, transparent, rgba(201,151,58,0.4))" }}
                />
                <div className="h-0.5 w-0.5 rotate-45" style={{ background: "rgba(201,151,58,0.5)" }} />
                <div
                  className="h-px w-16"
                  style={{ background: "linear-gradient(to left, transparent, rgba(201,151,58,0.4))" }}
                />
              </div>

              {/* Quote */}
              <p className="mx-auto mt-7 max-w-md text-sm leading-relaxed text-white/35 italic">
                &ldquo;{t("store_exp_quote")}&rdquo;
              </p>

              {/* Buttons */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                {/* Solid champagne-gold */}
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-3 font-display text-[11px] uppercase tracking-[0.28em] transition-all duration-200"
                  style={{
                    background: "#c9973a",
                    color: "#050505",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "#d4a84a";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "#c9973a";
                  }}
                >
                  {t("store_exp_btn_primary")}
                </Link>

                {/* Frosted glass */}
                <a
                  href="https://maps.app.goo.gl/usjUYzvsD9vi72BD8?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3 font-display text-[11px] uppercase tracking-[0.28em] text-white/70 transition-all duration-200 hover:text-white"
                  style={{
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                  }}
                >
                  <Navigation className="h-3.5 w-3.5" />
                  {t("store_exp_btn_secondary")}
                </a>
              </div>
            </motion.div>
          </div>

        </div>
      )}
    </Layout>
  );
}
