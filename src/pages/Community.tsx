import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, Coffee } from "lucide-react";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import bikesCoffeeImg from "@/assets/bikes-coffee.jpg";

const events = [
  {
    title: "Bikes & Coffee – Édition 1",
    date: "Samedi 28 Mars",
    time: "10:00",
    location: "Desmet Équipement – Wavre",
    desc: "Un rassemblement convivial devant le magasin où les motards se retrouvent pour partager un café, admirer les motos et discuter entre passionnés.",
    image: bikesCoffeeImg,
    status: "upcoming" as const,
  },
  {
    title: "Bikes & Coffee – Édition 2",
    date: "À venir",
    time: "TBD",
    location: "Desmet Équipement – Wavre",
    desc: "La deuxième édition de notre rassemblement communautaire. Restez connectés pour plus de détails !",
    image: null,
    status: "planned" as const,
  },
  {
    title: "Bikes & Coffee – Édition 3",
    date: "À venir",
    time: "TBD",
    location: "Desmet Équipement – Wavre",
    desc: "Plus de détails bientôt...",
    image: null,
    status: "planned" as const,
  },
];

export default function CommunityPage() {
  return (
    <Layout>
      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeading title="COMMUNAUTÉ & ÉVÉNEMENTS" subtitle="Motos | Café | Communauté" />

          <div className="space-y-12">
            {events.map((event, i) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`bg-card border border-border rounded-lg overflow-hidden ${event.status === "planned" ? "opacity-70" : ""}`}
              >
                <div className="grid lg:grid-cols-2">
                  {event.image ? (
                    <img src={event.image} alt={event.title} className="w-full h-64 lg:h-full object-cover" />
                  ) : (
                    <div className="h-64 lg:h-auto bg-secondary flex items-center justify-center">
                      <Coffee className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-8">
                    {event.status === "upcoming" && (
                      <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded mb-4 inline-block">
                        Prochain événement
                      </span>
                    )}
                    <h3 className="font-display text-3xl text-foreground mb-3">{event.title}</h3>
                    <p className="text-muted-foreground text-sm mb-6">{event.desc}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary" /> {event.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" /> {event.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" /> {event.time}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Gallery placeholder */}
          <div className="mt-24">
            <SectionHeading title="GALERIE PHOTOS" subtitle="Les meilleurs moments de nos événements" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[bikesCoffeeImg, bikesCoffeeImg, bikesCoffeeImg].map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="aspect-video rounded-lg overflow-hidden"
                >
                  <img src={img} alt={`Event photo ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
