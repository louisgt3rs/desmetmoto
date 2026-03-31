import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = "admindesmetequipement@gmail.com";
const FROM_EMAIL = "onboarding@resend.dev";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not set" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { type, reservation } = await req.json();

    if (!type || !reservation) {
      return new Response(JSON.stringify({ error: "Missing type or reservation" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emails: { to: string; subject: string; html: string }[] = [];

    if (type === "new_reservation") {
      // Email to admin
      emails.push({
        to: ADMIN_EMAIL,
        subject: `Nouvelle réservation — ${reservation.product_name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0e0e0e;color:#fff;padding:32px;border:1px solid #c9973a33">
            <h1 style="font-family:sans-serif;font-size:24px;letter-spacing:4px;text-transform:uppercase;color:#c9973a;margin:0 0 24px">
              NOUVELLE RÉSERVATION EN MAGASIN
            </h1>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#999;font-size:12px;letter-spacing:2px;text-transform:uppercase;width:140px">PRODUIT</td><td style="padding:8px 0;font-size:14px">${reservation.product_name}</td></tr>
              ${reservation.coloris ? `<tr><td style="padding:8px 0;color:#999;font-size:12px;letter-spacing:2px;text-transform:uppercase">COLORIS</td><td style="padding:8px 0;font-size:14px">${reservation.coloris}</td></tr>` : ""}
              <tr><td style="padding:8px 0;color:#999;font-size:12px;letter-spacing:2px;text-transform:uppercase">PRÉNOM</td><td style="padding:8px 0;font-size:14px">${reservation.first_name}</td></tr>
              <tr><td style="padding:8px 0;color:#999;font-size:12px;letter-spacing:2px;text-transform:uppercase">NOM</td><td style="padding:8px 0;font-size:14px">${reservation.last_name}</td></tr>
              <tr><td style="padding:8px 0;color:#999;font-size:12px;letter-spacing:2px;text-transform:uppercase">EMAIL</td><td style="padding:8px 0;font-size:14px"><a href="mailto:${reservation.email}" style="color:#c9973a">${reservation.email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#999;font-size:12px;letter-spacing:2px;text-transform:uppercase">TÉLÉPHONE</td><td style="padding:8px 0;font-size:14px">${reservation.phone}</td></tr>
              ${reservation.message ? `<tr><td style="padding:8px 0;color:#999;font-size:12px;letter-spacing:2px;text-transform:uppercase;vertical-align:top">MESSAGE</td><td style="padding:8px 0;font-size:14px">${reservation.message}</td></tr>` : ""}
              <tr><td style="padding:8px 0;color:#999;font-size:12px;letter-spacing:2px;text-transform:uppercase">DATE</td><td style="padding:8px 0;font-size:14px">${new Date().toLocaleDateString("fr-BE", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</td></tr>
            </table>
            <p style="margin-top:24px;font-size:11px;color:#666;letter-spacing:2px;text-transform:uppercase">Desmet Équipement — Panel Admin</p>
          </div>
        `,
      });
    } else if (type === "confirmed") {
      emails.push({
        to: reservation.email,
        subject: `Réservation confirmée — ${reservation.product_name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0e0e0e;color:#fff;padding:32px;border:1px solid #c9973a33">
            <h1 style="font-family:sans-serif;font-size:24px;letter-spacing:4px;text-transform:uppercase;color:#c9973a;margin:0 0 8px">RÉSERVATION CONFIRMÉE</h1>
            <p style="color:#999;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 24px">Desmet Équipement</p>
            <p style="font-size:15px;line-height:1.7;color:#ddd">Bonjour ${reservation.first_name},</p>
            <p style="font-size:15px;line-height:1.7;color:#ddd">Votre réservation pour <strong style="color:#fff">${reservation.product_name}${reservation.coloris ? ` — ${reservation.coloris}` : ""}</strong> est confirmée. Vous pouvez passer en magasin pour le retirer.</p>
            <div style="margin:24px 0;padding:16px;border-left:3px solid #c9973a;background:#c9973a0d">
              <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#c9973a">Desmet Équipement</p>
              <p style="margin:4px 0 0;font-size:14px;color:#ddd">Rue de la Châtaigneraie 20 — 1410 Waterloo</p>
              <p style="margin:2px 0 0;font-size:14px;color:#ddd">Tél : +32 2 354 13 49</p>
            </div>
            <p style="font-size:14px;color:#999">À bientôt,<br>L'équipe Desmet Équipement</p>
          </div>
        `,
      });
    } else if (type === "cancelled") {
      emails.push({
        to: reservation.email,
        subject: `Réservation annulée — ${reservation.product_name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0e0e0e;color:#fff;padding:32px;border:1px solid #c9973a33">
            <h1 style="font-family:sans-serif;font-size:24px;letter-spacing:4px;text-transform:uppercase;color:#ef4444;margin:0 0 8px">RÉSERVATION ANNULÉE</h1>
            <p style="color:#999;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 24px">Desmet Équipement</p>
            <p style="font-size:15px;line-height:1.7;color:#ddd">Bonjour ${reservation.first_name},</p>
            <p style="font-size:15px;line-height:1.7;color:#ddd">Votre réservation pour <strong style="color:#fff">${reservation.product_name}${reservation.coloris ? ` — ${reservation.coloris}` : ""}</strong> a malheureusement été annulée. N'hésitez pas à nous contacter pour plus d'informations.</p>
            <div style="margin:24px 0;padding:16px;border-left:3px solid #c9973a;background:#c9973a0d">
              <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#c9973a">Desmet Équipement</p>
              <p style="margin:4px 0 0;font-size:14px;color:#ddd">Rue de la Châtaigneraie 20 — 1410 Waterloo</p>
              <p style="margin:2px 0 0;font-size:14px;color:#ddd">Tél : +32 2 354 13 49</p>
            </div>
            <p style="font-size:14px;color:#999">L'équipe Desmet Équipement</p>
          </div>
        `,
      });
    } else {
      return new Response(JSON.stringify({ error: "Unknown email type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = await Promise.all(
      emails.map(({ to, subject, html }) =>
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
        }).then(r => r.json())
      )
    );

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
