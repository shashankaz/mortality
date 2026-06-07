# Mortality — Life Timer

A fullscreen Chrome New Tab extension that replaces the default new tab page with a flip-clock timer dashboard. Count down to a future date or count elapsed time since a past date, with a glassmorphism UI and fully customisable settings.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Build tool | Vite 7 |
| Styling | TailwindCSS v4 (CSS-first, no config file) |
| Language | TypeScript 5.9 (strict) |
| Extension API | Chrome Manifest V3 |
| Compiler | React Compiler via `babel-plugin-react-compiler` |

---

## Quick Start

```bash
npm install
npm run build      # outputs to dist/
```

Then in Chrome:
1. Go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** → select the `dist/` folder
4. Open a new tab

For development with hot-reload (no extension context, uses `localStorage` fallback):

```bash
npm run dev
```

---

## Project Structure

```
mortality/
├── public/
│   ├── manifest.json               # Chrome MV3 manifest
│   ├── vite.svg
│   └── backgrounds/                # Built-in wallpapers (copied to dist/ as-is)
│       ├── bg-aurora.svg           # Purple/teal gradient
│       ├── bg-ocean.svg            # Navy/cyan gradient
│       ├── bg-ember.svg            # Amber/red gradient
│       ├── bg-forest.svg           # Emerald green gradient
│       ├── bg-cosmic.svg           # Indigo/blue gradient
│       ├── bg-rose.svg             # Rose/crimson gradient
│       └── *.jpg                   # Any additional photo wallpapers
│
├── src/
│   ├── main.tsx                    # Entry point — mounts App inside SettingsProvider
│   ├── app.tsx                     # Root component — keyboard shortcuts, gear button
│   ├── index.css                   # TailwindCSS import + flip clock keyframes + base styles
│   ├── types.ts                    # All shared TypeScript types
│   │
│   ├── context/
│   │   └── settings-context.tsx    # Global settings state + chrome.storage bridge
│   │
│   ├── hooks/
│   │   ├── use-storage.ts          # chrome.storage wrapper with localStorage fallback
│   │   └── use-timer.ts            # 1-second ticker, date parsing, diff computation
│   │
│   ├── utils/
│   │   ├── date-utils.ts           # getTimeDiff(), pad(), parseDateInTimezone()
│   │   └── backgrounds.ts          # BUILTIN_BACKGROUNDS list + randomBuiltinIndex()
│   │
│   └── components/
│       ├── background-layer.tsx    # Full-screen background image + overlay
│       ├── flip-clock.tsx          # Custom CSS 3D flip animation (all 6 units)
│       ├── timer-display.tsx       # Assembles clock + stat cards + date label
│       ├── settings-drawer.tsx     # Slide-in settings panel
│       └── stat-card.tsx           # Individual glass stat card
│
├── vite.config.ts
├── tsconfig.app.json
└── package.json
```

---

## Architecture

### Chrome Storage

Two separate stores are used because `chrome.storage.sync` has an **8 KB per-item limit**:

| Data | Store | Key |
|---|---|---|
| All settings (JSON object) | `chrome.storage.sync` | `"settings"` |
| Uploaded image (base64) | `chrome.storage.local` | `"background_image"` |

`use-storage.ts` detects whether `chrome.storage` is available. If not (e.g. `npm run dev` in a browser), it falls back to `localStorage` with a `mortality__` prefix. This means all features work in dev mode without loading the extension.

### Settings Flow

```
chrome.storage.sync
       ↓
useStorage<Partial<AppSettings>>("settings", {}, "sync")  [use-storage.ts]
       ↓
{ ...DEFAULT_SETTINGS, ...rawSettings }                   [settings-context.tsx]
       ↓
settings: AppSettings                                      (always fully typed, never partial)
       ↓
useSettings() hook → consumed by any component
```

`DEFAULT_SETTINGS` is a module-level constant. On first install (nothing in storage), its values take effect. The `builtinIndex` default calls `randomBuiltinIndex()` at module load time, so each fresh install starts with a random built-in wallpaper.

`updateSettings(partial)` merges the partial into the current settings via `settingsRef.current` (a ref, not state) to avoid stale closures, then writes the full merged object back to `chrome.storage.sync`.

### Timer Logic

`use-timer.ts` ticks every second with `setInterval`. Date strings from the settings (e.g. `"2030-12-31"`) are parsed by `parseDateInTimezone(dateStr, timezone)` in `date-utils.ts`, which resolves them to **midnight in the user's selected timezone** rather than UTC midnight (the JavaScript default for ISO date-only strings).

`getTimeDiff(from, to)` computes years/months/days/hours/minutes/seconds with full borrow propagation (handles uneven month lengths). It also computes `totalDays`, `totalHours`, `totalWeeks` for the stat cards.

### Flip Clock

`flip-clock.tsx` is self-contained with no external libraries. Each digit is a `FlipDigit` component that renders three layers:

1. **Base card** — always visible, shows the current digit
2. **Upper fold** — shows the *previous* digit's top half, clipped with `clipPath: inset(0 0 52px 0 round 12px 12px 0 0)`, animates `rotateX(0deg → -90deg)` via `@keyframes flipFold`
3. **Lower unfold** — shows the *current* digit's bottom half, clipped with `clipPath: inset(52px 0 0 0 round 0 0 12px 12px)`, animates `rotateX(90deg → 0deg)` via `@keyframes flipUnfold`

The previous value is tracked with a `useRef` to avoid triggering the animation on re-renders where the digit hasn't changed. The animation duration is 360 ms; the flipping flag resets via `setTimeout(380)`.

The keyframes live in `src/index.css` (not inline) because CSS `animation:` property referencing a named keyframe requires it to be in a stylesheet.

---

## Types Reference

### `AppSettings`

```typescript
interface AppSettings {
  mode: "countdown" | "elapsed";
  targetDate: string;          // ISO date "YYYY-MM-DD", used in countdown mode
  startDate: string;           // ISO date "YYYY-MM-DD", used in elapsed mode
  timezone: string;            // IANA timezone e.g. "Asia/Kolkata"
  backgroundType: "builtin" | "url" | "local";
  backgroundUrl: string;       // used when backgroundType === "url"
  builtinIndex: number;        // index into BUILTIN_BACKGROUNDS[]
  theme: "dark" | "amoled" | "ocean" | "sunset";
  showStats: boolean;
  blurIntensity: number;       // 0–20 px
  overlayOpacity: number;      // 0–80 %
}
```

### `TimeComponents`

```typescript
interface TimeComponents {
  years: number; months: number; days: number;
  hours: number; minutes: number; seconds: number;
  totalDays: number; totalHours: number; totalWeeks: number;
}
```

---

## Settings Drawer — Sections

| Section | Controls |
|---|---|
| **Timer Mode** | Countdown / Elapsed toggle |
| **Target Date / Start Date** | Date picker |
| **Timezone** | `<select>` of 22 IANA timezones; auto-detects browser timezone on first install; label shows current UTC offset (e.g. `GMT+5:30 — Kolkata`) |
| **Background** | Three tabs: **Wallpapers** (3×N thumbnail grid + Random button), **URL** (text input + Clear), **Upload** (file picker + Clear) |
| **Theme** | Dark / AMOLED / Ocean / Sunset — controls the colour tint of the overlay |
| **Visual Options** | Show Statistics toggle, Background Blur slider (0–20px), Overlay Opacity slider (0–80%) |

Keyboard shortcuts: `S` opens settings, `Escape` closes.

---

## Adding More Wallpapers

1. Drop any image file (`.jpg`, `.png`, `.webp`, `.svg`) into `public/backgrounds/`.
2. Open `src/utils/backgrounds.ts` and append to `BUILTIN_BACKGROUNDS`:
   ```typescript
   { path: "./backgrounds/your-file.jpg", name: "My Wallpaper" },
   ```
3. Run `npm run build`. The new wallpaper will appear as a thumbnail in the settings drawer.

SVG wallpapers use `preserveAspectRatio="xMidYMid slice"` and a 1920×1080 `viewBox` with `gradientUnits="userSpaceOnUse"` so gradient coordinates are absolute pixels and scale correctly to any screen size.

---

## Key Implementation Decisions

**`base: "./"` in `vite.config.ts`**
Chrome extensions are served over `chrome-extension://` (not `http://`). Without a relative base, Vite emits absolute asset paths like `/assets/index.js` which the extension can't resolve. The `./` base makes every reference relative to `index.html`.

**`"chrome"` in `tsconfig.app.json` types**
When the `types` array is explicitly set, TypeScript only includes the listed ambient types. Adding `"chrome"` alongside `"vite/client"` makes the `chrome.storage` / `chrome.runtime` globals available without a manual triple-slash reference.

**`parseDateInTimezone` uses noon UTC as reference**
Computing a timezone's UTC offset at the exact midnight being parsed can be ambiguous during DST transitions (some wall-clock times don't exist or occur twice). Using noon UTC as the reference point eliminates ambiguity because DST transitions happen at 2 AM local time, never at noon.

**Background image in `chrome.storage.local`, not `sync`**
`sync` has an 8 KB per-item limit. A base64-encoded photo easily exceeds 1 MB. `local` has a 10 MB quota and is appropriate for large blobs.

**React Compiler (`babel-plugin-react-compiler`)**
Enabled globally. It automatically inserts memoisation (equivalent to `useMemo` / `useCallback` / `memo`) at compile time. Manual `useMemo` / `useCallback` calls in the codebase are there only where the compiler cannot prove safety on its own (e.g. the `settingsRef` pattern in `settings-context.tsx`).

**Stale-closure guard in `updateSettings`**
`useCallback` captures `saveSettings` but not `settings`. If `settings` were captured directly, calling `updateSettings` in a `useEffect` or event handler would use stale settings. Instead, `settingsRef.current = settings` is set on every render, and `updateSettings` reads `settingsRef.current`, which is always current.

---

## Build Output

```
dist/
├── index.html
├── manifest.json
├── backgrounds/      ← all files from public/backgrounds/
├── vite.svg
└── assets/
    ├── index-[hash].js
    └── index-[hash].css
```

Load `dist/` as an unpacked extension. Every new `npm run build` overwrites `dist/` in place; no need to re-add the extension in Chrome (it hot-reloads the files automatically on the next new tab).

---

## Potential Next Steps

- **Extension icon** — add 16/48/128px PNGs to `public/` and reference them in `manifest.json` under `"icons"`.
- **Persistent random wallpaper** — currently `builtinIndex` defaults to a random value per fresh-install. To persist a random pick on every new tab (without user interaction), call `updateSettings({ builtinIndex: randomBuiltinIndex() })` from `SettingsProvider` on mount when no index is stored.
- **Custom colour themes** — the `THEME_OVERLAY` map in `background-layer.tsx` and the `THEMES` array in `settings-drawer.tsx` are the only two places to edit.
- **Additional timezones** — extend the `TIMEZONES` array in `settings-drawer.tsx`. Any valid IANA name works; the label is computed dynamically via `Intl`.
- **Quote / intention display** — add a `quote: string` field to `AppSettings` and render it below the stat cards in `timer-display.tsx`.
- **Multiple countdowns** — would require changing `AppSettings` to hold an array of timer configs; the storage serialisation and drawer UI are the main surfaces to update.
