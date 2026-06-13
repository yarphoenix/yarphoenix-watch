// ---------------------------------------------------------------------------
// Watch-search client. Talks to the yarphoenix-films-api backend, which finds
// playable copies of a film on external sources (Rutube, VK) and returns a
// unified, ranked list of cards. The frontend depends only on this contract —
// all source-specific logic lives server-side.
//
// Base URL comes from REACT_APP_WATCH_API (inlined by CRA at build time). When
// it is unset the feature degrades gracefully (the modal shows a notice).
// ---------------------------------------------------------------------------
const BASE = process.env.REACT_APP_WATCH_API;

export function watchConfigured() {
  return !!BASE;
}

export async function searchWatchSources({ title, year, type, lang, runtime, signal }) {
  if (!BASE) return { results: [], partial: false };

  const url = new URL(`${BASE.replace(/\/+$/, "")}/api/watch/search`);
  url.searchParams.set("title", title);
  if (year) url.searchParams.set("year", year);
  if (type) url.searchParams.set("type", type);
  if (lang) url.searchParams.set("lang", lang);
  if (runtime) url.searchParams.set("runtime", runtime); // catalogued runtime in minutes

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Watch API responded ${res.status}`);
  const data = await res.json();
  return {
    results: Array.isArray(data.results) ? data.results : [],
    partial: !!data.partial,
  };
}
