import { SearchControls } from "../components/SearchControls";
import { Grid } from "../components/Grid";
import { SkeletonGrid } from "../components/Skeleton";
import { useT } from "../i18n/LanguageContext";

export function Home({ query, setQuery, filter, setFilter, results, onOpen, cols, status, onRetry, areLocalFilms }) {
  const t = useT();
  return (
    <div style={{ animation: "fadeIn .4s both" }}>
      <div className="page">
        <div className="hero">
          <h1>{t("home.heroPre")}<em>{t("home.heroEm")}</em></h1>
          <p className="blurb">{t("home.blurb")}</p>
        </div>
        <SearchControls query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} count={results.length} />
        <div style={{ height: "clamp(34px, 5vw, 60px)" }} />
          {areLocalFilms && <h2 style={{fontFamily: "'Space Grotesk', sans-serif"}}>{t("home.localNotice")}</h2>}
        {status === "loading" ? (
          <SkeletonGrid cols={cols} />
        ) : status === "error" ? (
          <div className="state-note" role="alert">
            <div className="big">{t("home.errorBig")}</div>
            <div>{t("home.errorDetail")}</div>
            <button type="button" className="btn ghost retry" onClick={onRetry}>{t("home.retry")}</button>
          </div>
        ) : results.length === 0 ? (
          <div className="empty" role="status">
            <div className="big">{t("home.emptyBig", query)}</div>
            <div>{t("home.emptyDetail")}</div>
          </div>
        ) : (
          <Grid films={results} onOpen={onOpen} cols={cols} />
        )}
      </div>
    </div>
  );
}
