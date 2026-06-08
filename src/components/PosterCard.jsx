import { Poster } from "./Poster";
import { useT } from "../i18n/LanguageContext";

// Grid card: poster + caption underneath.
export function PosterCard({ film, onOpen, index }) {
  const t = useT();
  const typeLabel = film.type === "series" ? t("card.series") : t("card.film");
  return (
    <button
      type="button"
      className="card"
      onClick={() => onOpen(film.id)}
      aria-label={t("card.aria", film.title, film.year, typeLabel)}
      style={{
        textAlign: "left",
        background: "none",
        border: "none",
        padding: 0,
        color: "inherit",
        display: "block",
        width: "100%",
        animation: `fadeUp .5s both`,
        animationDelay: `${Math.min(index * 0.03, 0.4)}s`,
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
            color: "var(--muted)",
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: "0.04em",
          }}
        >
          <span>{film.year}</span>
          <span style={{textTransform: "capitalize"}}>{typeLabel}</span>
        </span>
      </div>
    </button>
  );
}
