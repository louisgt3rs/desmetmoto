import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Package } from "lucide-react";

interface ProductColorway {
  id: string;
  name: string;
  image_url: string | null;
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
          stock_by_size: parseSbs(d.stock_by_size),
        }));
        setColorways(cws);
        if (cws.length > 0) setSelected(cws[0]);
        setLoaded(true);
      });
  }, [productId]);

  // Determine what to display based on selection
  const hasColorways = colorways.length > 0;
  const activeImage = hasColorways ? selected?.image_url || productImageUrl : productImageUrl;
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

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card hover:border-primary/40 transition-all">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-secondary">
        {activeImage ? (
          <img src={activeImage} alt={productName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
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
            {colorways.map((cw) => (
              <button
                key={cw.id}
                onClick={() => setSelected(cw)}
                className={`relative overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                  selected?.id === cw.id
                    ? "border-primary shadow-[0_0_10px_hsl(var(--glow-soft))]"
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                {cw.image_url ? (
                  <img src={cw.image_url} alt={cw.name} className="w-12 h-12 object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-muted flex items-center justify-center">
                    <span className="text-[9px] text-muted-foreground text-center px-0.5 leading-tight">{cw.name}</span>
                  </div>
                )}
              </button>
            ))}
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
