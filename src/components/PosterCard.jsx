import { Link } from "react-router-dom";
import { Poster } from "./Poster";
import { useT } from "../i18n/LanguageContext";
import { useInView } from "../hooks/useInView";

// Grid card: a link to the title, carrying the film as `seed` in history state so
// the detail page can render the poster instantly while it fetches full details.
// `cols` (grid column count) drives the stagger so cards fan out left-to-right in a
// wave, each lagging slightly behind its left neighbor — independent of how many rows
// are above it. The reveal itself is gated on scroll visibility (useInView), not on
// mount, so cards below the fold only animate once the user actually scrolls down to
// them. The transform/opacity live on a wrapper div so they never fight the inner
// .card's own hover lift.
export function PosterCard({ film, index, cols }) {
  const t = useT();
  const typeLabel = film.type === "series" ? t("card.series") : t("card.film");
  const staggerCol = cols ? index % cols : index;
  const delay = 0.15 + Math.min(staggerCol, 6) * 0.1;
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(44px)",
        transition: `opacity 1.1s cubic-bezier(.2,.7,.2,1) ${delay.toFixed(2)}s, transform 1.1s cubic-bezier(.2,.7,.2,1) ${delay.toFixed(2)}s`,
      }}
    >
      <Link
        className="card"
        to={`/film/${film.id}`}
        state={{ seed: film }}
        aria-label={t("card.aria", film.title, film.year, typeLabel)}
        style={{
          textAlign: "left",
          color: "inherit",
          textDecoration: "none",
          display: "block",
          width: "100%",
        }}
      >
        <div className="card-poster">
          <Poster film={film} />
        </div>
        <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "15px", fontWeight: 500, letterSpacing: "-0.01em" }}>
            {film.title}
          </span>
          <span
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.04em",
            }}
          >
            <span>{film.year}</span>
            <span style={{textTransform: "capitalize"}}>{typeLabel}</span>
          </span>
        </div>
      </Link>
    </div>
  );
}
