import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "./layout/Header";
import { Footer } from "./layout/Footer";
import { Home } from "./pages/Home";
import { Detail } from "./pages/Detail";
import { FilmAPI } from "./api/filmApi";

// Films are shown in a grid; this is the default column count.
const COLUMNS = 5;

function App() {
  const [route, setRoute] = useState({ name: "home" });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const [films, setFilms] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const reqId = useRef(0);

  // Fetch the catalogue: featured set when the query is empty, OMDb search otherwise.
  const loadCatalogue = useCallback(async (q, type) => {
    const mine = ++reqId.current;
    setStatus("loading");
    try {
      const data = q.trim()
        ? await FilmAPI.search(q, { type: type === "all" ? undefined : type })
        : (type === "all" ? await FilmAPI.featured() : (await FilmAPI.featured()).filter((f) => f.type === type));
      if (mine !== reqId.current) return; // a newer request superseded this one
      setFilms(data);
      setStatus("ready");
    } catch (e) {
      if (mine !== reqId.current) return;
      console.error("Catalogue load failed:", e);
      setStatus("error");
    }
  }, []);

  // Debounce query/filter changes into catalogue requests.
  useEffect(() => {
    const delay = query.trim() ? 350 : 0;
    const h = setTimeout(() => loadCatalogue(query, filter), delay);
    return () => clearTimeout(h);
  }, [query, filter, loadCatalogue]);

  const results = films;

  const openFilm = (id) => setRoute({ name: "film", id });
  const goHome = () => setRoute({ name: "home" });
  const setFilterAndHome = (val) => { setFilter(val); setQuery(""); setRoute({ name: "home" }); };

  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, [route]);

  const areLocalFilms = status === "ready" && films.length > 0 && !films.some(r => r.id && r.id.startsWith('tt'));
  return (
    <div className="App">
      <Header onHome={goHome} onFilter={setFilterAndHome} />
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
      <Footer />
    </div>
  );
}

export default App;
