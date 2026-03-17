import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import ReservationModal from "@/components/ReservationModal";
import { supabase } from "@/integrations/supabase/client";
import ImageGallery from "@/components/ImageGallery";
import helmetHeroImg from "@/assets/helmet-hero.jpg";
import araiStoreWall from "@/assets/arai-store-wall.jpg";
import heroHelmet from "@/assets/helmets/rx7v-evo-diamond-black-front.jpeg";
import araiBadge from "@/assets/brands/arai.png";

/* ───── Gold Particles ───── */
function GoldParticles() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1.5,
    duration: Math.random() * 6 + 4,
    delay: Math.random() * 4,
    opacity: Math.random() * 0.5 + 0.2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(212,175,55,${p.opacity}), rgba(212,175,55,0))`,
            boxShadow: `0 0 ${p.size * 2}px rgba(212,175,55,${p.opacity * 0.6})`,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [p.opacity * 0.4, p.opacity, p.opacity * 0.4],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ───── types ───── */
interface HelmetModel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sizes: string[] | null;
  sort_order: number | null;
  is_published: boolean | null;
}

interface Colorway {
  id: string;
  model_id: string;
  name: string;
  slug: string;
  available: boolean | null;
  thumbnail_url: string | null;
  main_image_url: string | null;
  gallery_images: string[] | null;
  images_360: string[] | null;
  sort_order: number | null;
  stock_by_size: Record<string, number> | null;
}

/* ───── Helmet Card ───── */
function HelmetCard({ model, colorways, onReserve }: { model: HelmetModel; colorways: Colorway[]; onReserve: (name: string) => void }) {
  const [selectedCw, setSelectedCw] = useState<Colorway | null>(colorways[0] || null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCw(colorways[0] || null);
    setSelectedSize(null);
  }, [model.id]);

  const allImages = selectedCw
    ? (selectedCw.gallery_images && selectedCw.gallery_images.length > 0)
      ? selectedCw.gallery_images
      : selectedCw.main_image_url
        ? [selectedCw.main_image_url]
        : []
    : [];

  const stockMap = (selectedCw?.stock_by_size as Record<string, number>) || {};
  const totalStock = Object.values(stockMap).reduce((a, b) => a + (b || 0), 0);
  const cwIsOutOfStock = selectedCw?.available === false || (Object.keys(stockMap).length > 0 && totalStock === 0);

  const sizeStock = (size: string) => stockMap[size] ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--glow-soft))]"
    >
      {/* Image gallery */}
      <div className="p-4 md:p-6">
        {allImages.length > 0 ? (
          <ImageGallery images={allImages} altPrefix={`${model.name}${selectedCw ? ` - ${selectedCw.name}` : ""}`} />
        ) : (
          <div className="aspect-[4/3] bg-secondary/30 rounded-xl flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Image à venir</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 pt-0">
        <h3 className="font-display text-3xl md:text-4xl text-foreground mb-2">{model.name}</h3>
        {model.description && <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{model.description}</p>}

        {/* Colorway swatches */}
        {colorways.length > 0 && (
          <div className="mb-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Coloris disponibles</p>
            <div className="flex flex-wrap gap-2">
              {colorways.map(cw => {
                const cwStock = (cw.stock_by_size as Record<string, number>) || {};
                const cwTotal = Object.values(cwStock).reduce((a, b) => a + (b || 0), 0);
                const isOut = cw.available === false || (Object.keys(cwStock).length > 0 && cwTotal === 0);
                return (
                  <button
                    key={cw.id}
                    onClick={() => { setSelectedCw(cw); setSelectedSize(null); }}
                    className={`group relative rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedCw?.id === cw.id
                        ? "border-primary shadow-[0_0_12px_hsl(var(--glow-soft))]"
                        : "border-border hover:border-muted-foreground/50"
                    } ${isOut ? "opacity-40" : ""}`}
                  >
                    {cw.thumbnail_url ? (
                      <img src={cw.thumbnail_url} alt={cw.name} className="w-14 h-14 md:w-16 md:h-16 object-cover" />
                    ) : (
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-muted flex items-center justify-center">
                        <span className="text-[10px] text-muted-foreground text-center px-1">{cw.name}</span>
                      </div>
                    )}
                    {isOut && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                        <span className="text-[9px] font-bold text-destructive uppercase">Épuisé</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedCw && (
              <p className="text-sm font-medium mt-2">
                <span className="text-primary">{selectedCw.name}</span>
                {cwIsOutOfStock && <span className="text-destructive ml-2 text-xs">— Rupture de stock</span>}
              </p>
            )}
          </div>
        )}

        {/* Sizes with stock indication */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Tailles</p>
          <div className="flex flex-wrap gap-2">
            {(model.sizes || []).map(s => {
              const stock = sizeStock(s);
              const outOfStock = stock !== null && stock === 0;
              const isSelected = selectedSize === s;
              return (
                <button
                  key={s}
                  onClick={() => setSelectedSize(isSelected ? null : s)}
                  disabled={outOfStock}
                  className={`text-xs font-medium px-3 py-1.5 rounded border transition-all duration-200 ${
                    outOfStock
                      ? "bg-secondary/30 text-muted-foreground/40 border-border line-through cursor-not-allowed"
                      : isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {s}
                  {outOfStock && <span className="ml-1 text-[9px] text-destructive no-underline">✗</span>}
                </button>
              );
            })}
          </div>
        </div>

        <Button
          onClick={() => onReserve(model.name + (selectedCw ? ` — ${selectedCw.name}` : "") + (selectedSize ? ` (${selectedSize})` : ""))}
          disabled={cwIsOutOfStock}
          className={cwIsOutOfStock ? "opacity-50" : ""}
        >
          {cwIsOutOfStock ? "Rupture de stock" : "Réserver en Magasin"}
        </Button>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════
   ARAI PAGE
   ════════════════════════════════════════════════════════ */
export default function AraiPage() {
  const [models, setModels] = useState<HelmetModel[]>([]);
  const [colorways, setColorways] = useState<Record<string, Colorway[]>>({});
  const [reserveModel, setReserveModel] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data: m } = await supabase.from("helmet_models").select("*").eq("is_published", true).order("sort_order");
    if (m) setModels(m as HelmetModel[]);
    const { data: cw } = await supabase.from("helmet_colorways").select("*").order("sort_order");
    if (cw) {
      const grouped: Record<string, Colorway[]> = {};
      (cw as Colorway[]).forEach(c => {
        if (!grouped[c.model_id]) grouped[c.model_id] = [];
        grouped[c.model_id].push(c);
      });
      setColorways(grouped);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Layout>
      {/* Hero — Dark Luxury Showroom */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden" style={{ backgroundColor: "#0A0A0A" }}>
        {/* Red radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(192,57,43,0.5) 0%, rgba(192,57,43,0.2) 35%, rgba(192,57,43,0.05) 60%, transparent 75%)",
          }}
        />
        {/* Subtle vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.7) 100%)",
          }}
        />

        <GoldParticles />

        {/* Arai badge top-right */}
        <motion.img
          src={araiBadge}
          alt="Arai Official"
          className="absolute top-24 right-6 md:right-12 w-16 md:w-24 opacity-80 z-10"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 0.8, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        {/* 3D Rotating Helmet */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ perspective: "1200px" }}>
          <motion.div
            className="w-[60vw] md:w-[40vw] max-w-[500px]"
            animate={{ rotateY: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <img
              src={heroHelmet}
              alt="Arai RX-7V EVO"
              className="w-full h-auto drop-shadow-[0_0_80px_rgba(192,57,43,0.6)]"
              style={{ background: "transparent" }}
            />
          </motion.div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <span className="text-primary font-bold tracking-[0.25em] uppercase text-sm md:text-base">
              Revendeur Officiel
            </span>
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-white mt-3 mb-5 leading-[0.9]">
              ARAI<br />HELMETS
            </h1>
            <p className="text-gray-400 max-w-lg text-base md:text-lg leading-relaxed">
              Découvrez notre gamme de casques Arai. Fabriqués à la main au Japon, chaque casque est un
              chef-d'œuvre de protection et de confort.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Store Photo */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-8">
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-3">Notre espace Arai en magasin</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Découvrez notre mur de casques Arai et venez essayer les différents modèles directement en magasin.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="rounded-xl overflow-hidden border border-border shadow-[0_0_40px_hsl(var(--glow-soft))]">
            <img src={araiStoreWall} alt="Espace Arai en magasin — mur de casques" className="w-full h-auto object-cover" />
          </motion.div>
        </div>
      </section>

      {/* Helmets */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeading title="MODÈLES DISPONIBLES" subtitle="Essayez-les en magasin et trouvez votre taille idéale" />
          {models.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Les modèles seront bientôt disponibles.</p>
          )}
          <div className="grid md:grid-cols-2 gap-8">
            {models.map(model => (
              <HelmetCard
                key={model.id}
                model={model}
                colorways={colorways[model.id] || []}
                onReserve={setReserveModel}
              />
            ))}
          </div>
        </div>
      </section>

      <ReservationModal
        open={!!reserveModel}
        onClose={() => setReserveModel(null)}
        helmetModel={reserveModel || ""}
      />
    </Layout>
  );
}
