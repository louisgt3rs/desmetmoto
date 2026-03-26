import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductColorway {
  id: string;
  name: string;
  image_url: string | null;
  gallery_images: string[];
  stock_by_size: Record<string, number>;
}

const SIZES_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];

function parseSbs(v: unknown): Record<string, number> {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, number>;
  return {};
}

interface Props {
  productId: string;
  productName: string;
  productImageUrl?: string | null;
  productPrice?: number | null;
  productStockBySize?: unknown;
  productStockQuantity?: number;
}

export default function ProductColorwaySelector({
  productId,
  productName,
  productImageUrl,
  productPrice,
  productStockBySize,
  productStockQuantity = 0,
}: Props) {
  const [colorways, setColorways] = useState<ProductColorway[]>([]);
  const [selected, setSelected] = useState<ProductColorway | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => {
    supabase
      .from("product_colorways")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order")
      .then(({ data }) => {
        const cws = (data || []).map((d) => ({
          id: d.id,
          name: d.name,
          image_url: d.image_url,
          gallery_images: Array.isArray(d.gallery_images) ? (d.gallery_images as string[]) : [],
          stock_by_size: parseSbs(d.stock_by_size),
        }));
        setColorways(cws);
        if (cws.length > 0) setSelected(cws[0]);
        setLoaded(true);
      });
  }, [productId]);

  // Reset photo index when colorway changes
  useEffect(() => {
    setPhotoIdx(0);
  }, [selected?.id]);

  const hasColorways = colorways.length > 0;

  // Build gallery: main image + gallery_images for selected colorway
  const buildGallery = (): string[] => {
    if (!hasColorways || !selected) {
      return productImageUrl ? [productImageUrl] : [];
    }
    const imgs: string[] = [];
    if (selected.image_url) imgs.push(selected.image_url);
    if (selected.gallery_images.length > 0) {
      selected.gallery_images.forEach((url) => {
        if (url && !imgs.includes(url)) imgs.push(url);
      });
    }
    if (imgs.length === 0 && productImageUrl) imgs.push(productImageUrl);
    return imgs;
  };

  const gallery = buildGallery();
  const activeImage = gallery[photoIdx] || null;
  const hasMultiplePhotos = gallery.length > 1;

  const activeSizeStock = hasColorways
    ? selected?.stock_by_size || {}
    : parseSbs(productStockBySize);
  const hasSizeData = Object.keys(activeSizeStock).length > 0;
  const totalStock = hasSizeData
    ? Object.values(activeSizeStock).reduce((s, v) => s + (v || 0), 0)
    : productStockQuantity;

  const priceStr =
    typeof productPrice === "number"
      ? new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" }).format(productPrice)
      : null;

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIdx((i) => (i > 0 ? i - 1 : gallery.length - 1));
  };
  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIdx((i) => (i < gallery.length - 1 ? i + 1 : 0));
  };

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card hover:border-primary/40 transition-all">
      {/* Image with navigation arrows */}
      <div className="relative aspect-[4/3] bg-secondary">
        {activeImage ? (
          <img src={activeImage} alt={productName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
        )}

        {/* Photo navigation arrows */}
        {hasMultiplePhotos && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm p-1.5 text-foreground hover:bg-background transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm p-1.5 text-foreground hover:bg-background transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {/* Dots indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {gallery.map((_, i) => (
                <span
                  key={i}
                  className={`block h-1.5 rounded-full transition-all ${
                    i === photoIdx ? "w-4 bg-primary" : "w-1.5 bg-foreground/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        <div
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
            totalStock > 0
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {totalStock > 0 ? "EN STOCK" : "RUPTURE"}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display text-xl text-foreground">{productName}</h3>

        {/* Colorway name */}
        {hasColorways && selected && (
          <p className="text-xs text-primary uppercase tracking-wider mb-1">{selected.name}</p>
        )}

        {priceStr && (
          <p className="text-primary font-display text-lg mb-3">{priceStr}</p>
        )}

        {/* Colorway thumbnails */}
        {hasColorways && loaded && (
          <div className="flex flex-wrap gap-2 mb-4">
            {colorways.map((cw) => {
              const thumb = cw.image_url || (cw.gallery_images.length > 0 ? cw.gallery_images[0] : null);
              return (
                <button
                  key={cw.id}
                  onClick={() => setSelected(cw)}
                  className={`relative overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                    selected?.id === cw.id
                      ? "border-primary shadow-[0_0_10px_hsl(var(--glow-soft))]"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  {thumb ? (
                    <img src={thumb} alt={cw.name} className="w-12 h-12 object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-muted flex items-center justify-center">
                      <span className="text-[9px] text-muted-foreground text-center px-0.5 leading-tight">{cw.name}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Size stock display */}
        {hasSizeData ? (
          <div className="flex flex-wrap gap-x-3 gap-y-1.5">
            {SIZES_ORDER.filter((s) => s in activeSizeStock).map((size) => {
              const qty = activeSizeStock[size] || 0;
              return (
                <span
                  key={size}
                  className={`text-xs font-medium tracking-wide ${
                    qty > 0 ? "text-primary" : "text-muted-foreground/50"
                  }`}
                >
                  {size}:&nbsp;{qty}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Stock total : {totalStock} PCS
          </p>
        )}
      </div>
    </article>
  );
}
