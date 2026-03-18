import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, MapPin, ExternalLink, ShoppingBag } from "lucide-react";
import type { BrandInfo } from "./brands-data";

interface BrandModalProps {
  brand: BrandInfo;
  onClose: () => void;
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

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Détails de la marque ${brand.name}`}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-[480px] flex-col overflow-hidden rounded-[20px] border border-border bg-card"
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
          {brand.heroImage && (
            <div className="relative h-[180px] w-full overflow-hidden">
              <img
                src={brand.heroImage}
                alt={brand.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,hsl(var(--card))_100%)]" />
            </div>
          )}

          <div className="relative z-[2] px-6 text-center" style={{ marginTop: brand.heroImage ? "-40px" : "1.5rem" }}>
            <div className="mx-auto mb-3 flex h-[72px] w-[72px] items-center justify-center rounded-[18px] border-2 border-primary bg-secondary shadow-[0_0_30px_hsl(var(--primary)/0.35)]">
              <span className="font-display text-[32px] font-bold text-primary">
                {brand.name.charAt(0)}
              </span>
            </div>

            <h3 className="mb-1 font-display text-[32px] tracking-[0.02em] text-foreground">
              {brand.name}
            </h3>
            <p className="mb-4 text-[13px] text-muted-foreground">
              {brand.country} · Depuis {brand.year}
            </p>
            <p className="mb-5 text-left text-sm leading-7 text-muted-foreground">
              {brand.description}
            </p>
          </div>

          <div className="mb-5 px-6">
            <div className="flex flex-wrap justify-center gap-2">
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

          {brand.products.length > 0 && (
            <div className="mb-5 px-6">
              <div className="mb-3 flex items-center gap-2">
                <ShoppingBag className="h-[14px] w-[14px] text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
                  Produits phares
                </span>
              </div>

              <div className="grid gap-[10px]" style={{ gridTemplateColumns: `repeat(${Math.min(brand.products.length, 3)}, 1fr)` }}>
                {brand.products.slice(0, 3).map((product) => (
                  <div
                    key={product.name}
                    className="rounded-xl border border-border bg-secondary px-[10px] py-[14px] text-center"
                  >
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-[10px] bg-muted">
                      <ShoppingBag className="h-[18px] w-[18px] text-muted-foreground" />
                    </div>
                    <span className="block text-[11px] font-medium leading-[1.3] text-foreground/80">
                      {product.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-[10px] px-6 pb-6">
            <a
              href={brand.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-3 text-[13px] font-bold uppercase tracking-[0.05em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              <ExternalLink className="h-[14px] w-[14px]" />
              Visiter le site officiel
            </a>

            <div className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-[10px]">
              <MapPin className="h-[14px] w-[14px] text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-primary">
                Disponible en magasin à Wavre
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

