import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Check, ChevronLeft, ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS_FR = ["JANVIER","FÉVRIER","MARS","AVRIL","MAI","JUIN","JUILLET","AOÛT","SEPTEMBRE","OCTOBRE","NOVEMBRE","DÉCEMBRE"];
const DAYS_FR = ["LUN","MAR","MER","JEU","VEN","SAM","DIM"];

const normalizeTime = (t: string) => t.slice(0, 5);

function generateSlotTimes(start: string, end: string, duration: number): string[] {
  const toMins = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const slots: string[] = [];
  let cur = toMins(start);
  const endM = toMins(end);
  while (cur < endM) {
    slots.push(`${String(Math.floor(cur / 60)).padStart(2, "0")}:${String(cur % 60).padStart(2, "0")}`);
    cur += duration;
  }
  return slots;
}

function buildCalendarCells(year: number, month: number): (string | null)[] {
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Mon = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array(firstDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EventBookingPage() {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [configs, setConfigs] = useState<SlotConfig[]>([]);
  const [items, setItems] = useState<SlotItem[]>([]);
  const [bookings, setBookings] = useState<SlotBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Calendar navigation
  const [calMonth, setCalMonth] = useState<{ year: number; month: number }>(() => {
    const n = new Date(); return { year: n.getFullYear(), month: n.getMonth() };
  });

  // Selection state
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedItem, setSelectedItem] = useState("");

  // Booking form
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", newsletter_consent: false });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newsError, setNewsError] = useState(false);

  // ── Data loading ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }

    Promise.all([
      supabase.from("events").select("id, title, date, event_date, image_url").eq("id", id).single(),
      supabase.from("event_slots_config").select("id, date, start_time, end_time, slot_duration_minutes").eq("event_id", id).eq("is_active", true).order("date").order("start_time"),
      supabase.from("event_slot_items").select("id, name, description, image_url, is_active").eq("event_id", id).eq("is_active", true).order("created_at"),
      supabase.from("event_slot_bookings").select("slot_item_id, date, slot_time").eq("event_id", id),
    ]).then(([eventRes, configsRes, itemsRes, bookingsRes]) => {
      if (!eventRes.data || eventRes.error) { setNotFound(true); setLoading(false); return; }
      setEvent(eventRes.data as Event);
      const loadedConfigs = (configsRes.data as SlotConfig[]) || [];
      setConfigs(loadedConfigs);
      setItems((itemsRes.data as SlotItem[]) || []);
      setBookings((bookingsRes.data as SlotBooking[]) || []);
      // Auto-navigate calendar to first available month
      if (loadedConfigs.length > 0) {
        const d = new Date(loadedConfigs[0].date + "T00:00:00");
        setCalMonth({ year: d.getFullYear(), month: d.getMonth() });
      }
      setLoading(false);
    });
  }, [id]);

  // ── Derived data ─────────────────────────────────────────────────────────────

  // Set of dates that have at least one available (non-fully-booked) slot
  const availableDatesSet = useMemo(() => {
    const available = new Set<string>();
    for (const date of [...new Set(configs.map(c => c.date))]) {
      const dateConfigs = configs.filter(c => c.date === date);
      const allTimes = [...new Set(dateConfigs.flatMap(c =>
        generateSlotTimes(normalizeTime(c.start_time), normalizeTime(c.end_time), c.slot_duration_minutes)
      ))];
      for (const time of allTimes) {
        const bookedIds = new Set(bookings.filter(b => b.date === date && normalizeTime(b.slot_time) === time).map(b => b.slot_item_id));
        if (items.some(item => !bookedIds.has(item.id))) { available.add(date); break; }
      }
    }
    return available;
  }, [configs, items, bookings]);

  const calCells = useMemo(() => buildCalendarCells(calMonth.year, calMonth.month), [calMonth]);

  // Slot times for the selected date with availability counts
  const slotTimesForDate = useMemo(() => {
    if (!selectedDate) return [];
    const dateConfigs = configs.filter(c => c.date === selectedDate);
    const allTimes = [...new Set(dateConfigs.flatMap(c =>
      generateSlotTimes(normalizeTime(c.start_time), normalizeTime(c.end_time), c.slot_duration_minutes)
    ))].sort();
    return allTimes.map(time => {
      const bookedIds = new Set(bookings.filter(b => b.date === selectedDate && normalizeTime(b.slot_time) === time).map(b => b.slot_item_id));
      const availableItems = items.filter(item => !bookedIds.has(item.id));
      return { time, fullyBooked: availableItems.length === 0, availableCount: availableItems.length };
    });
  }, [selectedDate, configs, items, bookings]);

  // Items with availability for the selected (date, slot)
  const itemsForSlot = useMemo(() => {
    if (!selectedDate || !selectedSlot) return [];
    const bookedIds = new Set(bookings.filter(b => b.date === selectedDate && normalizeTime(b.slot_time) === selectedSlot).map(b => b.slot_item_id));
    return items.map(item => ({ ...item, booked: bookedIds.has(item.id) }));
  }, [selectedDate, selectedSlot, items, bookings]);

  // Auto-select item when there's exactly one available
  useEffect(() => {
    if (!selectedSlot) return;
    const available = itemsForSlot.filter(i => !i.booked);
    if (available.length === 1) setSelectedItem(available[0].id);
    else setSelectedItem("");
  }, [selectedSlot, itemsForSlot]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const prevMonth = () => setCalMonth(m => m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 });
  const nextMonth = () => setCalMonth(m => m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 });

  const handleSelectDate = (date: string) => {
    if (!availableDatesSet.has(date)) return;
    setSelectedDate(date);
    setSelectedSlot("");
    setSelectedItem("");
  };

  const handleSelectSlot = (time: string) => {
    setSelectedSlot(time);
    setSelectedItem("");
  };

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
    if (!error) {
      // Also subscribe to newsletter (ignore conflict if already subscribed)
      await supabase.from("newsletter_subscribers").insert({
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        source: "event_booking",
      }).maybeSingle();
    }
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") {
        toast.error("Ce créneau vient d'être pris. Veuillez en choisir un autre.");
        const { data } = await supabase.from("event_slot_bookings").select("slot_item_id, date, slot_time").eq("event_id", id!);
        setBookings((data as SlotBooking[]) || []);
        setSelectedSlot(""); setSelectedItem("");
      } else {
        toast.error("Erreur lors de la réservation.");
      }
      return;
    }
    setSuccess(true);
  };

  // ── Render: loading ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Layout>
        <section className="min-h-screen bg-[#0e0e0e] py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl space-y-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-16 animate-pulse bg-white/5" />)}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // ── Render: not found ────────────────────────────────────────────────────────

  if (notFound) {
    return (
      <Layout>
        <section className="min-h-screen bg-[#0e0e0e] py-24">
          <div className="container mx-auto px-4 text-center">
            <p className="font-display text-4xl uppercase tracking-widest text-white">ÉVÉNEMENT INTROUVABLE</p>
            <Link to="/community" className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-widest text-[#c9973a] transition-opacity hover:opacity-70">
              <ArrowLeft className="h-4 w-4" /> RETOUR AUX ÉVÉNEMENTS
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  // ── Render: success ──────────────────────────────────────────────────────────

  if (success) {
    const itemData = items.find(i => i.id === selectedItem);
    return (
      <Layout>
        <section className="min-h-screen bg-[#0e0e0e] py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-lg">
              <div className="border border-[#c9973a]/30 bg-[#111] p-10 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-[#c9973a]">
                  <Check className="h-8 w-8 text-[#0e0e0e]" />
                </div>
                <p className="font-display text-4xl uppercase tracking-widest text-white">RÉSERVATION CONFIRMÉE</p>
                <div className="mt-8 space-y-3 border-t border-white/10 pt-6 text-left text-sm uppercase tracking-widest">
                  <div className="flex justify-between">
                    <span className="text-[#c9973a]">DATE</span>
                    <span className="text-white">{new Date(selectedDate + "T00:00:00").toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#c9973a]">CRÉNEAU</span>
                    <span className="text-white">{selectedSlot}</span>
                  </div>
                  {itemData && (
                    <div className="flex justify-between">
                      <span className="text-[#c9973a]">RESSOURCE</span>
                      <span className="text-white">{itemData.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#c9973a]">NOM</span>
                    <span className="text-white">{form.first_name} {form.last_name}</span>
                  </div>
                </div>
                <div className="mt-8">
                  <Button asChild className="h-12 w-full rounded-none bg-[#c9973a] font-display text-sm uppercase tracking-widest text-[#0e0e0e] hover:bg-[#c9973a]/90">
                    <Link to="/community"><ArrowLeft className="mr-2 h-4 w-4" />RETOUR AUX ÉVÉNEMENTS</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // ── Render: main ─────────────────────────────────────────────────────────────

  const noSlotsConfigured = configs.length === 0;
  const noItems = items.length === 0;

  return (
    <Layout>
      <section className="min-h-screen bg-[#0e0e0e] py-16">
        <div className="container mx-auto px-4">

          {/* Back link */}
          <div className="mb-8">
            <Link to="/community" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 transition-colors hover:text-[#c9973a]">
              <ArrowLeft className="h-4 w-4" /> ÉVÉNEMENTS
            </Link>
          </div>

          {/* Event header */}
          {event?.image_url && (
            <div className="mb-8 overflow-hidden">
              <img src={event.image_url} alt={event.title} className="h-48 w-full object-cover sm:h-64" />
            </div>
          )}
          <div className="mb-10">
            <p className="mb-1 font-display text-xs uppercase tracking-[0.3em] text-[#c9973a]">RÉSERVER UN CRÉNEAU</p>
            <h1 className="font-display text-4xl uppercase tracking-widest text-white sm:text-5xl">{event?.title}</h1>
          </div>

          {/* Empty states */}
          {noSlotsConfigured || noItems ? (
            <div className="border border-white/10 p-10 text-center">
              <p className="text-sm uppercase tracking-widest text-white/40">AUCUN CRÉNEAU DISPONIBLE POUR CET ÉVÉNEMENT</p>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl space-y-0">

              {/* ── Step 1: Calendar ──────────────────────────────────────── */}
              <div className="border border-white/10 bg-[#111]">
                <div className="border-b border-white/10 px-6 py-4">
                  <p className="font-display text-xs uppercase tracking-[0.25em] text-[#c9973a]">01 — CHOISISSEZ UNE DATE</p>
                </div>
                <div className="p-6">
                  {/* Month navigation */}
                  <div className="mb-5 flex items-center justify-between">
                    <button onClick={prevMonth} className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/50 transition-colors hover:border-[#c9973a] hover:text-[#c9973a]">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <p className="font-display text-sm uppercase tracking-[0.2em] text-white">
                      {MONTHS_FR[calMonth.month]} {calMonth.year}
                    </p>
                    <button onClick={nextMonth} className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/50 transition-colors hover:border-[#c9973a] hover:text-[#c9973a]">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Day-of-week headers */}
                  <div className="mb-1 grid grid-cols-7 gap-1">
                    {DAYS_FR.map(d => (
                      <div key={d} className="py-1 text-center font-display text-[10px] uppercase tracking-[0.12em] text-white/30">{d}</div>
                    ))}
                  </div>
                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calCells.map((date, i) => {
                      if (!date) return <div key={`pad-${i}`} className="aspect-square" />;
                      const dayNum = +date.split("-")[2];
                      const hasSlots = availableDatesSet.has(date);
                      const isSelected = selectedDate === date;
                      return (
                        <button
                          key={date}
                          disabled={!hasSlots}
                          onClick={() => handleSelectDate(date)}
                          className={`aspect-square flex items-center justify-center border font-display text-sm uppercase transition-all duration-150 ${
                            !hasSlots
                              ? "cursor-default border-transparent text-white/15"
                              : isSelected
                              ? "cursor-pointer border-[#c9973a] bg-[#c9973a] text-[#0e0e0e]"
                              : "cursor-pointer border-[#c9973a]/40 bg-[#c9973a]/5 text-white hover:border-[#c9973a] hover:bg-[#c9973a]/15"
                          }`}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>
                  {/* Legend */}
                  <div className="mt-4 flex items-center gap-4 text-[10px] uppercase tracking-widest text-white/30">
                    <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 border border-[#c9973a]/40 bg-[#c9973a]/5" />DISPONIBLE</span>
                    <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 border border-transparent bg-transparent" />NON DISPONIBLE</span>
                  </div>
                </div>
              </div>

              {/* ── Step 2: Time slots ────────────────────────────────────── */}
              {selectedDate && (
                <div className="border-x border-b border-white/10 bg-[#111]">
                  <div className="border-b border-white/10 px-6 py-4">
                    <p className="font-display text-xs uppercase tracking-[0.25em] text-[#c9973a]">02 — CHOISISSEZ UN CRÉNEAU</p>
                    <p className="mt-0.5 text-xs uppercase tracking-widest text-white/40">
                      {new Date(selectedDate + "T00:00:00").toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
                    </p>
                  </div>
                  <div className="p-6">
                    {slotTimesForDate.length === 0 ? (
                      <p className="text-sm uppercase tracking-widest text-white/30">AUCUN CRÉNEAU DISPONIBLE</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {slotTimesForDate.map(({ time, fullyBooked }) => (
                          <button
                            key={time}
                            disabled={fullyBooked}
                            onClick={() => !fullyBooked && handleSelectSlot(time)}
                            className={`border px-5 py-2.5 font-display text-sm uppercase tracking-widest transition-all duration-150 ${
                              fullyBooked
                                ? "cursor-not-allowed border-white/8 text-white/20"
                                : selectedSlot === time
                                ? "border-[#c9973a] bg-[#c9973a] text-[#0e0e0e]"
                                : "border-[#c9973a]/40 text-white hover:border-[#c9973a] hover:bg-[#c9973a]/10"
                            }`}
                          >
                            {time}
                            {fullyBooked && <span className="ml-2 text-[10px] tracking-widest opacity-60">COMPLET</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Step 3: Resource (only if multiple items) ─────────────── */}
              {selectedSlot && itemsForSlot.length > 1 && (
                <div className="border-x border-b border-white/10 bg-[#111]">
                  <div className="border-b border-white/10 px-6 py-4">
                    <p className="font-display text-xs uppercase tracking-[0.25em] text-[#c9973a]">03 — CHOISISSEZ UNE RESSOURCE</p>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {itemsForSlot.map(item => (
                        <button
                          key={item.id}
                          disabled={item.booked}
                          onClick={() => !item.booked && setSelectedItem(item.id)}
                          className={`flex items-center gap-3 border px-5 py-3 text-left transition-all duration-150 ${
                            item.booked
                              ? "cursor-not-allowed border-white/8 text-white/20"
                              : selectedItem === item.id
                              ? "border-[#c9973a] bg-[#c9973a]/10"
                              : "border-white/15 text-white hover:border-[#c9973a]/50"
                          }`}
                        >
                          {item.image_url && <img src={item.image_url} alt={item.name} className="h-10 w-10 object-cover" />}
                          <div>
                            <p className="font-display text-sm uppercase tracking-widest text-white">{item.name}</p>
                            {item.booked && <p className="text-[10px] uppercase tracking-widest text-white/30">COMPLET</p>}
                          </div>
                          {selectedItem === item.id && <Check className="ml-auto h-4 w-4 text-[#c9973a]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 4: Booking form ─────────────────────────────────── */}
              {selectedSlot && selectedItem && (
                <form onSubmit={handleSubmit} className="border-x border-b border-white/10 bg-[#111]">
                  <div className="border-b border-white/10 px-6 py-4">
                    <p className="font-display text-xs uppercase tracking-[0.25em] text-[#c9973a]">
                      {itemsForSlot.length > 1 ? "04" : "03"} — VOS COORDONNÉES
                    </p>
                  </div>

                  {/* Booking summary */}
                  <div className="flex flex-wrap gap-x-8 gap-y-1 border-b border-white/5 bg-[#c9973a]/5 px-6 py-3 text-xs uppercase tracking-widest">
                    <span className="text-white/40">DATE <span className="text-[#c9973a]">{new Date(selectedDate + "T00:00:00").toLocaleDateString("fr-BE", { day: "numeric", month: "short" }).toUpperCase()}</span></span>
                    <span className="text-white/40">CRÉNEAU <span className="text-[#c9973a]">{selectedSlot}</span></span>
                    {selectedItem && <span className="text-white/40">RESSOURCE <span className="text-[#c9973a]">{items.find(i => i.id === selectedItem)?.name}</span></span>}
                  </div>

                  <div className="p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        { label: "PRÉNOM", field: "first_name" as const, type: "text", placeholder: "Jean" },
                        { label: "NOM", field: "last_name" as const, type: "text", placeholder: "Dupont" },
                        { label: "EMAIL", field: "email" as const, type: "email", placeholder: "jean.dupont@email.com" },
                        { label: "TÉLÉPHONE", field: "phone" as const, type: "tel", placeholder: "+32 470 000 000" },
                      ].map(({ label, field, type, placeholder }) => (
                        <div key={field} className="space-y-2">
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40">{label} *</label>
                          <Input
                            required
                            type={type}
                            value={form[field] as string}
                            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                            placeholder={placeholder}
                            className="rounded-none border-white/15 bg-white/5 text-white placeholder:text-white/20 focus:border-[#c9973a] focus:ring-0"
                          />
                        </div>
                      ))}
                    </div>

                    <label className={`mt-6 flex cursor-pointer items-start gap-3 ${newsError ? "text-red-400" : "text-white/40"}`}>
                      <input
                        type="checkbox"
                        checked={form.newsletter_consent}
                        onChange={(e) => { setForm({ ...form, newsletter_consent: e.target.checked }); if (e.target.checked) setNewsError(false); }}
                        className="mt-0.5 h-4 w-4 accent-[#c9973a]"
                      />
                      <span className="text-sm leading-relaxed">
                        J'accepte de recevoir la newsletter Desmet Équipement et la confirmation de réservation par email. *
                        {newsError && <span className="ml-2 text-xs uppercase tracking-widest text-red-400">(REQUIS)</span>}
                      </span>
                    </label>

                    <div className="mt-8">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="h-12 w-full rounded-none bg-[#c9973a] font-display text-sm uppercase tracking-[0.2em] text-[#0e0e0e] transition-opacity hover:bg-[#c9973a]/90 disabled:opacity-50"
                      >
                        {submitting ? "RÉSERVATION EN COURS..." : "CONFIRMER MA RÉSERVATION"}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
