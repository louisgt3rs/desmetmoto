import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type BrandRow = { id: string; name: string; logo_url: string | null };

function brandSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function BrandLogo({ brand }: { brand: BrandRow }) {
  const [failed, setFailed] = useState(false);
  if (brand.logo_url && !failed) {
    return (
      <img
        src={brand.logo_url}
        alt={brand.name}
        className="h-full w-full object-contain p-1"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span className="font-display text-[9px] uppercase tracking-wider text-foreground/60 leading-none text-center px-1">
      {brand.name}
    </span>
  );
}

/* ─── Desktop mega menu ─────────────────────────────────────────── */
export function MegaMenuDesktop({
  open,
  onClose,
  brands,
}: {
  open: boolean;
  onClose: () => void;
  brands: BrandRow[];
}) {
  const arai = brands.find((b) => b.name.toLowerCase() === "arai");
  const others = brands.filter((b) => b.name.toLowerCase() !== "arai");

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Click-outside backdrop */}
          <div className="fixed inset-0 z-40" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 right-0 z-50"
            style={{
              top: "100%",
              background: "#111111",
              borderTop: "2px solid #c9973a",
              boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
            }}
          >
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-[320px_1fr] gap-0">

                {/* ── Left: Arai Pro Shop ───────────────────────── */}
                <div
                  className="pr-6 py-2"
                  style={{ borderRight: "1px solid rgba(201,151,58,0.2)" }}
                >
                  {/* OFFICIAL PRO SHOP badge */}
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 mb-5"
                    style={{ background: "#c9973a" }}
                  >
                    <Shield className="w-3 h-3" style={{ color: "#0a0a0a" }} strokeWidth={2.5} />
                    <span
                      className="font-display text-[9px] uppercase tracking-[0.45em]"
                      style={{ color: "#0a0a0a" }}
                    >
                      Official Pro Shop
                    </span>
                  </div>

                  <Link to="/marques/arai" onClick={onClose} className="group flex flex-col">
                    {/* Arai logo */}
                    <div
                      className="w-full mb-4 flex items-center justify-center"
                      style={{
                        height: 80,
                        background: "rgba(201,151,58,0.04)",
                        border: "1px solid rgba(201,151,58,0.15)",
                      }}
                    >
                      {arai?.logo_url ? (
                        <img
                          src={arai.logo_url}
                          alt="Arai"
                          className="h-full object-contain py-3 px-8 transition-opacity duration-200 group-hover:opacity-80"
                          style={{ filter: "brightness(1.1)" }}
                        />
                      ) : (
                        <span
                          className="font-display tracking-widest"
                          style={{ fontSize: "2rem", color: "white" }}
                        >
                          ARAI
                        </span>
                      )}
                    </div>

                    <p
                      className="text-[11px] leading-relaxed mb-3 transition-colors group-hover:text-white/70"
                      style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                      Revendeur officiel certifié en Belgique
                    </p>

                    {/* Technical Pro Shop badge */}
                    <div
                      className="inline-flex items-center gap-2 self-start px-2.5 py-1"
                      style={{ border: "1px solid rgba(201,151,58,0.35)", background: "rgba(201,151,58,0.06)" }}
                    >
                      <span
                        className="font-display text-[8px] uppercase tracking-[0.4em]"
                        style={{ color: "#c9973a" }}
                      >
                        Technical Pro Shop
                      </span>
                    </div>

                    <div
                      className="mt-4 flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.3em] transition-colors group-hover:text-[#c9973a]"
                      style={{ color: "rgba(201,151,58,0.6)" }}
                    >
                      Découvrir Arai →
                    </div>
                  </Link>
                </div>

                {/* ── Right: all other brands ───────────────────── */}
                <div className="pl-6 py-2">
                  <p
                    className="font-display text-[10px] uppercase tracking-[0.45em] mb-4"
                    style={{ color: "rgba(201,151,58,0.5)" }}
                  >
                    Toutes nos marques
                  </p>

                  <div className="grid grid-cols-5 gap-2">
                    {others.map((brand) => (
                      <Link
                        key={brand.id}
                        to={`/marques/${brandSlug(brand.name)}`}
                        onClick={onClose}
                        className="group flex flex-col items-center gap-1.5 p-2 transition-all duration-200"
                        style={{ border: "1px solid transparent" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.border = "1px solid rgba(201,151,58,0.25)";
                          (e.currentTarget as HTMLElement).style.background = "rgba(201,151,58,0.04)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.border = "1px solid transparent";
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                        }}
                      >
                        <div
                          className="w-full flex items-center justify-center"
                          style={{ height: 40, background: "rgba(255,255,255,0.04)" }}
                        >
                          <BrandLogo brand={brand} />
                        </div>
                        <span
                          className="font-display text-[8px] uppercase tracking-[0.2em] text-center leading-tight transition-colors group-hover:text-[#c9973a]"
                          style={{ color: "rgba(255,255,255,0.4)" }}
                        >
                          {brand.name}
                        </span>
                      </Link>
                    ))}
                  </div>

                  <Link
                    to="/marques"
                    onClick={onClose}
                    className="mt-4 inline-flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.3em] transition-colors"
                    style={{ color: "rgba(201,151,58,0.5)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#c9973a")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(201,151,58,0.5)")}
                  >
                    Voir toutes les marques →
                  </Link>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Mobile accordion ──────────────────────────────────────────── */
export function MegaMenuMobile({
  onClose,
  brands,
}: {
  onClose: () => void;
  brands: BrandRow[];
}) {
  const [expanded, setExpanded] = useState(false);
  const arai = brands.find((b) => b.name.toLowerCase() === "arai");
  const others = brands.filter((b) => b.name.toLowerCase() !== "arai");

  return (
    <div>
      {/* Trigger row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between w-full text-base font-display uppercase tracking-wider text-foreground hover:text-primary transition-colors"
      >
        Marques
        <ChevronDown
          className="w-4 h-4 transition-transform duration-200"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-3 pl-3 space-y-2">
              {/* Arai highlighted */}
              <Link
                to="/marques/arai"
                onClick={onClose}
                className="flex items-center gap-2 py-2 px-3 font-display text-sm uppercase tracking-wider transition-colors hover:text-[#c9973a]"
                style={{ background: "rgba(201,151,58,0.07)", border: "1px solid rgba(201,151,58,0.2)", color: "#c9973a" }}
              >
                <Shield className="w-3.5 h-3.5" strokeWidth={2} />
                Arai — Pro Shop
              </Link>

              {/* Other brands */}
              {others.slice(0, 12).map((brand) => (
                <Link
                  key={brand.id}
                  to={`/marques/${brandSlug(brand.name)}`}
                  onClick={onClose}
                  className="block py-1.5 font-display text-sm uppercase tracking-wider text-foreground/70 hover:text-primary transition-colors"
                >
                  {brand.name}
                </Link>
              ))}

              <Link
                to="/marques"
                onClick={onClose}
                className="block pt-1 font-display text-[11px] uppercase tracking-[0.3em] transition-colors"
                style={{ color: "rgba(201,151,58,0.6)" }}
              >
                Toutes les marques →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Hook to load brands once ──────────────────────────────────── */
export function useBrandsForMenu() {
  const [brands, setBrands] = useState<BrandRow[]>([]);

  useEffect(() => {
    supabase
      .from("brands")
      .select("id, name, logo_url")
      .order("name")
      .then(({ data }) => {
        if (data) setBrands(data as BrandRow[]);
      });
  }, []);

  return brands;
}
