import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";

import araiLogo from "@/assets/brands/arai.png";
import shoeiLogo from "@/assets/brands/shoei.png";
import sharkLogo from "@/assets/brands/shark.png";
import alpinestarsLogo from "@/assets/brands/alpinestars.png";
import daineseLogo from "@/assets/brands/dainese.png";
import revitLogo from "@/assets/brands/revit.png";
import beringLogo from "@/assets/brands/bering.png";
import tcxLogo from "@/assets/brands/tcx.png";
import sidiLogo from "@/assets/brands/sidi.png";
import cardoLogo from "@/assets/brands/cardo.png";

const brands = [
  { name: "Arai", logo: araiLogo },
  { name: "Shoei", logo: shoeiLogo },
  { name: "Shark", logo: sharkLogo },
  { name: "Alpinestars", logo: alpinestarsLogo },
  { name: "Dainese", logo: daineseLogo },
  { name: "Rev'it", logo: revitLogo },
  { name: "Bering", logo: beringLogo },
  { name: "TCX", logo: tcxLogo },
  { name: "Sidi", logo: sidiLogo },
  { name: "Cardo", logo: cardoLogo },
];

export default function BrandsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let animId: number;
    let pos = 0;
    const speed = 0.4;
    const tick = () => {
      pos += speed;
      if (pos >= el.scrollWidth / 2) pos = 0;
      el.scrollLeft = pos;
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    const pause = () => cancelAnimationFrame(animId);
    const resume = () => { animId = requestAnimationFrame(tick); };
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
    };
  }, []);

  const doubled = [...brands, ...brands];

  return (
    <section className="py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <SectionHeading title="NOS MARQUES" subtitle="Les meilleures marques d'équipement moto" />
      </div>

      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-hidden py-6 px-4"
        style={{ scrollBehavior: "auto" }}
      >
        {doubled.map((brand, i) => (
          <motion.div
            key={`${brand.name}-${i}`}
            whileHover={{ scale: 1.08 }}
            className="group shrink-0 w-44 h-32 bg-card border border-border rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary/60 hover:shadow-[0_0_30px_hsl(var(--glow-soft))] transition-all duration-300 cursor-pointer"
          >
            <img
              src={brand.logo}
              alt={brand.name}
              className="w-16 h-16 object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 invert"
            />
            <span className="font-display text-sm text-muted-foreground group-hover:text-primary transition-colors duration-300">
              {brand.name}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 mt-6 text-center">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <a href="/brands" className="text-sm text-primary hover:underline font-medium">
            Voir toutes les marques →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
