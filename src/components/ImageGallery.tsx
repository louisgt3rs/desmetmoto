import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageGalleryProps {
  images: string[];
  altPrefix?: string;
  aspectRatio?: string;
  thumbnailSize?: string;
}

export default function ImageGallery({
  images,
  altPrefix = "Product",
  aspectRatio = "aspect-[4/3]",
  thumbnailSize = "w-16 h-16 md:w-20 md:h-20",
}: ImageGalleryProps) {
  const [idx, setIdx] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className={`${aspectRatio} bg-secondary/30 rounded-xl overflow-hidden`}>
        <AnimatePresence mode="wait">
          <motion.img
            key={images[idx]}
            src={images[idx]}
            alt={`${altPrefix} - vue ${idx + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full object-contain"
          />
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 justify-center flex-wrap">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`rounded-lg overflow-hidden border-2 transition-all duration-200 shrink-0 ${
                i === idx
                  ? "border-primary shadow-[0_0_10px_hsl(var(--glow-soft))]"
                  : "border-border hover:border-muted-foreground/50 opacity-60 hover:opacity-100"
              }`}
            >
              <img src={src} alt={`Miniature ${i + 1}`} className={`${thumbnailSize} object-cover`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
