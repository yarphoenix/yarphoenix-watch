# Yarphoenix Movies

A black-and-white catalogue of films and series, built with React. It pulls live
data from the [OMDb API](https://www.omdbapi.com/) and falls back to a bundled
local catalogue, so the app keeps working offline or with no API key configured.

> _The catalogue of everything worth watching — kept in black and white so the
> work speaks first._

The interface is deliberately editorial: typographic placeholder posters, a
phoenix wordmark, and real artwork rendered in grayscale to preserve the
monochrome identity.

---

## Features

- **Curated featured catalogue** — 12 hand-picked IMDb titles fetched full and in
  parallel as the landing view (before the visitor searches).
- **Live search** — debounced (≈350 ms) queries against OMDb, with `All / Films /
  Series` filter chips and a live result count.
- **Detail pages** — poster, rating, runtime, year, genres, tagline, synopsis,
  director, cast, plus a "More like this" row derived from the title's first genre.
- **Offline-first fallback** — when no API key is set or every request fails, the
  app transparently serves the local catalogue in [`src/api/data.js`](src/api/data.js)
  and shows a "loaded from local storage" notice.
- **Considered states** — shimmer loading skeletons, an error state with a retry
  button, and an empty state for searches with no matches.
- **Black-and-white poster system** — each title gets a deterministic `tone` (0–6)
  that drives a light/dark placeholder palette; real OMDb artwork is shown
  `grayscale` to stay on-brand.
- **No router, no state library** — routing and data orchestration are handled
  with plain React hooks in [`src/App.jsx`](src/App.jsx).

## Tech stack

| Area        | Choice                                                                 |
| ----------- | ---------------------------------------------------------------------- |
| Framework   | React 19 + ReactDOM 19                                                 |
| Tooling     | [Create React App](https://github.com/facebook/create-react-app) (`react-scripts` 5) |
| Data        | [OMDb API](https://www.omdbapi.com/) with a local JS fallback catalogue |
| Styling     | Plain CSS ([`src/index.css`](src/index.css)) + inline style objects     |
| Typography  | Google Fonts (Space Grotesk, IBM Plex Mono, Hanken Grotesk) + local Microgramma display face |
| Testing     | Testing Library (`jest-dom` / `react` / `user-event`) wired via CRA     |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (recommended) and npm.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure an OMDb API key (optional)

Create a `.env.local` file in the project root:

```dotenv
REACT_APP_OMDB_KEY=your_key_here
```

Grab a free key at <https://www.omdbapi.com/apikey.aspx>.

> If the key is missing — or OMDb is unreachable or rate-limited — the app falls
> back to the bundled local catalogue automatically, so it always runs.
> `.env.local` is gitignored, so your key is never committed.

### 3. Start the dev server

```bash
npm start
```

Open <http://localhost:3000> to view it in the browser. The page reloads on edits.

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
│   ├── data.js          # Local fallback catalogue (18 fictional titles)
│   └── filmApi.js       # OMDb data-access layer + record normalization
├── assets/              # Phoenix logos + Microgramma display font
├── components/
│   ├── Grid.jsx         # Responsive poster grid (--cols custom property)
│   ├── Poster.jsx       # B&W placeholder / grayscale-artwork poster + tone palette
│   ├── PosterCard.jsx   # Grid card: poster + caption
│   ├── SearchControls.jsx # Search input + filter chips + result count
│   └── Skeleton.jsx     # Loading skeleton grid
├── layout/
│   ├── Header.jsx       # Sticky brand header + nav (Films / Series / Browse all)
│   └── Footer.jsx       # Footer (shows whether data came from API or local)
├── pages/
│   ├── Home.jsx         # Hero + search + catalogue grid
│   └── Detail.jsx       # Single title view + "More like this"
├── App.jsx              # State-based routing + catalogue loading
├── index.js             # React entry point
└── index.css            # App styles
public/
└── index.html           # HTML shell, font preloads, CSS design tokens
```

## How the data layer works

OMDb has no "list everything" endpoint — you can only search by term or fetch one
title by IMDb id. [`FilmAPI`](src/api/filmApi.js) wraps that into three calls:

- **`featured()`** — fetches a curated set of IMDb ids in parallel for the default
  landing view.
- **`search(query, { type })`** — live, type-filtered search (page 1 of results).
- **`detail(imdbID)`** — one full record (rating, genres, cast, full plot).

Every OMDb response is mapped onto a single UI shape by `normalize()`. When no key
is configured, the same functions read from [`data.js`](src/api/data.js) instead, so
the UI code never has to know whether it's online.

## Design notes

- **Tone palette** — `Poster.jsx` defines 7 monochrome tones (light → black). A
  title's tone is its stored value, or a stable hash of its id, so placeholders
  stay consistent across renders.
- **Grayscale artwork** — real OMDb posters are drawn with a `grayscale(1)` filter
  and a gradient title overlay to match the placeholders.
- **Routing** — there's no `react-router`; `App.jsx` holds a small `route` object
  (`home` or `film`) and swaps pages, scrolling to top on each change.

---

_Bootstrapped with Create React App. Phoenix branding and the local catalogue are
original to this project._
