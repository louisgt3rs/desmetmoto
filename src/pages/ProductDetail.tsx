import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, X, Check, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import type { Tables } from "@/integrations/supabase/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import { colorNameToHex } from "@/lib/colorSwatch";
import { toast } from "sonner";

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
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { addItem } = useCart();

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
      setFormError(t("error_occurred"));
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
        <h1 className="font-display text-4xl uppercase tracking-widest text-white mb-4">{t("product_not_found")}</h1>
        <Link
          to={`/marques/${slug}`}
          className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-[#c9973a] hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="h-4 w-4" /> {t("product_back")}
        </Link>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <SEO
        title={`${product.name} — ${brandName} — Desmet Équipement`}
        description={`${product.name} de ${brandName} disponible chez Desmet Équipement à Wavre. Revendeur officiel certifié.`}
        image={product.image_url ?? undefined}
        canonicalPath={`/marques/${slug}/${productId}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "brand": { "@type": "Brand", "name": brandName },
          ...(product.image_url ? { "image": product.image_url } : {}),
          ...(typeof product.price === "number" && product.price > 0 ? {
            "offers": {
              "@type": "Offer",
              "priceCurrency": "EUR",
              "price": product.price,
              "availability": "https://schema.org/InStoreOnly",
              "seller": { "@type": "Organization", "name": "Desmet Équipement" }
            }
          } : {}),
          "seller": { "@type": "Organization", "name": "Desmet Équipement", "url": "https://www.desmetequipement.com" }
        }}
      />

      <div className="min-h-screen bg-[#0e0e0e]">
        <div className="container mx-auto px-4 py-8">

          {/* Breadcrumb */}
          <Link
            to={`/marques/${slug}`}
            className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/35 transition-colors hover:text-[#c9973a]"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("product_back")} {brandName || slug}
          </Link>

          {/* ── Gallery + Info ────────────────────────────────────────────── */}
          <div className="grid gap-8 md:grid-cols-2">

            {/* Left — Gallery */}
            <div>
              {/* Main image */}
              <div
                className="relative cursor-zoom-in flex items-center justify-center overflow-hidden"
                style={{
                  minHeight: "320px", maxHeight: "600px",
                  border: `1px solid ${isDark ? "rgba(201,151,58,0.18)" : "rgba(201,151,58,0.25)"}`,
                  background: isDark
                    ? "linear-gradient(160deg, #0e0e10 0%, #09090b 50%, #0f0d09 100%)"
                    : "linear-gradient(160deg, #f0efed 0%, #e8e6e1 50%, #ede9df 100%)",
                }}
                onClick={() => gallery.length > 0 && setLightboxIdx(activeImgIdx)}
              >
                {/* Motif icônes moto répétées */}
                <svg className="pointer-events-none absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 500" aria-hidden="true">
                  <defs>
                    {/* Casque intégral */}
                    <symbol id="ico-helmet" viewBox="0 0 40 40">
                      <path d="M20 4C11.2 4 4 11.2 4 20c0 5.5 2.7 10.4 6.8 13.4V30h18.4v3.4C33.3 30.4 36 25.5 36 20c0-8.8-7.2-16-16-16z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M4 22h4M36 22h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M8 27c2 1.5 5 2.5 8 2.5h8c3 0 6-1 8-2.5" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                      <rect x="10" y="16" width="20" height="7" rx="2" fill="none" stroke="currentColor" strokeWidth="1"/>
                    </symbol>
                    {/* Roue moto */}
                    <symbol id="ico-wheel" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="20" cy="20" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                      <line x1="20" y1="5" x2="20" y2="16" stroke="currentColor" strokeWidth="1"/>
                      <line x1="20" y1="24" x2="20" y2="35" stroke="currentColor" strokeWidth="1"/>
                      <line x1="5" y1="20" x2="16" y2="20" stroke="currentColor" strokeWidth="1"/>
                      <line x1="24" y1="20" x2="35" y2="20" stroke="currentColor" strokeWidth="1"/>
                      <line x1="9.4" y1="9.4" x2="17.2" y2="17.2" stroke="currentColor" strokeWidth="1"/>
                      <line x1="22.8" y1="22.8" x2="30.6" y2="30.6" stroke="currentColor" strokeWidth="1"/>
                      <line x1="30.6" y1="9.4" x2="22.8" y2="17.2" stroke="currentColor" strokeWidth="1"/>
                      <line x1="17.2" y1="22.8" x2="9.4" y2="30.6" stroke="currentColor" strokeWidth="1"/>
                    </symbol>
                    {/* Éclair / vitesse */}
                    <symbol id="ico-bolt" viewBox="0 0 40 40">
                      <path d="M22 4L10 22h10l-2 14L30 18H20L22 4z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    </symbol>
                    {/* Gant */}
                    <symbol id="ico-glove" viewBox="0 0 40 40">
                      <path d="M10 34V20l4-12h4l1 8 3-10h3l1 10 3-8h3l1 14v10H10z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      <line x1="10" y1="24" x2="29" y2="24" stroke="currentColor" strokeWidth="1"/>
                    </symbol>
                    <radialGradient id="pd-center-fade" cx="50%" cy="50%" r="55%">
                      <stop offset="0%" stopColor={isDark ? "rgba(14,14,16,0.95)" : "rgba(232,230,225,0.95)"} />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                  </defs>

                  {/* Grille de logos — disposition décalée */}
                  {[
                    { x: 60,  y: 60,  icon: "ico-helmet", rot: -15, scale: 1.1 },
                    { x: 200, y: 40,  icon: "ico-wheel",  rot: 0,   scale: 0.9 },
                    { x: 340, y: 70,  icon: "ico-bolt",   rot: 10,  scale: 1.0 },
                    { x: 480, y: 45,  icon: "ico-glove",  rot: -8,  scale: 1.0 },
                    { x: 620, y: 60,  icon: "ico-helmet", rot: 12,  scale: 0.9 },
                    { x: 740, y: 40,  icon: "ico-wheel",  rot: 0,   scale: 1.0 },
                    { x: 30,  y: 180, icon: "ico-bolt",   rot: -5,  scale: 0.85 },
                    { x: 150, y: 160, icon: "ico-glove",  rot: 15,  scale: 1.0 },
                    { x: 680, y: 170, icon: "ico-bolt",   rot: -10, scale: 1.0 },
                    { x: 760, y: 160, icon: "ico-helmet", rot: 8,   scale: 0.9 },
                    { x: 60,  y: 380, icon: "ico-wheel",  rot: 0,   scale: 1.0 },
                    { x: 190, y: 400, icon: "ico-bolt",   rot: 12,  scale: 0.85 },
                    { x: 330, y: 380, icon: "ico-glove",  rot: -8,  scale: 1.0 },
                    { x: 620, y: 390, icon: "ico-helmet", rot: -12, scale: 0.9 },
                    { x: 740, y: 370, icon: "ico-wheel",  rot: 5,   scale: 1.0 },
                    { x: 60,  y: 460, icon: "ico-bolt",   rot: 0,   scale: 0.9 },
                    { x: 480, y: 460, icon: "ico-wheel",  rot: 0,   scale: 0.85 },
                    { x: 740, y: 450, icon: "ico-glove",  rot: -5,  scale: 0.9 },
                  ].map(({ x, y, icon, rot, scale }, i) => (
                    <use
                      key={i}
                      href={`#${icon}`}
                      x={x - 20 * scale} y={y - 20 * scale}
                      width={40 * scale} height={40 * scale}
                      color={isDark ? "rgba(201,151,58,0.12)" : "rgba(160,115,25,0.14)"}
                      transform={`rotate(${rot}, ${x}, ${y})`}
                    />
                  ))}

                  {/* Vignettage central pour garder le produit visible */}
                  <rect width="800" height="500" fill="url(#pd-center-fade)" />
                </svg>

                {/* Halo doré central */}
                <div className="pointer-events-none absolute inset-0" style={{
                  background: isDark
                    ? "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(201,151,58,0.07), transparent 70%)"
                    : "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(201,151,58,0.1), transparent 70%)",
                }} />
                {gallery.length > 0 ? (
                  <img
                    src={gallery[activeImgIdx]}
                    alt={product.name}
                    className="relative z-10 w-full object-contain transition-opacity duration-200"
                    style={{ display: "block", maxHeight: "600px" }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="font-display text-sm uppercase tracking-widest text-white/20">{t("product_no_photo")}</p>
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
                {totalStock > 0 ? t("in_stock") : t("out_of_stock_full")}
              </span>

              {/* Colorway selector */}
              {hasColorways && (
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-white/40">{t("product_colorway")}</p>
                  <div className="flex flex-wrap gap-2">
                    {colorways.map((cw) => (
                      <button
                        key={cw.id}
                        onClick={() => { setSelectedColorway(cw); setSelectedSize(""); }}
                        className={`flex items-center gap-2 border px-4 py-2 font-display text-[11px] uppercase tracking-widest transition-all duration-150 ${
                          selectedColorway?.id === cw.id
                            ? "border-[#c9973a] bg-[#c9973a]/10 text-[#c9973a]"
                            : "border-white/20 text-white/60 hover:border-white/50"
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/20"
                          style={
                            cw.image_url
                              ? { backgroundImage: `url(${cw.image_url})`, backgroundSize: "cover", backgroundPosition: "center" }
                              : { background: colorNameToHex(cw.name) }
                          }
                        />
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
                    {t("product_size")}
                    {selectedSize ? ` — ${selectedSize} ${t("product_size_selected")}` : ""}
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

          {/* ── Add to cart ──────────────────────────────────────────────── */}
          {product && (
            <div className="mt-8">
              <button
                type="button"
                onClick={() => {
                  if (hasColorways && !selectedColorway) {
                    toast.error("Veuillez sélectionner un coloris");
                    return;
                  }
                  if (hasSizeData && !selectedSize) {
                    toast.error("Veuillez sélectionner une taille");
                    return;
                  }
                  addItem({
                    id: product.id + (selectedColorway ? `-${selectedColorway.id}` : "") + (selectedSize ? `-${selectedSize}` : ""),
                    type: "product",
                    name: product.name + (selectedColorway ? ` — ${selectedColorway.name}` : "") + (selectedSize ? ` — ${selectedSize}` : ""),
                    price: typeof product.price === "number" ? product.price : null,
                    imageUrl: gallery[0] ?? undefined,
                  });
                  toast.success("Ajouté au panier");
                }}
                className="inline-flex items-center gap-3 font-display text-sm uppercase tracking-[0.25em] px-6 py-3 transition-all"
                style={{ background: "#c9973a", color: "#050505" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#d4a44a"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#c9973a"; }}
              >
                <ShoppingBag className="w-4 h-4" /> Ajouter au panier
              </button>
            </div>
          )}

          {/* ── Reservation form ─────────────────────────────────────────── */}
          <div className="mt-10 border border-[#c9973a]/20 bg-[#111]">
            <div className="border-b border-[#c9973a]/15 px-6 py-4">
              <h2 className="font-display text-lg uppercase tracking-[0.14em] text-white">
                {t("reserve_title")}
              </h2>
              <p className="mt-0.5 text-xs text-white/40">
                {product.name}
                {selectedColorway ? ` — ${selectedColorway.name}` : ""}
                {selectedSize ? ` — ${t("product_size")} ${selectedSize}` : ""}
              </p>
            </div>

            <div className="px-6 py-6">
              {success ? (
                <div className="py-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center bg-[#c9973a]">
                    <Check className="h-6 w-6 text-[#0e0e0e]" />
                  </div>
                  <p className="font-display text-base uppercase tracking-widest text-white">{t("reserve_success_title")}</p>
                  <p className="mt-2 text-sm text-white/50">{t("reserve_success_text")}</p>
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
                      { labelKey: "field_firstname", field: "first_name", type: "text",  phKey: "ph_firstname" },
                      { labelKey: "field_lastname",  field: "last_name",  type: "text",  phKey: "ph_lastname" },
                      { labelKey: "field_email",     field: "email",      type: "email", phKey: "ph_email" },
                      { labelKey: "field_phone",     field: "phone",      type: "tel",   phKey: "ph_phone" },
                    ] as const).map(({ labelKey, field, type, phKey }) => (
                      <div key={field} className="space-y-1">
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40">
                          {t(labelKey)} *
                        </label>
                        <Input
                          required
                          type={type}
                          value={form[field]}
                          onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                          placeholder={t(phKey)}
                          className="h-10 rounded-none border-white/15 bg-white/5 text-white placeholder:text-white/20 focus:border-[#c9973a] focus-visible:ring-0"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40">
                      {t("field_message")}
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder={t("ph_message")}
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
                      {t("rgpd_text")}{" "}
                      <Link
                        to="/politique-confidentialite"
                        target="_blank"
                        className="underline hover:text-[#c9973a]"
                      >
                        {t("rgpd_link")}
                      </Link>. *
                      {rgpdErr && (
                        <span className="ml-1 text-[10px] uppercase tracking-widest text-red-400">
                          {t("required")}
                        </span>
                      )}
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-12 w-full bg-[#c9973a] font-display text-sm uppercase tracking-[0.2em] text-[#0e0e0e] transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {submitting ? t("sending") : t("send_request")}
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
              aria-label={t("product_close")}
            >
              <X className="h-5 w-5" />
            </button>

            {gallery.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i! > 0 ? i! - 1 : gallery.length - 1)); }}
                  aria-label={t("product_prev")}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i! < gallery.length - 1 ? i! + 1 : 0)); }}
                  aria-label={t("product_next")}
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
