import { useTheme } from "../theme/ThemeContext";
import { useT } from "../i18n/LanguageContext";

// Two-state light/dark switch for the header. A single control that pins the
// opposite of the current theme (system preference is the untouched default).
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const t = useT();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      role="switch"
      aria-checked={dark}
      aria-label={dark ? t("theme.toLight") : t("theme.toDark")}
      title={dark ? t("theme.toLight") : t("theme.toDark")}
    >
      <span className="tt-track">
        <span className="tt-thumb" aria-hidden="true">
          {dark ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="4.2" />
              <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.1 5.1l1.5 1.5M17.4 17.4l1.5 1.5M18.9 5.1l-1.5 1.5M6.6 17.4l-1.5 1.5" />
            </svg>
          )}
        </span>
      </span>
    </button>
  );
}
