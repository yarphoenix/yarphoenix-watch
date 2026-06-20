/* =============================================================================
   Aurora Field — interactive WebGL shader background (MONO palette only).

   Domain-warped FBM noise → soft black-&-white "smoke" that drifts over time,
   bends toward the pointer, and ripples on click. Vanilla WebGL, no deps.

   This is the trimmed, performance-tuned port of the design's `Aurora` module:
   only the monochrome palette is kept, and the render is optimised hard so a
   full-viewport animated background stays cheap:

     • mono-only fragment shader — no palette/ember branches, fewer uniforms;
     • backing store rendered at RENDER_SCALE of CSS pixels (smoke is soft, so
       the downscale is invisible) with a capped DPR;
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

const RENDER_SCALE = 0.62; // backing-store px per CSS px before DPR — soft field hides it
const MAX_DPR = 1.5;
const FPS_CAP = 32; // the field drifts at time*0.06, so ~32fps is imperceptibly smooth
const NOISE_N = 256; // value-noise tile size (power-of-two so the texture can REPEAT)

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
  uniform sampler2D u_noise;
  uniform vec2  u_res;
  uniform float u_time;
  uniform vec2  u_mouse;     // 0..1, y up
  uniform float u_mouseAmt;  // pointer presence 0..1
  uniform float u_intensity;
  uniform float u_invert;    // 0 = dark theme, 1 = negate (light theme)
  uniform vec3  u_click;     // xy = pos(0..1), z = age seconds (<0 = none)

  // Value noise sampled from the deterministic tile (REPEAT-wrapped). Hardware
  // bilinear filtering is identical on every GPU, so there's no float-precision
  // hash to band/trail on Android. 256 texels == 256 units, matching the old
  // lattice spacing of 1; +0.5 centres samples on texel centres.
  float noise(vec2 p){
    return texture2D(u_noise, (p + 0.5) / 256.0).r;
  }
  // 4-octave FBM (down from 6) — enough texture once the field is downscaled.
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for(int i = 0; i < 4; i++){
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

    // domain warping (fbm of fbm)
    vec2 q = vec2(fbm(st * 2.2 + vec2(0.0, t)),
                  fbm(st * 2.2 + vec2(5.2, -t) + warpBias));
    vec2 r = vec2(fbm(st * 2.2 + 1.7 * q + vec2(1.7, 9.2) + t * 0.5),
                  fbm(st * 2.2 + 1.7 * q + vec2(8.3, 2.8) - t * 0.4));
    float f = fbm(st * 2.2 + 2.4 * r + warpBias);
    f = clamp(f * 1.15, 0.0, 1.0);

    // monochrome — black & white smoke
    float g = pow(f, 1.25);
    vec3 col = vec3(0.015) + vec3(1.0) * g * 0.92;
    col += vec3(0.9) * pow(smoothstep(0.78, 1.0, f), 2.0) * 0.5;

    // soft light following the cursor
    float glow = u_mouseAmt * (0.12 / (md * md + 0.04));
    col += vec3(0.6) * glow * 0.18;

    // click ripple
    if (u_click.z >= 0.0) {
      vec2 cp = u_click.xy; cp.x *= aspect;
      float d = length(st - cp);
      float age = u_click.z;
      float radius = age * 0.9;
      float ring = smoothstep(0.06, 0.0, abs(d - radius));
      float fade = exp(-age * 2.2);
      col += vec3(0.7, 0.8, 1.0) * ring * fade * 0.6;
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
      click: gl.getUniformLocation(prog, "u_click"),
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
    click: [0, 0, -1],
    clickStart: -1,
  };

  const scale = Math.min(window.devicePixelRatio || 1, MAX_DPR) * RENDER_SCALE;
  function resize() {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(r.width * scale));
    const h = Math.max(1, Math.floor(r.height * scale));
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
    const age = state.clickStart >= 0 ? (tMs - state.clickStart) / 1000 : -1;
    gl.uniform3f(U.click, state.click[0], state.click[1], age > 2.4 ? -1 : age);

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
    state.click = [p[0], p[1], 0];
    state.clickStart = performance.now() - t0;
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

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (now - last < minFrame) return; // throttle to FPS_CAP
    last = now;
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
