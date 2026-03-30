import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calendar, Check, ChevronLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Event = {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  event_date: string | null;
  time: string | null;
  location: string | null;
  image_url: string | null;
  capacity: number | null;
  registered_count: number | null;
};

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
};

type SlotBooking = {
  slot_item_id: string;
  date: string;
  slot_time: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS_FR = ["JANVIER","FÉVRIER","MARS","AVRIL","MAI","JUIN","JUILLET","AOÛT","SEPTEMBRE","OCTOBRE","NOVEMBRE","DÉCEMBRE"];
const DAYS_FR   = ["LUN","MAR","MER","JEU","VEN","SAM","DIM"];

const norm = (t: string) => t.slice(0, 5);

function slotTimes(start: string, end: string, dur: number): string[] {
  const toM = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const pad = (n: number) => String(n).padStart(2, "0");
  const out: string[] = [];
  for (let c = toM(start); c < toM(end); c += dur)
    out.push(`${pad(Math.floor(c / 60))}:${pad(c % 60)}`);
  return out;
}

function calCells(year: number, month: number): (string | null)[] {
  const dow = (new Date(year, month, 1).getDay() + 6) % 7;
  const dim = new Date(year, month + 1, 0).getDate();
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const cells: (string | null)[] = Array(dow).fill(null);
  for (let d = 1; d <= dim; d++)
    cells.push(`${year}-${pad2(month + 1)}-${pad2(d)}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const bookingRef = useRef<HTMLDivElement>(null);

  // Event data
  const [event,    setEvent]    = useState<Event | null>(null);
  const [configs,  setConfigs]  = useState<SlotConfig[]>([]);
  const [items,    setItems]    = useState<SlotItem[]>([]);
  const [bookings, setBookings] = useState<SlotBooking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Booking UI
  const [showBooking,  setShowBooking]  = useState(false);
  const [calMonth,     setCalMonth]     = useState<{ year: number; month: number }>(() => { const n = new Date(); return { year: n.getFullYear(), month: n.getMonth() }; });
  const [selDate,      setSelDate]      = useState("");
  const [selSlot,      setSelSlot]      = useState("");
  const [selItem,      setSelItem]      = useState("");
  const [form,         setForm]         = useState({ first_name: "", last_name: "", email: "", phone: "", consent: false });
  const [consentErr,   setConsentErr]   = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [success,      setSuccess]      = useState(false);

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }
    Promise.all([
      supabase.from("events").select("id,title,description,date,event_date,time,location,image_url,capacity,registered_count").eq("id", id).single(),
      supabase.from("event_slots_config").select("id,date,start_time,end_time,slot_duration_minutes").eq("event_id", id).eq("is_active", true).order("date").order("start_time"),
      supabase.from("event_slot_items").select("id,name,description,image_url").eq("event_id", id).eq("is_active", true).order("created_at"),
      supabase.from("event_slot_bookings").select("slot_item_id,date,slot_time").eq("event_id", id),
    ]).then(([eR, cR, iR, bR]) => {
      if (!eR.data || eR.error) { setNotFound(true); setLoading(false); return; }
      setEvent(eR.data as Event);
      const loaded = (cR.data as SlotConfig[]) || [];
      setConfigs(loaded);
      setItems((iR.data as SlotItem[]) || []);
      setBookings((bR.data as SlotBooking[]) || []);
      if (loaded.length > 0) {
        const d = new Date(loaded[0].date + "T00:00:00");
        setCalMonth({ year: d.getFullYear(), month: d.getMonth() });
      }
      setLoading(false);
    });
  }, [id]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const hasSlots = configs.length > 0 && items.length > 0;

  // For each date: is it available (≥1 slot with ≥1 free item) or fully booked?
  const dateStatus = useMemo(() => {
    const result = new Map<string, "available" | "full">();
    const dates = [...new Set(configs.map(c => c.date))];
    for (const date of dates) {
      const times = [...new Set(configs.filter(c => c.date === date).flatMap(c => slotTimes(norm(c.start_time), norm(c.end_time), c.slot_duration_minutes)))];
      let anyFree = false;
      for (const t of times) {
        const bookedIds = new Set(bookings.filter(b => b.date === date && norm(b.slot_time) === t).map(b => b.slot_item_id));
        if (items.some(i => !bookedIds.has(i.id))) { anyFree = true; break; }
      }
      result.set(date, anyFree ? "available" : "full");
    }
    return result;
  }, [configs, items, bookings]);

  const cells = useMemo(() => calCells(calMonth.year, calMonth.month), [calMonth]);

  // Slots for selected date
  const daySlotTimes = useMemo(() => {
    if (!selDate) return [];
    const times = [...new Set(configs.filter(c => c.date === selDate).flatMap(c => slotTimes(norm(c.start_time), norm(c.end_time), c.slot_duration_minutes)))].sort();
    return times.map(t => {
      const bookedIds = new Set(bookings.filter(b => b.date === selDate && norm(b.slot_time) === t).map(b => b.slot_item_id));
      const freeItems = items.filter(i => !bookedIds.has(i.id));
      return { time: t, free: freeItems.length > 0 };
    });
  }, [selDate, configs, items, bookings]);

  // Items for selected (date + slot)
  const slotItems = useMemo(() => {
    if (!selDate || !selSlot) return [];
    const bookedIds = new Set(bookings.filter(b => b.date === selDate && norm(b.slot_time) === selSlot).map(b => b.slot_item_id));
    return items.map(i => ({ ...i, taken: bookedIds.has(i.id) }));
  }, [selDate, selSlot, items, bookings]);

  // Auto-select item if only one free
  useEffect(() => {
    if (!selSlot) return;
    const free = slotItems.filter(i => !i.taken);
    setSelItem(free.length === 1 ? free[0].id : "");
  }, [selSlot, slotItems]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const prevMonth = () => setCalMonth(m => m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 });
  const nextMonth = () => setCalMonth(m => m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 });

  const openBooking = () => {
    setShowBooking(true);
    setTimeout(() => bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const pickDate = (date: string) => { setSelDate(date); setSelSlot(""); setSelItem(""); };
  const pickSlot = (t: string)    => { setSelSlot(t);   setSelItem(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) { setConsentErr(true); return; }
    setConsentErr(false);
    setSubmitting(true);

    const { error } = await supabase.from("event_slot_bookings").insert({
      event_id: id!,
      slot_item_id: selItem,
      date: selDate,
      slot_time: selSlot,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone,
      newsletter_consent: true,
    });

    if (!error) {
      // Register to newsletter (ignore duplicate)
      await supabase.from("newsletter_subscribers" as any).insert({
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        source: "event_booking",
      });
    }

    setSubmitting(false);

    if (error) {
      if (error.code === "23505") {
        // Slot just taken — refresh bookings
        const { data } = await supabase.from("event_slot_bookings").select("slot_item_id,date,slot_time").eq("event_id", id!);
        setBookings((data as SlotBooking[]) || []);
        setSelSlot(""); setSelItem("");
        alert("Ce créneau vient d'être pris. Veuillez en choisir un autre.");
      } else {
        alert("Une erreur est survenue. Veuillez réessayer.");
      }
      return;
    }

    setSuccess(true);
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const stepLabel = (n: number, label: string) => (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-6 w-6 items-center justify-center bg-[#c9973a] font-display text-xs text-[#0e0e0e]">{n}</span>
      <p className="font-display text-xs uppercase tracking-[0.22em] text-[#c9973a]">{label}</p>
    </div>
  );

  // ── Loading / not found ───────────────────────────────────────────────────

  if (loading) {
    return (
      <Layout>
        <section className="min-h-screen bg-[#0e0e0e] py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl space-y-4">
              {[...Array(5)].map((_, i) => <div key={i} className="h-14 animate-pulse bg-white/5" />)}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (notFound || !event) {
    return (
      <Layout>
        <section className="min-h-screen bg-[#0e0e0e] py-24 text-center">
          <p className="font-display text-4xl uppercase tracking-widest text-white">ÉVÉNEMENT INTROUVABLE</p>
          <Link to="/community" className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-widest text-[#c9973a] hover:opacity-70">
            <ArrowLeft className="h-4 w-4" /> RETOUR
          </Link>
        </section>
      </Layout>
    );
  }

  const eventDate = event.event_date || event.date;
  const fmtDate = eventDate
    ? new Date(eventDate + "T00:00:00").toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : null;

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <Layout>
      <div className="min-h-screen bg-[#0e0e0e]">

        {/* ── Hero image ─────────────────────────────────────────────────── */}
        {event.image_url && (
          <div className="relative h-56 w-full overflow-hidden sm:h-72 lg:h-96">
            <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/30 to-transparent" />
          </div>
        )}

        <div className="container mx-auto px-4 py-10">
          <div className="mx-auto max-w-3xl">

            {/* Back link */}
            <Link to="/community" className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 hover:text-[#c9973a] transition-colors">
              <ArrowLeft className="h-4 w-4" /> ÉVÉNEMENTS
            </Link>

            {/* ── Event info ────────────────────────────────────────────── */}
            <p className="mb-2 font-display text-xs uppercase tracking-[0.3em] text-[#c9973a]">ÉVÉNEMENT</p>
            <h1 className="mb-6 font-display text-4xl uppercase leading-tight tracking-widest text-white sm:text-5xl">
              {event.title}
            </h1>

            {/* Meta grid */}
            <div className="mb-8 grid gap-4 border-y border-white/10 py-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#c9973a]" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">DATE</p>
                  <p className="mt-0.5 text-sm text-white">{fmtDate ?? "À CONFIRMER"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#c9973a]" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">HEURE</p>
                  <p className="mt-0.5 text-sm text-white">{event.time ?? "À CONFIRMER"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#c9973a]" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">LIEU</p>
                  <p className="mt-0.5 text-sm text-white">{event.location ?? "À CONFIRMER"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-[#c9973a]" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">PLACES</p>
                  <p className="mt-0.5 text-sm text-white">
                    {(event.capacity ?? 0) > 0
                      ? `${event.registered_count ?? 0} / ${event.capacity}`
                      : "OUVERT"}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <p className="mb-10 leading-relaxed text-white/65">{event.description}</p>
            )}

            {/* ── Booking CTA ──────────────────────────────────────────── */}
            {hasSlots && !showBooking && (
              <div className="mb-10 border border-[#c9973a]/25 bg-[#c9973a]/5 p-6">
                <p className="mb-1 font-display text-xs uppercase tracking-[0.25em] text-[#c9973a]">RÉSERVATION EN LIGNE</p>
                <p className="mb-4 text-sm text-white/50">Choisissez votre créneau et réservez directement en ligne.</p>
                <Button
                  onClick={openBooking}
                  className="h-12 rounded-none bg-[#c9973a] px-8 font-display text-sm uppercase tracking-[0.2em] text-[#0e0e0e] hover:bg-[#c9973a]/90"
                >
                  RÉSERVER UN CRÉNEAU
                </Button>
              </div>
            )}

            {/* ── Inline booking flow ──────────────────────────────────── */}
            {hasSlots && showBooking && (
              <div ref={bookingRef} className="space-y-0">

                {/* Success */}
                {success ? (
                  <div className="border border-[#c9973a]/30 bg-[#111] p-8 text-center">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center bg-[#c9973a]">
                      <Check className="h-7 w-7 text-[#0e0e0e]" />
                    </div>
                    <p className="font-display text-2xl uppercase tracking-widest text-white">RÉSERVATION CONFIRMÉE</p>
                    <p className="mt-3 text-sm text-white/60">
                      Votre réservation est confirmée&nbsp;! Un email de confirmation vous a été envoyé.
                    </p>
                    <div className="mt-6 space-y-1 border-t border-white/10 pt-5 text-left text-xs uppercase tracking-widest">
                      <div className="flex justify-between"><span className="text-white/40">DATE</span><span className="text-[#c9973a]">{new Date(selDate + "T00:00:00").toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}</span></div>
                      <div className="flex justify-between"><span className="text-white/40">CRÉNEAU</span><span className="text-[#c9973a]">{selSlot}</span></div>
                      {selItem && <div className="flex justify-between"><span className="text-white/40">RESSOURCE</span><span className="text-[#c9973a]">{items.find(i => i.id === selItem)?.name}</span></div>}
                      <div className="flex justify-between"><span className="text-white/40">NOM</span><span className="text-[#c9973a]">{form.first_name} {form.last_name}</span></div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Step 1 — Calendar */}
                    <div className="border border-white/10 bg-[#111]">
                      <div className="border-b border-white/10 px-6 py-4">{stepLabel(1, "CHOISISSEZ UNE DATE")}</div>
                      <div className="p-6">
                        {/* Month nav */}
                        <div className="mb-4 flex items-center justify-between">
                          <button onClick={prevMonth} className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/50 hover:border-[#c9973a] hover:text-[#c9973a] transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <p className="font-display text-sm uppercase tracking-[0.2em] text-white">{MONTHS_FR[calMonth.month]} {calMonth.year}</p>
                          <button onClick={nextMonth} className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/50 hover:border-[#c9973a] hover:text-[#c9973a] transition-colors">
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                        {/* Day headers */}
                        <div className="mb-1 grid grid-cols-7 gap-1">
                          {DAYS_FR.map(d => <div key={d} className="py-1 text-center font-display text-[10px] uppercase tracking-widest text-white/25">{d}</div>)}
                        </div>
                        {/* Grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {cells.map((date, i) => {
                            if (!date) return <div key={`p${i}`} className="aspect-square" />;
                            const dayNum = +date.split("-")[2];
                            const status = dateStatus.get(date);
                            const isSel = selDate === date;
                            return (
                              <button
                                key={date}
                                disabled={!status}
                                onClick={() => status && pickDate(date)}
                                className={[
                                  "aspect-square flex items-center justify-center border font-display text-sm transition-all duration-150",
                                  !status ? "cursor-default border-transparent text-white/15" :
                                  isSel   ? "cursor-pointer border-white bg-white text-[#0e0e0e]" :
                                  status === "available"
                                    ? "cursor-pointer border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-500/20"
                                    : "cursor-pointer border-red-500/40 bg-red-500/10 text-red-400 hover:border-red-400",
                                ].join(" ")}
                              >
                                {dayNum}
                              </button>
                            );
                          })}
                        </div>
                        {/* Legend */}
                        <div className="mt-3 flex flex-wrap gap-4 text-[10px] uppercase tracking-widest text-white/30">
                          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 border border-emerald-500/50 bg-emerald-500/10" />DISPONIBLE</span>
                          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 border border-red-500/40 bg-red-500/10" />COMPLET</span>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 — Time slots */}
                    {selDate && (
                      <div className="border-x border-b border-white/10 bg-[#111]">
                        <div className="border-b border-white/10 px-6 py-4">
                          {stepLabel(2, "CHOISISSEZ UN CRÉNEAU")}
                          <p className="-mt-2 ml-9 text-xs text-white/35">
                            {new Date(selDate + "T00:00:00").toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
                          </p>
                        </div>
                        <div className="p-6">
                          <div className="flex flex-wrap gap-2">
                            {daySlotTimes.map(({ time, free }) => (
                              <button
                                key={time}
                                disabled={!free}
                                onClick={() => free && pickSlot(time)}
                                className={[
                                  "border px-5 py-2.5 font-display text-sm uppercase tracking-widest transition-all duration-150",
                                  !free ? "cursor-not-allowed border-red-500/25 bg-red-500/5 text-red-400/50" :
                                  selSlot === time
                                    ? "border-white bg-white text-[#0e0e0e]"
                                    : "cursor-pointer border-emerald-500/40 bg-emerald-500/5 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-500/15",
                                ].join(" ")}
                              >
                                {time}
                                {!free && <span className="ml-2 text-[10px] tracking-widest opacity-60">COMPLET</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3 — Resource (only if multiple items) */}
                    {selSlot && slotItems.length > 1 && (
                      <div className="border-x border-b border-white/10 bg-[#111]">
                        <div className="border-b border-white/10 px-6 py-4">{stepLabel(3, "CHOISISSEZ UNE RESSOURCE")}</div>
                        <div className="p-6 flex flex-wrap gap-2">
                          {slotItems.map(item => (
                            <button
                              key={item.id}
                              disabled={item.taken}
                              onClick={() => !item.taken && setSelItem(item.id)}
                              className={[
                                "flex items-center gap-3 border px-5 py-3 transition-all duration-150",
                                item.taken ? "cursor-not-allowed border-red-500/25 text-red-400/50" :
                                selItem === item.id
                                  ? "border-[#c9973a] bg-[#c9973a]/10"
                                  : "cursor-pointer border-white/15 text-white hover:border-[#c9973a]/50",
                              ].join(" ")}
                            >
                              {item.image_url && <img src={item.image_url} alt={item.name} className="h-10 w-10 object-cover" />}
                              <div>
                                <p className="font-display text-sm uppercase tracking-widest text-white">{item.name}</p>
                                {item.taken && <p className="text-[10px] uppercase tracking-widest text-red-400/60">COMPLET</p>}
                              </div>
                              {selItem === item.id && <Check className="ml-auto h-4 w-4 text-[#c9973a]" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 4 — Booking form */}
                    {selSlot && selItem && (
                      <form onSubmit={handleSubmit} className="border-x border-b border-white/10 bg-[#111]">
                        <div className="border-b border-white/10 px-6 py-4">
                          {stepLabel(slotItems.length > 1 ? 4 : 3, "VOS COORDONNÉES")}
                        </div>
                        {/* Summary bar */}
                        <div className="flex flex-wrap gap-x-6 gap-y-1 border-b border-white/5 bg-[#c9973a]/5 px-6 py-3 text-xs uppercase tracking-widest">
                          <span className="text-white/40">DATE <span className="text-[#c9973a]">{new Date(selDate + "T00:00:00").toLocaleDateString("fr-BE", { day: "numeric", month: "short" }).toUpperCase()}</span></span>
                          <span className="text-white/40">CRÉNEAU <span className="text-[#c9973a]">{selSlot}</span></span>
                          {selItem && <span className="text-white/40">RESSOURCE <span className="text-[#c9973a]">{items.find(i => i.id === selItem)?.name}</span></span>}
                        </div>
                        <div className="p-6">
                          <div className="grid gap-4 sm:grid-cols-2">
                            {([
                              { label: "PRÉNOM", field: "first_name", type: "text",  placeholder: "Jean" },
                              { label: "NOM",    field: "last_name",  type: "text",  placeholder: "Dupont" },
                              { label: "EMAIL",  field: "email",      type: "email", placeholder: "jean.dupont@email.com" },
                              { label: "TÉLÉPHONE", field: "phone",   type: "tel",   placeholder: "+32 470 000 000" },
                            ] as const).map(({ label, field, type, placeholder }) => (
                              <div key={field} className="space-y-2">
                                <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40">{label} *</label>
                                <Input
                                  required
                                  type={type}
                                  value={form[field]}
                                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                                  placeholder={placeholder}
                                  className="rounded-none border-white/15 bg-white/5 text-white placeholder:text-white/20 focus:border-[#c9973a] focus-visible:ring-0"
                                />
                              </div>
                            ))}
                          </div>

                          <label className={`mt-6 flex cursor-pointer items-start gap-3 ${consentErr ? "text-red-400" : "text-white/50"}`}>
                            <input
                              type="checkbox"
                              checked={form.consent}
                              onChange={e => { setForm(f => ({ ...f, consent: e.target.checked })); if (e.target.checked) setConsentErr(false); }}
                              className="mt-0.5 h-4 w-4 accent-[#c9973a]"
                            />
                            <span className="text-sm leading-relaxed">
                              J'accepte de recevoir la newsletter et la confirmation de réservation par email. *
                              {consentErr && <span className="ml-2 text-xs text-red-400">(REQUIS)</span>}
                            </span>
                          </label>

                          <Button
                            type="submit"
                            disabled={submitting}
                            className="mt-8 h-12 w-full rounded-none bg-[#c9973a] font-display text-sm uppercase tracking-[0.2em] text-[#0e0e0e] hover:bg-[#c9973a]/90 disabled:opacity-50"
                          >
                            {submitting ? "RÉSERVATION EN COURS..." : "CONFIRMER MA RÉSERVATION"}
                          </Button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
}
