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
  { name: "Alpinestars", slug: "alpinestars", logo: "https://seeklogo.com/images/A/alpinestars-logo-A5B6A8F8B4-seeklogo.com.png" },
  { name: "Shark", slug: "shark", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Shark_helmets_logo.svg/320px-Shark_helmets_logo.svg.png" },
  { name: "Bell", slug: "bell", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Bell_helmets_logo.svg/320px-Bell_helmets_logo.svg.png" },
  { name: "Scorpion EXO", slug: "scorpion-exo", logo: "https://logo.clearbit.com/scorpionexo.com" },
  { name: "Dainese", slug: "dainese", logo: "https://logo.clearbit.com/dainese.com" },
  { name: "Rev'It", slug: "rev-it", logo: "https://logo.clearbit.com/revitsport.com" },
  { name: "Held", slug: "held", logo: "https://logo.clearbit.com/held.de" },
  { name: "RST", slug: "rst", logo: "https://logo.clearbit.com/rst-moto.com" },
  { name: "Bering", slug: "bering", logo: "https://logo.clearbit.com/bfrbrands.com" },
  { name: "Segura", slug: "segura", logo: "https://logo.clearbit.com/segura-racing.com" },
  { name: "TCX", slug: "tcx", logo: "https://logo.clearbit.com/tcxboots.com" },
  { name: "Sidi", slug: "sidi", logo: "https://logo.clearbit.com/sidi.com" },
  { name: "Oxford", slug: "oxford", logo: "https://logo.clearbit.com/oxfordproducts.com" },
  { name: "Nolan", slug: "nolan", logo: "https://logo.clearbit.com/nolan.it" },
  { name: "LS2", slug: "ls2", logo: "https://logo.clearbit.com/ls2helmets.com" },
  { name: "Cardo", slug: "cardo", logo: "https://logo.clearbit.com/cardosystems.com" },
  { name: "Helite", slug: "helite", logo: "https://logo.clearbit.com/helite.com" },
  { name: "Motul", slug: "motul", logo: "https://logo.clearbit.com/motul.com" },
  { name: "Muc-Off", slug: "muc-off", logo: "https://logo.clearbit.com/muc-off.com" },
  { name: "SW-Motech", slug: "sw-motech", logo: "https://logo.clearbit.com/sw-motech.com" },
  { name: "Ogio", slug: "ogio", logo: "https://logo.clearbit.com/ogio.com" },
  { name: "Bowtex", slug: "bowtex", logo: "https://logo.clearbit.com/bowtex.eu" },
  { name: "Fly Racing", slug: "fly-racing", logo: "https://logo.clearbit.com/flyracing.com" },
  { name: "Richa", slug: "richa", logo: "https://logo.clearbit.com/richa.eu" },
  { name: "Bihr", slug: "bihr", logo: "https://logo.clearbit.com/bihr.eu" },
  { name: "Premier", slug: "premier", logo: "https://logo.clearbit.com/premier.it" },
  { name: "Kappa", slug: "kappa", logo: "https://logo.clearbit.com/kappa.com" },
  { name: "Ermax", slug: "ermax", logo: "https://logo.clearbit.com/ermax.com" },
  { name: "Abus", slug: "abus", logo: "https://logo.clearbit.com/abus.com" },
  { name: "TomTom", slug: "tomtom", logo: "https://logo.clearbit.com/tomtom.com" },
  { name: "Midland", slug: "midland", logo: "https://logo.clearbit.com/midlandeurope.com" },
  { name: "Tech-Air", slug: "tech-air", logo: "https://logo.clearbit.com/alpinestars.com" },
  { name: "Auvray", slug: "auvray", logo: "https://logo.clearbit.com/auvray.fr" },
  { name: "Zandonà", slug: "zandona", logo: "https://logo.clearbit.com/zandona.net" },
  { name: "Garmin", slug: "garmin", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Garmin_logo.svg/320px-Garmin_logo.svg.png" },
  { name: "D30", slug: "d30", logo: "https://logo.clearbit.com/d3o.com" },
  { name: "Optimate", slug: "optimate", logo: "https://logo.clearbit.com/tecmate.com" },
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
