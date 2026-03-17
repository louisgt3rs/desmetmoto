import { useState } from "react";
import { motion } from "framer-motion";
import { X, MapPin, ExternalLink, ShoppingBag } from "lucide-react";

interface ProductHighlight {
  name: string;
  image?: string;
}

interface BrandInfo {
  name: string;
  country: string;
  year: string;
  description: string;
  categories: string[];
  website: string;
  heroImage?: string;
  products: ProductHighlight[];
}

const brandData: Record<string, BrandInfo> = {
  "Arai": { name: "Arai", country: "🇯🇵 Japon", year: "1937", description: "Fabricant japonais légendaire de casques haut de gamme. Chaque casque est assemblé à la main avec un souci du détail inégalé. Référence absolue en matière de protection et de confort.", categories: ["Casques"], website: "https://www.araihelmet.eu", heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=300&fit=crop", products: [{ name: "RX-7V Evo" }, { name: "Profile-V" }, { name: "Quantic" }] },
  "Abus": { name: "Abus", country: "🇩🇪 Allemagne", year: "1924", description: "Spécialiste allemand de la sécurité depuis un siècle. Reconnu pour ses antivols robustes et ses solutions de protection innovantes pour motos.", categories: ["Antivols", "Sécurité"], website: "https://www.abus.com", heroImage: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&h=300&fit=crop", products: [{ name: "Granit Detecto 8077" }, { name: "Bordo 6000" }, { name: "Steel-O-Chain 880" }] },
  "Muc-Off": { name: "Muc-Off", country: "🇬🇧 Royaume-Uni", year: "1994", description: "Marque britannique spécialisée dans l'entretien et le nettoyage. Produits biodégradables et performants pour le soin de votre moto.", categories: ["Entretien", "Nettoyage"], website: "https://muc-off.com", heroImage: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&h=300&fit=crop", products: [{ name: "Nano Tech Cleaner" }, { name: "Motorcycle Protectant" }, { name: "Chain Lube" }] },
  "Bell Helmet": { name: "Bell Helmet", country: "🇺🇸 États-Unis", year: "1954", description: "Pionnier américain du casque moto, inventeur du casque intégral. Style iconique mêlant héritage racing et design moderne.", categories: ["Casques"], website: "https://www.bellhelmets.com", heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=300&fit=crop", products: [{ name: "Star DLX MIPS" }, { name: "Qualifier" }, { name: "Bullitt" }] },
  "Scoot": { name: "Scoot", country: "🇧🇪 Belgique", year: "2005", description: "Marque belge spécialisée dans les accessoires pour scooters et motos urbaines. Solutions pratiques et design.", categories: ["Accessoires", "Urbain"], website: "https://www.scoot.be", heroImage: "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=600&h=300&fit=crop", products: [{ name: "Tablier scooter" }, { name: "Manchons chauffants" }] },
  "Helite": { name: "Helite", country: "🇫🇷 France", year: "2002", description: "Inventeur français du gilet airbag moto. Technologie brevetée offrant une protection révolutionnaire en cas de chute.", categories: ["Protection", "Airbag"], website: "https://www.helite.com", heroImage: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=300&fit=crop", products: [{ name: "Turtle 2" }, { name: "GP Air 2" }, { name: "Free-Air Mesh" }] },
  "Bihr": { name: "Bihr", country: "🇫🇷 France", year: "1975", description: "Distributeur français majeur de pièces et accessoires moto. Catalogue immense couvrant toutes les marques.", categories: ["Pièces", "Accessoires"], website: "https://www.bihr.eu", heroImage: "https://images.unsplash.com/photo-1558981033-7c0a30c0db76?w=600&h=300&fit=crop", products: [{ name: "Filtres à air" }, { name: "Plaquettes de frein" }, { name: "Kits chaîne" }] },
  "TCX": { name: "TCX", country: "🇮🇹 Italie", year: "1999", description: "Fabricant italien de bottes moto techniques haut de gamme. Savoir-faire italien alliant protection, confort et style.", categories: ["Bottes", "Chaussures"], website: "https://www.tcxboots.com", heroImage: "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?w=600&h=300&fit=crop", products: [{ name: "RT-Race Pro Air" }, { name: "Street 3 Air" }, { name: "Dartwood GTX" }] },
  "Erwax": { name: "Erwax", country: "🇧🇪 Belgique", year: "2010", description: "Marque belge spécialisée dans les produits d'entretien pour le cuir et les textiles moto.", categories: ["Entretien", "Cuir"], website: "https://www.erwax.com", heroImage: "https://images.unsplash.com/photo-1558981033-7c0a30c0db76?w=600&h=300&fit=crop", products: [{ name: "Leather Cream" }, { name: "Textile Protector" }] },
  "D3O": { name: "D3O", country: "🇬🇧 Royaume-Uni", year: "1999", description: "Technologie britannique révolutionnaire de protection par impact. Matériau souple qui durcit instantanément à l'impact.", categories: ["Protection", "Technologie"], website: "https://www.d3o.com", heroImage: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=300&fit=crop", products: [{ name: "Ghost Back Protector" }, { name: "LP1 Knee" }, { name: "T5 EVO Pro" }] },
  "TomTom": { name: "TomTom", country: "🇳🇱 Pays-Bas", year: "1991", description: "Leader néerlandais de la navigation GPS. Solutions dédiées aux motards avec écrans lisibles et résistants.", categories: ["GPS", "Navigation"], website: "https://www.tomtom.com", heroImage: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=300&fit=crop", products: [{ name: "Rider 550" }, { name: "Rider 500" }] },
  "Richa": { name: "Richa", country: "🇧🇪 Belgique", year: "1956", description: "Équipementier belge proposant des vêtements moto techniques et abordables. Excellent rapport qualité-prix.", categories: ["Vestes", "Pantalons", "Gants"], website: "https://www.richa.eu", heroImage: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=300&fit=crop", products: [{ name: "Cyclone 2 GTX" }, { name: "Arc GTX" }, { name: "Cold Protect GTX" }] },
  "RST": { name: "RST", country: "🇬🇧 Royaume-Uni", year: "1988", description: "Marque britannique d'équipement moto au style racing affirmé. Textiles et cuirs techniques à prix compétitifs.", categories: ["Vestes", "Combinaisons", "Gants"], website: "https://www.rst-moto.com", heroImage: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=300&fit=crop", products: [{ name: "TracTech Evo 4" }, { name: "Pro Series Adventure" }, { name: "Pilot Evo CE" }] },
  "Kappa": { name: "Kappa", country: "🇮🇹 Italie", year: "1978", description: "Fabricant italien de bagagerie et accessoires moto. Top cases, valises et supports de qualité.", categories: ["Bagagerie", "Top cases"], website: "https://www.kaborr.com", heroImage: "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=600&h=300&fit=crop", products: [{ name: "KGR52N" }, { name: "KMS36B" }, { name: "KR2236" }] },
  "Cardo": { name: "Cardo", country: "🇮🇱 Israël", year: "2003", description: "Leader mondial des intercoms moto Bluetooth. Communication cristalline et technologie mesh révolutionnaire.", categories: ["Intercom", "Communication"], website: "https://www.cardosystems.com", heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=300&fit=crop", products: [{ name: "Packtalk Edge" }, { name: "Packtalk Bold" }, { name: "Spirit HD" }] },
  "Bering": { name: "Bering", country: "🇫🇷 France", year: "1925", description: "Équipementier français spécialiste des gants et vêtements moto. Savoir-faire centenaire dans la confection.", categories: ["Gants", "Vestes", "Pantalons"], website: "https://www.bfrench.com", heroImage: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=300&fit=crop", products: [{ name: "TX09" }, { name: "Drift" }, { name: "Renzo" }] },
  "Motul": { name: "Motul", country: "🇫🇷 France", year: "1853", description: "Fabricant français d'huiles et lubrifiants de haute performance. Plus de 170 ans d'expertise. Partenaire officiel du MotoGP.", categories: ["Huiles", "Lubrifiants", "Entretien"], website: "https://www.motul.com", heroImage: "https://images.unsplash.com/photo-1558981033-7c0a30c0db76?w=600&h=300&fit=crop", products: [{ name: "7100 4T 10W-40" }, { name: "Chain Lube Road" }, { name: "MC Care C1" }] },
  "SW-Motech": { name: "SW-Motech", country: "🇩🇪 Allemagne", year: "1999", description: "Spécialiste allemand d'accessoires moto de qualité premium. Ingénierie allemande de précision.", categories: ["Accessoires", "Bagagerie", "Protection"], website: "https://www.sw-motech.com", heroImage: "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=600&h=300&fit=crop", products: [{ name: "TRAX ADV" }, { name: "Legend Gear" }, { name: "EVO Carrier" }] },
  "Premier Helmet": { name: "Premier Helmet", country: "🇮🇹 Italie", year: "1956", description: "Fabricant italien de casques au design vintage et rétro. Icône du style café racer.", categories: ["Casques"], website: "https://www.premier.it", heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=300&fit=crop", products: [{ name: "Vintage Evo" }, { name: "Trophy" }, { name: "Le Petit" }] },
  "Shark": { name: "Shark", country: "🇫🇷 France", year: "1986", description: "Fabricant français de casques moto innovants et performants. Partenaire des plus grands pilotes MotoGP.", categories: ["Casques"], website: "https://www.shark-helmets.com", heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=300&fit=crop", products: [{ name: "Spartan RS" }, { name: "Evo-GT" }, { name: "D-Skwal 3" }] },
  "Garmin": { name: "Garmin", country: "🇺🇸 États-Unis", year: "1989", description: "Leader mondial des systèmes de navigation et GPS. Gamme dédiée moto avec le Zumo, robuste et étanche.", categories: ["GPS", "Navigation"], website: "https://www.garmin.com", heroImage: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=300&fit=crop", products: [{ name: "Zumo XT2" }, { name: "Zumo 396" }] },
  "Auvray": { name: "Auvray", country: "🇫🇷 France", year: "1977", description: "Fabricant français spécialisé dans les antivols moto haut de gamme. Bloque-disques et chaînes homologués SRA.", categories: ["Antivols", "Sécurité"], website: "https://www.auvray.fr", heroImage: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&h=300&fit=crop", products: [{ name: "B-Lock 10" }, { name: "Xtrem Mini SRA" }, { name: "Steelock" }] },
  "Sena": { name: "Sena", country: "🇺🇸 États-Unis", year: "1998", description: "Spécialiste américain des systèmes de communication Bluetooth pour motards. Connectivité avancée et son HD.", categories: ["Intercom", "Communication", "Caméras"], website: "https://www.sena.com", heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=300&fit=crop", products: [{ name: "50S" }, { name: "30K" }, { name: "Spider ST1" }] },
  "Alpinestars": { name: "Alpinestars", country: "🇮🇹 Italie", year: "1963", description: "Légende italienne de l'équipement moto et racing. Chaque produit incarne la performance au plus haut niveau.", categories: ["Bottes", "Vestes", "Gants", "Protection"], website: "https://www.alpinestars.com", heroImage: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=300&fit=crop", products: [{ name: "Tech-Air 5" }, { name: "Supertech R" }, { name: "GP Pro R4" }] },
  "Optimate": { name: "Optimate", country: "🇧🇪 Belgique", year: "1995", description: "Spécialiste belge des chargeurs de batterie intelligents. Référence chez les professionnels.", categories: ["Chargeurs", "Batteries"], website: "https://www.optimate1.com", heroImage: "https://images.unsplash.com/photo-1558981033-7c0a30c0db76?w=600&h=300&fit=crop", products: [{ name: "OptiMate 4" }, { name: "OptiMate Lithium" }] },
  "Bowtex": { name: "Bowtex", country: "🇫🇷 France", year: "2012", description: "Marque française innovante de sous-vêtements et protections textiles moto. Kevlar et fibres techniques.", categories: ["Protection", "Textile"], website: "https://www.bowtex.fr", heroImage: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=300&fit=crop", products: [{ name: "Standard CE" }, { name: "Elite CE" }] },
  "Fly Racing": { name: "Fly Racing", country: "🇺🇸 États-Unis", year: "1998", description: "Équipementier américain spécialisé dans le motocross et l'enduro. Esprit racing et tout-terrain.", categories: ["Casques", "Motocross", "Protection"], website: "https://www.flyracing.com", heroImage: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=300&fit=crop", products: [{ name: "Formula CC" }, { name: "Kinetic" }, { name: "Zone Pro" }] },
  "Six2": { name: "Six2", country: "🇮🇹 Italie", year: "2005", description: "Marque italienne de sous-vêtements techniques thermorégulants. Technologie Carbon Underwear brevetée.", categories: ["Sous-vêtements", "Thermique"], website: "https://www.six2.it", heroImage: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=300&fit=crop", products: [{ name: "TS1 Carbon" }, { name: "WTJ Wind Jersey" }] },
  "LS2": { name: "LS2", country: "🇪🇸 Espagne", year: "2007", description: "Fabricant espagnol de casques au rapport qualité-prix imbattable. Large gamme du jet au modulable.", categories: ["Casques"], website: "https://www.ls2helmets.com", heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=300&fit=crop", products: [{ name: "Thunder C" }, { name: "Advant X" }, { name: "Drifter" }] },
  "Midland": { name: "Midland", country: "🇮🇹 Italie", year: "1959", description: "Marque italienne de systèmes de communication radio et intercom. Qualité et simplicité d'utilisation.", categories: ["Intercom", "Communication"], website: "https://www.midlandeurope.com", heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=300&fit=crop", products: [{ name: "BT Next Pro" }, { name: "BTX2 Pro S" }] },
  "Zandona": { name: "Zandona", country: "🇮🇹 Italie", year: "1989", description: "Spécialiste italien des protections dorsales et corporelles. Technologies de niveau compétition.", categories: ["Protection dorsale", "Protections"], website: "https://www.zandona.net", heroImage: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=300&fit=crop", products: [{ name: "Spine EVC X8" }, { name: "Netcube" }, { name: "Hybrid Back Pro" }] },
  "Segura": { name: "Segura", country: "🇫🇷 France", year: "1964", description: "Maison française de blousons cuir et textile moto depuis 60 ans. Le chic à la française sur deux roues.", categories: ["Vestes cuir", "Gants", "Textile"], website: "https://www.segura-moto.fr", heroImage: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=300&fit=crop", products: [{ name: "Funky" }, { name: "Stripe" }, { name: "Connor" }] },
  "Shoei": { name: "Shoei", country: "🇯🇵 Japon", year: "1959", description: "Fabricant japonais de casques premium reconnu mondialement. Confort, aérodynamisme et sécurité au sommet.", categories: ["Casques"], website: "https://www.shoei.com", heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=300&fit=crop", products: [{ name: "X-SPR Pro" }, { name: "NXR2" }, { name: "Neotec 3" }] },
};

const brandNames = Object.keys(brandData);

function BrandModal({ brand, onClose }: { brand: BrandInfo; onClose: () => void }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backgroundColor: "rgba(0,0,0,0.9)" }}
      onClick={onClose}
    >
      <div
        style={{ position: "relative", width: "100%", maxWidth: "480px", maxHeight: "90vh", backgroundColor: "#111", border: "1px solid #222", borderRadius: "20px", overflow: "hidden", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          style={{ position: "absolute", top: "12px", right: "12px", zIndex: 10, width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "hsl(12 90% 52%)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.5)" }}
        >
          <X style={{ width: "18px", height: "18px", color: "#fff" }} />
        </button>

        <div style={{ overflowY: "auto", flex: 1 }}>
          {/* Hero image */}
          {brand.heroImage && (
            <div style={{ position: "relative", width: "100%", height: "180px", overflow: "hidden" }}>
              <img
                src={brand.heroImage}
                alt={brand.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, #111 100%)" }} />
            </div>
          )}

          {/* Brand identity */}
          <div style={{ padding: "0 1.5rem", marginTop: brand.heroImage ? "-40px" : "1.5rem", position: "relative", zIndex: 2, textAlign: "center" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "18px", backgroundColor: "#1a1a1a", border: "2px solid hsl(12 90% 52%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 0 30px rgba(192,57,43,0.4)" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "32px", color: "hsl(12 90% 52%)", fontWeight: 700 }}>
                {brand.name.charAt(0)}
              </span>
            </div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "32px", color: "#f2f2f2", margin: "0 0 4px", letterSpacing: "0.02em" }}>
              {brand.name}
            </h3>
            <p style={{ fontSize: "13px", color: "#777", margin: "0 0 16px" }}>
              {brand.country} · Depuis {brand.year}
            </p>
            <p style={{ fontSize: "14px", color: "#999", lineHeight: 1.7, margin: "0 0 20px", textAlign: "left" }}>
              {brand.description}
            </p>
          </div>

          {/* Categories */}
          <div style={{ padding: "0 1.5rem", marginBottom: "20px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
              {brand.categories.map((cat) => (
                <span
                  key={cat}
                  style={{ padding: "5px 14px", borderRadius: "999px", backgroundColor: "rgba(192,57,43,0.12)", color: "hsl(12 90% 60%)", fontSize: "12px", fontWeight: 600, border: "1px solid rgba(192,57,43,0.25)" }}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Featured products */}
          {brand.products.length > 0 && (
            <div style={{ padding: "0 1.5rem", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <ShoppingBag style={{ width: "14px", height: "14px", color: "hsl(12 90% 52%)" }} />
                <span style={{ fontSize: "11px", fontWeight: 700, color: "hsl(12 90% 52%)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Produits phares
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(brand.products.length, 3)}, 1fr)`, gap: "10px" }}>
                {brand.products.slice(0, 3).map((p) => (
                  <div
                    key={p.name}
                    style={{ backgroundColor: "#1a1a1a", borderRadius: "12px", padding: "14px 10px", textAlign: "center", border: "1px solid #252525", transition: "border-color 0.2s" }}
                  >
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#222", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                      <ShoppingBag style={{ width: "18px", height: "18px", color: "#555" }} />
                    </div>
                    <span style={{ fontSize: "11px", color: "#ccc", fontWeight: 500, lineHeight: 1.3, display: "block" }}>
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ padding: "0 1.5rem 1.5rem", display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Visit website */}
            <a
              href={brand.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "12px", backgroundColor: "hsl(12 90% 52%)", color: "#fff", fontSize: "13px", fontWeight: 700, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.05em", transition: "opacity 0.2s" }}
            >
              <ExternalLink style={{ width: "14px", height: "14px" }} />
              Visiter le site officiel
            </a>

            {/* Available badge */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px", borderRadius: "12px", backgroundColor: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)" }}>
              <MapPin style={{ width: "14px", height: "14px", color: "hsl(12 90% 52%)" }} />
              <span style={{ color: "hsl(12 90% 52%)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Disponible en magasin à Wavre
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BrandsSection() {
  const [selectedBrand, setSelectedBrand] = useState<BrandInfo | null>(null);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-3">
            NOS MARQUES
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm md:text-base">
            Plus de 30 marques disponibles en magasin à Wavre
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {brandNames.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setSelectedBrand(brandData[name])}
              className="inline-flex items-center px-4 py-2 rounded-full bg-secondary text-foreground text-sm font-medium border border-primary/20 cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)] hover:bg-primary/10 active:scale-95"
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {selectedBrand !== null && (
        <BrandModal brand={selectedBrand} onClose={() => setSelectedBrand(null)} />
      )}
    </section>
  );
}
