# Parts Europe Sync — Setup Guide

## Pré-requis

- Node.js 18+
- Un compte Supabase avec la service role key
- Les identifiants Parts Europe (URL du flux + clé API ou credentials FTP/Basic)

---

## 1. Installer les dépendances

```bash
cd sync
npm install
```

---

## 2. Configurer les variables d'environnement

```bash
cp .env.example .env
# Éditer .env avec les vraies valeurs
```

Variables obligatoires :
- `SUPABASE_URL` — URL du projet Supabase (ex. `https://xxx.supabase.co`)
- `SUPABASE_SERVICE_KEY` — Clé service role (dans Supabase > Settings > API)
- `FEED_FORMAT` — Format du flux Parts Europe : `xml`, `csv`, ou `json`
- `FEED_SOURCE` — URL ou chemin local vers le fichier feed

---

## 3. Appliquer la migration SQL

Dans **Supabase > SQL Editor**, exécuter le contenu de `migration.sql` :

```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_ref TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS products_supplier_ref_idx
  ON products (supplier_ref) WHERE supplier_ref IS NOT NULL;
```

Cela ajoute la colonne `supplier_ref` utilisée pour matcher les produits du flux avec ceux en base.

---

## 4. Adapter le parser au format reçu

### Si le flux est XML

Ouvrir `parsers/xml.js` et adapter `FIELD_MAP` aux noms réels des éléments XML :

```js
const FIELD_MAP = {
  ref: "PartNumber",      // → remplacer par le vrai nom de l'élément
  name: "Description",
  brand: "Brand",
  ...
};
```

Adapter aussi le chemin vers les produits dans le document :
```js
const items = [].concat(doc?.Catalog?.Products?.Product || []);
// → Remplacer Catalog.Products.Product par la vraie structure
```

### Si le flux est CSV

Ouvrir `parsers/csv.js`, adapter `FIELD_MAP` avec les vrais en-têtes de colonnes, et modifier `DELIMITER` si séparateur différent de `;`.

### Si c'est une API REST JSON

Ouvrir `parsers/json.js`, adapter `FIELD_MAP` avec les vrais noms de champs JSON, et ajuster la navigation dans la réponse (ex. `body?.data?.products`).

---

## 5. Tester manuellement

```bash
# Sync stock uniquement (rapide)
npm run sync:stock

# Sync catalogue complet (avec images — peut prendre du temps)
npm run sync:catalog

# Les deux
npm run sync:all
```

Les logs sont écrits dans `sync/logs/sync-YYYY-MM-DD.log`.

---

## 6. Lancer le cron en production

### Option A — PM2 (recommandé)

```bash
npm install -g pm2
pm2 start cron.js --name parts-europe-sync
pm2 save
pm2 startup   # pour redémarrer au reboot serveur
```

### Option B — systemd (Linux)

Créer `/etc/systemd/system/parts-europe-sync.service` :

```ini
[Unit]
Description=Parts Europe Sync
After=network.target

[Service]
WorkingDirectory=/chemin/vers/desmetmoto/sync
ExecStart=/usr/bin/node cron.js
Restart=always
EnvironmentFile=/chemin/vers/desmetmoto/sync/.env

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable parts-europe-sync
systemctl start parts-europe-sync
```

### Option C — Vercel Cron / GitHub Actions

Si le serveur n'est pas disponible 24/7, créer un GitHub Action qui appelle `sync-stock.js` toutes les heures via schedule.

---

## Cadence des syncs

| Job | Fréquence | Ce qu'il fait |
|-----|-----------|---------------|
| `sync-stock.js` | Toutes les heures | Met à jour `stock_quantity`, `in_stock`, `price` |
| `sync-catalog.js` | Chaque jour à 03h00 | Insère les nouveaux produits + télécharge les images |

---

## Mapping des catégories

Dans `sync-catalog.js`, la constante `CATEGORY_MAP` convertit les catégories Parts Europe vers les valeurs utilisées dans Supabase :

```js
const CATEGORY_MAP = {
  "Helmets": "casques",
  "Jackets": "blousons",
  ...
};
```

Compléter avec toutes les catégories reçues dans le flux.

---

## Images

Les images sont téléchargées depuis les URLs du flux et uploadées dans le bucket Supabase Storage `product-images/parts-europe/`. Si une image avec le même nom de fichier existe déjà, elle n'est pas re-téléchargée.

Créer le bucket dans **Supabase > Storage** et le rendre public si nécessaire.
