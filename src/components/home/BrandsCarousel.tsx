import { useNavigate } from "react-router-dom";
import { useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BrandEntry {
  name: string;
  slug: string;
  logo?: string;
}

const BRANDS: BrandEntry[] = [
  { name: "Arai", slug: "arai", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Arai_Helmet_company_logo.svg/320px-Arai_Helmet_company_logo.svg.png" },
  { name: "Shoei", slug: "shoei", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Shoei_logo.svg/320px-Shoei_logo.svg.png" },
  { name: "Alpinestars", slug: "alpinestars", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Alpinestars_logo.svg/320px-Alpinestars_logo.svg.png" },
  { name: "Shark", slug: "shark", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Shark_helmets_logo.svg/320px-Shark_helmets_logo.svg.png" },
  { name: "Bell", slug: "bell", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Bell_helmets_logo.svg/320px-Bell_helmets_logo.svg.png" },
  { name: "Scorpion EXO", slug: "scorpion-exo" },
  { name: "Dainese", slug: "dainese" },
  { name: "Rev'It", slug: "rev'it" },
  { name: "Held", slug: "held" },
  { name: "RST", slug: "rst" },
  { name: "Bering", slug: "bering" },
  { name: "Segura", slug: "segura" },
  { name: "TCX", slug: "tcx" },
  { name: "Sidi", slug: "sidi" },
  { name: "Oxford", slug: "oxford" },
  { name: "Nolan", slug: "nolan" },
  { name: "LS2", slug: "ls2" },
  { name: "Cardo", slug: "cardo" },
  { name: "Helite", slug: "helite" },
  { name: "Motul", slug: "motul" },
  { name: "Muc-Off", slug: "muc-off" },
  { name: "SW-Motech", slug: "sw-motech" },
  { name: "Ogio", slug: "ogio" },
  { name: "Bowtex", slug: "bowtex" },
  { name: "Fly Racing", slug: "fly-racing" },
  { name: "Richa", slug: "richa" },
  { name: "Bihr", slug: "bihr" },
  { name: "Premier", slug: "premier" },
  { name: "Kappa", slug: "kappa" },
  { name: "Ermax", slug: "ermax" },
  { name: "Abus", slug: "abus" },
  { name: "TomTom", slug: "tomtom" },
  { name: "Midland", slug: "midland" },
  { name: "Tech-Air", slug: "tech-air" },
  { name: "Auvray", slug: "auvray" },
  { name: "Zandonà", slug: "zandona" },
  { name: "Garmin", slug: "garmin" },
  { name: "D30", slug: "d30" },
  { name: "Optimate", slug: "optimate" },
];

function chunk<T>(arr: T[], size: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

function BrandLogo({ brand, onClick }: { brand: BrandEntry; onClick: () => void }) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-24 w-full items-center justify-center rounded-lg border border-primary/15 bg-[#1a1a1a] px-4 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
    >
      {brand.logo && !imgError ? (
        <img
          src={brand.logo}
          alt={brand.name}
          className="h-12 max-w-[140px] object-contain brightness-0 invert"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <span className="text-sm font-bold uppercase tracking-[0.15em] text-foreground/80">
          {brand.name}
        </span>
      )}
    </button>
  );
}

export default function BrandsCarousel() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = chunk(BRANDS, 3);
  const total = slides.length;

  const prev = useCallback(() => setCurrentSlide((s) => (s - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrentSlide((s) => (s + 1) % total), [total]);

  return (
    <div className="relative max-w-3xl mx-auto px-14">
      <button
        type="button"
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-secondary text-primary transition-all hover:bg-primary/10 hover:border-primary"
        aria-label="Précédent"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((group, idx) => (
            <div key={idx} className="grid min-w-full grid-cols-3 gap-3 px-1 py-2">
              {group.map((brand) => (
                <BrandLogo
                  key={brand.slug}
                  brand={brand}
                  onClick={() => navigate(`/marques/${brand.slug}`)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-secondary text-primary transition-all hover:bg-primary/10 hover:border-primary"
        aria-label="Suivant"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

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
