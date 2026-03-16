import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  helmetModel?: string;
}

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ReservationModal({ open, onClose, helmetModel }: Props) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", size: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("reservations").insert({
      name: form.name,
      phone: form.phone,
      email: form.email,
      product_name: helmetModel || "",
      size: form.size,
      message: form.message || null,
    });
    setLoading(false);
    if (error) { toast.error("Erreur lors de l'envoi"); return; }
    toast.success("Réservation envoyée avec succès !");
    setForm({ name: "", phone: "", email: "", size: "", message: "" });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-foreground">Réserver en Magasin</DialogTitle>
        </DialogHeader>
        {helmetModel && <p className="text-sm text-primary font-medium">{helmetModel}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Nom complet" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="bg-secondary border-border" />
          <Input placeholder="Téléphone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required className="bg-secondary border-border" />
          <Input placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="bg-secondary border-border" />
          <Select value={form.size} onValueChange={v => setForm({...form, size: v})}>
            <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Taille" /></SelectTrigger>
            <SelectContent>{sizes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Textarea placeholder="Message (optionnel)" value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="bg-secondary border-border" />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Envoyer la Réservation
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
