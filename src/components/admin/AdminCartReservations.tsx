import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ChevronDown, ChevronUp } from "lucide-react";

type ReservationStatus = "pending" | "confirmed" | "cancelled";

interface CartItem {
  id: string;
  product_name: string;
  quantity: number;
  price_at_reservation: number | null;
}

interface CartReservation {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  notes: string | null;
  status: ReservationStatus;
  items: CartItem[];
}

const STATUS_LABEL: Record<ReservationStatus, string> = {
  pending:   "EN ATTENTE",
  confirmed: "CONFIRMÉ",
  cancelled: "ANNULÉ",
};

const STATUS_STYLE: Record<ReservationStatus, string> = {
  pending:   "border-[#c9973a]/50 bg-[#c9973a]/10 text-[#c9973a]",
  confirmed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  cancelled: "border-red-500/30 bg-red-500/10 text-red-400/70",
};

export default function AdminCartReservations() {
  const [reservations, setReservations] = useState<CartReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ReservationStatus | "">("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    const { data: resData } = await (supabase.from("cart_reservations" as any) as any)
      .select("id, created_at, first_name, last_name, email, phone, notes, status")
      .order("created_at", { ascending: false });

    if (!resData?.length) { setReservations([]); setLoading(false); return; }

    const ids = resData.map((r: any) => r.id);
    const { data: itemsData } = await (supabase.from("cart_reservation_items" as any) as any)
      .select("id, reservation_id, product_name, quantity, price_at_reservation")
      .in("reservation_id", ids);

    const itemsByRes: Record<string, CartItem[]> = {};
    for (const item of (itemsData || [])) {
      if (!itemsByRes[item.reservation_id]) itemsByRes[item.reservation_id] = [];
      itemsByRes[item.reservation_id].push(item);
    }

    setReservations(resData.map((r: any) => ({ ...r, items: itemsByRes[r.id] || [] })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = reservations;
    if (filterStatus) list = list.filter(r => r.status === filterStatus);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(r =>
        [r.first_name, r.last_name, r.email, r.phone, ...(r.items.map(i => i.product_name))]
          .some(v => v?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [reservations, filterStatus, search]);

  const counts = useMemo(() => ({
    pending:   reservations.filter(r => r.status === "pending").length,
    confirmed: reservations.filter(r => r.status === "confirmed").length,
    cancelled: reservations.filter(r => r.status === "cancelled").length,
  }), [reservations]);

  const updateStatus = async (id: string, newStatus: ReservationStatus) => {
    await (supabase.from("cart_reservations" as any) as any)
      .update({ status: newStatus })
      .eq("id", id);
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("fr-BE", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " + new Date(s).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });

  const fmtPrice = (n: number | null) =>
    n != null ? n.toLocaleString("fr-BE", { minimumFractionDigits: 2 }) + " €" : "—";

  const totalOf = (r: CartReservation) => {
    const allPriced = r.items.every(i => i.price_at_reservation != null);
    if (!allPriced) return null;
    return r.items.reduce((s, i) => s + (i.price_at_reservation ?? 0) * i.quantity, 0);
  };

  return (
    <div className="space-y-6">

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {(["pending", "confirmed", "cancelled"] as ReservationStatus[]).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(f => f === s ? "" : s)}
            className={`border p-4 text-left transition-all ${filterStatus === s
              ? "border-[hsl(var(--admin-accent))] bg-[hsl(var(--admin-accent)/0.12)]"
              : "border-[hsl(var(--admin-accent)/0.16)] bg-[hsl(var(--admin-card))] hover:border-[hsl(var(--admin-accent)/0.4)]"}`}
          >
            <p className="font-adminDisplay text-3xl text-[hsl(var(--admin-foreground))]">{counts[s]}</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--admin-muted-foreground))]">{STATUS_LABEL[s]}</p>
          </button>
        ))}
      </div>

      <div className="admin-card rounded-none p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">PANIER EN LIGNE</p>
            <h2 className="font-adminDisplay text-3xl text-[hsl(var(--admin-foreground))]">
              COMMANDES PANIER ({filtered.length})
            </h2>
          </div>
          <div className="relative min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--admin-muted-foreground))]" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="RECHERCHER..."
              className="admin-input pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[20vh] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-[hsl(var(--admin-accent))]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-[hsl(var(--admin-accent)/0.18)] p-8 text-center text-sm uppercase tracking-[0.18em] text-[hsl(var(--admin-muted-foreground))]">
            AUCUNE COMMANDE TROUVÉE
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => {
              const isOpen = expanded.has(r.id);
              const total = totalOf(r);
              return (
                <div key={r.id} className="border border-[hsl(var(--admin-accent)/0.14)] bg-[hsl(var(--admin-card))]">
                  {/* Header row */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(r.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[hsl(var(--admin-accent)/0.04)] transition-colors"
                  >
                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                      <div>
                        <p className="font-adminDisplay text-base text-[hsl(var(--admin-foreground))] truncate">
                          {r.first_name} {r.last_name}
                        </p>
                        <p className="text-[11px] text-[hsl(var(--admin-muted-foreground))] truncate">{r.email}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex px-2 py-0.5 font-adminDisplay text-[10px] uppercase tracking-[0.18em] border ${STATUS_STYLE[r.status]}`}>
                          {STATUS_LABEL[r.status]}
                        </span>
                        <span className="text-[11px] text-[hsl(var(--admin-muted-foreground))]">
                          {r.items.length} article{r.items.length > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        {total != null && (
                          <p className="font-adminDisplay text-base text-[hsl(var(--admin-accent))]">
                            {total.toLocaleString("fr-BE", { minimumFractionDigits: 2 })} €
                          </p>
                        )}
                        <p className="text-[11px] text-[hsl(var(--admin-muted-foreground))]">{fmtDate(r.created_at)}</p>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-[hsl(var(--admin-muted-foreground))]" /> : <ChevronDown className="h-4 w-4 shrink-0 text-[hsl(var(--admin-muted-foreground))]" />}
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="border-t border-[hsl(var(--admin-accent)/0.12)] px-5 py-4 space-y-5">
                      {/* Contact */}
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--admin-muted-foreground))] mb-1">Contact</p>
                          <p className="text-[hsl(var(--admin-foreground))]">{r.first_name} {r.last_name}</p>
                          <a href={`mailto:${r.email}`} className="text-[hsl(var(--admin-accent))] hover:opacity-80">{r.email}</a>
                          <p className="text-[hsl(var(--admin-muted-foreground))]">{r.phone}</p>
                          {r.notes && <p className="mt-1 italic text-[hsl(var(--admin-muted-foreground))]">{r.notes}</p>}
                        </div>
                        {/* Status actions */}
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--admin-muted-foreground))] mb-2">Changer statut</p>
                          <div className="flex gap-2 flex-wrap">
                            {(["pending", "confirmed", "cancelled"] as ReservationStatus[])
                              .filter(s => s !== r.status)
                              .map(s => (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(r.id, s)}
                                  className={`px-3 py-1.5 font-adminDisplay text-[10px] uppercase tracking-[0.15em] border transition-all ${STATUS_STYLE[s]} hover:opacity-80`}
                                >
                                  → {STATUS_LABEL[s]}
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>

                      {/* Articles */}
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--admin-muted-foreground))] mb-2">Articles</p>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[hsl(var(--admin-accent)/0.12)]">
                              <th className="py-2 text-left text-[10px] uppercase tracking-[0.15em] text-[hsl(var(--admin-muted-foreground))] font-normal">Article</th>
                              <th className="py-2 text-center text-[10px] uppercase tracking-[0.15em] text-[hsl(var(--admin-muted-foreground))] font-normal w-16">Qté</th>
                              <th className="py-2 text-right text-[10px] uppercase tracking-[0.15em] text-[hsl(var(--admin-muted-foreground))] font-normal w-28">Prix unit.</th>
                              <th className="py-2 text-right text-[10px] uppercase tracking-[0.15em] text-[hsl(var(--admin-muted-foreground))] font-normal w-28">Sous-total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {r.items.map(item => (
                              <tr key={item.id} className="border-b border-[hsl(var(--admin-accent)/0.07)]">
                                <td className="py-2.5 text-[hsl(var(--admin-foreground))]">{item.product_name}</td>
                                <td className="py-2.5 text-center text-[hsl(var(--admin-muted-foreground))]">{item.quantity}</td>
                                <td className="py-2.5 text-right text-[hsl(var(--admin-muted-foreground))]">{fmtPrice(item.price_at_reservation)}</td>
                                <td className="py-2.5 text-right font-adminDisplay text-[hsl(var(--admin-accent))]">
                                  {item.price_at_reservation != null ? fmtPrice(item.price_at_reservation * item.quantity) : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          {total != null && (
                            <tfoot>
                              <tr>
                                <td colSpan={3} className="pt-3 text-right text-[10px] uppercase tracking-[0.15em] text-[hsl(var(--admin-muted-foreground))]">Total estimé</td>
                                <td className="pt-3 text-right font-adminDisplay text-lg text-[hsl(var(--admin-accent))]">
                                  {total.toLocaleString("fr-BE", { minimumFractionDigits: 2 })} €
                                </td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
