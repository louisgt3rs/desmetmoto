import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import ReservationModal from "@/components/ReservationModal";
import { supabase } from "@/integrations/supabase/client";
import helmetHeroImg from "@/assets/helmet-hero.jpg";
import araiStoreWall from "@/assets/arai-store-wall.jpg";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

export default function AraiPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [reserveModel, setReserveModel] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("products")
      .select("*, brands!inner(name)")
      .eq("brands.name", "Arai")
      .order("sort_order")
      .then(({ data }) => { if (data) setProducts(data); });
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32">
        <div className="absolute inset-0">
          <img src={helmetHeroImg} alt="Arai Helmet" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-primary font-medium tracking-wider uppercase text-sm">Revendeur Officiel</span>
            <h1 className="font-display text-6xl md:text-8xl text-foreground mt-2 mb-4">ARAI HELMETS</h1>
            <p className="text-muted-foreground max-w-lg">
              Découvrez notre gamme de casques Arai. Fabriqués à la main au Japon, chaque casque est un
              chef-d'œuvre de protection et de confort.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Store Photo */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-3">Notre espace Arai en magasin</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez notre mur de casques Arai et venez essayer les différents modèles directement en magasin.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-xl overflow-hidden border border-border shadow-[0_0_40px_hsl(var(--glow-soft))]"
          >
            <img src={araiStoreWall} alt="Espace Arai en magasin — mur de casques" className="w-full h-auto object-cover" />
          </motion.div>
        </div>
      </section>

      {/* Helmets */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeading title="MODÈLES DISPONIBLES" subtitle="Essayez-les en magasin et trouvez votre taille idéale" />
          <div className="grid md:grid-cols-2 gap-8">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--glow-soft))]"
              >
                {product.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-8">
                  <h3 className="font-display text-3xl text-foreground mb-3 group-hover:text-primary transition-colors">{product.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{product.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(product.sizes || []).map(s => (
                      <span key={s} className="text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                  <Button onClick={() => setReserveModel(product.name)}>
                    Réserver en Magasin
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ReservationModal
        open={!!reserveModel}
        onClose={() => setReserveModel(null)}
        helmetModel={reserveModel || ""}
      />
    </Layout>
  );
}
