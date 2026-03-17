import { motion } from "framer-motion";

const brands = [
  "Arai", "Abus", "Muc-Off", "Bell Helmet", "Scoot", "Helite", "Bihr",
  "TCX", "Erwax", "D3O", "TomTom", "Richa", "RST", "Kappa", "Cardo",
  "Bering", "Motul", "SW-Motech", "Premier Helmet", "Shark", "Garmin",
  "Auvray", "Sena", "Alpinestars", "Optimate", "Bowtex", "Fly Racing",
  "Six2", "LS2", "Midland", "Zandona", "Segura", "Shoei",
];

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

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto"
        >
          {brands.map((brand, i) => (
            <motion.span
              key={brand}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-secondary text-foreground text-sm font-medium border border-primary/20 cursor-default transition-all duration-300 hover:border-primary hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)] hover:bg-primary/10"
            >
              {brand}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
