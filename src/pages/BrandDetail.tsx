import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Award, Package, ShoppingBag, Wrench } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { BrandLogo } from "@/components/home/BrandModal";
import type { BrandModalBrand } from "@/components/home/BrandModal";
import { useLanguage } from "@/contexts/LanguageContext";

type BrandRow = Tables<"brands">;
type ProductRow = Tables<"products">;

interface ColorwayThumb {
  id: string;
  product_id: string;
  name: string;
  image_url: string | null;
}

// Grain texture rendered via SVG feTurbulence
function GrainOverlay() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: 0.035, mixBlendMode: "overlay" }}
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
        <div className="flex min-h-screen items-center justify-center bg-[#0e0e0e]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c9973a] border-t-transparent" />
        </div>
      )}

      {/* Not found */}
      {!loading && !brand && (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0e0e0e] px-4 text-center">
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
        <div className="min-h-screen bg-[#0e0e0e]">

          {/* ── Hero ─────────────────────────────────────────────────────────── */}
          <div
            className="relative overflow-hidden"
            style={{ background: "#080808", minHeight: "88vh" }}
          >
            {/* Grain */}
            <GrainOverlay />

            {/* Radial gold glow — centre */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 70% 55% at 50% 42%, rgba(201,151,58,0.07) 0%, transparent 65%)",
              }}
            />

            {/* Subtle vignette */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)",
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
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/25 transition-colors hover:text-[#c9973a]"
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
                {/* Glow halo behind logo */}
                <div
                  className="absolute"
                  style={{
                    inset: -40,
                    background:
                      "radial-gradient(ellipse at center, rgba(201,151,58,0.18) 0%, transparent 68%)",
                    filter: "blur(18px)",
                  }}
                />
                {/* Second softer outer glow */}
                <div
                  className="absolute"
                  style={{
                    inset: -80,
                    background:
                      "radial-gradient(ellipse at center, rgba(201,151,58,0.06) 0%, transparent 65%)",
                    filter: "blur(32px)",
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
                className="mb-5 font-display text-[9px] uppercase tracking-[0.55em] text-[#c9973a]/65"
              >
                Technical Pro Shop
              </motion.p>

              {/* Brand name */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="font-display leading-none text-white"
                style={{
                  fontSize: "clamp(5.5rem, 18vw, 13rem)",
                  letterSpacing: "0.14em",
                  fontWeight: 400,
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
                  className="mx-auto mt-6 max-w-md text-[13px] leading-relaxed tracking-wide text-white/35"
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
                    background: "linear-gradient(to right, transparent, rgba(201,151,58,0.55))",
                  }}
                />
                <div
                  className="h-1 w-1 rotate-45"
                  style={{ background: "rgba(201,151,58,0.6)" }}
                />
                <div
                  className="h-px w-24"
                  style={{
                    background: "linear-gradient(to left, transparent, rgba(201,151,58,0.55))",
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
            className="border-b border-[#c9973a]/8 bg-[#0a0a0a]"
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
                      style={{ color: "rgba(201,151,58,0.55)", strokeWidth: 1.5 }}
                    />
                    <div>
                      <p className="font-display text-[11px] uppercase tracking-[0.28em] text-white/70">
                        {title}
                      </p>
                      <p className="mt-2 text-[12px] leading-relaxed text-white/28">
                        {desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Products grid ─────────────────────────────────────────────────── */}
          <div className="container mx-auto px-4 py-12">
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
                  className="mb-8 font-display text-[10px] uppercase tracking-[0.32em] text-white/20"
                >
                  {products.length} {products.length > 1 ? t("brand_products") : t("brand_product")}
                </motion.p>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
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
                        className="group cursor-pointer overflow-hidden border border-[#c9973a]/10 bg-[#0d0d0d] transition-all duration-300 hover:border-[#c9973a]/30"
                        style={{
                          boxShadow: "none",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.boxShadow =
                            "0 0 32px rgba(201,151,58,0.07)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                        }}
                      >
                        {/* Image */}
                        <div className="relative aspect-square overflow-hidden bg-[#0d0d0d]">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package className="h-12 w-12 text-white/10" />
                            </div>
                          )}

                          {/* Stock badge */}
                          <div
                            className={`absolute left-3 top-3 px-2 py-1 font-display text-[9px] uppercase tracking-[0.2em] ${
                              inStock
                                ? "bg-[#c9973a] text-[#0e0e0e]"
                                : "border border-white/10 bg-[#0d0d0d]/90 text-white/30"
                            }`}
                          >
                            {inStock ? t("in_stock") : t("out_of_stock")}
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="border-t border-[#c9973a]/8 px-5 py-4">
                          <h3 className="font-display text-sm uppercase tracking-[0.1em] text-white/85">
                            {product.name}
                          </h3>

                          {/* Colorway dots */}
                          {cws.length > 0 && (
                            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                              {cws.slice(0, 8).map((cw) => (
                                <div
                                  key={cw.id}
                                  title={cw.name}
                                  className="overflow-hidden border border-white/10"
                                  style={{ width: 20, height: 20 }}
                                >
                                  {cw.image_url ? (
                                    <img
                                      src={cw.image_url}
                                      alt={cw.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-white/8">
                                      <span className="text-[7px] font-bold text-white/35">
                                        {cw.name.charAt(0)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {cws.length > 8 && (
                                <div className="flex h-5 w-5 items-center justify-center border border-white/8 bg-white/4">
                                  <span className="text-[8px] text-white/35">+{cws.length - 8}</span>
                                </div>
                              )}
                              <span className="ml-1 text-[10px] uppercase tracking-[0.14em] text-white/25">
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

        </div>
      )}
    </Layout>
  );
}
