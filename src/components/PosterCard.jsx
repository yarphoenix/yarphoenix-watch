import { Poster } from "./Poster";

// Grid card: poster + caption underneath.
export function PosterCard({ film, onOpen, index }) {
  return (
    <button
      className="card"
      onClick={() => onOpen(film.id)}
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
          <span>{film.type === "series" ? "series" : "film"}</span>
        </span>
      </div>
    </button>
  );
}
