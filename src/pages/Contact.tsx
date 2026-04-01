import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Mail, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import SEO from "@/components/SEO";

const hours = [
  { day: "Lundi",    time: "Fermé",      closed: true },
  { day: "Mardi",    time: "10h – 18h",  closed: false },
  { day: "Mercredi", time: "10h – 18h",  closed: false },
  { day: "Jeudi",    time: "10h – 18h",  closed: false },
  { day: "Vendredi", time: "10h – 18h",  closed: false },
  { day: "Samedi",   time: "10h – 17h",  closed: false },
  { day: "Dimanche", time: "Fermé",      closed: true },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", rgpd: false });
  const [rgpdErr, setRgpdErr] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.rgpd) { setRgpdErr(true); return; }
    setRgpdErr(false);
    toast.success("Message envoyé avec succès ! Nous vous répondrons rapidement.");
    setForm({ name: "", email: "", phone: "", message: "", rgpd: false });
  };

  return (
    <Layout>
      <SEO
        title="Contactez Desmet Équipement — Wavre"
        description="Contactez Desmet Équipement à Wavre. Chaussée de Louvain 491, 1300 Wavre. Tél : 010/84 21 39. Ouvert du mardi au samedi."
      />
      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeading title="CONTACTEZ-NOUS" subtitle="N'hésitez pas à nous rendre visite ou à nous contacter" />

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-foreground">Adresse</h3>
                    <p className="text-muted-foreground text-sm">Chaussée de Louvain 491<br />1300 Wavre, Belgique</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-foreground">Téléphone</h3>
                    <a href="tel:010842139" className="text-muted-foreground text-sm hover:text-primary transition-colors">010 84 21 39</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-foreground">Email</h3>
                    <p className="text-muted-foreground text-sm">info@desmet-equipement.be</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-foreground">Horaires d'ouverture</h3>
                    <div className="text-sm space-y-1 mt-1">
                      {hours.map(h => (
                        <div key={h.day} className="flex justify-between gap-8">
                          <span className={h.closed ? "text-muted-foreground" : "text-foreground"}>{h.day}</span>
                          <span className={h.closed ? "text-destructive" : "text-primary font-medium"}>{h.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                <Button asChild size="lg">
                  <a href="tel:010842139"><Phone className="w-4 h-4" /> Appeler</a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="https://maps.app.goo.gl/usjUYzvsD9vi72BD8?g_st=ic" target="_blank" rel="noopener noreferrer">
                    <Navigation className="w-4 h-4" /> Itinéraire
                  </a>
                </Button>
              </div>

              {/* Map */}
              <div className="rounded-xl overflow-hidden border border-border aspect-video">
                <iframe
                  src="https://maps.google.com/maps?q=Chauss%C3%A9e+de+Louvain+491%2C+1300+Wavre%2C+Belgique&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Desmet Équipement location"
                />
              </div>
            </motion.div>

            {/* Contact form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-card border border-border rounded-xl p-8">
                <h2 className="font-display text-2xl text-foreground mb-6">ENVOYEZ-NOUS UN MESSAGE</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder="Nom complet"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="bg-secondary border-border"
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="bg-secondary border-border"
                  />
                  <Input
                    placeholder="Téléphone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="bg-secondary border-border"
                  />
                  <Textarea
                    placeholder="Votre message"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    rows={5}
                    className="bg-secondary border-border"
                  />
                  <label className={`flex cursor-pointer items-start gap-3 pt-1 ${rgpdErr ? "text-destructive" : "text-muted-foreground"}`}>
                    <input
                      type="checkbox"
                      checked={form.rgpd}
                      onChange={e => { setForm(f => ({ ...f, rgpd: e.target.checked })); if (e.target.checked) setRgpdErr(false); }}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                    />
                    <span className="text-xs leading-relaxed">
                      J'accepte de recevoir les communications de Desmet Équipement et confirme avoir lu la{" "}
                      <Link to="/politique-confidentialite" target="_blank" className="underline hover:text-primary transition-colors">
                        politique de confidentialité
                      </Link>. *
                      {rgpdErr && <span className="ml-1 text-xs text-destructive">(REQUIS)</span>}
                    </span>
                  </label>
                  <Button type="submit" className="w-full" size="lg">Envoyer</Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
