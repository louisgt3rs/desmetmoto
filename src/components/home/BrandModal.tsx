import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, MapPin, ExternalLink, ShoppingBag } from "lucide-react";
import type { BrandInfo } from "./brands-data";

interface BrandModalProps {
  brand: BrandInfo;
  onClose: () => void;
}

export default function BrandModal({ brand, onClose }: BrandModalProps) {
  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Détails de la marque ${brand.name}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backgroundColor: "rgba(0,0,0,0.9)",
      }}
      onMouseDown={onClose}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90vh",
          backgroundColor: "#111",
          border: "1px solid #222",
          borderRadius: "20px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            zIndex: 10,
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "hsl(12 90% 52%)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
          }}
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
                    style={{ backgroundColor: "#1a1a1a", borderRadius: "12px", padding: "14px 10px", textAlign: "center", border: "1px solid #252525" }}
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
            <a
              href={brand.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "12px", backgroundColor: "hsl(12 90% 52%)", color: "#fff", fontSize: "13px", fontWeight: 700, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.05em" }}
            >
              <ExternalLink style={{ width: "14px", height: "14px" }} />
              Visiter le site officiel
            </a>
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

  return createPortal(modal, document.body);
}
