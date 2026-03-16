import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import ReservationModal from "@/components/ReservationModal";
import { supabase } from "@/integrations/supabase/client";
import helmetHeroImg from "@/assets/helmet-hero.jpg";
import araiStoreWall from "@/assets/arai-store-wall.jpg";


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
}

/* ───── 360 viewer ───── */
function Viewer360({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handlePointerDown = (e: React.PointerEvent) => { setDragging(true); setStartX(e.clientX); };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const diff = e.clientX - startX;
    if (Math.abs(diff) > 20) {
      setIndex(i => (i + (diff > 0 ? 1 : -1) + images.length) % images.length);
      setStartX(e.clientX);
    }
  };
  const handlePointerUp = () => setDragging(false);

  return (
    <div className="relative select-none touch-none" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
      <img src={images[index]} alt="360° view" className="w-full h-full object-contain" draggable={false} />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
        <RotateCcw className="w-3 h-3 text-primary" />
        <span className="text-xs text-muted-foreground">Glissez pour tourner</span>
      </div>
    </div>
  );
}

/* ───── image gallery with thumbnails ───── */
function ImageGallery({ images, altPrefix }: { images: string[]; altPrefix: string }) {
  const [idx, setIdx] = useState(0);
  if (images.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="aspect-[4/3] bg-secondary/30 rounded-xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={idx}
            src={images[idx]}
            alt={`${altPrefix} - vue ${idx + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full object-contain"
          />
        </AnimatePresence>
      </div>
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 justify-center">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                i === idx
                  ? "border-primary shadow-[0_0_10px_hsl(var(--glow-soft))]"
                  : "border-border hover:border-muted-foreground/50 opacity-60 hover:opacity-100"
              }`}
            >
              <img src={src} alt={`Miniature ${i + 1}`} className="w-16 h-16 md:w-20 md:h-20 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───── Helmet Card ───── */
function HelmetCard({ model, colorways, onReserve }: { model: HelmetModel; colorways: Colorway[]; onReserve: (name: string) => void }) {
  const availableColorways = colorways.filter(c => c.available !== false);
  const [selectedCw, setSelectedCw] = useState<Colorway | null>(availableColorways[0] || null);

  useEffect(() => {
    setSelectedCw(availableColorways[0] || null);
  }, [model.id]);

  // Build the image list: gallery_images if available, otherwise just the main image
  const allImages = selectedCw
    ? (selectedCw.gallery_images && selectedCw.gallery_images.length > 0)
      ? selectedCw.gallery_images
      : selectedCw.main_image_url
        ? [selectedCw.main_image_url]
        : []
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--glow-soft))]"
    >
      {/* Image gallery area */}
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
        {availableColorways.length > 0 && (
          <div className="mb-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Coloris disponibles</p>
            <div className="flex flex-wrap gap-2">
              {availableColorways.map(cw => (
                <button
                  key={cw.id}
                  onClick={() => setSelectedCw(cw)}
                  className={`group relative rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedCw?.id === cw.id
                      ? "border-primary shadow-[0_0_12px_hsl(var(--glow-soft))]"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  {cw.thumbnail_url ? (
                    <img src={cw.thumbnail_url} alt={cw.name} className="w-14 h-14 md:w-16 md:h-16 object-cover" />
                  ) : (
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-muted flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground text-center px-1">{cw.name}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {selectedCw && (
              <p className="text-sm text-primary font-medium mt-2">{selectedCw.name}</p>
            )}
          </div>
        )}

        {/* Sizes */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(model.sizes || []).map(s => (
            <span key={s} className="text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded">{s}</span>
          ))}
        </div>

        <Button onClick={() => onReserve(model.name + (selectedCw ? ` — ${selectedCw.name}` : ""))}>
          Réserver en Magasin
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
      {/* Hero */}
      <section className="relative py-32">
        <div className="absolute inset-0">
          <img src={helmetHeroImg} alt="Arai Helmet" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-primary font-medium tracking-wider uppercase text-sm">Revendeur Officiel</span>
            <h1 className="font-display text-6xl md:text-8xl text-foreground mt-2 mb-4">ARAI HELMETS</h1>
            <p className="text-muted-foreground max-w-lg">
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
