import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "./layout/Header";
import { Footer } from "./layout/Footer";
import { Home } from "./pages/Home";
import { Detail } from "./pages/Detail";
import { AuroraBackground } from "./components/AuroraBackground";
import { getProvider } from "./api";
import { isAnime } from "./api/shape";
import { useLang } from "./i18n/LanguageContext";

const COLUMNS = 5;

function App() {
  const { lang, t } = useLang();
  const api = getProvider(lang); // OMDb (en) or Kinopoisk (ru)

  const [route, setRoute] = useState({ name: "home" });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const [films, setFilms] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const reqId = useRef(0);

  // Fetch the catalogue: featured set when the query is empty, search otherwise.
  // "anime" isn't a provider `type` (only movie/series are) — it's a genre tag,
  // so it's never forwarded as the `type` param and is applied as a post-filter.
  const loadCatalogue = useCallback(async (q, type) => {
    const mine = ++reqId.current;
    setStatus("loading");
    try {
      const apiType = type === "movie" || type === "series" ? type : undefined;
      let data = q.trim()
        ? await api.search(q, { type: apiType })
        : apiType ? (await api.featured()).filter((f) => f.type === apiType) : await api.featured();
      if (type === "anime") {
        // Some providers' search hits omit genre data (e.g. OMDb's `s=`
        // endpoint) — fetch the full record before classifying those.
        data = await Promise.all(data.map(async (f) => {
          if (f.genres.length) return f;
          try { return (await api.detail(f.id)) || f; } catch { return f; }
        }));
        data = data.filter(isAnime);
      }
      if (mine !== reqId.current) return; // a newer request superseded this one
      setFilms(data);
      setStatus("ready");
    } catch (e) {
      if (mine !== reqId.current) return;
      console.error("Catalogue load failed:", e);
      setStatus("error");
    }
  }, [api]);

  // Switching language switches the data provider: reset the search and return
  // home, since a title id from one provider won't resolve in the other.
  useEffect(() => {
    setQuery("");
    setRoute({ name: "home" });
  }, [lang]);

  // Debounce query/filter (and provider) changes into catalogue requests.
  useEffect(() => {
    const delay = query.trim() ? 350 : 0;
    const h = setTimeout(() => loadCatalogue(query, filter), delay);
    return () => clearTimeout(h);
  }, [query, filter, loadCatalogue]);

  const results = films;

  const openFilm = (id) => setRoute({ name: "film", id });
  const goHome = () => setRoute({ name: "home" });

  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, [route]);

  // Local fallback is in use whenever the active provider has no API key.
  const areLocalFilms = status === "ready" && films.length > 0 && !api.configured;
  return (
    <div className="App">
      <AuroraBackground />
      <a href="#main-content" className="skip-link visually-hidden">{t("app.skip")}</a>
      <Header onHome={goHome} />
      <main id="main-content" tabIndex={-1}>
        {route.name === "home" ? (
          <Home
            query={query} setQuery={setQuery}
            filter={filter} setFilter={setFilter}
            results={results} onOpen={openFilm}
            cols={COLUMNS}
            status={status} onRetry={() => loadCatalogue(query, filter)}
            areLocalFilms={areLocalFilms}
          />
        ) : (
          <Detail key={route.id} id={route.id} seed={films.find((f) => f.id === route.id)} onOpen={openFilm} onHome={goHome} />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
