import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, Coffee } from "lucide-react";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";
import bikesCoffeeImg from "@/assets/bikes-coffee.jpg";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;

export default function CommunityPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    supabase.from("events").select("*").order("date", { ascending: false }).then(({ data }) => {
      if (data) setEvents(data);
    });
  }, []);

  return (
    <Layout>
      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeading title="COMMUNAUTÉ & ÉVÉNEMENTS" subtitle="Motos | Café | Communauté" />

          <div className="space-y-12">
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300"
              >
                <div className="grid lg:grid-cols-2">
                  {event.image_url ? (
                    <img src={event.image_url} alt={event.title} className="w-full h-64 lg:h-full object-cover" />
                  ) : (
                    <div className="h-64 lg:h-auto bg-secondary flex items-center justify-center">
                      <Coffee className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="font-display text-3xl text-foreground mb-3">{event.title}</h3>
                    <p className="text-muted-foreground text-sm mb-6">{event.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary" /> {event.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        {event.date ? new Date(event.date).toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" }) : "À venir"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" /> {event.time || "TBD"}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
