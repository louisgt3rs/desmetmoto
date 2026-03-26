import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import BrandsCarousel from "@/components/home/BrandsCarousel";

export default function BrandsPage() {
  return (
    <Layout>
      <section className="py-24 min-h-[80vh] flex flex-col justify-center bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h1 className="font-display text-5xl md:text-6xl text-foreground mb-3">
              NOS MARQUES
            </h1>
            <div className="w-20 h-1 bg-primary mx-auto mb-4" />
            <p className="text-muted-foreground text-base md:text-lg">
              Plus de 30 marques disponibles en magasin à Wavre
            </p>
          </motion.div>

          <BrandsCarousel />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-sm text-center mt-16 max-w-2xl mx-auto"
          >
            Et bien d'autres marques disponibles en magasin. N'hésitez pas à nous contacter pour toute demande spécifique.
          </motion.p>
        </div>
      </section>
    </Layout>
  );
}
