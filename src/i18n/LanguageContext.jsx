import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { STRINGS } from "./strings";

const LanguageContext = createContext(null);

const SUPPORTED = ["en", "ru"];

// Initial language: saved choice → browser preference → English.
function detectInitial() {
  try {
    const saved = localStorage.getItem("lang");
    if (SUPPORTED.includes(saved)) return saved;
  } catch {
    /* localStorage unavailable (private mode, etc.) — fall through */
  }
  const nav =
    (typeof navigator !== "undefined" && navigator.language) || "en";
  return nav.toLowerCase().startsWith("ru") ? "ru" : "en";
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectInitial);

  const setLang = useCallback((next) => {
    if (SUPPORTED.includes(next)) setLangState(next);
  }, []);

  // Persist the choice and keep <html lang> in sync for a11y / SEO.
  useEffect(() => {
    try {
      localStorage.setItem("lang", lang);
    } catch {
      /* ignore persistence errors */
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  // t(key, ...args): resolve from current language, fall back to English,
  // then to the key. Function values are called with the supplied args.
  const t = useCallback(
    (key, ...args) => {
      const table = STRINGS[lang] || STRINGS.en;
      let v = table[key];
      if (v == null) v = STRINGS.en[key];
      if (v == null) return key;
      return typeof v === "function" ? v(...args) : v;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within a LanguageProvider");
  return ctx;
}

export function useT() {
  return useLang().t;
}
