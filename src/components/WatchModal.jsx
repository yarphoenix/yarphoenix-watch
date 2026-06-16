import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLang } from "../i18n/LanguageContext";
import { searchWatchSources, watchConfigured } from "../api/watch";

function formatDuration(sec, lang) {
  if (!sec || sec <= 0) return null;
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  if (lang === "ru") return h ? `${h} ч ${m} мин` : `${m} мин`;
  return h ? `${h}h ${m}m` : `${m}m`;
}

// "Where to watch" overlay: searches the backend for playable copies of `film`
// and shows them as cards that open the source in a new tab.
export function WatchModal({ film, onClose }) {
  const { lang, t } = useLang();
  const [status, setStatus] = useState("loading"); // loading | ready | error | unconfigured
  const [results, setResults] = useState([]);
  const [partial, setPartial] = useState(false);
  const closeRef = useRef(null);

  const year = (String(film.year).match(/\d{4}/) || [])[0];
  // Catalogued runtime in minutes ("120 мин" / "142 min" → 120); lets the backend
  // drop clips/trailers whose length is far from the real film.
  const runtimeMin = parseInt(film.runtime, 10);
  const runtime = Number.isFinite(runtimeMin) ? runtimeMin : undefined;

  const load = useCallback(() => {
    if (!watchConfigured()) {
      setStatus("unconfigured");
      return undefined;
    }
    setStatus("loading");
    const controller = new AbortController();
    searchWatchSources({ title: film.title, year, type: film.type, lang, runtime, signal: controller.signal })
      .then((r) => { setResults(r.results); setPartial(r.partial); setStatus("ready"); })
      .catch((e) => { if (e.name !== "AbortError") setStatus("error"); });
    return controller;
  }, [film.title, film.type, year, runtime, lang]);

  useEffect(() => {
    const controller = load();
    return () => controller?.abort();
  }, [load]);

  // Esc closes; focus the close button on open.
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock background scroll while the modal is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Portal to <body> so the overlay's position:fixed is relative to the viewport,
  // not the transformed .detail ancestor (which would otherwise clip/scroll it).
  return createPortal(
    <div
      className="watch-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="watch-dialog" role="dialog" aria-modal="true" aria-label={t("watch.title")}>
        <div className="watch-head">
          <div>
            <div className="section-label" style={{ margin: 0 }}>{t("watch.title")}</div>
            <div className="watch-sub">{film.title}{year ? ` · ${year}` : ""}</div>
          </div>
          <button ref={closeRef} type="button" className="watch-close" onClick={onClose} aria-label={t("watch.close")}>
            ✕
          </button>
        </div>

        {status === "loading" && (
          <div className="state-note"><div className="big">{t("watch.loading")}</div></div>
        )}

        {status === "unconfigured" && (
          <div className="state-note"><div className="big">{t("watch.notConfigured")}</div></div>
        )}

        {status === "error" && (
          <div className="state-note">
            <div className="big">{t("watch.error")}</div>
            <button type="button" className="btn ghost retry" onClick={load}>{t("home.retry")}</button>
          </div>
        )}

        {status === "ready" && results.length === 0 && (
          <div className="state-note">
            <div className="big">{t("watch.empty")}</div>
            <p>{t("watch.emptyDetail")}</p>
          </div>
        )}

        {status === "ready" && results.length > 0 && (
          <>
            {partial && <div className="watch-partial">{t("watch.partial")}</div>}
            {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- role="list" restores semantics WebKit drops with list-style:none */}
            <ul className="watch-grid" role="list">
              {results.map((v, i) => {
                const dur = formatDuration(v.durationSec, lang);
                return (
                  <li key={v.url}>
                    <a
                      className="watch-card"
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ animationDelay: `${Math.min(i * 0.03, 0.4)}s` }}
                    >
                      <div className="watch-thumb">
                        {v.thumbnailUrl
                          ? <img src={v.thumbnailUrl} alt="" loading="lazy" />
                          : <div className="watch-thumb-blank" aria-hidden="true" />}
                        <span className="watch-badge">{t(`watch.source.${v.source}`)}</span>
                        {dur && <span className="watch-dur">{dur}</span>}
                      </div>
                      <span className="watch-card-title">{v.title}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
              <div className="watch-foot">
                  <span className="watch-foot__disclaimer">{t("watch.disclaimer")}</span>
              </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
