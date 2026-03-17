import { useState } from "react";
import { motion } from "framer-motion";
import { X, MapPin } from "lucide-react";

interface BrandInfo {
  name: string;
  country: string;
  year: string;
  description: string;
  categories: string[];
}

const brandData: Record<string, BrandInfo> = {
  "Arai": { name: "Arai", country: "🇯🇵 Japon", year: "1937", description: "Fabricant japonais légendaire de casques haut de gamme. Chaque casque est assemblé à la main avec un souci du détail inégalé. Référence absolue en matière de protection et de confort.", categories: ["Casques"] },
  "Abus": { name: "Abus", country: "🇩🇪 Allemagne", year: "1924", description: "Spécialiste allemand de la sécurité depuis un siècle. Reconnu pour ses antivols robustes et ses solutions de protection innovantes.", categories: ["Antivols", "Sécurité"] },
  "Muc-Off": { name: "Muc-Off", country: "🇬🇧 Royaume-Uni", year: "1994", description: "Marque britannique spécialisée dans l'entretien et le nettoyage. Produits biodégradables et performants pour le soin de votre moto.", categories: ["Entretien", "Nettoyage"] },
  "Bell Helmet": { name: "Bell Helmet", country: "🇺🇸 États-Unis", year: "1954", description: "Pionnier américain du casque moto, inventeur du casque intégral. Style iconique mêlant héritage racing et design moderne.", categories: ["Casques"] },
  "Scoot": { name: "Scoot", country: "🇧🇪 Belgique", year: "2005", description: "Marque belge spécialisée dans les accessoires pour scooters et motos urbaines. Solutions pratiques et design.", categories: ["Accessoires", "Urbain"] },
  "Helite": { name: "Helite", country: "🇫🇷 France", year: "2002", description: "Inventeur français du gilet airbag moto. Technologie brevetée offrant une protection révolutionnaire en cas de chute.", categories: ["Protection", "Airbag"] },
  "Bihr": { name: "Bihr", country: "🇫🇷 France", year: "1975", description: "Distributeur français majeur de pièces et accessoires moto. Catalogue immense couvrant toutes les marques.", categories: ["Pièces", "Accessoires"] },
  "TCX": { name: "TCX", country: "🇮🇹 Italie", year: "1999", description: "Fabricant italien de bottes moto techniques haut de gamme. Savoir-faire italien alliant protection, confort et style.", categories: ["Bottes", "Chaussures"] },
  "Erwax": { name: "Erwax", country: "🇧🇪 Belgique", year: "2010", description: "Marque belge spécialisée dans les produits d'entretien pour le cuir et les textiles moto.", categories: ["Entretien", "Cuir"] },
  "D3O": { name: "D3O", country: "🇬🇧 Royaume-Uni", year: "1999", description: "Technologie britannique révolutionnaire de protection par impact. Matériau souple qui durcit instantanément à l'impact.", categories: ["Protection", "Technologie"] },
  "TomTom": { name: "TomTom", country: "🇳🇱 Pays-Bas", year: "1991", description: "Leader néerlandais de la navigation GPS. Solutions dédiées aux motards avec écrans lisibles et résistants.", categories: ["GPS", "Navigation"] },
  "Richa": { name: "Richa", country: "🇧🇪 Belgique", year: "1956", description: "Équipementier belge proposant des vêtements moto techniques et abordables. Excellent rapport qualité-prix.", categories: ["Vestes", "Pantalons", "Gants"] },
  "RST": { name: "RST", country: "🇬🇧 Royaume-Uni", year: "1988", description: "Marque britannique d'équipement moto au style racing affirmé. Textiles et cuirs techniques à prix compétitifs.", categories: ["Vestes", "Combinaisons", "Gants"] },
  "Kappa": { name: "Kappa", country: "🇮🇹 Italie", year: "1978", description: "Fabricant italien de bagagerie et accessoires moto. Top cases, valises et supports de qualité.", categories: ["Bagagerie", "Top cases"] },
  "Cardo": { name: "Cardo", country: "🇮🇱 Israël", year: "2003", description: "Leader mondial des intercoms moto Bluetooth. Communication cristalline et technologie mesh révolutionnaire.", categories: ["Intercom", "Communication"] },
  "Bering": { name: "Bering", country: "🇫🇷 France", year: "1925", description: "Équipementier français spécialiste des gants et vêtements moto. Savoir-faire centenaire dans la confection.", categories: ["Gants", "Vestes", "Pantalons"] },
  "Motul": { name: "Motul", country: "🇫🇷 France", year: "1853", description: "Fabricant français d'huiles et lubrifiants de haute performance. Plus de 170 ans d'expertise. Partenaire officiel du MotoGP.", categories: ["Huiles", "Lubrifiants", "Entretien"] },
  "SW-Motech": { name: "SW-Motech", country: "🇩🇪 Allemagne", year: "1999", description: "Spécialiste allemand d'accessoires moto de qualité premium. Ingénierie allemande de précision.", categories: ["Accessoires", "Bagagerie", "Protection"] },
  "Premier Helmet": { name: "Premier Helmet", country: "🇮🇹 Italie", year: "1956", description: "Fabricant italien de casques au design vintage et rétro. Icône du style café racer.", categories: ["Casques"] },
  "Shark": { name: "Shark", country: "🇫🇷 France", year: "1986", description: "Fabricant français de casques moto innovants et performants. Partenaire des plus grands pilotes MotoGP.", categories: ["Casques"] },
  "Garmin": { name: "Garmin", country: "🇺🇸 États-Unis", year: "1989", description: "Leader mondial des systèmes de navigation et GPS. Gamme dédiée moto avec le Zumo, robuste et étanche.", categories: ["GPS", "Navigation"] },
  "Auvray": { name: "Auvray", country: "🇫🇷 France", year: "1977", description: "Fabricant français spécialisé dans les antivols moto haut de gamme. Bloque-disques et chaînes homologués SRA.", categories: ["Antivols", "Sécurité"] },
  "Sena": { name: "Sena", country: "🇺🇸 États-Unis", year: "1998", description: "Spécialiste américain des systèmes de communication Bluetooth pour motards. Connectivité avancée et son HD.", categories: ["Intercom", "Communication", "Caméras"] },
  "Alpinestars": { name: "Alpinestars", country: "🇮🇹 Italie", year: "1963", description: "Légende italienne de l'équipement moto et racing. Chaque produit incarne la performance au plus haut niveau.", categories: ["Bottes", "Vestes", "Gants", "Protection"] },
  "Optimate": { name: "Optimate", country: "🇧🇪 Belgique", year: "1995", description: "Spécialiste belge des chargeurs de batterie intelligents. Référence chez les professionnels.", categories: ["Chargeurs", "Batteries"] },
  "Bowtex": { name: "Bowtex", country: "🇫🇷 France", year: "2012", description: "Marque française innovante de sous-vêtements et protections textiles moto. Kevlar et fibres techniques.", categories: ["Protection", "Textile"] },
  "Fly Racing": { name: "Fly Racing", country: "🇺🇸 États-Unis", year: "1998", description: "Équipementier américain spécialisé dans le motocross et l'enduro. Esprit racing et tout-terrain.", categories: ["Casques", "Motocross", "Protection"] },
  "Six2": { name: "Six2", country: "🇮🇹 Italie", year: "2005", description: "Marque italienne de sous-vêtements techniques thermorégulants. Technologie Carbon Underwear brevetée.", categories: ["Sous-vêtements", "Thermique"] },
  "LS2": { name: "LS2", country: "🇪🇸 Espagne", year: "2007", description: "Fabricant espagnol de casques au rapport qualité-prix imbattable. Large gamme du jet au modulable.", categories: ["Casques"] },
  "Midland": { name: "Midland", country: "🇮🇹 Italie", year: "1959", description: "Marque italienne de systèmes de communication radio et intercom. Qualité et simplicité d'utilisation.", categories: ["Intercom", "Communication"] },
  "Zandona": { name: "Zandona", country: "🇮🇹 Italie", year: "1989", description: "Spécialiste italien des protections dorsales et corporelles. Technologies de niveau compétition.", categories: ["Protection dorsale", "Protections"] },
  "Segura": { name: "Segura", country: "🇫🇷 France", year: "1964", description: "Maison française de blousons cuir et textile moto depuis 60 ans. Le chic à la française sur deux roues.", categories: ["Vestes cuir", "Gants", "Textile"] },
  "Shoei": { name: "Shoei", country: "🇯🇵 Japon", year: "1959", description: "Fabricant japonais de casques premium reconnu mondialement. Confort, aérodynamisme et sécurité au sommet.", categories: ["Casques"] },
};

const brandNames = Object.keys(brandData);

function BrandModal({ brand, onClose }: { brand: BrandInfo; onClose: () => void }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backgroundColor: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      <div
        style={{ position: "relative", width: "100%", maxWidth: "420px", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "16px", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Red X close button */}
        <button
          type="button"
          onClick={onClose}
          style={{ position: "absolute", top: "12px", right: "12px", zIndex: 10, width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "hsl(12 90% 52%)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <X style={{ width: "16px", height: "16px", color: "#fff" }} />
        </button>

        {/* Header */}
        <div style={{ padding: "2rem 1.5rem 1rem", textAlign: "center", background: "linear-gradient(180deg, rgba(192,57,43,0.15) 0%, transparent 100%)" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "16px", backgroundColor: "#252525", border: "1px solid rgba(192,57,43,0.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", boxShadow: "0 0 25px rgba(192,57,43,0.3)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "28px", color: "hsl(12 90% 52%)" }}>
              {brand.name.charAt(0)}
            </span>
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "28px", color: "#f2f2f2", margin: "0 0 4px" }}>
            {brand.name}
          </h3>
          <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
            {brand.country} · Depuis {brand.year}
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "0 1.5rem 1.5rem" }}>
          <p style={{ fontSize: "14px", color: "#aaa", lineHeight: 1.6, marginBottom: "16px" }}>
            {brand.description}
          </p>

          {/* Categories */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
            {brand.categories.map((cat) => (
              <span
                key={cat}
                style={{ padding: "4px 12px", borderRadius: "999px", backgroundColor: "rgba(192,57,43,0.15)", color: "hsl(12 90% 52%)", fontSize: "12px", fontWeight: 500, border: "1px solid rgba(192,57,43,0.25)" }}
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Available badge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px", borderRadius: "12px", backgroundColor: "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.35)" }}>
            <MapPin style={{ width: "14px", height: "14px", color: "hsl(12 90% 52%)" }} />
            <span style={{ color: "hsl(12 90% 52%)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Disponible en magasin à Wavre
            </span>
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
              onClick={() => {
                setSelectedBrand(brandData[name]);
              }}
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
