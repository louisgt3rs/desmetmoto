import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";
import bikesCoffeeImg from "@/assets/bikes-coffee.jpg";
import type { Tables } from "@/integrations/supabase/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { pickUpcomingEvent } from "@/lib/events";

type Event = Tables<"events"> & {
  event_date?: string | null;
  is_upcoming?: boolean | null;
};

function useCountdown(targetDate: string | null) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return time;
}

export default function EventsSection() {
  const { t } = useLanguage();
  const [nextEvent, setNextEvent] = useState<Event | null>(null);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true })
      .then(({ data }) => {
        const events = (data as Event[] | null) ?? [];
        const today = new Date().toISOString().split("T")[0];
        setNextEvent(pickUpcomingEvent(events, today));
      });
  }, []);

  const effectiveDate = nextEvent?.event_date || nextEvent?.date || null;
  const countdown = useCountdown(effectiveDate);
  const hasCountdown = !!(effectiveDate && new Date(effectiveDate) > new Date());

  const countdownItems = [
    { label: t("countdown_days"),  value: countdown.days },
    { label: t("countdown_hours"), value: countdown.hours },
    { label: t("countdown_min"),   value: countdown.minutes },
    { label: t("countdown_sec"),   value: countdown.seconds },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <SectionHeading title="BIKES & COFFEE" subtitle={t("events_subtitle")} />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden group bg-[#111]">
              <img
                src={nextEvent?.image_url || bikesCoffeeImg}
                alt={nextEvent?.title || "Bikes & Coffee"}
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <Coffee className="w-5 h-5 text-primary" />
                <span className="text-foreground font-display text-lg">{t("events_tagline")}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {nextEvent ? (
              <div className="bg-card border border-border rounded-xl p-6 space-y-4 mb-6">
                <h3 className="font-display text-2xl text-foreground">{nextEvent.title}</h3>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  {effectiveDate ? new Date(effectiveDate).toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "À venir"}
                </div>
                {nextEvent.description && <p className="text-muted-foreground leading-relaxed">{nextEvent.description}</p>}

                {/* Countdown */}
                {hasCountdown && (
                  <div className="grid grid-cols-4 gap-3 pt-2">
                    {countdownItems.map(({ label, value }) => (
                      <div key={label} className="text-center bg-secondary rounded-lg p-3">
                        <span className="font-display text-2xl text-primary">{String(value).padStart(2, "0")}</span>
                        <p className="text-xs text-muted-foreground mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <p className="text-muted-foreground">{t("events_coming_soon")}</p>
              </div>
            )}

            <Button asChild size="lg" className="group">
              <Link to="/community">
                {t("events_cta")}
                <motion.span className="inline-block transition-transform group-hover:translate-x-1">→</motion.span>
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
