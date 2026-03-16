import { motion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";

const brands = [
  "Arai", "Abus", "Muc-Off", "Bell Helmets", "Scoot", "Helite", "Bihr",
  "Tech-Air", "Erwax", "D3O", "TomTom", "Richa", "RST", "Kappa", "Cardo",
  "Bering", "Motul", "SW-Motech",
];

const brands2 = [
  "Premier Helmet", "Shark", "Garmin", "Auvray", "Sena", "Alpinestars",
  "Optimate", "Bowtex", "Fly Racing", "Six2", "LS2", "Midland", "Zandona",
  "TCX", "Segura", "Shoei",
];

function MarqueeRow({ items, reverse = false, duration = 30 }: { items: string[]; reverse?: boolean; duration?: number }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-4">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: reverse ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((brand, i) => (
          <span
            key={`${brand}-${i}`}
            className="inline-flex items-center gap-6 mx-4 md:mx-6 shrink-0"
          >
            <span className="font-display text-3xl md:text-5xl lg:text-6xl text-muted-foreground/40 hover:text-primary transition-colors duration-300 cursor-default select-none tracking-wide uppercase">
              {brand}
            </span>
            <span className="text-muted-foreground/20 text-xl md:text-2xl select-none">•</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function BrandsSection() {
  return (
    <section className="py-20 bg-secondary/50 overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <SectionHeading
          title="NOS MARQUES"
          subtitle="Retrouvez en magasin une sélection de grandes marques d'équipement et d'accessoires moto."
        />
      </div>

      <div className="space-y-2">
        <MarqueeRow items={brands} duration={35} />
        <MarqueeRow items={brands2} reverse duration={40} />
      </div>

      <div className="container mx-auto px-4 mt-10 text-center">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <a href="/brands" className="text-sm text-primary hover:underline font-medium">
            Voir toutes les marques →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
