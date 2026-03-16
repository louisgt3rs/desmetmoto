import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import heroHelmet from "@/assets/hero-helmet.png";

export default function HeroSection() {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!imgRef.current) return;
      const scrollY = window.scrollY;
      const rotation = scrollY * 0.15; // degrees per pixel scrolled
      imgRef.current.style.transform = `perspective(1200px) rotateY(${rotation}deg)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#0A0A0A" }}
    >
      {/* Red radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 55%, rgba(192, 57, 43, 0.35) 0%, transparent 70%)",
        }}
      />

      {/* Title above */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 font-display text-5xl md:text-7xl lg:text-9xl text-white text-center leading-none tracking-wide"
      >
        DESMET ÉQUIPEMENT
      </motion.h1>

      {/* 3D rotating helmet */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="relative z-10 my-4 md:my-8"
      >
        <img
          ref={imgRef}
          src={heroHelmet}
          alt="Arai Helmet"
          className="w-[70vw] max-w-[500px] md:max-w-[600px] lg:max-w-[700px] h-auto drop-shadow-[0_0_80px_rgba(192,57,43,0.4)]"
          style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        />
      </motion.div>

      {/* Subtitle below */}
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-10 font-display text-3xl md:text-5xl lg:text-6xl tracking-widest"
        style={{ color: "#C0392B" }}
      >
        LE HAVRE
      </motion.p>
    </section>
  );
}
