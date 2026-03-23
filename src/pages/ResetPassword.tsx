import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ChevronLeft, KeyRound, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type ResetState = "loading" | "ready" | "invalid" | "success";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [state, setState] = useState<ResetState>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const hydrateRecoverySession = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type");

      if (!accessToken || !refreshToken || !type || !["recovery", "invite"].includes(type)) {
        setState("invalid");
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      setState(error ? "invalid" : "ready");
    };

    void hydrateRecoverySession();
  }, []);

  const passwordTooShort = useMemo(() => password.length > 0 && password.length < 8, [password]);
  const passwordsMismatch = useMemo(
    () => confirmPassword.length > 0 && password !== confirmPassword,
    [password, confirmPassword]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setState("success");
    toast.success("Mot de passe mis à jour.");
    window.history.replaceState({}, document.title, window.location.pathname);
    setTimeout(() => navigate("/admin", { replace: true }), 1200);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.24),transparent_30%),linear-gradient(135deg,hsl(var(--background)),hsl(var(--card))_55%,hsl(var(--background)))]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:px-8">
        <div className="hidden lg:block">
          <div className="max-w-xl space-y-6">
            <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ChevronLeft className="h-4 w-4" /> Retour à l'espace admin
            </Link>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-secondary/50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" /> Accès sécurisé
              </div>
              <h1 className="font-display text-6xl leading-none text-foreground">RÉINITIALISATION</h1>
              <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
                Définissez un nouveau mot de passe pour retrouver l'accès à l'administration en toute sécurité.
              </p>
            </div>
          </div>
        </div>

        <Card className="w-full max-w-md border-border/80 bg-card/95 shadow-2xl backdrop-blur-sm lg:ml-auto">
          <CardHeader className="space-y-3">
            <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground lg:hidden">
              <ChevronLeft className="h-4 w-4" /> Retour à l'espace admin
            </Link>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {state === "loading" ? <Loader2 className="h-6 w-6 animate-spin" /> : <KeyRound className="h-6 w-6" />}
            </div>
            <div className="space-y-1">
              <CardTitle className="font-display text-4xl text-foreground">Nouveau mot de passe</CardTitle>
              <CardDescription>
                {state === "ready" && "Choisissez un mot de passe fort pour finaliser l'accès."}
                {state === "loading" && "Vérification du lien sécurisé en cours..."}
                {state === "invalid" && "Ce lien est invalide ou expiré."}
                {state === "success" && "C'est bon, vous allez être redirigé vers l'administration."}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {state === "ready" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="new-password">Nouveau mot de passe</label>
                  <Input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="h-11 bg-secondary/70"
                    autoComplete="new-password"
                  />
                  {passwordTooShort && <p className="text-xs text-destructive">Minimum 8 caractères.</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="confirm-password">Confirmer le mot de passe</label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    className="h-11 bg-secondary/70"
                    autoComplete="new-password"
                  />
                  {passwordsMismatch && <p className="text-xs text-destructive">Les mots de passe doivent être identiques.</p>}
                </div>

                <Button type="submit" className="h-11 w-full" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {saving ? "Enregistrement..." : "Mettre à jour le mot de passe"}
                </Button>
              </form>
            )}

            {state === "invalid" && (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Redemandez un email de réinitialisation pour recevoir un nouveau lien valide.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/admin">Retour à la connexion admin</Link>
                </Button>
              </div>
            )}

            {state === "success" && (
              <Button asChild className="w-full">
                <Link to="/admin">Aller à l'administration</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}