# Desmet Équipement — Instructions Claude

## Stack technique
- **Frontend** : React 18 + Vite + TypeScript + Tailwind CSS v3
- **Routing** : React Router v6 (`/`, `/brands`, `/marques/:slug`, `/marques/:slug/:productId`, `/contact`, `/a-propos`, `/communaute`, `/arai`, `/politique-confidentialite`)
- **Backend** : Supabase (PostgreSQL + Storage + Auth)
- **Déploiement** : Vercel — toujours déployer avec `vercel --prod` après chaque modification
- **Animations** : Framer Motion
- **Icons** : Lucide React
- **Notifications** : Sonner (`toast`)

## Design system

### Couleurs
- Fond principal : `#0e0e0e` (pages générales) / `#050505` (hero BrandDetail)
- Or principal : `#c9973a` — jamais changer cette valeur
- Variantes or : `rgba(201,151,58,0.XX)` pour opacité
- Fond secondaire : `#0a0a0a`, `#080808`, `#111`
- Texte : `text-white`, `text-white/50`, `text-white/35`, `text-white/25`

### Typographie
- Titres : `font-display` (classe Tailwind custom → Bebas Neue ou équivalent display)
- Corps : taille `text-sm` à `text-[13px]`, `leading-relaxed`
- Badges/labels : `text-[9px] md:text-[11px] uppercase tracking-[0.35em–0.55em]`
- Tailles fluides hero : `clamp(5.5rem, 18vw, 13rem)` via `style={{ fontSize: "clamp(...)" }}`

### Motifs récurrents
- Bordures or fines : `border border-[#c9973a]/10` à `/30`
- Grain SVG : `<feTurbulence baseFrequency="0.72" numOctaves="4">` + `mixBlendMode: "overlay"` à `opacity: 0.04`
- Texture carbone : `repeating-linear-gradient(60deg, ...)` + `repeating-linear-gradient(-60deg, ...)`
- Ligne décorative : gradient `transparent → rgba(201,151,58,0.5)` + diamond `h-1 w-1 rotate-45`
- Glow halo logo : `radial-gradient` + `filter: blur(18–36px)` en `position: absolute`
- `textShadow` backlit : `"0 0 60px rgba(201,151,58,0.28), 0 0 120px rgba(201,151,58,0.12)"`

## Internationalisation
- Fichier : `src/i18n/translations.ts` — dictionnaire FR / NL / EN
- Contexte : `useLanguage()` → `{ t, lang, setLang }`
- Type : `TranslationKey = keyof typeof translations.fr` — TypeScript strict
- Règle : toute string visible par l'utilisateur doit passer par `t("clé")`
- Arrays avec clés typées : `{ key: "day_mon" } as const` pour que `t(h.key)` soit type-safe

## Contraintes importantes

### Images
- Ne jamais imposer `height` fixe en pixels sur une image dans un contexte responsive
- Utiliser `aspect-ratio` (ex. `aspect-square`, `aspect-video`) ou `style={{ height: X }}` uniquement sur des conteneurs avec overflow hidden
- Pour les hero portraits en bannière landscape : `object-[center_60%]`

### CSS / Tailwind
- Pas de valeurs magiques inventées — s'appuyer sur le design system ci-dessus
- Préférer Tailwind pour les cas simples, `style={{}}` pour les dégradés complexes ou `clamp()`
- `backdrop-filter: blur()` : toujours doubler avec `WebkitBackdropFilter` pour Safari

### Supabase
- Client : `@/integrations/supabase/client`
- Types : `Tables<"nom_table">` depuis `@/integrations/supabase/types`
- Slugs marques : `brand.name.toLowerCase().replace(/\s+/g, "-")`

### Déploiement
- Commande : `vercel --prod` (pas `npx vercel deploy --prod --yes`)
- Toujours build local d'abord : `npm run build` pour vérifier TypeScript
- Warning chunk >500KB : connu et non-bloquant (bundle ~970KB)

## Préférences de collaboration
- Réponses courtes et directes — pas de résumé de ce qui vient d'être fait
- Montrer le diff ou la section modifiée, pas le fichier entier
- Déployer systématiquement après chaque fix sans attendre confirmation
- Pas de commentaires dans le code sauf logique non évidente
- Pas d'emoji dans le code ni les réponses
