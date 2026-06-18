import { useEffect, useRef } from "react";
import { mountAurora } from "../lib/aurora";
import { useTheme } from "../theme/ThemeContext";

// Fixed full-viewport mono aurora behind the whole page. Pointer events come
// from the window so the field stays interactive under the content. A scrim
// gradient on top keeps the catalogue readable over the smoke.
export function AuroraBackground() {
  const canvasRef = useRef(null);
  const handleRef = useRef(null);
  const { theme } = useTheme();
  const light = theme === "light"; // light theme = negative (dark smoke on white)

  // Mount once; the handle is steered via setOptions on theme change.
  useEffect(() => {
    if (!canvasRef.current) return;
    handleRef.current = mountAurora(canvasRef.current, {
      invert: theme === "light",
      eventTarget: window,
    });
    return () => handleRef.current && handleRef.current.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleRef.current && handleRef.current.setOptions({ invert: light });
  }, [light]);

  return (
    <div className={"aurora-bg " + (light ? "is-light" : "is-dark")} aria-hidden="true">
      <canvas ref={canvasRef} className="aurora-bg-canvas" />
      <div className="aurora-bg-scrim" />
    </div>
  );
}
