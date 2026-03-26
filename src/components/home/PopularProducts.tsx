import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import ReservationModal from "@/components/ReservationModal";
import ImageGallery from "@/components/ImageGallery";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import ProductColorwaySelector from "@/components/ProductColorwaySelector";

type Product = Tables<"products"> & {
  brands?: { name: string } | null;
  images?: string[] | null;
  brand?: string | null;
  price?: number | null;
  in_stock?: boolean | null;
};

const categories = [
  { label: "Tous", value: "all" },
  { label: "Casques", value: "casques" },
  { label: "Vestes", value: "vestes" },
  { label: "Gants", value: "gants" },
  { label: "Bottes", value: "bottes" },
  { label: "Accessoires", value: "accessoires" },
];

export default function PopularProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [active, setActive] = useState("all");
  const [reserveModel, setReserveModel] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("products")
      .select("*, brands(name)")
      .filter("in_stock", "eq", "true")
      .order("sort_order")
      .limit(8)
      .then(({ data }) => { if (data) setProducts(data as Product[]); });
  }, []);

  const filtered = active === "all"
    ? products
    : products.filter((product) => (product.category || "").toLowerCase() === active);

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <SectionHeading title="PRODUITS POPULAIRES" subtitle="Notre sélection d'équipements phares" />

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActive(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                active === cat.value
                  ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--glow-soft))]"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              layout
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
