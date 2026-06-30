import phoenix from "../assets/phoenix-watch.png";
import phoenixWhite from "../assets/phoenix-watch-white.png";
import { useT } from "../i18n/LanguageContext";

// Tone → black & white poster palette. Mix of light & dark for rhythm.
const TONES = [
  { bg: "#f4f4f4", fg: "#0b0b0b", sub: "#9a9a9a" }, // 0
  { bg: "#ededed", fg: "#0b0b0b", sub: "#9a9a9a" }, // 1
  { bg: "#e3e3e3", fg: "#0b0b0b", sub: "#8e8e8e" }, // 2
  { bg: "#1d1d1d", fg: "#ffffff", sub: "#7d7d7d" }, // 3
  { bg: "#2c2c2c", fg: "#ffffff", sub: "#8a8a8a" }, // 4
  { bg: "#121212", fg: "#ffffff", sub: "#777777" }, // 5
  { bg: "#000000", fg: "#ffffff", sub: "#6f6f6f" }, // 6
];

export function toneFor(film) { return TONES[film.tone % TONES.length]; }
export function isDark(film) { return film.tone >= 3; }

// Cursor-follow "spotlight": store the pointer position (relative to the poster) as CSS
// custom properties so the colour layer's radial mask can centre on it.
function trackSpotlight(e) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
  el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
}

// Typographic placeholder "poster" — 2:3, brand watermark, big title.
// When the API returns real artwork it is shown grayscale to keep the B&W identity.
export function Poster({ film, variant = "card" }) {
  const tr = useT();
  const t = toneFor(film);
  const dark = isDark(film);
  const mark = dark ? phoenixWhite : phoenix;

  // Tiny thumbnail: just tone + centered phoenix, no text.
  if (variant === "thumb") {
    return (
      <div
        className="poster"
        data-dark={dark ? "1" : "0"}
        style={{
          position: "relative",
          aspectRatio: "2 / 3",
          background: t.bg,
          borderRadius: "calc(var(--radius) * 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img src={mark} alt="" aria-hidden="true" style={{ width: "52%", opacity: 0.42 }} />
      </div>
    );
  }

  // Real artwork from the API (rendered grayscale to preserve the B&W identity).
  if (film.poster) {
    return (
      <div
        className="poster"
        data-dark="1"
        onMouseMove={trackSpotlight}
        style={{
          position: "relative",
          aspectRatio: "2 / 3",
          borderRadius: "var(--radius)",
          overflow: "hidden",
          background: "#0b0b0b",
        }}
      >
        {/* base layer — always grayscale */}
        <img className="poster__image" src={film.poster} alt={film.title} />
        {/* colour layer — revealed only within the cursor spotlight (see index.css) */}
        <img className="poster__image poster__image--color" src={film.poster} alt="" aria-hidden="true" />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,.82) 0%, rgba(0,0,0,0) 52%)",
          }}
        />
      </div>
    );
  }

  // Typographic placeholder poster.
  return (
    <div
      className="poster"
      data-dark={dark ? "1" : "0"}
      style={{
        position: "relative",
        aspectRatio: "2 / 3",
        background: t.bg,
        color: t.fg,
        borderRadius: "var(--radius)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "clamp(12px, 1.6vw, 20px)",
        transition: "background .45s ease, color .45s ease, transform .45s cubic-bezier(.2,.7,.2,1)",
      }}
    >
      {/* hairline frame */}
      <span
        aria-hidden="true"
        className="poster-frame"
        style={{
          position: "absolute",
          inset: "9px",
          border: `1px solid ${dark ? "rgba(255,255,255,.22)" : "rgba(0,0,0,.16)"}`,
          borderRadius: "calc(var(--radius) * 0.6)",
          pointerEvents: "none",
          transition: "border-color .45s ease",
        }}
      />
      {/* watermark phoenix */}
      <img
        src={mark}
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          right: "11%",
          top: "13%",
          width: "30%",
          opacity: 0.1,
          transition: "opacity .45s ease, transform .6s ease",
          pointerEvents: "none",
        }}
      />
      {/* top label */}
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "clamp(9px, 0.85vw, 11px)",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: t.sub,
        }}
      >
        <span>{film.type === "series" ? tr("poster.series") : tr("poster.feature")}</span>
        <span>{film.year}</span>
      </div>
      {/* title */}
      <div style={{ position: "relative" }}>
        <div
          className="wordmark"
          style={{
            fontFamily: "var(--display-font)",
            fontWeight: 600,
            lineHeight: 0.96,
            letterSpacing: "-0.01em",
            fontSize: "clamp(16px, 1.9vw, 25px)",
            textWrap: "balance",
            overflowWrap: "break-word",
          }}
        >
          {film.title}
        </div>
        <div
          style={{
            marginTop: "8px",
            fontSize: "clamp(9px, 0.85vw, 11px)",
            letterSpacing: "0.06em",
            color: t.sub,
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {film.genres.join(" · ")}
        </div>
      </div>
    </div>
  );
}
