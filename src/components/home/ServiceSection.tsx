import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wrench, Radio, ArrowRight, CheckCircle2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import InstallationModal from "@/components/InstallationModal";
import storeImg from "@/assets/store-interior-1.jpeg";
import { supabase } from "@/integrations/supabase/client";

type InstIntercom = {
  id: string; brand: string; name: string; slug: string;
  image_url: string | null; prix: number | null;
  stock: number; is_coming_soon: boolean; featured: boolean;
};

const SERVICES = [
  "Intercom intégré proprement dans votre casque",
  "Supports téléphone Quad Lock & SP Connect",
  "Fixations GPS et électronique embarquée",
  "Réglage audio et test en boutique inclus",
];

export default function ServiceSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [intercoms, setIntercoms] = useState<InstIntercom[]>([]);

  useEffect(() => {
    supabase
      .from("installation_intercoms")
      .select("id, brand, name, slug, image_url, prix, stock, is_coming_soon, featured")
      .order("brand")
      .order("sort_order")
      .then(({ data }) => { if (data) setIntercoms(data as InstIntercom[]); });
  }, []);

  const heroImg =
    intercoms.find(i => i.featured && i.image_url)?.image_url ||
    intercoms.find(i => i.image_url && !i.is_coming_soon)?.image_url ||
    null;

  const featured = intercoms.filter(i => i.image_url && !i.is_coming_soon).slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden" style={{ background: "var(--c-surface-hero)" }}>

        {/* Grain */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]" style={{ mixBlendMode: "overlay" }} aria-hidden="true">
          <filter id="grain-svc"><feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
          <rect width="100%" height="100%" filter="url(#grain-svc)"/>
        </svg>

        {/* Gold halo top */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(201,151,58,0.07), transparent 60%)" }} />

        <div className="relative container mx-auto px-4 py-20 lg:py-28">

          {/* ── Header ── */}
          <div className="max-w-2xl mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-10" style={{ background: "linear-gradient(to right, rgba(201,151,58,0.6), transparent)" }} />
              <div className="h-1 w-1 rotate-45" style={{ background: "#c9973a", opacity: 0.7 }} />
              <span className="font-display text-[10px] uppercase tracking-[0.5em]" style={{ color: "rgba(201,151,58,0.7)" }}>
                Service boutique — Wavre
              </span>
            </div>

            <h2
              className="font-display leading-none mb-5"
              style={{
                fontSize: "clamp(2.6rem,7vw,5rem)",
                color: "var(--c-text)",
                textShadow: "0 0 60px rgba(201,151,58,0.18)",
              }}
            >
              INSTALLATION<br />
              <span style={{ color: "#c9973a" }}>INTERCOM</span> &amp;<br />
              ACCESSOIRES
            </h2>

            <p className="text-sm leading-relaxed max-w-lg" style={{ color: "var(--c-text-50)" }}>
              Votre intercom acheté chez nous ? On l'intègre proprement dans votre casque — câblage soigné, microphone positionné, son réglé. Prêt à rouler.
            </p>
          </div>

          {/* ── Main grid ── */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch mb-16">

            {/* Left — photo */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden"
              style={{ minHeight: 420 }}
            >
              <img
                src={heroImg || storeImg}
                alt="Installation intercom en boutique Desmet"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.15) 60%, transparent 100%)" }} />
              {/* Gold border */}
              <div className="absolute inset-0" style={{ border: "1px solid rgba(201,151,58,0.2)" }} />

              {/* Badge */}
              <div className="absolute bottom-5 left-5">
                <div className="inline-flex items-center gap-2 px-4 py-2" style={{ background: "rgba(5,5,5,0.85)", border: "1px solid rgba(201,151,58,0.35)" }}>
                  <Wrench className="w-3.5 h-3.5" style={{ color: "#c9973a" }} />
                  <span className="font-display text-[10px] uppercase tracking-[0.35em]" style={{ color: "#c9973a" }}>
                    Installation en boutique
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right — services + CTAs */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="flex flex-col justify-between gap-8"
            >
              {/* Services list */}
              <div>
                <p className="font-display text-[10px] uppercase tracking-[0.45em] mb-5" style={{ color: "rgba(201,151,58,0.6)" }}>
                  Ce qu'on installe
                </p>
                <ul className="space-y-3.5">
                  {SERVICES.map((s, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: 0.15 + i * 0.08 }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#c9973a" }} />
                      <span className="text-sm leading-snug" style={{ color: "var(--c-text-65)" }}>{s}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Notice */}
              <div className="px-4 py-3 text-sm" style={{ background: "rgba(201,151,58,0.05)", borderLeft: "2px solid rgba(201,151,58,0.4)", color: "var(--c-text-40)" }}>
                Installation réservée aux produits achetés chez Desmet Équipement.
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* → Voir les intercoms */}
                <Link
                  to="/intercoms"
                  className="inline-flex items-center justify-center gap-3 font-display text-sm uppercase tracking-[0.25em] px-7 py-4 transition-all duration-300"
                  style={{ background: "#c9973a", color: "#050505" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#d4a44a"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#c9973a"; }}
                >
                  <ShoppingBag className="w-4 h-4" /> Voir les intercoms
                </Link>

                {/* → Demander installation */}
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center justify-center gap-3 font-display text-sm uppercase tracking-[0.25em] px-7 py-4 transition-all duration-300"
                  style={{ border: "1px solid rgba(201,151,58,0.4)", color: "var(--c-text-50)", background: "transparent" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#c9973a"; (e.currentTarget as HTMLElement).style.color = "#c9973a"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,151,58,0.4)"; (e.currentTarget as HTMLElement).style.color = "var(--c-text-50)"; }}
                >
                  <Wrench className="w-4 h-4" /> Demander l'installation
                </button>
              </div>
            </motion.div>
          </div>

          {/* ── Intercom cards ── */}
          {featured.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Radio className="w-4 h-4" style={{ color: "#c9973a" }} />
                  <p className="font-display text-[10px] uppercase tracking-[0.45em]" style={{ color: "rgba(201,151,58,0.7)" }}>
                    Modèles disponibles en boutique
                  </p>
                </div>
                <Link
                  to="/intercoms"
                  className="inline-flex items-center gap-1.5 font-display text-[10px] uppercase tracking-[0.3em] transition-colors"
                  style={{ color: "rgba(201,151,58,0.5)" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c9973a"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(201,151,58,0.5)"}
                >
                  Tous les modèles <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {featured.map((intercom, i) => (
                  <motion.div
                    key={intercom.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.07 }}
                  >
                    <Link
                      to={`/intercoms/${intercom.slug}`}
                      className="group block relative overflow-hidden transition-all duration-300"
                      style={{ border: "1px solid rgba(201,151,58,0.12)", background: "rgba(201,151,58,0.03)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,151,58,0.35)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,151,58,0.12)"}
                    >
                      {/* Image */}
                      <div className="overflow-hidden" style={{ background: "rgba(201,151,58,0.04)" }}>
                        <img
                          src={intercom.image_url!}
                          alt={`${intercom.brand} ${intercom.name}`}
                          className="w-full object-contain transition-transform duration-500 group-hover:scale-105"
                          style={{ display: "block" }}
                        />
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <p className="font-display text-[9px] uppercase tracking-[0.35em] mb-0.5" style={{ color: "rgba(201,151,58,0.6)" }}>
                          {intercom.brand}
                        </p>
                        <p className="font-display text-sm uppercase tracking-[0.1em]" style={{ color: "var(--c-text)" }}>
                          {intercom.name}
                        </p>
                        {intercom.prix != null && (
                          <p className="font-display text-xs mt-1" style={{ color: "#c9973a" }}>
                            {intercom.prix.toLocaleString("fr-BE", { minimumFractionDigits: 2 })} €
                          </p>
                        )}
                      </div>

                      {/* Stock badge */}
                      {intercom.stock > 0 && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.2em]" style={{ background: "rgba(201,151,58,0.9)", color: "#050505" }}>
                          En stock
                        </div>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* See all button */}
              <div className="mt-6 text-center">
                <Link
                  to="/intercoms"
                  className="inline-flex items-center gap-3 font-display text-xs uppercase tracking-[0.35em] px-8 py-3.5 transition-all duration-300"
                  style={{ border: "1px solid rgba(201,151,58,0.3)", color: "rgba(201,151,58,0.7)", background: "transparent" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#c9973a"; (e.currentTarget as HTMLElement).style.color = "#c9973a"; (e.currentTarget as HTMLElement).style.background = "rgba(201,151,58,0.06)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,151,58,0.3)"; (e.currentTarget as HTMLElement).style.color = "rgba(201,151,58,0.7)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <Radio className="w-3.5 h-3.5" /> Voir tous les intercoms &amp; accessoires <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          )}

        </div>
      </section>

      <InstallationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
