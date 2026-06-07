const SearchIcon = ({ s = 26 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="11" cy="11" r="7" />
    <line x1="16.2" y1="16.2" x2="21" y2="21" strokeLinecap="round" />
  </svg>
);

export function SearchControls({ query, setQuery, filter, setFilter, count }) {
  const FILTERS = [["all", "All"], ["movie", "Films"], ["series", "Series"]];
  return (
    <div className="searchwrap">
      <div className="searchbar">
        <SearchIcon />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the catalogue…"
          autoFocus
        />
        {query && <button className="clear" onClick={() => setQuery("")}>clear ✕</button>}
      </div>
      <div className="controls">
        <div className="filters">
          {FILTERS.map(([val, label]) => (
            <button
              key={val}
              className="chip"
              aria-pressed={filter === val}
              onClick={() => setFilter(val)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="count">{count} {count === 1 ? "title" : "titles"}</span>
      </div>
    </div>
  );
}
