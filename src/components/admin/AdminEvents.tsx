import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CalendarDays, Download, MapPin, Pencil, Plus, Save, Search, Trash2, Users } from "lucide-react";
import { ImageUploadSingle } from "./ImageUpload";
import type { AdminEvent } from "./types";

interface AdminEventsProps {
  events: AdminEvent[];
  onRefresh: () => Promise<void>;
}

type SlotConfig = {
  id: string;
  event_id: string;
  date: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
  capacity: number | null;
  note: string | null;
  created_at: string;
};

type SlotItem = {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
};

type SlotBooking = {
  id: string;
  event_id: string;
  slot_item_id: string;
  date: string;
  slot_time: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  newsletter_consent: boolean;
  created_at: string;
};


const normalizeTime = (t: string) => t.slice(0, 5);

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

  // Tab state
  const [activeTab, setActiveTab] = useState<"info" | "slots" | "bookings">("info");

  // Slot configs state
  const [configs, setConfigs] = useState<SlotConfig[]>([]);
  const [scheduleForm, setScheduleForm] = useState({ date_from: "", date_to: "", start_time: "", end_time: "", slot_duration_minutes: "30" });
  const [generatingSlots, setGeneratingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotConfig | null>(null);
  const [slotEditForm, setSlotEditForm] = useState({ is_active: true, capacity: "", note: "" });
  const [savingSlot, setSavingSlot] = useState(false);

  // Slot items state
  const [items, setItems] = useState<SlotItem[]>([]);
  const [itemForm, setItemForm] = useState({ name: "", description: "", image_url: "" });
  const [savingItem, setSavingItem] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState<SlotBooking[]>([]);
  const [bookingFilterDate, setBookingFilterDate] = useState("");
  const [bookingFilterItem, setBookingFilterItem] = useState("");
  const [loadingBookings, setLoadingBookings] = useState(false);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return events;
    return events.filter((event) =>
      [event.title, event.location, event.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [events, search]);

  const loadSlotsData = async (eventId: string) => {
    const [configsRes, itemsRes] = await Promise.all([
      supabase.from("event_slots_config").select("*").eq("event_id", eventId).order("date").order("start_time"),
      supabase.from("event_slot_items").select("*").eq("event_id", eventId).order("created_at"),
    ]);
    if (configsRes.data) setConfigs(configsRes.data as SlotConfig[]);
    if (itemsRes.data) setItems(itemsRes.data as SlotItem[]);
  };

  const loadBookings = async (eventId: string) => {
    setLoadingBookings(true);
    const { data } = await supabase
      .from("event_slot_bookings")
      .select("*")
      .eq("event_id", eventId)
      .order("date")
      .order("slot_time");
    setBookings((data as SlotBooking[]) || []);
    setLoadingBookings(false);
  };

  useEffect(() => {
    if (editing?.id) {
      loadSlotsData(editing.id);
    }
  }, [editing?.id]);

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
    setActiveTab("info");
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
    setActiveTab("info");
    setForm({ title: "", description: "", event_date: "", time: "", location: "", capacity: "0", registered_count: "0", image_url: "" });
  };

  const cancel = () => {
    setEditing(null);
    setOpen(false);
    setActiveTab("info");
    setConfigs([]);
    setScheduleForm({ date_from: "", date_to: "", start_time: "", end_time: "", slot_duration_minutes: "30" });
    setGeneratingSlots(false);
    setSelectedSlot(null);
    setSlotEditForm({ is_active: true, capacity: "", note: "" });
    setItems([]);
    setItemForm({ name: "", description: "", image_url: "" });
    setBookings([]);
    setBookingFilterDate("");
    setBookingFilterItem("");
  };

  const handleGenerateSlots = async () => {
    if (!editing) return;
    const { date_from, date_to, start_time, end_time, slot_duration_minutes } = scheduleForm;
    if (!date_from || !date_to || !start_time || !end_time) {
      toast.error("TOUS LES CHAMPS SONT REQUIS");
      return;
    }
    const duration = Number(slot_duration_minutes) || 30;
    const toMins = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const fromMins = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    const startMins = toMins(start_time);
    const endMins = toMins(end_time);
    if (endMins <= startMins) { toast.error("L'HEURE DE FIN DOIT ÊTRE APRÈS L'HEURE DE DÉBUT"); return; }

    const dates: string[] = [];
    const cur = new Date(date_from);
    const last = new Date(date_to);
    while (cur <= last) { dates.push(cur.toISOString().split("T")[0]); cur.setDate(cur.getDate() + 1); }

    const existing = new Set(configs.map(c => `${c.date}|${normalizeTime(c.start_time)}`));
    const rows: { event_id: string; date: string; start_time: string; end_time: string; slot_duration_minutes: number; is_active: boolean }[] = [];
    for (const date of dates) {
      for (let t = startMins; t + duration <= endMins; t += duration) {
        const slotTime = fromMins(t);
        if (!existing.has(`${date}|${slotTime}`)) {
          rows.push({ event_id: editing.id, date, start_time: slotTime, end_time: fromMins(t + duration), slot_duration_minutes: duration, is_active: true });
        }
      }
    }

    if (rows.length === 0) { toast.info("TOUS LES CRÉNEAUX EXISTENT DÉJÀ"); return; }
    setGeneratingSlots(true);
    const { error } = await supabase.from("event_slots_config").insert(rows);
    setGeneratingSlots(false);
    if (error) { toast.error("ERREUR : " + error.message.toUpperCase()); return; }
    toast.success(`${rows.length} CRÉNEAUX GÉNÉRÉS`);
    await loadSlotsData(editing.id);
  };

  const handleSaveSlot = async () => {
    if (!selectedSlot || !editing) return;
    setSavingSlot(true);
    const { error } = await supabase.from("event_slots_config").update({
      is_active: slotEditForm.is_active,
      capacity: slotEditForm.capacity ? Number(slotEditForm.capacity) : null,
      note: slotEditForm.note || null,
    }).eq("id", selectedSlot.id);
    setSavingSlot(false);
    if (error) { toast.error("ERREUR : " + error.message.toUpperCase()); return; }
    toast.success("CRÉNEAU MODIFIÉ");
    setSelectedSlot(null);
    await loadSlotsData(editing.id);
  };

  const handleDeleteSelectedSlot = async () => {
    if (!selectedSlot || !editing) return;
    if (!confirm("SUPPRIMER CE CRÉNEAU ?")) return;
    const { error } = await supabase.from("event_slots_config").delete().eq("id", selectedSlot.id);
    if (error) { toast.error("ERREUR : " + error.message.toUpperCase()); return; }
    toast.success("CRÉNEAU SUPPRIMÉ");
    setSelectedSlot(null);
    await loadSlotsData(editing.id);
  };

  const handleDeleteConfig = async (id: string) => {
    if (!editing) return;
    if (!confirm("SUPPRIMER CE CRÉNEAU ?")) return;
    const { error } = await supabase.from("event_slots_config").delete().eq("id", id);
    if (error) { toast.error("ERREUR : " + error.message.toUpperCase()); return; }
    toast.success("CRÉNEAU SUPPRIMÉ");
    await loadSlotsData(editing.id);
  };

  const handleAddItem = async () => {
    if (!editing) return;
    if (!itemForm.name.trim()) { toast.error("NOM REQUIS"); return; }
    setSavingItem(true);
    const { error } = await supabase.from("event_slot_items").insert({
      event_id: editing.id,
      name: itemForm.name,
      description: itemForm.description || null,
      image_url: itemForm.image_url || null,
    });
    setSavingItem(false);
    if (error) { toast.error("ERREUR : " + error.message.toUpperCase()); return; }
    toast.success("RESSOURCE AJOUTÉE");
    setItemForm({ name: "", description: "", image_url: "" });
    await loadSlotsData(editing.id);
  };

  const handleDeleteItem = async (id: string) => {
    if (!editing) return;
    if (!confirm("SUPPRIMER CETTE RESSOURCE ?")) return;
    const { error } = await supabase.from("event_slot_items").delete().eq("id", id);
    if (error) { toast.error("ERREUR : " + error.message.toUpperCase()); return; }
    toast.success("RESSOURCE SUPPRIMÉE");
    await loadSlotsData(editing.id);
  };

  const handleToggleItem = async (id: string, current: boolean) => {
    if (!editing) return;
    const { error } = await supabase.from("event_slot_items").update({ is_active: !current }).eq("id", id);
    if (error) { toast.error("ERREUR : " + error.message.toUpperCase()); return; }
    await loadSlotsData(editing.id);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as "info" | "slots" | "bookings");
    if (tab === "bookings" && editing?.id && bookings.length === 0) {
      loadBookings(editing.id);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (bookingFilterDate && b.date !== bookingFilterDate) return false;
      if (bookingFilterItem && b.slot_item_id !== bookingFilterItem) return false;
      return true;
    });
  }, [bookings, bookingFilterDate, bookingFilterItem]);

  const totalSlots = useMemo(() => {
    const activeItemCount = items.filter(i => i.is_active).length;
    const activeConfigCount = configs.filter(c => c.is_active).length;
    return activeConfigCount * activeItemCount;
  }, [configs, items]);

  const calendarData = useMemo(() => {
    const dates = [...new Set(configs.map(c => c.date))].sort();
    const times = [...new Set(configs.map(c => normalizeTime(c.start_time)))].sort();
    const map = new Map(configs.map(c => [`${c.date}|${normalizeTime(c.start_time)}`, c]));
    return { dates, times, map };
  }, [configs]);

  const uniqueBookingDates = useMemo(() => {
    return [...new Set(bookings.map(b => b.date))].sort();
  }, [bookings]);

  const exportCSV = () => {
    const headers = ["DATE", "CRÉNEAU", "RESSOURCE", "PRÉNOM", "NOM", "EMAIL", "TÉLÉPHONE", "NEWSLETTER", "INSCRIT LE"];
    const rows = filteredBookings.map(b => [
      b.date,
      normalizeTime(b.slot_time),
      items.find(i => i.id === b.slot_item_id)?.name || "",
      b.first_name,
      b.last_name,
      b.email,
      b.phone,
      b.newsletter_consent ? "OUI" : "NON",
      new Date(b.created_at).toLocaleDateString("fr-BE"),
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservations-${editing?.title?.replace(/[^a-z0-9]/gi, "-").toLowerCase() || "event"}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formGrid = (
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
  );

  const saveButtons = (
    <div className="flex flex-col gap-3 border-t border-[hsl(var(--admin-accent)/0.18)] p-6 sm:flex-row sm:justify-end">
      <Button variant="outline" onClick={cancel} className="admin-button-secondary h-11 rounded-none px-5 font-adminDisplay tracking-[0.18em]">ANNULER</Button>
      <Button onClick={handleSave} disabled={saving} className="admin-button h-11 rounded-none px-5 font-adminDisplay tracking-[0.18em]">
        <Save className="h-4 w-4" /> {saving ? "ENREGISTREMENT..." : "ENREGISTRER"}
      </Button>
    </div>
  );

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
        <DialogContent className={`admin-card rounded-none border-[hsl(var(--admin-accent)/0.25)] bg-[hsl(var(--admin-card))] p-0 text-[hsl(var(--admin-foreground))] ${editing ? "max-w-5xl" : "max-w-3xl"}`}>
          <div className="border-b border-[hsl(var(--admin-accent)/0.18)] p-6">
            <DialogHeader>
              <DialogTitle className="font-adminDisplay text-3xl text-[hsl(var(--admin-foreground))]">{editing ? "MODIFIER ÉVÉNEMENT" : "AJOUTER ÉVÉNEMENT"}</DialogTitle>
              <DialogDescription className="text-sm uppercase tracking-[0.14em] text-[hsl(var(--admin-muted-foreground))]">
                PILOTEZ LES RENDEZ-VOUS DE LA COMMUNAUTÉ DESMET.
              </DialogDescription>
            </DialogHeader>
          </div>

          {!editing ? (
            <>
              {formGrid}
              {saveButtons}
            </>
          ) : (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col">
              <div className="border-b border-[hsl(var(--admin-accent)/0.18)] px-6">
                <TabsList className="h-auto gap-0 rounded-none bg-transparent p-0">
                  {(["info", "slots", "bookings"] as const).map((tab) => {
                    const labels: Record<string, string> = { info: "INFORMATIONS", slots: "CRÉNEAUX & RESSOURCES", bookings: "RÉSERVATIONS" };
                    return (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className="rounded-none border-b-2 border-transparent px-5 py-3 font-adminDisplay text-sm tracking-[0.14em] text-[hsl(var(--admin-muted-foreground))] data-[state=active]:border-[hsl(var(--admin-accent))] data-[state=active]:bg-transparent data-[state=active]:text-[hsl(var(--admin-accent))]"
                      >
                        {labels[tab]}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              <TabsContent value="info" className="m-0 max-h-[70vh] overflow-y-auto">
                {formGrid}
                {saveButtons}
              </TabsContent>

              <TabsContent value="slots" className="m-0 max-h-[70vh] overflow-y-auto">
                <div className="space-y-0">

                  {/* Section A: Generator */}
                  <div className="border-b border-[hsl(var(--admin-accent)/0.15)] p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="h-px flex-1 bg-[hsl(var(--admin-accent)/0.15)]" />
                      <p className="font-adminDisplay text-[10px] tracking-[0.22em] text-[hsl(var(--admin-accent))]">CONFIGURATION DU PLANNING</p>
                      <div className="h-px flex-1 bg-[hsl(var(--admin-accent)/0.15)]" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                      <div className="space-y-1.5">
                        <Label className="admin-kicker text-[10px] tracking-[0.18em] text-[hsl(var(--admin-muted-foreground))]">DATE DE DÉBUT</Label>
                        <Input type="date" value={scheduleForm.date_from} onChange={(e) => setScheduleForm({ ...scheduleForm, date_from: e.target.value })} className="admin-input h-10" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="admin-kicker text-[10px] tracking-[0.18em] text-[hsl(var(--admin-muted-foreground))]">DATE DE FIN</Label>
                        <Input type="date" value={scheduleForm.date_to} onChange={(e) => setScheduleForm({ ...scheduleForm, date_to: e.target.value })} className="admin-input h-10" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="admin-kicker text-[10px] tracking-[0.18em] text-[hsl(var(--admin-muted-foreground))]">OUVERTURE</Label>
                        <Input type="time" value={scheduleForm.start_time} onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })} className="admin-input h-10" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="admin-kicker text-[10px] tracking-[0.18em] text-[hsl(var(--admin-muted-foreground))]">FERMETURE</Label>
                        <Input type="time" value={scheduleForm.end_time} onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })} className="admin-input h-10" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="admin-kicker text-[10px] tracking-[0.18em] text-[hsl(var(--admin-muted-foreground))]">DURÉE (MIN)</Label>
                        <Input type="number" min="5" step="5" value={scheduleForm.slot_duration_minutes} onChange={(e) => setScheduleForm({ ...scheduleForm, slot_duration_minutes: e.target.value })} className="admin-input h-10" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <Button onClick={handleGenerateSlots} disabled={generatingSlots} className="admin-button h-11 rounded-none px-6 font-adminDisplay text-sm tracking-[0.2em]">
                        {generatingSlots ? (
                          <span className="flex items-center gap-2">
                            <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                            GÉNÉRATION...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2"><Plus className="h-4 w-4" />GÉNÉRER LES CRÉNEAUX</span>
                        )}
                      </Button>
                      {configs.length > 0 && (
                        <p className="text-[11px] uppercase tracking-[0.14em] text-[hsl(var(--admin-muted-foreground))]">
                          <span className="text-[#c9973a]">{configs.filter(c => c.is_active).length} ACTIFS</span>
                          {" / "}{configs.length} TOTAL
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Section B: Calendar grid */}
                  {configs.length > 0 ? (
                    <div className="p-6">
                      <div className="overflow-x-auto">
                        <table className="border-collapse" style={{ minWidth: "max-content" }}>
                          <thead>
                            <tr>
                              <th className="sticky left-0 z-10 bg-[hsl(var(--admin-card))] w-32 min-w-[128px] pr-4 pb-3 text-left font-adminDisplay text-[10px] uppercase tracking-[0.15em] text-[hsl(var(--admin-muted-foreground))]">JOUR</th>
                              {calendarData.times.map(t => (
                                <th key={t} className="pb-3 px-1 font-adminDisplay text-[11px] uppercase tracking-[0.1em] text-[hsl(var(--admin-muted-foreground))] text-center w-16 min-w-[64px]">{t}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {calendarData.dates.map(date => {
                              const d = new Date(date + "T00:00:00");
                              const weekday = d.toLocaleDateString("fr-BE", { weekday: "short" }).toUpperCase();
                              const dayNum = d.toLocaleDateString("fr-BE", { day: "2-digit", month: "2-digit" });
                              return (
                                <tr key={date}>
                                  <td className="sticky left-0 z-10 bg-[hsl(var(--admin-card))] pr-4 py-1 whitespace-nowrap">
                                    <div className="leading-none">
                                      <p className="font-adminDisplay text-[11px] tracking-[0.12em] text-[hsl(var(--admin-foreground))]">{weekday}</p>
                                      <p className="mt-0.5 text-[10px] tracking-[0.08em] text-[hsl(var(--admin-muted-foreground))]">{dayNum}</p>
                                    </div>
                                  </td>
                                  {calendarData.times.map(time => {
                                    const slot = calendarData.map.get(`${date}|${time}`);
                                    if (!slot) return (
                                      <td key={time} className="px-1 py-1">
                                        <div className="h-12 w-14 border border-dashed border-[hsl(var(--admin-accent)/0.08)]" />
                                      </td>
                                    );
                                    const isSelected = selectedSlot?.id === slot.id;
                                    const isActive = slot.is_active;
                                    const hasNote = Boolean(slot.note);
                                    return (
                                      <td key={time} className="px-1 py-1">
                                        <button
                                          onClick={() => {
                                            if (isSelected) { setSelectedSlot(null); }
                                            else { setSelectedSlot(slot); setSlotEditForm({ is_active: slot.is_active, capacity: String(slot.capacity ?? ""), note: slot.note ?? "" }); }
                                          }}
                                          title={`${date} ${time}${slot.note ? ` — ${slot.note}` : ""}${slot.capacity ? ` (cap. ${slot.capacity})` : ""}`}
                                          className={`relative flex h-12 w-14 cursor-pointer flex-col items-center justify-center gap-0.5 border font-adminDisplay text-[10px] tracking-[0.06em] transition-all duration-150 ${
                                            isSelected
                                              ? "border-white bg-white text-[#0e0e0e] shadow-[0_0_12px_rgba(255,255,255,0.12)]"
                                              : isActive
                                              ? "border-[#c9973a] bg-[#c9973a]/10 text-[#c9973a] hover:bg-[#c9973a]/20 hover:shadow-[0_0_8px_rgba(201,151,58,0.18)]"
                                              : "border-[hsl(var(--admin-accent)/0.18)] bg-transparent text-[hsl(var(--admin-muted-foreground))] opacity-35 hover:opacity-60"
                                          }`}
                                        >
                                          <span className="text-[13px]">{isActive ? "●" : "○"}</span>
                                          {hasNote && (
                                            <span className="absolute right-1 top-1 h-1 w-1 rounded-full bg-current opacity-70" />
                                          )}
                                        </button>
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Legend */}
                      <div className="mt-3 flex items-center gap-5 text-[10px] uppercase tracking-[0.12em] text-[hsl(var(--admin-muted-foreground))]">
                        <span className="flex items-center gap-1.5">
                          <span className="inline-block h-3 w-3 border border-[#c9973a] bg-[#c9973a]/10" />
                          ACTIF
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="inline-block h-3 w-3 border border-[hsl(var(--admin-accent)/0.18)] opacity-35" />
                          INACTIF
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="inline-block h-3 w-3 border border-white bg-white" />
                          SÉLECTIONNÉ
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="relative inline-block h-3 w-3 border border-[hsl(var(--admin-accent)/0.3)]">
                            <span className="absolute right-0 top-0 h-1 w-1 rounded-full bg-current opacity-70" />
                          </span>
                          NOTE
                        </span>
                      </div>

                      {/* Inline slot edit panel */}
                      {selectedSlot && (
                        <div className="mt-5 border border-[#c9973a]/30 bg-[#0e0e0e]">
                          <div className="flex items-center justify-between border-b border-[#c9973a]/20 px-5 py-3">
                            <div className="flex items-center gap-3">
                              <span className="h-4 w-0.5 bg-[#c9973a]" />
                              <p className="font-adminDisplay text-sm tracking-[0.14em] text-[#c9973a]">
                                CRÉNEAU — {new Date(selectedSlot.date + "T00:00:00").toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()} · {normalizeTime(selectedSlot.start_time)} → {normalizeTime(selectedSlot.end_time)}
                              </p>
                            </div>
                            <button
                              onClick={() => setSelectedSlot(null)}
                              className="text-[10px] uppercase tracking-[0.14em] text-[hsl(var(--admin-muted-foreground))] transition-colors hover:text-[hsl(var(--admin-foreground))]"
                            >
                              ✕ FERMER
                            </button>
                          </div>
                          <div className="p-5">
                            <div className="grid gap-4 sm:grid-cols-3">
                              <div className="space-y-2">
                                <Label className="admin-kicker text-[10px] tracking-[0.18em] text-[hsl(var(--admin-muted-foreground))]">STATUT</Label>
                                <button
                                  onClick={() => setSlotEditForm(f => ({ ...f, is_active: !f.is_active }))}
                                  className={`h-11 w-full border font-adminDisplay text-xs tracking-[0.16em] transition-all duration-150 ${
                                    slotEditForm.is_active
                                      ? "border-[#c9973a] bg-[#c9973a]/10 text-[#c9973a] hover:bg-[#c9973a]/20"
                                      : "border-[hsl(var(--admin-accent)/0.2)] bg-transparent text-[hsl(var(--admin-muted-foreground))] hover:border-[hsl(var(--admin-accent)/0.4)]"
                                  }`}
                                >
                                  {slotEditForm.is_active ? "● ACTIF" : "○ INACTIF"}
                                </button>
                              </div>
                              <div className="space-y-2">
                                <Label className="admin-kicker text-[10px] tracking-[0.18em] text-[hsl(var(--admin-muted-foreground))]">CAPACITÉ</Label>
                                <Input type="number" min="1" step="1" value={slotEditForm.capacity} onChange={(e) => setSlotEditForm(f => ({ ...f, capacity: e.target.value }))} placeholder="PAR DÉFAUT" className="admin-input h-11" />
                              </div>
                              <div className="space-y-2">
                                <Label className="admin-kicker text-[10px] tracking-[0.18em] text-[hsl(var(--admin-muted-foreground))]">NOTE INTERNE</Label>
                                <Input value={slotEditForm.note} onChange={(e) => setSlotEditForm(f => ({ ...f, note: e.target.value }))} placeholder="EX : RÉSERVÉ STAFF" className="admin-input h-11" />
                              </div>
                            </div>
                            <div className="mt-4 flex items-center gap-3">
                              <Button onClick={handleSaveSlot} disabled={savingSlot} className="admin-button h-10 rounded-none px-5 font-adminDisplay text-xs tracking-[0.16em]">
                                <Save className="h-3 w-3" /> {savingSlot ? "ENREGISTREMENT..." : "ENREGISTRER"}
                              </Button>
                              <Button onClick={handleDeleteSelectedSlot} className="h-10 rounded-none border border-destructive/40 bg-transparent px-4 font-adminDisplay text-xs tracking-[0.14em] text-destructive hover:bg-destructive hover:text-destructive-foreground">
                                <Trash2 className="h-3 w-3" /> SUPPRIMER CE CRÉNEAU
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="px-6 py-8">
                      <div className="border border-dashed border-[hsl(var(--admin-accent)/0.2)] p-8 text-center">
                        <p className="font-adminDisplay text-sm tracking-[0.18em] text-[hsl(var(--admin-muted-foreground))]">AUCUN CRÉNEAU CONFIGURÉ</p>
                        <p className="mt-1.5 text-[11px] uppercase tracking-[0.12em] text-[hsl(var(--admin-muted-foreground)/0.5)]">UTILISEZ LE FORMULAIRE CI-DESSUS POUR GÉNÉRER DES CRÉNEAUX.</p>
                      </div>
                    </div>
                  )}

                  {/* Section C: Ressources */}
                  <div className="border-t border-[hsl(var(--admin-accent)/0.12)] p-6">
                    <p className="admin-kicker mb-4 text-xs text-[hsl(var(--admin-accent))]">RESSOURCES DISPONIBLES (EX : CASQUES)</p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1">
                        <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">NOM</Label>
                        <Input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} placeholder="CASQUE ARAI RX-7V" className="admin-input" />
                      </div>
                      <div className="space-y-1">
                        <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">DESCRIPTION</Label>
                        <Input value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} placeholder="DESCRIPTION OPTIONNELLE" className="admin-input" />
                      </div>
                      <div className="space-y-1">
                        <Label className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">URL IMAGE</Label>
                        <Input value={itemForm.image_url} onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })} placeholder="https://..." className="admin-input" />
                      </div>
                    </div>
                    <Button onClick={handleAddItem} disabled={savingItem} className="admin-button mt-3 h-10 rounded-none px-5 font-adminDisplay text-sm tracking-[0.16em]">
                      <Plus className="h-4 w-4" /> {savingItem ? "AJOUT..." : "+ AJOUTER UNE RESSOURCE"}
                    </Button>

                    {items.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between border border-[hsl(var(--admin-accent)/0.16)] bg-[hsl(var(--admin-background))] px-4 py-3">
                            <div className="flex items-center gap-3">
                              {item.image_url && <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded object-cover" />}
                              <div>
                                <p className="text-sm uppercase tracking-[0.12em] text-[hsl(var(--admin-foreground))]">{item.name}</p>
                                {item.description && <p className="text-xs text-[hsl(var(--admin-muted-foreground))]">{item.description}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => handleToggleItem(item.id, item.is_active)}
                                className={`h-8 rounded-none px-3 font-adminDisplay text-xs tracking-[0.12em] ${item.is_active ? "admin-button-secondary" : "border border-[hsl(var(--admin-accent)/0.3)] bg-transparent text-[hsl(var(--admin-muted-foreground))] hover:bg-[hsl(var(--admin-accent)/0.1)]"}`}
                              >
                                {item.is_active ? "ACTIF" : "INACTIF"}
                              </Button>
                              <Button onClick={() => handleDeleteItem(item.id)} className="h-8 rounded-none border border-destructive/40 bg-transparent px-3 font-adminDisplay text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {items.length === 0 && (
                      <p className="mt-4 text-xs uppercase tracking-[0.14em] text-[hsl(var(--admin-muted-foreground))]">AUCUNE RESSOURCE CONFIGURÉE</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="bookings" className="m-0 max-h-[70vh] overflow-y-auto">
                <div className="p-6">
                  {loadingBookings ? (
                    <p className="text-sm uppercase tracking-[0.14em] text-[hsl(var(--admin-muted-foreground))]">CHARGEMENT...</p>
                  ) : (
                    <>
                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <select
                          value={bookingFilterDate}
                          onChange={(e) => setBookingFilterDate(e.target.value)}
                          className="admin-input h-10 rounded-none px-3 text-sm uppercase tracking-[0.12em]"
                        >
                          <option value="">TOUTES LES DATES</option>
                          {uniqueBookingDates.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select
                          value={bookingFilterItem}
                          onChange={(e) => setBookingFilterItem(e.target.value)}
                          className="admin-input h-10 rounded-none px-3 text-sm uppercase tracking-[0.12em]"
                        >
                          <option value="">TOUTES LES RESSOURCES</option>
                          {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                        <div className="ml-auto flex items-center gap-3">
                          <span className="text-sm uppercase tracking-[0.14em] text-[hsl(var(--admin-accent))]">
                            {filteredBookings.length} RÉSERVATIONS / {totalSlots} CRÉNEAUX TOTAL
                          </span>
                          <Button onClick={exportCSV} className="admin-button-secondary h-10 rounded-none px-4 font-adminDisplay text-xs tracking-[0.14em]">
                            <Download className="h-3 w-3" /> EXPORTER CSV
                          </Button>
                        </div>
                      </div>

                      {filteredBookings.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs uppercase tracking-[0.1em]">
                            <thead>
                              <tr className="border-b border-[hsl(var(--admin-accent)/0.2)]">
                                {["DATE", "CRÉNEAU", "RESSOURCE", "PRÉNOM", "NOM", "EMAIL", "TÉLÉPHONE", "NEWSLETTER", "INSCRIT LE"].map(h => (
                                  <th key={h} className="pb-3 pr-4 font-adminDisplay text-[hsl(var(--admin-muted-foreground))]">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {filteredBookings.map(b => (
                                <tr key={b.id} className="border-b border-[hsl(var(--admin-accent)/0.08)] hover:bg-[hsl(var(--admin-accent)/0.04)]">
                                  <td className="py-3 pr-4 text-[hsl(var(--admin-accent))]">{b.date}</td>
                                  <td className="py-3 pr-4">{normalizeTime(b.slot_time)}</td>
                                  <td className="py-3 pr-4">{items.find(i => i.id === b.slot_item_id)?.name || "—"}</td>
                                  <td className="py-3 pr-4">{b.first_name}</td>
                                  <td className="py-3 pr-4">{b.last_name}</td>
                                  <td className="py-3 pr-4">{b.email}</td>
                                  <td className="py-3 pr-4">{b.phone}</td>
                                  <td className="py-3 pr-4">{b.newsletter_consent ? "OUI" : "NON"}</td>
                                  <td className="py-3 pr-4 text-[hsl(var(--admin-muted-foreground))]">{new Date(b.created_at).toLocaleDateString("fr-BE")}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="border border-dashed border-[hsl(var(--admin-accent)/0.18)] p-5 text-center text-sm uppercase tracking-[0.18em] text-[hsl(var(--admin-muted-foreground))]">
                          AUCUNE RÉSERVATION
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
