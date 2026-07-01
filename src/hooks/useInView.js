import { useState, useEffect, useRef } from "react";

// Fires once when the element first scrolls into the viewport, then
// disconnects — the reveal plays exactly once, right when it comes on
// screen, not on mount. Respects prefers-reduced-motion by skipping straight
// to "visible".
export function useInView(rootMargin = "0px 0px -10% 0px") {
  const reduced = typeof window !== "undefined"
      && window.matchMedia
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ref = useRef(null);
  const [inView, setInView] = useState(reduced);

  useEffect(() => {
    if (reduced || inView) return;

    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
        setInView(true);
        return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin }
    );

    io.observe(el);
    return () => io.disconnect();

    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberately mount-only: this reveal fires once, re-running on rootMargin change would re-observe an already-visible element.
  }, []);

  return [ref, inView];
}
