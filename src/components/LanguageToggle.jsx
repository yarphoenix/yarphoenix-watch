import { useLang } from "../i18n/LanguageContext";

const LANGS = [
  ["en", "EN"],
  ["ru", "RU"],
];

// Compact EN | RU segmented control for the header.
export function LanguageToggle() {
  const { lang, setLang, t } = useLang();
  return (
    <div className="lang-toggle" role="group" aria-label={t("lang.groupAria")}>
      {LANGS.map(([code, label]) => (
        <button
          key={code}
          type="button"
          className="lang-btn"
          aria-pressed={lang === code}
          aria-label={label}
          onClick={() => setLang(code)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
