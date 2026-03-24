import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type BrandRow = Tables<"brands">;

export default function BrandsSection() {
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from("brands").select("*").order("name").then(({ data }) => {
      setBrands(data ?? []);
    });
  }, []);

  const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

  return (
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

        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-3">
          {brands.map((brand) => (
            <motion.button
              key={brand.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/marques/${toSlug(brand.name)}`)}
              className="relative z-10 inline-flex cursor-pointer items-center rounded-full border border-primary/20 bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
            >
              {brand.name}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
