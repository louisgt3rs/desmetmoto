import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, Loader2, Search, X } from "lucide-react";

type ReservationStatus = "pending" | "confirmed" | "cancelled";

interface Reservation {
  id: string;
  product_name: string;
  coloris: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string | null;
  status: ReservationStatus;
  created_at: string;
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

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ReservationStatus | "">("");

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase.from("store_reservations" as any) as any)
      .select("id, product_name, coloris, first_name, last_name, email, phone, message, status, created_at")
      .order("created_at", { ascending: false });
    setReservations((data || []) as Reservation[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = reservations;
    if (filterStatus) list = list.filter(r => r.status === filterStatus);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(r =>
        [r.product_name, r.first_name, r.last_name, r.email, r.phone]
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

  const updateStatus = async (r: Reservation, newStatus: ReservationStatus) => {
    const actionKey = r.id + newStatus;
    setActionLoading(actionKey);

    const { error } = await (supabase.from("store_reservations" as any) as any)
      .update({ status: newStatus })
      .eq("id", r.id);

    if (error) {
      toast.error("ERREUR : " + error.message.toUpperCase());
      setActionLoading(null);
      return;
    }

    const { error: fnErr } = await supabase.functions.invoke("send-email", {
      body: {
        type: newStatus === "confirmed" ? "confirmed" : "cancelled",
        reservation: {
          product_name: r.product_name,
          coloris: r.coloris,
          first_name: r.first_name,
          last_name: r.last_name,
          email: r.email,
          phone: r.phone,
        },
      },
    });

    if (fnErr) {
      toast.warning("STATUT MIS À JOUR MAIS EMAIL NON ENVOYÉ");
    } else {
      toast.success(
        newStatus === "confirmed"
          ? "RÉSERVATION CONFIRMÉE — EMAIL ENVOYÉ"
          : "RÉSERVATION ANNULÉE — EMAIL ENVOYÉ"
      );
    }

    setActionLoading(null);
    setReservations(prev =>
      prev.map(x => x.id === r.id ? { ...x, status: newStatus } : x)
    );
  };

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("fr-BE", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " + new Date(s).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">

      {/* Summary cards */}
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
        {/* Toolbar */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">BOUTIQUE</p>
            <h2 className="font-adminDisplay text-3xl text-[hsl(var(--admin-foreground))]">
              RÉSERVATIONS MAGASIN ({filtered.length})
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
            AUCUNE RÉSERVATION TROUVÉE
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => (
              <div
                key={r.id}
                className="border border-[hsl(var(--admin-accent)/0.16)] bg-[hsl(var(--admin-background))] p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  {/* Info */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center border px-2 py-0.5 font-adminDisplay text-[10px] tracking-[0.16em] ${STATUS_STYLE[r.status]}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.1em] text-[hsl(var(--admin-muted-foreground))]">
                        {fmtDate(r.created_at)}
                      </span>
                    </div>

                    <p className="font-adminDisplay text-lg leading-tight text-[hsl(var(--admin-foreground))]">
                      {r.product_name}
                      {r.coloris && (
                        <span className="ml-2 text-sm text-[hsl(var(--admin-accent))]">— {r.coloris}</span>
                      )}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs uppercase tracking-[0.1em] text-[hsl(var(--admin-foreground))]">
                      <span>{r.first_name} {r.last_name}</span>
                      <a href={`mailto:${r.email}`} className="text-[hsl(var(--admin-accent))] hover:underline">
                        {r.email}
                      </a>
                      <span>{r.phone}</span>
                    </div>

                    {r.message && (
                      <p className="mt-1 text-xs italic text-[hsl(var(--admin-muted-foreground))]">
                        "{r.message}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 gap-2">
                    {r.status === "pending" && (
                      <Button
                        onClick={() => updateStatus(r, "confirmed")}
                        disabled={actionLoading !== null}
                        className="h-9 rounded-none border border-emerald-500/50 bg-emerald-500/10 px-4 font-adminDisplay text-xs tracking-[0.14em] text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50"
                      >
                        {actionLoading === r.id + "confirmed"
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <Check className="h-3 w-3" />}
                        CONFIRMER
                      </Button>
                    )}
                    {(r.status === "pending" || r.status === "confirmed") && (
                      <Button
                        onClick={() => updateStatus(r, "cancelled")}
                        disabled={actionLoading !== null}
                        className="h-9 rounded-none border border-red-500/40 bg-transparent px-4 font-adminDisplay text-xs tracking-[0.14em] text-red-400 hover:bg-red-500/15 disabled:opacity-50"
                      >
                        {actionLoading === r.id + "cancelled"
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <X className="h-3 w-3" />}
                        ANNULER
                      </Button>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
