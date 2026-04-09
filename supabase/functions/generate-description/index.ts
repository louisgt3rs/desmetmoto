import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { name, brand, category, price } = await req.json();

    if (!name || !brand) {
      return new Response(JSON.stringify({ error: "name and brand are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const priceStr = price ? `${price} €` : null;

    const prompt = `Tu es un rédacteur spécialisé en équipement moto haut de gamme pour Desmet Équipement, un shop belge premium basé à Wavre.

Rédige une description commerciale en français pour ce produit :
- Nom : ${name}
- Marque : ${brand}
- Catégorie : ${category || "Équipement moto"}${priceStr ? `\n- Prix : ${priceStr}` : ""}

La description doit :
- Faire 2 paragraphes séparés par une ligne vide
- Premier paragraphe : accroche sur la promesse du produit (2-3 phrases, ton premium, style direct)
- Deuxième paragraphe : 3-4 caractéristiques techniques clés, séparées par des virgules, finissant par la certification ou norme si pertinent
- Ton : expert, sobre, haut de gamme — jamais de superlatifs vides
- Langue : français, pas de markdown, pas de titres, pas de puces
- Longueur totale : 80-120 mots maximum

Réponds uniquement avec le texte de la description, rien d'autre.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: err }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const description = data.content?.[0]?.text?.trim() ?? "";

    return new Response(JSON.stringify({ description }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
