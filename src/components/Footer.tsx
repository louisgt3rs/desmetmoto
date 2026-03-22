import { Link } from "react-router-dom";
import { MapPin, Phone, Clock, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl text-foreground mb-4">
              DESMET <span className="text-primary">ÉQUIPEMENT</span>
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Spécialiste en équipement moto à Wavre. Casques, vestes, gants et accessoires des meilleures marques.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display text-lg text-foreground mb-4">NAVIGATION</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "Accueil", path: "/" },
                { label: "Marques", path: "/brands" },
                { label: "Casques Arai", path: "/arai" },
                { label: "Communauté", path: "/community" },
                { label: "À Propos", path: "/about" },
                { label: "Contact", path: "/contact" },
              ].map((l) => (
                <Link key={l.path} to={l.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg text-foreground mb-4">CONTACT</h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Chaussée de Wavre 491<br />1300 Wavre, Belgique</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:010842139" className="hover:text-primary transition-colors">010 84 21 39</a>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p>Mar - Ven: 10h - 18h</p>
                  <p>Sam: 10h - 17h</p>
                  <p>Dim & Lun: Fermé</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-display text-lg text-foreground mb-4">SUIVEZ-NOUS</h4>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/desmetmotowavre" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Desmet Équipement. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
