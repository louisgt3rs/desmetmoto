import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SectionHeading from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Brand = Tables<"brands">;

const fallbackBrands = [
  "Arai", "Shoei", "AGV", "HJC", "Shark", "Alpinestars", "Dainese",
  "Ixon", "Furygan", "Rev'it", "Segura", "Bering", "Richa", "Held",
  "Five Gloves", "TCX", "Forma", "Sidi", "Cardo", "Quad Lock"
];

export default function BrandsSection() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("brands").select("*").order("sort_order").then(({ data }) => {
      if (data && data.length > 0) setBrands(data);
    });
  }, []);

  // Auto-scroll carousel
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let animId: number;
    let pos = 0;
    const speed = 0.5;
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
  }, [brands]);

  const displayBrands = brands.length > 0
    ? brands
    : fallbackBrands.map((name, i) => ({ id: name, name, logo_url: null, category: null, description: null, sort_order: i, created_at: "", updated_at: "" }));

  // Duplicate for infinite scroll
  const doubled = [...displayBrands, ...displayBrands];

  return (
    <section className="py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <SectionHeading title="NOS MARQUES" subtitle="Les meilleures marques d'équipement moto" />
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-hidden py-4 px-4"
        style={{ scrollBehavior: "auto" }}
      >
        {doubled.map((brand, i) => (
          <Link
            to="/brands"
            key={`${brand.id}-${i}`}
            className="group shrink-0 w-40 h-28 bg-card border border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/60 hover:shadow-[0_0_30px_hsl(var(--glow-soft))] transition-all duration-300 hover:scale-105"
          >
            {brand.logo_url ? (
              <img
                src={brand.logo_url}
                alt={brand.name}
                className="w-12 h-12 object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                <span className="font-display text-lg text-muted-foreground group-hover:text-primary transition-colors">
                  {brand.name.charAt(0)}
                </span>
              </div>
            )}
            <span className="font-display text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {brand.name}
            </span>
          </Link>
        ))}
      </div>

      <div className="container mx-auto px-4 mt-6 text-center">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <Link to="/brands" className="text-sm text-primary hover:underline font-medium">
            Voir toutes les marques →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
