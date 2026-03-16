import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

const reviews = [
  {
    name: "Thomas D.",
    stars: 5,
    text: "Super magasin avec un excellent choix de casques Arai et Shoei. L'équipe m'a aidé à trouver la taille parfaite.",
  },
  {
    name: "Laurent M.",
    stars: 5,
    text: "L'équipe est passionnée et donne de très bons conseils. Je recommande vivement pour tout équipement moto.",
  },
  {
    name: "Sophie V.",
    stars: 5,
    text: "Ambiance motarde incroyable pendant les Bikes & Coffee. Un vrai lieu de rencontre pour la communauté !",
  },
  {
    name: "Marc B.",
    stars: 5,
    text: "Large choix de marques et prix corrects. Le service est top, ils prennent le temps de bien vous conseiller.",
  },
];

export default function ReviewsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <SectionHeading title="AVIS DES MOTARDS" subtitle="Ce que disent nos clients" />

        {/* Overall rating */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-1.5 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-7 h-7 ${i < 4 ? "text-primary fill-primary" : "text-primary/40 fill-primary/40"}`} />
            ))}
          </div>
          <p className="font-display text-4xl text-foreground">4.4 / 5</p>
          <p className="text-sm text-muted-foreground">basé sur <span className="text-foreground font-medium">281 avis</span> Google</p>
        </motion.div>

        {/* Review cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/40 hover:shadow-[0_0_20px_hsl(var(--glow-soft))] transition-all duration-500"
            >
              <Quote className="w-8 h-8 text-primary/20 mb-3" />
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{review.text}</p>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(review.stars)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-primary fill-primary" />
                ))}
              </div>
              <span className="text-foreground font-medium text-sm">{review.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
