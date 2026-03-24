import { Input } from "@/components/ui/input";

const HELMET_SIZES = ["XS", "S", "M", "L", "XL", "2XL"] as const;
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"] as const;

function getSizesForCategory(category: string): readonly string[] {
  const cat = category.toLowerCase();
  if (cat === "casques") return HELMET_SIZES;
  if (["blousons", "gants", "bottes", "combinaisons"].includes(cat)) return CLOTHING_SIZES;
  return []; // Accessoires = no sizes
}

interface SizeStockGridProps {
  category: string;
  value: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
}

export function calcTotalFromSizes(sizeStock: Record<string, number>): number {
  return Object.values(sizeStock).reduce((sum, v) => sum + (v || 0), 0);
}

export default function SizeStockGrid({ category, value, onChange }: SizeStockGridProps) {
  const sizes = getSizesForCategory(category);

  if (sizes.length === 0) {
    return (
      <p className="text-xs uppercase tracking-[0.14em] text-[hsl(var(--admin-muted-foreground))]">
        SANS TAILLE — UTILISEZ LE CHAMP STOCK CI-DESSUS
      </p>
    );
  }

  const total = calcTotalFromSizes(value);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {sizes.map((size) => (
          <div key={size} className="space-y-1">
            <label className="block text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--admin-accent))]">
              {size}
            </label>
            <Input
              type="number"
              min="0"
              step="1"
              value={value[size] ?? 0}
              onChange={(e) => {
                const next = { ...value, [size]: Math.max(0, parseInt(e.target.value) || 0) };
                onChange(next);
              }}
              className="admin-input h-10 text-center text-sm"
            />
          </div>
        ))}
      </div>
      <p className="text-xs uppercase tracking-[0.14em] text-[hsl(var(--admin-muted-foreground))]">
        STOCK TOTAL : <span className="text-[hsl(var(--admin-accent))]">{total} PCS</span>
      </p>
    </div>
  );
}
