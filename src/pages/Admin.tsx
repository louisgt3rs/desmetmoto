import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Link, Navigate } from "react-router-dom";
import { LogOut, Package, Tag, CalendarDays, BookOpen, Settings, Loader2, HardHat, ShieldCheck, ChevronLeft } from "lucide-react";
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
  const currentTab = useMemo(() => tabs.find((item) => item.id === tab), [tab]);

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      toast.error("Accès refusé : ce compte n'a pas les droits administrateur.");
    }
  }, [loading, user, isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await signIn(email, password);
    setLoginLoading(false);
    if (error) {
      toast.error("Connexion échouée: " + error.message);
      return;
    }

    toast.success("Connexion en cours...");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (!user) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.24),transparent_30%),linear-gradient(135deg,hsl(var(--background)),hsl(var(--card))_55%,hsl(var(--background)))]" />
        <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:px-8">
          <div className="hidden lg:block">
            <div className="max-w-xl space-y-6">
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <ChevronLeft className="h-4 w-4" /> Retour au site
              </Link>
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-secondary/50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Accès sécurisé
                </div>
                <h1 className="font-display text-6xl leading-none text-foreground">DESMET ADMIN</h1>
                <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
                  Connectez-vous pour gérer les produits, événements, marques et réservations depuis un seul espace.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/80 bg-card/70 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Catalogue</p>
                  <p className="mt-2 font-display text-2xl text-foreground">Produits</p>
                </div>
                <div className="rounded-2xl border border-border/80 bg-card/70 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Agenda</p>
                  <p className="mt-2 font-display text-2xl text-foreground">Événements</p>
                </div>
                <div className="rounded-2xl border border-border/80 bg-card/70 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Réseau</p>
                  <p className="mt-2 font-display text-2xl text-foreground">Marques</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="w-full max-w-md border-border/80 bg-card/95 shadow-2xl backdrop-blur-sm lg:ml-auto">
            <CardHeader className="space-y-3">
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground lg:hidden">
                <ChevronLeft className="h-4 w-4" /> Retour au site
              </Link>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className="font-display text-4xl text-foreground">Connexion admin</CardTitle>
                <CardDescription>
                  Utilisez votre compte administrateur pour accéder au tableau de bord.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="admin-email">Email</label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@desmetmoto.be"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="h-11 bg-secondary/70"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="admin-password">Mot de passe</label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="h-11 bg-secondary/70"
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" className="h-11 w-full" disabled={loginLoading}>
                  {loginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {loginLoading ? "Connexion..." : "Accéder au tableau de bord"}
                </Button>
              </form>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Seuls les comptes disposant du rôle administrateur peuvent entrer dans cet espace.
              </p>
            </CardContent>
          </Card>
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
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Tableau de bord</p>
            <h2 className="font-display text-4xl text-foreground">{currentTab?.label}</h2>
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(t => (
            <Button key={t.id} variant={tab === t.id ? "default" : "outline"} size="sm" onClick={() => setTab(t.id)} className="shrink-0">
              <t.icon className="w-4 h-4 mr-2" /> {t.label}
            </Button>
          ))}
        </div>

        {tab === "reservations" && <AdminReservations />}
        {tab === "helmets" && <AdminHelmetModels />}
        {tab === "brands" && <AdminBrands />}
        {tab === "products" && <AdminProducts />}
        {tab === "events" && <AdminEvents />}
        {tab === "settings" && <AdminSettings />}
      </div>
    </div>
  );
}
