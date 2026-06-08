# Yarphoenix Movies

**[Live demo → yarphoenix.github.io/yarphoenix-movies](https://yarphoenix.github.io/yarphoenix-movies/)**

A black-and-white catalogue of films and series, built with React. A header
**EN / RU** toggle switches both the interface language and the data source:
**English** is powered by the [OMDb API](https://www.omdbapi.com/), **Russian**
by [Kinopoisk](https://kinopoiskapiunofficial.tech/). Either way the app falls
back to a bundled local catalogue, so it keeps working offline or with no API key.

> _The catalogue of everything worth watching — kept in black and white so the
> work speaks first._

The interface is deliberately editorial: typographic placeholder posters, a
phoenix wordmark, and real artwork rendered in grayscale to preserve the
monochrome identity.

---

## Features

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
| i18n        | Homegrown — React context + `{ en, ru }` dictionary + `t()` hook        |
| Styling     | Plain CSS ([`src/index.css`](src/index.css)) + inline style objects     |
| Typography  | Google Fonts (Space Grotesk, IBM Plex Mono, Hanken Grotesk) + local Microgramma |
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
```

- **OMDb** (English) — free key at <https://www.omdbapi.com/apikey.aspx>
- **Kinopoisk** (Russian) — free key at <https://kinopoiskapiunofficial.tech/>

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
│   └── providers/
│       ├── omdb.js          # English provider (OMDb)
│       └── kinopoisk.js     # Russian provider (Kinopoisk)
├── i18n/
│   ├── strings.js           # { en, ru } UI string dictionary
│   ├── plural.js            # Russian plural-form helper
│   └── LanguageContext.jsx  # LanguageProvider + useLang() / useT()
├── assets/                  # Phoenix logos + Microgramma display font
├── components/
│   ├── Grid.jsx             # Responsive poster grid (--cols custom property)
│   ├── Poster.jsx           # B&W placeholder / grayscale-artwork poster + tones
│   ├── PosterCard.jsx       # Grid card: poster + caption
│   ├── SearchControls.jsx   # Search input + filter chips + result count
│   ├── Skeleton.jsx         # Loading skeleton grid
│   └── LanguageToggle.jsx   # EN | RU segmented control
├── layout/
│   ├── Header.jsx           # Sticky brand header + nav + language toggle
│   └── Footer.jsx           # Footer (shows the active data source)
├── pages/
│   ├── Home.jsx             # Hero + search + catalogue grid
│   └── Detail.jsx           # Single title view + "More like this"
├── App.jsx                  # Routing + language-driven catalogue loading
├── index.js                 # Entry point — wraps <App> in <LanguageProvider>
└── index.css                # App styles
public/
└── index.html               # HTML shell, font preloads, CSS design tokens
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
`main`: CRA build → upload Pages artifact → deploy. API keys are injected from repo
secrets at build time, and `homepage` in `package.json` sets the `/yarphoenix-movies/`
base path.

## Design notes

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
