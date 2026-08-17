/**
 * Deep-field starscape with pointer-driven angle shift.
 *
 * Depth layers translate AND rotate by different amounts, so moving the
 * pointer swings the field's apparent angle rather than just sliding it.
 *
 * Constraints held here:
 *  - prefers-reduced-motion  -> one static frame, no rAF, no listeners
 *  - coarse pointer (touch)  -> slow autonomous drift only, never hover-gated
 *  - hidden tab              -> loop suspended
 *  - DPR capped at 2         -> keeps fill cost sane on retina
 */

const LAYERS = [
  { count: 0.45, depth: 0.15, size: [0.4, 0.9], alpha: [0.18, 0.4] },
  { count: 0.35, depth: 0.38, size: [0.6, 1.3], alpha: [0.3, 0.62] },
  { count: 0.16, depth: 0.7, size: [0.9, 1.8], alpha: [0.45, 0.85] },
  { count: 0.04, depth: 1.0, size: [1.4, 2.6], alpha: [0.7, 1.0] },
];

// Cool dust with one faint ember — amber stays scarce so it still reads as
// an accent in the UI rather than wallpaper.
const CLOUDS = [
  { x: 0.18, y: 0.22, r: 0.42, c: [90, 110, 170], a: 0.05 },
  { x: 0.82, y: 0.12, r: 0.36, c: [140, 120, 200], a: 0.035 },
  { x: 0.68, y: 0.78, r: 0.5, c: [194, 112, 58], a: 0.03 },
];

export function initField(canvas) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarse = window.matchMedia("(hover: none)");
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  let w = 0;
  let h = 0;
  let dpr = 1;
  let stars = [];
  let raf = 0;
  let t = 0;

  // pointer target vs. eased current — the lag is what makes it feel weighted
  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;

  function build() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, rect.width);
    h = Math.max(1, rect.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Density scales with area but hard-caps so a 4K monitor doesn't melt.
    const total = Math.min(340, Math.round((w * h) / 5200));
    stars = [];
    for (const layer of LAYERS) {
      const n = Math.round(total * layer.count);
      for (let i = 0; i < n; i += 1) {
        stars.push({
          // unit space [0,1); mapped out to [-0.1, 1.1] at draw time so the
          // parallax offset can never expose a bare edge
          x: Math.random(),
          y: Math.random(),
          d: layer.depth,
          s: layer.size[0] + Math.random() * (layer.size[1] - layer.size[0]),
          a: layer.alpha[0] + Math.random() * (layer.alpha[1] - layer.alpha[0]),
          // per-star twinkle phase, so they don't pulse in unison
          p: Math.random() * Math.PI * 2,
          tw: 0.4 + Math.random() * 0.9,
        });
      }
    }
  }

  function drawClouds() {
    for (const cloud of CLOUDS) {
      const px = cloud.x * w + cx * 26;
      const py = cloud.y * h + cy * 26;
      const r = cloud.r * Math.max(w, h);
      const g = ctx.createRadialGradient(px, py, 0, px, py, r);
      const [cr, cg, cb] = cloud.c;
      g.addColorStop(0, `rgba(${cr},${cg},${cb},${cloud.a})`);
      g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
  }

  function draw(animate) {
    ctx.clearRect(0, 0, w, h);
    drawClouds();

    // Angle swing: ~1.4deg at full pointer displacement.
    const angle = cx * 0.024;
    const drift = animate ? t * 0.00002 : 0;

    for (const star of stars) {
      const depth = star.d;
      // Layer offset — nearer layers move further, which is the parallax.
      const ox = cx * depth * 52;
      const oy = cy * depth * 52;

      // Positive modulo: JS % keeps the sign, which would leave a widening
      // empty band at the top as drift accumulates.
      const yw = (((star.y + drift * depth) % 1) + 1) % 1;

      let sx = (star.x * 1.2 - 0.1) * w + ox;
      let sy = (yw * 1.2 - 0.1) * h + oy;

      // Rotate about centre so the whole field tilts, not just slides.
      const rx = sx - w / 2;
      const ry = sy - h / 2;
      const ca = Math.cos(angle * depth);
      const sa = Math.sin(angle * depth);
      sx = w / 2 + rx * ca - ry * sa;
      sy = h / 2 + rx * sa + ry * ca;

      if (sx < -8 || sx > w + 8 || sy < -8 || sy > h + 8) continue;

      const twinkle = animate ? 0.78 + Math.sin(t * 0.0011 * star.tw + star.p) * 0.22 : 1;
      const alpha = star.a * twinkle;

      if (star.s > 1.5) {
        // The few brightest get a real glow; the rest stay cheap rects.
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, star.s * 4);
        g.addColorStop(0, `rgba(255,246,232,${alpha})`);
        g.addColorStop(1, "rgba(255,246,232,0)");
        ctx.fillStyle = g;
        ctx.fillRect(sx - star.s * 4, sy - star.s * 4, star.s * 8, star.s * 8);
      } else {
        ctx.fillStyle = `rgba(233,232,228,${alpha})`;
        ctx.fillRect(sx, sy, star.s, star.s);
      }
    }
  }

  function frame(now) {
    t = now;
    // Ease toward the pointer target; 0.045 gives weight without lag-feel.
    cx += (tx - cx) * 0.045;
    cy += (ty - cy) * 0.045;
    draw(true);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (raf || reduce.matches) return;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  }

  function onPointer(e) {
    // -1..1 from centre
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = (e.clientY / window.innerHeight) * 2 - 1;
    // Publish for CSS consumers (hero parallax) — --parallax is 0 under
    // reduced motion, so those consumers flatten automatically.
    const root = document.documentElement;
    root.style.setProperty("--pointer-x", tx.toFixed(4));
    root.style.setProperty("--pointer-y", ty.toFixed(4));
  }

  let resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      build();
      draw(!reduce.matches);
    }, 150);
  }

  function apply() {
    stop();
    build();

    if (reduce.matches) {
      // Static single frame. No loop, no pointer coupling.
      draw(false);
      return;
    }

    // Touch devices get the drift + twinkle, never a hover dependency.
    if (!coarse.matches) {
      window.addEventListener("pointermove", onPointer, { passive: true });
    } else {
      window.removeEventListener("pointermove", onPointer);
      tx = 0;
      ty = 0;
    }
    start();
  }

  window.addEventListener("resize", onResize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (!reduce.matches) start();
  });

  // Respond live if the user flips either preference.
  reduce.addEventListener("change", apply);
  coarse.addEventListener("change", apply);

  apply();
}
