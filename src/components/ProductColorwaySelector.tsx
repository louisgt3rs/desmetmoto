import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Package, ChevronLeft, ChevronRight, X, ZoomIn, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ReserveModal from "@/components/ReserveModal";

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
  const [productImgs, setProductImgs] = useState<string[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [reserveOpen, setReserveOpen] = useState(false);
  const touchStartX = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch colorways
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

  // Fetch product-level gallery images
  useEffect(() => {
    (supabase.from("product_images" as any) as any)
      .select("image_url, position")
      .eq("product_id", productId)
      .order("position")
      .then(({ data }: { data: { image_url: string; position: number }[] | null }) => {
        setProductImgs((data || []).map(d => d.image_url));
      });
  }, [productId]);

  // Reset photo index when colorway changes
  useEffect(() => {
    setPhotoIdx(0);
  }, [selected?.id]);

  const hasColorways = colorways.length > 0;

  // Build ordered gallery: main image → product_images → colorway gallery
  const gallery = useMemo(() => {
    const imgs: string[] = [];
    if (productImageUrl) imgs.push(productImageUrl);
    for (const url of productImgs) {
      if (url && !imgs.includes(url)) imgs.push(url);
    }
    if (hasColorways && selected) {
      if (selected.image_url && !imgs.includes(selected.image_url)) imgs.push(selected.image_url);
      for (const url of selected.gallery_images) {
        if (url && !imgs.includes(url)) imgs.push(url);
      }
    }
    return imgs;
  }, [productImageUrl, productImgs, hasColorways, selected]);

  // Auto-play: 4s interval, restarts when gallery length changes
  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (gallery.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setPhotoIdx(prev => (prev < gallery.length - 1 ? prev + 1 : 0));
    }, 4000);
  }, [gallery.length]);

  useEffect(() => {
    startAutoPlay();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startAutoPlay]);

  const goTo = (idx: number) => {
    setPhotoIdx(idx);
    startAutoPlay(); // restart timer on manual interaction
  };

  const prevPhoto = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    goTo(photoIdx > 0 ? photoIdx - 1 : gallery.length - 1);
  }, [photoIdx, gallery.length]);

  const nextPhoto = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    goTo(photoIdx < gallery.length - 1 ? photoIdx + 1 : 0);
  }, [photoIdx, gallery.length]);

  // Touch / swipe
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextPhoto(); else prevPhoto();
    }
  };

  // Lightbox navigation
  const lbPrev = (e: React.MouseEvent) => { e.stopPropagation(); setLightboxIdx(i => (i! > 0 ? i! - 1 : gallery.length - 1)); };
  const lbNext = (e: React.MouseEvent) => { e.stopPropagation(); setLightboxIdx(i => (i! < gallery.length - 1 ? i! + 1 : 0)); };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setLightboxIdx(i => (i! > 0 ? i! - 1 : gallery.length - 1));
      if (e.key === "ArrowRight") setLightboxIdx(i => (i! < gallery.length - 1 ? i! + 1 : 0));
      if (e.key === "Escape") setLightboxIdx(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, gallery.length]);

  const activeSizeStock = hasColorways ? selected?.stock_by_size || {} : parseSbs(productStockBySize);
  const hasSizeData = Object.keys(activeSizeStock).length > 0;
  const totalStock = hasSizeData
    ? Object.values(activeSizeStock).reduce((s, v) => s + (v || 0), 0)
    : productStockQuantity;

  const priceStr =
    typeof productPrice === "number"
      ? new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" }).format(productPrice)
      : null;

  return (
    <>
      <article className="overflow-hidden rounded-xl border border-border bg-card hover:border-primary/40 transition-all">
        {/* ── Carousel ──────────────────────────────────────────────────────── */}
        <div
          className="relative aspect-[4/3] overflow-hidden bg-secondary"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {gallery.length > 0 ? (
            /* Slide strip */
            <div
              className="flex h-full transition-transform duration-500 ease-in-out"
              style={{
                width: `${gallery.length * 100}%`,
                transform: `translateX(-${(photoIdx * 100) / gallery.length}%)`,
              }}
            >
              {gallery.map((img, i) => (
                <div
                  key={img + i}
                  className="relative h-full flex-shrink-0 cursor-zoom-in"
                  style={{ width: `${100 / gallery.length}%` }}
                  onClick={() => setLightboxIdx(i)}
                >
                  <img
                    src={img}
                    alt={`${productName} ${i + 1}`}
                    className="h-full w-full object-cover"
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
          )}

          {/* Nav arrows */}
          {gallery.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 text-foreground backdrop-blur-sm transition-all hover:bg-background hover:scale-110"
                aria-label="Photo précédente"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 text-foreground backdrop-blur-sm transition-all hover:bg-background hover:scale-110"
                aria-label="Photo suivante"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5">
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); goTo(i); }}
                    className={`block rounded-full transition-all duration-300 ${
                      i === photoIdx ? "w-5 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-foreground/30 hover:bg-foreground/60"
                    }`}
                    aria-label={`Photo ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Zoom hint (top-right, subtle) */}
          {gallery.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(photoIdx); }}
              className="absolute right-2 top-2 rounded-full bg-background/60 p-1.5 text-foreground/60 opacity-0 backdrop-blur-sm transition-all hover:bg-background hover:text-foreground group-hover:opacity-100"
              style={{ opacity: undefined }}
              aria-label="Voir en plein écran"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Stock badge */}
          <div
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
              totalStock > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {totalStock > 0 ? "EN STOCK" : "RUPTURE"}
          </div>
        </div>

        {/* ── Card body ─────────────────────────────────────────────────────── */}
        <div className="p-5">
          <h3 className="font-display text-xl text-foreground">{productName}</h3>

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

          {/* Size stock */}
          {hasSizeData ? (
            <div className="flex flex-wrap gap-x-3 gap-y-1.5">
              {SIZES_ORDER.filter((s) => s in activeSizeStock).map((size) => {
                const qty = activeSizeStock[size] || 0;
                return (
                  <span
                    key={size}
                    className={`text-xs font-medium tracking-wide ${qty > 0 ? "text-primary" : "text-muted-foreground/50"}`}
                  >
                    {size}:&nbsp;{qty}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Stock total : {totalStock} PCS</p>
          )}

          {/* Reserve CTA */}
          <button
            onClick={() => setReserveOpen(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 border border-primary/60 bg-primary/8 py-2.5 font-display text-xs uppercase tracking-[0.22em] text-primary transition-all duration-200 hover:bg-primary/15 hover:border-primary"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            RÉSERVER EN MAGASIN
          </button>
        </div>
      </article>

      <ReserveModal
        open={reserveOpen}
        onClose={() => setReserveOpen(false)}
        productId={productId}
        productName={productName}
        coloris={selected?.name ?? null}
      />

      {/* ── Lightbox ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={() => setLightboxIdx(null)}
          >
            {/* Close */}
            <button
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
              onClick={() => setLightboxIdx(null)}
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Prev */}
            {gallery.length > 1 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
                onClick={lbPrev}
                aria-label="Précédent"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Image */}
            <motion.img
              key={lightboxIdx}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              src={gallery[lightboxIdx]}
              alt={`${productName} — photo ${lightboxIdx + 1}`}
              className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next */}
            {gallery.length > 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
                onClick={lbNext}
                aria-label="Suivant"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Counter */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-xs font-medium text-white/70">
              {lightboxIdx + 1} / {gallery.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
