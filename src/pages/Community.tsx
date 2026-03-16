import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Clock, Coffee, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";
import bikesCoffeeImg from "@/assets/bikes-coffee.jpg";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;
type GalleryPhoto = Tables<"gallery_photos">;

export default function CommunityPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("events").select("*").order("date", { ascending: false }).then(({ data }) => {
      if (data) setEvents(data);
    });
    supabase.from("gallery_photos").select("*").order("sort_order").then(({ data }) => {
      if (data) setPhotos(data);
    });
  }, []);

  return (
    <Layout>
      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeading title="COMMUNAUTÉ & ÉVÉNEMENTS" subtitle="Motos | Café | Communauté" />

          <div className="space-y-8">
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-[0_0_30px_hsl(var(--glow-soft))] transition-all duration-500"
              >
                <div className="grid lg:grid-cols-2">
                  {event.image_url ? (
                    <img src={event.image_url} alt={event.title} className="w-full h-64 lg:h-full object-cover" />
                  ) : (
                    <div className="h-64 lg:h-auto bg-secondary flex items-center justify-center">
                      <Coffee className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="font-display text-3xl text-foreground mb-3">{event.title}</h3>
                    <p className="text-muted-foreground text-sm mb-6">{event.description}</p>
                    <div className="space-y-2 mb-6">
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
                    {event.date && new Date(event.date) >= new Date() && (
                      <Button size="lg">Je participe</Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {photos.length > 0 && (
        <section className="py-24 bg-card">
          <div className="container mx-auto px-4">
            <SectionHeading title="GALERIE PHOTOS" subtitle="Moments capturés lors de nos événements" />
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {photos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="break-inside-avoid group cursor-pointer"
                  onClick={() => setLightbox(photo.url)}
                >
                  <div className="rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300">
                    <img
                      src={photo.url}
                      alt={photo.caption || "Gallery photo"}
                      className="w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Lightbox */}
          <AnimatePresence>
            {lightbox && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4"
                onClick={() => setLightbox(null)}
              >
                <button className="absolute top-6 right-6 text-foreground hover:text-primary transition-colors" onClick={() => setLightbox(null)}>
                  <X className="w-8 h-8" />
                </button>
                <motion.img
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  src={lightbox}
                  alt="Full size"
                  className="max-w-full max-h-[85vh] rounded-xl object-contain"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}
    </Layout>
  );
}
