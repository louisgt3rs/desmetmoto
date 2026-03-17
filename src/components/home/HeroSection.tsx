import { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import heroMoto from "@/assets/hero-motorcycle.png";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

function Particles({ count = 30 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 4 + 3,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.6 + 0.2,
      })),
    [count]
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: "hsl(var(--primary))",
            boxShadow: `0 0 ${p.size * 3}px hsl(var(--primary))`,
          }}
          animate={{
            y: [0, -40 - Math.random() * 60],
            x: [0, (Math.random() - 0.5) * 30],
            opacity: [0, p.opacity, 0],
            scale: [0.5, 1.2, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export default function HeroSection() {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!imgRef.current) return;
      const scrollY = window.scrollY;
      const rotation = scrollY * 0.12;
      imgRef.current.style.transform = `perspective(1200px) rotateY(${rotation}deg) rotate(-3deg)`;
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
          background:
            "radial-gradient(ellipse 55% 50% at 50% 55%, rgba(192,57,43,0.4) 0%, transparent 70%)",
        }}
      />

      {/* Particles */}
      <Particles count={35} />

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center"
      >
        <h1 className="font-display text-5xl md:text-7xl lg:text-9xl text-white leading-none tracking-wide">
          DESMET ÉQUIPEMENT
        </h1>
        <div className="mx-auto mt-2 h-1 w-32 md:w-48 rounded-full bg-primary" />
      </motion.div>

      {/* Motorcycle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="relative z-10 my-4 md:my-8"
      >
        <img
          ref={imgRef}
          src={heroMoto}
          alt="Moto sportive"
          className="w-[85vw] max-w-[550px] md:max-w-[650px] lg:max-w-[750px] h-auto drop-shadow-[0_0_80px_rgba(192,57,43,0.5)]"
          style={{
            transformStyle: "preserve-3d",
            willChange: "transform",
            transform: "perspective(1200px) rotateY(0deg) rotate(-3deg)",
          }}
        />
      </motion.div>

      {/* Subtitle + CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-10 flex flex-col items-center gap-5"
      >
        <p className="font-body text-lg md:text-xl tracking-wide text-muted-foreground text-center px-4">
          Votre spécialiste moto à Wavre
        </p>
        <Link to="/contact">
          <Button
            size="lg"
            className="text-lg px-8 py-6 shadow-[0_0_30px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_50px_hsl(var(--primary)/0.6)] transition-shadow duration-300"
          >
            Nous contacter
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
