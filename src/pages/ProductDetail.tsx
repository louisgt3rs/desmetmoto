import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import type { Tables } from "@/integrations/supabase/types";

type ProductRow = Tables<"products">;

interface Colorway {
  id: string;
  name: string;
  image_url: string | null;
  gallery_images: string[];
  stock_by_size: Record<string, number>;
}

const SIZES_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
const EMPTY_FORM = { first_name: "", last_name: "", email: "", phone: "", message: "", rgpd: false };

function parseSbs(v: unknown): Record<string, number> {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, number>;
  return {};
}

export default function ProductDetail() {
  const { slug, productId } = useParams<{ slug: string; productId: string }>();

  const [product,       setProduct]       = useState<ProductRow | null>(null);
  const [colorways,     setColorways]     = useState<Colorway[]>([]);
  const [productImgs,   setProductImgs]   = useState<string[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [brandName,     setBrandName]     = useState("");

  // Gallery
  const [selectedColorway, setSelectedColorway] = useState<Colorway | null>(null);
  const [activeImgIdx,     setActiveImgIdx]     = useState(0);
  const [lightboxIdx,      setLightboxIdx]      = useState<number | null>(null);

  // Form
  const [selectedSize, setSelectedSize] = useState("");
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [submitting,   setSubmitting]   = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [formError,    setFormError]    = useState("");
  const [rgpdErr,      setRgpdErr]      = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!productId || !slug) return;
    const load = async () => {
      setLoading(true);

      const { data: prod } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (!prod) { setLoading(false); return; }
      setProduct(prod);

      if (prod.brand_id) {
        const { data: brand } = await supabase
          .from("brands")
          .select("name")
          .eq("id", prod.brand_id)
          .single();
        if (brand) setBrandName(brand.name);
      }

      const { data: cws } = await supabase
        .from("product_colorways")
        .select("*")
        .eq("product_id", productId)
        .order("sort_order");

      const parsed: Colorway[] = (cws || []).map((d) => ({
        id: d.id,
        name: d.name,
        image_url: d.image_url,
        gallery_images: Array.isArray(d.gallery_images) ? (d.gallery_images as string[]) : [],
        stock_by_size: parseSbs(d.stock_by_size),
      }));
      setColorways(parsed);
      if (parsed.length > 0) setSelectedColorway(parsed[0]);

      const { data: imgData } = await (supabase.from("product_images" as any) as any)
        .select("image_url, position")
        .eq("product_id", productId)
        .order("position");
      setProductImgs((imgData || []).map((d: any) => d.image_url));

      setLoading(false);
    };
    load();
  }, [productId, slug]);

  // Reset on colorway change
  useEffect(() => { setActiveImgIdx(0); }, [selectedColorway?.id]);

  const hasColorways = colorways.length > 0;

  // ── Gallery ──────────────────────────────────────────────────────────────────
  const gallery = useMemo(() => {
    const imgs: string[] = [];
    if (hasColorways && selectedColorway) {
      if (selectedColorway.image_url) imgs.push(selectedColorway.image_url);
      for (const url of selectedColorway.gallery_images) {
        if (url && !imgs.includes(url)) imgs.push(url);
      }
    } else {
      if (product?.image_url) imgs.push(product.image_url);
      for (const url of productImgs) {
        if (url && !imgs.includes(url)) imgs.push(url);
      }
    }
    return imgs;
  }, [hasColorways, selectedColorway, product?.image_url, productImgs]);

  // ── Stock ────────────────────────────────────────────────────────────────────
  const activeSizeStock = hasColorways
    ? selectedColorway?.stock_by_size || {}
    : parseSbs(product?.stock_by_size);
  const hasSizeData  = Object.keys(activeSizeStock).length > 0;
  const totalStock   = hasSizeData
    ? Object.values(activeSizeStock).reduce((s, v) => s + (v || 0), 0)
    : (product?.stock_quantity ?? 0);
  const sizesForSelector = hasSizeData ? SIZES_ORDER.filter((s) => s in activeSizeStock) : [];
  const priceStr = typeof product?.price === "number"
    ? new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" }).format(product.price)
    : null;

  // ── Lightbox keyboard ────────────────────────────────────────────────────────
  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  setLightboxIdx((i) => (i! > 0 ? i! - 1 : gallery.length - 1));
      if (e.key === "ArrowRight") setLightboxIdx((i) => (i! < gallery.length - 1 ? i! + 1 : 0));
      if (e.key === "Escape")     setLightboxIdx(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, gallery.length]);

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.rgpd) { setRgpdErr(true); return; }
    setRgpdErr(false);
    setSubmitting(true);
    setFormError("");

    const sizeNote = selectedSize
      ? `Taille : ${selectedSize}${form.message ? " — " + form.message : ""}`
      : form.message || null;

    const { error: dbErr } = await (supabase.from("store_reservations" as any) as any).insert({
      product_id:   productId,
      product_name: product?.name,
      coloris:      selectedColorway?.name || null,
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

    supabase.functions.invoke("send-email", {
      body: {
        type: "new_reservation",
        reservation: {
          product_name: product?.name,
          coloris:      selectedColorway?.name || null,
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

  // ── States ───────────────────────────────────────────────────────────────────
  if (loading) return (
    <Layout>
      <div className="flex min-h-screen items-center justify-center bg-[#0e0e0e]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c9973a] border-t-transparent" />
      </div>
    </Layout>
  );

  if (!product) return (
    <Layout>
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0e0e0e] px-4 text-center">
        <h1 className="font-display text-4xl uppercase tracking-widest text-white mb-4">PRODUIT INTROUVABLE</h1>
        <Link
          to={`/marques/${slug}`}
          className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-[#c9973a] hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <SEO title={`${product.name} — ${brandName} — Desmet Équipement`} />

      <div className="min-h-screen bg-[#0e0e0e]">
        <div className="container mx-auto px-4 py-8">

          {/* Breadcrumb */}
          <Link
            to={`/marques/${slug}`}
            className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/35 transition-colors hover:text-[#c9973a]"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à {brandName || slug}
          </Link>

          {/* ── Gallery + Info ────────────────────────────────────────────── */}
          <div className="grid gap-8 md:grid-cols-2">

            {/* Left — Gallery */}
            <div>
              {/* Main image */}
              <div
                className="relative overflow-hidden bg-[#111] cursor-zoom-in"
                style={{ height: "480px" }}
                onClick={() => gallery.length > 0 && setLightboxIdx(activeImgIdx)}
              >
                {gallery.length > 0 ? (
                  <img
                    src={gallery[activeImgIdx]}
                    alt={product.name}
                    className="h-full w-full object-cover transition-opacity duration-200"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="font-display text-sm uppercase tracking-widest text-white/20">Aucune photo</p>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {gallery.length > 1 && (
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                  {gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImgIdx(i)}
                      className={`shrink-0 overflow-hidden border-2 transition-all duration-200 ${
                        i === activeImgIdx
                          ? "border-[#c9973a]"
                          : "border-transparent opacity-40 hover:opacity-80"
                      }`}
                      style={{ width: 72, height: 72 }}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right — Info */}
            <div className="flex flex-col gap-5">
              <div>
                <h1 className="font-display text-4xl uppercase leading-tight tracking-[0.04em] text-white md:text-5xl">
                  {product.name}
                </h1>
                {priceStr && (
                  <p className="mt-2 font-display text-2xl text-[#c9973a]">{priceStr}</p>
                )}
              </div>

              {/* Stock badge */}
              <span className={`inline-flex w-fit px-3 py-1 font-display text-[11px] uppercase tracking-[0.2em] ${
                totalStock > 0
                  ? "bg-[#c9973a] text-[#0e0e0e]"
                  : "border border-white/20 text-white/40"
              }`}>
                {totalStock > 0 ? "EN STOCK" : "RUPTURE DE STOCK"}
              </span>

              {/* Colorway selector */}
              {hasColorways && (
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-white/40">COLORIS</p>
                  <div className="flex flex-wrap gap-2">
                    {colorways.map((cw) => (
                      <button
                        key={cw.id}
                        onClick={() => { setSelectedColorway(cw); setSelectedSize(""); }}
                        className={`border px-4 py-2 font-display text-[11px] uppercase tracking-widest transition-all duration-150 ${
                          selectedColorway?.id === cw.id
                            ? "border-[#c9973a] bg-[#c9973a]/10 text-[#c9973a]"
                            : "border-white/20 text-white/60 hover:border-white/50"
                        }`}
                      >
                        {cw.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector */}
              {hasSizeData && (
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-white/40">
                    TAILLE
                    {selectedSize ? ` — ${selectedSize} sélectionné` : ""}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sizesForSelector.map((size) => {
                      const qty = activeSizeStock[size] || 0;
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          disabled={qty === 0}
                          onClick={() => setSelectedSize((s) => (s === size ? "" : size))}
                          className={`border px-3 py-2 font-display text-xs uppercase tracking-widest transition-all duration-150 ${
                            isSelected
                              ? "border-[#c9973a] bg-[#c9973a] text-[#0e0e0e]"
                              : qty > 0
                              ? "border-white/20 text-white hover:border-[#c9973a]/60"
                              : "cursor-not-allowed border-white/8 text-white/20 line-through"
                          }`}
                        >
                          {size}
                          {qty > 0 && (
                            <span className="ml-1 text-[9px] opacity-50">({qty})</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {product.description && (
                <p className="text-sm leading-relaxed text-white/50">{product.description}</p>
              )}
            </div>
          </div>

          {/* ── Reservation form ─────────────────────────────────────────── */}
          <div className="mt-10 border border-[#c9973a]/20 bg-[#111]">
            <div className="border-b border-[#c9973a]/15 px-6 py-4">
              <h2 className="font-display text-lg uppercase tracking-[0.14em] text-white">
                RÉSERVER CE PRODUIT EN MAGASIN
              </h2>
              <p className="mt-0.5 text-xs text-white/40">
                {product.name}
                {selectedColorway ? ` — ${selectedColorway.name}` : ""}
                {selectedSize ? ` — Taille ${selectedSize}` : ""}
              </p>
            </div>

            <div className="px-6 py-6">
              {success ? (
                <div className="py-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center bg-[#c9973a]">
                    <Check className="h-6 w-6 text-[#0e0e0e]" />
                  </div>
                  <p className="font-display text-base uppercase tracking-widest text-white">DEMANDE ENVOYÉE</p>
                  <p className="mt-2 text-sm text-white/50">
                    Votre demande a été envoyée&nbsp;! Nous vous contacterons rapidement.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {formError && (
                    <p className="border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs uppercase tracking-widest text-red-400">
                      {formError}
                    </p>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    {([
                      { label: "PRÉNOM",    field: "first_name", type: "text",  placeholder: "Jean" },
                      { label: "NOM",       field: "last_name",  type: "text",  placeholder: "Dupont" },
                      { label: "EMAIL",     field: "email",      type: "email", placeholder: "jean@email.com" },
                      { label: "TÉLÉPHONE", field: "phone",      type: "tel",   placeholder: "+32 470 000 000" },
                    ] as const).map(({ label, field, type, placeholder }) => (
                      <div key={field} className="space-y-1">
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40">
                          {label} *
                        </label>
                        <Input
                          required
                          type={type}
                          value={form[field]}
                          onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                          placeholder={placeholder}
                          className="h-10 rounded-none border-white/15 bg-white/5 text-white placeholder:text-white/20 focus:border-[#c9973a] focus-visible:ring-0"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40">
                      MESSAGE (OPTIONNEL)
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Questions, précisions..."
                      rows={3}
                      className="w-full resize-none rounded-none border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-[#c9973a] focus:outline-none"
                    />
                  </div>

                  <label className={`flex cursor-pointer items-start gap-3 ${rgpdErr ? "text-red-400" : "text-white/50"}`}>
                    <input
                      type="checkbox"
                      checked={form.rgpd}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, rgpd: e.target.checked }));
                        if (e.target.checked) setRgpdErr(false);
                      }}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#c9973a]"
                    />
                    <span className="text-xs leading-relaxed">
                      J'accepte les communications de Desmet Équipement et confirme avoir lu la{" "}
                      <Link
                        to="/politique-confidentialite"
                        target="_blank"
                        className="underline hover:text-[#c9973a]"
                      >
                        politique de confidentialité
                      </Link>. *
                      {rgpdErr && (
                        <span className="ml-1 text-[10px] uppercase tracking-widest text-red-400">
                          (REQUIS)
                        </span>
                      )}
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-12 w-full bg-[#c9973a] font-display text-sm uppercase tracking-[0.2em] text-[#0e0e0e] transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {submitting ? "ENVOI EN COURS..." : "ENVOYER LA DEMANDE"}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
            onClick={() => setLightboxIdx(null)}
          >
            <button
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
              onClick={() => setLightboxIdx(null)}
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>

            {gallery.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i! > 0 ? i! - 1 : gallery.length - 1)); }}
                  aria-label="Précédent"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i! < gallery.length - 1 ? i! + 1 : 0)); }}
                  aria-label="Suivant"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <motion.img
              key={lightboxIdx}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              src={gallery[lightboxIdx]}
              alt={`${product.name} — photo ${lightboxIdx + 1}`}
              className="object-contain"
              style={{ maxWidth: "100vw", maxHeight: "100vh" }}
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-xs text-white/70">
              {lightboxIdx + 1} / {gallery.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
