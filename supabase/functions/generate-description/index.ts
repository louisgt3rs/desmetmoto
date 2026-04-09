import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Category-based templates
const CATEGORY_TEMPLATES: Record<string, { accroche: string[]; specs: string[] }> = {
  casques: {
    accroche: [
      "confort longue distance et protection homologuée ECE 22.06",
      "aérodynamisme travaillé et ventilation optimisée pour toutes les saisons",
      "légèreté et rigidité issues de la compétition, adaptées à la route",
      "confort intérieur premium et réduction du bruit remarquable",
      "polyvalence route/circuit dans une coque composite performante",
    ],
    specs: [
      "coque composite légère, ventilation active, écran anti-rayures Pinlock ready, intérieur amovible et lavable",
      "système de fermeture à double anneau, aération frontale et occipitale réglable, mousse hypoallergénique",
      "coque en fibre de verre, extracteur d'air arrière, compatibilité intercom, certification ECE 22.06",
      "aérodynamique optimisée en soufflerie, évent d'urgence, intérieur 3D amovible, homologation ECE 22.06",
    ],
  },
  vestes: {
    accroche: [
      "protection tous temps et liberté de mouvement pour les longues distances",
      "imperméabilité certifiée et respirabilité en toutes saisons",
      "construction robuste pensée pour l'adventure et les grands voyages",
      "coupe ajustée et protections intégrées pour le quotidien comme le sport",
    ],
    specs: [
      "membrane imperméable et respirante, protections CE Lvl 1 épaules et coudes, poche dorsale incluse, doublure thermique amovible",
      "tissu haute résistance à l'abrasion, renforts aux zones d'impact, inserts réfléchissants, compatibilité airbag",
      "fermeture zip étanche, poches ventilées, ajustement taille et manches, CE Cat. II",
    ],
  },
  bottes: {
    accroche: [
      "protection cheville certifiée et confort de marche au quotidien",
      "construction robuste pour la route comme la ville, imperméable et respirante",
      "look discret et protection sérieuse, idéal pour les trajets urbains et longue distance",
    ],
    specs: [
      "membrane imperméable, protection malléoles et tibia, semelle antidérapante, certification CE Lvl 1",
      "cuir pleine fleur, renforts TPU, fermeture sécurisée, certification CE Lvl 2",
      "tige haute résistance, protection interne renforcée, semelle grip, homologation CE",
    ],
  },
  gants: {
    accroche: [
      "grip optimal et protection certifiée pour toutes les conditions",
      "confort et sensations de conduite préservées, protection homologuée CE",
    ],
    specs: [
      "coque en TPR sur les doigts, paume renforcée, fermeture poignet réglable, CE Cat. II Lvl 1",
      "membrane imperméable, inserts réfléchissants, doublure thermique, certification CE KP",
    ],
  },
  bagagerie: {
    accroche: [
      "volume généreux et fixation universelle pour tous les voyages moto",
      "étanchéité certifiée et accès rapide pour les grandes aventures",
    ],
    specs: [
      "volume optimisé, fermeture double sécurité, réflecteurs intégrés, compatibilité universelle",
      "structure rigide légère, serrure anti-vibration, système de fixation rapide, étanchéité IP65",
    ],
  },
  airbags: {
    accroche: [
      "protection corporelle maximale, activation automatique en moins de 100 ms",
      "gilet airbag autonome compatible avec toutes les tenues moto",
    ],
    specs: [
      "système de détection électronique, gonflage en moins de 100 ms, rechargeable, protection thoracique et dorsale CE",
      "capteurs inertiels haute précision, batterie longue durée, activation sans cordon, certification CE Lvl 2",
    ],
  },
};

// Brand positioning
const BRAND_TONE: Record<string, string> = {
  shoei: "la référence japonaise en matière de sécurité et de confort premium",
  arai: "la philosophie artisanale japonaise au service de la protection maximale",
  shark: "l'innovation française alliant design audacieux et performance prouvée",
  nolan: "le savoir-faire italien au service du motard polyvalent",
  "ls2": "le rapport performance/prix qui démocratise l'équipement haut de gamme",
  scorpion: "la technicité française pour le sport et le touring exigeant",
  alpinestars: "l'héritage racing direct de la compétition mondiale",
  "rev'it": "l'ingénierie néerlandaise au service du style et de la protection",
  dainese: "le pionnier de la protection active, de la piste à la route",
  bering: "l'équipement textile expert conçu pour l'Europe et ses conditions",
  richa: "la qualité belge, robustesse et protection pensées pour durer",
  tcx: "la botte technique italienne, du circuit à la ville",
  givi: "la référence mondiale en bagagerie moto, fiabilité et praticité",
  sena: "le leader mondial de la communication Bluetooth pour motards",
  cardo: "la technologie Mesh pour communiquer en groupe sans limites",
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getCategoryKey(category: string): string {
  const c = category.toLowerCase();
  if (c.includes("casque")) return "casques";
  if (c.includes("veste") || c.includes("blouson") || c.includes("jacket")) return "vestes";
  if (c.includes("botte") || c.includes("chaussure")) return "bottes";
  if (c.includes("gant")) return "gants";
  if (c.includes("bagag") || c.includes("top case") || c.includes("sac")) return "bagagerie";
  if (c.includes("airbag") || c.includes("gilet")) return "airbags";
  return "casques"; // default
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

    const catKey = getCategoryKey(category || "");
    const tpl = CATEGORY_TEMPLATES[catKey] ?? CATEGORY_TEMPLATES.casques;
    const brandKey = brand.toLowerCase().trim();
    const brandTone = BRAND_TONE[brandKey] ?? `une référence reconnue dans l'équipement moto`;
    const priceStr = price ? `${Number(price).toLocaleString("fr-BE", { minimumFractionDigits: 2 })} €` : null;

    const accroche = pick(tpl.accroche);
    const specs = pick(tpl.specs);

    const para1 = `Le ${brand} ${name} incarne ${brandTone}. Conçu pour ${accroche}, il répond aux exigences des motards les plus attentifs à leur équipement${priceStr ? `, positionné à ${priceStr}` : ""}.`;

    const para2 = `${specs}. Disponible chez Desmet Équipement à Wavre, en essayage et conseil personnalisé.`;

    const description = `${para1}\n\n${para2}`;

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
