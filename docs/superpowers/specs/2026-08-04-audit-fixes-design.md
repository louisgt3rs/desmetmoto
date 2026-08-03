# Correction des aspérités — audit visuel pré-livraison

## Contexte

Le site doit être livré au patron cette semaine. Un audit visuel du parcours
client (accueil, marques, fiche produit, intercoms, panier, contact, à propos)
a été mené en local via Playwright (captures desktop 1440px et mobile 390px,
scroll complet pour déclencher les animations au scroll avant capture).

6 aspérités ont été identifiées. 4 sont retenues pour cette semaine — celles
corrigeables sans nouvelle prise de vue produit :

| # | Aspérité | Portée |
|---|----------|--------|
| 1 | Lien mort sur fiche intercom | Cette semaine |
| 3 | Événement périmé mis en avant sur l'accueil | Cette semaine |
| 5 | Sélecteur de coloris = boutons texte, pas de pastille | Cette semaine |
| 6 | Case vide visible dans la grille produits d'une marque | Cette semaine |
| 2 | Photos produit manquantes (Cardo, Alpinestars) | Reporté — nécessite prise de vue |
| 4 | Photos produit incohérentes (studio vs. boutique) | Reporté — nécessite prise de vue |

## 1 — Lien mort sur fiche intercom

**Constat.** `src/pages/IntercomDetail.tsx` résout `/intercoms/:slug` via un
objet statique `PRODUCTS` codé en dur qui ne couvre que 5 modèles Sena
(`sf2`, `sf4`, `50s`, `50r`, `30k`). La page liste `/intercoms` affiche elle
tous les produits de la table Supabase `installation_intercoms` (Cardo,
Alpinestars, etc.). Tout produit hors des 5 clés statiques mène à l'état
"Produit introuvable" — confirmé en reproduisant le clic sur "Tech-Air Comm"
(Alpinestars).

**Fix.** Quand `slug` n'a pas d'entrée dans `PRODUCTS`, charger le produit
depuis `installation_intercoms` (déjà interrogée pour la galerie/prix/stock)
et rendre une version simplifiée de la fiche à partir de ces données
(`name`, `brand`, `description`, `image_url`, `gallery_images`, `prix`,
`stock`, `pack_duo`, `prix_duo`). Les sections spécifiques aux données
statiques absentes de la table (stats techniques détaillées, compatibilité
casques, highlights) sont omises pour ce chemin — seules les infos
réellement disponibles en base sont affichées. Pas de nouvelle table ni
migration : la donnée existe déjà.

Ce fix est générique — il couvre Tech-Air Comm et tout autre produit
actuellement cassé ou ajouté plus tard sans entrée statique, pas seulement
le cas testé.

## 2 & 4 — Photos produit (reporté)

Hors scope cette semaine. Nécessite soit de nouvelles prises de vue en
boutique (packshot studio pour Cardo/Alpinestars), soit un recadrage/retouche
des photos existantes pour matcher le style studio des autres produits. À
traiter dans un second temps, hors de ce plan de correction.

## 3 — Événement périmé sur l'accueil

**Constat.** `src/components/home/EventsSection.tsx` (lignes ~42-52) trie
les événements par date croissante et cherche le premier avec
`event_date >= today`. Si aucun n'est trouvé, le code retombe sur
`events[0]` — soit le plus ancien événement de la table, même s'il est
passé. Résultat observé : la section "Bikes & Coffee" de l'accueil met en
avant "Arai Test Days" et "Journée Arai — Essais & Fitting", datés du 21
avril 2026, alors qu'on est en août 2026. L'affiche de l'événement (visuel
flyer imprimé, police grunge) tranche aussi avec le reste du design mais ce
point visuel n'est pas retouché ici — seul l'affichage d'un événement périmé
est corrigé.

**Fix.** Ne plus retomber sur `events[0]` quand aucun événement à venir
n'existe. Utiliser l'état vide déjà prévu dans le composant
(`t("events_coming_soon")`) à la place. Dès qu'un nouvel événement à venir
sera ajouté en base, il s'affichera normalement — aucun changement côté
admin nécessaire.

## 5 — Sélecteur de coloris sans pastille visuelle

**Constat.** Dans `src/pages/ProductDetail.tsx` (lignes ~417-437), le
sélecteur de coloris est un groupe de boutons texte uppercase
(`DIAMOND WHITE`, `SUPRA YELLOW`, ...). Le mécanisme de bascule de galerie
par coloris fonctionne déjà correctement en code (`gallery` useMemo utilise
`selectedColorway.image_url`/`gallery_images` quand présents) — l'absence de
changement visuel constatée sur le Quantic vient du fait que la plupart des
coloris en base pointent vers la même photo ou n'en ont pas de dédiée. Ce
n'est pas un bug de code, et corriger la donnée (photo par coloris) est hors
scope cette semaine (cf. #2/#4).

**Fix (habillage visuel uniquement, aucune donnée modifiée).** Ajouter une
pastille de couleur devant le nom de chaque bouton coloris :
- Si `colorway.image_url` existe, l'utiliser comme mini-vignette circulaire
  (déjà chargée par le navigateur pour la galerie, pas de coût réseau
  supplémentaire).
- Sinon, dériver une couleur depuis `colorway.name` via une table de
  correspondance mot-clé → couleur (blanc/white, jaune/yellow, rouge/red,
  noir/black, bleu/blue, etc.), avec un gris neutre en dernier recours.

## 6 — Case vide dans la grille produits d'une marque

**Constat.** `src/pages/BrandDetail.tsx` ligne ~325 : la grille
`grid gap-px sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` utilise un fond
doré translucide (`rgba(201,151,58,0.08)`) posé derrière la grille pour
dessiner de fines lignes entre les cartes (technique du `gap` rempli par le
fond du parent). Quand le nombre de produits n'est pas un multiple de 4
(ex. Arai avec 3 modèles), la case vide en fin de grille laisse ce fond
visible comme une case fantôme.

**Fix.** Remplacer la technique "fond de gap" par des bordures directes sur
chaque carte produit (`border` avec la même couleur dorée translucide) et
un `gap` normal sans fond visible sur le conteneur. Une case vide ne peint
alors plus rien.

## Hors scope / non traité

- Photos produit manquantes ou incohérentes (#2, #4) — nécessite du contenu,
  pas du code.
- Retouche du visuel de l'affiche d'événement pour matcher le design du
  site — pas demandé, seul l'affichage d'un événement périmé est corrigé.
- Audit exhaustif de toutes les pages restantes (community, event detail,
  category page, accessory detail, panier confirmation, admin) — non
  couvert par cet audit, hors scope de ce plan.

## Vérification

Pour chaque fix, revérifier avec le même protocole que l'audit initial
(captures Playwright desktop + mobile) :
- #1 : cliquer sur chaque produit listé dans `/intercoms` et confirmer
  qu'aucun ne mène à "Produit introuvable".
- #3 : avec la base actuelle (événements passés uniquement), confirmer que
  l'accueil affiche l'état "à venir prochainement" et non un événement
  périmé.
- #5 : confirmer visuellement la présence des pastilles sur la fiche
  Quantic (11 coloris).
- #6 : confirmer visuellement l'absence de case vide sur `/marques/arai`
  (3 produits, grille 4 colonnes en desktop).
