// ---------------------------------------------------------------------------
// Kinopoisk provider (Russian catalogue) — kinopoiskapiunofficial.tech.
//
// Auth is via an `X-API-KEY` header (unlike OMDb's query-param key). The API
// sends permissive CORS headers, so it is called directly from the browser
// (no proxy needed on GitHub Pages).
//
//   featured()        -> popular collection
//   search(q, {type}) -> keyword search
//   detail(id)        -> film by id (+ staff for director/cast, best-effort)
//
// With no REACT_APP_KINOPOISK_KEY the bundled local catalogue (data.js) is used.
//
// NOTE: exact endpoint paths/fields follow the live Swagger at
// https://kinopoiskapiunofficial.tech/documentation/api/ — every network path here
// degrades gracefully to the local fallback if a request fails.
// ---------------------------------------------------------------------------
import { na, hashTone, localAll, localDelay, localFind, localSearch } from "../shape";

const KP_API_KEY = process.env.REACT_APP_KINOPOISK_KEY;
const BASE = "https://kinopoiskapiunofficial.tech";
const FEATURED_COUNT = 15;

const SERIES_TYPES = new Set(["TV_SERIES", "MINI_SERIES", "TV_SHOW"]);

// Map a Kinopoisk record (collection item / search hit / full film) onto the UI shape.
function normalize(raw) {
  if (!raw) return null;
  const id = raw.kinopoiskId || raw.filmId || raw.kinopoiskHDId;
  if (!id) return null;
  const title = na(raw.nameRu) || na(raw.nameOriginal) || na(raw.nameEn) || "Без названия";
  const type = SERIES_TYPES.has(raw.type) ? "series" : "movie";
  const year = na(raw.year) ? String(raw.year) : "—";
  const runtime =
    typeof raw.filmLength === "number" ? `${raw.filmLength} мин` : na(raw.filmLength) || "—";
  const rating = na(raw.ratingKinopoisk) || na(raw.rating) || na(raw.ratingImdb) || "—";
  const genres = Array.isArray(raw.genres)
    ? raw.genres.map((g) => g.genre).filter(Boolean)
    : [];
  return {
    id: String(id),
    title,
    year,
    type,
    runtime,
    rating: String(rating),
    genres,
    director: "—",
    cast: [],
    tagline: "",
    synopsis: na(raw.description) || na(raw.shortDescription) || "",
    poster: na(raw.posterUrl) || na(raw.posterUrlPreview) || null,
    tone: hashTone(String(id) || title),
  };
}

async function request(path, params = {}) {
  const url = new URL(BASE + path);
  Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
  const res = await fetch(url, {
    headers: { "X-API-KEY": KP_API_KEY, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Kinopoisk responded ${res.status} ${res.statusText}`);
  return res.json();
}

async function featured() {
  if (!KP_API_KEY) { await localDelay(); return localAll(); }
  try {
    const data = await request("/api/v2.2/films/collections", {
      type: "TOP_250_MOVIES",
      page: 1,
    });
    const items = Array.isArray(data.items) ? data.items : Array.isArray(data.films) ? data.films : [];
    const mapped = items.slice(0, FEATURED_COUNT).map(normalize).filter(Boolean);
    return mapped.length ? mapped : localAll();
  } catch {
    return localAll();
  }
}

async function search(query, { type } = {}) {
  const q = (query || "").trim();
  if (!KP_API_KEY) { await localDelay(); return localSearch(q, { type }); }
  if (!q) return featured();
  try {
    const data = await request("/api/v2.1/films/search-by-keyword", { keyword: q, page: 1 });
    let mapped = (Array.isArray(data.films) ? data.films : []).map(normalize).filter(Boolean);
    if (type) mapped = mapped.filter((f) => f.type === type);
    return mapped;
  } catch {
    return localSearch(q, { type });
  }
}

async function detail(id) {
  if (!KP_API_KEY) return localFind(id);
  const film = normalize(await request(`/api/v2.2/films/${id}`));
  if (film) {
    // Director & cast live on a separate staff endpoint — best-effort enrichment.
    try {
      const staff = await request("/api/v1/staff", { filmId: id });
      if (Array.isArray(staff)) {
        const nameOf = (p) => na(p.nameRu) || na(p.nameEn);
        const directors = staff.filter((p) => p.professionKey === "DIRECTOR").map(nameOf).filter(Boolean);
        const actors = staff.filter((p) => p.professionKey === "ACTOR").map(nameOf).filter(Boolean);
        if (directors.length) film.director = directors.slice(0, 2).join(", ");
        if (actors.length) film.cast = actors.slice(0, 8);
      }
    } catch {
      /* staff is optional */
    }
  }
  return film;
}

export const kinopoisk = {
  featured,
  search,
  detail,
  get configured() { return !!KP_API_KEY; },
};
