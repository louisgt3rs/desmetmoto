import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Clock, Coffee, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";
import bikesCoffeeImg from "@/assets/bikes-coffee.jpg";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;

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
  const [nextEvent, setNextEvent] = useState<Event | null>(null);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true })
      .limit(1)
      .then(({ data }) => { if (data && data.length > 0) setNextEvent(data[0]); });
  }, []);

  const countdown = useCountdown(nextEvent?.date || null);
  const hasCountdown = nextEvent && nextEvent.date && new Date(nextEvent.date) > new Date();

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <SectionHeading title="BIKES & COFFEE" subtitle="Un rassemblement convivial pour les passionnés de moto" />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative rounded-xl overflow-hidden group">
              <img
                src={nextEvent?.image_url || bikesCoffeeImg}
                alt="Bikes & Coffee"
                className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <Coffee className="w-5 h-5 text-primary" />
                <span className="text-foreground font-display text-lg">Motos | Café | Communauté</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-muted-foreground leading-relaxed mb-6">
              Café offert, discussions moto et découverte des nouveautés. Rejoignez-nous devant le magasin
              pour un moment convivial entre passionnés.
            </p>

            {nextEvent ? (
              <div className="bg-card border border-border rounded-xl p-6 space-y-4 mb-6">
                <h3 className="font-display text-2xl text-foreground">{nextEvent.title}</h3>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4 text-primary" /> {nextEvent.location || "Desmet Équipement – Wavre"}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  {nextEvent.date ? new Date(nextEvent.date).toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "À venir"}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="w-4 h-4 text-primary" /> {nextEvent.time || "10:00"}
                </div>

                {/* Countdown */}
                {hasCountdown && (
                  <div className="grid grid-cols-4 gap-3 pt-2">
                    {[
                      { label: "Jours", value: countdown.days },
                      { label: "Heures", value: countdown.hours },
                      { label: "Min", value: countdown.minutes },
                      { label: "Sec", value: countdown.seconds },
                    ].map(({ label, value }) => (
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
                <p className="text-muted-foreground">Prochain événement à venir. Restez connecté !</p>
              </div>
            )}

            <Button asChild size="lg" className="group">
              <Link to="/community">
                Voir les Événements
                <motion.span className="inline-block transition-transform group-hover:translate-x-1">→</motion.span>
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
