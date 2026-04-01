import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Package, ChevronLeft, ChevronRight, X, ZoomIn, Check, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

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

const EMPTY_FORM = { first_name: "", last_name: "", email: "", phone: "", message: "", rgpd: false };

export default function ProductColorwaySelector({
  productId,
  productName,
  productImageUrl,
  productPrice,
  productStockBySize,
  productStockQuantity = 0,
}: Props) {
  const [colorways,   setColorways]   = useState<ProductColorway[]>([]);
  const [selected,    setSelected]    = useState<ProductColorway | null>(null);
  const [loaded,      setLoaded]      = useState(false);
  const [photoIdx,    setPhotoIdx]    = useState(0);
  const [productImgs, setProductImgs] = useState<string[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const touchStartX = useRef(0);

  // Reservation section
  const reserveRef   = useRef<HTMLDivElement>(null);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [submitting,  setSubmitting]  = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [formError,   setFormError]   = useState("");
  const [rgpdErr,     setRgpdErr]     = useState(false);

  // ── Fetch colorways ──────────────────────────────────────────────────────────
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

  // ── Fetch product-level gallery images ───────────────────────────────────────
  useEffect(() => {
    (supabase.from("product_images" as any) as any)
      .select("image_url, position")
      .eq("product_id", productId)
      .order("position")
      .then(({ data }: { data: { image_url: string; position: number }[] | null }) => {
        setProductImgs((data || []).map(d => d.image_url));
      });
  }, [productId]);

  // ── Reset on colorway change ─────────────────────────────────────────────────
  useEffect(() => { setPhotoIdx(0); }, [selected?.id]);

  const hasColorways = colorways.length > 0;

  // ── Gallery: colorway-only when selected, product images otherwise ───────────
  const gallery = useMemo(() => {
    const imgs: string[] = [];
    if (hasColorways && selected) {
      if (selected.image_url) imgs.push(selected.image_url);
      for (const url of selected.gallery_images) {
        if (url && !imgs.includes(url)) imgs.push(url);
      }
    } else if (!hasColorways) {
      if (productImageUrl) imgs.push(productImageUrl);
      for (const url of productImgs) {
        if (url && !imgs.includes(url)) imgs.push(url);
      }
    }
    return imgs;
  }, [hasColorways, selected, productImageUrl, productImgs]);

  // ── Manual navigation ────────────────────────────────────────────────────────
  const prevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPhotoIdx(i => (i > 0 ? i - 1 : gallery.length - 1));
  };
  const nextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPhotoIdx(i => (i < gallery.length - 1 ? i + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd   = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { if (diff > 0) nextPhoto(); else prevPhoto(); }
  };

  // ── Lightbox navigation ──────────────────────────────────────────────────────
  const lbPrev = (e: React.MouseEvent) => { e.stopPropagation(); setLightboxIdx(i => (i! > 0 ? i! - 1 : gallery.length - 1)); };
  const lbNext = (e: React.MouseEvent) => { e.stopPropagation(); setLightboxIdx(i => (i! < gallery.length - 1 ? i! + 1 : 0)); };

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  setLightboxIdx(i => (i! > 0 ? i! - 1 : gallery.length - 1));
      if (e.key === "ArrowRight") setLightboxIdx(i => (i! < gallery.length - 1 ? i! + 1 : 0));
      if (e.key === "Escape")     setLightboxIdx(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, gallery.length]);

  // ── Stock & price ────────────────────────────────────────────────────────────
  const activeSizeStock = hasColorways ? selected?.stock_by_size || {} : parseSbs(productStockBySize);
  const hasSizeData     = Object.keys(activeSizeStock).length > 0;
  const totalStock      = hasSizeData
    ? Object.values(activeSizeStock).reduce((s, v) => s + (v || 0), 0)
    : productStockQuantity;

  const sizesForForm = hasSizeData
    ? SIZES_ORDER.filter(s => s in activeSizeStock)
    : [];

  const priceStr = typeof productPrice === "number"
    ? new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" }).format(productPrice)
    : null;

  // ── Open reservation section ─────────────────────────────────────────────────
  const openReserve = () => {
    setReserveOpen(true);
    setSuccess(false);
    setFormError("");
    setTimeout(() => reserveRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  // ── Submit reservation ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.rgpd) { setRgpdErr(true); return; }
    setRgpdErr(false);
    setSubmitting(true);
    setFormError("");

    const sizeNote = selectedSize ? `Taille : ${selectedSize}${form.message ? " — " + form.message : ""}` : form.message || null;

    const { error: dbErr } = await (supabaseClient.from("store_reservations" as any) as any).insert({
      product_id:   productId,
      product_name: productName,
      coloris:      selected?.name || null,
      first_name:   form.first_name,
      last_name:    form.last_name,
      email:        form.email,
      phone:        form.phone,
      message:      sizeNote,
      status:       "pending",
    });

    if (dbErr) {
      setSubmitting(false);
      setFormError("Une erreur est survenue. Veuillez réessayer.");
      return;
    }

    supabaseClient.functions.invoke("send-email", {
      body: {
        type: "new_reservation",
        reservation: {
          product_name: productName,
          coloris:      selected?.name || null,
          first_name:   form.first_name,
          last_name:    form.last_name,
          email:        form.email,
          phone:        form.phone,
          message:      sizeNote,
        },
      },
    }).catch(() => {});

    setSubmitting(false);
    setSuccess(true);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setSelectedSize("");
    setSuccess(false);
    setFormError("");
    setRgpdErr(false);
    setReserveOpen(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <article className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40">

        {/* ── Carousel ──────────────────────────────────────────────────────── */}
        <div
          className="relative aspect-[4/3] overflow-hidden"
          style={{ backgroundColor: "#1a1a1a" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Placeholder: no gallery yet (colorways loading or no images) */}
          {gallery.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3">
              {hasColorways && !loaded ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#c9973a] border-t-transparent" />
              ) : hasColorways && loaded && gallery.length === 0 ? (
                <>
                  <Package className="h-8 w-8 text-white/20" />
                  <p className="text-[11px] uppercase tracking-widest text-white/25">
                    Sélectionnez un coloris
                  </p>
                </>
              ) : (
                <Package className="h-10 w-10 text-white/20" />
              )}
            </div>
          )}

          {/* Slide strip */}
          {gallery.length > 0 && (
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
                    className="h-full w-full"
                    style={{ objectFit: "contain" }}
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Nav arrows */}
          {gallery.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-1.5 text-white backdrop-blur-sm transition-all hover:bg-black hover:scale-110"
                aria-label="Photo précédente"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-1.5 text-white backdrop-blur-sm transition-all hover:bg-black hover:scale-110"
                aria-label="Photo suivante"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              {/* Dots */}
              <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5">
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    onClick={e => { e.stopPropagation(); setPhotoIdx(i); }}
                    className={`block rounded-full transition-all duration-300 ${
                      i === photoIdx ? "w-5 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
                    }`}
                    aria-label={`Photo ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Zoom hint */}
          {gallery.length > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIdx(photoIdx); }}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white/60 backdrop-blur-sm transition-all hover:bg-black hover:text-white"
              aria-label="Voir en plein écran"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Stock badge */}
          <div className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
            totalStock > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}>
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
                      <img
                        src={thumb}
                        alt={cw.name}
                        className="w-12 h-12"
                        style={{ objectFit: "contain", backgroundColor: "#1a1a1a" }}
                      />
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
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 mb-4">
              {SIZES_ORDER.filter(s => s in activeSizeStock).map(size => {
                const qty = activeSizeStock[size] || 0;
                return (
                  <span key={size} className={`text-xs font-medium tracking-wide ${qty > 0 ? "text-primary" : "text-muted-foreground/50"}`}>
                    {size}:&nbsp;{qty}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mb-4">Stock total : {totalStock} PCS</p>
          )}

          {/* CTA */}
          <button
            onClick={openReserve}
            className="mt-1 flex w-full items-center justify-center gap-2 border border-primary/60 bg-primary/8 py-2.5 font-display text-xs uppercase tracking-[0.22em] text-primary transition-all duration-200 hover:bg-primary/15 hover:border-primary"
          >
            Voir &amp; réserver
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </article>

      {/* ── Inline reservation section ──────────────────────────────────────── */}
      {reserveOpen && (
        <div
          ref={reserveRef}
          className="border border-[#c9973a]/25 bg-[#111] scroll-mt-20"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#c9973a]/15 px-5 py-4">
            <div className="flex items-center gap-3">
              {/* Thumbnail */}
              {gallery.length > 0 && (
                <img
                  src={gallery[0]}
                  alt={productName}
                  className="h-12 w-12 shrink-0 rounded"
                  style={{ objectFit: "contain", backgroundColor: "#1a1a1a" }}
                />
              )}
              <div>
                <p className="font-display text-[10px] uppercase tracking-[0.28em] text-[#c9973a]">RÉSERVATION EN MAGASIN</p>
                <p className="mt-0.5 font-display text-sm uppercase tracking-widest text-white">{productName}</p>
                {selected && <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">{selected.name}</p>}
              </div>
            </div>
            <button
              onClick={resetForm}
              className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center text-white/30 transition-colors hover:text-white"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-5 py-5">
            {success ? (
              /* Success state */
              <div className="py-4 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center bg-[#c9973a]">
                  <Check className="h-6 w-6 text-[#0e0e0e]" />
                </div>
                <p className="font-display text-base uppercase tracking-widest text-white">DEMANDE ENVOYÉE</p>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  Votre demande a été envoyée&nbsp;! Nous vous contacterons rapidement.
                </p>
                <button
                  onClick={resetForm}
                  className="mt-5 h-10 w-full bg-[#c9973a] font-display text-xs uppercase tracking-[0.2em] text-[#0e0e0e] transition-opacity hover:opacity-90"
                >
                  FERMER
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <p className="border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs uppercase tracking-widest text-red-400">
                    {formError}
                  </p>
                )}

                {/* Size selector */}
                {sizesForForm.length > 0 && (
                  <div>
                    <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">TAILLE</p>
                    <div className="flex flex-wrap gap-2">
                      {sizesForForm.map(size => {
                        const qty = activeSizeStock[size] || 0;
                        const isSelected = selectedSize === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(s => s === size ? "" : size)}
                            className={`border px-3 py-1.5 font-display text-xs uppercase tracking-widest transition-all duration-150 ${
                              isSelected
                                ? "border-[#c9973a] bg-[#c9973a] text-[#0e0e0e]"
                                : qty > 0
                                ? "border-white/20 text-white hover:border-[#c9973a]/60"
                                : "border-white/8 text-white/25"
                            }`}
                          >
                            {size}
                            {qty === 0 && <span className="ml-1 text-[9px] opacity-60">·</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Form fields */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {([
                    { label: "PRÉNOM",    field: "first_name", type: "text",  placeholder: "Jean" },
                    { label: "NOM",       field: "last_name",  type: "text",  placeholder: "Dupont" },
                    { label: "EMAIL",     field: "email",      type: "email", placeholder: "jean@email.com" },
                    { label: "TÉLÉPHONE", field: "phone",      type: "tel",   placeholder: "+32 470 000 000" },
                  ] as const).map(({ label, field, type, placeholder }) => (
                    <div key={field} className="space-y-1">
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40">{label} *</label>
                      <Input
                        required
                        type={type}
                        value={form[field]}
                        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                        placeholder={placeholder}
                        className="h-9 rounded-none border-white/15 bg-white/5 text-white placeholder:text-white/20 focus:border-[#c9973a] focus-visible:ring-0"
                      />
                    </div>
                  ))}
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40">MESSAGE (OPTIONNEL)</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Questions, précisions..."
                    rows={2}
                    className="w-full resize-none rounded-none border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-[#c9973a] focus:outline-none"
                  />
                </div>

                {/* RGPD */}
                <label className={`flex cursor-pointer items-start gap-3 ${rgpdErr ? "text-red-400" : "text-white/50"}`}>
                  <input
                    type="checkbox"
                    checked={form.rgpd}
                    onChange={e => { setForm(f => ({ ...f, rgpd: e.target.checked })); if (e.target.checked) setRgpdErr(false); }}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#c9973a]"
                  />
                  <span className="text-xs leading-relaxed">
                    J'accepte de recevoir les communications de Desmet Équipement et confirme avoir lu la{" "}
                    <Link to="/politique-confidentialite" target="_blank" className="underline hover:text-[#c9973a]">
                      politique de confidentialité
                    </Link>. *
                    {rgpdErr && <span className="ml-1 text-[10px] uppercase tracking-widest text-red-400">(REQUIS)</span>}
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-11 w-full bg-[#c9973a] font-display text-sm uppercase tracking-[0.2em] text-[#0e0e0e] transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "ENVOI EN COURS..." : "ENVOYER LA DEMANDE"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

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
            <button
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
              onClick={() => setLightboxIdx(null)}
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>

            {gallery.length > 1 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
                onClick={lbPrev}
                aria-label="Précédent"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <motion.img
              key={lightboxIdx}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              src={gallery[lightboxIdx]}
              alt={`${productName} — photo ${lightboxIdx + 1}`}
              className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain shadow-2xl"
              onClick={e => e.stopPropagation()}
            />

            {gallery.length > 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
                onClick={lbNext}
                aria-label="Suivant"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-xs font-medium text-white/70">
              {lightboxIdx + 1} / {gallery.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
