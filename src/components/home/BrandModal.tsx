import { useEffect, useState } from "react";
import { X, MapPin, ExternalLink, ShoppingBag, Globe } from "lucide-react";

interface BrandModalProps {
  brand: BrandModalBrand;
  onClose: () => void;
}

export interface BrandModalProduct {
  name: string;
  image_url?: string | null;
}

export interface BrandModalBrand {
  id: string;
  name: string;
  description?: string | null;
  country?: string | null;
  founded_year?: number | null;
  categories?: string[] | null;
  logo_url?: string | null;
  website_url?: string | null;
  products?: BrandModalProduct[];
}

function extractDomain(url?: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function BrandLogo({ brand, size = 64 }: { brand: BrandModalBrand; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    if (brand.logo_url) {
      setSrc(brand.logo_url);
    } else {
      const domain = extractDomain(brand.website_url);
      if (domain) {
        setSrc(`https://logo.clearbit.com/${domain}`);
      } else {
        setSrc(null);
      }
    }
  }, [brand.logo_url, brand.website_url]);

  if (!src || failed) {
    return (
      <span className="font-display font-bold text-primary" style={{ fontSize: size * 0.45 }}>
        {brand.name.charAt(0)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={brand.name}
      className="h-full w-full object-contain p-3"
      onError={() => setFailed(true)}
    />
  );
}

export default function BrandModal({ brand, onClose }: BrandModalProps) {
  const [heroBgFailed, setHeroBgFailed] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const meta = [brand.country, brand.founded_year ? `Depuis ${brand.founded_year}` : null]
    .filter(Boolean)
    .join(" · ");

  // Use first product image or clearbit logo as a subtle hero background
  const heroImage =
    brand.products?.find((p) => p.image_url)?.image_url ?? null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Détails de la marque ${brand.name}`}
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-background/85 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-[28px] border border-border bg-card shadow-2xl sm:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_4px_15px_hsl(var(--foreground)/0.35)] transition-opacity hover:opacity-90"
        >
          <X className="h-[18px] w-[18px]" />
        </button>

        <div className="flex-1 overflow-y-auto">
          {/* Header with hero background */}
          <div className="relative border-b border-border px-6 pb-6 pt-14 text-center overflow-hidden">
            {/* Subtle hero background */}
            {heroImage && !heroBgFailed ? (
              <img
                src={heroImage}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover opacity-[0.08] blur-sm"
                onError={() => setHeroBgFailed(true)}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-secondary/40" />
            )}

            <div className="relative z-[1]">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-[20px] border border-primary/30 bg-background shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
                <BrandLogo brand={brand} size={96} />
              </div>

              <h3 className="mb-1 font-display text-[32px] tracking-[0.02em] text-foreground">
                {brand.name}
              </h3>
              <p className="text-[13px] text-muted-foreground">
                {meta || "Disponible en magasin à Wavre"}
              </p>
            </div>
          </div>

          <div className="space-y-5 px-6 py-6">
            {/* Description */}
            {brand.description && (
              <p className="text-sm leading-7 text-muted-foreground">
                {brand.description}
              </p>
            )}

            {/* Categories */}
            {!!brand.categories?.length && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <ShoppingBag className="h-[14px] w-[14px] text-primary" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
                    Catégories disponibles
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {brand.categories.map((category) => (
                    <span
                      key={category}
                      className="rounded-full border border-primary/25 bg-primary/10 px-[14px] py-[5px] text-xs font-semibold text-primary"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Featured products */}
            {!!brand.products?.length && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <ShoppingBag className="h-[14px] w-[14px] text-primary" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
                    Produits phares
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-3">
                  {brand.products.slice(0, 3).map((product) => (
                    <div
                      key={product.name}
                      className="overflow-hidden rounded-xl border border-border bg-secondary text-center"
                    >
                      <div className="flex aspect-[4/3] items-center justify-center bg-muted">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <ShoppingBag className="h-[18px] w-[18px] text-muted-foreground" />
                        )}
                      </div>
                      <span className="block px-3 py-4 text-[11px] font-medium leading-[1.3] text-foreground/80">
                        {product.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-[10px]">
              {brand.website_url ? (
                <a
                  href={brand.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-3 text-[13px] font-bold uppercase tracking-[0.05em] text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <ExternalLink className="h-[14px] w-[14px]" />
                  Voir les produits
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-3 py-3 text-[13px] font-bold uppercase tracking-[0.05em] text-muted-foreground">
                  <Globe className="h-[14px] w-[14px]" />
                  Site officiel bientôt disponible
                </div>
              )}

              <div className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-[10px]">
                <MapPin className="h-[14px] w-[14px] text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-primary">
                  Disponible en magasin à Wavre
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}