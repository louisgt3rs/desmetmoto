import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: Route not found:", location.pathname);
    document.title = "Page introuvable — Desmet Équipement";
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0e0e0e] px-4 text-center">
      <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-[#c9973a]">
        DESMET ÉQUIPEMENT
      </p>
      <h1 className="mb-2 font-display text-8xl leading-none text-white">404</h1>
      <p className="mb-8 font-display text-xl uppercase tracking-widest text-white/40">
        Page introuvable
      </p>
      <p className="mb-10 max-w-sm text-sm leading-relaxed text-white/35">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        to="/"
        className="inline-flex h-12 items-center gap-2 bg-[#c9973a] px-8 font-display text-sm uppercase tracking-[0.2em] text-[#0e0e0e] transition-opacity hover:opacity-90"
      >
        ← Retour à l'accueil
      </Link>
    </div>
  );
};

export default NotFound;
