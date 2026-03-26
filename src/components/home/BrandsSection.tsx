import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const BRANDS = [
  "Premier", "Kappa", "Ermax", "Optimate", "Scorpion EXO", "Alpinestars",
  "Helite", "Arai", "Muc-Off", "TCX", "Cardo", "Bowtex", "Fly Racing",
  "Shark", "LS2", "RST", "Bell", "Bering", "Motul", "Ogio", "SW-Motech",
  "Abus", "TomTom", "Segura", "Midland", "Tech-Air", "Auvray", "Nolan",
  "Zandonà", "Bihr", "Richa", "Shoei", "Garmin", "D30",
];

const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  const navigate = useNavigate();
  const items = [...BRANDS, ...BRANDS];

  return (
    <div className="relative overflow-hidden py-3">
      <div
        className={`flex w-max gap-4 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
      >
        {items.map((brand, i) => (
          <button
            key={`${brand}-${i}`}
            type="button"
            onClick={() => navigate(`/marques/${toSlug(brand)}`)}
            className="shrink-0 whitespace-nowrap rounded-full border border-primary/20 bg-secondary px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-foreground transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_18px_hsl(var(--primary)/0.35)]"
          >
            {brand}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BrandsSection() {
  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-3">
            NOS MARQUES
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm tracking-[0.2em] uppercase">
            Plus de 30 marques disponibles en magasin à Wavre
          </p>
        </motion.div>
      </div>

      <MarqueeRow />
      <MarqueeRow reverse />
    </section>
  );
}
