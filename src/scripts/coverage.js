/**
 * SwathKeeper — coverage path planning demo.
 *
 * Runs the actual planner rather than animating a canned route:
 *  1. Obstacles rasterize into a blocked grid.
 *  2. Each column splits into contiguous free runs (boustrophedon cells),
 *     traversed in alternating direction.
 *  3. Consecutive runs are joined by A* over free cells, so transits route
 *     AROUND obstacles instead of clipping through them.
 *  4. The drone sweeps the route, revealing a per-cell NDVI heatmap.
 *
 * Drag an obstacle and the route re-plans from scratch.
 */

const COLS_WIDE = 34;
const COLS_NARROW = 18;

export function initCoverage(root) {
  const canvas = root.querySelector("canvas");
  const readout = root.querySelector("[data-readout]");
  const replayBtn = root.querySelector("[data-replay]");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  let cols = COLS_WIDE;
  let rows = 18;
  let cell = 16;
  let w = 0;
  let h = 0;

  // Obstacles in normalized field space so they survive resize.
  let obstacles = [
    { x: 0.28, y: 0.3, r: 0.12 },
    { x: 0.63, y: 0.62, r: 0.15 },
    { x: 0.82, y: 0.22, r: 0.09 },
  ];

  let blocked = [];
  let ndvi = [];
  let path = [];
  let progress = 0;
  let raf = 0;
  let dragging = null;

  // Smooth pseudo-NDVI field — deterministic, no noise library needed.
  function ndviAt(c, r) {
    const x = c / cols;
    const y = r / rows;
    const v =
      Math.sin(x * 5.2 + 1.1) * 0.5 +
      Math.sin(y * 4.1 - 0.6) * 0.3 +
      Math.sin((x + y) * 6.7) * 0.2;
    return Math.min(1, Math.max(0, (v + 1) / 2));
  }

  function layout() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, rect.width);
    h = Math.max(1, rect.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = w < 520 ? COLS_NARROW : COLS_WIDE;
    cell = w / cols;
    rows = Math.max(6, Math.floor(h / cell));
  }

  function rasterize() {
    blocked = [];
    ndvi = [];
    for (let c = 0; c < cols; c += 1) {
      blocked[c] = [];
      ndvi[c] = [];
      for (let r = 0; r < rows; r += 1) {
        const nx = (c + 0.5) / cols;
        const ny = (r + 0.5) / rows;
        let hit = false;
        for (const o of obstacles) {
          const dx = (nx - o.x) * (cols / rows); // keep circles round in cell space
          const dy = ny - o.y;
          if (Math.hypot(dx, dy) < o.r) {
            hit = true;
            break;
          }
        }
        blocked[c][r] = hit;
        ndvi[c][r] = ndviAt(c, r);
      }
    }
  }

  /** A* over free cells, 4-connected. Returns inclusive path or null. */
  function astar(start, goal) {
    if (!start || !goal) return null;
    const key = (c, r) => c * rows + r;
    const open = [{ c: start.c, r: start.r, f: 0 }];
    const gScore = new Map([[key(start.c, start.r), 0]]);
    const came = new Map();
    const seen = new Set();

    while (open.length) {
      // Small grid — a linear scan beats a heap here.
      let bi = 0;
      for (let i = 1; i < open.length; i += 1) if (open[i].f < open[bi].f) bi = i;
      const cur = open.splice(bi, 1)[0];
      const ck = key(cur.c, cur.r);

      if (cur.c === goal.c && cur.r === goal.r) {
        const out = [];
        let k = ck;
        let node = { c: cur.c, r: cur.r };
        while (true) {
          out.push(node);
          if (!came.has(k)) break;
          node = came.get(k);
          k = key(node.c, node.r);
        }
        return out.reverse();
      }

      if (seen.has(ck)) continue;
      seen.add(ck);

      const g = gScore.get(ck) ?? Infinity;
      const neighbours = [
        { c: cur.c + 1, r: cur.r },
        { c: cur.c - 1, r: cur.r },
        { c: cur.c, r: cur.r + 1 },
        { c: cur.c, r: cur.r - 1 },
      ];

      for (const n of neighbours) {
        if (n.c < 0 || n.r < 0 || n.c >= cols || n.r >= rows) continue;
        if (blocked[n.c][n.r]) continue;
        const nk = key(n.c, n.r);
        const tentative = g + 1;
        if (tentative >= (gScore.get(nk) ?? Infinity)) continue;
        gScore.set(nk, tentative);
        came.set(nk, { c: cur.c, r: cur.r });
        const hcost = Math.abs(n.c - goal.c) + Math.abs(n.r - goal.r);
        open.push({ c: n.c, r: n.r, f: tentative + hcost });
      }
    }
    return null;
  }

  function plan() {
    // Contiguous free runs per column = boustrophedon cells.
    const runs = [];
    for (let c = 0; c < cols; c += 1) {
      let run = null;
      for (let r = 0; r < rows; r += 1) {
        if (!blocked[c][r]) {
          if (!run) run = { c, from: r, to: r };
          else run.to = r;
        } else if (run) {
          runs.push(run);
          run = null;
        }
      }
      if (run) runs.push(run);
    }

    // Alternate sweep direction per column so turns stay at the field edge.
    const ordered = runs.map((run) => {
      const down = run.c % 2 === 0;
      const cells = [];
      if (down) for (let r = run.from; r <= run.to; r += 1) cells.push({ c: run.c, r });
      else for (let r = run.to; r >= run.from; r -= 1) cells.push({ c: run.c, r });
      return cells;
    });

    const full = [];
    let prevEnd = null;
    for (const cells of ordered) {
      if (!cells.length) continue;
      if (prevEnd) {
        const link = astar(prevEnd, cells[0]);
        // Skip the shared endpoint; drop unreachable pockets rather than
        // drawing a straight line through an obstacle.
        if (link) full.push(...link.slice(1, -1).map((p) => ({ ...p, transit: true })));
      }
      full.push(...cells);
      prevEnd = cells[cells.length - 1];
    }

    path = full;
  }

  function stats() {
    let free = 0;
    for (let c = 0; c < cols; c += 1) for (let r = 0; r < rows; r += 1) if (!blocked[c][r]) free += 1;
    const swept = path.filter((p) => !p.transit).length;
    let turns = 0;
    for (let i = 2; i < path.length; i += 1) {
      const a = path[i - 2];
      const b = path[i - 1];
      const c2 = path[i];
      if ((a.c === b.c) !== (b.c === c2.c)) turns += 1;
    }
    return { free, swept, turns, pct: free ? Math.round((swept / free) * 100) : 0 };
  }

  function paint() {
    ctx.clearRect(0, 0, w, h);
    const shown = Math.floor(progress);

    // Cells: unswept stay dark; swept reveal their NDVI value on a warm ramp.
    const sweptSet = new Set();
    for (let i = 0; i < shown && i < path.length; i += 1) {
      const p = path[i];
      if (!p.transit) sweptSet.add(p.c * rows + p.r);
    }

    for (let c = 0; c < cols; c += 1) {
      for (let r = 0; r < rows; r += 1) {
        const x = c * cell;
        const y = r * cell;
        if (blocked[c][r]) continue;
        if (sweptSet.has(c * rows + r)) {
          const v = ndvi[c][r];
          // Sequential single-hue ramp: copper (low) → amber (high).
          const rr = Math.round(150 + v * 105);
          const gg = Math.round(78 + v * 100);
          const bb = Math.round(42 + v * 35);
          ctx.fillStyle = `rgba(${rr},${gg},${bb},${0.18 + v * 0.34})`;
        } else {
          ctx.fillStyle = "rgba(255,255,255,0.022)";
        }
        ctx.fillRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
      }
    }

    // Dynamic obstacles the survey has to route around mid-flight.
    for (const o of obstacles) {
      const px = o.x * w;
      const py = o.y * h;
      const pr = o.r * h;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(11,11,15,0.82)";
      ctx.fill();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(194,112,58,0.85)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Route so far.
    if (shown > 1) {
      ctx.beginPath();
      for (let i = 0; i < shown && i < path.length; i += 1) {
        const p = path[i];
        const x = p.c * cell + cell / 2;
        const y = p.r * cell + cell / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(255,178,77,0.55)";
      ctx.lineWidth = 1.25;
      ctx.stroke();
    }

    // Drone head.
    const head = path[Math.min(shown, path.length - 1)];
    if (head) {
      const hx = head.c * cell + cell / 2;
      const hy = head.r * cell + cell / 2;
      const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 14);
      g.addColorStop(0, "rgba(255,206,138,0.95)");
      g.addColorStop(1, "rgba(255,206,138,0)");
      ctx.fillStyle = g;
      ctx.fillRect(hx - 14, hy - 14, 28, 28);
      ctx.beginPath();
      ctx.arc(hx, hy, 2.6, 0, Math.PI * 2);
      ctx.fillStyle = "#FFCE8A";
      ctx.fill();
    }
  }

  function updateReadout() {
    if (!readout) return;
    const s = stats();
    readout.querySelector("[data-cov]").textContent = `${s.pct}%`;
    readout.querySelector("[data-turns]").textContent = String(s.turns);
    readout.querySelector("[data-cells]").textContent = String(s.swept);
  }

  function tick() {
    if (progress < path.length) {
      progress += Math.max(1, path.length / 260);
      paint();
      raf = requestAnimationFrame(tick);
    } else {
      progress = path.length;
      paint();
      raf = 0;
    }
  }

  function run(animate = true) {
    cancelAnimationFrame(raf);
    raf = 0;
    rasterize();
    plan();
    updateReadout();
    progress = animate && !reduce.matches ? 0 : path.length;
    if (animate && !reduce.matches) raf = requestAnimationFrame(tick);
    else paint();
  }

  /* ---- interaction ---------------------------------------------------- */

  function pick(e) {
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    for (let i = obstacles.length - 1; i >= 0; i -= 1) {
      const o = obstacles[i];
      if (Math.hypot(nx - o.x, ny - o.y) < o.r + 0.02) return { i, nx, ny };
    }
    return null;
  }

  canvas.addEventListener("pointerdown", (e) => {
    const hit = pick(e);
    if (!hit) return;
    dragging = hit.i;
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = "grabbing";
    e.preventDefault(); // only once a drag starts, so page scroll still works
  });

  canvas.addEventListener("pointermove", (e) => {
    if (dragging === null) {
      canvas.style.cursor = pick(e) ? "grab" : "default";
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const o = obstacles[dragging];
    o.x = Math.min(0.94, Math.max(0.06, (e.clientX - rect.left) / rect.width));
    o.y = Math.min(0.94, Math.max(0.06, (e.clientY - rect.top) / rect.height));
    run(false); // re-plan live, no re-animation while dragging
  });

  const endDrag = () => {
    if (dragging === null) return;
    dragging = null;
    canvas.style.cursor = "default";
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  if (replayBtn) replayBtn.addEventListener("click", () => run(true));

  let rt = 0;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      layout();
      run(false);
    }, 160);
  });

  // Only start sweeping once it's actually on screen.
  layout();
  rasterize();
  plan();
  updateReadout();
  progress = path.length;
  paint();

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          run(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(canvas);
  }
}
