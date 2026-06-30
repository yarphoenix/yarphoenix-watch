import { useT } from "../i18n/LanguageContext";

const SearchIcon = ({ s = 26 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" focusable="false">
    <circle cx="11" cy="11" r="7" />
    <line x1="16.2" y1="16.2" x2="21" y2="21" strokeLinecap="round" />
  </svg>
);

export function SearchControls({ query, setQuery, filter, setFilter, count }) {
  const t = useT();
  const FILTERS = [
    ["all", t("filters.all")],
    ["movie", t("filters.films")],
    ["series", t("filters.series")],
    ["anime", t("filters.anime")],
  ];
  return (
    <search className="searchwrap">
      <div className="searchbar">
        <SearchIcon />
        <label htmlFor="catalogue-search" className="visually-hidden">{t("search.label")}</label>
        <input
          id="catalogue-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder")}
        />
        {query && <button type="button" className="clear" onClick={() => setQuery("")}>{t("search.clear")}</button>}
      </div>
      <div className="controls">
        <div className="filters" role="group" aria-label={t("search.filterGroupAria")}>
          {FILTERS.map(([val, label]) => (
            <button
              key={val}
              type="button"
              className="chip"
              aria-pressed={filter === val}
              onClick={() => setFilter(val)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="count" aria-live="polite">{t("search.count", count)}</span>
      </div>
    </search>
  );
}
