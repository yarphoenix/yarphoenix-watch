import { useState, useEffect, useCallback, useRef } from "react";
import { Routes, Route, useSearchParams, useNavigate, useLocation, useParams } from "react-router-dom";
import { NotFound } from "./pages/NotFound";
import { Header } from "./layout/Header";
import { Footer } from "./layout/Footer";
import { Home } from "./pages/Home";
import { Detail } from "./pages/Detail";
import { AuroraBackground } from "./components/AuroraBackground";
import { getProvider } from "./api";
import { isAnime } from "./api/shape";
import { useLang } from "./i18n/LanguageContext";

const COLUMNS = 5;

// Scroll to top when the page (pathname) changes — but NOT when only the search
// params change, so typing in the search box doesn't jump the scroll.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, [pathname]);
  return null;
}

// Keyed Detail: remounts on :id change so it never flashes the previous film.
// `seed` (the clicked card's film) rides along in history state for an instant poster.
function DetailRoute() {
  const { id } = useParams();
  const { state } = useLocation();
  return <Detail key={id} id={id} seed={state?.seed ?? null} />;
}

function App() {
  const { lang, t } = useLang();
  const api = getProvider(lang); // OMDb (en) or Kinopoisk (ru)
  const navigate = useNavigate();

  // Search + filter live in the URL (?q=&type=) — shareable, and Back restores them.
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const filter = searchParams.get("type") || "all";

  const setQuery = useCallback((q) => {
    setSearchParams((prev) => {
      if (q) prev.set("q", q); else prev.delete("q");
      return prev;
    }, { replace: true }); // typing replaces — no Back-button spam
  }, [setSearchParams]);

  const setFilter = useCallback((type) => {
    setSearchParams((prev) => {
      if (type && type !== "all") prev.set("type", type); else prev.delete("type");
      return prev;
    }, { replace: true });
  }, [setSearchParams]);

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

  // Switching language switches the data provider: a title id from one provider
  // won't resolve in the other, so return to a fresh home. Skip the initial mount
  // (don't redirect away from a deep link on load).
  const prevLang = useRef(lang);
  useEffect(() => {
    if (prevLang.current !== lang) {
      prevLang.current = lang;
      navigate("/", { replace: true });
    }
  }, [lang, navigate]);

  // Debounce query/filter (and provider) changes into catalogue requests.
  useEffect(() => {
    const delay = query.trim() ? 350 : 0;
    const h = setTimeout(() => loadCatalogue(query, filter), delay);
    return () => clearTimeout(h);
  }, [query, filter, loadCatalogue]);

  const results = films;
  // Local fallback is in use whenever the active provider has no API key.
  const areLocalFilms = status === "ready" && films.length > 0 && !api.configured;

  return (
    <div className="App">
      <AuroraBackground />
      <ScrollToTop />
      <a href="#main-content" className="skip-link visually-hidden">{t("app.skip")}</a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Routes>
          <Route
            index
            element={
              <Home
                query={query} setQuery={setQuery}
                filter={filter} setFilter={setFilter}
                results={results}
                cols={COLUMNS}
                status={status} onRetry={() => loadCatalogue(query, filter)}
                areLocalFilms={areLocalFilms}
              />
            }
          />
          <Route path="/film/:id" element={<DetailRoute />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
