import { useNavigate } from "react-router-dom";
import { useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ALL_BRANDS = [
  "Premier", "Kappa", "Ermax", "Optimate", "Scorpion EXO", "Alpinestars",
  "Helite", "Arai", "Muc-Off", "TCX", "Cardo", "Bowtex", "Fly Racing",
  "Shark", "LS2", "RST", "Bell", "Bering", "Motul", "Ogio", "SW-Motech",
  "Abus", "TomTom", "Segura", "Midland", "Tech-Air", "Auvray", "Nolan",
  "Zandonà", "Bihr", "Richa", "Shoei", "Garmin", "D30", "Dainese", "Held",
  "Oxford", "Rev'It", "Sidi",
];

const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

// Group brands into chunks
function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export default function BrandsCarousel() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 4 brands per slide on desktop, 3 on mobile
  const perSlide = typeof window !== "undefined" && window.innerWidth < 768 ? 3 : 4;
  const slides = chunk(ALL_BRANDS, perSlide);
  const total = slides.length;

  const prev = useCallback(() => setCurrentSlide((s) => (s - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrentSlide((s) => (s + 1) % total), [total]);

  return (
    <div className="relative max-w-4xl mx-auto px-12">
      {/* Left arrow */}
      <button
        type="button"
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-secondary text-primary transition-all hover:bg-primary/10 hover:border-primary"
        aria-label="Précédent"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Carousel viewport */}
      <div ref={containerRef} className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((group, slideIdx) => (
            <div
              key={slideIdx}
              className="flex min-w-full justify-center gap-3 md:gap-4 py-2"
            >
              {group.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => navigate(`/marques/${toSlug(brand)}`)}
                  className="shrink-0 whitespace-nowrap rounded-full border border-primary/20 bg-secondary px-5 py-2.5 text-xs md:text-sm font-bold uppercase tracking-[0.12em] text-foreground transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_18px_hsl(var(--primary)/0.35)]"
                >
                  {brand}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Right arrow */}
      <button
        type="button"
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-secondary text-primary transition-all hover:bg-primary/10 hover:border-primary"
        aria-label="Suivant"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentSlide(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentSlide
                ? "w-6 bg-primary"
                : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
