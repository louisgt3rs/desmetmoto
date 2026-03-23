import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CalendarDays, MapPin, Pencil, Plus, Save, Search, Trash2, Users } from "lucide-react";
import { ImageUploadSingle } from "./ImageUpload";
import type { AdminEvent } from "./types";

interface AdminEventsProps {
  events: AdminEvent[];
  onRefresh: () => Promise<void>;
}

const formatDate = (date?: string | null) => {
  if (!date) return "DATE À CONFIRMER";
  return new Intl.DateTimeFormat("fr-BE", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(date)).toUpperCase();
};

export default function AdminEvents({ events, onRefresh }: AdminEventsProps) {
  const [editing, setEditing] = useState<AdminEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "",
    time: "",
    location: "",
    capacity: "0",
    registered_count: "0",
    image_url: "",
  });

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return events;

    return events.filter((event) =>
      [event.title, event.location, event.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [events, search]);

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("TITRE REQUIS"); return; }

    setSaving(true);
    const payload: any = {
      title: form.title,
      description: form.description || null,
      event_date: form.event_date || null,
      date: form.event_date || null,
      time: form.time || null,
      location: form.location || null,
      capacity: Number(form.capacity) || 0,
      registered_count: Number(form.registered_count) || 0,
      image_url: form.image_url || null,
      is_upcoming: !form.event_date || new Date(form.event_date) >= new Date(new Date().toDateString()),
      is_published: true,
    };

    if (editing) {
      const { error } = await supabase.from("events").update(payload).eq("id", editing.id);
      if (error) { setSaving(false); toast.error("ERREUR : " + error.message.toUpperCase()); return; }
      toast.success("ÉVÉNEMENT MODIFIÉ");
    } else {
      const { error } = await supabase.from("events").insert(payload);
      if (error) { setSaving(false); toast.error("ERREUR : " + error.message.toUpperCase()); return; }
      toast.success("ÉVÉNEMENT AJOUTÉ");
    }

    setSaving(false);
    cancel();
    await onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("SUPPRIMER CET ÉVÉNEMENT ?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) { toast.error("ERREUR : " + error.message.toUpperCase()); return; }
    toast.success("ÉVÉNEMENT SUPPRIMÉ");
    await onRefresh();
  };

  const startEdit = (event: AdminEvent) => {
    setEditing(event);
    setOpen(true);
    setForm({
      title: event.title,
      description: event.description || "",
      event_date: event.event_date || event.date || "",
      time: event.time || "",
      location: event.location || "",
      capacity: String(event.capacity || 0),
      registered_count: String(event.registered_count || 0),
      image_url: event.image_url || "",
    });
  };

  const startAdd = () => {
    setEditing(null);
    setOpen(true);
    setForm({ title: "", description: "", event_date: "", time: "", location: "", capacity: "0", registered_count: "0", image_url: "" });
  };

  const cancel = () => {
    setEditing(null);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="admin-card rounded-none p-5">
        <div className="mb-5 flex flex-col gap-4 border-b border-[hsl(var(--admin-accent)/0.2)] pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">AGENDA</p>
            <h2 className="font-adminDisplay text-3xl text-[hsl(var(--admin-foreground))]">ÉVÉNEMENTS ({events.length})</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--admin-muted-foreground))]" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="RECHERCHER UN ÉVÉNEMENT" className="admin-input pl-10" />
            </div>
            <Button onClick={startAdd} className="admin-button h-11 rounded-none px-5 font-adminDisplay text-sm tracking-[0.18em]">
              <Plus className="h-4 w-4" /> AJOUTER
            </Button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {filteredEvents.map((event) => {
            const registeredCount = Number(event.registered_count) || 0;
            const capacity = Number(event.capacity) || 0;
            const ratio = capacity > 0 ? Math.min(registeredCount / capacity, 1) : 0;
            const critical = ratio > 0.9;

            return (
              <article key={event.id} className="border border-[hsl(var(--admin-accent)/0.16)] bg-[hsl(var(--admin-background))] p-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  {event.image_url ? (
                    <img src={event.image_url} alt={event.title} className="h-28 w-full object-cover sm:w-36" />
                  ) : (
                    <div className="flex h-28 w-full items-center justify-center border border-[hsl(var(--admin-accent)/0.16)] bg-[hsl(var(--admin-card))] text-[hsl(var(--admin-muted-foreground))] sm:w-36">
                      <CalendarDays className="h-6 w-6" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="admin-kicker text-[11px] text-[hsl(var(--admin-accent))]">{formatDate(event.event_date || event.date)}</p>
                    <h3 className="font-adminDisplay text-2xl leading-tight text-[hsl(var(--admin-foreground))]">{event.title}</h3>
                    <div className="mt-3 space-y-2 text-xs uppercase tracking-[0.14em] text-[hsl(var(--admin-muted-foreground))]">
                      <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[hsl(var(--admin-accent))]" /> {event.time || "HEURE À CONFIRMER"}</p>
                      <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[hsl(var(--admin-accent))]" /> {event.location || "LIEU À CONFIRMER"}</p>
                      <p className="flex items-center gap-2"><Users className="h-4 w-4 text-[hsl(var(--admin-accent))]" /> {registeredCount} INSCRITS / {capacity} PLACES</p>
                    </div>
                    {event.description ? <p className="mt-3 line-clamp-2 text-sm uppercase tracking-[0.08em] text-[hsl(var(--admin-foreground))]">{event.description}</p> : null}
                    <div className="mt-4 space-y-2">
                      <div className="h-2 w-full bg-[hsl(var(--admin-card))]">
                        <div className={`h-full ${critical ? "bg-destructive" : "bg-[hsl(var(--admin-accent))]"}`} style={{ width: `${ratio * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button onClick={() => startEdit(event)} className="admin-button-secondary h-10 flex-1 rounded-none font-adminDisplay tracking-[0.16em]">MODIFIER</Button>
                  <Button onClick={() => handleDelete(event.id)} className="h-10 rounded-none border border-destructive/40 bg-transparent font-adminDisplay tracking-[0.16em] text-destructive hover:bg-destructive hover:text-destructive-foreground">SUPPRIMER</Button>
                </div>
              </article>
            );
          })}
        </div>

        {!filteredEvents.length ? <div className="mt-4 border border-dashed border-[hsl(var(--admin-accent)/0.18)] p-5 text-center text-sm uppercase tracking-[0.18em] text-[hsl(var(--admin-muted-foreground))]">AUCUN ÉVÉNEMENT TROUVÉ</div> : null}
      </div>

      <Dialog open={open} onOpenChange={(next) => !next ? cancel() : setOpen(true)}>
        <DialogContent className="admin-card max-w-3xl rounded-none border-[hsl(var(--admin-accent)/0.25)] bg-[hsl(var(--admin-card))] p-0 text-[hsl(var(--admin-foreground))]">
          <div className="border-b border-[hsl(var(--admin-accent)/0.18)] p-6">
            <DialogHeader>
              <DialogTitle className="font-adminDisplay text-3xl text-[hsl(var(--admin-foreground))]">{editing ? "MODIFIER ÉVÉNEMENT" : "AJOUTER ÉVÉNEMENT"}</DialogTitle>
              <DialogDescription className="text-sm uppercase tracking-[0.14em] text-[hsl(var(--admin-muted-foreground))]">
                PILOTEZ LES RENDEZ-VOUS DE LA COMMUNAUTÉ DESMET.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="grid gap-5 p-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">TITRE</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="BIKES & COFFEE — ÉDITION 1" className="admin-input" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">DESCRIPTION</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="DESCRIPTION COURTE" className="admin-input min-h-[120px]" />
            </div>
            <div className="space-y-2">
              <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">DATE</Label>
              <Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="admin-input" />
            </div>
            <div className="space-y-2">
              <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">HEURE</Label>
              <Input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="09:30" className="admin-input" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">LIEU</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="DESMET ÉQUIPEMENT — WAVRE" className="admin-input" />
            </div>
            <div className="space-y-2">
              <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">NB PLACES</Label>
              <Input type="number" min="0" step="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="admin-input" />
            </div>
            <div className="space-y-2">
              <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">INSCRITS</Label>
              <Input type="number" min="0" step="1" value={form.registered_count} onChange={(e) => setForm({ ...form, registered_count: e.target.value })} className="admin-input" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">URL IMAGE</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className="admin-input" />
            </div>
            <div className="md:col-span-2">
              <ImageUploadSingle value={form.image_url} onChange={(value) => setForm({ ...form, image_url: value })} folder="events" label="OU IMPORTER UNE IMAGE" previewClass="h-28 w-28" />
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-[hsl(var(--admin-accent)/0.18)] p-6 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={cancel} className="admin-button-secondary h-11 rounded-none px-5 font-adminDisplay tracking-[0.18em]">ANNULER</Button>
            <Button onClick={handleSave} disabled={saving} className="admin-button h-11 rounded-none px-5 font-adminDisplay tracking-[0.18em]">
              <Save className="h-4 w-4" /> {saving ? "ENREGISTREMENT..." : "ENREGISTRER"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
