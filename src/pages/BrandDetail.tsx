import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Award, Package, ShoppingBag, Wrench } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { BrandLogo } from "@/components/home/BrandModal";
import type { BrandModalBrand } from "@/components/home/BrandModal";

type BrandRow = Tables<"brands">;
type ProductRow = Tables<"products">;

interface ColorwayThumb {
  id: string;
  product_id: string;
  name: string;
  image_url: string | null;
}

const WHY_ITEMS = [
  { icon: Award,       title: "Revendeur agréé",           desc: "Produits authentiques, garantie constructeur." },
  { icon: Wrench,      title: "Essai en magasin possible", desc: "Testez avant d'acheter à Wavre." },
  { icon: ShoppingBag, title: "Réservation en ligne",      desc: "Commandez et réservez directement sur le site." },
];

export default function BrandDetailPage() {
  const { slug }      = useParams<{ slug: string }>();
  const navigate      = useNavigate();
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

      // Batch-fetch colorway thumbnails for all products
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
          <h1 className="font-display text-4xl uppercase tracking-widest text-white mb-4">MARQUE INTROUVABLE</h1>
          <p className="text-white/40 mb-8">Cette marque n'existe pas dans notre catalogue.</p>
          <Link
            to="/brands"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-[#c9973a] hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" /> Retour aux marques
          </Link>
        </div>
      )}

      {/* Main content */}
      {!loading && brand && (
        <div className="min-h-screen bg-[#0e0e0e]">

          {/* Hero */}
          <div className="border-b border-[#c9973a]/12 bg-[#0a0a0a]">
            <div className="container mx-auto px-4 pt-6 pb-8">

              <Link
                to="/brands"
                className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/35 transition-colors hover:text-[#c9973a]"
              >
                <ArrowLeft className="h-4 w-4" /> Retour aux marques
              </Link>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center gap-5 text-center"
              >
                <span className="inline-flex items-center gap-1.5 border border-[#c9973a]/30 bg-[#c9973a]/8 px-4 py-1.5 font-display text-[10px] uppercase tracking-[0.28em] text-[#c9973a]">
                  <Award className="h-3 w-3" /> Revendeur officiel
                </span>

                <div
                  className="flex items-center justify-center overflow-hidden rounded-2xl border border-[#c9973a]/20 bg-[#111]"
                  style={{ width: 220, height: 220, boxShadow: "0 0 80px rgba(201,151,58,0.28), 0 0 160px rgba(201,151,58,0.09)" }}
                >
                  {brandForLogo && <BrandLogo brand={brandForLogo} size={220} darkFallback />}
                </div>

                <div>
                  <h1 className="font-display text-5xl uppercase leading-none tracking-[0.06em] text-white md:text-7xl">
                    {brand.name.toUpperCase()}
                  </h1>
                  {brand.description && (
                    <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/50 md:text-base">
                      {brand.description}
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Why choose */}
          <div className="border-b border-[#c9973a]/10 bg-[#0d0d0d]">
            <div className="container mx-auto px-4 py-4">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="grid grid-cols-1 gap-2 sm:grid-cols-3"
              >
                {WHY_ITEMS.map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="flex items-center gap-3 border border-[#c9973a]/12 bg-[#111] px-4 py-3 transition-colors duration-200 hover:border-[#c9973a]/28"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#c9973a]/25 bg-[#c9973a]/8 text-[#c9973a]">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="font-display text-xs uppercase tracking-[0.14em] text-white">{title}</p>
                      <p className="text-[11px] leading-snug text-white/40">{desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Products grid */}
          <div className="container mx-auto px-4 py-8">
            {products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mx-auto max-w-md border border-[#c9973a]/15 bg-[#111] p-12 text-center"
              >
                <Package className="mx-auto mb-4 h-10 w-10 text-[#c9973a]/30" />
                <p className="font-display text-xl uppercase tracking-widest text-white">
                  AUCUN ARTICLE DISPONIBLE
                </p>
                <p className="mt-2 text-sm text-white/35">
                  Contactez-nous pour toute demande spécifique.
                </p>
                <Link
                  to="/contact"
                  className="mt-6 inline-flex h-10 items-center gap-2 border border-[#c9973a]/40 px-6 font-display text-xs uppercase tracking-[0.2em] text-[#c9973a] transition-colors hover:border-[#c9973a] hover:bg-[#c9973a]/8"
                >
                  Nous contacter
                </Link>
              </motion.div>
            ) : (
              <>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6 font-display text-[10px] uppercase tracking-[0.28em] text-white/25"
                >
                  {products.length} PRODUIT{products.length > 1 ? "S" : ""}
                </motion.p>

                <div className="grid gap-5 md:grid-cols-2">
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
                        className="group cursor-pointer overflow-hidden border border-[#c9973a]/12 bg-[#111] transition-all duration-200 hover:border-[#c9973a]/40"
                      >
                        {/* Image */}
                        <div
                          className="relative overflow-hidden bg-[#1a1a1a]"
                          style={{ height: 260 }}
                        >
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package className="h-12 w-12 text-white/10" />
                            </div>
                          )}

                          {/* Stock badge */}
                          <div className={`absolute left-3 top-3 px-2 py-1 font-display text-[10px] uppercase tracking-wider ${
                            inStock
                              ? "bg-[#c9973a] text-[#0e0e0e]"
                              : "border border-white/15 bg-[#111]/80 text-white/40"
                          }`}>
                            {inStock ? "EN STOCK" : "RUPTURE"}
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="px-4 py-3">
                          <h3 className="font-display text-base uppercase tracking-[0.06em] text-white">
                            {product.name}
                          </h3>

                          {/* Colorway dots */}
                          {cws.length > 0 && (
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              {cws.slice(0, 8).map((cw) => (
                                <div
                                  key={cw.id}
                                  title={cw.name}
                                  className="overflow-hidden border border-white/15"
                                  style={{ width: 24, height: 24 }}
                                >
                                  {cw.image_url ? (
                                    <img
                                      src={cw.image_url}
                                      alt={cw.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-white/10">
                                      <span className="text-[7px] font-bold text-white/40">
                                        {cw.name.charAt(0)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {cws.length > 8 && (
                                <div className="flex h-6 w-6 items-center justify-center border border-white/10 bg-white/5">
                                  <span className="text-[9px] text-white/40">+{cws.length - 8}</span>
                                </div>
                              )}
                              <span className="ml-1 text-[10px] uppercase tracking-[0.14em] text-white/30">
                                {cws.length} coloris
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
