import { useState, useEffect } from "react";
import { FilmAPI } from "../api/filmApi";
import { Poster } from "../components/Poster";
import { PosterCard } from "../components/PosterCard";

export function Detail({ id, seed, onOpen, onHome }) {
  const [film, setFilm] = useState(seed || null);
  const [more, setMore] = useState([]);
  const [loading, setLoading] = useState(!seed || !seed.synopsis);
  const [failed, setFailed] = useState(false);
    const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setFailed(false);
    FilmAPI.detail(id)
      .then((full) => {
        if (!alive) return;
        if (full) setFilm(full);
        else if (!seed) setFailed(true);
        setLoading(false);
        const genre = full && full.genres[0];
        if (genre) {
          FilmAPI.search(genre, {})
            .then((r) => alive && setMore(r.filter((x) => x.id !== id).slice(0, 4)))
            .catch(() => {});
        }
      })
      .catch(() => { if (alive) { setLoading(false); if (!seed) setFailed(true); } });
    return () => { alive = false; };
  }, [id, seed]);

  if (failed && !film) {
    return (
      <div className="page">
        <div className="state-note">
          <div className="big">Couldn’t load this title.</div>
          <button className="btn ghost retry" onClick={onHome}>Back to catalogue</button>
        </div>
      </div>
    );
  }
  if (!film) {
    return <div className="page"><div className="state-note"><div className="big">Loading…</div></div></div>;
  }

  const hasCast = film.cast && film.cast.length > 0;
  return (
    <div className="detail page">
      <button className="back" onClick={onHome}>← Back to catalogue</button>
      <div className="detail-top">
        <div className="detail-poster"><Poster film={film} /></div>
        <div>
          <div className="kicker">{film.type === "series" ? "Series" : "Feature film"} · {film.year}</div>
          <h1 className="wordmark" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{film.title}</h1>
          {film.tagline ? <p className="tagline">“{film.tagline}”</p> : <div style={{ height: "8px" }} />}
          <div className="specs">
            <div className="spec"><div className="k">Rating</div><div className="v">★ {film.rating}</div></div>
            <div className="spec"><div className="k">{film.type === "series" ? "Length" : "Runtime"}</div><div className="v">{film.runtime}</div></div>
            <div className="spec"><div className="k">Released</div><div className="v">{film.year}</div></div>
            <div className="spec"><div className="k">Genre</div><div className="v">{film.genres.length ? film.genres.join(" / ") : "—"}</div></div>
          </div>
          <div className="actions">
            <button className="btn" onClick={() => setShowTrailer(true)}>▶ Watch trailer</button>
            <button className="btn ghost">+ Watchlist</button>
          </div>
          <p className="synopsis">{loading ? "Loading details…" : (film.synopsis || "No synopsis available.")}</p>
          <div className="meta-cols">
            <div>
              <div className="k">Directed by</div>
              <div className="v">{film.director}</div>
            </div>
            <div>
              <div className="k">Starring</div>
              <div className="v">{hasCast ? film.cast.map((name) => <div key={name}>{name}</div>) : "—"}</div>
            </div>
          </div>
        </div>
      </div>

      {more.length > 0 && (
        <div className="more">
          <p className="section-label">More like this</p>
          <div className="grid">
            {more.map((f, i) => <PosterCard key={f.id} film={f} onOpen={onOpen} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}
