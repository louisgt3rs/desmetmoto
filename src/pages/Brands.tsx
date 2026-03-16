import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";

import araiLogo from "@/assets/brands/arai.png";
import shoeiLogo from "@/assets/brands/shoei.png";
import sharkLogo from "@/assets/brands/shark.png";
import alpinestarsLogo from "@/assets/brands/alpinestars.png";
import daineseLogo from "@/assets/brands/dainese.png";
import revitLogo from "@/assets/brands/revit.png";
import beringLogo from "@/assets/brands/bering.png";
import tcxLogo from "@/assets/brands/tcx.png";
import sidiLogo from "@/assets/brands/sidi.png";
import cardoLogo from "@/assets/brands/cardo.png";

const brands = [
  { name: "Arai", logo: araiLogo, category: "Casques" },
  { name: "Shoei", logo: shoeiLogo, category: "Casques" },
  { name: "Shark", logo: sharkLogo, category: "Casques" },
  { name: "Alpinestars", logo: alpinestarsLogo, category: "Textile & Cuir" },
  { name: "Dainese", logo: daineseLogo, category: "Textile & Cuir" },
  { name: "Rev'it", logo: revitLogo, category: "Textile & Cuir" },
  { name: "Bering", logo: beringLogo, category: "Textile & Cuir" },
  { name: "TCX", logo: tcxLogo, category: "Bottes" },
  { name: "Sidi", logo: sidiLogo, category: "Bottes" },
  { name: "Cardo", logo: cardoLogo, category: "Accessoires" },
];

export default function BrandsPage() {
  return (
    <Layout>
      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="NOS MARQUES"
            subtitle="Les meilleures marques d'équipement moto disponibles chez Desmet Équipement"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {brands.map((brand, i) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="group bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:shadow-[0_0_30px_hsl(var(--glow-soft))] transition-all duration-300 cursor-pointer aspect-square"
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-20 h-20 object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 invert"
                />
                <span className="font-display text-lg text-muted-foreground group-hover:text-primary transition-colors duration-300">
                  {brand.name}
                </span>
                <span className="text-xs text-muted-foreground/60">{brand.category}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
