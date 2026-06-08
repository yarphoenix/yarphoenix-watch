// ---------------------------------------------------------------------------
// Shared data-layer helpers used by every provider.
//
// The whole UI consumes ONE normalized record shape:
//   { id, title, year, type, runtime, rating, genres[], director, cast[],
//     tagline, synopsis, poster, tone }
// Each provider maps its raw API records onto this shape; the helpers here
// cover the bits that are provider-independent (tone hashing, the bundled
// local fallback catalogue from data.js).
// ---------------------------------------------------------------------------
import { FILMS } from "./data";

// Treat OMDb's "N/A" (and empty values) as missing.
export const na = (v) => (v && v !== "N/A" ? v : null);

// Stable 0..6 hash → drives the black & white placeholder poster palette.
export function hashTone(s) {
  let h = 0;
  s = String(s);
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 7;
}

// Local fallback records already use the UI shape — just settle poster/tone.
export function normalizeLocal(raw) {
  if (!raw) return null;
  return {
    ...raw,
    poster: raw.poster || null,
    tone: Number.isInteger(raw.tone) ? raw.tone : hashTone(raw.id),
  };
}

export function localAll() {
  return FILMS.map(normalizeLocal);
}

export function localFind(id) {
  return normalizeLocal(FILMS.find((f) => f.id === id));
}

// Small artificial delay so the local fallback still shows loading skeletons.
export async function localDelay() {
  await new Promise((r) => setTimeout(r, 300));
}

// Client-side search over the local catalogue (used by providers' fallback).
export function localSearch(query, { type } = {}) {
  const ql = (query || "").trim().toLowerCase();
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
