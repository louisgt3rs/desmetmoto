import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import storeImg from "@/assets/store-interior-1.jpeg";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutPreview() {
  const { t } = useLanguage();

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-xl overflow-hidden"
          >
            <img src={storeImg} alt="Magasin Desmet" className="w-full object-cover aspect-video hover:scale-[1.03] transition-transform duration-700" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
              {t("about_preview_title").split("MOTO").length > 1 ? (
                <>
                  {t("about_preview_title").split(/MOTO|SPECIALIST|SPECIALIST/)[0]}
                  <span className="text-gradient">MOTO</span>
                  {t("about_preview_title").split("MOTO")[1]}
                </>
              ) : (
                t("about_preview_title")
              )}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {t("about_preview_desc")}
            </p>
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
              <Shield className="w-5 h-5 text-primary shrink-0" />
              <span className="text-foreground font-medium text-sm">{t("about_preview_badges")}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
