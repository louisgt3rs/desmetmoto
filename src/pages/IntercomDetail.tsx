import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Battery, Radio, Users, Wifi, Wrench,
  CheckCircle2, Shield, Zap, Volume2, Mic, Cloud, X,
} from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import InstallationModal from "@/components/InstallationModal";
import { supabase } from "@/integrations/supabase/client";

/* ─────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────── */
type HighlightItem = { icon: React.ReactNode; text: string };
type StatItem = { icon: React.ReactNode; label: string; value: string; sub?: string };

type ProductData = {
  brand: string;
  name: string;
  tagline: string;
  shortDesc: string;
  imageUrl: string;
  accentColor: string;        // brand color for subtle tint
  stats: StatItem[];
  highlights: HighlightItem[];
  techSpecs: { label: string; value: string }[];
};

/* ─────────────────────────────────────────────────────────
   Compatibility
───────────────────────────────────────────────────────── */
type HelmetCompat = { brand: string; models: string[] };
const COMPATIBILITY: Record<string, HelmetCompat[]> = {
  sf2: [
    { brand: "Arai",        models: ["RX-7V Evo", "Quantic", "SZ-R Evo"] },
    { brand: "Shoei",       models: ["GT-Air 3", "NXR2", "RF-1400"] },
    { brand: "Alpinestars", models: ["Supertech R10"] },
  ],
  sf4: [
    { brand: "Arai",        models: ["RX-7V Evo", "Quantic", "SZ-R Evo"] },
    { brand: "Shoei",       models: ["GT-Air 3", "NXR2", "RF-1400", "X-SPR Pro"] },
    { brand: "Alpinestars", models: ["Supertech R10"] },
  ],
  "50s": [
    { brand: "Arai",        models: ["RX-7V Evo", "Quantic", "SZ-R Evo"] },
    { brand: "Shoei",       models: ["GT-Air 3", "NXR2", "Neotec 3", "X-SPR Pro"] },
    { brand: "Alpinestars", models: ["Supertech R10"] },
  ],
  "50r": [
    { brand: "Arai",        models: ["RX-7V Evo", "Quantic", "SZ-R Evo"] },
    { brand: "Shoei",       models: ["GT-Air 3", "NXR2", "X-SPR Pro"] },
    { brand: "Alpinestars", models: ["Supertech R10"] },
  ],
  "30k": [
    { brand: "Arai",        models: ["RX-7V Evo", "Quantic", "SZ-R Evo"] },
    { brand: "Shoei",       models: ["GT-Air 3", "NXR2", "Neotec 3"] },
    { brand: "Alpinestars", models: ["Supertech R10"] },
  ],
};

/* ─────────────────────────────────────────────────────────
   Product data
───────────────────────────────────────────────────────── */
const PRODUCTS: Record<string, ProductData> = {
  sf2: {
    brand: "Sena", name: "SF2", tagline: "L'entrée en matière Sena",
    shortDesc: "Bluetooth slim-line, 2 riders, 900 m. Le compagnon discret pour les roadtrips duo.",
    imageUrl: "https://www.sena.com/content/images/products/SF2/SF2-sena.png",
    accentColor: "rgba(201,151,58,0.15)",
    stats: [
      { icon: <Users className="w-5 h-5" />,   label: "Riders",    value: "2",      sub: "simultanément" },
      { icon: <Radio className="w-5 h-5" />,    label: "Portée",    value: "900 m",  sub: "Bluetooth" },
      { icon: <Battery className="w-5 h-5" />,  label: "Autonomie", value: "8 h",    sub: "conversation" },
      { icon: <Wifi className="w-5 h-5" />,     label: "BT",        value: "3.0",    sub: "Bluetooth" },
    ],
    highlights: [
      { icon: <CheckCircle2 className="w-4 h-4" />, text: "Profil ultra-fin — s'adapte à tous les casques" },
      { icon: <Mic className="w-4 h-4" />,          text: "Microphone filaire + tour de cou inclus" },
      { icon: <Volume2 className="w-4 h-4" />,       text: "Musique stéréo via Bluetooth" },
      { icon: <Shield className="w-4 h-4" />,        text: "Résistant aux intempéries IPX4" },
      { icon: <Zap className="w-4 h-4" />,           text: "Appel interphone en un bouton" },
      { icon: <CheckCircle2 className="w-4 h-4" />, text: "Idéal casques intégraux et modulables" },
    ],
    techSpecs: [
      { label: "Dimensions", value: "57,8 × 34,3 × 14,5 mm" },
      { label: "Poids", value: "35 g" },
      { label: "Recharge", value: "Micro-USB, 1,5 h" },
      { label: "Portée musique", value: "10 m" },
      { label: "Étanchéité", value: "IPX4" },
      { label: "Garantie", value: "2 ans" },
    ],
  },
  sf4: {
    brand: "Sena", name: "SF4", tagline: "4 riders, une conversation",
    shortDesc: "Réseau Bluetooth 4 riders, 1,2 km. Radio FM intégrée, 10 h d'autonomie.",
    imageUrl: "https://www.sena.com/content/images/products/SF4/SF4-sena.png",
    accentColor: "rgba(201,151,58,0.15)",
    stats: [
      { icon: <Users className="w-5 h-5" />,   label: "Riders",    value: "4",      sub: "simultanément" },
      { icon: <Radio className="w-5 h-5" />,    label: "Portée",    value: "1,2 km", sub: "Bluetooth" },
      { icon: <Battery className="w-5 h-5" />,  label: "Autonomie", value: "10 h",   sub: "conversation" },
      { icon: <Wifi className="w-5 h-5" />,     label: "BT",        value: "4.1",    sub: "Bluetooth" },
    ],
    highlights: [
      { icon: <Users className="w-4 h-4" />,        text: "Interphone multicanaux pour 4 riders" },
      { icon: <Radio className="w-4 h-4" />,         text: "Radio FM intégrée avec 10 présélections" },
      { icon: <Volume2 className="w-4 h-4" />,       text: "Partage audio de musique entre riders" },
      { icon: <Mic className="w-4 h-4" />,           text: "Commandes vocales intégrées" },
      { icon: <Shield className="w-4 h-4" />,        text: "Résistant aux intempéries IPX4" },
      { icon: <CheckCircle2 className="w-4 h-4" />, text: "Microphone filaire ou perche inclus" },
    ],
    techSpecs: [
      { label: "Dimensions", value: "57,8 × 34,3 × 14,5 mm" },
      { label: "Poids", value: "40 g" },
      { label: "Recharge", value: "Micro-USB, 1,5 h" },
      { label: "Radio FM", value: "76 – 108 MHz" },
      { label: "Étanchéité", value: "IPX4" },
      { label: "Garantie", value: "2 ans" },
    ],
  },
  "50s": {
    brand: "Sena", name: "50S", tagline: "Le flagship Sena. Rien de moins.",
    shortDesc: "Mesh 2.0, 8 riders, 2 km. Harman Kardon. Alexa. 24 h. Le summum.",
    imageUrl: "https://www.sena.com/content/images/products/50S/50S-sena.png",
    accentColor: "rgba(201,151,58,0.18)",
    stats: [
      { icon: <Users className="w-5 h-5" />,   label: "Riders",    value: "8",     sub: "Mesh 2.0" },
      { icon: <Radio className="w-5 h-5" />,    label: "Portée",    value: "2 km",  sub: "Mesh" },
      { icon: <Battery className="w-5 h-5" />,  label: "Autonomie", value: "24 h",  sub: "conversation" },
      { icon: <Wifi className="w-5 h-5" />,     label: "BT",        value: "5.0",   sub: "Bluetooth" },
    ],
    highlights: [
      { icon: <Radio className="w-4 h-4" />,         text: "Mesh 2.0 universel — compatible tout rider Sena" },
      { icon: <Volume2 className="w-4 h-4" />,       text: "Haut-parleurs Harman Kardon premium" },
      { icon: <Mic className="w-4 h-4" />,           text: "Amazon Alexa intégré — mains libres total" },
      { icon: <Zap className="w-4 h-4" />,           text: "Double mode : Mesh + Bluetooth simultané" },
      { icon: <Cloud className="w-4 h-4" />,         text: "Navigation GPS audio" },
      { icon: <Shield className="w-4 h-4" />,        text: "IPX5 — recharge rapide USB-C" },
    ],
    techSpecs: [
      { label: "Dimensions", value: "74,5 × 51,0 × 18,8 mm" },
      { label: "Poids", value: "79 g" },
      { label: "Recharge", value: "USB-C, 1,5 h" },
      { label: "Portée BT", value: "jusqu'à 10 m" },
      { label: "Étanchéité", value: "IPX5" },
      { label: "Garantie", value: "2 ans" },
    ],
  },
  "50r": {
    brand: "Sena", name: "50R", tagline: "La puissance du 50S, en plus compact",
    shortDesc: "Format 30% plus compact. Mesh 2.0, 8 riders, 2 km, 24 h. USB-C.",
    imageUrl: "https://www.sena.com/content/images/products/50R/50R-sena.png",
    accentColor: "rgba(201,151,58,0.18)",
    stats: [
      { icon: <Users className="w-5 h-5" />,   label: "Riders",    value: "8",     sub: "Mesh 2.0" },
      { icon: <Radio className="w-5 h-5" />,    label: "Portée",    value: "2 km",  sub: "Mesh" },
      { icon: <Battery className="w-5 h-5" />,  label: "Autonomie", value: "24 h",  sub: "conversation" },
      { icon: <Wifi className="w-5 h-5" />,     label: "BT",        value: "5.0",   sub: "Bluetooth" },
    ],
    highlights: [
      { icon: <Zap className="w-4 h-4" />,           text: "30% plus compact et léger que le 50S" },
      { icon: <Radio className="w-4 h-4" />,         text: "Mesh 2.0 identique au 50S" },
      { icon: <Volume2 className="w-4 h-4" />,       text: "Haut-parleurs premium intégrés" },
      { icon: <Mic className="w-4 h-4" />,           text: "Alexa intégré — mains libres total" },
      { icon: <Shield className="w-4 h-4" />,        text: "IPX5 — rechargement USB-C" },
      { icon: <CheckCircle2 className="w-4 h-4" />, text: "Idéal casques sport & intégraux" },
    ],
    techSpecs: [
      { label: "Dimensions", value: "60,0 × 45,0 × 18,0 mm" },
      { label: "Poids", value: "58 g" },
      { label: "Recharge", value: "USB-C, 1,5 h" },
      { label: "Portée BT", value: "jusqu'à 10 m" },
      { label: "Étanchéité", value: "IPX5" },
      { label: "Garantie", value: "2 ans" },
    ],
  },
  "30k": {
    brand: "Sena", name: "30K", tagline: "Mesh + Bluetooth dans un seul appareil",
    shortDesc: "Premier double-mode Sena. Mesh intercom + Bluetooth 4.1. 8 riders, 2 km, 12 h.",
    imageUrl: "https://www.sena.com/content/images/products/30K/30K-sena.png",
    accentColor: "rgba(201,151,58,0.15)",
    stats: [
      { icon: <Users className="w-5 h-5" />,   label: "Riders",    value: "8",     sub: "Mesh" },
      { icon: <Radio className="w-5 h-5" />,    label: "Portée",    value: "2 km",  sub: "Mesh" },
      { icon: <Battery className="w-5 h-5" />,  label: "Autonomie", value: "12 h",  sub: "conversation" },
      { icon: <Wifi className="w-5 h-5" />,     label: "BT",        value: "4.1+Mesh", sub: "double mode" },
    ],
    highlights: [
      { icon: <Radio className="w-4 h-4" />,         text: "Double mode : Mesh + Bluetooth 4.1" },
      { icon: <CheckCircle2 className="w-4 h-4" />, text: "Compatible tout l'écosystème Sena Mesh" },
      { icon: <Zap className="w-4 h-4" />,           text: "Appariement automatique en groupe" },
      { icon: <Radio className="w-4 h-4" />,         text: "Radio FM intégrée" },
      { icon: <Mic className="w-4 h-4" />,           text: "Commandes vocales Siri & Google Assistant" },
      { icon: <Shield className="w-4 h-4" />,        text: "Résistant aux intempéries IPX4" },
    ],
    techSpecs: [
      { label: "Dimensions", value: "73,0 × 50,0 × 18,5 mm" },
      { label: "Poids", value: "78 g" },
      { label: "Recharge", value: "Micro-USB, 2 h" },
      { label: "Radio FM", value: "76 – 108 MHz" },
      { label: "Étanchéité", value: "IPX4" },
      { label: "Garantie", value: "2 ans" },
    ],
  },
};

/* ─────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────── */
function StatBlock({ stat, delay }: { stat: StatItem; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex flex-col items-center justify-center text-center py-6 px-4"
      style={{ background: "rgba(201,151,58,0.05)", border: "1px solid rgba(201,151,58,0.2)" }}
    >
      <div className="mb-2" style={{ color: "#c9973a" }}>{stat.icon}</div>
      <p className="font-display leading-none mb-0.5" style={{ fontSize: "clamp(1.4rem,3vw,2rem)", color: "var(--c-text)" }}>{stat.value}</p>
      <p className="font-display text-[9px] uppercase tracking-[0.35em] mt-1" style={{ color: "rgba(201,151,58,0.7)" }}>{stat.label}</p>
      {stat.sub && <p className="text-[10px] mt-0.5" style={{ color: "var(--c-text-25)" }}>{stat.sub}</p>}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────── */
export default function IntercomDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [modalOpen, setModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const product = slug ? PRODUCTS[slug] : null;
  const compat  = slug ? COMPATIBILITY[slug] ?? [] : [];

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("installation_intercoms")
      .select("gallery_images")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.gallery_images && Array.isArray(data.gallery_images)) {
          setGallery(data.gallery_images as string[]);
        }
      });
  }, [slug]);

  if (!product) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center" style={{ background: "var(--c-surface-page)" }}>
          <p className="font-display text-white text-2xl mb-4">Produit introuvable</p>
          <Link to="/intercoms" className="font-display text-[11px] uppercase tracking-[0.3em]" style={{ color: "#c9973a" }}>
            ← Retour aux intercoms
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={`${product.brand} ${product.name} — Intercom moto | Desmet Équipement Wavre`}
        description={product.shortDesc}
      />

      {/* ══════════ HERO ══════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: "var(--c-surface-hero)", minHeight: "min(92vh, 760px)" }}
      >
        {/* Grain */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.045]" style={{ mixBlendMode: "overlay" }} aria-hidden="true">
          <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
          <rect width="100%" height="100%" filter="url(#g)"/>
        </svg>

        {/* Gold radial glow */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 55% 70% at 30% 50%, rgba(201,151,58,0.09), transparent 65%)" }} />

        {/* Carbon texture on right half */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-[0.03]"
          style={{
            backgroundImage: "repeating-linear-gradient(60deg,#c9973a 0,#c9973a 1px,transparent 0,transparent 50%),repeating-linear-gradient(-60deg,#c9973a 0,#c9973a 1px,transparent 0,transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative container mx-auto px-4 h-full flex flex-col lg:grid lg:grid-cols-2 lg:gap-0 pt-20 pb-16" style={{ minHeight: "inherit" }}>
          {/* LEFT — text */}
          <div className="flex flex-col justify-center pr-0 lg:pr-12">
            <Link
              to="/intercoms"
              className="inline-flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.35em] mb-10 w-fit transition-colors"
              style={{ color: "var(--c-text-30)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#c9973a"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--c-text-30)"}
            >
              <ArrowLeft className="w-3 h-3" /> Tous les intercoms
            </Link>

            {/* Brand badge */}
            <div className="inline-flex items-center gap-2 mb-5 w-fit px-3 py-1.5" style={{ border: "1px solid rgba(201,151,58,0.3)", background: "rgba(201,151,58,0.06)" }}>
              <Radio className="w-3 h-3" style={{ color: "#c9973a" }} />
              <span className="font-display text-[10px] uppercase tracking-[0.4em]" style={{ color: "#c9973a" }}>{product.brand} — Intercom Bluetooth</span>
            </div>

            {/* Model name */}
            <h1
              className="font-display text-white leading-none mb-3"
              style={{ fontSize: "clamp(5rem,16vw,10rem)", textShadow: "0 0 80px rgba(201,151,58,0.25), 0 0 160px rgba(201,151,58,0.1)" }}
            >
              {product.name}
            </h1>

            {/* Decorative line */}
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-16" style={{ background: "linear-gradient(to right, rgba(201,151,58,0.6), transparent)" }} />
              <div className="h-1 w-1 rotate-45" style={{ background: "#c9973a", opacity: 0.6 }} />
            </div>

            <p className="font-display text-xl mb-3" style={{ color: "#c9973a" }}>{product.tagline}</p>
            <p className="text-sm leading-relaxed mb-8 max-w-md" style={{ color: "var(--c-text-50)" }}>{product.shortDesc}</p>

            {/* Stats row — visible in hero */}
            <div className="grid grid-cols-4 gap-2 mb-8">
              {product.stats.map((s, i) => (
                <StatBlock key={i} stat={s} delay={0.15 + i * 0.07} />
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-3 font-display text-sm uppercase tracking-[0.25em] px-7 py-4 transition-all duration-300"
                style={{ background: "#c9973a", color: "#050505" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#d4a44a"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#c9973a"; }}
              >
                <Wrench className="w-4 h-4" /> Demander l'installation
              </button>
              <Link
                to="/intercoms"
                className="inline-flex items-center gap-2 font-display text-sm uppercase tracking-[0.2em] px-7 py-4 transition-all duration-300"
                style={{ border: "1px solid rgba(201,151,58,0.3)", color: "var(--c-text-50)", background: "transparent" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,151,58,0.6)"; (e.currentTarget as HTMLElement).style.color = "#c9973a"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,151,58,0.3)"; (e.currentTarget as HTMLElement).style.color = "var(--c-text-50)"; }}
              >
                Voir tous les modèles
              </Link>
            </div>
          </div>

          {/* RIGHT — product image */}
          <div className="hidden lg:flex items-center justify-center relative">
            {/* Halo glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(201,151,58,0.12), transparent 70%)" }}
            />
            {!imgError ? (
              <motion.img
                src={product.imageUrl}
                alt={`${product.brand} ${product.name}`}
                className="relative z-10 object-contain drop-shadow-2xl"
                style={{ maxHeight: "480px", maxWidth: "100%", filter: "drop-shadow(0 0 40px rgba(201,151,58,0.15))" }}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                onError={() => setImgError(true)}
              />
            ) : (
              /* Fallback when image fails */
              <div className="relative z-10 flex flex-col items-center justify-center" style={{ width: "320px", height: "320px", border: "1px solid rgba(201,151,58,0.15)", background: "rgba(201,151,58,0.03)" }}>
                <Radio className="w-16 h-16 mb-4" style={{ color: "rgba(201,151,58,0.3)" }} />
                <p className="font-display text-4xl" style={{ color: "rgba(201,151,58,0.4)" }}>{product.name}</p>
                <p className="font-display text-[10px] uppercase tracking-[0.4em] mt-2" style={{ color: "var(--c-text-20)" }}>{product.brand}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════ HIGHLIGHTS + COMPAT + SPECS ══════════ */}
      <section style={{ background: "var(--c-surface-page)" }} className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Points forts */}
            <div>
              <p className="font-display text-[10px] uppercase tracking-[0.45em] mb-6" style={{ color: "rgba(201,151,58,0.6)" }}>Points forts</p>
              <ul className="space-y-3">
                {product.highlights.map((h, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                    className="flex items-start gap-3"
                  >
                    <span className="shrink-0 mt-0.5" style={{ color: "#c9973a" }}>{h.icon}</span>
                    <span className="text-sm leading-snug" style={{ color: "var(--c-text-65)" }}>{h.text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Compatibilité */}
            <div>
              <p className="font-display text-[10px] uppercase tracking-[0.45em] mb-6" style={{ color: "rgba(201,151,58,0.6)" }}>Casques compatibles en boutique</p>
              <div className="space-y-4">
                {compat.map((group, gi) => (
                  <motion.div
                    key={gi}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: gi * 0.08 }}
                  >
                    <p className="font-display text-[11px] uppercase tracking-[0.3em] mb-1.5" style={{ color: "#c9973a" }}>{group.brand}</p>
                    <div className="space-y-1">
                      {group.models.map((m, mi) => (
                        <div key={mi} className="flex items-center gap-2.5 px-3 py-2" style={{ background: "var(--c-surface-card)", border: "1px solid rgba(201,151,58,0.1)" }}>
                          <div className="w-1 h-1 rounded-full shrink-0" style={{ background: "#c9973a" }} />
                          <span className="text-sm" style={{ color: "var(--c-text-60)" }}>{m}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
              <p className="mt-4 text-[10px] leading-relaxed" style={{ color: "var(--c-text-20)" }}>
                Compatibilité vérifiée selon les kits disponibles en boutique. Contactez-nous pour confirmation.
              </p>
            </div>

            {/* Specs techniques */}
            <div>
              <p className="font-display text-[10px] uppercase tracking-[0.45em] mb-6" style={{ color: "rgba(201,151,58,0.6)" }}>Fiche technique</p>
              <div className="space-y-0">
                {product.techSpecs.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex justify-between items-center py-3 px-4"
                    style={{
                      borderBottom: i < product.techSpecs.length - 1 ? "1px solid rgba(201,151,58,0.08)" : "none",
                      background: i % 2 === 0 ? "rgba(201,151,58,0.02)" : "transparent",
                    }}
                  >
                    <span className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--c-text-35)" }}>{s.label}</span>
                    <span className="text-sm font-display tracking-[0.1em]" style={{ color: "var(--c-text-75)" }}>{s.value}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA bloc */}
              <div className="mt-8 p-5" style={{ background: "rgba(201,151,58,0.05)", border: "1px solid rgba(201,151,58,0.18)" }}>
                <p className="font-display text-[10px] uppercase tracking-[0.4em] mb-2" style={{ color: "rgba(201,151,58,0.6)" }}>Service en boutique</p>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--c-text-50)" }}>
                  Achetez le {product.brand} {product.name} chez nous — on l'installe proprement sur votre casque à Wavre.
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="w-full py-3 font-display text-xs uppercase tracking-[0.3em] transition-all duration-300 flex items-center justify-center gap-2"
                  style={{ background: "#c9973a", color: "#050505" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#d4a44a"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#c9973a"; }}
                >
                  <Wrench className="w-3.5 h-3.5" /> Demander l'installation
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════ GALLERY ══════════ */}
      {gallery.length > 0 && (
        <section style={{ background: "var(--c-surface-card)" }} className="py-14">
          <div className="container mx-auto px-4">
            <p className="font-display text-[10px] uppercase tracking-[0.45em] mb-6" style={{ color: "rgba(201,151,58,0.6)" }}>Photos</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {gallery.map((url, i) => (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => setLightbox(url)}
                  className="relative overflow-hidden rounded-lg aspect-square"
                  style={{ border: "1px solid rgba(201,151,58,0.12)" }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <img src={url} alt={`${product.brand} ${product.name} photo ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.9)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <button
              type="button"
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: "rgba(201,151,58,0.15)", border: "1px solid rgba(201,151,58,0.3)", color: "#c9973a" }}
              onClick={() => setLightbox(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <motion.img
              src={lightbox}
              alt=""
              className="max-h-[90vh] max-w-full object-contain rounded-lg"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <InstallationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        preselectedAccessoryType="Intercom Sena"
        preselectedIntercomModel={product.name}
      />
    </Layout>
  );
}
