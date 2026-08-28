import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Radio, Package, LayoutGrid, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

type Intercom = {
  id: string; brand: string; name: string; slug: string | null;
  description: string | null; image_url: string | null;
  is_coming_soon: boolean; prix: number | null; stock: number | null;
};
type Accessory = {
  id: string; name: string; brand: string; category: string; slug: string | null;
  image_url: string | null; gallery_images: string[]; prix: number | null; stock: number;
  description: string | null; is_coming_soon: boolean;
};

function AccessoryModal({ item, onClose }: { item: Accessory; onClose: () => void }) {
  const images = [item.image_url, ...(item.gallery_images || [])].filter(Boolean) as string[];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIdx(i => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setIdx(i => Math.min(images.length - 1, i + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(5,5,5,0.88)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          style={{ background: "var(--c-surface-card)", border: "1px solid rgba(201,151,58,0.25)" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center transition-colors"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#fff"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Image */}
          {images.length > 0 && (
            <div className="relative overflow-hidden" style={{ aspectRatio: "4/3", borderBottom: "1px solid rgba(201,151,58,0.12)" }}>
              <img src={images[idx]} alt={item.name} className="w-full h-full object-contain" style={{ background: "rgba(201,151,58,0.03)" }} />
              {images.length > 1 && (
                <>
                  <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center transition-opacity disabled:opacity-20" style={{ background: "rgba(5,5,5,0.7)", color: "#fff" }}>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIdx(i => Math.min(images.length - 1, i + 1))} disabled={idx === images.length - 1} className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center transition-opacity disabled:opacity-20" style={{ background: "rgba(5,5,5,0.7)", color: "#fff" }}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setIdx(i)} className="w-1.5 h-1.5 rounded-full transition-all" style={{ background: i === idx ? "#c9973a" : "rgba(255,255,255,0.3)" }} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Info */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-display text-[10px] uppercase tracking-[0.4em] mb-1" style={{ color: "rgba(201,151,58,0.6)" }}>{item.brand} — {item.category}</p>
                <h2 className="font-display text-2xl text-white leading-tight">{item.name}</h2>
              </div>
              <div className="text-right shrink-0">
                {item.prix != null && <p className="font-display text-xl" style={{ color: "#c9973a" }}>{item.prix.toLocaleString("fr-BE", { minimumFractionDigits: 2 })} €</p>}
                <p className="font-display text-[10px] uppercase tracking-[0.25em] mt-1" style={{ color: item.stock > 0 ? "rgba(201,151,58,0.8)" : "rgba(255,255,255,0.25)" }}>
                  {item.is_coming_soon ? "Bientôt disponible" : item.stock > 0 ? `En stock (${item.stock})` : "Sur commande"}
                </p>
              </div>
            </div>
            {item.description && (
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--c-text-50)" }}>{item.description}</p>
            )}
            <div className="mt-6 pt-4" style={{ borderTop: "1px solid rgba(201,151,58,0.1)" }}>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>Disponible en boutique à Wavre — Desmet Équipement</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

type Section = "tout" | "intercoms" | "accessoires";

const SECTION_LABELS: Record<Section, string> = {
  tout: "Tout",
  intercoms: "Intercoms",
  accessoires: "Accessoires",
};

export default function IntercomsPage() {
  const [intercoms, setIntercoms] = useState<Intercom[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);

  const [section, setSection] = useState<Section>("tout");
  const [brandFilter, setBrandFilter] = useState<string>("tout");
  const [stockOnly, setStockOnly] = useState(false);
  const [selectedAcc, setSelectedAcc] = useState<Accessory | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("installation_intercoms").select("id, brand, name, slug, description, image_url, is_coming_soon, prix, stock").order("brand").order("sort_order"),
      supabase.from("installation_accessories").select("id, name, brand, category, slug, image_url, gallery_images, prix, stock, description, is_coming_soon").order("brand").order("sort_order"),
    ]).then(([{ data: ic }, { data: ac }]) => {
      if (ic) setIntercoms(ic as Intercom[]);
      if (ac) setAccessories(ac.map(a => ({ ...a, gallery_images: Array.isArray(a.gallery_images) ? a.gallery_images as string[] : [] })) as Accessory[]);
      setLoading(false);
    });
  }, []);

  // All brands depending on selected section
  const allBrands = useMemo(() => {
    const src: string[] = [];
    if (section !== "accessoires") src.push(...intercoms.map(i => i.brand));
    if (section !== "intercoms") src.push(...accessories.map(a => a.brand));
    return [...new Set(src)].sort();
  }, [section, intercoms, accessories]);

  // Reset brand filter when section changes
  const handleSection = (s: Section) => { setSection(s); setBrandFilter("tout"); };

  // Filtered data
  const filteredIntercoms = useMemo(() => {
    if (section === "accessoires") return [];
    let r = intercoms;
    if (brandFilter !== "tout") r = r.filter(i => i.brand === brandFilter);
    if (stockOnly) r = r.filter(i => (i.stock ?? 0) > 0 && !i.is_coming_soon);
    return r;
  }, [intercoms, section, brandFilter, stockOnly]);

  const filteredAccessories = useMemo(() => {
    if (section === "intercoms") return [];
    let r = accessories;
    if (brandFilter !== "tout") r = r.filter(a => a.brand === brandFilter);
    if (stockOnly) r = r.filter(a => a.stock > 0 && !a.is_coming_soon);
    return r;
  }, [accessories, section, brandFilter, stockOnly]);

  const intercomBrands = [...new Set(filteredIntercoms.map(i => i.brand))];
  const accBrands = [...new Set(filteredAccessories.map(a => a.brand))];

  return (
    <Layout>
      <SEO
        title="Intercoms & Accessoires Moto — Disponibles en boutique à Wavre | Desmet Équipement"
        description="Intercoms Sena, Cardo et accessoires moto disponibles en boutique à Wavre. Installation professionnelle sur casque acheté chez nous."
        canonicalPath="/intercoms"
      />

      {/* ── Hero ── */}
      <section style={{ background: "var(--c-surface-hero)" }} className="relative py-24 overflow-hidden">
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]" style={{ mixBlendMode: "overlay" }} aria-hidden="true">
          <filter id="grain-ic"><feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
          <rect width="100%" height="100%" filter="url(#grain-ic)"/>
        </svg>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,151,58,0.1), transparent)" }} />

        <div className="relative container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12" style={{ background: "linear-gradient(to right, transparent, rgba(201,151,58,0.5))" }} />
            <Radio className="w-4 h-4" style={{ color: "#c9973a" }} />
            <div className="h-px w-12" style={{ background: "linear-gradient(to left, transparent, rgba(201,151,58,0.5))" }} />
          </div>
          <p className="font-display text-[10px] uppercase tracking-[0.55em] mb-4" style={{ color: "rgba(201,151,58,0.7)" }}>Disponibles en boutique — Wavre</p>
          <h1 className="font-display text-white mb-4" style={{ fontSize: "clamp(2.4rem, 9vw, 6rem)", lineHeight: 1 }}>
            INTERCOMS &<br />
            <span style={{ color: "#c9973a" }}>ACCESSOIRES</span>
          </h1>
          <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: "var(--c-text-45)" }}>
            Sena, Cardo, Quad Lock et plus encore. Installation professionnelle sur votre casque acheté chez nous.
          </p>
        </div>
      </section>

      {/* ── Filters ── */}
      <div className="sticky top-0 z-20 border-b" style={{ background: "var(--c-surface-hero)", borderColor: "rgba(201,151,58,0.12)" }}>
        <div className="container mx-auto px-4">

          {/* Section tabs */}
          <div className="flex items-center gap-0 border-b" style={{ borderColor: "rgba(201,151,58,0.08)" }}>
            {(["tout", "intercoms", "accessoires"] as Section[]).map(s => (
              <button
                key={s}
                onClick={() => handleSection(s)}
                className="flex items-center gap-2 px-5 py-4 font-display text-[11px] uppercase tracking-[0.3em] transition-all border-b-2"
                style={{
                  borderColor: section === s ? "#c9973a" : "transparent",
                  color: section === s ? "#c9973a" : "rgba(255,255,255,0.35)",
                  background: "transparent",
                }}
              >
                {s === "intercoms" && <Radio className="w-3 h-3" />}
                {s === "accessoires" && <Package className="w-3 h-3" />}
                {s === "tout" && <LayoutGrid className="w-3 h-3" />}
                {SECTION_LABELS[s]}
              </button>
            ))}

            {/* Stock toggle */}
            <div className="ml-auto flex items-center gap-2 pr-1">
              <button
                onClick={() => setStockOnly(v => !v)}
                className="flex items-center gap-2 px-4 py-3 font-display text-[10px] uppercase tracking-[0.25em] transition-all"
                style={{ color: stockOnly ? "#c9973a" : "rgba(255,255,255,0.3)" }}
              >
                <SlidersHorizontal className="w-3 h-3" />
                En stock
              </button>
            </div>
          </div>

          {/* Brand filters */}
          {allBrands.length > 1 && (
            <div className="flex items-center gap-2 py-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              <button
                onClick={() => setBrandFilter("tout")}
                className="shrink-0 px-4 py-1.5 font-display text-[10px] uppercase tracking-[0.25em] transition-all"
                style={{
                  background: brandFilter === "tout" ? "rgba(201,151,58,0.15)" : "transparent",
                  border: `1px solid ${brandFilter === "tout" ? "rgba(201,151,58,0.5)" : "rgba(201,151,58,0.15)"}`,
                  color: brandFilter === "tout" ? "#c9973a" : "rgba(255,255,255,0.35)",
                }}
              >
                Toutes
              </button>
              {allBrands.map(b => (
                <button
                  key={b}
                  onClick={() => setBrandFilter(b)}
                  className="shrink-0 px-4 py-1.5 font-display text-[10px] uppercase tracking-[0.25em] transition-all"
                  style={{
                    background: brandFilter === b ? "rgba(201,151,58,0.15)" : "transparent",
                    border: `1px solid ${brandFilter === b ? "rgba(201,151,58,0.5)" : "rgba(201,151,58,0.15)"}`,
                    color: brandFilter === b ? "#c9973a" : "rgba(255,255,255,0.35)",
                  }}
                >
                  {b}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <section className="py-16" style={{ background: "var(--c-surface-page)" }}>
        <div className="container mx-auto px-4 space-y-20">

          {loading && (
            <div className="text-center py-24">
              <p className="font-display text-[11px] uppercase tracking-[0.35em]" style={{ color: "rgba(255,255,255,0.25)" }}>Chargement…</p>
            </div>
          )}

          {/* ── INTERCOMS ── */}
          <AnimatePresence>
            {!loading && filteredIntercoms.length > 0 && (
              <motion.div key="intercoms-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {section === "tout" && (
                  <div className="flex items-center gap-3 mb-10">
                    <Radio className="w-4 h-4" style={{ color: "#c9973a" }} />
                    <h2 className="font-display text-xl uppercase tracking-[0.3em] text-white">Intercoms</h2>
                    <div className="flex-1 h-px ml-2" style={{ background: "rgba(201,151,58,0.15)" }} />
                  </div>
                )}

                <div className="space-y-14">
                  {intercomBrands.map((brand, bi) => {
                    const items = filteredIntercoms.filter(i => i.brand === brand);
                    return (
                      <motion.div key={brand} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: bi * 0.08 }}>
                        <div className="flex items-end justify-between mb-7 pb-4" style={{ borderBottom: "1px solid rgba(201,151,58,0.12)" }}>
                          <div>
                            <p className="font-display text-[10px] uppercase tracking-[0.5em] mb-1" style={{ color: "rgba(201,151,58,0.5)" }}>Marque</p>
                            <h3 className="font-display text-3xl text-white leading-none">{brand}</h3>
                          </div>
                          <span className="font-display text-[10px] uppercase tracking-[0.25em]" style={{ color: "rgba(255,255,255,0.2)" }}>{items.length} modèle{items.length > 1 ? "s" : ""}</span>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {items.map((item, ii) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                              transition={{ duration: 0.4, delay: ii * 0.06 }}
                              className="group relative flex flex-col"
                              style={{ background: "var(--c-surface-card)", border: "1px solid rgba(201,151,58,0.14)", opacity: item.is_coming_soon ? 0.6 : 1 }}
                            >
                              {item.image_url && (
                                <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(201,151,58,0.1)", background: "rgba(201,151,58,0.03)" }}>
                                  <img src={item.image_url} alt={item.name} className="w-full object-contain transition-transform duration-700 group-hover:scale-105" style={{ display: "block" }} />
                                  {item.stock != null && item.stock > 0 && !item.is_coming_soon && (
                                    <div className="absolute top-2 right-2 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.2em]" style={{ background: "rgba(201,151,58,0.9)", color: "#050505" }}>En stock</div>
                                  )}
                                </div>
                              )}
                              <div className="p-5 flex-1">
                                {item.is_coming_soon && <p className="font-display text-[9px] uppercase tracking-[0.4em] mb-3" style={{ color: "#c9973a" }}>Bientôt disponible</p>}
                                <p className="font-display text-2xl text-white mb-2 group-hover:text-[#c9973a] transition-colors duration-300">{item.name}</p>
                                {item.prix != null && <p className="font-display text-sm mb-2" style={{ color: "#c9973a" }}>{item.prix.toLocaleString("fr-BE", { minimumFractionDigits: 2 })} €</p>}
                                <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--c-text-45)" }}>{item.description || ""}</p>
                              </div>
                              <div className="px-5 pb-5">
                                {item.slug ? (
                                  <Link to={`/intercoms/${item.slug}`} className="inline-flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.25em] transition-colors duration-200" style={{ color: "#c9973a" }}>
                                    Voir le détail <ArrowRight className="w-3 h-3" />
                                  </Link>
                                ) : (
                                  <span className="font-display text-[11px] uppercase tracking-[0.25em]" style={{ color: "rgba(255,255,255,0.2)" }}>
                                    {item.is_coming_soon ? "À venir" : "En boutique"}
                                  </span>
                                )}
                              </div>
                              {!item.is_coming_soon && <div className="pointer-events-none absolute inset-0 border border-[#c9973a]/0 group-hover:border-[#c9973a]/30 transition-colors duration-300" />}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider between sections */}
          {!loading && section === "tout" && filteredIntercoms.length > 0 && filteredAccessories.length > 0 && (
            <div className="h-px" style={{ background: "rgba(201,151,58,0.1)" }} />
          )}

          {/* ── ACCESSOIRES ── */}
          <AnimatePresence>
            {!loading && filteredAccessories.length > 0 && (
              <motion.div key="accessories-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {section === "tout" && (
                  <div className="flex items-center gap-3 mb-10">
                    <Package className="w-4 h-4" style={{ color: "#c9973a" }} />
                    <h2 className="font-display text-xl uppercase tracking-[0.3em] text-white">Accessoires</h2>
                    <div className="flex-1 h-px ml-2" style={{ background: "rgba(201,151,58,0.15)" }} />
                  </div>
                )}

                <div className="space-y-14">
                  {accBrands.map((brand, bi) => {
                    const items = filteredAccessories.filter(a => a.brand === brand);
                    const categories = [...new Set(items.map(a => a.category || "Autre"))];
                    return (
                      <motion.div key={brand} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: bi * 0.08 }}>
                        <div className="flex items-end justify-between mb-7 pb-4" style={{ borderBottom: "1px solid rgba(201,151,58,0.12)" }}>
                          <div>
                            <p className="font-display text-[10px] uppercase tracking-[0.5em] mb-1" style={{ color: "rgba(201,151,58,0.5)" }}>Marque</p>
                            <h3 className="font-display text-3xl text-white leading-none">{brand}</h3>
                          </div>
                          <span className="font-display text-[10px] uppercase tracking-[0.25em]" style={{ color: "rgba(255,255,255,0.2)" }}>{items.length} produit{items.length > 1 ? "s" : ""}</span>
                        </div>

                        {categories.map(cat => {
                          const catItems = items.filter(a => (a.category || "Autre") === cat);
                          return (
                            <div key={cat} className="mb-8">
                              {categories.length > 1 && (
                                <p className="font-display text-[10px] uppercase tracking-[0.4em] mb-4" style={{ color: "rgba(201,151,58,0.45)" }}>{cat}</p>
                              )}
                              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {catItems.map((item, ii) => (
                                  <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: ii * 0.06 }}
                                  >
                                  <Link
                                    to={item.slug ? `/intercoms/accessoires/${item.slug}` : "#"}
                                    onClick={e => { if (!item.slug) { e.preventDefault(); setSelectedAcc(item); } }}
                                    className="group relative flex flex-col"
                                    style={{ background: "var(--c-surface-card)", border: "1px solid rgba(201,151,58,0.14)", opacity: item.is_coming_soon ? 0.6 : 1, display: "flex" }}
                                  >
                                    {item.image_url ? (
                                      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(201,151,58,0.1)", background: "rgba(201,151,58,0.03)" }}>
                                        <img src={item.image_url} alt={item.name} className="w-full object-contain transition-transform duration-700 group-hover:scale-105" style={{ display: "block" }} />
                                        {item.stock > 0 && !item.is_coming_soon && (
                                          <div className="absolute top-2 right-2 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.2em]" style={{ background: "rgba(201,151,58,0.9)", color: "#050505" }}>En stock</div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="aspect-square flex items-center justify-center" style={{ borderBottom: "1px solid rgba(201,151,58,0.1)", background: "rgba(201,151,58,0.03)" }}>
                                        <Package className="w-8 h-8" style={{ color: "rgba(201,151,58,0.2)" }} />
                                      </div>
                                    )}
                                    <div className="p-4 flex-1">
                                      {item.is_coming_soon && <p className="font-display text-[9px] uppercase tracking-[0.4em] mb-2" style={{ color: "#c9973a" }}>Bientôt</p>}
                                      <p className="font-display text-base text-white mb-1 group-hover:text-[#c9973a] transition-colors duration-300 leading-tight">{item.name}</p>
                                      {item.prix != null && <p className="font-display text-sm mt-1" style={{ color: "#c9973a" }}>{item.prix.toLocaleString("fr-BE", { minimumFractionDigits: 2 })} €</p>}
                                      {item.description && <p className="text-xs leading-relaxed mt-2 line-clamp-2" style={{ color: "var(--c-text-45)" }}>{item.description}</p>}
                                    </div>
                                    {!item.is_coming_soon && <div className="pointer-events-none absolute inset-0 border border-[#c9973a]/0 group-hover:border-[#c9973a]/30 transition-colors duration-300" />}
                                  </Link>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!loading && filteredIntercoms.length === 0 && filteredAccessories.length === 0 && (
            <div className="text-center py-24">
              <p className="font-display text-[11px] uppercase tracking-[0.35em]" style={{ color: "rgba(255,255,255,0.2)" }}>Aucun produit pour ces filtres</p>
            </div>
          )}
        </div>
      </section>
      {selectedAcc && <AccessoryModal item={selectedAcc} onClose={() => setSelectedAcc(null)} />}
    </Layout>
  );
}
