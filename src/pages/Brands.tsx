import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";

const brands1 = [
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
    <div className="overflow-hidden py-6">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: reverse ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((brand, i) => (
          <span
            key={`${brand}-${i}`}
            className="inline-flex items-center gap-6 mx-4 md:mx-8 shrink-0"
          >
            <span className="font-display text-4xl md:text-6xl lg:text-7xl xl:text-8xl text-muted-foreground/40 hover:text-primary transition-colors duration-300 cursor-default select-none tracking-wide uppercase">
              {brand}
            </span>
            <span className="text-muted-foreground/20 text-2xl md:text-3xl select-none">•</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function BrandsPage() {
  return (
    <Layout>
      <section className="py-24 min-h-[80vh] flex flex-col justify-center overflow-hidden">
        <div className="container mx-auto px-4 mb-12">
          <SectionHeading
            title="NOS MARQUES"
            subtitle="Retrouvez en magasin une sélection de grandes marques d'équipement et d'accessoires moto."
          />
        </div>

        <div className="space-y-4">
          <MarqueeRow items={brands1} duration={35} />
          <MarqueeRow items={brands2} reverse duration={40} />
        </div>

        <div className="container mx-auto px-4 mt-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto"
          >
            Et bien d'autres marques disponibles en magasin. N'hésitez pas à nous contacter pour toute demande spécifique.
          </motion.p>
        </div>
      </section>
    </Layout>
  );
}
