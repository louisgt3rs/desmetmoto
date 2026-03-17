import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { brandData, brandNames } from "./brands-data";
import type { BrandInfo } from "./brands-data";
import BrandModal from "./BrandModal";

export default function BrandsSection() {
  const [selectedBrand, setSelectedBrand] = useState<BrandInfo | null>(null);

  const handleOpen = useCallback((name: string) => {
    setSelectedBrand(brandData[name]);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedBrand(null);
  }, []);

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

        <div
          className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto select-none"
          style={{ WebkitUserSelect: "none", userSelect: "none" }}
        >
          {brandNames.map((name) => (
            <button
              key={name}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleOpen(name);
              }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-secondary text-foreground text-sm font-medium border border-primary/20 cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)] hover:bg-primary/10 active:scale-95 select-none"
              style={{ WebkitTapHighlightColor: "transparent", cursor: "pointer" }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {selectedBrand !== null && (
        <BrandModal brand={selectedBrand} onClose={handleClose} />
      )}
    </section>
  );
}
