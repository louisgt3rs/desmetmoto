import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function n(s: string) { return s.toLowerCase().trim(); }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// ─── INTERCOMS ───────────────────────────────────────────────────────────────

const INTERCOM_MODELS: Record<string, string> = {
  // SENA
  "sena|50s":    `Le Sena 50S est le haut de gamme de la gamme Sena, équipé de la technologie Mesh 2.0 pour des communications de groupe jusqu'à 24 motards sans limite de distance intermédiaire. Son audio HD et son processeur de son ambiant en font le compagnon ultime des grandes sorties.\n\nConnectivité Mesh 2.0 + Bluetooth 5, portée point à point 2 km, autonomie 13 h, contrôle vocal, compatible assistant vocal. Disponible chez Desmet Équipement à Wavre.`,
  "sena|50r":    `Le Sena 50R reprend la technologie Mesh 2.0 du 50S dans un boîtier ultra-compact et discret, pensé pour les casques à faible espace. Même puissance audio, même portée, profil minimal.\n\nMesh 2.0 + Bluetooth 5, portée 2 km, autonomie 13 h, profil slim, microphone à réduction de bruit. Disponible chez Desmet Équipement à Wavre.`,
  "sena|30k":    `Le Sena 30K a inauguré le réseau Mesh pour les groupes de motards — communication simultanée jusqu'à 16 riders sans appairage individuel. La solution de groupe par excellence.\n\nMesh Intercom 1.0, 16 riders simultanés, portée 2 km, Bluetooth 4.1, autonomie 12 h. Disponible chez Desmet Équipement à Wavre.`,
  "sena|20s evo":`Le Sena 20S Evo est le best-seller mondial de la communication moto — Bluetooth 4.1, son stéréo HD, jusqu'à 8 riders en conférence et une interface jog-dial intuitive même avec des gants.\n\nBluetooth 4.1, 8 riders, portée 2 km, Jog Dial, autonomie 13 h, son HD. Disponible chez Desmet Équipement à Wavre.`,
  "sena|10s":    `Le Sena 10S offre les fonctions essentielles — appels, musique, intercom 4 riders — dans un boîtier robuste et facile à installer, à un prix accessible.\n\nBluetooth 3.0+, 4 riders, portée 900 m, autonomie 10 h, installation universelle. Disponible chez Desmet Équipement à Wavre.`,
  "sena|sf4":    `Le Sena SF4 est la référence entrée de gamme slim — profil fin, installation rapide, intercom 4 riders et audio clair pour les motards qui débutent en communication Bluetooth.\n\nBluetooth 3.0, 4 riders, portée 900 m, autonomie 10 h, format ultra-fin. Disponible chez Desmet Équipement à Wavre.`,
  "sena|sf2":    `Le SF2 est l'intercom Bluetooth slim-line de Sena — profil ultra-fin pour s'intégrer discrètement dans tous les casques, communication à deux, jusqu'à 900 m de portée.\n\nBluetooth 3.0, portée 900 m, 2 riders, autonomie 8 h, microphone filaire inclus. Disponible chez Desmet Équipement à Wavre.`,
  "sena|srl3":   `Le Sena SRL3 est conçu exclusivement pour les casques Shoei — il s'encastre parfaitement dans les cavités prévues à cet effet pour une intégration invisible et une qualité audio optimale.\n\nCompatible Shoei exclusivement, Mesh 2.0 + Bluetooth 5, portée 2 km, autonomie 8 h, microphone intégré. Disponible chez Desmet Équipement à Wavre.`,
  // CARDO
  "cardo|packtalk edge":  `Le Cardo PackTalk Edge est le vaisseau amiral de Cardo — réseau DMesh dynamique, son signé JBL et recharge sans fil par induction. La référence absolue pour les groupes de motards exigeants.\n\nDMesh illimité, son JBL 45 mm, recharge inductive, portée 1,6 km, autonomie 13 h, commandes tactiles. Disponible chez Desmet Équipement à Wavre.`,
  "cardo|packtalk bold":  `Le PackTalk Bold introduit le réseau Mesh dynamique de Cardo dans un boîtier robuste — connexion automatique entre riders, son JBL et portée jusqu'à 1,6 km pour les grandes formations.\n\nDMesh illimité, JBL, portée 1,6 km, autonomie 13 h, étanche IP67. Disponible chez Desmet Équipement à Wavre.`,
  "cardo|packtalk slim":  `Le PackTalk Slim est la déclinaison compacte du PackTalk — même technologie DMesh de Cardo dans un profil fin compatible avec les casques à espace réduit.\n\nDMesh, portée 1,6 km, profil slim, autonomie 13 h, Bluetooth + Mesh. Disponible chez Desmet Équipement à Wavre.`,
  "cardo|freecom 4+":     `Le Freecom 4+ est l'intercom Bluetooth 4 riders de Cardo, sans réseau Mesh mais avec un audio de qualité et une prise en main immédiate — parfait pour les groupes réguliers.\n\nBluetooth 5, 4 riders, portée 1,2 km, autonomie 10 h, son naturel Cardo. Disponible chez Desmet Équipement à Wavre.`,
  "cardo|spirit hd":      `Le Cardo Spirit HD est la porte d'entrée dans l'écosystème Cardo — communication solo ou duo avec un son HD clair et une installation simple, pour les motards qui veulent l'essentiel.\n\nBluetooth 5.2, 2 riders, portée 800 m, son HD, autonomie 7 h. Disponible chez Desmet Équipement à Wavre.`,
  // MIDLAND
  "midland|btx2 pro s":   `Le Midland BTX2 Pro S est l'intercom haut de gamme de Midland, avec son stéréo HD et la technologie Interphone pour des conférences fluides jusqu'à 8 riders sur une portée de 1,6 km.\n\n8 riders, portée 1,6 km, son stéréo HD, autonomie 12 h, étanche IP65. Disponible chez Desmet Équipement à Wavre.`,
  "midland|btx1 pro s":   `Le Midland BTX1 Pro S offre des fonctionnalités professionnelles à un tarif accessible — intercom 4 riders, son stéréo et une construction robuste pensée pour toutes les conditions météo.\n\n4 riders, portée 1,6 km, son stéréo, étanche IP65, autonomie 10 h. Disponible chez Desmet Équipement à Wavre.`,
};

// ─── ACCESSORIES ─────────────────────────────────────────────────────────────

const ACC_MODELS: Record<string, string> = {
  // QUAD LOCK
  "quad lock|motorcycle mount pro":   `Le Quad Lock Motorcycle Mount Pro est le système de fixation moto le plus plébiscité au monde — verrouillage quart de tour instantané, vibrations absorbées par le système anti-vibration intégré, compatible tous smartphones.\n\nInstallation guidon universel, rotation 360°, système anti-vibration, libération sécurisée. Compatible coques Quad Lock. Disponible chez Desmet Équipement à Wavre.`,
  "quad lock|stem mount":             `Le Quad Lock Stem Mount se fixe sur la potence pour un positionnement central et stable du smartphone, idéal pour les motos à guidon tubulaire. Installation en quelques secondes, sans outils.\n\nCompatible potences 22-32 mm, rotation 360°, libération quart de tour. Disponible chez Desmet Équipement à Wavre.`,
  "quad lock|wireless charging head": `La tête de charge sans fil Quad Lock transforme n'importe quel support Quad Lock en chargeur induction — jusqu'à 7,5 W sur iPhone, 10 W sur Android, tout en maintenant le smartphone verrouillé.\n\nCharging sans fil 7,5 W / 10 W, étanche IPX6, connecteur USB-C. Disponible chez Desmet Équipement à Wavre.`,
  // SP CONNECT
  "sp connect|moto bundle":           `Le SP Connect Moto Bundle réunit le support moto et la coque de fixation pour une solution complète et élégante. Son système de glissière 3D offre un verrouillage sûr et une dépose en une main.\n\nSupport universel guidon 22-29 mm, rotation 360°, système de verrouillage 3D, anti-choc. Disponible chez Desmet Équipement à Wavre.`,
  "sp connect|phone case":            `La coque SP Connect est l'interface entre votre smartphone et tous les supports SP Connect — protection renforcée des bords et dos avec le système de fixation 3D intégré, compatible sans-fil.\n\nCompatible chargement sans fil, protection renforcée, système 3D, slim. Disponible chez Desmet Équipement à Wavre.`,
  // GIVI
  "givi|s901a":                       `Le Givi S901A est un support smartphone universel à fixation rapide, compatible avec la majorité des motos via les tiges de rétroviseur ou le guidon — robuste, résistant aux intempéries.\n\nFixation rétroviseur ou guidon, étanche, rotation réglable. Disponible chez Desmet Équipement à Wavre.`,
  // RAM MOUNTS
  "ram mounts|tough-strap":           `Le RAM Tough-Strap est la solution universelle pour fixer un support sur n'importe quel tube ou barre — sangles doubles résistantes aux UV, compatible toute la gamme RAM.\n\nSangles UV-résistantes, diamètre 12-50 mm, compatible bases RAM. Disponible chez Desmet Équipement à Wavre.`,
};

// ─── BRAND FALLBACKS ─────────────────────────────────────────────────────────

const BRAND_FALLBACKS: Record<string, (name: string, cat: string, price: string | null) => string> = {
  sena: (name, _cat, price) => {
    const mesh = /50|30k/i.test(name);
    const slim = /sf|slim/i.test(name);
    const p = price ? ` à partir de ${price}` : "";
    return `Le Sena ${name} est un intercom Bluetooth${mesh ? " Mesh" : ""} pensé pour les motards exigeants — ${slim ? "profil ultra-fin pour une intégration discrète dans tous les casques" : "audio HD et interface intuitive pour rouler connecté en toutes circonstances"}${p}.\n\n${mesh ? "Réseau Mesh multi-riders, " : "Bluetooth fiable, "}communication claire, appairage rapide, autonomie longue durée. Disponible chez Desmet Équipement à Wavre.`;
  },
  cardo: (name, _cat, price) => {
    const mesh = /packtalk|edge|bold/i.test(name);
    const jbl = /edge|bold/i.test(name);
    const p = price ? ` à partir de ${price}` : "";
    return `Le Cardo ${name} est la référence Cardo pour rouler connecté${mesh ? " en groupe grâce à la technologie DMesh" : ""}${p}. ${jbl ? "Le son signé JBL garantit une qualité audio premium même à haute vitesse." : "Une prise en main immédiate et un son naturel pour tous les trajets."}\n\n${mesh ? "Réseau DMesh illimité, " : "Bluetooth 5, "}portée longue distance, étanche, autonomie tout-terrain. Disponible chez Desmet Équipement à Wavre.`;
  },
  midland: (name, _cat, price) => {
    const p = price ? ` à partir de ${price}` : "";
    return `Le Midland ${name} est un intercom Bluetooth fiable et performant${p}, conçu pour les motards qui ne veulent pas sacrifier la qualité audio au prix.\n\nSon stéréo HD, portée multi-riders, construction étanche, installation universelle. Disponible chez Desmet Équipement à Wavre.`;
  },
  "quad lock": (name, _cat, price) => {
    const p = price ? ` à partir de ${price}` : "";
    return `Le support Quad Lock ${name} est la solution de fixation moto la plus sécurisée du marché — verrouillage quart de tour, aucun risque de décrochage, compatible tous smartphones avec coque Quad Lock${p}.\n\nInstallation sans outil, rotation 360°, résistant aux vibrations. Disponible chez Desmet Équipement à Wavre.`;
  },
  "sp connect": (name, _cat, price) => {
    const p = price ? ` à partir de ${price}` : "";
    return `Le SP Connect ${name} intègre le système de fixation 3D pour un maintien optimal du smartphone en toutes conditions${p}. Design élégant, libération d'une main, compatible chargement sans fil.\n\nVerrouillage 3D, anti-choc, rotation réglable, compatible toute la gamme SP Connect. Disponible chez Desmet Équipement à Wavre.`;
  },
  givi: (name, _cat, price) => {
    const p = price ? ` à partir de ${price}` : "";
    return `L'accessoire Givi ${name} s'inscrit dans la tradition de robustesse et de praticité de la marque italienne${p} — conçu pour les motards voyageurs qui ont besoin d'équipements fiables au quotidien.\n\nConstruction solide, fixation sécurisée, compatible moto universelle. Disponible chez Desmet Équipement à Wavre.`;
  },
};

// ─── CATEGORY FALLBACKS ──────────────────────────────────────────────────────

const CAT_FALLBACKS: Record<string, (brand: string, name: string, price: string | null) => string> = {
  intercom: (brand, name, price) => {
    const p = price ? ` à partir de ${price}` : "";
    return `Le ${brand} ${name} est un intercom Bluetooth conçu pour la communication moto${p} — audio clair même à haute vitesse, appairage simple, autonomie longue durée pour les grandes sorties.\n\nInstallation universelle, résistant aux intempéries, compatible musique et appels. Disponible chez Desmet Équipement à Wavre.`;
  },
  "support téléphone": (brand, name, price) => {
    const p = price ? ` à partir de ${price}` : "";
    return `Le support ${brand} ${name} maintient votre smartphone en position optimale sur la moto${p} — fixation sécurisée, résistance aux vibrations et aux intempéries pour naviguer en toute confiance.\n\nInstallation rapide, rotation réglable, compatible smartphones universels. Disponible chez Desmet Équipement à Wavre.`;
  },
  "support gps": (brand, name, price) => {
    const p = price ? ` à partir de ${price}` : "";
    return `Le support GPS ${brand} ${name} assure une position stable de votre navigateur moto${p} — vibrations amorties, orientation réglable et résistance aux conditions météo les plus exigeantes.\n\nFixation robuste, anti-vibration, étanche. Disponible chez Desmet Équipement à Wavre.`;
  },
  "chargeur / alimentation": (brand, name, price) => {
    const p = price ? ` à partir de ${price}` : "";
    return `Le ${brand} ${name} alimente vos appareils embarqués directement depuis l'électronique de la moto${p} — charge rapide, protection contre les surtensions et les inversions de polarité.\n\nProtection multi-sécurité, sortie USB rapide, installation plug-and-play. Disponible chez Desmet Équipement à Wavre.`;
  },
  caméra: (brand, name, price) => {
    const p = price ? ` à partir de ${price}` : "";
    return `La caméra ${brand} ${name} capture chaque trajet en haute définition${p} — stabilisation intégrée, grand angle et résistance aux intempéries pour des images nettes quelle que soit la vitesse.\n\nEnregistrement HD, grand angle, résistant aux chocs et à la pluie. Disponible chez Desmet Équipement à Wavre.`;
  },
};

// ─── GENERIC FALLBACK ────────────────────────────────────────────────────────

function genericFallback(brand: string, name: string, category: string, price: string | null): string {
  const p = price ? ` à partir de ${price}` : "";
  return `Le ${brand} ${name} est un accessoire moto${category ? ` de la catégorie ${category}` : ""}${p}, sélectionné par Desmet Équipement pour sa fiabilité et son rapport qualité/prix.\n\nQualité éprouvée, installation simple, conçu pour les motards exigeants. Disponible chez Desmet Équipement à Wavre.`;
}

// ─── SERVE ────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { name, brand = "", category = "", price } = await req.json();

    if (!name) return new Response(JSON.stringify({ error: "name is required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    const priceStr = price
      ? `${Number(price).toLocaleString("fr-BE", { minimumFractionDigits: 2 })} €`
      : null;

    const key = `${n(brand)}|${n(name)}`;

    // 1. Exact match intercom
    let description = INTERCOM_MODELS[key] ?? ACC_MODELS[key] ?? null;

    // 2. Brand fallback
    if (!description) {
      const bf = BRAND_FALLBACKS[n(brand)];
      if (bf) description = bf(name, category, priceStr);
    }

    // 3. Category fallback
    if (!description) {
      const catKey = Object.keys(CAT_FALLBACKS).find(k => n(category).includes(k));
      if (catKey) description = CAT_FALLBACKS[catKey](brand, name, priceStr);
    }

    // 4. Category keyword detection from name
    if (!description) {
      const nm = n(name);
      if (/intercom|bluetooth|mesh|srl|communication/.test(nm)) {
        description = CAT_FALLBACKS["intercom"](brand, name, priceStr);
      } else if (/support|mount|holder|fix/.test(nm)) {
        description = CAT_FALLBACKS["support téléphone"](brand, name, priceStr);
      } else if (/charger|chargeur|usb|alimentation/.test(nm)) {
        description = CAT_FALLBACKS["chargeur / alimentation"](brand, name, priceStr);
      }
    }

    // 5. Generic
    if (!description) description = genericFallback(brand, name, category, priceStr);

    return new Response(JSON.stringify({ description }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
