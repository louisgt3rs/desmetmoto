import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Link, Navigate } from "react-router-dom";
import { CalendarDays, ChevronLeft, LayoutDashboard, Loader2, LogOut, Package, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminEvents from "@/components/admin/AdminEvents";
import type { AdminBrand, AdminEvent, AdminProduct } from "@/components/admin/types";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Produits", icon: Package },
  { id: "events", label: "Événements", icon: CalendarDays },
] as const;

type TabId = typeof tabs[number]["id"];

export default function AdminPage() {
  const { user, loading, isAdmin, signIn, signOut } = useAuth();
  const [tab, setTab] = useState<TabId>("dashboard");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [panelLoading, setPanelLoading] = useState(true);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const currentTab = useMemo(() => tabs.find((item) => item.id === tab), [tab]);

  const loadAdminData = async () => {
    if (!user || !isAdmin) return;

    setPanelLoading(true);
    const [{ data: productsData, error: productsError }, { data: eventsData, error: eventsError }, { data: brandsData, error: brandsError }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("events").select("*").order("event_date", { ascending: false, nullsFirst: false }),
      supabase.from("brands").select("*").order("name"),
    ]);

    if (productsError || eventsError || brandsError) {
      toast.error("IMPOSSIBLE DE CHARGER LE PANEL ADMIN");
    } else {
      setProducts((productsData || []) as AdminProduct[]);
      setEvents((eventsData || []) as AdminEvent[]);
      setBrands(brandsData || []);
    }

    setPanelLoading(false);
  };

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      toast.error("ACCÈS REFUSÉ : COMPTE NON ADMINISTRATEUR");
    }
  }, [loading, user, isAdmin]);

  useEffect(() => {
    void loadAdminData();
  }, [user, isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await signIn(email, password);
    setLoginLoading(false);
    if (error) {
      toast.error("CONNEXION ÉCHOUÉE : " + error.message.toUpperCase());
      return;
    }

    toast.success("CONNEXION ADMIN VALIDÉE");
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.18),transparent_32%),linear-gradient(180deg,hsl(var(--admin-background)),hsl(var(--background))_55%,hsl(var(--admin-background)))]" />
        <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:px-8">
          <div className="hidden lg:block">
            <div className="max-w-xl space-y-6 text-[hsl(var(--admin-foreground))]">
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <ChevronLeft className="h-4 w-4" /> Retour au site
              </Link>
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 border border-[hsl(var(--admin-accent)/0.24)] bg-[hsl(var(--admin-card))] px-4 py-2 text-xs uppercase tracking-[0.28em] text-[hsl(var(--admin-muted-foreground))]">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Accès sécurisé
                </div>
                <h1 className="font-adminDisplay text-6xl leading-none text-[hsl(var(--admin-foreground))]">
                  DESMET <span className="text-[hsl(var(--admin-accent))]">ÉQUIPEMENT</span>
                </h1>
                <p className="max-w-lg text-base uppercase leading-relaxed tracking-[0.12em] text-[hsl(var(--admin-muted-foreground))]">
                  CONNECTEZ-VOUS POUR PILOTER LE CATALOGUE ET LES ÉVÉNEMENTS DE LA BOUTIQUE PREMIUM.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="border border-[hsl(var(--admin-accent)/0.18)] bg-[hsl(var(--admin-card))] p-4">
                  <p className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">Catalogue</p>
                  <p className="mt-2 font-adminDisplay text-2xl text-[hsl(var(--admin-foreground))]">Produits</p>
                </div>
                <div className="border border-[hsl(var(--admin-accent)/0.18)] bg-[hsl(var(--admin-card))] p-4">
                  <p className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">Agenda</p>
                  <p className="mt-2 font-adminDisplay text-2xl text-[hsl(var(--admin-foreground))]">Événements</p>
                </div>
                <div className="border border-[hsl(var(--admin-accent)/0.18)] bg-[hsl(var(--admin-card))] p-4">
                  <p className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">Analyse</p>
                  <p className="mt-2 font-adminDisplay text-2xl text-[hsl(var(--admin-foreground))]">Dashboard</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="admin-card w-full max-w-md rounded-none border-[hsl(var(--admin-accent)/0.2)] bg-[hsl(var(--admin-card))] shadow-2xl lg:ml-auto">
            <CardHeader className="space-y-3">
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground lg:hidden">
                <ChevronLeft className="h-4 w-4" /> Retour au site
              </Link>
              <div className="inline-flex h-12 w-12 items-center justify-center border border-[hsl(var(--admin-accent)/0.25)] bg-[hsl(var(--admin-accent)/0.08)] text-[hsl(var(--admin-accent))]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className="font-adminDisplay text-4xl text-[hsl(var(--admin-foreground))]">DESMET <span className="text-[hsl(var(--admin-accent))]">ÉQUIPEMENT</span></CardTitle>
                <CardDescription className="uppercase tracking-[0.12em] text-[hsl(var(--admin-muted-foreground))]">
                  UTILISEZ VOTRE COMPTE ADMINISTRATEUR POUR ACCÉDER AU PANEL.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="admin-kicker text-sm text-[hsl(var(--admin-muted-foreground))]" htmlFor="admin-email">EMAIL</label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@desmetmoto.be"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="admin-input h-11"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="admin-kicker text-sm text-[hsl(var(--admin-muted-foreground))]" htmlFor="admin-password">MOT DE PASSE</label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="admin-input h-11"
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" className="admin-button h-11 w-full rounded-none font-adminDisplay tracking-[0.18em]" disabled={loginLoading}>
                  {loginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {loginLoading ? "CONNEXION..." : "ACCÉDER AU PANEL"}
                </Button>
              </form>
              <p className="mt-4 text-sm uppercase leading-relaxed tracking-[0.12em] text-[hsl(var(--admin-muted-foreground))]">
                LA SESSION RESTE ACTIVE APRÈS RAFRAÎCHISSEMENT TANT QUE LE COMPTE EST CONNECTÉ.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col md:flex-row">
        <aside className="border-b border-[hsl(var(--admin-accent)/0.2)] bg-[hsl(var(--admin-card))] md:min-h-screen md:w-[280px] md:border-b-0 md:border-r">
          <div className="p-6">
            <p className="font-adminDisplay text-3xl leading-none text-[hsl(var(--admin-foreground))]">DESMET</p>
            <p className="font-adminDisplay text-3xl leading-none text-[hsl(var(--admin-accent))]">ÉQUIPEMENT</p>
            <div className="mt-4 h-px w-full bg-[hsl(var(--admin-accent)/0.2)]" />
            <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[hsl(var(--admin-muted-foreground))]">ADMIN PANEL</p>
          </div>

          <nav className="flex gap-2 overflow-x-auto px-4 pb-4 md:flex-col md:px-6 md:pb-6">
            {tabs.map((t) => (
              <Button
                key={t.id}
                variant="ghost"
                onClick={() => setTab(t.id)}
                className={`h-12 min-w-fit justify-start rounded-none border px-4 font-adminDisplay tracking-[0.18em] md:w-full ${tab === t.id ? "border-[hsl(var(--admin-accent)/0.28)] bg-[hsl(var(--admin-accent)/0.12)] text-[hsl(var(--admin-accent))]" : "border-transparent bg-transparent text-[hsl(var(--admin-foreground))] hover:border-[hsl(var(--admin-accent)/0.16)] hover:bg-[hsl(var(--admin-accent)/0.05)] hover:text-[hsl(var(--admin-accent))]"}`}
              >
                <t.icon className="mr-2 h-4 w-4" /> {t.label.toUpperCase()}
              </Button>
            ))}
          </nav>

          <div className="px-4 pb-6 md:mt-auto md:px-6">
            <div className="mb-4 h-px w-full bg-[hsl(var(--admin-accent)/0.2)]" />
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[hsl(var(--admin-muted-foreground))] break-all">{user.email}</p>
            <Button onClick={signOut} className="admin-button-secondary h-11 w-full rounded-none font-adminDisplay tracking-[0.18em]">
              <LogOut className="h-4 w-4" /> DÉCONNEXION
            </Button>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-6 border-b border-[hsl(var(--admin-accent)/0.2)] pb-5">
            <p className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">DESMET ÉQUIPEMENT</p>
            <h2 className="font-adminDisplay text-4xl text-[hsl(var(--admin-foreground))]">{currentTab?.label.toUpperCase()}</h2>
          </div>

          {panelLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center border border-[hsl(var(--admin-accent)/0.16)] bg-[hsl(var(--admin-card))]">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--admin-accent))]" />
            </div>
          ) : (
            <>
              {tab === "dashboard" && <AdminDashboard products={products} events={events} />}
              {tab === "products" && <AdminProducts products={products} brands={brands} onRefresh={loadAdminData} />}
              {tab === "events" && <AdminEvents events={events} onRefresh={loadAdminData} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
