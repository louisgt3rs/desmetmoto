import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Package } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { BrandLogo } from "@/components/home/BrandModal";
import type { BrandModalBrand } from "@/components/home/BrandModal";

type BrandRow = Tables<"brands">;
type ProductRow = Tables<"products">;

const SIZES_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];

function parseSizeStock(stockBySize: unknown): Record<string, number> {
  if (stockBySize && typeof stockBySize === "object" && !Array.isArray(stockBySize)) {
    return stockBySize as Record<string, number>;
  }
  return {};
}

function getTotalStock(sizeStock: Record<string, number>, stockQty: number): number {
  const sizeTotal = Object.values(sizeStock).reduce((sum, v) => sum + (v || 0), 0);
  return sizeTotal > 0 ? sizeTotal : stockQty;
}

const formatPrice = (price?: number | null) =>
  typeof price === "number"
    ? new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" }).format(price)
    : null;

export default function BrandDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [brand, setBrand] = useState<BrandRow | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      setLoading(true);

      // Find brand by matching slug to name (lowercased, hyphenated)
      const { data: allBrands } = await supabase.from("brands").select("*");
      const found = (allBrands ?? []).find(
        (b) => b.name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
      );

      if (!found) {
        setBrand(null);
        setLoading(false);
        return;
      }

      setBrand(found);

      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("brand_id", found.id)
        .order("name");

      setProducts((productsData ?? []) as ProductRow[]);
      setLoading(false);
    };

    load();
  }, [slug]);

  const brandForLogo: BrandModalBrand | null = brand
    ? {
        id: brand.id,
        name: brand.name,
        logo_url: brand.logo_url,
        description: brand.description,
      }
    : null;

  return (
    <Layout>
      <section className="min-h-[80vh] py-20 bg-background">
        <div className="container mx-auto px-4">
          {/* Back link */}
          <Link
            to="/brands"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Retour aux marques
          </Link>

          {loading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : !brand ? (
            <div className="text-center py-20">
              <h1 className="font-display text-4xl text-foreground mb-4">MARQUE INTROUVABLE</h1>
              <p className="text-muted-foreground">Cette marque n'existe pas dans notre catalogue.</p>
            </div>
          ) : (
            <>
              {/* Brand header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 flex flex-col items-center gap-5 text-center"
              >
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
                  {brandForLogo && <BrandLogo brand={brandForLogo} size={96} darkFallback />}
                </div>
                <div>
                  <h1 className="font-display text-5xl md:text-6xl text-foreground">{brand.name.toUpperCase()}</h1>
                  {brand.description && (
                    <p className="mt-3 max-w-2xl text-muted-foreground text-sm md:text-base">{brand.description}</p>
                  )}
                </div>
              </motion.div>

              {/* Products grid */}
              {products.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mx-auto max-w-md rounded-xl border border-border bg-card p-10 text-center"
                >
                  <Package className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                  <p className="font-display text-xl text-foreground">AUCUN ARTICLE DISPONIBLE ACTUELLEMENT</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Contactez-nous pour toute demande spécifique.
                  </p>
                </motion.div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product, i) => {
                    const sizeStock = parseSizeStock(product.stock_by_size);
                    const hasSizeData = Object.keys(sizeStock).length > 0;
                    const totalStock = getTotalStock(sizeStock, product.stock_quantity);

                    return (
                      <motion.article
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="overflow-hidden rounded-xl border border-border bg-card"
                      >
                        {/* Product image */}
                        <div className="relative aspect-[4/3] bg-secondary">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package className="h-10 w-10 text-muted-foreground" />
                            </div>
                          )}
                          {/* Stock badge */}
                          <div
                            className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                              totalStock > 0
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {totalStock > 0 ? "EN STOCK" : "RUPTURE"}
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className="font-display text-xl text-foreground mb-1">{product.name}</h3>
                          {formatPrice(product.price) && (
                            <p className="text-primary font-display text-lg mb-4">
                              {formatPrice(product.price)}
                            </p>
                          )}

                          {/* Size-by-size stock */}
                          {hasSizeData ? (
                            <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                              {SIZES_ORDER.filter((s) => s in sizeStock).map((size) => {
                                const qty = sizeStock[size] || 0;
                                return (
                                  <span
                                    key={size}
                                    className={`text-xs font-medium tracking-wide ${
                                      qty > 0 ? "text-primary" : "text-muted-foreground/50"
                                    }`}
                                  >
                                    {size}:&nbsp;{qty}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Stock total : {totalStock} PCS
                            </p>
                          )}
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
