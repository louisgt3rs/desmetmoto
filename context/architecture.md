# Architecture — Desmet Équipement

## Pages (`src/pages/`)

| Fichier | Route | Description |
|---|---|---|
| `Index.tsx` | `/` | Homepage avec toutes les sections home |
| `Brands.tsx` | `/brands` | Grille de toutes les marques |
| `BrandDetail.tsx` | `/marques/:slug` | Page marque (hero premium + produits frost-glass) |
| `ProductDetail.tsx` | `/marques/:slug/:productId` | Fiche produit avec lightbox + formulaire réservation |
| `Arai.tsx` | `/arai` | Page dédiée Arai (viewer 3D / galerie) |
| `AraiViewer.tsx` | — | Composant viewer Arai (importé dans Arai.tsx) |
| `About.tsx` | `/a-propos` | Page À propos avec photos magasin |
| `Contact.tsx` | `/contact` | Formulaire contact + carte + horaires |
| `Community.tsx` | `/communaute` | Événements communauté |
| `EventDetail.tsx` | `/communaute/:id` | Détail événement |
| `EventBooking.tsx` | `/communaute/:id/reserver` | Réservation créneau événement |
| `NotFound.tsx` | `*` | 404 |
| `PolitiqueConfidentialite.tsx` | `/politique-confidentialite` | RGPD |
| `Admin.tsx` | `/admin` | Back-office (auth requise) |
| `ResetPassword.tsx` | `/reset-password` | Reset mot de passe Supabase |

## Composants clés (`src/components/`)

### Layout
- `Layout.tsx` — wrapper global (Navbar + children + Footer)
- `Navbar.tsx` — nav desktop/mobile + sélecteur FR/NL/EN + toggle thème
- `Footer.tsx` — liens + droits
- `SEO.tsx` — balises meta dynamiques
- `SectionHeading.tsx` — titre de section réutilisable

### Home sections (`src/components/home/`)
- `HeroSection.tsx` — hero plein écran avec slogan vertical
- `BrandsSection.tsx` — section marques homepage
- `BrandsCarousel.tsx` — carrousel marques animé
- `BrandModal.tsx` — modal détail marque + `BrandLogo` component (exporté)
- `AboutPreview.tsx` — aperçu À propos en homepage
- `CategoriesSection.tsx` — catégories produits
- `ReviewsSection.tsx` — avis Google
- `EventsSection.tsx` — countdown prochain événement
- `ContactSection.tsx` — adresse + horaires + carte
- `PopularProducts.tsx` — produits populaires
- `ServiceSection.tsx` — services proposés
- `brands-data.ts` — données statiques marques (fallback)

### UI
- `ui/` — composants shadcn/ui (Button, Input, Textarea, etc.)
- `ProductColorwaySelector.tsx` — sélecteur de coloris
- `ReservationModal.tsx` / `ReserveModal.tsx` — modals réservation
- `ImageGallery.tsx` — galerie photos lightbox

### Admin (`src/components/admin/`)
- `AdminEvents.tsx` — gestion événements back-office

## Contextes (`src/contexts/`)
- `LanguageContext.tsx` — `{ t, lang, setLang }` — FR/NL/EN, persist localStorage
- `ThemeContext.tsx` — `{ isDark, toggleTheme }` — classe `html.light` sur `document.documentElement`

## i18n (`src/i18n/`)
- `translations.ts` — dictionnaire ~150 clés × 3 langues
- `TranslationKey` — type TypeScript strict = `keyof typeof translations.fr`

## Assets (`src/assets/`)
- `store-exterior.jpg` — façade magasin
- `store-interior-1.jpeg` — allée principale
- `store-interior-alpinestars.jpeg` — espace Alpinestars
- `store-interior-2.jpeg` — espace café / vêtements
- `store-interior-3.jpeg` — espace casques Arai
- `bikes-coffee.jpg` — événement bikes & coffee
- `desmet-logo-diamond.png` — logo principal
- `category-*.jpg` — images catégories (boots, gloves, helmets, jackets)
- `helmets/` — sous-dossier photos casques
- `brands/` — logos marques statiques

## Tables Supabase

| Table | Colonnes principales | Usage |
|---|---|---|
| `brands` | `id, name, logo_url, description, categories[], country, website_url, sort_order` | Marques revendues |
| `products` | `id, brand_id, name, image_url, stock_quantity, description` | Produits par marque |
| `product_colorways` | `id, product_id, name, image_url, sort_order` | Coloris par produit |
| `events` | `id, title, description, date, event_date, time, location, image_url, capacity, registered_count, is_upcoming, is_published, sort_order` | Événements communauté |
| `event_slots_config` | `id, event_id, date, start_time, end_time, slot_duration_minutes` | Config créneaux événement |
| `event_slot_items` | `id, event_id, name, description, image_url, is_active` | Articles réservables (casques, motos...) |
| `event_slot_bookings` | `id, event_id, slot_item_id, date, slot_time, first_name, last_name, email, phone, newsletter_consent` | Réservations créneaux |

## Routing (App.tsx)
Routes définies avec `react-router-dom` v6. Wrappé dans `<ThemeProvider>` puis `<LanguageProvider>`.

## Déploiement
- Hébergé sur **Vercel** — domaine : `desmetmoto.vercel.app`
- Commande prod : `vercel --prod`
- Build : `npm run build` (Vite, ~7s, bundle ~970KB — warning connu, non-bloquant)
- Config : `vercel.json` à la racine (rewrites SPA)
