import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SectionHeading from "@/components/SectionHeading";
import helmetsImg from "@/assets/IMG_1591.jpeg";
import glovesImg from "@/assets/IMG_1592.jpeg";
import bootsImg from "@/assets/IMG_1593.jpeg";
import jacketsImg from "@/assets/IMG_1594.jpeg";

const categories = [
  { name: "Casques", image: helmetsImg, link: "/marques/arai" },
  { name: "Vestes", image: jacketsImg, link: "/categorie/vestes" },
  { name: "Gants", image: glovesImg, link: "/categorie/gants" },
  { name: "Bottes", image: bootsImg, link: "/categorie/bottes" },
];

export default function CategoriesSection() {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <SectionHeading title="CATÉGORIES" subtitle="Trouvez l'équipement qu'il vous faut" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link to={cat.link} className="group block relative aspect-[3/4] rounded-xl overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                {/* Strong gradient overlay — always readable */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.10) 100%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <h3
                    className="font-display text-white leading-none group-hover:text-[#c9973a] transition-colors duration-300"
                    style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
                  >
                    {cat.name}
                  </h3>
                  <span className="mt-1 block font-display text-[11px] uppercase tracking-[0.3em] text-[#c9973a] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Découvrir →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
