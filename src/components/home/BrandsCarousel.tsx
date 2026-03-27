import { useNavigate } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BrandEntry {
  name: string;
  slug: string;
  logo?: string | null;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function BrandLogo({ brand, onClick }: { brand: BrandEntry; onClick: () => void }) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-24 w-full items-center justify-center rounded-lg border border-primary/15 bg-[#1a1a1a] p-3 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
    >
      {brand.logo && !imgError ? (
        <img
          src={brand.logo}
          alt={brand.name}
          className="h-full w-full object-contain brightness-0 invert"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <span className="text-sm font-bold uppercase tracking-[0.15em] text-primary">
          {brand.name}
        </span>
      )}
    </button>
  );
}

export default function BrandsCarousel() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [brands, setBrands] = useState<BrandEntry[]>([]);

  useEffect(() => {
    supabase
      .from("brands")
      .select("name, logo_url")
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setBrands(data.map((b) => ({ name: b.name, slug: nameToSlug(b.name), logo: b.logo_url })));
        }
      });
  }, []);

  const slides = chunk(brands, 3);
  const total = slides.length;

  const prev = useCallback(() => setCurrentSlide((s) => (s - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrentSlide((s) => (s + 1) % total), [total]);

  if (brands.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <span className="text-muted-foreground text-sm">Chargement des marques…</span>
      </div>
    );
  }

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
