import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SectionHeading from "@/components/SectionHeading";
import helmetsImg from "@/assets/category-helmets.jpg";
import jacketsImg from "@/assets/category-jackets.jpg";
import glovesImg from "@/assets/category-gloves.jpg";
import bootsImg from "@/assets/category-boots.jpg";

const categories = [
  { name: "Casques", image: helmetsImg, link: "/arai" },
  { name: "Vestes", image: jacketsImg, link: "/brands" },
  { name: "Gants", image: glovesImg, link: "/brands" },
  { name: "Bottes", image: bootsImg, link: "/brands" },
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
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <h3 className="font-display text-xl md:text-2xl text-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
