import { motion } from "framer-motion";

interface Props {
  title: string;
  subtitle?: string;
  center?: boolean;
}

export default function SectionHeading({ title, subtitle, center = true }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`mb-12 ${center ? "text-center" : ""}`}
    >
      <h2 className="font-display text-4xl md:text-5xl text-foreground mb-3">{title}</h2>
      {subtitle && <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
      <div className={`w-16 h-1 bg-primary mt-4 ${center ? "mx-auto" : ""}`} />
    </motion.div>
  );
}
