import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

async function uploadFile(file: File, folder: string): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("images").upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) { toast.error("Erreur upload: " + error.message); return null; }
  const { data } = supabase.storage.from("images").getPublicUrl(path);
  return data.publicUrl;
}

/* ── Single image upload ── */
interface SingleProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  previewClass?: string;
}

export function ImageUploadSingle({ value, onChange, folder = "uploads", label, previewClass = "w-20 h-20" }: SingleProps) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    const url = await uploadFile(file, folder);
    setUploading(false);
    if (url) onChange(url);
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
      <div className="flex items-center gap-3 flex-wrap">
        {value ? (
          <div className="relative group">
            <img src={value} alt="" className={`${previewClass} object-cover rounded-lg border border-border`} />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className={`${previewClass} bg-secondary rounded-lg border border-dashed border-border flex items-center justify-center`}>
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
            {value ? "Remplacer" : "Choisir image"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Multi image upload ── */
interface MultiProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  label?: string;
}

export function ImageUploadMulti({ value, onChange, folder = "uploads", label }: MultiProps) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadFile(file, folder);
      if (url) urls.push(url);
    }
    setUploading(false);
    onChange([...value, ...urls]);
  };

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div key={i} className="relative group">
            <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-border" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <div>
          <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} />
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={uploading}
            className="w-16 h-16 bg-secondary rounded-lg border border-dashed border-border flex items-center justify-center hover:border-primary/50 transition-colors"
          >
            {uploading ? <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" /> : <Upload className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>
      </div>
    </div>
  );
}
