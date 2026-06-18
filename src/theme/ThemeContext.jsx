import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";

const ThemeContext = createContext(null);

const THEMES = ["light", "dark"];

function savedTheme() {
  try {
    const saved = localStorage.getItem("theme");
    if (THEMES.includes(saved)) return saved;
  } catch {
    /* localStorage unavailable (private mode, etc.) */
  }
  return null;
}

function systemTheme() {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

// Initial theme: saved choice → system preference → light. The inline boot
// script in public/index.html applies the matching class to <html> before
// first paint (FOUC guard); this just mirrors that decision in React state.
function detectInitial() {
  return savedTheme() || systemTheme();
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(detectInitial);
  // Whether the user has explicitly pinned a theme. Until they do, we follow
  // the OS preference; once pinned we persist it and stop following the OS.
  const pinned = useRef(savedTheme() != null);

  const pin = useCallback((next) => {
    pinned.current = true;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* ignore persistence errors */
    }
  }, []);

  const setTheme = useCallback(
    (next) => {
      if (!THEMES.includes(next)) return;
      pin(next);
      setThemeState(next);
    },
    [pin]
  );
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      pin(next);
      return next;
    });
  }, [pin]);

  // Drive theming from a single class on <html>: CSS variables, native UI
  // (via the color-scheme meta) and the document background all follow it.
  useEffect(() => {
    document.documentElement.classList.toggle("theme-dark", theme === "dark");
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.setAttribute("content", theme);
  }, [theme]);

  // Follow the OS preference until the user pins a choice.
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => {
      if (!pinned.current) setThemeState(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
