import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Clock, Coffee, X, ImageOff } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;
type GalleryPhoto = Tables<"gallery_photos">;

export default function CommunityPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("events").select("*").order("date", { ascending: false }),
      supabase.from("gallery_photos").select("*").order("sort_order"),
    ]).then(([eventsRes, photosRes]) => {
      if (eventsRes.data) setEvents(eventsRes.data);
      if (photosRes.data) setPhotos(photosRes.data);
    });
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const upcomingEvents = events.filter(e => !e.date || e.date >= today);
  const pastEvents = events.filter(e => e.date && e.date < today);

  const formatDateLong = (date: string | null) =>
    date
      ? new Date(date).toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : "À venir";

  return (
    <Layout>
      <SEO
        title="Événements Moto à Wavre — Bikes & Coffee, Essais Arai | Desmet Équipement"
        description="Rejoignez la communauté Desmet Équipement à Wavre. Bikes & Coffee, Test Days Arai, soirées moto. Réservez votre créneau d'essai directement en ligne."
        canonicalPath="/community"
      />

      {/* Upcoming events */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeading title="COMMUNAUTÉ & ÉVÉNEMENTS" subtitle="Motos | Café | Communauté" />
          <div className="space-y-8">
            {upcomingEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  to={`/evenements/${event.id}`}
                  className="group block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-[0_0_30px_hsl(var(--glow-soft))] transition-all duration-500"
                >
                  <div className="grid lg:grid-cols-2">
                    {event.image_url ? (
                      <div className="bg-[#111] h-64 lg:h-auto lg:min-h-[340px] overflow-hidden">
                        <img src={event.image_url} alt={event.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" style={{ minHeight: "260px" }} />
                      </div>
                    ) : (
                      <div className="h-64 lg:h-auto bg-secondary flex items-center justify-center">
                        <Coffee className="w-16 h-16 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="p-8">
                      <h3 className="font-display text-3xl text-foreground mb-3 group-hover:text-primary transition-colors duration-300">{event.title}</h3>
                      <p className="text-muted-foreground text-sm mb-6 line-clamp-3">{event.description}</p>
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
                      <div className="flex items-center gap-2 text-sm font-display uppercase tracking-widest text-primary">
                        VOIR L'ÉVÉNEMENT
                        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            {upcomingEvents.length === 0 && (
              <div className="py-16 text-center border border-dashed border-border rounded-xl">
                <Coffee className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-display tracking-widest">AUCUN ÉVÉNEMENT À VENIR POUR LE MOMENT</p>
              </div>
            )}
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
        </section>
      )}

      {/* Past events */}
      {pastEvents.length > 0 && (
        <section className="py-24 bg-[#080808]">
          <div className="container mx-auto px-4">
            <SectionHeading title="ÉVÉNEMENTS PASSÉS" subtitle="Revivez nos derniers rendez-vous" />
            <div className="space-y-10">
              {pastEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="border border-[#c9973a]/15 rounded-xl overflow-hidden bg-[#0e0e0e]"
                >
                  {/* Event header */}
                  <div className="px-6 py-5 border-b border-[#c9973a]/10">
                    <p className="text-[11px] font-display uppercase tracking-[0.35em] text-[#c9973a] mb-1">
                      {formatDateLong(event.date)}
                    </p>
                    <h3 className="font-display text-2xl text-white leading-tight">{event.title}</h3>
                    {event.description && (
                      <p className="mt-2 text-sm text-white/50 line-clamp-2 leading-relaxed">{event.description}</p>
                    )}
                  </div>

                  {/* Photo galleries */}
                  <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#c9973a]/10">
                    {/* Avant */}
                    <div className="p-5">
                      <p className="text-[9px] font-display uppercase tracking-[0.45em] text-[#c9973a]/60 mb-3">AVANT L'ÉVÉNEMENT</p>
                      {event.image_url ? (
                        <div
                          className="aspect-video overflow-hidden rounded-lg cursor-pointer group relative"
                          onClick={() => setLightbox(event.image_url!)}
                        >
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        </div>
                      ) : (
                        <div className="aspect-video rounded-lg border border-dashed border-[#c9973a]/15 flex items-center justify-center">
                          <ImageOff className="w-6 h-6 text-white/20" />
                        </div>
                      )}
                    </div>

                    {/* Après */}
                    <div className="p-5">
                      <p className="text-[9px] font-display uppercase tracking-[0.45em] text-[#c9973a]/60 mb-3">APRÈS L'ÉVÉNEMENT</p>
                      {event.photos_after && event.photos_after.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {event.photos_after.map((url, j) => (
                            <div
                              key={j}
                              className="aspect-square overflow-hidden rounded-lg cursor-pointer group relative"
                              onClick={() => setLightbox(url)}
                            >
                              <img
                                src={url}
                                alt={`Après ${j + 1}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="aspect-video rounded-lg border border-dashed border-[#c9973a]/15 flex flex-col items-center justify-center gap-2">
                          <p className="text-[10px] font-display uppercase tracking-[0.35em] text-white/25">PHOTOS À VENIR</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

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
    </Layout>
  );
}
