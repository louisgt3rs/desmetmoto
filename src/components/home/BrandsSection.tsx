import { useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { brandData, brandNames } from "./brands-data";
import type { BrandInfo } from "./brands-data";
import BrandModal from "./BrandModal";

export default function BrandsSection() {
  const [selectedBrand, setSelectedBrand] = useState<BrandInfo | null>(null);

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
            {brandNames.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedBrand(brandData[name])}
                className="inline-flex cursor-pointer select-none items-center rounded-full border border-primary/20 bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)] active:scale-95"
              >
                {name}
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
