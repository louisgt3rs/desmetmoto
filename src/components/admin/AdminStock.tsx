import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, Loader2, Minus, Plus, Save } from "lucide-react";
import type { AdminProduct } from "./types";

interface Colorway {
  id: string;
  name: string;
  image_url: string | null;
  stock_by_size: Record<string, number>;
}

interface StockRow {
  product: AdminProduct;
  colorways: Colorway[];
  directStock: Record<string, number>;
  mode: "direct" | "colorways";
}

const HELMET_SIZES  = ["XS", "S", "M", "L", "XL", "2XL"];
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];

function sizesFor(category: string): string[] {
  const c = (category || "").toLowerCase();
  if (c === "casques") return HELMET_SIZES;
  if (["blousons", "pantalons", "gants", "bottes", "combinaisons"].includes(c)) return CLOTHING_SIZES;
  return [];
}

function parseSbs(v: unknown): Record<string, number> {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, number>;
  return {};
}

function totalStock(sbs: Record<string, number>) {
  return Object.values(sbs).reduce((a, b) => a + b, 0);
}

function StockBadge({ qty }: { qty: number }) {
  const color = qty > 3 ? "#22c55e" : qty > 0 ? "#f59e0b" : "#ef4444";
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium"
      style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}>
      {qty > 0 ? `${qty} pcs` : "Rupture"}
    </span>
  );
}

function SizeButtons({
  sizes, value, onChange,
}: { sizes: string[]; value: Record<string, number>; onChange: (v: Record<string, number>) => void }) {
  if (sizes.length === 0) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-[11px] uppercase tracking-wider text-[hsl(var(--admin-muted-foreground))]">Quantité</span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onChange({ unique: Math.max(0, (value["unique"] ?? 0) - 1) })}
            className="flex h-7 w-7 items-center justify-center border border-[hsl(var(--admin-accent)/0.25)] hover:border-[hsl(var(--admin-accent)/0.6)] transition-colors"
            style={{ color: "hsl(var(--admin-accent))" }}><Minus className="h-3 w-3" /></button>
          <span className="w-10 text-center font-adminDisplay text-base text-[hsl(var(--admin-foreground))]">{value["unique"] ?? 0}</span>
          <button type="button" onClick={() => onChange({ unique: (value["unique"] ?? 0) + 1 })}
            className="flex h-7 w-7 items-center justify-center border border-[hsl(var(--admin-accent)/0.25)] hover:border-[hsl(var(--admin-accent)/0.6)] transition-colors"
            style={{ color: "hsl(var(--admin-accent))" }}><Plus className="h-3 w-3" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map(size => {
        const qty = value[size] ?? 0;
        const color = qty > 3 ? "#22c55e" : qty > 0 ? "#f59e0b" : "hsl(var(--admin-muted-foreground))";
        return (
          <div key={size} className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color }}>{size}</span>
            <div className="flex items-center gap-0.5">
              <button type="button" onClick={() => onChange({ ...value, [size]: Math.max(0, qty - 1) })}
                className="flex h-6 w-6 items-center justify-center border border-[hsl(var(--admin-accent)/0.2)] hover:border-[hsl(var(--admin-accent)/0.5)] hover:bg-[hsl(var(--admin-accent)/0.08)] transition-colors">
                <Minus className="h-2.5 w-2.5 text-[hsl(var(--admin-muted-foreground))]" />
              </button>
              <input
                type="number" min="0" value={qty}
                onChange={e => onChange({ ...value, [size]: Math.max(0, parseInt(e.target.value) || 0) })}
                className="h-6 w-10 border border-[hsl(var(--admin-accent)/0.2)] bg-transparent text-center text-xs text-[hsl(var(--admin-foreground))] outline-none focus:border-[hsl(var(--admin-accent)/0.5)]"
              />
              <button type="button" onClick={() => onChange({ ...value, [size]: qty + 1 })}
                className="flex h-6 w-6 items-center justify-center border border-[hsl(var(--admin-accent)/0.2)] hover:border-[hsl(var(--admin-accent)/0.5)] hover:bg-[hsl(var(--admin-accent)/0.08)] transition-colors">
                <Plus className="h-2.5 w-2.5 text-[hsl(var(--admin-muted-foreground))]" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminStock({ products }: { products: AdminProduct[] }) {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Load colorways for all products
  useEffect(() => {
    if (!products.length) return;
    supabase.from("product_colorways").select("id,product_id,name,image_url,stock_by_size")
      .then(({ data }) => {
        const cwMap: Record<string, Colorway[]> = {};
        for (const cw of data || []) {
          if (!cwMap[cw.product_id]) cwMap[cw.product_id] = [];
          cwMap[cw.product_id].push({ id: cw.id, name: cw.name, image_url: cw.image_url, stock_by_size: parseSbs(cw.stock_by_size) });
        }
        setRows(products.map(p => {
          const cws = cwMap[p.id] || [];
          return {
            product: p,
            colorways: cws,
            directStock: parseSbs(p.stock_by_size),
            mode: cws.length > 0 ? "colorways" : "direct",
          };
        }));
      });
  }, [products]);

  const updateDirectStock = (productId: string, val: Record<string, number>) => {
    setRows(r => r.map(row => row.product.id === productId ? { ...row, directStock: val } : row));
  };

  const updateCwStock = (productId: string, cwId: string, val: Record<string, number>) => {
    setRows(r => r.map(row => row.product.id !== productId ? row : {
      ...row, colorways: row.colorways.map(cw => cw.id === cwId ? { ...cw, stock_by_size: val } : cw)
    }));
  };

  const save = async (row: StockRow) => {
    setSaving(row.product.id);
    try {
      if (row.mode === "colorways") {
        await Promise.all(row.colorways.map(cw =>
          supabase.from("product_colorways").update({ stock_by_size: cw.stock_by_size }).eq("id", cw.id)
        ));
        const total = row.colorways.reduce((s, c) => s + totalStock(c.stock_by_size), 0);
        await supabase.from("products").update({ stock_quantity: total, in_stock: total > 0, stock_by_size: null }).eq("id", row.product.id);
      } else {
        const total = totalStock(row.directStock);
        const sbs = Object.keys(row.directStock).length > 0 ? row.directStock : null;
        await supabase.from("products").update({ stock_quantity: total, in_stock: total > 0, stock_by_size: sbs }).eq("id", row.product.id);
      }
      toast.success(`${row.product.name} — stock mis à jour`);
    } catch (e) {
      toast.error("Erreur : " + String(e));
    }
    setSaving(null);
  };

  const filtered = rows.filter(r =>
    !search.trim() ||
    [r.product.name, r.product.brand, r.product.category].some(v => String(v ?? "").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[hsl(var(--admin-accent)/0.18)] px-5 py-4">
        <div className="flex-1">
          <p className="admin-kicker text-[10px] text-[hsl(var(--admin-muted-foreground))]">INVENTAIRE</p>
          <h2 className="font-adminDisplay text-2xl text-[hsl(var(--admin-foreground))]">
            STOCK <span style={{ color: "hsl(var(--admin-accent))" }}>({products.length})</span>
          </h2>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
          className="w-56 border border-[hsl(var(--admin-accent)/0.2)] bg-transparent px-3 py-2 text-sm text-[hsl(var(--admin-foreground))] placeholder:text-[hsl(var(--admin-muted-foreground)/0.5)] outline-none focus:border-[hsl(var(--admin-accent)/0.5)] transition-colors" />
      </div>

      {/* Product rows */}
      {filtered.map(row => {
        const isOpen = expanded === row.product.id;
        const isSaving = saving === row.product.id;
        const stock = row.mode === "colorways"
          ? row.colorways.reduce((s, c) => s + totalStock(c.stock_by_size), 0)
          : totalStock(row.directStock);
        const sizes = sizesFor(row.product.category || "");

        return (
          <div key={row.product.id} className="border-b border-[hsl(var(--admin-accent)/0.1)]">
            {/* Row header — click to expand */}
            <div className="flex cursor-pointer items-center gap-4 px-5 py-3.5 hover:bg-[hsl(var(--admin-accent)/0.04)] transition-colors"
              onClick={() => setExpanded(isOpen ? null : row.product.id)}>
              {/* Thumb */}
              <div className="h-11 w-11 shrink-0 overflow-hidden border border-[hsl(var(--admin-accent)/0.14)]"
                style={{ background: "hsl(var(--admin-background))" }}>
                {row.product.image_url
                  ? <img src={row.product.image_url} alt="" className="h-full w-full object-contain p-0.5" />
                  : <div className="h-full w-full" style={{ background: "hsl(var(--admin-card))" }} />}
              </div>
              {/* Name + meta */}
              <div className="min-w-0 flex-1">
                <p className="font-adminDisplay text-sm text-[hsl(var(--admin-foreground))] truncate">{row.product.name}</p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-[hsl(var(--admin-muted-foreground))] truncate">
                  {row.product.brand || "—"} · {row.product.category || "—"}
                  {row.mode === "colorways" && ` · ${row.colorways.length} coloris`}
                </p>
              </div>
              <StockBadge qty={stock} />
              {isOpen ? <ChevronDown className="h-4 w-4 shrink-0 text-[hsl(var(--admin-muted-foreground))]" /> : <ChevronRight className="h-4 w-4 shrink-0 text-[hsl(var(--admin-muted-foreground))]" />}
            </div>

            {/* Expanded stock editor */}
            {isOpen && (
              <div className="border-t border-[hsl(var(--admin-accent)/0.1)] px-5 py-4 space-y-4"
                style={{ background: "hsl(var(--admin-background))" }}>

                {row.mode === "direct" ? (
                  <div className="space-y-3">
                    <SizeButtons
                      sizes={sizes}
                      value={row.directStock}
                      onChange={v => updateDirectStock(row.product.id, v)}
                    />
                    {sizes.length > 0 && (
                      <p className="text-[11px] text-[hsl(var(--admin-muted-foreground))]">
                        Total : <strong style={{ color: "hsl(var(--admin-accent))" }}>{totalStock(row.directStock)} pcs</strong>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {row.colorways.map(cw => (
                      <div key={cw.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          {cw.image_url && <img src={cw.image_url} alt={cw.name} className="h-8 w-8 object-contain border border-[hsl(var(--admin-accent)/0.15)]" />}
                          <span className="font-adminDisplay text-sm text-[hsl(var(--admin-foreground))]">{cw.name}</span>
                          <StockBadge qty={totalStock(cw.stock_by_size)} />
                        </div>
                        <SizeButtons
                          sizes={sizes}
                          value={cw.stock_by_size}
                          onChange={v => updateCwStock(row.product.id, cw.id, v)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={() => save(row)} disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 font-adminDisplay text-[11px] uppercase tracking-[0.2em] transition-all disabled:opacity-50"
                  style={{ background: "hsl(var(--admin-accent))", color: "#050505" }}>
                  {isSaving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Enregistrement…</> : <><Save className="h-3.5 w-3.5" /> Enregistrer</>}
                </button>
              </div>
            )}
          </div>
        );
      })}

      {!filtered.length && (
        <div className="py-20 text-center text-xs uppercase tracking-widest text-[hsl(var(--admin-muted-foreground))]">Aucun produit</div>
      )}
    </div>
  );
}
