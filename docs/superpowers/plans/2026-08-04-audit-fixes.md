# Correction des aspérités — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger 6 bugs identifiés lors de l'audit visuel et du crawl de liens internes du site (lien produit mort, événement périmé affiché en avant, sélecteur de coloris sans retour visuel, case vide dans une grille produit, 4 liens morts vers `/marques`, avertissement React de clé dupliquée dans le footer) avant la livraison de cette semaine.

**Architecture:** Chaque fix touche un fichier existant, sans nouvelle table ni migration Supabase. Deux fixes extraient une petite fonction pure et testable dans `src/lib/` (sélection de l'événement à venir, conversion nom de couleur → hex) ; les deux autres sont des changements de rendu direct dans la page concernée, vérifiés visuellement avec le script Playwright déjà utilisé pour l'audit.

**Tech Stack:** React 18 + TypeScript, React Router v6, Supabase, Vitest + Testing Library, Playwright (vérification visuelle uniquement, pas de suite e2e existante).

**Note sur le contexte du dépôt :** `src/pages/BrandDetail.tsx`, `src/pages/ProductDetail.tsx` et `src/pages/IntercomDetail.tsx` ont déjà des modifications non commitées dans le répertoire de travail (travail en cours sur d'autres sujets). Ce plan s'exécute **dans le répertoire de travail actuel, pas dans un worktree isolé** — un worktree partirait du dernier commit et perdrait ce travail en cours. Chaque tâche ci-dessous précise le contexte exact autour des lignes modifiées pour rester correct malgré ces changements déjà en place ; si le contenu réel diffère légèrement de ce qui est montré ici (parce que le travail en cours a bougé les lignes), retrouver le bloc par son contenu logique plutôt que par numéro de ligne exact.

---

### Task 1: Fonction pure `pickUpcomingEvent` + fix de l'événement périmé

**Files:**
- Create: `src/lib/events.ts`
- Test: `src/lib/events.test.ts`
- Modify: `src/components/home/EventsSection.tsx:42-53`

- [ ] **Step 1: Write the failing test**

Create `src/lib/events.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { pickUpcomingEvent } from "./events";

type TestEvent = { event_date?: string | null; date?: string | null; is_upcoming?: boolean | null; title: string };

describe("pickUpcomingEvent", () => {
  it("returns the earliest event on or after today", () => {
    const events: TestEvent[] = [
      { date: "2026-04-21", title: "Past event" },
      { date: "2026-09-10", title: "Next upcoming" },
      { date: "2026-12-01", title: "Later upcoming" },
    ];
    const result = pickUpcomingEvent(events, "2026-08-04");
    expect(result?.title).toBe("Next upcoming");
  });

  it("prefers event_date over date when both are present", () => {
    const events: TestEvent[] = [
      { date: "2026-01-01", event_date: "2026-09-10", title: "Uses event_date" },
    ];
    const result = pickUpcomingEvent(events, "2026-08-04");
    expect(result?.title).toBe("Uses event_date");
  });

  it("returns null when every event is in the past", () => {
    const events: TestEvent[] = [
      { date: "2026-04-21", title: "Past event 1" },
      { date: "2026-05-01", title: "Past event 2" },
    ];
    const result = pickUpcomingEvent(events, "2026-08-04");
    expect(result).toBeNull();
  });

  it("returns null for an empty list", () => {
    expect(pickUpcomingEvent([], "2026-08-04")).toBeNull();
  });

  it("excludes events explicitly marked is_upcoming: false even if dated in the future", () => {
    const events: TestEvent[] = [
      { date: "2026-09-10", is_upcoming: false, title: "Hidden" },
      { date: "2026-10-01", title: "Visible" },
    ];
    const result = pickUpcomingEvent(events, "2026-08-04");
    expect(result?.title).toBe("Visible");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/lib/events.test.ts`
Expected: FAIL — `Cannot find module './events'` (file doesn't exist yet)

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/events.ts`:

```typescript
export interface UpcomingEventCandidate {
  event_date?: string | null;
  date?: string | null;
  is_upcoming?: boolean | null;
}

export function pickUpcomingEvent<T extends UpcomingEventCandidate>(
  events: T[],
  todayISO: string
): T | null {
  return events.find(
    (event) => (event.event_date || event.date || "") >= todayISO && event.is_upcoming !== false
  ) ?? null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/lib/events.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Use the pure function in EventsSection and drop the stale fallback**

In `src/components/home/EventsSection.tsx`, current code (around lines 42-53):

```typescript
  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true })
      .then(({ data }) => {
        const events = (data as Event[] | null) ?? [];
        const today = new Date().toISOString().split("T")[0];
        const upcoming = events.find((event) => (event.event_date || event.date || "") >= today && event.is_upcoming !== false);
        setNextEvent(upcoming ?? events[0] ?? null);
      });
  }, []);
```

Replace with:

```typescript
  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true })
      .then(({ data }) => {
        const events = (data as Event[] | null) ?? [];
        const today = new Date().toISOString().split("T")[0];
        setNextEvent(pickUpcomingEvent(events, today));
      });
  }, []);
```

Add the import near the top of the file, alongside the other imports:

```typescript
import { pickUpcomingEvent } from "@/lib/events";
```

The rest of the component (the `nextEvent ? ... : <p>{t("events_coming_soon")}</p>` branch around line 98-123) already handles `nextEvent === null` correctly — no other change needed there.

- [ ] **Step 6: Verify no regressions in the rest of the suite**

Run: `npm run test`
Expected: PASS (all existing tests, including the 5 new ones)

- [ ] **Step 7: Commit**

```bash
git add src/lib/events.ts src/lib/events.test.ts src/components/home/EventsSection.tsx
git commit -m "fix: ne plus afficher un événement périmé sur l'accueil quand aucun événement à venir n'existe"
```

---

### Task 2: Fonction pure `colorNameToHex`

**Files:**
- Create: `src/lib/colorSwatch.ts`
- Test: `src/lib/colorSwatch.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/colorSwatch.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { colorNameToHex } from "./colorSwatch";

describe("colorNameToHex", () => {
  it("matches a color keyword inside a longer colorway name", () => {
    expect(colorNameToHex("Diamond White")).toBe("#f5f5f0");
    expect(colorNameToHex("Supra Yellow")).toBe("#e8b923");
    expect(colorNameToHex("Snack White")).toBe("#f5f5f0");
  });

  it("is case-insensitive", () => {
    expect(colorNameToHex("MARK RED")).toBe(colorNameToHex("mark red"));
  });

  it("matches French color words", () => {
    expect(colorNameToHex("Rouge Racing")).toBe("#c0392b");
    expect(colorNameToHex("Gris Mat")).toBe("#8a8a8a");
  });

  it("falls back to neutral grey for unrecognized names", () => {
    expect(colorNameToHex("Abstract Blue")).not.toBe("#6b6b6b");
    expect(colorNameToHex("XYZ-9000")).toBe("#6b6b6b");
  });
});
```

Note: `"Abstract Blue"` contains the keyword `blue`, so it must resolve to the blue hex, not the fallback — this is asserted indirectly via `not.toBe(fallback)` to keep the test focused on the fallback behavior while Step 3's implementation will make the blue case pass through the `blue` keyword.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/lib/colorSwatch.test.ts`
Expected: FAIL — `Cannot find module './colorSwatch'`

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/colorSwatch.ts`:

```typescript
const COLOR_KEYWORDS: Array<[string, string]> = [
  ["white", "#f5f5f0"], ["blanc", "#f5f5f0"],
  ["black", "#1a1a1a"], ["noir", "#1a1a1a"],
  ["yellow", "#e8b923"], ["jaune", "#e8b923"],
  ["red", "#c0392b"], ["rouge", "#c0392b"],
  ["blue", "#2e5fa3"], ["bleu", "#2e5fa3"],
  ["green", "#3a7d44"], ["vert", "#3a7d44"],
  ["orange", "#d97b29"],
  ["silver", "#b8b8b8"], ["argent", "#b8b8b8"],
  ["grey", "#8a8a8a"], ["gray", "#8a8a8a"], ["gris", "#8a8a8a"],
  ["gold", "#c9973a"], ["doré", "#c9973a"], ["dore", "#c9973a"],
  ["pink", "#d67a9e"], ["rose", "#d67a9e"],
  ["purple", "#7c4a9e"], ["violet", "#7c4a9e"],
  ["brown", "#6b4a30"], ["marron", "#6b4a30"], ["brun", "#6b4a30"],
];

const FALLBACK_HEX = "#6b6b6b";

export function colorNameToHex(name: string): string {
  const lower = name.toLowerCase();
  for (const [keyword, hex] of COLOR_KEYWORDS) {
    if (lower.includes(keyword)) return hex;
  }
  return FALLBACK_HEX;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/lib/colorSwatch.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/colorSwatch.ts src/lib/colorSwatch.test.ts
git commit -m "feat: ajoute colorNameToHex pour dériver une pastille de couleur depuis le nom d'un coloris"
```

---

### Task 3: Pastilles de couleur sur le sélecteur de coloris

**Files:**
- Modify: `src/pages/ProductDetail.tsx` (imports near top, colorway button block ~line 417-437)

- [ ] **Step 1: Add the import**

In `src/pages/ProductDetail.tsx`, add near the other local imports (after the `useCart` import):

```typescript
import { colorNameToHex } from "@/lib/colorSwatch";
```

- [ ] **Step 2: Replace the colorway button block**

Find the current block (around line 417-437):

```tsx
              {/* Colorway selector */}
              {hasColorways && (
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-white/40">{t("product_colorway")}</p>
                  <div className="flex flex-wrap gap-2">
                    {colorways.map((cw) => (
                      <button
                        key={cw.id}
                        onClick={() => { setSelectedColorway(cw); setSelectedSize(""); }}
                        className={`border px-4 py-2 font-display text-[11px] uppercase tracking-widest transition-all duration-150 ${
                          selectedColorway?.id === cw.id
                            ? "border-[#c9973a] bg-[#c9973a]/10 text-[#c9973a]"
                            : "border-white/20 text-white/60 hover:border-white/50"
                        }`}
                      >
                        {cw.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
```

Replace with:

```tsx
              {/* Colorway selector */}
              {hasColorways && (
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-white/40">{t("product_colorway")}</p>
                  <div className="flex flex-wrap gap-2">
                    {colorways.map((cw) => (
                      <button
                        key={cw.id}
                        onClick={() => { setSelectedColorway(cw); setSelectedSize(""); }}
                        className={`flex items-center gap-2 border px-4 py-2 font-display text-[11px] uppercase tracking-widest transition-all duration-150 ${
                          selectedColorway?.id === cw.id
                            ? "border-[#c9973a] bg-[#c9973a]/10 text-[#c9973a]"
                            : "border-white/20 text-white/60 hover:border-white/50"
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/20"
                          style={
                            cw.image_url
                              ? { backgroundImage: `url(${cw.image_url})`, backgroundSize: "cover", backgroundPosition: "center" }
                              : { background: colorNameToHex(cw.name) }
                          }
                        />
                        {cw.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
```

- [ ] **Step 3: Type-check**

Run: `npm run build`
Expected: build succeeds with no new TypeScript errors (pre-existing errors, if any, are unrelated and out of scope for this task — only confirm nothing new appears in `ProductDetail.tsx`).

- [ ] **Step 4: Manual visual check**

With the dev server running (`npm run dev`), open `http://localhost:8080/marques/arai` in a browser, click into "Quantic" (or any helmet with several colorways), and confirm each colorway button now shows a small round color dot before its name, and the dot for the selected colorway is highlighted consistently with the existing gold-border selected state.

- [ ] **Step 5: Commit**

```bash
git add src/pages/ProductDetail.tsx
git commit -m "feat: pastille de couleur sur les boutons de coloris (fiche produit)"
```

---

### Task 4: Case vide dans la grille produits d'une marque

**Files:**
- Modify: `src/pages/BrandDetail.tsx` (grid container ~line 325, card wrapper ~line 338-341)

- [ ] **Step 1: Remove the gap-background trick on the grid container**

Find (around line 325):

```tsx
                <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ background: "rgba(201,151,58,0.08)" }}>
```

Replace with:

```tsx
                <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
```

- [ ] **Step 2: Add the equivalent thin gold border directly on each card**

Find the card wrapper (around line 332-341):

```tsx
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
                        className="group cursor-pointer relative overflow-hidden"
                        style={{ background: "var(--c-surface-page)" }}
                        onClick={() => navigate(`/marques/${slug}/${product.id}`)}
                      >
```

Replace the `style` prop with:

```tsx
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
                        className="group cursor-pointer relative overflow-hidden"
                        style={{ background: "var(--c-surface-page)", boxShadow: "inset 0 0 0 1px rgba(201,151,58,0.08)" }}
                        onClick={() => navigate(`/marques/${slug}/${product.id}`)}
                      >
```

Using `boxShadow: inset` instead of a real `border` avoids adding to the element's box size (no layout shift, no need to adjust padding), and — critically — an empty grid cell with no card in it paints nothing, so it can no longer show through as a phantom box.

- [ ] **Step 3: Type-check**

Run: `npm run build`
Expected: build succeeds, no new errors in `BrandDetail.tsx`.

- [ ] **Step 4: Manual visual check with the audit script**

With the dev server running, re-run the same Playwright capture used during the audit against a brand with a non-multiple-of-4 product count (Arai has 3):

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:8080/marques/arai', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'verify-arai-grid.png', clip: { x: 0, y: 700, width: 1440, height: 500 } });
  await browser.close();
})();
"
```

Open `verify-arai-grid.png` and confirm the grid row with 3 products no longer shows a 4th colored empty cell (the row should end cleanly after the 3rd card, background matching the page background).

- [ ] **Step 5: Commit**

```bash
git add src/pages/BrandDetail.tsx
git commit -m "fix: la grille produits d'une marque ne laisse plus de case vide visible"
```

---

### Task 5: Fiche intercom — fallback vers les données Supabase quand le produit n'est pas dans la liste statique

**Files:**
- Modify: `src/pages/IntercomDetail.tsx`

This is the largest change. `IntercomDetail.tsx` currently resolves `/intercoms/:slug` against a hardcoded `PRODUCTS` map covering only 5 Sena models (`sf2`, `sf4`, `50s`, `50r`, `30k`). Any other intercom that exists in the `installation_intercoms` Supabase table (e.g. Cardo Packtalk Slim, Alpinestars Tech-Air Comm) has no entry in `PRODUCTS` and falls straight to the "Produit introuvable" branch, even though the product is real and listed on `/intercoms`.

- [ ] **Step 1: Widen the Supabase query and add fallback state**

Find the current state declarations (around line 236-241):

```tsx
  const [modalOpen, setModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [dbData, setDbData] = useState<{ prix: number | null; stock: number | null; pack_duo: boolean; prix_duo: number | null } | null>(null);
```

Add two new pieces of state right after `dbData`:

```tsx
  const [modalOpen, setModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [dbData, setDbData] = useState<{ prix: number | null; stock: number | null; pack_duo: boolean; prix_duo: number | null } | null>(null);
  const [fallbackRecord, setFallbackRecord] = useState<{
    brand: string;
    name: string;
    description: string | null;
    image_url: string | null;
  } | null>(null);
  const [dbChecked, setDbChecked] = useState(false);
```

- [ ] **Step 2: Widen the Supabase select and populate the new state**

Find the current fetch effect (around line 247-266):

```tsx
  useEffect(() => {
    if (!slug) return;
    supabase
      .from("installation_intercoms")
      .select("gallery_images, prix, stock, pack_duo, prix_duo")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        if (data.gallery_images && Array.isArray(data.gallery_images)) {
          setGallery(data.gallery_images as string[]);
        }
        setDbData({
          prix: (data as any).prix ?? null,
          stock: (data as any).stock ?? null,
          pack_duo: (data as any).pack_duo ?? false,
          prix_duo: (data as any).prix_duo ?? null,
        });
      });
  }, [slug]);
```

Replace with:

```tsx
  useEffect(() => {
    if (!slug) return;
    supabase
      .from("installation_intercoms")
      .select("brand, name, description, image_url, gallery_images, prix, stock, pack_duo, prix_duo")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        setDbChecked(true);
        if (!data) return;
        if (data.gallery_images && Array.isArray(data.gallery_images)) {
          setGallery(data.gallery_images as string[]);
        }
        setDbData({
          prix: (data as any).prix ?? null,
          stock: (data as any).stock ?? null,
          pack_duo: (data as any).pack_duo ?? false,
          prix_duo: (data as any).prix_duo ?? null,
        });
        setFallbackRecord({
          brand: (data as any).brand,
          name: (data as any).name,
          description: (data as any).description ?? null,
          image_url: (data as any).image_url ?? null,
        });
      });
  }, [slug]);
```

- [ ] **Step 3: Extract the lightbox into a small local component**

This avoids duplicating the ~25-line lightbox block between the existing "known product" render and the new fallback render.

Find the `StatBlock` component (around line 214-229) and add a new component right after it:

```tsx
function ProductLightbox({
  images, activeIdx, open, onClose, onSelect,
}: {
  images: string[]; activeIdx: number; open: boolean; onClose: () => void; onSelect: (i: number) => void;
}) {
  return (
    <AnimatePresence>
      {open && images.length > 0 && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.93)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            type="button"
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: "rgba(201,151,58,0.15)", border: "1px solid rgba(201,151,58,0.3)", color: "#c9973a" }}
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
          <motion.img
            src={images[activeIdx]}
            alt=""
            className="max-h-[90vh] max-w-full object-contain"
            initial={{ scale: 0.92 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.92 }}
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onSelect(i); }}
                  className="w-2 h-2 rounded-full transition-colors"
                  style={{ background: i === activeIdx ? "#c9973a" : "rgba(255,255,255,0.3)" }}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

Then find the inline lightbox block near the bottom of the main component (around line 610-652):

```tsx
      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && gallery.length > 0 && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.93)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: "rgba(201,151,58,0.15)", border: "1px solid rgba(201,151,58,0.3)", color: "#c9973a" }}
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <motion.img
              src={gallery[activeIdx]}
              alt=""
              className="max-h-[90vh] max-w-full object-contain"
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              onClick={e => e.stopPropagation()}
            />
            {gallery.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={e => { e.stopPropagation(); setActiveIdx(i); }}
                    className="w-2 h-2 rounded-full transition-colors"
                    style={{ background: i === activeIdx ? "#c9973a" : "rgba(255,255,255,0.3)" }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
```

Replace it with:

```tsx
      {/* Lightbox */}
      <ProductLightbox
        images={gallery}
        activeIdx={activeIdx}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onSelect={setActiveIdx}
      />
```

- [ ] **Step 4: Replace the "Produit introuvable" branch with a loading state, a real 404, and a data-driven fallback view**

Find (around line 268-279):

```tsx
  if (!product) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center" style={{ background: "var(--c-surface-page)" }}>
          <p className="font-display text-white text-2xl mb-4">Produit introuvable</p>
          <Link to="/intercoms" className="font-display text-[11px] uppercase tracking-[0.3em]" style={{ color: "#c9973a" }}>
            ← Retour aux intercoms
          </Link>
        </div>
      </Layout>
    );
  }
```

Replace with:

```tsx
  if (!product) {
    if (!dbChecked) {
      return (
        <Layout>
          <div className="flex min-h-[70vh] items-center justify-center" style={{ background: "var(--c-surface-page)" }}>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c9973a] border-t-transparent" />
          </div>
        </Layout>
      );
    }

    if (!fallbackRecord) {
      return (
        <Layout>
          <div className="min-h-[70vh] flex flex-col items-center justify-center" style={{ background: "var(--c-surface-page)" }}>
            <p className="font-display text-white text-2xl mb-4">Produit introuvable</p>
            <Link to="/intercoms" className="font-display text-[11px] uppercase tracking-[0.3em]" style={{ color: "#c9973a" }}>
              ← Retour aux intercoms
            </Link>
          </div>
        </Layout>
      );
    }

    return (
      <Layout>
        <SEO
          title={`${fallbackRecord.brand} ${fallbackRecord.name} — Intercom moto | Desmet Équipement Wavre`}
          description={fallbackRecord.description || `${fallbackRecord.brand} ${fallbackRecord.name} disponible chez Desmet Équipement à Wavre.`}
          image={fallbackRecord.image_url ?? undefined}
          canonicalPath={`/intercoms/${slug}`}
        />

        <section className="relative overflow-hidden" style={{ background: "var(--c-surface-hero)" }}>
          <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.045]" style={{ mixBlendMode: "overlay" }} aria-hidden="true">
            <filter id="gFallback"><feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
            <rect width="100%" height="100%" filter="url(#gFallback)"/>
          </svg>
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,151,58,0.08), transparent 60%)" }} />

          <div className="relative container mx-auto px-4 pt-20 pb-16">
            <Link
              to="/intercoms"
              className="inline-flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.35em] mb-8 transition-colors"
              style={{ color: "var(--c-text-30)" }}
            >
              <ArrowLeft className="w-3 h-3" /> Tous les intercoms
            </Link>

            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5" style={{ border: "1px solid rgba(201,151,58,0.3)", background: "rgba(201,151,58,0.06)" }}>
              <Radio className="w-3 h-3" style={{ color: "#c9973a" }} />
              <span className="font-display text-[10px] uppercase tracking-[0.4em]" style={{ color: "#c9973a" }}>{fallbackRecord.brand} — Intercom Bluetooth</span>
            </div>

            <h1
              className="font-display text-white leading-none mb-8"
              style={{ fontSize: "clamp(3rem,10vw,6rem)", textShadow: "0 0 80px rgba(201,151,58,0.25), 0 0 160px rgba(201,151,58,0.1)" }}
            >
              {fallbackRecord.name}
            </h1>

            <div className="grid gap-8 md:grid-cols-2">
              <div>
                {gallery.length > 0 ? (
                  <div
                    className="relative overflow-hidden bg-[#111] cursor-zoom-in"
                    style={{ border: "1px solid rgba(201,151,58,0.1)" }}
                    onClick={() => setLightboxOpen(true)}
                  >
                    <img
                      src={gallery[activeIdx]}
                      alt={`${fallbackRecord.brand} ${fallbackRecord.name}`}
                      className="w-full object-contain"
                      style={{ display: "block" }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center bg-[#111]" style={{ height: "360px", border: "1px solid rgba(201,151,58,0.1)" }}>
                    <Radio className="w-16 h-16" style={{ color: "rgba(201,151,58,0.3)" }} />
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center gap-6">
                {fallbackRecord.description && (
                  <p className="text-sm leading-relaxed" style={{ color: "var(--c-text-50)" }}>{fallbackRecord.description}</p>
                )}

                {dbData && (dbData.prix != null || dbData.stock != null) && (
                  <div className="flex items-center gap-4 flex-wrap">
                    {dbData.prix != null && (
                      <p className="font-display leading-none" style={{ fontSize: "clamp(1.8rem,5vw,2.4rem)", color: "#c9973a" }}>
                        {dbData.prix.toLocaleString("fr-BE", { minimumFractionDigits: 2 })} €
                      </p>
                    )}
                    {dbData.stock != null && (
                      <span
                        className="font-display text-[11px] uppercase tracking-[0.25em] px-3 py-1.5"
                        style={{
                          border: "1px solid",
                          borderColor: dbData.stock > 3 ? "rgba(201,151,58,0.5)" : dbData.stock > 0 ? "rgba(255,180,0,0.5)" : "rgba(255,80,80,0.4)",
                          color: dbData.stock > 3 ? "#c9973a" : dbData.stock > 0 ? "#ffb400" : "#ff5050",
                          background: dbData.stock > 3 ? "rgba(201,151,58,0.06)" : dbData.stock > 0 ? "rgba(255,180,0,0.06)" : "rgba(255,80,80,0.06)",
                        }}
                      >
                        {dbData.stock > 3 ? "En stock" : dbData.stock > 0 ? `Stock limité — ${dbData.stock} restant${dbData.stock > 1 ? "s" : ""}` : "Rupture de stock"}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      addItem({
                        id: slug!,
                        type: "intercom",
                        name: `${fallbackRecord.brand} ${fallbackRecord.name}`,
                        price: dbData?.prix ?? null,
                        imageUrl: gallery[0] ?? undefined,
                      });
                      toast.success("Ajouté au panier");
                    }}
                    className="inline-flex items-center gap-3 font-display text-sm uppercase tracking-[0.25em] px-7 py-4 transition-all duration-300"
                    style={{ background: "#c9973a", color: "#050505" }}
                  >
                    <ShoppingBag className="w-4 h-4" /> Ajouter au panier
                  </button>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center gap-3 font-display text-sm uppercase tracking-[0.25em] px-7 py-4 transition-all duration-300"
                    style={{ border: "1px solid rgba(201,151,58,0.3)", color: "var(--c-text-50)", background: "transparent" }}
                  >
                    <Wrench className="w-4 h-4" /> Demander l'installation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ProductLightbox
          images={gallery}
          activeIdx={activeIdx}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onSelect={setActiveIdx}
        />

        <InstallationModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          preselectedAccessoryType="Intercom Sena"
          preselectedIntercomModel={fallbackRecord.name}
        />
      </Layout>
    );
  }
```

- [ ] **Step 5: Type-check**

Run: `npm run build`
Expected: build succeeds, no new TypeScript errors in `IntercomDetail.tsx`.

- [ ] **Step 6: Manual verification against every listed intercom**

With the dev server running, open `http://localhost:8080/intercoms` and click into every single product card listed on the page (Sena SF2/SF4/50S/50R/30K, Cardo Packtalk Slim/Bold/Edge/Freecom 4+, Alpinestars Tech-Air Comm, and any SP Connect accessory that routes through the same detail page). Confirm:
- The 5 Sena models render exactly as before (no visual regression — they still use the static `PRODUCTS` data path).
- Every other product now renders the fallback view (brand badge, name, description if present, price/stock if present, working "Ajouter au panier" and "Demander l'installation" buttons) instead of "Produit introuvable".
- A genuinely nonexistent slug (e.g. `http://localhost:8080/intercoms/does-not-exist`) still shows "Produit introuvable" — confirming the true 404 path still works.

- [ ] **Step 7: Commit**

```bash
git add src/pages/IntercomDetail.tsx
git commit -m "fix: fiche intercom retombe sur les données Supabase au lieu de 404 pour les produits hors de la liste statique"
```

---

### Task 6: Liens morts vers `/marques` (route inexistante)

**Files:**
- Modify: `src/components/NavBrandsMenu.tsx:188` and `:268`
- Modify: `src/pages/Panier.tsx:111`
- Modify: `src/pages/PanierConfirmation.tsx:82`

Found while crawling every internal link on the site: 4 places link to `/marques`
(no slug), but the only routes registered in `src/App.tsx` are `/brands` (the
listing page) and `/marques/:slug` (a specific brand). A bare `/marques` has no
matching route and falls through to the catch-all `NotFound` page. In every one
of these 4 spots, the intent is clearly "go to the brands listing" — the fix is
to point them at the route that actually serves that page: `/brands`.

- [ ] **Step 1: Fix the two links in `NavBrandsMenu.tsx`**

Around line 188:

```tsx
                  <Link
                    to="/marques"
```

Replace with:

```tsx
                  <Link
                    to="/brands"
```

Around line 268:

```tsx
              <Link
                to="/marques"
```

Replace with:

```tsx
              <Link
                to="/brands"
```

- [ ] **Step 2: Fix the link in `Panier.tsx`**

Line 111:

```tsx
              <Link to="/marques" className="inline-flex items-center gap-2 font-display text-sm uppercase tracking-[0.25em] px-6 py-3 transition-all"
```

Replace with:

```tsx
              <Link to="/brands" className="inline-flex items-center gap-2 font-display text-sm uppercase tracking-[0.25em] px-6 py-3 transition-all"
```

- [ ] **Step 3: Fix the link in `PanierConfirmation.tsx`**

Line 82:

```tsx
            <Link to="/marques" className="inline-flex items-center gap-2 font-display text-sm uppercase tracking-[0.2em] px-6 py-3 transition-all"
```

Replace with:

```tsx
            <Link to="/brands" className="inline-flex items-center gap-2 font-display text-sm uppercase tracking-[0.2em] px-6 py-3 transition-all"
```

- [ ] **Step 4: Type-check**

Run: `npm run build`
Expected: build succeeds, no new errors.

- [ ] **Step 5: Manual verification**

With the dev server running, open `/panier` with an empty cart and click "Découvrir nos produits" — confirm it lands on the brands listing page, not "Page introuvable". Repeat for the "Toutes les marques →" link in the brands dropdown menu (navbar), and for "Continuer les achats" on the post-order confirmation page (`/panier/confirmation` — reachable by adding an item to the cart and completing checkout, or by temporarily visiting the route directly during the check).

- [ ] **Step 6: Commit**

```bash
git add src/components/NavBrandsMenu.tsx src/pages/Panier.tsx src/pages/PanierConfirmation.tsx
git commit -m "fix: les liens vers la liste des marques pointaient vers /marques (route inexistante) au lieu de /brands"
```

---

### Task 7: Avertissement React — clé dupliquée dans le footer

**Files:**
- Modify: `src/components/Footer.tsx:35-43`

Found via the same crawl: every single page of the site logs a React console
warning ("Encountered two children with the same key... /brands") because the
footer's nav list uses `path` as the React `key`, and two entries
("Produits" and "Marques" in `NAV_LINKS`, line 7-13) both point to `/brands`.
Not visible to a visitor, but a real dev-console error worth cleaning up
before handoff. The two links legitimately both go to `/brands` (that's
existing, intentional copy — not something this plan changes) — the fix is
just to stop keying the list by a value that isn't actually unique.

- [ ] **Step 1: Use the label as the React key instead of the path**

Find (around line 35-43):

```tsx
            {NAV_LINKS.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className="text-sm uppercase tracking-[0.14em] text-white/55 transition-colors hover:text-[#c9973a]"
              >
                {l.label}
              </Link>
            ))}
```

Replace with:

```tsx
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.path}
                className="text-sm uppercase tracking-[0.14em] text-white/55 transition-colors hover:text-[#c9973a]"
              >
                {l.label}
              </Link>
            ))}
```

`l.label` is unique across `NAV_LINKS` (5 distinct translation keys), unlike
`l.path`.

- [ ] **Step 2: Type-check**

Run: `npm run build`
Expected: build succeeds, no new errors.

- [ ] **Step 3: Manual verification**

With the dev server running, open the browser devtools console, load any page (e.g. `/`), and confirm the "Encountered two children with the same key" warning no longer appears.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "fix: clé React dupliquée dans la liste de navigation du footer"
```

---

### Task 8: Vérification finale groupée

**Files:** none (verification only)

- [ ] **Step 1: Full type-check**

Run: `npm run build`
Expected: build succeeds with no new errors introduced by this plan.

- [ ] **Step 2: Full test suite**

Run: `npm run test`
Expected: all tests pass, including the 9 new tests from Task 1 and Task 2.

- [ ] **Step 3: Re-run the original audit screenshots to confirm all 4 issues are resolved**

Reuse the same scroll-then-screenshot Playwright approach from the audit (see `docs/superpowers/specs/2026-08-04-audit-fixes-design.md` for the protocol) against:
- `/` (accueil) — confirm the "Bikes & Coffee" section shows the "à venir prochainement" state, not the April 2026 event.
- `/marques/arai` — confirm no empty 4th cell in the product grid.
- `/marques/arai/<quantic-product-id>` — confirm color swatches appear next to each colorway name.
- `/intercoms` — click through every card, confirm none lead to "Produit introuvable".
- `/panier` (empty cart) and the brands dropdown menu — confirm the "découvrir nos produits" / "toutes les marques" links land on `/brands`, not a 404.
- Any page — confirm the browser console no longer logs the duplicate-key warning from the footer.

- [ ] **Step 4: Report status — do not deploy yet**

This working directory currently has substantial unrelated uncommitted work in progress (large rewrites to `AdminProducts.tsx`, `BrandDetail.tsx` beyond this plan's scope, the `generate-description` edge function, etc. — see `git status`). Running `vercel --prod` at this point would ship all of that alongside these 4 fixes. Stop here and confirm with the user whether to deploy now (shipping everything currently in the working tree) or wait until the rest of the in-progress work is also ready.
