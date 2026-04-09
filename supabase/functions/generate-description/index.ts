import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Product-specific descriptions keyed by "brand|name" (lowercase)
const PRODUCT_DESCRIPTIONS: Record<string, string> = {
  // ── SHOEI ──────────────────────────────────────────────────────────────────
  "shoei|gt-air 3": `Le GT-Air 3 est le casque sport-touring de référence chez Shoei. Intégral à écran solaire intégré, il conjugue silence aérodynamique, ventilation à 4 entrées d'air et confort longue distance sans compromis.\n\nCoque AIM+, écran VAS-V Pinlock 120 Max Vision inclus, compatible Sena SRL3, intérieur 3D Fit amovible et lavable. Homologué ECE 22.06.`,

  "shoei|nxr2": `Le NXR2 incarne la philosophie sport-touring de Shoei dans un gabarit ultra-compact et léger. Taillé pour les motards qui veulent les performances d'un intégral racing avec le confort d'une utilisation quotidienne.\n\nCoque AIM+, système QRM+ pour retrait rapide des joues, écran CWR-F2 Pinlock 70 inclus, ventilation centrale optimisée. Homologué ECE 22.06.`,

  "shoei|neotec 3": `Le Neotec 3 est le modulable premium de Shoei — ouverture one-touch d'une seule main même avec des gants, double homologation intégral et jet. Le compagnon idéal pour les grandes distances.\n\nÉcran solaire intégré, compatible Sena SRL3, ventilation à 5 entrées, coque AIM+ composite, intérieur Moist-Tech amovible. Homologué ECE 22.06 P/J.`,

  "shoei|x-spr pro": `Le X-SPR Pro est le casque racing de route le plus abouti de Shoei, directement inspiré du X-Fifteen de MotoGP. Pour les amateurs de sport et de circuit exigeant le meilleur.\n\nCoque AIM+ ultra-légère, ventilation circuit optimisée en soufflerie, écran CWR-F2 Pinlock 120 Max Vision, spoiler arrière réglable. Homologué ECE 22.06.`,

  // ── SHARK ───────────────────────────────────────────────────────────────────
  "shark|spartan rs": `Le Spartan RS est le casque sport de Shark au rapport qualité/prix imbattable. Sa coque en fibre de verre multi-densité offre légèreté et rigidité pour une conduite dynamique sur route et sur circuit.\n\nVentilation agressive 3 entrées, écran Large VZ100 Quick Release, préparé intercom, intérieur Ritmo amovible et lavable. Homologué ECE 22.06.`,

  "shark|d-skwal 3": `Le D-Skwal 3 innove avec son système LED intégré à la nuque, rechargeable USB-C, pour être vu de nuit et par mauvais temps. Le casque urbain de Shark qui fait de la visibilité une priorité.\n\nLEDs rechargeables USB-C, coque ABS renforcé, écran anti-rayures grand champ, intérieur Sanitized® antibactérien. Homologué ECE 22.06.`,

  "shark|skwal i3": `Le Skwal i3 pousse l'innovation plus loin : ses LEDs arrière s'activent automatiquement au freinage, en guise de feux stop. Une première mondiale qui renforce concrètement la sécurité sur route.\n\nCapteur de décélération intégré, recharge USB-C, coque composite légère, écran solaire intégré, visière Max Vision. Homologué ECE 22.06.`,

  "shark|oxo": `Le Shark OXO est le modulable haut de gamme de la marque, alliant rigidité de coque composite et facilité d'usage au quotidien. Pensé pour les touristes qui refusent de choisir entre confort et protection.\n\nCoque composite, écran solaire intégré, Pinlock 70 fourni, intérieur mémoire de forme, fermeture micrométrique. Homologué ECE 22.06 P/J.`,

  // ── NOLAN ───────────────────────────────────────────────────────────────────
  "nolan|n87 plus": `Le N87 Plus est le casque intégral polyvalent de Nolan, pensé pour le quotidien comme la longue distance. Son écran solaire intégré Comfort Fit et sa ventilation efficace le rendent facile à vivre par tous les temps.\n\nÉcran solaire intégré, fermeture Microlock 2, intérieur Clima Comfort amovible, compatible N-Com Bluetooth. Homologué ECE 22.06.`,

  "nolan|n120-1": `Le N120-1 est le casque aventure de Nolan, avec menton relevable et double écran pour s'adapter à toutes les situations — de la piste forestière à l'autoroute. Polyvalence totale, style affirmé.\n\nMenton relevable, écran solaire intégré, mentonnet amovible (usage jet), compatible N-Com, fermeture micrométrique. Homologué ECE 22.06 P/J.`,

  "nolan|n60-6 sport": `Le N60-6 Sport est l'entrée de gamme performante de Nolan — légèreté, bonne ventilation et compatibilité N-Com pour ceux qui veulent un casque fiable sans se ruiner.\n\nCoque en polycarbonate renforcé, ventilation frontale réglable, compatible N-Com Bluetooth, intérieur Clima Comfort amovible. Homologué ECE 22.06.`,

  // ── LS2 ─────────────────────────────────────────────────────────────────────
  "ls2|ff811 vector ii": `Le FF811 Vector II est la preuve que performance et accessibilité ne s'excluent pas. Sa coque KPA en fibre composite offre un poids et une rigidité dignes de casques bien plus onéreux.\n\nCoque Kinetic Polymer Alloy, ventilation frontale + occipitale, écran anti-rayures avec Pinlock 70 inclus, intérieur 3D amovible. Homologué ECE 22.06.`,

  "ls2|ff906 advant": `Le FF906 Advant est le modulable LS2 le plus complet — menton basculant d'une main, double homologation et Pinlock inclus pour un prix remarquablement accessible.\n\nDouble homologation intégral/modulable, écran solaire intégré, Pinlock 70 fourni, intérieur antibactérien amovible. Homologué ECE 22.06 P/J.`,

  // ── SCORPION ────────────────────────────────────────────────────────────────
  "scorpion|exo-r1 evo air": `L'EXO-R1 Evo Air est le casque sport flagship de Scorpion — coque KDF en fibres composites pour une légèreté et une rigidité de haut niveau, avec une ventilation Airfit entièrement réglable.\n\nCoque Kwikwick Dry Fiber, ventilation Airfit, Pinlock 120 Max Vision inclus, calottes interchangeables, mentonnet Turbine Channel. Homologué ECE 22.06.`,

  "scorpion|exo-520 evo air": `L'EXO-520 Evo Air conjugue sport et touring dans un casque à écran solaire intégré et ventilation généreuse. Le choix équilibré pour les motards qui roulent loin sans se priver de sensations.\n\nÉcran solaire Pinlock ready, ventilation Airfit, intérieur Kwikwick 3 amovible, préparé intercom, fermeture micrométrique. Homologué ECE 22.06.`,

  // ── ALPINESTARS ─────────────────────────────────────────────────────────────
  "alpinestars|supertech r10": `Le Supertech R10 est le casque racing d'Alpinestars — coque Dyneema Ultra Fibre parmi les plus légères du marché, issue directement de la compétition mondiale. Pour ceux qui n'acceptent aucun compromis.\n\nCoque carbone/Dyneema, ventilation CRS circuit, Pinlock 120 Max Vision inclus, mentonnet carbone, intérieur RaceFit. Homologué ECE 22.06 / FIM.`,

  // ── ARAI ────────────────────────────────────────────────────────────────────
  "arai|rx-7v evo": `Le RX-7V Evo est le casque racing le plus abouti d'Arai, directement inspiré du MotoGP. Aérodynamisme extrême, stabilité à haute vitesse et protection maximale — le choix des pilotes professionnels.\n\nCoque PB-SNC2 composite premium, ventilation haute performance, écran VAS-V Pinlock Max Vision, champ de vision optimisé. Homologué ECE 22.06 / Snell.`,

  "arai|quantic": `Le Quantic est le casque sport-touring d'Arai — il réunit le confort d'un routier avec la protection d'un sport, dans une coque composite qui n'a pas d'équivalent à ce prix.\n\nCoque PB-SNC2, ventilation 5 entrées d'air, écran VAS-V Pinlock inclus, compatible intercom, intérieur Arai amovible. Homologué ECE 22.06.`,

  "arai|sz-r evo": `Le SZ-R Evo est le casque jet premium d'Arai — pour les motards qui revendiquent la liberté du jet sans sacrifier la qualité de fabrication et la protection d'une grande marque.\n\nCoque composite Arai, écran large déporté, ventilation optimisée basse vitesse, intérieur comfort amovible et lavable. Homologué ECE 22.06.`,

  // ── REV'IT ──────────────────────────────────────────────────────────────────
  "rev'it|sand 4 h2o": `La Sand 4 H2O est la veste adventure emblématique de Rev'It, renforcée d'une membrane imperméable intégrée. Polyvalente, robuste et parfaitement équilibrée pour les grands voyages sur tous les terrains.\n\nMembrane SEEFLEX H2O, protections CE Lvl 1 épaules et coudes, poche dorsale incluse, doublure thermique amovible. CE Cat. II Lvl A.`,

  "rev'it|tornado 4 h2o": `La Tornado 4 H2O est la veste sport-touring imperméable de Rev'It — pensée pour les motards qui roulent quelle que soit la météo, sans renoncer au style ni à la liberté de mouvement.\n\nMembrane SEEFLEX imperméable, protections CE Lvl 1 épaules et coudes, inserts réfléchissants 360°, col coupe-vent. CE Cat. II.`,

  // ── DAINESE ─────────────────────────────────────────────────────────────────
  "dainese|smart jacket ls d-air": `Le Smart Jacket LS est le gilet airbag autonome de Dainese — sans cordon, compatible avec n'importe quelle veste, il offre une protection dorsale et thoracique complète activée en moins de 45 ms.\n\nSystème D-Air autonome GPS + capteurs inertiels, gonflage < 45 ms, rechargeable USB, jusqu'à 10 activations. Compatible toutes tenues.`,

  // ── TCX ─────────────────────────────────────────────────────────────────────
  "tcx|comp evo 2": `La Comp Evo 2 est la botte racing homologuée de TCX, directement inspirée de la compétition. Sa construction cuir pleine fleur et ses renforts TPU offrent une protection maximale pour les tracés sportifs.\n\nCuir pleine fleur, renforts TPU tibia/talon/cheville, fermeture Velcro + boucle métal, semelle anti-dérapante. Homologuée CE Lvl 2.`,

  "tcx|street ace wp": `La Street Ace WP est la botte urbaine imperméable de TCX — look sneaker discret, protection moto sérieuse. Pour ceux qui veulent une protection réelle sans sacrifier leur style en ville.\n\nMembrane X-Dry imperméable/respirante, protection malléoles et tibia, semelle grip antidérapante, tige renforcée. Homologuée CE Lvl 1.`,

  // ── GIVI ────────────────────────────────────────────────────────────────────
  "givi|v58 maxia 5": `Le V58 Maxia 5 est le top case voyageur de référence chez Givi — 58 litres de volume pour deux casques intégraux, fermeture double sécurité et design aérodynamique éprouvé sur toutes les routes.\n\n58 litres, 2 casques intégraux, serrure double fermeture, rétroviseur intégré, fixation Monokey universelle.`,

  // ── BERING ──────────────────────────────────────────────────────────────────
  "bering|reach lady": `La Reach Lady est la veste adventure coupe femme de Bering — imperméable, respirante et conçue pour les grandes distances, avec une coupe adaptée à la morphologie féminine sans compromis sur la protection.\n\nMembrane Bering Dry, protections CE Lvl 1 épaules et coudes, poche dorsale, compatibilité gilet chauffant, doublure thermique amovible. CE Cat. II.`,

  // ── RICHA ───────────────────────────────────────────────────────────────────
  "richa|stockholm 2": `La Stockholm 2 est la veste sport-touring haut de gamme de Richa — la marque belge livre ici une construction textile imperméable et respirante avec protection dorsale Lvl 2 d'série, rare à ce positionnement.\n\nMembrane Aquamax, protections CE Lvl 1 épaules/coudes + dorsale Lvl 2 incluse, inserts réfléchissants, doublure thermique. CE Cat. II.`,

  // ── SENA ────────────────────────────────────────────────────────────────────
  "sena|sf2": `Le SF2 est l'intercom Bluetooth slim-line de Sena — un profil ultra-fin qui s'intègre discrètement dans tous les casques pour communiquer à deux, jusqu'à 900 mètres de portée.\n\nBluetooth 3.0, portée 900 m, 2 riders simultanés, autonomie 8 h, microphone filaire + tour de cou inclus. Certifié IP54.`,
};

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

// Smart fallback based on category + brand
const CAT_FALLBACK: Record<string, { intro: string[]; specs: string[] }> = {
  casques: {
    intro: [
      "confort longue distance et protection certifiée pour tous les types de trajets",
      "aérodynamisme travaillé et ventilation active pour rouler par tous les temps",
      "légèreté et rigidité issues d'une coque composite soigneusement étudiée",
    ],
    specs: [
      "coque composite, ventilation réglable, écran anti-rayures Pinlock ready, intérieur amovible. Homologué ECE 22.06.",
      "aérodynamique optimisée, évent d'urgence, intérieur 3D amovible, écran large champ. Homologué ECE 22.06.",
      "système de fermeture sécurisé, aération frontale et occipitale, mousse hypoallergénique amovible. Homologué ECE 22.06.",
    ],
  },
  vestes: {
    intro: [
      "imperméabilité certifiée et liberté de mouvement pour les longues distances",
      "protection tous temps et respirabilité en toutes saisons",
    ],
    specs: [
      "membrane imperméable, protections CE Lvl 1 épaules et coudes, doublure thermique amovible. CE Cat. II.",
      "tissu haute résistance, renforts aux zones d'impact, inserts réfléchissants. CE Cat. II.",
    ],
  },
  bottes: {
    intro: ["protection certifiée et confort de marche pour la route comme la ville"],
    specs: ["membrane imperméable, protection malléoles et tibia, semelle antidérapante. Homologué CE."],
  },
  bagagerie: {
    intro: ["volume généreux et fixation universelle pour tous les voyages moto"],
    specs: ["fermeture double sécurité, réflecteurs intégrés, système de fixation rapide."],
  },
  accessoires: {
    intro: ["technologie Bluetooth pensée pour les motards connectés"],
    specs: ["intercom haute performance, autonomie longue durée, connexion multi-appareils."],
  },
};

function getCatKey(cat: string): string {
  const c = cat.toLowerCase();
  if (c.includes("casque")) return "casques";
  if (c.includes("veste") || c.includes("blouson") || c.includes("jacket")) return "vestes";
  if (c.includes("botte") || c.includes("chaussure")) return "bottes";
  if (c.includes("bagag") || c.includes("top case") || c.includes("sac")) return "bagagerie";
  return "accessoires";
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, brand, category, price } = await req.json();

    if (!name || !brand) {
      return new Response(JSON.stringify({ error: "name and brand are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = `${normalize(brand)}|${normalize(name)}`;
    let description = PRODUCT_DESCRIPTIONS[key] ?? null;

    // Fallback: inject price into known description if missing
    if (!description) {
      const catKey = getCatKey(category || "");
      const tpl = CAT_FALLBACK[catKey] ?? CAT_FALLBACK.accessoires;
      const priceStr = price
        ? `, positionné à ${Number(price).toLocaleString("fr-BE", { minimumFractionDigits: 2 })} €`
        : "";
      const para1 = `Le ${brand} ${name} est un équipement ${category || "moto"} conçu pour ${pick(tpl.intro)}${priceStr}.`;
      const para2 = pick(tpl.specs) + ` Disponible chez Desmet Équipement à Wavre.`;
      description = `${para1}\n\n${para2}`;
    } else if (price) {
      // Append price note if not already in description
      const priceStr = Number(price).toLocaleString("fr-BE", { minimumFractionDigits: 2 });
      if (!description.includes(priceStr) && !description.includes("€")) {
        description += `\n\nPrix conseillé : ${priceStr} €. Disponible chez Desmet Équipement à Wavre.`;
      }
    }

    return new Response(JSON.stringify({ description }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
