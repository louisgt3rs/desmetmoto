import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";

const hours = [
  { day: "Lundi", time: "Fermé", closed: true },
  { day: "Mardi", time: "10h – 18h", closed: false },
  { day: "Mercredi", time: "10h – 18h", closed: false },
  { day: "Jeudi", time: "10h – 18h", closed: false },
  { day: "Vendredi", time: "10h – 18h", closed: false },
  { day: "Samedi", time: "10h – 17h", closed: false },
  { day: "Dimanche", time: "Fermé", closed: true },
];

export default function ContactSection() {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <SectionHeading title="NOUS TROUVER" subtitle="Desmet Équipement – Wavre, Belgique" />

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Info + hours */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg text-foreground mb-1">Adresse</h3>
                <p className="text-muted-foreground text-sm">Chaussée de Wavre 491<br />1300 Wavre, Belgique</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-lg text-foreground">Horaires d'ouverture</h3>
              </div>
              <div className="space-y-2 pl-14">
                {hours.map(h => (
                  <div key={h.day} className="flex justify-between text-sm">
                    <span className={h.closed ? "text-muted-foreground" : "text-foreground"}>{h.day}</span>
                    <span className={h.closed ? "text-destructive" : "text-primary font-medium"}>{h.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="tel:010842139">
                  <Phone className="w-4 h-4" /> Appeler
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a
                  href="https://maps.app.goo.gl/usjUYzvsD9vi72BD8?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation className="w-4 h-4" /> Itinéraire
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-xl overflow-hidden border border-border aspect-video lg:aspect-auto lg:min-h-[400px]"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2527.5!2d4.6167!3d50.7167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c3d1e1e1e1e1e1%3A0x0!2sChauss%C3%A9e+de+Wavre+491%2C+1300+Wavre!5e0!3m2!1sfr!2sbe!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Desmet Équipement location"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
