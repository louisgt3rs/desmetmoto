import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Sun, Moon } from "lucide-react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { Language } from "@/i18n/translations";

const LANGS: { code: Language; label: string }[] = [
  { code: "fr", label: "FR" },
  { code: "nl", label: "NL" },
  { code: "en", label: "EN" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const navLinks = [
    { label: t("nav_home"),      path: "/" },
    { label: t("nav_arai"),      path: "/marques" },
    { label: t("nav_community"), path: "/community" },
    { label: t("nav_about"),     path: "/about" },
    { label: t("nav_contact"),   path: "/contact" },
  ];

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const navBg = isDark ? "#0A0A0A" : "#ffffff";
  const sidebarBg = isDark ? "#0A0A0A" : "#ffffff";

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-border"
        style={{ backgroundColor: navBg }}
      >
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="font-display text-2xl tracking-wider text-foreground">
            DESMET <span className="text-primary">ÉQUIPEMENT</span>
          </Link>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className={`text-sm font-medium tracking-wide transition-colors hover:text-primary ${
                  location.pathname.startsWith(l.path) && l.path !== "/" ? "text-primary" : location.pathname === l.path ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <a href="tel:010842139" className="flex items-center gap-2 text-sm text-primary font-medium">
              <Phone className="w-4 h-4" /> 010 84 21 39
            </a>

            {/* Lang selector */}
            <div className="flex items-center gap-0.5 border border-border rounded px-1 py-0.5">
              {LANGS.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className={`px-2 py-0.5 font-display text-[11px] uppercase tracking-wider rounded transition-colors ${
                    lang === code
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile: theme + hamburger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button onClick={toggleTheme} className="text-muted-foreground hover:text-primary transition-colors">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setOpen(true)} className="text-foreground">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {createPortal(
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 lg:hidden"
                style={{ backgroundColor: "rgba(0,0,0,0.55)", zIndex: 9998 }}
                onClick={() => setOpen(false)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
                className="fixed top-0 right-0 bottom-0 lg:hidden flex flex-col border-l-2 border-primary"
                style={{ width: "280px", maxWidth: "80vw", backgroundColor: sidebarBg, zIndex: 9999 }}
              >
                <div className="flex justify-end p-5">
                  <button onClick={() => setOpen(false)} className="text-foreground hover:text-primary transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex flex-col gap-7 px-7 pt-2 flex-1">
                  {navLinks.map((l) => (
                    <Link
                      key={l.path}
                      to={l.path}
                      onClick={() => setOpen(false)}
                      className={`text-base font-display uppercase tracking-wider transition-colors hover:text-primary ${
                        location.pathname === l.path ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>

                {/* Mobile lang + phone */}
                <div className="px-7 pb-10 space-y-4">
                  <div className="flex items-center gap-1">
                    {LANGS.map(({ code, label }) => (
                      <button
                        key={code}
                        onClick={() => setLang(code)}
                        className={`px-3 py-1 font-display text-xs uppercase tracking-wider border transition-colors ${
                          lang === code
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
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
