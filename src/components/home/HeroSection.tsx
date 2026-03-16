import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-motorcycle.jpg";

export default function HeroSection() {
  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center">
      <div className="absolute inset-0">
        <img src={heroImg} alt="Motorcycle" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-block text-primary font-medium text-sm tracking-[0.3em] uppercase mb-4"
          >
            Wavre, Belgique
          </motion.span>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground leading-none mb-4">
            DESMET <span className="text-gradient">ÉQUIPEMENT</span>
          </h1>
          <p className="font-display text-xl md:text-2xl text-muted-foreground tracking-wider mb-2">
            Spécialiste Équipement Moto
          </p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-muted-foreground mb-8 max-w-md"
          >
            Casques, vestes, gants, bottes et accessoires des meilleures marques pour les passionnés de moto.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <Button asChild size="lg" className="group">
              <Link to="/arai">
                Découvrir nos Casques
                <motion.span className="inline-block transition-transform group-hover:translate-x-1">→</motion.span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Visiter le Magasin</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
