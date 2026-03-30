import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";

type SlotConfig = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
};

type SlotItem = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
};

type SlotBooking = {
  slot_item_id: string;
  date: string;
  slot_time: string;
};

type Event = {
  id: string;
  title: string;
  date: string | null;
  event_date: string | null;
  image_url: string | null;
};

function generateSlots(start: string, end: string, duration: number): string[] {
  const toMins = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const slots: string[] = [];
  let cur = toMins(start);
  const endM = toMins(end);
  while (cur < endM) {
    slots.push(`${String(Math.floor(cur / 60)).padStart(2, "0")}:${String(cur % 60).padStart(2, "0")}`);
    cur += duration;
  }
  return slots;
}

const normalizeTime = (t: string) => t.slice(0, 5);

const formatDateLabel = (date: string) =>
  new Date(date + "T00:00:00")
    .toLocaleDateString("fr-BE", { weekday: "short", day: "numeric", month: "short" })
    .toUpperCase();

export default function EventBookingPage() {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [configs, setConfigs] = useState<SlotConfig[]>([]);
  const [items, setItems] = useState<SlotItem[]>([]);
  const [bookings, setBookings] = useState<SlotBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    newsletter_consent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newsError, setNewsError] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }

    Promise.all([
      supabase.from("events").select("id, title, date, event_date, image_url").eq("id", id).single(),
      supabase.from("event_slots_config").select("id, date, start_time, end_time, slot_duration_minutes").eq("event_id", id).eq("is_active", true).order("date").order("start_time"),
      supabase.from("event_slot_items").select("id, name, description, image_url, is_active").eq("event_id", id).eq("is_active", true).order("created_at"),
      supabase.from("event_slot_bookings").select("slot_item_id, date, slot_time").eq("event_id", id),
    ]).then(([eventRes, configsRes, itemsRes, bookingsRes]) => {
      if (!eventRes.data || eventRes.error) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setEvent(eventRes.data as Event);
      const loadedConfigs = (configsRes.data as SlotConfig[]) || [];
      setConfigs(loadedConfigs);
      setItems((itemsRes.data as SlotItem[]) || []);
      setBookings((bookingsRes.data as SlotBooking[]) || []);

      const uniqueDates = [...new Set(loadedConfigs.map(c => c.date))].sort();
      if (uniqueDates.length > 0) setSelectedDate(uniqueDates[0]);

      setLoading(false);
    });
  }, [id]);

  const availableDates = useMemo(() => {
    return [...new Set(configs.map(c => c.date))].sort();
  }, [configs]);

  const slotsForSelection = useMemo(() => {
    if (!selectedDate || !selectedItem) return [];
    const dateConfigs = configs.filter(c => c.date === selectedDate);
    const allSlotTimes = dateConfigs.flatMap(c =>
      generateSlots(normalizeTime(c.start_time), normalizeTime(c.end_time), c.slot_duration_minutes)
    );
    const unique = [...new Set(allSlotTimes)].sort();
    return unique.map(time => ({
      time,
      booked: bookings.some(
        b => b.slot_item_id === selectedItem && b.date === selectedDate && normalizeTime(b.slot_time) === time
      ),
    }));
  }, [selectedDate, selectedItem, configs, bookings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.newsletter_consent) { setNewsError(true); return; }
    setNewsError(false);
    setSubmitting(true);
    const { error } = await supabase.from("event_slot_bookings").insert({
      event_id: id!,
      slot_item_id: selectedItem,
      date: selectedDate,
      slot_time: selectedSlot,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone,
      newsletter_consent: form.newsletter_consent,
    });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") {
        toast.error("Ce créneau vient d'être pris. Veuillez en choisir un autre.");
        const { data } = await supabase
          .from("event_slot_bookings")
          .select("slot_item_id, date, slot_time")
          .eq("event_id", id!);
        setBookings((data as SlotBooking[]) || []);
        setSelectedSlot("");
      } else {
        toast.error("Erreur lors de la réservation.");
      }
      return;
    }
    setSuccess(true);
  };

  if (loading) {
    return (
      <Layout>
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-card" />
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (notFound) {
    return (
      <Layout>
        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <p className="font-display text-4xl text-foreground">ÉVÉNEMENT INTROUVABLE</p>
            <Link to="/community" className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-widest text-primary">
              <ArrowLeft className="h-4 w-4" /> RETOUR AUX ÉVÉNEMENTS
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  if (success) {
    const selectedItemData = items.find(i => i.id === selectedItem);
    return (
      <Layout>
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-xl">
              <div className="rounded-xl border border-primary/40 bg-card p-10 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                  <Check className="h-8 w-8 text-black" />
                </div>
                <p className="font-display text-4xl text-foreground">RÉSERVATION CONFIRMÉE !</p>
                <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <p><span className="text-primary">DATE :</span> {formatDateLabel(selectedDate)}</p>
                  <p><span className="text-primary">CRÉNEAU :</span> {selectedSlot}</p>
                  {selectedItemData && <p><span className="text-primary">RESSOURCE :</span> {selectedItemData.name}</p>}
                  <p><span className="text-primary">NOM :</span> {form.first_name} {form.last_name}</p>
                </div>
                <div className="mt-8">
                  <Button asChild size="lg">
                    <Link to="/community">
                      <ArrowLeft className="mr-2 h-4 w-4" /> RETOUR AUX ÉVÉNEMENTS
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link to="/community" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> ÉVÉNEMENTS
            </Link>
          </div>

          {event?.image_url && (
            <div className="mb-10 overflow-hidden rounded-xl">
              <img src={event.image_url} alt={event?.title} className="h-64 w-full object-cover" />
            </div>
          )}

          <div className="mb-10">
            <p className="mb-1 font-display text-sm tracking-[0.2em] text-primary">RÉSERVER UN CRÉNEAU</p>
            <h1 className="font-display text-5xl text-foreground">{event?.title}</h1>
          </div>

          {configs.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <p className="text-sm uppercase tracking-widest text-muted-foreground">AUCUN CRÉNEAU CONFIGURÉ POUR CET ÉVÉNEMENT</p>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <p className="text-sm uppercase tracking-widest text-muted-foreground">AUCUNE RESSOURCE DISPONIBLE POUR CET ÉVÉNEMENT</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Date */}
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-display text-sm text-black">1</span>
                  <p className="font-display text-xl uppercase tracking-widest text-foreground">CHOISISSEZ UNE DATE</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {availableDates.map(date => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => { setSelectedDate(date); setSelectedSlot(""); }}
                      className={`rounded px-4 py-2 font-display text-sm tracking-widest transition-all duration-200 ${
                        selectedDate === date
                          ? "bg-primary font-bold text-black"
                          : "border border-primary/30 text-foreground hover:border-primary/60"
                      }`}
                    >
                      {formatDateLabel(date)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Resource */}
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-display text-sm text-black">2</span>
                  <p className="font-display text-xl uppercase tracking-widest text-foreground">CHOISISSEZ UNE RESSOURCE</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setSelectedItem(item.id); setSelectedSlot(""); }}
                      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
                        selectedItem === item.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-sm uppercase tracking-widest text-foreground">{item.name}</p>
                        {item.description && (
                          <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                      {selectedItem === item.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Time slot */}
              {selectedDate && selectedItem && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-display text-sm text-black">3</span>
                    <p className="font-display text-xl uppercase tracking-widest text-foreground">CHOISISSEZ UN CRÉNEAU</p>
                  </div>
                  {slotsForSelection.length === 0 ? (
                    <p className="text-sm uppercase tracking-widest text-muted-foreground">AUCUN CRÉNEAU DISPONIBLE</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {slotsForSelection.map(({ time, booked }) => (
                        <button
                          key={time}
                          type="button"
                          disabled={booked}
                          onClick={() => !booked && setSelectedSlot(time)}
                          className={`rounded px-4 py-2 font-display text-sm tracking-widest transition-all duration-200 ${
                            booked
                              ? "cursor-not-allowed border border-white/10 text-muted-foreground opacity-40"
                              : selectedSlot === time
                              ? "border border-primary bg-primary/20 text-primary"
                              : "border border-primary/40 text-foreground hover:border-primary hover:bg-primary/10"
                          }`}
                        >
                          {time}
                          {booked && <span className="ml-2 text-xs">COMPLET</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Personal info + submit */}
              {selectedSlot && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-display text-sm text-black">4</span>
                    <p className="font-display text-xl uppercase tracking-widest text-foreground">VOS COORDONNÉES</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">PRÉNOM *</label>
                      <Input
                        required
                        value={form.first_name}
                        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                        placeholder="Jean"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">NOM *</label>
                      <Input
                        required
                        value={form.last_name}
                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                        placeholder="Dupont"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">EMAIL *</label>
                      <Input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="jean.dupont@email.com"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">TÉLÉPHONE *</label>
                      <Input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+32 470 000 000"
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className={`flex cursor-pointer items-start gap-3 ${newsError ? "text-destructive" : "text-muted-foreground"}`}>
                      <input
                        type="checkbox"
                        checked={form.newsletter_consent}
                        onChange={(e) => { setForm({ ...form, newsletter_consent: e.target.checked }); if (e.target.checked) setNewsError(false); }}
                        className="mt-0.5 h-4 w-4 accent-primary"
                      />
                      <span className="text-sm leading-relaxed">
                        J'accepte de recevoir les actualités et offres de Desmet Équipement par email. *
                        {newsError && <span className="ml-2 text-xs text-destructive">(REQUIS)</span>}
                      </span>
                    </label>
                  </div>

                  <div className="mt-8 flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      <p><span className="text-primary">Date :</span> {formatDateLabel(selectedDate)}</p>
                      <p><span className="text-primary">Créneau :</span> {selectedSlot}</p>
                      <p><span className="text-primary">Ressource :</span> {items.find(i => i.id === selectedItem)?.name}</p>
                    </div>
                    <div className="ml-auto">
                      <Button type="submit" size="lg" disabled={submitting}>
                        {submitting ? "RÉSERVATION..." : "CONFIRMER"}
                        {!submitting && <ChevronRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
}
