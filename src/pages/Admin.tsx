import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Plus, LogOut } from "lucide-react";

const ADMIN_PASS = "desmet2024"; // Simple auth for now

interface Reservation {
  id: number;
  name: string;
  phone: string;
  email: string;
  model: string;
  size: string;
  message: string;
  date: string;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<"reservations" | "helmets" | "events">("reservations");
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const res = JSON.parse(localStorage.getItem("reservations") || "[]");
    setReservations(res);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASS) {
      setAuthenticated(true);
    } else {
      toast.error("Mot de passe incorrect");
    }
  };

  const deleteReservation = (id: number) => {
    const updated = reservations.filter((r) => r.id !== id);
    setReservations(updated);
    localStorage.setItem("reservations", JSON.stringify(updated));
    toast.success("Réservation supprimée");
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-lg p-8 w-full max-w-sm">
          <h1 className="font-display text-3xl text-foreground text-center mb-6">ADMIN</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary border-border"
            />
            <Button type="submit" className="w-full">Connexion</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <h1 className="font-display text-xl text-foreground">DESMET <span className="text-primary">ADMIN</span></h1>
          <Button variant="ghost" size="sm" onClick={() => setAuthenticated(false)}>
            <LogOut className="w-4 h-4 mr-2" /> Déconnexion
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(["reservations", "helmets", "events"] as const).map((t) => (
            <Button
              key={t}
              variant={tab === t ? "default" : "outline"}
              size="sm"
              onClick={() => setTab(t)}
            >
              {t === "reservations" ? "Réservations" : t === "helmets" ? "Casques" : "Événements"}
            </Button>
          ))}
        </div>

        {tab === "reservations" && (
          <div>
            <h2 className="font-display text-2xl text-foreground mb-6">RÉSERVATIONS</h2>
            {reservations.length === 0 ? (
              <p className="text-muted-foreground">Aucune réservation pour le moment.</p>
            ) : (
              <div className="space-y-4">
                {reservations.map((r) => (
                  <div key={r.id} className="bg-card border border-border rounded-lg p-4 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-foreground font-medium">{r.name}</p>
                      <p className="text-sm text-muted-foreground">{r.phone} • {r.email}</p>
                      <p className="text-sm text-primary">{r.model} – Taille {r.size}</p>
                      {r.message && <p className="text-sm text-muted-foreground italic">{r.message}</p>}
                      <p className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString("fr-BE")}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteReservation(r.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "helmets" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl text-foreground">GESTION DES CASQUES</h2>
              <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Ajouter</Button>
            </div>
            <p className="text-muted-foreground">Gestion des casques disponible avec Lovable Cloud.</p>
          </div>
        )}

        {tab === "events" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl text-foreground">GESTION DES ÉVÉNEMENTS</h2>
              <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Créer</Button>
            </div>
            <p className="text-muted-foreground">Gestion des événements disponible avec Lovable Cloud.</p>
          </div>
        )}
      </div>
    </div>
  );
}
