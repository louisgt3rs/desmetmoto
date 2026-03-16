import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import serviceImg from "@/assets/service-installation.jpg";

const services = [
  "Supports téléphone Quad Lock et SP Connect",
  "Intercoms Sena, Cardo et systèmes audio dans les casques",
  "Fixations GPS et accessoires électroniques",
  "Installation propre et réglage du système",
];

export default function ServiceSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="INSTALLATION D'ACCESSOIRES MOTO"
          subtitle="Nous installons vos équipements directement en magasin pour une intégration propre et sécurisée."
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
            <img
              src={serviceImg}
              alt="Installation d'intercom Cardo sur casque moto"
              className="w-full h-full object-cover"
            />
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
            <p className="text-muted-foreground mb-6">
              Notre équipe peut installer vos accessoires moto directement sur place :
            </p>

            <ul className="space-y-4 mb-8">
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

            <p className="text-muted-foreground mb-8">
              Vous repartez avec un équipement parfaitement monté et prêt à rouler.
            </p>

            <Button asChild size="lg" className="group">
              <Link to="/contact">
                Faire installer en magasin
                <motion.span className="inline-block transition-transform group-hover:translate-x-1 ml-1">
                  →
                </motion.span>
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
