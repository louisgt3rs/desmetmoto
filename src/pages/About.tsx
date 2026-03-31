import { motion } from "framer-motion";
import { Shield, Heart, Users, Award } from "lucide-react";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import SEO from "@/components/SEO";
import storeImg from "@/assets/store-interior.jpg";

const values = [
  { icon: Shield, title: "Expertise", desc: "Des années d'expérience dans l'équipement moto pour vous guider." },
  { icon: Heart, title: "Passion", desc: "Une équipe de motards passionnés qui comprend vos besoins." },
  { icon: Users, title: "Communauté", desc: "Un lieu de rassemblement pour les motards de la région." },
  { icon: Award, title: "Qualité", desc: "Uniquement les meilleures marques d'équipement moto." },
];

export default function AboutPage() {
  return (
    <Layout>
      <SEO
        title="À Propos — Desmet Équipement"
        description="Découvrez l'histoire de Desmet Équipement, votre spécialiste en équipement moto à Wavre depuis des années. Passion, expertise et qualité."
      />
      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeading title="À PROPOS" subtitle="Votre spécialiste équipement moto à Wavre" />

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img src={storeImg} alt="Magasin Desmet" className="rounded-lg w-full object-cover aspect-video" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-3xl text-foreground mb-6">NOTRE HISTOIRE</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Desmet Équipement est bien plus qu'un magasin d'équipement moto. C'est un lieu où les
                motards se retrouvent, partagent leur passion et trouvent des conseils avisés pour choisir
                l'équipement qui leur convient.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Situé au cœur de Wavre, notre magasin propose une large sélection de casques, vestes,
                gants, bottes et accessoires des meilleures marques du marché. Notre équipe expérimentée
                vous accueille avec professionnalisme et convivialité.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Nous croyons que chaque motard mérite un équipement de qualité, parfaitement adapté à
                sa morphologie et à son style de conduite. C'est pourquoi nous prenons le temps de vous
                accompagner dans chaque choix.
              </p>
            </motion.div>
          </div>

          {/* Values */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card border border-border rounded-lg p-6 text-center"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-2">{v.title}</h3>
                <p className="text-muted-foreground text-sm">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
