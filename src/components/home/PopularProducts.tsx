import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import ReservationModal from "@/components/ReservationModal";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products"> & { brands?: { name: string } | null };

const categories = ["Tous", "Casques", "Vestes", "Gants", "Bottes", "Accessoires"];

export default function PopularProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [active, setActive] = useState("Tous");
  const [reserveModel, setReserveModel] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("products")
      .select("*, brands(name)")
      .eq("is_featured", true)
      .order("sort_order")
      .limit(8)
      .then(({ data }) => { if (data) setProducts(data as Product[]); });
  }, []);

  const filtered = active === "Tous" ? products : products.filter(p => p.category === active);

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <SectionHeading title="PRODUITS POPULAIRES" subtitle="Notre sélection d'équipements phares" />

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                active === cat
                  ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--glow-soft))]"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              layout
              className="group bg-background border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-[0_0_30px_hsl(var(--glow-soft))] transition-all duration-500"
            >
              <div className="aspect-square overflow-hidden bg-secondary">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-display text-3xl text-muted-foreground/30">{product.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                {product.brands?.name && (
                  <span className="text-xs font-medium text-primary tracking-wider uppercase">{product.brands.name}</span>
                )}
                <h3 className="font-display text-xl text-foreground mt-1 mb-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                {product.price_range && (
                  <p className="text-sm text-muted-foreground mb-3">{product.price_range}</p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
                  onClick={() => setReserveModel(product.name)}
                >
                  Voir en magasin
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground mt-8">Aucun produit dans cette catégorie pour le moment.</p>
        )}
      </div>

      <ReservationModal
        open={!!reserveModel}
        onClose={() => setReserveModel(null)}
        helmetModel={reserveModel || ""}
      />
    </section>
  );
}
