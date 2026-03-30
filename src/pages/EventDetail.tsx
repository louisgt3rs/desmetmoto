import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, MapPin, Users } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hasBooking, setHasBooking] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }

    Promise.all([
      supabase.from("events").select("*").eq("id", id).single(),
      supabase.from("event_slots_config").select("event_id").eq("event_id", id).eq("is_active", true).limit(1),
      supabase.from("event_slot_items").select("event_id").eq("event_id", id).eq("is_active", true).limit(1),
    ]).then(([eventRes, slotsRes, itemsRes]) => {
      if (!eventRes.data || eventRes.error) { setNotFound(true); setLoading(false); return; }
      setEvent(eventRes.data);
      setHasBooking((slotsRes.data?.length ?? 0) > 0 && (itemsRes.data?.length ?? 0) > 0);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <section className="min-h-screen bg-[#0e0e0e] py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl space-y-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-16 animate-pulse bg-white/5" />)}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (notFound || !event) {
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

  const eventDate = event.date || event.event_date;
  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <Layout>
      <section className="min-h-screen bg-[#0e0e0e]">
        {/* Hero image */}
        {event.image_url && (
          <div className="relative h-64 w-full overflow-hidden sm:h-80 lg:h-96">
            <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/40 to-transparent" />
          </div>
        )}

        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-3xl">
            {/* Back */}
            <Link
              to="/community"
              className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 transition-colors hover:text-[#c9973a]"
            >
              <ArrowLeft className="h-4 w-4" /> ÉVÉNEMENTS
            </Link>

            {/* Title */}
            <div className="mb-8">
              <p className="mb-2 font-display text-xs uppercase tracking-[0.3em] text-[#c9973a]">ÉVÉNEMENT</p>
              <h1 className="font-display text-4xl uppercase leading-tight tracking-widest text-white sm:text-5xl lg:text-6xl">
                {event.title}
              </h1>
            </div>

            {/* Meta */}
            <div className="mb-10 grid gap-4 border-y border-white/10 py-6 sm:grid-cols-2 lg:grid-cols-4">
              {formattedDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#c9973a]" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/30">DATE</p>
                    <p className="mt-0.5 text-sm uppercase tracking-wide text-white">{formattedDate}</p>
                  </div>
                </div>
              )}
              {event.time && (
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#c9973a]" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/30">HEURE</p>
                    <p className="mt-0.5 text-sm uppercase tracking-wide text-white">{event.time}</p>
                  </div>
                </div>
              )}
              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#c9973a]" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/30">LIEU</p>
                    <p className="mt-0.5 text-sm uppercase tracking-wide text-white">{event.location}</p>
                  </div>
                </div>
              )}
              {(event.capacity ?? 0) > 0 && (
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-[#c9973a]" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/30">PLACES</p>
                    <p className="mt-0.5 text-sm uppercase tracking-wide text-white">
                      {event.registered_count ?? 0} / {event.capacity}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div className="mb-10">
                <p className="leading-relaxed text-white/70">{event.description}</p>
              </div>
            )}

            {/* CTA */}
            {hasBooking && (
              <div className="border border-[#c9973a]/20 bg-[#c9973a]/5 p-6">
                <p className="mb-1 font-display text-xs uppercase tracking-[0.25em] text-[#c9973a]">RÉSERVATION EN LIGNE</p>
                <p className="mb-4 text-sm text-white/50">Choisissez votre créneau et réservez votre place directement en ligne.</p>
                <Button
                  asChild
                  className="h-12 rounded-none bg-[#c9973a] px-8 font-display text-sm uppercase tracking-[0.2em] text-[#0e0e0e] hover:bg-[#c9973a]/90"
                >
                  <Link to={`/evenements/${event.id}/reserver`}>RÉSERVER UN CRÉNEAU</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
