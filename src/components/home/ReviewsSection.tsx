import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

const GOOGLE_URL = "https://maps.app.goo.gl/usjUYzvsD9vi72BD8?g_st=ic";

const reviews = [
  {
    name: "Maxime M.",
    stars: 5,
    text: "Super conseil, le personnel est à l'écoute et nous trouve les meilleurs produits, superbe expérience.",
    date: "janvier 2025",
  },
  {
    name: "Thierry P.",
    stars: 5,
    text: "Super conseils pour l'achat d'un casque. Grande expérience et belle écoute de mes besoins pour trouver le produit qui répond à mes besoins.",
    date: "novembre 2024",
  },
  {
    name: "Jean-Marie D.",
    stars: 5,
    text: "Un café et un passionné : quelle chouette expérience !",
    date: "octobre 2024",
  },
  {
    name: "Louis Z.",
    stars: 5,
    text: "Super service !",
    date: "Google",
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
          <p className="text-sm text-muted-foreground">basé sur <span className="text-foreground font-medium">272 avis</span> Google</p>
        </motion.div>

        {/* Review cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review, i) => (
            <motion.a
              key={review.name}
              href={GOOGLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/40 hover:shadow-[0_0_20px_hsl(var(--glow-soft))] transition-all duration-500 flex flex-col"
            >
              <Quote className="w-8 h-8 text-primary/20 mb-3" />
              <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">{review.text}</p>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(review.stars)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-primary fill-primary" />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium text-sm">{review.name}</span>
                <span className="text-xs text-muted-foreground">{review.date}</span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
