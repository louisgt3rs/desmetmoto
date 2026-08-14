import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Archive, Check, Loader2, Mail, Search } from "lucide-react";

type MessageStatus = "pending" | "confirmed" | "cancelled";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: MessageStatus;
  created_at: string;
}

const STATUS_LABEL: Record<MessageStatus, string> = {
  pending:   "À TRAITER",
  confirmed: "TRAITÉ",
  cancelled: "ARCHIVÉ",
};

const STATUS_STYLE: Record<MessageStatus, string> = {
  pending:   "border-[#c9973a]/50 bg-[#c9973a]/10 text-[#c9973a]",
  confirmed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  cancelled: "border-red-500/30 bg-red-500/10 text-red-400/70",
};

// Le percent-encoding gonfle le corps d'environ 1,6x : au-delà, on dépasse la
// limite mailto d'environ 2000 caractères d'Outlook et de ShellExecute.
const MAX_QUOTED_CHARS = 700;

function buildReplyHref(m: ContactMessage) {
  const subject = `Re: votre message — Desmet Équipement`;
  const sentOn = new Date(m.created_at).toLocaleDateString("fr-BE", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const quoted = m.message.length > MAX_QUOTED_CHARS
    ? m.message.slice(0, MAX_QUOTED_CHARS) + "\n[...] (message complet dans l'admin)"
    : m.message;
  const body =
    `Bonjour ${m.name},\n\n\n\n` +
    `--\nDesmet Équipement — Chaussée de Louvain 491, 1300 Wavre — 010/84 21 39\n\n` +
    `Le ${sentOn}, vous nous avez écrit :\n` +
    quoted.split("\n").map(line => `> ${line}`).join("\n");

  return `mailto:${m.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<MessageStatus | "">("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from("contact_messages" as any) as any)
      .select("id, name, email, phone, message, status, created_at")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast.error("ERREUR DE CHARGEMENT : " + error.message.toUpperCase());
      return;
    }
    setMessages((data || []) as ContactMessage[]);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = messages;
    if (filterStatus) list = list.filter(m => m.status === filterStatus);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(m =>
        [m.name, m.email, m.phone, m.message].some(v => v?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [messages, filterStatus, search]);

  const counts = useMemo(() => ({
    pending:   messages.filter(m => m.status === "pending").length,
    confirmed: messages.filter(m => m.status === "confirmed").length,
    cancelled: messages.filter(m => m.status === "cancelled").length,
  }), [messages]);

  const updateStatus = async (m: ContactMessage, newStatus: MessageStatus) => {
    setActionLoading(m.id + newStatus);
    const { error } = await (supabase.from("contact_messages" as any) as any)
      .update({ status: newStatus })
      .eq("id", m.id);
    setActionLoading(null);

    if (error) {
      toast.error("ERREUR : " + error.message.toUpperCase());
      return;
    }
    setMessages(prev => prev.map(x => x.id === m.id ? { ...x, status: newStatus } : x));
    toast.success(newStatus === "confirmed" ? "MESSAGE MARQUÉ COMME TRAITÉ" : "MESSAGE ARCHIVÉ");
  };

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("fr-BE", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " + new Date(s).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-3 gap-3">
        {(["pending", "confirmed", "cancelled"] as MessageStatus[]).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(f => f === s ? "" : s)}
            className={`border p-4 text-left transition-all ${filterStatus === s
              ? "border-[hsl(var(--admin-accent))] bg-[hsl(var(--admin-accent)/0.12)]"
              : "border-[hsl(var(--admin-accent)/0.16)] bg-[hsl(var(--admin-card))] hover:border-[hsl(var(--admin-accent)/0.4)]"}`}
          >
            <p className="font-adminDisplay text-3xl text-[hsl(var(--admin-foreground))]">{counts[s]}</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--admin-muted-foreground))]">{STATUS_LABEL[s]}</p>
          </button>
        ))}
      </div>

      <div className="admin-card rounded-none p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="admin-kicker text-xs text-[hsl(var(--admin-muted-foreground))]">FORMULAIRE DE CONTACT</p>
            <h2 className="font-adminDisplay text-3xl text-[hsl(var(--admin-foreground))]">
              MESSAGES ({filtered.length})
            </h2>
          </div>
          <div className="relative min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--admin-muted-foreground))]" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="RECHERCHER..."
              className="admin-input pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[20vh] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-[hsl(var(--admin-accent))]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-[hsl(var(--admin-accent)/0.18)] p-8 text-center text-sm uppercase tracking-[0.18em] text-[hsl(var(--admin-muted-foreground))]">
            AUCUN MESSAGE TROUVÉ
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(m => (
              <div
                key={m.id}
                className="border border-[hsl(var(--admin-accent)/0.16)] bg-[hsl(var(--admin-background))] p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center border px-2 py-0.5 font-adminDisplay text-[10px] tracking-[0.16em] ${STATUS_STYLE[m.status]}`}>
                        {STATUS_LABEL[m.status]}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.1em] text-[hsl(var(--admin-muted-foreground))]">
                        {fmtDate(m.created_at)}
                      </span>
                    </div>

                    <p className="font-adminDisplay text-lg leading-tight text-[hsl(var(--admin-foreground))]">
                      {m.name}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs uppercase tracking-[0.1em] text-[hsl(var(--admin-foreground))]">
                      <a href={`mailto:${m.email}`} className="text-[hsl(var(--admin-accent))] hover:underline">
                        {m.email}
                      </a>
                      {m.phone && <span>{m.phone}</span>}
                    </div>

                    <p className="whitespace-pre-wrap break-words pt-2 text-sm leading-relaxed text-[hsl(var(--admin-muted-foreground))]">
                      {m.message}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      asChild
                      className="h-9 rounded-none border border-[hsl(var(--admin-accent)/0.5)] bg-[hsl(var(--admin-accent)/0.12)] px-4 font-adminDisplay text-xs tracking-[0.14em] text-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent)/0.25)]"
                    >
                      <a href={buildReplyHref(m)}>
                        <Mail className="h-3 w-3" /> RÉPONDRE
                      </a>
                    </Button>

                    {m.status !== "confirmed" && (
                      <Button
                        onClick={() => updateStatus(m, "confirmed")}
                        disabled={actionLoading !== null}
                        className="h-9 rounded-none border border-emerald-500/50 bg-emerald-500/10 px-4 font-adminDisplay text-xs tracking-[0.14em] text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50"
                      >
                        {actionLoading === m.id + "confirmed"
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <Check className="h-3 w-3" />}
                        TRAITÉ
                      </Button>
                    )}

                    {m.status !== "cancelled" && (
                      <Button
                        onClick={() => updateStatus(m, "cancelled")}
                        disabled={actionLoading !== null}
                        className="h-9 rounded-none border border-red-500/40 bg-transparent px-4 font-adminDisplay text-xs tracking-[0.14em] text-red-400 hover:bg-red-500/15 disabled:opacity-50"
                      >
                        {actionLoading === m.id + "cancelled"
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <Archive className="h-3 w-3" />}
                        ARCHIVER
                      </Button>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
