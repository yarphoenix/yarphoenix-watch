// ---------------------------------------------------------------------------
// OMDb provider (English catalogue).  Docs: https://www.omdbapi.com/
//
// OMDb has no "list everything" endpoint — you can only search by a term or
// fetch one title by imdbID. So:
//   featured()        -> curated imdbID set, fetched full & in parallel
//   search(q, {type}) -> live search results (partial records)
//   detail(imdbID)    -> one full record (rating, genres, cast, plot…)
//
// With no REACT_APP_OMDB_KEY the bundled local catalogue (data.js) is used.
// ---------------------------------------------------------------------------
import { na, hashTone, localAll, localDelay, localFind, localSearch } from "../shape";

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
  "tt0114339", // Savage
  "tt0122369", // The Abashiri Family
  "tt0138044", // The Great Dictator
  "tt0245429", // Spirited Away (anime)
  "tt5311514", // Your Name. (anime)
  "tt0213338", // Cowboy Bebop (anime, series)
];

// Map an OMDb record (full or partial search hit) onto the UI shape.
function normalize(raw) {
  if (!raw) return null;
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
  if (!OMDB_API_KEY) { await localDelay(); return localSearch(q, { type }); }
  if (!q) return featured();
  const data = await request({ s: q, type: type || undefined, page: 1 });
  const items = Array.isArray(data.Search) ? data.Search : [];
  return items.map(normalize);
}

async function detail(id) {
  if (!OMDB_API_KEY) return localFind(id);
  return normalize(await request({ i: id, plot: "full" }));
}

export const omdb = {
  featured,
  search,
  detail,
  get configured() { return !!OMDB_API_KEY; },
};
