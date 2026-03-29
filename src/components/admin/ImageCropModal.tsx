import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface ImageCropModalProps {
  imageSrc: string;
  aspect?: number;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

async function getCroppedBlob(src: string, area: Area): Promise<Blob> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = src; });
  const canvas = document.createElement("canvas");
  canvas.width = area.width;
  canvas.height = area.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
  return new Promise((res) => canvas.toBlob((b) => res(b!), "image/png"));
}

export default function ImageCropModal({ imageSrc, aspect = 1, onConfirm, onCancel }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedArea) return;
    const blob = await getCroppedBlob(imageSrc, croppedArea);
    onConfirm(blob);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-card border border-primary/30 rounded-lg w-[90vw] max-w-md overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-display text-lg text-foreground">Recadrer le logo (1:1)</h3>
        </div>
        <div className="relative h-72 bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="px-4 py-2">
          <label className="text-xs text-muted-foreground">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
        <div className="flex gap-2 p-4 border-t border-border">
          <Button onClick={handleConfirm} className="flex-1">
            <Check className="w-4 h-4 mr-2" /> Valider le recadrage
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            <X className="w-4 h-4 mr-2" /> Annuler
          </Button>
        </div>
      </div>
    </div>
  );
}
