import { motion } from "framer-motion";
import { ArrowRight, MapPin, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import storeImg from "@/assets/store-interior.jpg";

const FACTS = [
  { value: "491",   label: "Chaussée de Louvain, Wavre" },
  { value: "Arai",  label: "Revendeur officiel certifié" },
  { value: "4.4★",  label: "Note Google · 272 avis" },
  { value: "100%",  label: "Conseil personnalisé en magasin" },
];

const PILLARS = [
  {
    num: "01",
    title: "Des vrais motards",
    body: "L'équipe roule. Ce n'est pas du marketing — quand on vous parle d'un casque ou d'une veste, c'est parce qu'on les a portés. Ce point de vue change tout dans le conseil.",
  },
  {
    num: "02",
    title: "L'équipement avant tout",
    body: "Pas de motos à vendre. Notre seule spécialité : vous équiper. Casques, vestes, gants, bottes — chaque produit est sélectionné pour sa qualité réelle, pas pour sa marge.",
  },
  {
    num: "03",
    title: "Le temps de bien faire",
    body: "On ne vous pousse pas vers la sortie. On prend le temps d'essayer, d'ajuster, de comparer. Un équipement mal choisi, c'est un équipement inutile.",
  },
];

export default function AboutPage() {
  return (
    <Layout>
      <SEO
        title="À Propos — Desmet Équipement"
        description="Desmet Équipement, votre spécialiste en équipement moto à Wavre. Revendeur officiel Arai, Shoei, Alpinestars. Conseil par des passionnés."
      />

      <div className="bg-[#0e0e0e]">

        {/* ── Headline ───────────────────────────────────────────────────────── */}
        <div className="border-b border-[#c9973a]/10">
          <div className="container mx-auto px-4 pt-16 pb-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="mb-4 font-display text-[11px] uppercase tracking-[0.4em] text-[#c9973a]">
                Wavre · Belgique
              </p>
              <h1 className="font-display text-6xl uppercase leading-[0.92] tracking-tight text-white md:text-8xl lg:text-[9rem]">
                Desmet<br />
                <span className="text-[#c9973a]">Équipement</span>
              </h1>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-white/45 md:text-base">
                Spécialiste indépendant en équipement moto. Un magasin, une équipe,
                une seule obsession — vous équiper juste.
              </p>
            </motion.div>
          </div>
        </div>

        {/* ── Facts strip ────────────────────────────────────────────────────── */}
        <div className="border-b border-[#c9973a]/10 bg-[#0a0a0a]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {FACTS.map((f, i) => (
                <motion.div
                  key={f.value}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="border-r border-[#c9973a]/10 px-6 py-7 last:border-r-0 [&:nth-child(2)]:border-r-0 md:[&:nth-child(2)]:border-r"
                >
                  <p className="font-display text-2xl uppercase tracking-tight text-[#c9973a] md:text-3xl">
                    {f.value}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/35">
                    {f.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Photo + intro ──────────────────────────────────────────────────── */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">

            {/* Photo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="relative"
            >
              <img
                src={storeImg}
                alt="Intérieur du magasin Desmet Équipement"
                className="w-full"
                style={{ height: "auto", display: "block" }}
              />
              {/* Gold corner accent */}
              <div className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-[#c9973a]" />
              <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-[#c9973a]" />
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="flex flex-col justify-center"
            >
              <p className="mb-3 font-display text-[10px] uppercase tracking-[0.35em] text-[#c9973a]">
                Notre histoire
              </p>
              <h2 className="font-display text-4xl uppercase leading-tight text-white md:text-5xl">
                Un magasin fait par des motards, pour des motards.
              </h2>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-white/50">
                <p>
                  Desmet Équipement s'est construit sur une idée simple : les motards méritent
                  un conseil honnête de la part de gens qui connaissent vraiment le sujet.
                  Pas un vendeur qui lit une fiche produit — quelqu'un qui a roulé avec.
                </p>
                <p>
                  Installé Chaussée de Louvain à Wavre, le magasin accueille les motards
                  de toute la région. Revendeur officiel Arai, Shoei, Alpinestars, Richa
                  et d'autres grandes marques — toujours avec la même exigence sur la qualité
                  et le fitting.
                </p>
                <p>
                  L'essai en magasin n'est pas une option ici, c'est la règle. Parce qu'un
                  casque se choisit sur la tête, pas sur une fiche technique.
                </p>
              </div>

              <Link
                to="/contact"
                className="mt-8 inline-flex w-fit items-center gap-2 border border-[#c9973a]/40 px-6 py-3 font-display text-xs uppercase tracking-[0.24em] text-[#c9973a] transition-all duration-200 hover:border-[#c9973a] hover:bg-[#c9973a]/8"
              >
                Nous rendre visite <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* ── Pillars ────────────────────────────────────────────────────────── */}
        <div className="border-t border-[#c9973a]/10 bg-[#0a0a0a]">
          <div className="container mx-auto px-4 py-14">
            <p className="mb-10 font-display text-[10px] uppercase tracking-[0.35em] text-white/25">
              Ce qui nous différencie
            </p>
            <div className="grid gap-px md:grid-cols-3" style={{ background: "rgba(201,151,58,0.08)" }}>
              {PILLARS.map((p, i) => (
                <motion.div
                  key={p.num}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="bg-[#0a0a0a] px-8 py-8"
                >
                  <span className="font-display text-5xl leading-none text-[#c9973a]/20">{p.num}</span>
                  <h3 className="mt-3 font-display text-xl uppercase tracking-[0.08em] text-white">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/45">{p.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Contact block ──────────────────────────────────────────────────── */}
        <div className="border-t border-[#c9973a]/10">
          <div className="container mx-auto px-4 py-14">
            <div className="grid gap-8 md:grid-cols-2 md:items-end">
              <div>
                <p className="mb-3 font-display text-[10px] uppercase tracking-[0.35em] text-[#c9973a]">
                  Nous trouver
                </p>
                <h2 className="font-display text-4xl uppercase leading-tight text-white md:text-5xl">
                  Venez nous voir<br />à Wavre.
                </h2>
              </div>
              <div className="space-y-4">
                <a
                  href="https://maps.app.goo.gl/usjUYzvsD9vi72BD8?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 group"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#c9973a]" />
                  <span className="text-sm text-white/50 transition-colors group-hover:text-white">
                    Chaussée de Louvain 491<br />1300 Wavre, Belgique
                  </span>
                </a>
                <a href="tel:+3210842139" className="flex items-center gap-3 group">
                  <Phone className="h-4 w-4 shrink-0 text-[#c9973a]" />
                  <span className="text-sm text-white/50 transition-colors group-hover:text-white">
                    +32 10 84 21 39
                  </span>
                </a>
                <a href="mailto:admindesmetequipement@gmail.com" className="flex items-center gap-3 group">
                  <Mail className="h-4 w-4 shrink-0 text-[#c9973a]" />
                  <span className="text-sm text-white/50 transition-colors group-hover:text-white">
                    admindesmetequipement@gmail.com
                  </span>
                </a>
                <p className="pt-1 text-[11px] uppercase tracking-[0.18em] text-white/25">
                  Mar–Ven 10h–18h · Sam 10h–17h
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
