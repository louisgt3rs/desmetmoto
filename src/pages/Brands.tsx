import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";

const brands = [
  { name: "Arai", desc: "Casques haut de gamme fabriqués à la main au Japon.", category: "Casques" },
  { name: "Shoei", desc: "Casques premium réputés pour leur confort et sécurité.", category: "Casques" },
  { name: "Shark", desc: "Casques innovants avec un excellent rapport qualité-prix.", category: "Casques" },
  { name: "Alpinestars", desc: "Équipement technique pour motards exigeants.", category: "Textile & Cuir" },
  { name: "Dainese", desc: "Protection et style à l'italienne depuis 1972.", category: "Textile & Cuir" },
  { name: "Rev'It", desc: "Vêtements moto innovants et stylés.", category: "Textile & Cuir" },
  { name: "Held", desc: "Gants et équipements allemands de qualité supérieure.", category: "Gants" },
  { name: "Bering", desc: "Gants et bloussons moto de qualité française.", category: "Gants" },
  { name: "Sidi", desc: "Bottes de course et touring fabriquées en Italie.", category: "Bottes" },
  { name: "TCX", desc: "Chaussures et bottes moto au design moderne.", category: "Bottes" },
  { name: "Oxford", desc: "Accessoires et bagagerie pour motards.", category: "Accessoires" },
  { name: "Cardo", desc: "Intercoms Bluetooth pour communication en moto.", category: "Accessoires" },
];

export default function BrandsPage() {
  return (
    <Layout>
      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeading title="NOS MARQUES" subtitle="Les meilleures marques d'équipement moto disponibles chez Desmet Équipement" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand, i) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-2xl text-foreground group-hover:text-primary transition-colors">{brand.name}</h3>
                  <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">{brand.category}</span>
                </div>
                <p className="text-muted-foreground text-sm">{brand.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
