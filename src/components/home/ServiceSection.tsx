import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wrench, Radio, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeading from "@/components/SectionHeading";
import InstallationModal from "@/components/InstallationModal";
import storeImg from "@/assets/store-interior-1.jpeg";
import { supabase } from "@/integrations/supabase/client";

type InstIntercom = { id: string; brand: string; name: string; is_coming_soon: boolean };

const services = [
  "Intercoms Sena & Cardo intégrés dans votre casque",
  "Supports téléphone Quad Lock et SP Connect",
  "Fixations GPS et accessoires électroniques",
  "Systèmes audio — installation propre et réglage inclus",
];

export default function ServiceSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [intercoms, setIntercoms] = useState<InstIntercom[]>([]);

  useEffect(() => {
    supabase
      .from("installation_intercoms")
      .select("id, brand, name, is_coming_soon")
      .order("brand")
      .order("sort_order")
      .then(({ data }) => { if (data) setIntercoms(data as InstIntercom[]); });
  }, []);

  const uniqueIntercomBrands = [...new Set(intercoms.map(i => i.brand))];

  return (
    <>
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="INSTALLATION D'INTERCOM & ACCESSOIRES — EN BOUTIQUE À WAVRE"
            subtitle="Votre intercom acheté chez nous ? On l'installe proprement, directement sur votre casque."
          />

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mt-12">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-xl overflow-hidden aspect-[4/3]"
            >
              <img src={storeImg} alt="Boutique Desmet Équipement — installation en magasin" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium">
                <Wrench className="w-4 h-4" />
                Service en magasin
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <p className="text-muted-foreground mb-6">Notre équipe installe vos accessoires directement sur place :</p>

              <ul className="space-y-4 mb-6">
                {services.map((s, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                    <span className="text-foreground">{s}</span>
                  </motion.li>
                ))}
              </ul>

              <p
                className="text-sm mb-8 px-4 py-3 rounded-lg"
                style={{ background: "rgba(201,151,58,0.07)", borderLeft: "3px solid rgba(201,151,58,0.5)", color: "var(--c-text-55)" }}
              >
                Installation réservée aux produits achetés chez Desmet Équipement.
              </p>

              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-3 font-display text-sm uppercase tracking-[0.25em] px-8 py-4 transition-all duration-300"
                style={{ border: "1px solid rgba(201,151,58,0.5)", color: "#c9973a", background: "rgba(201,151,58,0.06)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(201,151,58,0.14)"; (e.currentTarget as HTMLElement).style.borderColor = "#c9973a"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(201,151,58,0.06)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,151,58,0.5)"; }}
              >
                <Wrench className="w-4 h-4" />
                Faire installer en magasin
              </button>
            </motion.div>
          </div>

          {/* Intercoms badges */}
          {uniqueIntercomBrands.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-16 pt-12"
              style={{ borderTop: "1px solid rgba(201,151,58,0.12)" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Radio className="w-4 h-4" style={{ color: "#c9973a" }} />
                <p className="font-display text-[10px] uppercase tracking-[0.45em]" style={{ color: "rgba(201,151,58,0.7)" }}>
                  Intercoms disponibles en boutique
                </p>
              </div>
              <p className="text-xs mb-8 ml-7" style={{ color: "var(--c-text-35)" }}>
                Technologie Mesh — communiquez en groupe jusqu'à 15 motards sans limite de portée.
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {uniqueIntercomBrands.map(brand => (
                  <div key={brand} className="rounded-xl p-5" style={{ background: "var(--c-surface-card)", border: "1px solid rgba(201,151,58,0.12)" }}>
                    <p className="font-display text-xs uppercase tracking-[0.35em] mb-4" style={{ color: "#c9973a" }}>{brand}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {intercoms.filter(i => i.brand === brand).map(i => (
                        <span
                          key={i.id}
                          className="font-display text-[11px] uppercase tracking-[0.2em] px-3 py-1.5"
                          style={{
                            border: "1px solid rgba(201,151,58,0.25)",
                            color: i.is_coming_soon ? "#c9973a" : "var(--c-text-65)",
                            background: i.is_coming_soon ? "rgba(201,151,58,0.08)" : "rgba(201,151,58,0.04)",
                            opacity: i.is_coming_soon ? 0.75 : 1,
                          }}
                        >
                          {i.name}{i.is_coming_soon ? " · BIENTÔT" : ""}
                        </span>
                      ))}
                    </div>
                    {(brand === "Sena" || brand === "Cardo") && (
                      <Link
                        to="/intercoms"
                        className="inline-flex items-center gap-1.5 font-display text-[10px] uppercase tracking-[0.25em] transition-colors"
                        style={{ color: "rgba(201,151,58,0.5)" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c9973a"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(201,151,58,0.5)"}
                      >
                        Découvrir tous les modèles <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <InstallationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
