import { SearchControls } from "../components/SearchControls";
import { Grid } from "../components/Grid";
import { SkeletonGrid } from "../components/Skeleton";

export function Home({ query, setQuery, filter, setFilter, results, onOpen, cols, status, onRetry, areLocalFilms }) {
  return (
    <div style={{ animation: "fadeIn .4s both" }}>
      <div className="page">
        <div className="hero">
          <h1>The catalogue of <em>everything worth watching.</em></h1>
          <p className="blurb">A curated index of films and series, kept in black and white so the work speaks first.</p>
        </div>
        <SearchControls query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} count={results.length} />
        <div style={{ height: "clamp(34px, 5vw, 60px)" }} />
          {areLocalFilms && <h2 style={{fontFamily: "'Space Grotesk', sans-serif"}}>It's a local catalogue</h2>}
        {status === "loading" ? (
          <SkeletonGrid cols={cols} />
        ) : status === "error" ? (
          <div className="state-note">
            <div className="big">Couldn’t reach the catalogue.</div>
            <div>The API request failed. Check the connection and try again.</div>
            <button className="btn ghost retry" onClick={onRetry}>Retry</button>
          </div>
        ) : results.length === 0 ? (
          <div className="empty">
            <div className="big">Nothing matches “{query}”.</div>
            <div>Try another title, or clear the filters.</div>
          </div>
        ) : (
          <Grid films={results} onOpen={onOpen} cols={cols} />
        )}
      </div>
    </div>
  );
}
