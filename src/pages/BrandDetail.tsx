import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Package } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { BrandLogo } from "@/components/home/BrandModal";
import type { BrandModalBrand } from "@/components/home/BrandModal";
import ProductColorwaySelector from "@/components/ProductColorwaySelector";

type BrandRow = Tables<"brands">;
type ProductRow = Tables<"products">;

export default function BrandDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [brand, setBrand] = useState<BrandRow | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      setLoading(true);
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
    ? { id: brand.id, name: brand.name, logo_url: brand.logo_url, description: brand.description }
    : null;

  return (
    <Layout>
      <SEO
        title={brand ? `${brand.name} — Desmet Équipement` : "Marque — Desmet Équipement"}
        description={brand ? `Découvrez les produits ${brand.name} disponibles chez Desmet Équipement à Wavre. ${brand.description ?? ""}`.trim() : undefined}
      />
      <section className="min-h-[80vh] py-20 bg-background">
        <div className="container mx-auto px-4">
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

              {products.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mx-auto max-w-md rounded-xl border border-border bg-card p-10 text-center"
                >
                  <Package className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                  <p className="font-display text-xl text-foreground">AUCUN ARTICLE DISPONIBLE ACTUELLEMENT</p>
                  <p className="mt-2 text-sm text-muted-foreground">Contactez-nous pour toute demande spécifique.</p>
                </motion.div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ProductColorwaySelector
                        productId={product.id}
                        productName={product.name}
                        productImageUrl={product.image_url}
                        productPrice={product.price}
                        productStockBySize={product.stock_by_size}
                        productStockQuantity={product.stock_quantity}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
