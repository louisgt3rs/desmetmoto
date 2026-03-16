import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import ReservationModal from "@/components/ReservationModal";
import helmetHeroImg from "@/assets/helmet-hero.jpg";

const helmets = [
  {
    name: "RX-7V EVO",
    desc: "Le casque de course ultime d'Arai. Technologie de pointe pour une protection maximale sur piste et route.",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    name: "Quantic",
    desc: "Le touring premium par Arai. Confort exceptionnel pour les longs trajets avec ventilation optimale.",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Concept-XE",
    desc: "Le modulable haut de gamme. Polyvalence et protection avec la qualité Arai.",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    name: "Tour-X",
    desc: "L'aventurier par excellence. Conçu pour l'aventure et le tout-terrain avec visière longue.",
    sizes: ["S", "M", "L", "XL"],
  },
];

export default function AraiPage() {
  const [reserveModel, setReserveModel] = useState<string | null>(null);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32">
        <div className="absolute inset-0">
          <img src={helmetHeroImg} alt="Arai Helmet" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-primary font-medium tracking-wider uppercase text-sm">Revendeur Officiel</span>
            <h1 className="font-display text-6xl md:text-8xl text-foreground mt-2 mb-4">ARAI HELMETS</h1>
            <p className="text-muted-foreground max-w-lg">
              Découvrez notre gamme de casques Arai. Fabriqués à la main au Japon, chaque casque est un
              chef-d'œuvre de protection et de confort.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Helmets */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeading title="MODÈLES DISPONIBLES" subtitle="Essayez-les en magasin et trouvez votre taille idéale" />
          <div className="grid md:grid-cols-2 gap-8">
            {helmets.map((helmet, i) => (
              <motion.div
                key={helmet.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card border border-border rounded-lg p-8 hover:border-primary/50 transition-all"
              >
                <h3 className="font-display text-3xl text-foreground mb-3">{helmet.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{helmet.desc}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {helmet.sizes.map((s) => (
                    <span key={s} className="text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded">
                      {s}
                    </span>
                  ))}
                </div>
                <Button onClick={() => setReserveModel(helmet.name)}>
                  Réserver en Magasin
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ReservationModal
        open={!!reserveModel}
        onClose={() => setReserveModel(null)}
        helmetModel={reserveModel || ""}
      />
    </Layout>
  );
}
