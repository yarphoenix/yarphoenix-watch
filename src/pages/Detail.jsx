import { useState, useEffect } from "react";
import { useLang } from "../i18n/LanguageContext";
import { getProvider } from "../api";
import { Poster } from "../components/Poster";
import { Grid } from "../components/Grid";
import { WatchModal } from "../components/WatchModal";

export function Detail({ id, seed, onOpen, onHome }) {
  const { lang, t } = useLang();
  const api = getProvider(lang);

  const [film, setFilm] = useState(seed || null);
  const [more, setMore] = useState([]);
  const [loading, setLoading] = useState(!seed || !seed.synopsis);
  const [failed, setFailed] = useState(false);
  const [showWatch, setShowWatch] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setFailed(false);
    api.detail(id)
      .then((full) => {
        if (!alive) return;
        if (full) setFilm(full);
        else if (!seed) setFailed(true);
        setLoading(false);
        const genre = full && full.genres[0];
        if (genre) {
          api.search(genre, {})
            .then((r) => alive && setMore(r.filter((x) => x.id !== id).slice(0, 4)))
            .catch(() => {});
        }
      })
      .catch(() => { if (alive) { setLoading(false); if (!seed) setFailed(true); } });
    return () => { alive = false; };
  }, [id, seed, api]);

  if (failed && !film) {
    return (
      <div className="page">
        <div className="state-note">
          <div className="big">{t("detail.failedBig")}</div>
          <button type="button" className="btn ghost retry" onClick={onHome}>{t("detail.backToCatalogue")}</button>
        </div>
      </div>
    );
  }
  if (!film) {
    return <div className="page"><div className="state-note"><div className="big">{t("detail.loading")}</div></div></div>;
  }

  const hasCast = film.cast && film.cast.length > 0;
  return (
    <article className="detail page">
      <button type="button" className="back" onClick={onHome}>{t("detail.back")}</button>
      <div className="detail-top">
        <div className="detail-poster"><Poster film={film} /></div>
        <div>
          <div className="kicker">{film.type === "series" ? t("detail.kickerSeries") : t("detail.kickerFeature")} · {film.year}</div>
          <h1 className="wordmark" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{film.title}</h1>
          {film.tagline ? <p className="tagline">“{film.tagline}”</p> : <div style={{ height: "8px" }} />}
          <dl className="specs">
            <div className="spec"><dt className="k">{t("detail.rating")}</dt><dd className="v">★ {film.rating}</dd></div>
            <div className="spec"><dt className="k">{film.type === "series" ? t("detail.length") : t("detail.runtime")}</dt><dd className="v">{film.runtime}</dd></div>
            <div className="spec"><dt className="k">{t("detail.released")}</dt><dd className="v">{film.year}</dd></div>
            <div className="spec"><dt className="k">{t("detail.genre")}</dt><dd className="v">{film.genres.length ? film.genres.join(" / ") : "—"}</dd></div>
          </dl>
          <div className="actions">
            <button type="button" className="btn" onClick={() => setShowWatch(true)}>{t("detail.watch")}</button>
          </div>
          <p className="synopsis">{loading ? t("detail.loadingDetails") : (film.synopsis || t("detail.noSynopsis"))}</p>
          <dl className="meta-cols">
            <div>
              <dt className="k">{t("detail.directedBy")}</dt>
              <dd className="v">{film.director}</dd>
            </div>
            <div>
              <dt className="k">{t("detail.starring")}</dt>
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
          <h2 className="section-label">{t("detail.moreLikeThis")}</h2>
          <Grid films={more} onOpen={onOpen} cols={4} />
        </section>
      )}

      {showWatch && <WatchModal film={film} onClose={() => setShowWatch(false)} />}
    </article>
  );
}
