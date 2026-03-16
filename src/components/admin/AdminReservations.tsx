import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, CheckCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Reservation = Tables<"reservations">;

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const load = async () => {
    const { data } = await supabase.from("reservations").select("*").order("created_at", { ascending: false });
    if (data) setReservations(data);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette réservation ?")) return;
    await supabase.from("reservations").delete().eq("id", id);
    toast.success("Réservation supprimée"); load();
  };

  const handleStatus = async (id: string, status: string) => {
    await supabase.from("reservations").update({ status }).eq("id", id);
    toast.success("Statut mis à jour"); load();
  };

  return (
    <div>
      <h2 className="font-display text-2xl text-foreground mb-6">RÉSERVATIONS ({reservations.length})</h2>
      {reservations.length === 0 ? (
        <p className="text-muted-foreground">Aucune réservation.</p>
      ) : (
        <div className="space-y-3">
          {reservations.map(r => (
            <div key={r.id} className="bg-card border border-border rounded-lg p-4 flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-foreground font-medium">{r.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${r.status === "confirmed" ? "bg-green-500/20 text-green-400" : r.status === "cancelled" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}`}>
                    {r.status === "confirmed" ? "Confirmé" : r.status === "cancelled" ? "Annulé" : "En attente"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{r.phone} • {r.email}</p>
                <p className="text-sm text-primary">{r.product_name} – Taille {r.size}</p>
                {r.message && <p className="text-sm text-muted-foreground italic">{r.message}</p>}
                <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("fr-BE")}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {r.status !== "confirmed" && (
                  <Button variant="ghost" size="sm" onClick={() => handleStatus(r.id, "confirmed")}>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
