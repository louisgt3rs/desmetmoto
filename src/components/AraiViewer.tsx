import { useEffect, useRef, useState } from "react";

const LABELS = ["3/4 AVANT", "CÔTÉ GAUCHE", "3/4 ARRIÈRE", "DERRIÈRE"];

const FRAMES = [
  "https://qatsudgpieczmodjbynh.supabase.co/storage/v1/object/public/Helmets/IMG_1133.png",
  "https://qatsudgpieczmodjbynh.supabase.co/storage/v1/object/public/Helmets/IMG_1134.png",
  "https://qatsudgpieczmodjbynh.supabase.co/storage/v1/object/public/Helmets/IMG_1136.png",
  "https://qatsudgpieczmodjbynh.supabase.co/storage/v1/object/public/Helmets/IMG_1137.png",
] as const;

const SPECS_LEFT = [
  { label: "Shell", value: "PB-cLc2" },
  { label: "Homologation", value: "ECE R22-06" },
  { label: "Origine", value: "Japan" },
] as const;

const SPECS_RIGHT = [
  { label: "Visière", value: "VAS System" },
  { label: "Mousse", value: "Multi-Density EPS" },
  { label: "Poids", value: "1 400 g" },
] as const;

const CIRC = 1056;

export default function AraiViewer() {
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startFrame, setStartFrame] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = (index: number) => {
    setCurrent(((index % FRAMES.length) + FRAMES.length) % FRAMES.length);
  };

  const stopAuto = () => {
    if (autoRef.current) {
      clearInterval(autoRef.current);
      autoRef.current = null;
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  };

  const startAuto = () => {
    stopAuto();
    autoRef.current = setInterval(() => {
      setCurrent((value) => (value + 1) % FRAMES.length);
    }, 1400);
  };

  const restartAuto = () => {
    stopAuto();
    restartTimeoutRef.current = setTimeout(startAuto, 3000);
  };

  useEffect(() => {
    restartTimeoutRef.current = setTimeout(startAuto, 1600);

    return () => {
      stopAuto();
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartFrame(current);
    stopAuto();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = startX - e.clientX;
    show(startFrame + Math.round(dx / 65));
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    restartAuto();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartFrame(current);
    stopAuto();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const dx = startX - e.touches[0].clientX;
    show(startFrame + Math.round(dx / 50));
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    restartAuto();
  };

  const arcOffset = CIRC * (1 - current / FRAMES.length);

  return (
    <section
      className="relative flex min-h-[85vh] w-full items-center justify-center overflow-hidden bg-background px-4 py-20"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 70% at 50% 50%, hsl(var(--background) / 0.82) 0%, hsl(var(--background)) 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary) / 0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.05) 1px, transparent 1px)",
          backgroundSize: "55px 55px",
        }}
      />

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, hsl(var(--primary) / 0.22) 0%, hsl(var(--primary) / 0.12) 35%, transparent 72%)",
        }}
      />

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[clamp(3.5rem,9vw,7rem)] tracking-[0.2em] text-foreground/5">
        SZ·R·EVO
      </div>

      {["tl", "tr", "bl", "br"].map((pos) => (
        <div
          key={pos}
          className="absolute h-4 w-4"
          style={{
            top: pos.includes("t") ? 20 : undefined,
            bottom: pos.includes("b") ? 20 : undefined,
            left: pos.includes("l") ? 20 : undefined,
            right: pos.includes("r") ? 20 : undefined,
            borderTop: pos.includes("t") ? "1px solid hsl(var(--primary) / 0.25)" : undefined,
            borderBottom: pos.includes("b") ? "1px solid hsl(var(--primary) / 0.25)" : undefined,
            borderLeft: pos.includes("l") ? "1px solid hsl(var(--primary) / 0.25)" : undefined,
            borderRight: pos.includes("r") ? "1px solid hsl(var(--primary) / 0.25)" : undefined,
          }}
        />
      ))}

      <div className="absolute left-6 top-8 z-20 md:left-10">
        <div className="font-display text-2xl tracking-[0.18em] text-foreground md:text-3xl">ARAI</div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-foreground/40">Helmet Studio</div>
        <div
          className="mt-3 h-px w-9"
          style={{ background: "linear-gradient(to right, hsl(var(--primary)), transparent)" }}
        />
      </div>

      <div className="absolute right-6 top-8 z-20 text-right md:right-10">
        <div className="font-display text-3xl text-foreground md:text-4xl">
          <span className="text-lg text-primary md:text-xl">€</span>749
        </div>
        <div className="mt-2 inline-block border border-primary/40 px-3 py-1 text-[10px] uppercase tracking-[0.34em] text-primary">
          Découvrir
        </div>
      </div>

      <div className="absolute left-4 top-[28%] z-20 hidden flex-col gap-6 md:flex">
        {SPECS_LEFT.map((spec) => (
          <div key={spec.label} className="flex items-center gap-2">
            <div className="h-[3px] w-[3px] rounded-full bg-primary" />
            <div className="h-px w-5 bg-primary/30" />
            <div>
              <div className="text-[9px] uppercase tracking-[0.28em] text-foreground/45">{spec.label}</div>
              <div className="text-[11px] tracking-[0.13em] text-primary/80">{spec.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute right-4 top-[28%] z-20 hidden flex-col items-end gap-6 md:flex">
        {SPECS_RIGHT.map((spec) => (
          <div key={spec.label} className="flex flex-row-reverse items-center gap-2">
            <div className="h-[3px] w-[3px] rounded-full bg-primary" />
            <div className="h-px w-5 bg-primary/30" />
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-[0.28em] text-foreground/45">{spec.label}</div>
              <div className="text-[11px] tracking-[0.13em] text-primary/80">{spec.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="relative z-10 flex select-none items-center justify-center"
        style={{ width: "min(320px, 76vw)", height: "min(320px, 76vw)", cursor: isDragging ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.36em] text-foreground/40">
          ← Drag to rotate →
        </div>

        <div className="pointer-events-none absolute -inset-[18px]">
          <svg viewBox="0 0 356 356" fill="none" style={{ width: "100%", height: "100%" }}>
            <circle cx="178" cy="178" r="168" stroke="hsl(var(--primary) / 0.08)" strokeWidth="1" />
            <circle
              cx="178"
              cy="178"
              r="168"
              stroke="hsl(var(--primary) / 0.3)"
              strokeWidth="1"
              strokeDasharray="1056"
              strokeDashoffset={arcOffset}
              strokeLinecap="round"
              transform="rotate(-90 178 178)"
            />
          </svg>
        </div>

        {FRAMES.map((frame, index) => (
          <img
            key={frame}
            src={frame}
            alt={`Arai SZ-R EVO - ${LABELS[index]}`}
            className="pointer-events-none absolute inset-0 h-full w-full object-contain transition-opacity duration-300"
            style={{
              opacity: index === current ? 1 : 0,
              transform: index === 1 || index === 3 ? "scaleX(-1)" : "scale(1)",
              filter:
                "drop-shadow(0 0 30px hsl(var(--primary) / 0.15)) drop-shadow(0 15px 40px hsl(var(--background) / 0.75))",
            }}
            draggable={false}
          />
        ))}

        <div
          className="pointer-events-none absolute"
          style={{
            bottom: "-4%",
            left: "20%",
            width: "60%",
            height: 18,
            background: "radial-gradient(ellipse, hsl(var(--primary) / 0.12) 0%, transparent 70%)",
            filter: "blur(6px)",
          }}
        />

        <div className="absolute -bottom-10 left-1/2 flex -translate-x-1/2 gap-2">
          {FRAMES.map((_, index) => (
            <button
              key={LABELS[index]}
              onClick={() => {
                stopAuto();
                show(index);
                restartAuto();
              }}
              className="h-[5px] w-[5px] rounded-full border-0 transition-all duration-200"
              style={{
                background: index === current ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.2)",
                transform: index === current ? "scale(1.4)" : "scale(1)",
              }}
              aria-label={`Afficher ${LABELS[index]}`}
              type="button"
            />
          ))}
        </div>

        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.4em] text-primary/80">
          {LABELS[current]}
        </div>
      </div>

      <div className="absolute bottom-10 left-6 z-20 md:left-10">
        <div className="text-[10px] uppercase tracking-[0.46em] text-primary">Track tested</div>
        <div className="font-display text-[clamp(2.75rem,7vw,5rem)] leading-[0.9] text-foreground">
          SZ·R<br />
          <span className="text-primary">EVO</span>
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/30">
          Glancing Off Shape — Prouvé sur circuit
        </div>
      </div>

      <div className="absolute bottom-10 right-6 z-20 hidden items-center gap-2 md:flex md:right-10">
        <span className="text-[9px] uppercase tracking-[0.4em] text-foreground/30">Scroll</span>
        <div
          className="h-[34px] w-px"
          style={{ background: "linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.55), transparent)" }}
        />
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(to right, transparent, hsl(var(--primary) / 0.35), transparent)" }}
      />
    </section>
  );
}
