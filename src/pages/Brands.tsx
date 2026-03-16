import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Brand = Tables<"brands">;

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    supabase.from("brands").select("*").order("sort_order").then(({ data }) => {
      if (data) setBrands(data);
    });
  }, []);

  return (
    <Layout>
      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeading title="NOS MARQUES" subtitle="Les meilleures marques d'équipement moto disponibles chez Desmet Équipement" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand, i) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group bg-card border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-[0_0_30px_hsl(var(--glow-soft))] transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {brand.logo_url && (
                      <img src={brand.logo_url} alt={brand.name} className="w-10 h-10 object-contain" />
                    )}
                    <h3 className="font-display text-2xl text-foreground group-hover:text-primary transition-colors">{brand.name}</h3>
                  </div>
                  <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">{brand.category}</span>
                </div>
                <p className="text-muted-foreground text-sm">{brand.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
