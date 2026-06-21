/* =============================================================================
   Aurora Field — interactive WebGL shader background (MONO palette only).

   Domain-warped FBM noise → soft black-&-white "smoke" that drifts over time,
   bends toward the pointer, and ripples on click. Vanilla WebGL, no deps.

   This is the trimmed, performance-tuned port of the design's `Aurora` module:
   only the monochrome palette is kept, and the render is optimised hard so a
   full-viewport animated background stays cheap:

     • mono-only fragment shader — no palette/ember branches, fewer uniforms;
     • backing store rendered at an ADAPTIVE fraction of CSS pixels — a hardware
       heuristic picks the start, then it's nudged by measured frame time (down
       when frames slip, cautiously up when there's headroom); the field is soft
       so the small, infrequent changes are invisible. DPR is capped on top;
     • FBM reduced to 4 octaves;
     • frame loop throttled to ~FPS_CAP and paused while the tab is hidden;
     • prefers-reduced-motion → one static frame, no loop, no pointer reactivity.

   Usage:
     const handle = mountAurora(canvas, { invert: false, eventTarget: window });
     handle.setOptions({ invert: true });   // light theme = negative (dark smoke)
     handle.destroy();
   `invert` negates the final colour: 0 = light smoke on black (dark theme),
   1 = dark smoke on white (light theme).
============================================================================= */

const RENDER_SCALE = 0.62; // medium-tier starting scale; the adaptive loop moves it within [SCALE_MIN, SCALE_MAX]
const SCALE_MIN = 0.4;     // weakest-hardware floor
const SCALE_MAX = 1.0;     // strongest-hardware ceiling (multiplied by the capped DPR)
const SCALE_STEP = 0.05;   // per-adjustment change — small enough to be imperceptible on the soft field
const MAX_DPR = 1.5;
const FPS_CAP = 32; // the field drifts at time*0.06, so ~32fps is imperceptibly smooth
const NOISE_N = 256; // value-noise tile size (power-of-two so the texture can REPEAT)
const MAX_RIPPLES = 8; // click ripples that can be on screen at once (older ones recycle)

// Deterministic 256×256 white-noise tile (seeded xorshift32). Baking the noise
// into a texture — instead of a float hash in the shader — makes the field
// render identically on every GPU: hardware bilinear sampling is uniform across
// Mali/Adreno/Apple/desktop, where the old `fract(p.x*p.y)` hash banded and
// "trailed" on Android's limited fragment-shader float precision. Seeded (not
// Math.random) so every device bakes the same bytes → the same field.
const NOISE_DATA = (() => {
  const d = new Uint8Array(NOISE_N * NOISE_N);
  let s = 0x9e3779b9 >>> 0;
  for (let i = 0; i < d.length; i++) {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    d[i] = s & 0xff;
  }
  return d;
})();

const VERT = `
  attribute vec2 p;
  void main(){ gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif
  #define MAX_RIPPLES ${MAX_RIPPLES}
  uniform sampler2D u_noise;
  uniform vec2  u_res;
  uniform float u_time;
  uniform vec2  u_mouse;     // 0..1, y up
  uniform float u_mouseAmt;  // pointer presence 0..1
  uniform float u_intensity;
  uniform float u_invert;    // 0 = dark theme, 1 = negate (light theme)
  uniform vec3  u_clicks[MAX_RIPPLES]; // each: xy = pos(0..1), z = age seconds (<0 = inactive)

  // Value noise sampled from the deterministic tile (REPEAT-wrapped). Hardware
  // bilinear filtering is identical on every GPU, so there's no float-precision
  // hash to band/trail on Android. 256 texels == 256 units, matching the old
  // lattice spacing of 1; +0.5 centres samples on texel centres.
  float noise(vec2 p){
    return texture2D(u_noise, (p + 0.5) / 256.0).r;
  }
  // 6-octave FBM — more layers of fine structure (the adaptive scale keeps it cheap).
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for(int i = 0; i < 6; i++){
      v += a * noise(p);
      p = rot * p * 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main(){
    vec2 uv = gl_FragCoord.xy / u_res.xy;
    float aspect = u_res.x / u_res.y;
    vec2 st = uv;
    st.x *= aspect;

    float t = u_time * 0.06;

    // pointer pulls the field toward the cursor
    vec2 m = u_mouse; m.x *= aspect;
    vec2 toM = m - st;
    float md = length(toM);
    vec2 warpBias = toM * u_mouseAmt * 0.25 / (md + 0.35);

    // domain warping (fbm of fbm) — stronger warp = more pronounced, layered wisps
    vec2 q = vec2(fbm(st * 2.4 + vec2(0.0, t)),
                  fbm(st * 2.4 + vec2(5.2, -t) + warpBias));
    vec2 r = vec2(fbm(st * 2.4 + 1.9 * q + vec2(1.7, 9.2) + t * 0.5),
                  fbm(st * 2.4 + 1.9 * q + vec2(8.3, 2.8) - t * 0.4));
    float f = fbm(st * 2.4 + 2.9 * r + warpBias);
    f = clamp(f * 1.15, 0.0, 1.0);

    // monochrome — black & white smoke
    float g = pow(f, 1.25);
    vec3 col = vec3(0.015) + vec3(1.0) * g * 0.92;
    col += vec3(0.9) * pow(smoothstep(0.78, 1.0, f), 2.0) * 0.5;

    // soft light following the cursor
    float glow = u_mouseAmt * (0.12 / (md * md + 0.04));
    col += vec3(0.6) * glow * 0.18;

    // click ripples — several can coexist on screen at once
    for (int i = 0; i < MAX_RIPPLES; i++) {
      vec3 c = u_clicks[i];
      if (c.z >= 0.0) {
        vec2 cp = c.xy; cp.x *= aspect;
        float d = length(st - cp);
        float age = c.z;
        float radius = age * 0.9;
        float ring = smoothstep(0.06, 0.0, abs(d - radius));
        float fade = exp(-age * 2.2);
        col += vec3(0.7, 0.8, 1.0) * ring * fade * 0.6;
      }
    }

    col *= 0.85 + 0.4 * u_intensity;
    // gentle vignette
    vec2 vd = uv - 0.5;
    col *= 1.0 - dot(vd, vd) * 0.55;

    col = pow(col, vec3(0.92)); // mild lift
    // branchless negative for the light theme
    col = mix(col, vec3(1.0) - col, u_invert);
    gl_FragColor = vec4(col, 1.0);
  }
`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("Aurora shader error:", gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

const NOOP = { setOptions() {}, destroy() {} };

// Mount the field on `canvas`. Returns a handle; never throws — if WebGL is
// unavailable it returns a no-op so the CSS fallback shows instead.
export function mountAurora(canvas, opts = {}) {
  const gl = canvas.getContext("webgl", {
    antialias: false,
    alpha: false,
    premultipliedAlpha: false,
    powerPreference: "low-power",
  });
  if (!gl) {
    console.warn("Aurora: WebGL unavailable — falling back to CSS background");
    return NOOP;
  }

  // Build the program + geometry + uniform map. Re-runnable so the field can
  // recover if the GPU drops the context (webglcontextrestored).
  let U = null;
  function setupGL() {
    const prog = gl.createProgram();
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return false; // context lost at creation, or shader error
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const pLoc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(pLoc);
    gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, 0, 0);

    U = {
      res: gl.getUniformLocation(prog, "u_res"),
      time: gl.getUniformLocation(prog, "u_time"),
      mouse: gl.getUniformLocation(prog, "u_mouse"),
      mouseAmt: gl.getUniformLocation(prog, "u_mouseAmt"),
      intensity: gl.getUniformLocation(prog, "u_intensity"),
      invert: gl.getUniformLocation(prog, "u_invert"),
      clicks: gl.getUniformLocation(prog, "u_clicks[0]"),
    };

    // Upload the baked noise tile to unit 0 (POT + REPEAT so the warped domain
    // can wrap freely; LINEAR so sampling smooths between texels).
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, NOISE_N, NOISE_N, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, NOISE_DATA);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(gl.getUniformLocation(prog, "u_noise"), 0);
    return true;
  }
  // If the very first setup fails (no WebGL / lost context), degrade to the
  // CSS gradient fallback rather than animating nothing.
  if (!setupGL()) return NOOP;

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    invert: opts.invert ? 1 : 0,
    intensity: opts.intensity ?? 1,
    mouse: [0.5, 0.5],
    mouseTarget: [0.5, 0.5],
    mouseAmt: 0,
    mouseAmtTarget: 0,
    // Ring buffer of ripples so new clicks don't replace ones still on screen;
    // start = ms since mount (<0 = free slot). Oldest is recycled only when all
    // MAX_RIPPLES are still alive.
    ripples: Array.from({ length: MAX_RIPPLES }, () => ({ x: 0, y: 0, start: -1 })),
    rippleIdx: 0,
  };
  // Reused each frame to upload the ripple array (vec3 × MAX_RIPPLES).
  const clicksBuf = new Float32Array(MAX_RIPPLES * 3);

  // Adaptive render scale: start from a hardware heuristic, then let the frame
  // loop nudge it (see adaptScale). Steps are tiny and the field is soft + behind
  // a scrim, so resolution changes are imperceptible; the pattern is uv-normalised
  // so resizing never shifts it.
  let renderScale = (() => {
    const cores = navigator.hardwareConcurrency || 4;
    const mem = navigator.deviceMemory || 4;
    const mobile = (navigator.maxTouchPoints || 0) > 1 && (window.devicePixelRatio || 1) >= 2;
    let s = RENDER_SCALE;
    if (mobile || cores <= 4 || mem <= 4) s = 0.5;
    if (!mobile && cores >= 8 && mem >= 8) s = 0.78;
    try {
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      const r = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || "") : "";
      if (/Mali-[T34]|Adreno [234]|PowerVR/i.test(r)) s = Math.min(s, 0.42);
      else if (/Apple|NVIDIA|GeForce|RTX|GTX|Radeon|AMD/i.test(r) && !mobile) s = Math.max(s, 0.85);
    } catch (e) { /* renderer info unavailable / masked */ }
    return Math.max(SCALE_MIN, Math.min(SCALE_MAX, s));
  })();

  function resize() {
    const r = canvas.getBoundingClientRect();
    const eff = Math.min(window.devicePixelRatio || 1, MAX_DPR) * renderScale;
    const w = Math.max(1, Math.floor(r.width * eff));
    const h = Math.max(1, Math.floor(r.height * eff));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    return [cx / r.width, 1 - cy / r.height];
  }

  // Single draw at the given timestamp (ms since mount).
  function draw(tMs) {
    for (let i = 0; i < 2; i++) state.mouse[i] += (state.mouseTarget[i] - state.mouse[i]) * 0.08;
    state.mouseAmt += (state.mouseAmtTarget - state.mouseAmt) * 0.06;

    gl.uniform2f(U.res, canvas.width, canvas.height);
    gl.uniform1f(U.time, tMs / 1000);
    gl.uniform2f(U.mouse, state.mouse[0], state.mouse[1]);
    gl.uniform1f(U.mouseAmt, state.mouseAmt);
    gl.uniform1f(U.intensity, state.intensity);
    gl.uniform1f(U.invert, state.invert);

    // Pack the live ripples; each lasts ~2.4s, then its slot frees up (age = -1).
    for (let i = 0; i < MAX_RIPPLES; i++) {
      const rip = state.ripples[i];
      let age = -1;
      if (rip.start >= 0) {
        age = (tMs - rip.start) / 1000;
        if (age > 2.4) { rip.start = -1; age = -1; }
      }
      clicksBuf[i * 3] = rip.x;
      clicksBuf[i * 3 + 1] = rip.y;
      clicksBuf[i * 3 + 2] = age;
    }
    gl.uniform3fv(U.clicks, clicksBuf);

    // Clear first: on tile-based mobile GPUs this discards the previous tile
    // contents (a cheap "fast clear") instead of reloading them, avoiding the
    // ghosting/"trails" some Android drivers show without it.
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  const t0 = performance.now();
  resize();
  draw(0); // one synchronous frame so the buffer is never blank

  // ---- prefers-reduced-motion: one static frame, no loop, no listeners ----
  if (reduceMotion) {
    const onResizeStatic = () => {
      resize();
      draw(8000); // re-render the same frozen frame at the new size
    };
    window.addEventListener("resize", onResizeStatic);
    return {
      setOptions(o = {}) {
        if (o.invert != null) state.invert = o.invert ? 1 : 0;
        if (o.intensity != null) state.intensity = o.intensity;
        draw(8000);
      },
      destroy() {
        window.removeEventListener("resize", onResizeStatic);
        // See the animated destroy(): don't force-lose the shared canvas context.
      },
    };
  }

  // ---- animated path -----------------------------------------------------
  // Pointer comes from a separate target (usually window) so the field stays
  // interactive while the canvas sits behind content with pointer-events:none.
  const target = opts.eventTarget || canvas;
  const onMove = (e) => { state.mouseTarget = pos(e); state.mouseAmtTarget = 1; };
  const onLeave = () => { state.mouseAmtTarget = 0; };
  const onDown = (e) => {
    const p = pos(e);
    const rip = state.ripples[state.rippleIdx];
    rip.x = p[0];
    rip.y = p[1];
    rip.start = performance.now() - t0;
    state.rippleIdx = (state.rippleIdx + 1) % MAX_RIPPLES;
    state.mouseTarget = p;
    state.mouseAmtTarget = 1;
  };
  target.addEventListener("mousemove", onMove);
  target.addEventListener("mouseleave", onLeave);
  target.addEventListener("mousedown", onDown);
  target.addEventListener("touchstart", onDown, { passive: true });
  target.addEventListener("touchmove", onMove, { passive: true });
  window.addEventListener("resize", resize);

  const minFrame = 1000 / FPS_CAP;
  let raf = 0;
  let running = true;
  let last = -Infinity;

  // Adaptive scaling: avgDelta is an EMA of the realised draw-to-draw interval.
  // Pinned near minFrame when the device keeps up with the cap; it climbs when
  // the GPU can't sustain the current scale. scaleCap remembers the level that
  // once struggled so we never oscillate back up into it.
  let avgDelta = minFrame;
  let drawnFrames = 0;
  let lastAdjust = 0;
  let lastDownscale = -Infinity;
  let scaleCap = SCALE_MAX;

  function adaptScale(now) {
    if (drawnFrames < 60) return; // ~2s warm-up before trusting the measurement
    if (avgDelta > minFrame * 1.45 && renderScale > SCALE_MIN && now - lastAdjust > 1200) {
      // frames slipping below the cap → drop a notch (responsive)
      renderScale = Math.max(SCALE_MIN, renderScale - SCALE_STEP);
      scaleCap = renderScale; // this level struggled — don't climb back above it
      lastAdjust = now;
      lastDownscale = now;
    } else if (avgDelta < minFrame * 1.12 && renderScale + SCALE_STEP <= scaleCap + 1e-6 &&
               renderScale < SCALE_MAX && now - lastAdjust > 3000 && now - lastDownscale > 6000) {
      // pinned to the cap and stable for a while → cautiously sharpen
      renderScale = Math.min(SCALE_MAX, renderScale + SCALE_STEP);
      lastAdjust = now;
    }
  }

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const delta = now - last;
    if (delta < minFrame) return; // throttle to FPS_CAP
    last = now;
    // Feed the EMA only across continuous frames; a resume/first-frame gap resets
    // the warm-up so it can't trigger a spurious adjustment.
    if (delta < 500) { avgDelta += (delta - avgDelta) * 0.1; drawnFrames++; }
    else { avgDelta = minFrame; drawnFrames = 0; }
    adaptScale(now);
    resize();
    draw(now - t0);
  }
  raf = requestAnimationFrame(frame);

  // Stop the loop entirely while the tab is hidden (saves battery beyond the
  // browser's own rAF throttling), resume cleanly when it returns.
  function onVisibility() {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (!running) {
      running = true;
      last = -Infinity;
      raf = requestAnimationFrame(frame);
    }
  }
  document.addEventListener("visibilitychange", onVisibility);

  // Recover from a dropped GPU context (driver reset, long backgrounding, the
  // browser reclaiming contexts under pressure). Without preventDefault the
  // context can never be restored.
  function onCtxLost(e) {
    e.preventDefault();
    running = false;
    cancelAnimationFrame(raf);
  }
  function onCtxRestored() {
    if (!setupGL()) return; // genuine failure — leave the CSS fallback showing
    resize();
    if (!document.hidden) {
      running = true;
      last = -Infinity;
      raf = requestAnimationFrame(frame);
    }
  }
  canvas.addEventListener("webglcontextlost", onCtxLost, false);
  canvas.addEventListener("webglcontextrestored", onCtxRestored, false);

  return {
    setOptions(o = {}) {
      if (o.invert != null) state.invert = o.invert ? 1 : 0;
      if (o.intensity != null) state.intensity = o.intensity;
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onCtxLost);
      canvas.removeEventListener("webglcontextrestored", onCtxRestored);
      target.removeEventListener("mousemove", onMove);
      target.removeEventListener("mouseleave", onLeave);
      target.removeEventListener("mousedown", onDown);
      target.removeEventListener("touchstart", onDown);
      target.removeEventListener("touchmove", onMove);
      window.removeEventListener("resize", resize);
      // Deliberately do NOT force-lose the context: a canvas only ever owns one
      // context, and in React 18 StrictMode the mount effect runs
      // mount→cleanup→mount on the SAME canvas — losing it on cleanup would
      // hand the remount a dead context. The browser reclaims it on GC when the
      // canvas leaves the DOM.
    },
  };
}
