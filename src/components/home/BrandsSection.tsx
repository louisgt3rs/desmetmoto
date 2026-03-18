import { motion } from "framer-motion";
import { brands } from "./brands-data";

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
          <p className="text-muted-foreground text-sm md:text-base">
            Plus de 30 marques disponibles en magasin à Wavre
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl overflow-hidden bg-card border border-border"
            >
              <img
                src={brand.image}
                alt={brand.name}
                loading="lazy"
                className="w-full h-32 md:h-40 object-cover"
              />
              <div className="p-3 md:p-4">
                <h3 className="font-display text-lg md:text-xl text-foreground leading-tight">
                  {brand.name}
                </h3>
                <p className="text-muted-foreground text-xs mt-1">
                  {brand.country} · {brand.year}
                </p>
                <p className="text-secondary-foreground text-xs md:text-sm mt-2 line-clamp-3">
                  {brand.description}
                </p>
                <span className="inline-block mt-3 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {brand.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
