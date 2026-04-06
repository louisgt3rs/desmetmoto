import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import BrandsCarousel from "@/components/home/BrandsCarousel";
import SEO from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";

export default function BrandsPage() {
  const { t } = useLanguage();

  return (
    <Layout>
      <SEO
        title="Nos Marques Moto — Arai, Shoei, Alpinestars, Shark | Desmet Équipement Wavre"
        description="Découvrez nos plus de 30 marques d'équipement moto : Arai, Shoei, Alpinestars, Shark, Sena, Cardo et bien d'autres. Disponibles en boutique à Wavre."
        canonicalPath="/marques"
      />
      <section className="py-24 min-h-[80vh] flex flex-col justify-center bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h1 className="font-display text-5xl md:text-6xl text-foreground mb-3">
              {t("brands_title")}
            </h1>
            <div className="w-20 h-1 bg-primary mx-auto mb-4" />
            <p className="text-muted-foreground text-base md:text-lg">
              {t("brands_subtitle")}
            </p>
          </motion.div>

          <BrandsCarousel />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-sm text-center mt-16 max-w-2xl mx-auto"
          >
            {t("brands_more")}
          </motion.p>
        </div>
      </section>
    </Layout>
  );
}
