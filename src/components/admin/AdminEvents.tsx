import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { ImageUploadSingle } from "./ImageUpload";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [editing, setEditing] = useState<Event | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", time: "", location: "", image_url: "" });

  const load = async () => {
    const { data } = await supabase.from("events").select("*").order("date", { ascending: false });
    if (data) setEvents(data);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Le titre est requis"); return; }
    const payload = {
      title: form.title, description: form.description, date: form.date || null,
      time: form.time || null, location: form.location || null, image_url: form.image_url || null,
    };
    if (editing) {
      const { error } = await supabase.from("events").update(payload).eq("id", editing.id);
      if (error) { toast.error("Erreur: " + error.message); return; }
      toast.success("Événement modifié");
    } else {
      const { error } = await supabase.from("events").insert(payload);
      if (error) { toast.error("Erreur: " + error.message); return; }
      toast.success("Événement créé");
    }
    cancel(); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet événement ?")) return;
    await supabase.from("events").delete().eq("id", id);
    toast.success("Événement supprimé"); load();
  };

  const startEdit = (e: Event) => {
    setEditing(e); setAdding(false);
    setForm({ title: e.title, description: e.description || "", date: e.date || "", time: e.time || "", location: e.location || "", image_url: e.image_url || "" });
  };

  const startAdd = () => { setAdding(true); setEditing(null); setForm({ title: "", description: "", date: "", time: "", location: "", image_url: "" }); };
  const cancel = () => { setAdding(false); setEditing(null); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-foreground">ÉVÉNEMENTS ({events.length})</h2>
        <Button size="sm" onClick={startAdd}><Plus className="w-4 h-4 mr-2" /> Créer</Button>
      </div>

      {(adding || editing) && (
        <div className="bg-card border border-primary/30 rounded-lg p-6 mb-6 space-y-4">
          <h3 className="font-display text-lg text-foreground">{editing ? "Modifier" : "Nouvel"} événement</h3>
          <Input placeholder="Titre" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="bg-secondary border-border" />
          <Textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="bg-secondary border-border" />
          <div className="grid grid-cols-2 gap-4">
            <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="bg-secondary border-border" />
            <Input placeholder="Heure (ex: 10:00)" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="bg-secondary border-border" />
          </div>
          <Input placeholder="Lieu" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="bg-secondary border-border" />
          <ImageUploadSingle value={form.image_url} onChange={v => setForm({...form, image_url: v})} folder="events" label="Image de l'événement" />
          <div className="flex gap-2">
            <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Enregistrer</Button>
            <Button variant="outline" onClick={cancel}><X className="w-4 h-4 mr-2" /> Annuler</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {events.map(e => (
          <div key={e.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-foreground font-medium truncate">{e.title}</p>
              <p className="text-xs text-muted-foreground">{e.date ? new Date(e.date).toLocaleDateString("fr-BE") : "Date TBD"} • {e.time || "—"} • {e.location}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => startEdit(e)}><Pencil className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(e.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
