import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Accueil", path: "/" },
  { label: "Marques", path: "/brands" },
  { label: "Arai", path: "/arai" },
  { label: "Communauté", path: "/community" },
  { label: "À Propos", path: "/about" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Lock body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="font-display text-2xl tracking-wider text-foreground">
            DESMET <span className="text-primary">ÉQUIPEMENT</span>
          </Link>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className={`text-sm font-medium tracking-wide transition-colors hover:text-primary ${
                  location.pathname === l.path ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <a href="tel:010842139" className="flex items-center gap-2 text-sm text-primary font-medium">
              <Phone className="w-4 h-4" /> 010 84 21 39
            </a>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(true)} className="lg:hidden text-foreground">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Sidebar portal — renders at document.body level so it's above everything */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <>
              {/* Dark transparent overlay — site content visible behind */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 lg:hidden"
                style={{ backgroundColor: "rgba(0,0,0,0.55)", zIndex: 9998 }}
                onClick={() => setOpen(false)}
              />

              {/* Right sidebar panel — exactly 280px, not full width */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
                className="fixed top-0 right-0 bottom-0 lg:hidden flex flex-col border-l-2 border-primary"
                style={{
                  width: "280px",
                  maxWidth: "80vw",
                  backgroundColor: "#0A0A0A",
                  zIndex: 9999,
                }}
              >
                {/* Close button */}
                <div className="flex justify-end p-5">
                  <button onClick={() => setOpen(false)} className="text-white hover:text-primary transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Links */}
                <div className="flex flex-col gap-7 px-7 pt-2 flex-1">
                  {navLinks.map((l) => (
                    <Link
                      key={l.path}
                      to={l.path}
                      onClick={() => setOpen(false)}
                      className={`text-base font-display uppercase tracking-wider transition-colors hover:text-primary ${
                        location.pathname === l.path ? "text-primary" : "text-white"
                      }`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>

                {/* Phone at bottom */}
                <div className="px-7 pb-10">
                  <a href="tel:010842139" className="flex items-center gap-2 text-primary font-medium">
                    <Phone className="w-4 h-4" /> 010 84 21 39
                  </a>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
