import { motion } from "framer-motion";
import BrandsCarousel from "./BrandsCarousel";

export default function BrandsSection() {
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
          <p className="text-muted-foreground text-sm tracking-[0.2em] uppercase">
            Plus de 30 marques disponibles en magasin à Wavre
          </p>
        </motion.div>

        <BrandsCarousel />
      </div>
    </section>
  );
}
