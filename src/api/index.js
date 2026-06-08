// Provider registry — the active film data source is chosen by UI language.
//   en -> OMDb (English)
//   ru -> Kinopoisk (Russian)
// Both expose the same interface: { featured, search, detail, configured }.
import { omdb } from "./providers/omdb";
import { kinopoisk } from "./providers/kinopoisk";

export function getProvider(lang) {
  return lang === "ru" ? kinopoisk : omdb;
}
