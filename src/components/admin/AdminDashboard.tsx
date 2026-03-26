import { CalendarDays, Euro, Package, Users } from "lucide-react";
import type { AdminEvent, AdminProduct } from "./types";

interface AdminDashboardProps {
  events: AdminEvent[];
  products: AdminProduct[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);

const formatDate = (value?: string | null) => {
  if (!value) return "DATE À CONFIRMER";
  return new Intl.DateTimeFormat("fr-BE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
};

export default function AdminDashboard({ events, products }: AdminDashboardProps) {
  const stockValue = products.reduce((sum, product) => sum + (Number(product.price) || 0) * (Number(product.stock_quantity) || 0), 0);
  const totalRegistered = events.reduce((sum, event) => sum + (Number(event.registered_count) || 0), 0);

  const latestEntries = [
    ...products.map((product) => ({
      id: product.id,
      type: "PRODUIT",
      title: product.name,
      meta: `${product.brand || "MARQUE"} • ${product.category || "—"}`,
      date: product.created_at,
    })),
    ...events.map((event) => ({
      id: event.id,
      type: "ÉVÉNEMENT",
      title: event.title,
      meta: `${formatDate(event.event_date || event.date)} • ${event.location || "LIEU À CONFIRMER"}`,
      date: event.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const stats = [
    { label: "NB PRODUITS", value: products.length, icon: Package },
    { label: "VALEUR STOCK", value: formatCurrency(stockValue), icon: Euro },
    { label: "NB ÉVÉNEMENTS", value: events.length, icon: CalendarDays },
    { label: "TOTAL INSCRITS", value: totalRegistered, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        {stats.map((stat) => (
          <article key={stat.label} className="admin-card rounded-none p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">{stat.label}</p>
                <p className="mt-3 font-adminDisplay text-3xl text-[hsl(var(--admin-foreground))]">{stat.value}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center border border-[hsl(var(--admin-accent)/0.35)] bg-[hsl(var(--admin-accent)/0.08)] text-[hsl(var(--admin-accent))]">
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="h-px w-full bg-[hsl(var(--admin-accent)/0.2)]" />
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="admin-card rounded-none p-5">
          <div className="mb-5 flex items-end justify-between gap-4 border-b border-[hsl(var(--admin-accent)/0.2)] pb-4">
            <div>
              <p className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">TABLEAU DE BORD</p>
              <h3 className="font-adminDisplay text-2xl text-[hsl(var(--admin-foreground))]">APERÇU OPÉRATIONNEL</h3>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border border-[hsl(var(--admin-accent)/0.18)] bg-[hsl(var(--admin-background))] p-4">
              <p className="admin-kicker text-[11px] text-[hsl(var(--admin-muted-foreground))]">STOCK ACTIF</p>
              <p className="mt-3 font-adminDisplay text-4xl text-[hsl(var(--admin-foreground))]">
                {products.filter((product) => (product.stock_quantity || 0) > 0).length}
              </p>
            </div>
            <div className="border border-[hsl(var(--admin-accent)/0.18)] bg-[hsl(var(--admin-background))] p-4">
              <p className="admin-kicker text-[11px] text-[hsl(var(--admin-muted-foreground))]">ÉVÉNEMENTS À VENIR</p>
              <p className="mt-3 font-adminDisplay text-4xl text-[hsl(var(--admin-foreground))]">
                {events.filter((event) => event.is_upcoming !== false).length}
              </p>
            </div>
          </div>
        </article>

        <article className="admin-card rounded-none p-5">
          <div className="mb-5 border-b border-[hsl(var(--admin-accent)/0.2)] pb-4">
            <p className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">DERNIERS AJOUTS</p>
            <h3 className="font-adminDisplay text-2xl text-[hsl(var(--admin-foreground))]">ACTIVITÉ RÉCENTE</h3>
          </div>

          <div className="space-y-3">
            {latestEntries.length ? (
              latestEntries.map((entry) => (
                <div key={`${entry.type}-${entry.id}`} className="border border-[hsl(var(--admin-accent)/0.16)] bg-[hsl(var(--admin-background))] p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="admin-kicker text-[11px] text-[hsl(var(--admin-accent))]">{entry.type}</span>
                  </div>
                  <p className="font-adminDisplay text-lg leading-tight text-[hsl(var(--admin-foreground))]">{entry.title}</p>
                  <p className="mt-2 text-sm uppercase tracking-[0.16em] text-[hsl(var(--admin-muted-foreground))]">{entry.meta}</p>
                </div>
              ))
            ) : (
              <div className="border border-dashed border-[hsl(var(--admin-accent)/0.2)] p-5 text-sm uppercase tracking-[0.16em] text-[hsl(var(--admin-muted-foreground))]">
                AUCUNE ACTIVITÉ POUR LE MOMENT
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
