import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LogOut, Package, Tag, CalendarDays, BookOpen, Settings, Loader2, HardHat } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AdminBrands from "@/components/admin/AdminBrands";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminEvents from "@/components/admin/AdminEvents";
import AdminReservations from "@/components/admin/AdminReservations";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminHelmetModels from "@/components/admin/AdminHelmetModels";

const tabs = [
  { id: "reservations", label: "Réservations", icon: BookOpen },
  { id: "helmets", label: "Casques Arai", icon: HardHat },
  { id: "brands", label: "Marques", icon: Tag },
  { id: "products", label: "Produits", icon: Package },
  { id: "events", label: "Événements", icon: CalendarDays },
  { id: "settings", label: "Paramètres", icon: Settings },
] as const;

type TabId = typeof tabs[number]["id"];

export default function AdminPage() {
  const { user, loading, isAdmin, signIn, signOut } = useAuth();
  const [tab, setTab] = useState<TabId>("reservations");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await signIn(email, password);
    setLoginLoading(false);
    if (error) toast.error("Connexion échouée: " + error.message);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-lg p-8 w-full max-w-sm">
          <h1 className="font-display text-3xl text-foreground text-center mb-2">ADMIN</h1>
          <p className="text-muted-foreground text-center text-sm mb-6">Panneau d'administration Desmet</p>
          {user && !isAdmin && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-destructive">Ce compte n'a pas les droits administrateur.</p>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-secondary border-border" />
            <Input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required className="bg-secondary border-border" />
            <Button type="submit" className="w-full" disabled={loginLoading}>
              {loginLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Connexion
            </Button>
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
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" /> Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(t => (
            <Button key={t.id} variant={tab === t.id ? "default" : "outline"} size="sm" onClick={() => setTab(t.id)} className="shrink-0">
              <t.icon className="w-4 h-4 mr-2" /> {t.label}
            </Button>
          ))}
        </div>

        {tab === "reservations" && <AdminReservations />}
        {tab === "brands" && <AdminBrands />}
        {tab === "products" && <AdminProducts />}
        {tab === "events" && <AdminEvents />}
        {tab === "settings" && <AdminSettings />}
      </div>
    </div>
  );
}
