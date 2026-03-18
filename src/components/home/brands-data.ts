export interface BrandInfo {
  name: string;
  country: string;
  year: string;
  description: string;
  category: string;
  image: string;
}

export const brands: BrandInfo[] = [
  { name: "Arai", country: "🇯🇵 Japon", year: "1937", description: "Fabricant japonais légendaire de casques haut de gamme. Chaque casque est assemblé à la main avec un souci du détail inégalé.", category: "Casques", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=220&fit=crop" },
  { name: "Abus", country: "🇩🇪 Allemagne", year: "1924", description: "Spécialiste allemand de la sécurité depuis un siècle. Antivols robustes et solutions de protection innovantes.", category: "Antivols", image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=220&fit=crop" },
  { name: "Muc-Off", country: "🇬🇧 Royaume-Uni", year: "1994", description: "Produits d'entretien biodégradables et performants pour le soin de votre moto.", category: "Entretien", image: "https://images.unsplash.com/photo-1558981033-7c0a30c0db76?w=400&h=220&fit=crop" },
  { name: "Bell Helmet", country: "🇺🇸 États-Unis", year: "1954", description: "Pionnier américain du casque moto, inventeur du casque intégral. Style iconique mêlant héritage racing et design moderne.", category: "Casques", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=220&fit=crop" },
  { name: "Helite", country: "🇫🇷 France", year: "2002", description: "Inventeur français du gilet airbag moto. Protection révolutionnaire déclenchée en 80ms en cas de chute.", category: "Airbag", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=220&fit=crop" },
  { name: "TCX", country: "🇮🇹 Italie", year: "1999", description: "Fabricant italien de bottes moto techniques haut de gamme. Savoir-faire artisanal alliant protection et style.", category: "Bottes", image: "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?w=400&h=220&fit=crop" },
  { name: "Cardo", country: "🇮🇱 Israël", year: "2003", description: "Leader mondial des intercoms moto Bluetooth. Technologie mesh révolutionnaire pour communiquer en groupe.", category: "Intercom", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=220&fit=crop" },
  { name: "Richa", country: "🇧🇪 Belgique", year: "1956", description: "Équipementier belge proposant des vêtements moto techniques. Excellent rapport qualité-prix, certifiés CE.", category: "Vêtements", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=220&fit=crop" },
  { name: "Motul", country: "🇫🇷 France", year: "1853", description: "Fabricant français d'huiles haute performance. Plus de 170 ans d'expertise, partenaire officiel du MotoGP.", category: "Huiles", image: "https://images.unsplash.com/photo-1558981033-7c0a30c0db76?w=400&h=220&fit=crop" },
  { name: "SW-Motech", country: "🇩🇪 Allemagne", year: "1999", description: "Spécialiste allemand d'accessoires moto premium. Ingénierie de précision pour l'aventure et le voyage.", category: "Accessoires", image: "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=400&h=220&fit=crop" },
  { name: "Shark", country: "🇫🇷 France", year: "1986", description: "Fabricant français de casques innovants. Partenaire des plus grands pilotes MotoGP.", category: "Casques", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=220&fit=crop" },
  { name: "Alpinestars", country: "🇮🇹 Italie", year: "1963", description: "Légende italienne de l'équipement moto racing. Leurs airbags TechAir équipent les pilotes MotoGP.", category: "Équipement", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=220&fit=crop" },
  { name: "Sena", country: "🇺🇸 États-Unis", year: "1998", description: "Spécialiste américain des systèmes Bluetooth pour motards. Son HD et connectivité avancée.", category: "Intercom", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=220&fit=crop" },
  { name: "Shoei", country: "🇯🇵 Japon", year: "1959", description: "Fabricant japonais de casques premium reconnu mondialement. Confort, aérodynamisme et sécurité au sommet.", category: "Casques", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=220&fit=crop" },
  { name: "Garmin", country: "🇺🇸 États-Unis", year: "1989", description: "Leader mondial de la navigation GPS. Gamme Zumo dédiée aux motards, robuste et étanche.", category: "GPS", image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=220&fit=crop" },
  { name: "Optimate", country: "🇧🇪 Belgique", year: "1995", description: "Référence belge des chargeurs de batterie intelligents. Prolonge la durée de vie de votre batterie.", category: "Batteries", image: "https://images.unsplash.com/photo-1558981033-7c0a30c0db76?w=400&h=220&fit=crop" },
];
