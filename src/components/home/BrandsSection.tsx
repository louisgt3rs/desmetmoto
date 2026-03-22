import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import BrandModal from "./BrandModal";
import type { BrandModalBrand } from "./BrandModal";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type BrandRow = Tables<"brands"> & {
  country?: string | null;
  founded_year?: number | null;
  categories?: string[] | null;
  website_url?: string | null;
};

type ProductRow = Tables<"products">;

export default function BrandsSection() {
  const [brands, setBrands] = useState<BrandModalBrand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<BrandModalBrand | null>(null);

  useEffect(() => {
    const loadBrands = async () => {
      const [{ data: brandsData }, { data: productsData }] = await Promise.all([
        supabase.from("brands").select("*").order("name"),
        supabase.from("products").select("id, name, brand_id, image_url").order("created_at", { ascending: false }),
      ]);

      const groupedProducts = new Map<string, { name: string; image_url?: string | null }[]>();

      ((productsData as ProductRow[] | null) ?? []).forEach((product) => {
        if (!product.brand_id) return;
        const existing = groupedProducts.get(product.brand_id) ?? [];
        if (existing.length < 3) {
          existing.push({ name: product.name, image_url: product.image_url });
          groupedProducts.set(product.brand_id, existing);
        }
      });

      setBrands(
        ((brandsData as BrandRow[] | null) ?? []).map((brand) => ({
          id: brand.id,
          name: brand.name,
          description: brand.description,
          country: brand.country,
          founded_year: brand.founded_year,
          categories: brand.categories ?? (brand.category ? [brand.category] : []),
          logo_url: brand.logo_url,
          website_url: brand.website_url,
          products: groupedProducts.get(brand.id) ?? [],
        }))
      );
    };

    loadBrands();
  }, []);

  return (
    <>
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-3">
              NOS MARQUES
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto mb-4" />
            <p className="text-muted-foreground text-sm md:text-base">
              Plus de 30 marques disponibles en magasin à Wavre
            </p>
          </motion.div>

          <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-3 select-none">
            {brands.map((brand) => (
              <button
                key={brand.id}
                type="button"
                onClick={() => setSelectedBrand(brand)}
                className="inline-flex cursor-pointer select-none items-center rounded-full border border-primary/20 bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)] active:scale-95"
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedBrand && createPortal(
        <BrandModal brand={selectedBrand} onClose={() => setSelectedBrand(null)} />,
        document.body
      )}
    </>
  );
}
