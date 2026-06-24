# Yarphoenix Movies

**[Live demo → yarphoenix.github.io/yarphoenix-movies](https://yarphoenix.github.io/yarphoenix-movies/)**

A black-and-white catalogue of films and series, built with React. A header
**EN / RU** toggle switches both the interface language and the data source:
**English** is powered by the [OMDb API](https://www.omdbapi.com/), **Russian**
by [Kinopoisk](https://kinopoiskapiunofficial.tech/). Either way the app falls
back to a bundled local catalogue, so it keeps working offline or with no API key.

> _The catalogue of everything worth watching

The interface is deliberately editorial: typographic placeholder posters, a
phoenix wordmark, and real artwork rendered in grayscale to preserve the
monochrome identity. **Dark and light themes** float over an interactive,
GPU-rendered **aurora** field, with the controls resting on **liquid-glass**
surfaces.

---

## Features

- **Dark & light themes** — a header switch toggles them; the choice follows the
  OS `prefers-color-scheme` until pinned, then persists in `localStorage` and is
  applied before first paint (no flash) via `color-scheme` + an inline boot script.
- **Interactive aurora background** — a full-page WebGL field of monochrome “smoke”
  that drifts over time, bends toward the cursor and ripples on click. Heavily
  optimized: downscaled render buffer, capped frame rate, paused while the tab is
  hidden, a single static frame under `prefers-reduced-motion`, and a CSS fallback
  when WebGL is unavailable.
- **Liquid-glass surfaces** — the search bar, filter chips and poster cards are
  `backdrop-filter` glass tiles, theme-tuned so they read over either palette.
- **Russian display face** — switching to RU swaps the Space Grotesk headline font
  for a self-hosted **PP Neue Machina**, driven purely by `<html lang>` and a CSS
  variable (no JS).
- **English & Russian** — one header toggle flips the entire UI (homegrown i18n)
  and the data source. The choice is auto-detected from the browser, persisted in
  `localStorage`, and reflected in `<html lang>`.
- **Two data sources behind one interface** — OMDb (EN) and Kinopoisk (RU) are
  interchangeable providers exposing the same `featured / search / detail` contract.
- **Curated featured catalogue** — a popular/curated set fetched in parallel as the
  landing view (before the visitor searches).
- **Live search** — debounced (≈350 ms) queries against the active provider, with
  `All / Films / Series` filter chips and a live result count.
- **Detail pages** — poster, rating, runtime, year, genres, synopsis, director,
  cast, plus a "More like this" row derived from the title's first genre.
- **Watch — find where to stream** — a _Смотреть / Watch_ action on every detail page
  asks a companion backend (**yarphoenix-films-api**) to search external sources
  (Rutube, VK) for full copies with Russian audio, then shows them as cards (preview,
  source, duration) that open the source in a new tab. Results are ranked and
  length-filtered server-side; the feature degrades gracefully when no backend is set.
- **Offline-first fallback** — when a provider has no key or a request fails, it
  transparently serves the local catalogue in [`src/api/data.js`](src/api/data.js)
  and shows a local-catalogue notice.
- **Considered states** — shimmer loading skeletons, an error state with a retry
  button, and an empty state for searches with no matches.
- **Black-and-white poster system** — each title gets a deterministic `tone` (0–6)
  that drives a light/dark placeholder palette; real artwork is shown `grayscale`.
- **No router, no state library** — routing, i18n, and data orchestration are all
  plain React hooks and context.

## Tech stack

| Area        | Choice                                                                 |
| ----------- | ---------------------------------------------------------------------- |
| Framework   | React 19 + ReactDOM 19                                                  |
| Tooling     | [Create React App](https://github.com/facebook/create-react-app) (`react-scripts` 5) |
| Data (EN)   | [OMDb API](https://www.omdbapi.com/)                                    |
| Data (RU)   | [Kinopoisk](https://kinopoiskapiunofficial.tech/) (unofficial API)      |
| Watch       | Companion **yarphoenix-films-api** (ASP.NET Core) over Rutube + VK      |
| i18n        | Homegrown — React context + `{ en, ru }` dictionary + `t()` hook        |
| Styling     | Plain CSS ([`src/index.css`](src/index.css)) + inline styles, CSS-variable design tokens, liquid glass (`backdrop-filter`) |
| Theming     | Dark/light via `color-scheme` + a `.theme-dark` class on `<html>`, persisted in `localStorage` |
| Background  | Custom full-page WebGL fragment shader ([`src/lib/aurora.js`](src/lib/aurora.js)) — vanilla, no deps |
| Typography  | Google Fonts (Space Grotesk, IBM Plex Mono, Hanken Grotesk) + local Microgramma & PP Neue Machina (RU display) |
| Hosting     | GitHub Pages, auto-deployed via GitHub Actions                          |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure API keys (optional)

Create a `.env.local` file in the project root:

```dotenv
REACT_APP_OMDB_KEY=your_omdb_key
REACT_APP_KINOPOISK_KEY=your_kinopoisk_key
REACT_APP_WATCH_API=https://your-watch-api.example
```

- **OMDb** (English) — free key at <https://www.omdbapi.com/apikey.aspx>
- **Kinopoisk** (Russian) — free key at <https://kinopoiskapiunofficial.tech/>
- **`REACT_APP_WATCH_API`** (optional) — base URL of the companion **yarphoenix-films-api**
  backend that powers the _Watch_ feature. If unset, the _Watch_ button still appears but
  the modal shows a "not available in this build" notice.

> Each language degrades independently: if a provider's key is missing — or its API
> is unreachable / rate-limited — **that** language falls back to the bundled local
> catalogue, so the app always runs. `.env.local` is gitignored.
>
> ⚠️ CRA inlines `REACT_APP_*` variables into the client bundle, so on a public
> deploy these keys are visible in the site's JS. That's acceptable for free,
> low-risk keys — don't reuse them for anything sensitive.

### 3. Start the dev server

```bash
npm start
```

Open <http://localhost:3000>. The page reloads on edits.

## Available scripts

| Command         | What it does                                                        |
| --------------- | ------------------------------------------------------------------- |
| `npm start`     | Run the app in development mode at `localhost:3000`.                |
| `npm run build` | Build an optimized, minified production bundle into `build/`.       |
| `npm test`      | Launch the CRA/Jest test runner in interactive watch mode.          |
| `npm run eject` | Eject from CRA and copy the build config into the project (one-way).|

## Project structure

```
src/
├── api/
│   ├── data.js              # Local fallback catalogue (18 titles)
│   ├── shape.js             # Shared helpers: tone hashing, na(), local fallback
│   ├── index.js             # getProvider(lang) — provider registry
│   ├── watch.js             # Watch-search client → REACT_APP_WATCH_API
│   └── providers/
│       ├── omdb.js          # English provider (OMDb)
│       └── kinopoisk.js     # Russian provider (Kinopoisk)
├── i18n/
│   ├── strings.js           # { en, ru } UI string dictionary
│   ├── plural.js            # Russian plural-form helper
│   └── LanguageContext.jsx  # LanguageProvider + useLang() / useT()
├── assets/                  # Phoenix logos, Microgramma + PP Neue Machina (fonts/)
├── lib/
│   └── aurora.js            # Optimized mono WebGL aurora shader (vanilla, no deps)
├── theme/
│   └── ThemeContext.jsx     # ThemeProvider + useTheme() — dark/light, persisted
├── components/
│   ├── AuroraBackground.jsx # Mounts the full-page WebGL aurora + readability scrim
│   ├── Grid.jsx             # Responsive poster grid (--cols custom property)
│   ├── Logo.jsx             # Theme-aware phoenix wordmark (reused in header/footer)
│   ├── Poster.jsx           # B&W placeholder / grayscale-artwork poster + tones
│   ├── PosterCard.jsx       # Grid card: liquid-glass tile + poster + caption
│   ├── SearchControls.jsx   # Search input + filter chips + result count
│   ├── Skeleton.jsx         # Loading skeleton grid
│   ├── LanguageToggle.jsx   # EN | RU segmented control
│   ├── ThemeToggle.jsx      # Light/dark header switch
│   └── WatchModal.jsx       # "Where to watch" results modal (portaled to <body>)
├── layout/
│   ├── Header.jsx           # Sticky header: Logo + language & theme toggles
│   └── Footer.jsx           # Footer (shows the active data source)
├── pages/
│   ├── Home.jsx             # Hero + search + catalogue grid
│   └── Detail.jsx           # Single title view + "More like this"
├── App.jsx                  # Routing + language-driven catalogue loading
├── index.js                 # Entry point — wraps <App> in Theme + Language providers
└── index.css                # App styles
public/
└── index.html               # HTML shell, fonts, theme/glass tokens, FOUC boot script
```

## How the data layer works

Both sources are wrapped as **providers** that expose the same interface —
`featured()`, `search(query, { type })`, `detail(id)` — and every raw record is
mapped onto a single normalized UI shape:

```js
{ id, title, year, type, runtime, rating, genres[], director, cast[],
  tagline, synopsis, poster, tone }
```

[`getProvider(lang)`](src/api/index.js) returns the OMDb provider for `en` and the
Kinopoisk provider for `ru`. The UI consumes only the normalized shape, so it never
needs to know which source (or language) is active. When a provider has no key, the
shared helpers in [`src/api/shape.js`](src/api/shape.js) serve the local catalogue.

Adding a third source is just another file under `src/api/providers/` that returns
the same shape — no UI changes required.

## Watching (where to watch)

Each detail page has a **Watch** (_Смотреть_) action. It calls a small companion
backend — **yarphoenix-films-api** (ASP.NET Core) — at
`${REACT_APP_WATCH_API}/api/watch/search`, passing the title, year, type and runtime.
The backend searches external sources (**Rutube**, **VK**) for full copies with Russian
audio, ranks them, and filters by how close each video's length is to the catalogued
runtime (movies use a tight window; series only drop clips shorter than one episode).
The frontend ([`src/api/watch.js`](src/api/watch.js)) renders the results in
[`WatchModal`](src/components/WatchModal.jsx) as cards (preview, source, duration) that
open the source in a new tab.

The modal is rendered through a React portal into `<body>` so its full-viewport overlay
isn't trapped by the detail page's `transform`, and it locks background scroll while open.
The feature is optional — with no `REACT_APP_WATCH_API` set, the button shows a graceful
"not available" notice. The backend must allow the site's origin via CORS and be served
over HTTPS (the Pages site is HTTPS).

## Internationalization

A lightweight homegrown layer (no i18n dependency):
[`LanguageProvider`](src/i18n/LanguageContext.jsx) holds the current language, the
`{ en, ru }` dictionary lives in [`strings.js`](src/i18n/strings.js), and components
read copy via a `t(key, ...args)` hook (with Russian plural rules in
[`plural.js`](src/i18n/plural.js)). Switching language re-points the data provider
and returns to the catalogue, since a title id from one source won't resolve in the
other.

## Deployment

Hosted on **GitHub Pages** and deployed automatically by **GitHub Actions**
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) on every push to
`main`: CRA build → upload Pages artifact → deploy. API keys and `REACT_APP_WATCH_API`
are injected from repo secrets at build time, and `homepage` in `package.json` sets the
`/yarphoenix-movies/` base path.

## Design notes

- **Theming** — light/dark are CSS-variable token sets toggled by a `.theme-dark`
  class on `<html>`; `color-scheme` plus a tiny inline boot script apply the saved
  (or system) theme before first paint, so there's no flash.
- **Aurora field** — one fragment shader (domain-warped FBM noise) drawn to a fixed
  full-viewport canvas behind the app; the light theme is the same field negated.
  Render is downscaled and frame-capped, pauses on tab-hide, and collapses to a
  single static frame under `prefers-reduced-motion` (CSS gradient if no WebGL).
- **Liquid glass** — the search bar, chips and cards share `--glass-*` tokens
  (`backdrop-filter` blur + saturate), tuned per theme so they read over the field.
- **Tone palette** — `Poster.jsx` defines 7 monochrome tones (light → black). A
  title's tone is its stored value, or a stable hash of its id, so placeholders stay
  consistent across renders.
- **Grayscale artwork** — real posters (OMDb or Kinopoisk) are drawn with a
  `grayscale(1)` filter and a gradient title overlay to match the placeholders.
- **Routing** — there's no `react-router`; `App.jsx` holds a small `route` object
  (`home` or `film`) and swaps pages, scrolling to top on each change.

---

_Bootstrapped with Create React App. Phoenix branding and the local catalogue are
original to this project._
