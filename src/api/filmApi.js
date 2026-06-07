// ---------------------------------------------------------------------------
// YARPHOENIX MOVIES — data access layer (OMDb API).
//
// Docs: https://www.omdbapi.com/   (free key: https://www.omdbapi.com/apikey.aspx)
//
// OMDb has no "list everything" endpoint — you can only:
//   • search by a term:   ?apikey=KEY&s=<query>&type=movie|series&page=N
//   • fetch one by id:     ?apikey=KEY&i=<imdbID>&plot=full
//
// So the UI works like this:
//   FilmAPI.featured()        -> curated imdbID set, fetched full & in parallel
//   FilmAPI.search(q, {type}) -> live search results (partial records)
//   FilmAPI.detail(imdbID)    -> one full record (rating, genres, cast, plot…)
//
// When OMDB_API_KEY is empty the bundled catalogue in data.js is used as a
// local fallback so the app still runs offline. The key can be overridden with
// a REACT_APP_OMDB_KEY environment variable.
// ---------------------------------------------------------------------------
import { FILMS } from "./data";

const OMDB_API_KEY = process.env.REACT_APP_OMDB_KEY;
const BASE = "https://www.omdbapi.com/";

// Curated default catalogue shown before the visitor searches.
const FEATURED_IDS = [
  "tt0111161", // The Shawshank Redemption
  "tt0468569", // The Dark Knight
  "tt1375666", // Inception
  "tt0816692", // Interstellar
  "tt0110912", // Pulp Fiction
  "tt0137523", // Fight Club
  "tt0903747", // Breaking Bad (series)
  "tt6751668", // Parasite
  "tt0167260", // LOTR: Return of the King
  "tt0944947", // Game of Thrones (series)
  "tt0109830", // Forrest Gump
  "tt0114369", // Se7en
];

const na = (v) => (v && v !== "N/A" ? v : null);

function hashTone(s) {
  let h = 0;
  s = String(s);
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 7;
}

// Map an OMDb record (full or partial search hit) onto the UI's shape.
function normalize(raw) {
  if (!raw) return null;
  // Local fallback records already use the UI shape — detect & pass through.
  if (raw.id && raw.genres) {
    return { ...raw, poster: raw.poster || null, tone: Number.isInteger(raw.tone) ? raw.tone : hashTone(raw.id) };
  }
  return {
    id: raw.imdbID,
    title: na(raw.Title) || "Untitled",
    year: na(raw.Year) || "—",
    type: raw.Type === "series" ? "series" : "movie",
    runtime: na(raw.Runtime) || "—",
    rating: na(raw.imdbRating) || "—",
    genres: na(raw.Genre) ? raw.Genre.split(", ") : [],
    director: na(raw.Director) || "Unknown",
    cast: na(raw.Actors) ? raw.Actors.split(", ") : [],
    tagline: "",
    synopsis: na(raw.Plot) || "",
    poster: na(raw.Poster),
    tone: hashTone(raw.imdbID || raw.Title),
  };
}

async function request(params) {
  const url = new URL(BASE);
  url.searchParams.set("apikey", OMDB_API_KEY);
  Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OMDb responded ${res.status} ${res.statusText}`);
  const data = await res.json();
  if (data.Response === "False" && data.Error && !/not found/i.test(data.Error)) {
    throw new Error(`OMDb: ${data.Error}`);
  }
  return data;
}

// ---- local fallback helpers ------------------------------------------------
function localAll() { return FILMS.map(normalize); }
async function localDelay() { await new Promise((r) => setTimeout(r, 300)); }

// ---- public API ------------------------------------------------------------
async function featured() {
  if (!OMDB_API_KEY) { await localDelay(); return localAll(); }
  const results = await Promise.all(
    FEATURED_IDS.map((id) =>
      request({ i: id, plot: "short" }).then(normalize).catch(() => null)
    )
  );
  const ok = results.filter(Boolean);
  // If every request failed (offline / rate-limited), fall back to local data.
  return ok.length ? ok : localAll();
}

async function search(query, { type } = {}) {
  const q = (query || "").trim();
  if (!OMDB_API_KEY) {
    await localDelay();
    const ql = q.toLowerCase();
    return localAll().filter((f) => {
      if (type && f.type !== type) return false;
      if (!ql) return true;
      return (
        f.title.toLowerCase().includes(ql) ||
        f.genres.join(" ").toLowerCase().includes(ql) ||
        f.cast.join(" ").toLowerCase().includes(ql) ||
        f.director.toLowerCase().includes(ql)
      );
    });
  }
  if (!q) return featured();
  const data = await request({ s: q, type: type || undefined, page: 1 });
  const items = Array.isArray(data.Search) ? data.Search : [];
  return items.map(normalize);
}

async function detail(id) {
  if (!OMDB_API_KEY) {
    const found = FILMS.find((f) => f.id === id);
    return normalize(found);
  }
  return normalize(await request({ i: id, plot: "full" }));
}

export const FilmAPI = {
  featured,
  search,
  detail,
  normalize,
  hashTone,
  get configured() { return !!OMDB_API_KEY; },
};
