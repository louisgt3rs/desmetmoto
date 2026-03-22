import { useEffect } from "react";
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

export default function BrandModal({ brand, onClose }: BrandModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

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
        onClick={(event) => event.stopPropagation()}
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
          <div className="border-b border-border bg-secondary/40 px-6 pb-6 pt-14 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-[20px] border border-primary/30 bg-background shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
              {brand.logo_url ? (
                <img src={brand.logo_url} alt={brand.name} className="h-full w-full object-contain p-3" />
              ) : (
                <span className="font-display text-[32px] font-bold text-primary">
                  {brand.name.charAt(0)}
                </span>
              )}
            </div>

            <h3 className="mb-1 font-display text-[32px] tracking-[0.02em] text-foreground">
              {brand.name}
            </h3>
            <p className="mb-4 text-[13px] text-muted-foreground">
              {[brand.country, brand.founded_year ? `Depuis ${brand.founded_year}` : null].filter(Boolean).join(" · ") || "Disponible en magasin à Wavre"}
            </p>
          </div>

          <div className="space-y-5 px-6 py-6">
            {brand.description && (
              <p className="text-sm leading-7 text-muted-foreground">
                {brand.description}
              </p>
            )}

            {!!brand.categories?.length && (
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
            )}

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

            <div className="flex flex-col gap-[10px]">
              {brand.website_url ? (
                <a
                  href={brand.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-3 text-[13px] font-bold uppercase tracking-[0.05em] text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <ExternalLink className="h-[14px] w-[14px]" />
                  Visiter le site officiel
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

