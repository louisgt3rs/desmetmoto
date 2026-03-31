import { Link } from "react-router-dom";

const NAV_LINKS = [
  { label: "Accueil",    path: "/" },
  { label: "Produits",   path: "/brands" },
  { label: "Événements", path: "/community" },
  { label: "Arai",       path: "/arai" },
  { label: "Contact",    path: "/contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#c9973a]/15" style={{ backgroundColor: "#111" }}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">

          {/* Left — logo + address */}
          <div>
            <p className="font-display text-2xl leading-none text-white">
              DESMET <span className="text-[#c9973a]">ÉQUIPEMENT</span>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Chaussée de Louvain 491, 1300 Wavre&nbsp;·&nbsp;
              <a href="tel:0108421390" className="text-[#c9973a] transition-opacity hover:opacity-75">
                010/84 21 39
              </a>
            </p>
          </div>

          {/* Center — nav links */}
          <div className="flex flex-col gap-3 sm:items-center">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className="text-sm uppercase tracking-[0.14em] text-white/55 transition-colors hover:text-[#c9973a]"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right — copyright */}
          <div className="sm:text-right">
            <p className="text-sm text-white/40">© 2026 Desmet Équipement</p>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#c9973a]/10" style={{ backgroundColor: "#0d0d0d" }}>
        <div className="container mx-auto px-4 py-3 text-center text-[11px] uppercase tracking-[0.14em] text-white/30">
          <Link to="/politique-confidentialite" className="transition-colors hover:text-[#c9973a]">
            Politique de confidentialité
          </Link>
          {" · "}Tous droits réservés
        </div>
      </div>
    </footer>
  );
}
