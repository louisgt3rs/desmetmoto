import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BrandEntry {
  name: string;
  slug: string;
  logo?: string | null;
}

function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const CARD_SIZE = 100;
const GAP = 8;
const VISIBLE = 3;

export default function BrandsCarousel() {
  const navigate = useNavigate();
  const [offset, setOffset] = useState(0);
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

  const maxOffset = Math.max(0, brands.length - VISIBLE);
  const prev = () => setOffset((o) => Math.max(0, o - 1));
  const next = () => setOffset((o) => Math.min(maxOffset, o + 1));

  if (brands.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <span className="text-muted-foreground text-sm">Chargement des marques…</span>
      </div>
    );
  }

  const trackWidth = VISIBLE * CARD_SIZE + (VISIBLE - 1) * GAP;
  const tx = offset * (CARD_SIZE + GAP);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={prev}
          disabled={offset === 0}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-secondary text-primary transition-all hover:bg-primary/10 hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Précédent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div style={{ width: trackWidth, overflow: "hidden" }}>
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ gap: GAP, transform: `translateX(-${tx}px)` }}
          >
            {brands.map((brand) => (
              <BrandCard key={brand.slug} brand={brand} onClick={() => navigate(`/marques/${brand.slug}`)} />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={next}
          disabled={offset >= maxOffset}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-secondary text-primary transition-all hover:bg-primary/10 hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Suivant"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function BrandCard({ brand, onClick }: { brand: BrandEntry; onClick: () => void }) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ width: CARD_SIZE, height: CARD_SIZE, flexShrink: 0, padding: 10, boxSizing: "border-box" }}
      className="flex items-center justify-center rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a] transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_16px_hsl(var(--primary)/0.15)]"
    >
      {brand.logo && !imgError ? (
        <img
          src={brand.logo}
          alt={brand.name}
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary text-center leading-tight">
          {brand.name}
        </span>
      )}
    </button>
  );
}
