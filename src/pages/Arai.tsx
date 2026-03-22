import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import ReservationModal from "@/components/ReservationModal";
import { supabase } from "@/integrations/supabase/client";
import ImageGallery from "@/components/ImageGallery";
import araiStoreWall from "@/assets/arai-store-wall.jpg";
import AraiViewer from "@/components/AraiViewer";

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
      <AraiViewer />

      {/* Store Photo */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center"
          >
            <p className="mb-3 text-[11px] uppercase tracking-[0.42em] text-primary md:text-xs">
              Notre espace · en magasin
            </p>
            <h2 className="font-display text-[clamp(4rem,10vw,7rem)] leading-[0.9] text-foreground">
              ARAI
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[11px] uppercase tracking-[0.22em] text-muted-foreground md:text-xs">
              Découvrez notre mur de casques Arai et venez essayer les différents modèles directement en magasin.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-xl border border-primary/20 bg-card shadow-[0_0_40px_hsl(var(--glow-soft))]"
          >
            {[
              "top-4 left-4 border-t border-l",
              "top-4 right-4 border-t border-r",
              "bottom-4 left-4 border-b border-l",
              "bottom-4 right-4 border-b border-r",
            ].map((position) => (
              <div
                key={position}
                className={`pointer-events-none absolute z-20 h-4 w-4 border-primary/40 ${position}`}
              />
            ))}

            <div className="absolute inset-0 z-10 bg-background/50" />
            <div className="absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-background via-background/50 to-transparent" />

            <img
              src={araiStoreWall}
              alt="Espace Arai en magasin — mur de casques"
              className="h-auto w-full object-cover"
            />
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
