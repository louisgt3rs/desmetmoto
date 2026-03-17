import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  "Abus": { name: "Abus", country: "🇩🇪 Allemagne", year: "1924", description: "Spécialiste allemand de la sécurité depuis un siècle. Reconnu pour ses antivols robustes et ses solutions de protection innovantes. Qualité et fiabilité allemande.", categories: ["Antivols", "Sécurité"] },
  "Muc-Off": { name: "Muc-Off", country: "🇬🇧 Royaume-Uni", year: "1994", description: "Marque britannique spécialisée dans l'entretien et le nettoyage. Produits biodégradables et performants pour le soin de votre moto. Utilisée par les équipes professionnelles.", categories: ["Entretien", "Nettoyage"] },
  "Bell Helmet": { name: "Bell Helmet", country: "🇺🇸 États-Unis", year: "1954", description: "Pionnier américain du casque moto, inventeur du casque intégral. Style iconique mêlant héritage racing et design moderne. Porté par les plus grands champions.", categories: ["Casques"] },
  "Scoot": { name: "Scoot", country: "🇧🇪 Belgique", year: "2005", description: "Marque belge spécialisée dans les accessoires pour scooters et motos urbaines. Solutions pratiques et design pour la mobilité quotidienne.", categories: ["Accessoires", "Urbain"] },
  "Helite": { name: "Helite", country: "🇫🇷 France", year: "2002", description: "Inventeur français du gilet airbag moto. Technologie brevetée offrant une protection révolutionnaire en cas de chute. Leader mondial de l'airbag moto.", categories: ["Protection", "Airbag"] },
  "Bihr": { name: "Bihr", country: "🇫🇷 France", year: "1975", description: "Distributeur français majeur de pièces et accessoires moto. Catalogue immense couvrant toutes les marques et tous les besoins. Partenaire incontournable des professionnels.", categories: ["Pièces", "Accessoires"] },
  "TCX": { name: "TCX", country: "🇮🇹 Italie", year: "1999", description: "Fabricant italien de bottes moto techniques haut de gamme. Savoir-faire italien alliant protection, confort et style. Utilisé en MotoGP et sur route.", categories: ["Bottes", "Chaussures"] },
  "Erwax": { name: "Erwax", country: "🇧🇪 Belgique", year: "2010", description: "Marque belge spécialisée dans les produits d'entretien pour le cuir et les textiles moto. Formules professionnelles pour prolonger la durée de vie de votre équipement.", categories: ["Entretien", "Cuir"] },
  "D3O": { name: "D3O", country: "🇬🇧 Royaume-Uni", year: "1999", description: "Technologie britannique révolutionnaire de protection par impact. Matériau souple qui durcit instantanément à l'impact. Utilisé par les plus grandes marques d'équipement.", categories: ["Protection", "Technologie"] },
  "TomTom": { name: "TomTom", country: "🇳🇱 Pays-Bas", year: "1991", description: "Leader néerlandais de la navigation GPS. Solutions dédiées aux motards avec écrans lisibles et résistants aux intempéries. Navigation intuitive pour chaque trajet.", categories: ["GPS", "Navigation"] },
  "Richa": { name: "Richa", country: "🇧🇪 Belgique", year: "1956", description: "Équipementier belge proposant des vêtements moto techniques et abordables. Large gamme de vestes, pantalons et gants pour toutes les saisons. Excellent rapport qualité-prix.", categories: ["Vestes", "Pantalons", "Gants"] },
  "RST": { name: "RST", country: "🇬🇧 Royaume-Uni", year: "1988", description: "Marque britannique d'équipement moto au style racing affirmé. Textiles et cuirs techniques à prix compétitifs. Présente en compétition mondiale.", categories: ["Vestes", "Combinaisons", "Gants"] },
  "Kappa": { name: "Kappa", country: "🇮🇹 Italie", year: "1978", description: "Fabricant italien de bagagerie et accessoires moto. Top cases, valises et supports de qualité pour le voyage à moto. Alternative fiable et design.", categories: ["Bagagerie", "Top cases"] },
  "Cardo": { name: "Cardo", country: "🇮🇱 Israël", year: "2003", description: "Leader mondial des intercoms moto Bluetooth. Communication cristalline entre motards et qualité audio exceptionnelle. Technologie mesh révolutionnaire.", categories: ["Intercom", "Communication"] },
  "Bering": { name: "Bering", country: "🇫🇷 France", year: "1925", description: "Équipementier français spécialiste des gants et vêtements moto. Savoir-faire centenaire dans la confection de gants en cuir. Protection et élégance à la française.", categories: ["Gants", "Vestes", "Pantalons"] },
  "Motul": { name: "Motul", country: "🇫🇷 France", year: "1853", description: "Fabricant français d'huiles et lubrifiants de haute performance. Plus de 170 ans d'expertise au service des moteurs. Partenaire officiel du MotoGP.", categories: ["Huiles", "Lubrifiants", "Entretien"] },
  "SW-Motech": { name: "SW-Motech", country: "🇩🇪 Allemagne", year: "1999", description: "Spécialiste allemand d'accessoires moto de qualité premium. Supports GPS, protections moteur et bagagerie technique. Ingénierie allemande de précision.", categories: ["Accessoires", "Bagagerie", "Protection"] },
  "Premier Helmet": { name: "Premier Helmet", country: "🇮🇹 Italie", year: "1956", description: "Fabricant italien de casques au design vintage et rétro. Style unique alliant l'élégance classique aux normes de sécurité modernes. Icône du style café racer.", categories: ["Casques"] },
  "Shark": { name: "Shark", country: "🇫🇷 France", year: "1986", description: "Fabricant français de casques moto innovants et performants. Technologies exclusives comme le système Autoseal. Partenaire des plus grands pilotes MotoGP.", categories: ["Casques"] },
  "Garmin": { name: "Garmin", country: "🇺🇸 États-Unis", year: "1989", description: "Leader mondial des systèmes de navigation et GPS. Gamme dédiée moto avec le Zumo, robuste et étanche. Cartographie premium et alertes trafic.", categories: ["GPS", "Navigation"] },
  "Auvray": { name: "Auvray", country: "🇫🇷 France", year: "1977", description: "Fabricant français spécialisé dans les antivols moto haut de gamme. Bloque-disques, chaînes et U homologués SRA. Sécurité maximale made in France.", categories: ["Antivols", "Sécurité"] },
  "Sena": { name: "Sena", country: "🇺🇸 États-Unis", year: "1998", description: "Spécialiste américain des systèmes de communication Bluetooth pour motards. Intercoms performants avec caméra intégrée. Connectivité avancée et son HD.", categories: ["Intercom", "Communication", "Caméras"] },
  "Alpinestars": { name: "Alpinestars", country: "🇮🇹 Italie", year: "1963", description: "Légende italienne de l'équipement moto et racing. Des bottes aux combinaisons, chaque produit incarne la performance. Porté par Márquez et les champions du monde.", categories: ["Bottes", "Vestes", "Gants", "Protection"] },
  "Optimate": { name: "Optimate", country: "🇧🇪 Belgique", year: "1995", description: "Spécialiste belge des chargeurs de batterie intelligents. Technologie de charge optimisée pour prolonger la vie de votre batterie. Référence chez les professionnels.", categories: ["Chargeurs", "Batteries"] },
  "Bowtex": { name: "Bowtex", country: "🇫🇷 France", year: "2012", description: "Marque française innovante de sous-vêtements et protections textiles moto. Kevlar et fibres techniques pour une protection invisible au quotidien.", categories: ["Protection", "Textile"] },
  "Fly Racing": { name: "Fly Racing", country: "🇺🇸 États-Unis", year: "1998", description: "Équipementier américain spécialisé dans le motocross et l'enduro. Casques, maillots et protections au design audacieux. Esprit racing et tout-terrain.", categories: ["Casques", "Motocross", "Protection"] },
  "Six2": { name: "Six2", country: "🇮🇹 Italie", year: "2005", description: "Marque italienne de sous-vêtements techniques thermorégulants. Technologie Carbon Underwear brevetée pour un confort optimal. Idéal toutes saisons.", categories: ["Sous-vêtements", "Thermique"] },
  "LS2": { name: "LS2", country: "🇪🇸 Espagne", year: "2007", description: "Fabricant espagnol de casques au rapport qualité-prix imbattable. Large gamme du jet au modulable avec des finitions soignées. Casques homologués et fiables.", categories: ["Casques"] },
  "Midland": { name: "Midland", country: "🇮🇹 Italie", year: "1959", description: "Marque italienne de systèmes de communication radio et intercom. Solutions fiables pour la communication entre motards. Qualité et simplicité d'utilisation.", categories: ["Intercom", "Communication"] },
  "Zandona": { name: "Zandona", country: "🇮🇹 Italie", year: "1989", description: "Spécialiste italien des protections dorsales et corporelles. Technologies d'absorption des chocs de niveau compétition. Confort et sécurité maximale.", categories: ["Protection dorsale", "Protections"] },
  "Segura": { name: "Segura", country: "🇫🇷 France", year: "1964", description: "Maison française de blousons cuir et textile moto depuis 60 ans. Élégance et savoir-faire artisanal pour un style intemporel. Le chic à la française sur deux roues.", categories: ["Vestes cuir", "Gants", "Textile"] },
  "Shoei": { name: "Shoei", country: "🇯🇵 Japon", year: "1959", description: "Fabricant japonais de casques premium reconnu mondialement. Fabrication artisanale avec des matériaux de pointe. Confort, aérodynamisme et sécurité au sommet.", categories: ["Casques"] },
};

const brandNames = Object.keys(brandData);

export default function BrandsSection() {
  const [selected, setSelected] = useState<BrandInfo | null>(null);

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

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto"
        >
          {brandNames.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setSelected(brandData[name])}
              className="inline-flex items-center px-4 py-2 rounded-full bg-secondary text-foreground text-sm font-medium border border-primary/20 cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)] hover:bg-primary/10 active:scale-95"
            >
              {name}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Brand Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden shadow-[0_0_60px_hsl(var(--primary)/0.15)]"
            >
              {/* Close button */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-secondary/80 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header glow */}
              <div className="relative pt-10 pb-6 px-6 text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
                
                {/* Brand initial logo */}
                <div className="relative mx-auto w-20 h-20 rounded-2xl bg-secondary border border-primary/30 flex items-center justify-center mb-5 shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
                  <span className="font-display text-3xl text-primary">
                    {selected.name.charAt(0)}
                  </span>
                </div>

                <h3 className="relative font-display text-3xl text-foreground mb-1">
                  {selected.name}
                </h3>
                <p className="relative text-muted-foreground text-sm">
                  {selected.country} · Depuis {selected.year}
                </p>
              </div>

              {/* Body */}
              <div className="px-6 pb-6 space-y-5">
                <p className="text-secondary-foreground text-sm leading-relaxed">
                  {selected.description}
                </p>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {selected.categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20"
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Available badge */}
                <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 border border-primary/30">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span className="text-primary text-xs font-semibold tracking-wide uppercase">
                    Disponible en magasin à Wavre
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
