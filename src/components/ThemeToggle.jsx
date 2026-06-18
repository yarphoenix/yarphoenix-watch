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
        <span className="tt-thumb" aria-hidden="true">{dark ? "◐" : "◑"}</span>
      </span>
    </button>
  );
}
