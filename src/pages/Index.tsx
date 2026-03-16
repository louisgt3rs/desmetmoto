import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, Calendar, Clock, Coffee, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import heroImg from "@/assets/hero-motorcycle.jpg";
import bikesCoffeeImg from "@/assets/bikes-coffee.jpg";
import storeImg from "@/assets/store-interior.jpg";
import helmetsImg from "@/assets/category-helmets.jpg";
import jacketsImg from "@/assets/category-jackets.jpg";
import glovesImg from "@/assets/category-gloves.jpg";
import bootsImg from "@/assets/category-boots.jpg";

const brands = ["Arai", "Shoei", "Alpinestars", "Dainese", "Rev'It", "Held", "Sidi", "TCX", "Shark", "Bering"];

const categories = [
  { name: "Casques", image: helmetsImg, link: "/arai" },
  { name: "Vestes", image: jacketsImg, link: "/brands" },
  { name: "Gants", image: glovesImg, link: "/brands" },
  { name: "Bottes", image: bootsImg, link: "/brands" },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function HomePage() {
  return (
    <Layout>
      {/* Hero */}
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
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground leading-none mb-4">
              DESMET <span className="text-gradient">ÉQUIPEMENT</span>
            </h1>
            <p className="font-display text-xl md:text-2xl text-muted-foreground tracking-wider mb-2">
              Spécialiste Équipement Moto à Wavre
            </p>
            <p className="text-muted-foreground mb-8">
              Casques • Vestes • Gants • Équipement Moto
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link to="/arai">Voir les Casques</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">Visiter le Magasin</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About preview */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <img src={storeImg} alt="Magasin Desmet" className="rounded-lg w-full object-cover aspect-video" />
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}>
              <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
                VOTRE SPÉCIALISTE <span className="text-gradient">MOTO</span> À WAVRE
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Depuis des années, Desmet Équipement accompagne les motards avec passion et expertise.
                Notre équipe expérimentée vous guide dans le choix de votre équipement pour une expérience
                moto sûre et confortable. Venez découvrir notre sélection de casques, vestes, gants et
                accessoires des meilleures marques.
              </p>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">Conseils d'experts • Marques premium • Service personnalisé</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Google Rating */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-8 h-8 ${i < 4 ? "text-primary fill-primary" : "text-primary/40 fill-primary/40"}`} />
              ))}
            </div>
            <p className="font-display text-5xl text-foreground mb-2">4.4 / 5</p>
            <p className="text-muted-foreground">basé sur <span className="text-foreground font-medium">281 avis</span> Google</p>
          </motion.div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeading title="NOS MARQUES" subtitle="Les meilleures marques d'équipement moto" />
          <motion.div {...fadeUp} className="flex flex-wrap justify-center gap-6">
            {brands.map((brand) => (
              <div key={brand} className="bg-card border border-border rounded-lg px-8 py-4 text-center hover:border-primary/50 transition-colors">
                <span className="font-display text-xl text-foreground">{brand}</span>
              </div>
            ))}
          </motion.div>
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link to="/brands">Toutes les marques <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <SectionHeading title="CATÉGORIES" subtitle="Trouvez l'équipement qu'il vous faut" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={cat.link} className="group block relative aspect-square rounded-lg overflow-hidden">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-display text-2xl text-foreground">{cat.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community / Bikes & Coffee */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <span className="text-primary font-medium text-sm tracking-wider uppercase mb-2 block">Communauté</span>
              <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
                BIKES & COFFEE
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Desmet Équipement organise des événements Bikes & Coffee où les motards se retrouvent
                devant le magasin pour partager un café, des motos et de bons moments.
              </p>
              <div className="bg-card border border-border rounded-lg p-6 mb-6 space-y-3">
                <h3 className="font-display text-xl text-foreground">Bikes & Coffee – Édition 1</h3>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4 text-primary" /> Desmet Équipement – Wavre
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4 text-primary" /> Samedi 28 Mars
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="w-4 h-4 text-primary" /> 10:00
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Coffee className="w-4 h-4 text-primary" /> Motos | Café | Communauté
                </div>
              </div>
              <Button asChild>
                <Link to="/community">Voir les Événements <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}>
              <img src={bikesCoffeeImg} alt="Bikes & Coffee" className="rounded-lg w-full object-cover aspect-video" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <SectionHeading title="NOUS TROUVER" subtitle="Chaussée de Louvain 491, 1300 Wavre" />
          <div className="rounded-lg overflow-hidden border border-border aspect-video max-h-[500px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2527.5!2d4.6!3d50.72!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTDCsDQzJzEyLjAiTiA0wrAzNicwMC4wIkU!5e0!3m2!1sfr!2sbe!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Desmet Équipement location"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}
