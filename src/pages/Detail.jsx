import { useState, useEffect } from "react";
import { FilmAPI } from "../api/filmApi";
import { Poster } from "../components/Poster";
import { Grid } from "../components/Grid";

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
          <button type="button" className="btn ghost retry" onClick={onHome}>Back to catalogue</button>
        </div>
      </div>
    );
  }
  if (!film) {
    return <div className="page"><div className="state-note"><div className="big">Loading…</div></div></div>;
  }

  const hasCast = film.cast && film.cast.length > 0;
  return (
    <article className="detail page">
      <button type="button" className="back" onClick={onHome}>← Back to catalogue</button>
      <div className="detail-top">
        <div className="detail-poster"><Poster film={film} /></div>
        <div>
          <div className="kicker">{film.type === "series" ? "Series" : "Feature film"} · {film.year}</div>
          <h1 className="wordmark" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{film.title}</h1>
          {film.tagline ? <p className="tagline">“{film.tagline}”</p> : <div style={{ height: "8px" }} />}
          <dl className="specs">
            <div className="spec"><dt className="k">Rating</dt><dd className="v">★ {film.rating}</dd></div>
            <div className="spec"><dt className="k">{film.type === "series" ? "Length" : "Runtime"}</dt><dd className="v">{film.runtime}</dd></div>
            <div className="spec"><dt className="k">Released</dt><dd className="v">{film.year}</dd></div>
            <div className="spec"><dt className="k">Genre</dt><dd className="v">{film.genres.length ? film.genres.join(" / ") : "—"}</dd></div>
          </dl>
          <div className="actions">
            <button type="button" className="btn" onClick={() => setShowTrailer(true)}>▶ Watch trailer</button>
            <button type="button" className="btn ghost">+ Watchlist</button>
          </div>
          <p className="synopsis">{loading ? "Loading details…" : (film.synopsis || "No synopsis available.")}</p>
          <dl className="meta-cols">
            <div>
              <dt className="k">Directed by</dt>
              <dd className="v">{film.director}</dd>
            </div>
            <div>
              <dt className="k">Starring</dt>
              <dd className="v">
                {hasCast ? (
                  // eslint-disable-next-line jsx-a11y/no-redundant-roles -- role="list" restores list semantics WebKit drops when list-style:none is applied
                  <ul className="cast" role="list">
                    {film.cast.map((name) => <li key={name}>{name}</li>)}
                  </ul>
                ) : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {more.length > 0 && (
        <section className="more">
          <h2 className="section-label">More like this</h2>
          <Grid films={more} onOpen={onOpen} cols={4} />
        </section>
      )}
    </article>
  );
}
