import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("store_settings").select("*").then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach(s => { map[s.key] = s.value || ""; });
        setSettings(map);
      }
      setLoading(false);
    });
  }, []);

  const update = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const promises = Object.entries(settings).map(([key, value]) =>
      supabase.from("store_settings").update({ value }).eq("key", key)
    );
    await Promise.all(promises);
    toast.success("Paramètres enregistrés");
  };

  if (loading) return <p className="text-muted-foreground">Chargement...</p>;

  const fields = [
    { key: "hero_title", label: "Titre principal", type: "input" },
    { key: "hero_subtitle", label: "Sous-titre", type: "input" },
    { key: "about_text", label: "Texte À Propos", type: "textarea" },
    { key: "address", label: "Adresse", type: "input" },
    { key: "phone", label: "Téléphone", type: "input" },
    { key: "hours_weekday", label: "Horaires semaine", type: "input" },
    { key: "hours_saturday", label: "Horaires samedi", type: "input" },
    { key: "hours_sunday", label: "Horaires dimanche", type: "input" },
  ];

  return (
    <div>
      <h2 className="font-display text-2xl text-foreground mb-6">PARAMÈTRES DU SITE</h2>
      <div className="space-y-4 max-w-2xl">
        {fields.map(f => (
          <div key={f.key}>
            <label className="text-sm text-muted-foreground mb-1 block">{f.label}</label>
            {f.type === "textarea" ? (
              <Textarea value={settings[f.key] || ""} onChange={e => update(f.key, e.target.value)} className="bg-secondary border-border" />
            ) : (
              <Input value={settings[f.key] || ""} onChange={e => update(f.key, e.target.value)} className="bg-secondary border-border" />
            )}
          </div>
        ))}
        <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Enregistrer les paramètres</Button>
      </div>
    </div>
  );
}
