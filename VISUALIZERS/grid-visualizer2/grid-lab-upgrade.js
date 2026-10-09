/* =====================================================================
   GRID LAB UPGRADE — paste inside a new <script> tag AFTER your
   existing script (just before </body>), or save as a file and load it
   with <script src="grid-lab-upgrade.js"></script> after the main one.

   Core idea: stop guessing the grid from the CSS text. Apply the CSS
   to the real element and MEASURE what the browser actually built
   (getComputedStyle -> resolved track sizes). That makes auto-fit,
   auto-fill, minmax(), fr, named areas, implicit tracks,
   justify-content / align-content etc. all work automatically.
===================================================================== */
(() => {
  const $ = (id) => document.getElementById(id);

  const DEFAULT_RAW = {
    display: "grid",
    "grid-template-columns": "repeat(3, 1fr)",
    "grid-template-rows": "repeat(2, 1fr)",
    "column-gap": "16px",
    "row-gap": "16px",
  };
  const ALLOWED =
    /^(display|grid(-[a-z]+)*|(row-|column-)?gap|justify-[a-z]+|align-[a-z]+|place-[a-z]+|order|width|height|min-[a-z-]+|max-[a-z-]+|padding|margin|aspect-ratio)$/;
  const COLORS = [
    ["rgba(79,70,229,.25)", "#6366f1", "#c7d2fe"],
    ["rgba(124,58,237,.25)", "#8b5cf6", "#ddd6fe"],
    ["rgba(5,150,105,.25)", "#10b981", "#a7f3d0"],
    ["rgba(217,119,6,.25)", "#f59e0b", "#fde68a"],
    ["rgba(225,29,72,.25)", "#f43f5e", "#fecdd3"],
    ["rgba(8,145,178,.25)", "#06b6d4", "#a5f3fc"],
  ];

  Object.assign(state, {
    itemCount: 6,
    widthPct: 100,
    raw: { ...DEFAULT_RAW },
    itemRaw: [],
    warnings: [],
    ran: false,
  });

  /* ---------------------------------------------------------------
     1. SMARTER CSS PARSER (any grid property, shorthands, selectors)
  --------------------------------------------------------------- */
  const pair = (v) => {
    if (v.includes("(")) return [v, v];
    const p = v.trim().split(/\s+/);
    return [p[0], p[1] || p[0]];
  };

  function expand(map, prop, val) {
    if (prop === "gap") {
      const [r, c] = pair(val);
      map["row-gap"] = r;
      map["column-gap"] = c;
    } else if (prop === "place-items") {
      const [a, j] = pair(val);
      map["align-items"] = a;
      map["justify-items"] = j;
    } else if (prop === "place-content") {
      const [a, j] = pair(val);
      map["align-content"] = a;
      map["justify-content"] = j;
    } else if (prop === "place-self") {
      const [a, j] = pair(val);
      map["align-self"] = a;
      map["justify-self"] = j;
    } else map[prop] = val;
  }

  function target(sel) {
    if (/^(\.grid-container|\.container|\.grid|#grid-container)$/.test(sel))
      return { c: 1, spec: 0 };
    if (/^(\.item|\.grid-item|\.grid-container\s*>\s*\*)$/.test(sel))
      return { all: 1, spec: 1 };
    let k = sel.match(/^\.item-(\d+)$/);
    if (k) return { i: +k[1] - 1, spec: 1 };
    k = sel.match(/^\.item:nth-child\(\s*(\d+|odd|even)\s*\)$/);
    if (k) return { nth: k[1], spec: 2 };
    if (sel === ".item:first-child") return { i: 0, spec: 2 };
    if (sel === ".item:last-child") return { last: 1, spec: 2 };
    return null;
  }

  function parseAll(css) {
    const out = { container: {}, items: [], warnings: [] };
    const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
    const rules = [];
    const re = /([^{}]+)\{([^{}]*)\}/g;
    let m,
      order = 0;
    while ((m = re.exec(clean))) {
      const body = m[2];
      m[1].split(",").forEach((raw) => {
        const sel = raw.trim();
        const t = target(sel);
        if (t) rules.push({ t, body, order: order++ });
        else if (sel && !sel.startsWith("@"))
          out.warnings.push(
            `Selector "${sel}" isn't used here. Use .grid-container, .item, .item-N or .item:nth-child(n).`,
          );
      });
    }
    rules.sort((a, b) => a.t.spec - b.t.spec || a.order - b.order);
    const N = state.items.length;

    rules.forEach(({ t, body }) => {
      const indexes = t.c
        ? null
        : t.all
          ? [...Array(N).keys()]
          : t.nth
            ? [...Array(N).keys()].filter((i) =>
                t.nth === "odd"
                  ? i % 2 === 0
                  : t.nth === "even"
                    ? i % 2 === 1
                    : i === +t.nth - 1,
              )
            : t.last
              ? [N - 1]
              : [t.i];
      body.split(";").forEach((decl) => {
        const k = decl.indexOf(":");
        if (k < 0) return;
        const prop = decl.slice(0, k).trim().toLowerCase();
        const val = decl
          .slice(k + 1)
          .replace(/\s*!important\s*$/i, "")
          .trim();
        if (!prop || !val) return;
        if (!ALLOWED.test(prop)) {
          out.warnings.push(
            `"${prop}" is ignored here. The lab applies grid, alignment, sizing and spacing properties.`,
          );
          return;
        }
        if (window.CSS && CSS.supports && !CSS.supports(prop, val)) {
          out.warnings.push(`The browser rejected  ${prop}: ${val}`);
          return;
        }
        if (!indexes) expand(out.container, prop, val);
        else
          indexes.forEach((i) => {
            if (i < 0 || i >= N) return;
            expand((out.items[i] = out.items[i] || {}), prop, val);
          });
      });
    });
    return out;
  }

  /* keep the old state shape alive so every existing challenge check works */
  const norm = (v) =>
    (v || "")
      .replace(/\s*,\s*/g, ", ")
      .replace(/\s*\/\s*/g, " / ")
      .replace(/\s+/g, " ")
      .trim();

  function syncLegacy() {
    const r = state.raw;
    state.container = {
      display: r.display || "grid",
      templateColumns: norm(r["grid-template-columns"]) || "none",
      templateRows: norm(r["grid-template-rows"]) || "none",
      justifyItems: r["justify-items"] || "stretch",
      alignItems: r["align-items"] || "stretch",
      justifyContent: r["justify-content"] || "stretch",
      alignContent: r["align-content"] || "stretch",
      columnGap: parseFloat(r["column-gap"]) || 0,
      rowGap: parseFloat(r["row-gap"]) || 0,
    };
    state.items = state.items.map((it, i) => {
      const o = state.itemRaw[i] || {};
      return {
        ...it,
        gridColumn: norm(o["grid-column"]) || "auto",
        gridRow: norm(o["grid-row"]) || "auto",
        justifySelf: o["justify-self"] || "auto",
        alignSelf: o["align-self"] || "auto",
      };
    });
  }

  /* ---------------------------------------------------------------
     2. MEASURE THE REAL GRID (this is what makes it "smart")
  --------------------------------------------------------------- */
  function axis(sizes, gap, content, mode, pad) {
    const n = sizes.length;
    const used = sizes.reduce((a, b) => a + b, 0) + gap * Math.max(n - 1, 0);
    const free = Math.max(content - used, 0);
    const m = (mode || "").split(/\s+/).pop();
    let off = 0,
      g = gap;
    if (m === "center") off = free / 2;
    else if (/^(end|flex-end|right)$/.test(m)) off = free;
    else if (m === "space-between" && n > 1) g += free / (n - 1);
    else if (m === "space-around" && n) {
      g += free / n;
      off = free / n / 2;
    } else if (m === "space-evenly" && n) {
      g += free / (n + 1);
      off = free / (n + 1);
    }
    let p = pad + off;
    const t = sizes.map((s) => {
      const o = { start: p, end: p + s };
      p += s + g;
      return o;
    });
    const lines = t.map((k, i) => (i ? (t[i - 1].end + k.start) / 2 : k.start));
    if (n) lines.push(t[n - 1].end);
    return { t, gap: g, lines };
  }

  function geom() {
    const g = $("grid-container");
    const cs = getComputedStyle(g);
    if (!/grid/.test(cs.display)) return null;
    const nums = (v) =>
      !v || v === "none"
        ? []
        : v
            .replace(/\[[^\]]*\]/g, " ")
            .trim()
            .split(/\s+/)
            .map(parseFloat)
            .filter((n) => n > 0.01); /* collapsed auto-fit tracks are 0px */
    const f = (p) => parseFloat(cs[p]) || 0;
    const cg = f("columnGap"),
      rg = f("rowGap");
    return {
      g,
      cg,
      rg,
      ox: g.offsetLeft + g.clientLeft,
      oy: g.offsetTop + g.clientTop,
      X: axis(
        nums(cs.gridTemplateColumns),
        cg,
        g.clientWidth - f("paddingLeft") - f("paddingRight"),
        cs.justifyContent,
        f("paddingLeft"),
      ),
      Y: axis(
        nums(cs.gridTemplateRows),
        rg,
        g.clientHeight - f("paddingTop") - f("paddingBottom"),
        cs.alignContent,
        f("paddingTop"),
      ),
    };
  }

  const startIdx = (t, x) => {
    let r = 0;
    t.forEach((k, i) => {
      if (k.start <= x + 1) r = i;
    });
    return r;
  };
  const endIdx = (t, x) => {
    for (let i = 0; i < t.length; i++) if (t[i].end >= x - 1) return i;
    return Math.max(t.length - 1, 0);
  };
  const place = (G, el) => ({
    sc: startIdx(G.X.t, el.offsetLeft),
    ec: endIdx(G.X.t, el.offsetLeft + el.offsetWidth),
    sr: startIdx(G.Y.t, el.offsetTop),
    er: endIdx(G.Y.t, el.offsetTop + el.offsetHeight),
  });

  function drawOverlays() {
    ["grid-lines", "track-labels", "gap-indicators", "placement-markers"].forEach(
      (id) => ($(id).innerHTML = ""),
    );
    const G = geom();
    if (!G) {
      $("column-count").textContent = $("row-count").textContent = "–";
      return;
    }
    const { g, ox, oy, X, Y } = G;
    const W = g.clientWidth,
      H = g.clientHeight;
    state.container.columnGap = G.cg;
    state.container.rowGap = G.rg;

    let h = "";
    X.lines.forEach(
      (x, i) =>
        (h += `<div class="grid-line vertical" style="left:${ox + x}px;top:${oy}px;height:${H}px;bottom:auto"><span class="grid-line-number">${i + 1}</span></div>`),
    );
    Y.lines.forEach(
      (y, i) =>
        (h += `<div class="grid-line horizontal" style="top:${oy + y}px;left:${ox}px;width:${W}px;right:auto"><span class="grid-line-number">${i + 1}</span></div>`),
    );
    $("grid-lines").innerHTML = h;

    h = "";
    X.t.forEach((t, i) => {
      const w = t.end - t.start;
      h += `<div class="track-label column-label" style="left:${ox + (t.start + t.end) / 2}px">Col ${i + 1}${w >= 90 ? " · " + Math.round(w) + "px" : ""}</div>`;
    });
    Y.t.forEach(
      (t, i) =>
        (h += `<div class="track-label row-label" style="top:${oy + (t.start + t.end) / 2}px">Row ${i + 1}</div>`),
    );
    $("track-labels").innerHTML = h;

    h = "";
    const band = "background:rgba(245,158,11,.16);border:1px dashed #f59e0b;";
    if (X.gap > 0)
      for (let i = 1; i < X.t.length; i++)
        h += `<div class="gap-indicator" style="${band}left:${ox + X.t[i - 1].end}px;top:${oy}px;width:${X.gap}px;height:${H}px">${i === 1 ? `<span class="gap-label" style="left:50%;top:${H + 8}px;transform:translateX(-50%)">${Math.round(X.gap)}px</span>` : ""}</div>`;
    if (Y.gap > 0)
      for (let i = 1; i < Y.t.length; i++)
        h += `<div class="gap-indicator" style="${band}top:${oy + Y.t[i - 1].end}px;left:${ox}px;height:${Y.gap}px;width:${W}px">${i === 1 ? `<span class="gap-label" style="left:${W + 8}px;top:50%;transform:translateY(-50%)">${Math.round(Y.gap)}px</span>` : ""}</div>`;
    $("gap-indicators").innerHTML = h;

    [...g.children].forEach((el, i) => {
      const p = place(G, el);
      const slot = el.querySelector(".item-placement");
      if (slot)
        slot.innerHTML = `col ${p.sc + 1} / ${p.ec + 2}<br>row ${p.sr + 1} / ${p.er + 2}`;
      if (i === state.selectedItem && X.lines.length && Y.lines.length) {
        $("placement-markers").innerHTML =
          `<div class="placement-marker placement-start" style="left:${ox + X.lines[p.sc]}px;top:${oy + Y.lines[p.sr]}px;transform:translate(-100%,-100%)">START: ${p.sc + 1}, ${p.sr + 1}</div>` +
          `<div class="placement-marker placement-end" style="left:${ox + X.lines[p.ec + 1]}px;top:${oy + Y.lines[p.er + 1]}px">END: ${p.ec + 2}, ${p.er + 2}</div>`;
      }
    });

    $("column-count").textContent = X.t.length;
    $("row-count").textContent = Y.t.length;
    $("column-gap-display").textContent = Math.round(G.cg) + "px";
    $("selected-display").textContent = "#" + (state.selectedItem + 1);
  }

  /* ---------------------------------------------------------------
     3. RENDER / RUN / EXPLAIN (replace the old functions by name)
  --------------------------------------------------------------- */
  window.renderGrid = function () {
    const g = $("grid-container");
    g.innerHTML = "";
    g.removeAttribute("style");
    if (state.widthPct < 100) g.style.width = state.widthPct + "%";
    Object.entries(state.raw).forEach(([k, v]) => g.style.setProperty(k, v));
    state.items.forEach((item, i) => {
      const c = COLORS[i % 6];
      const e = document.createElement("div");
      e.className = "grid-item" + (i === state.selectedItem ? " selected" : "");
      e.style.background = c[0];
      e.style.borderColor = c[1];
      Object.entries(state.itemRaw[i] || {}).forEach(([k, v]) =>
        e.style.setProperty(k, v),
      );
      e.innerHTML = `<span class="item-title" style="color:${c[2]}">#${i + 1}</span><span class="item-placement"></span>`;
      e.onclick = () => {
        state.selectedItem = i;
        renderGrid();
        updatePropertyDisplay();
        updateDynamicExplanation();
      };
      g.appendChild(e);
    });
    drawOverlays();
  };

  window.createItems = function () {
    state.items = Array.from({ length: state.itemCount }, (_, i) => ({
      id: i + 1,
      gridColumn: "auto",
      gridRow: "auto",
      justifySelf: "auto",
      alignSelf: "auto",
    }));
  };

  window.runCode = function () {
    const p = parseAll($("css-editor").value);
    state.raw = { ...DEFAULT_RAW, ...p.container };
    state.itemRaw = p.items;
    state.warnings = p.warnings;
    state.ran = true;
    syncLegacy();
    updatePropertyDisplay();
    updateGeneratedCSS();
    renderGrid();
    updateDynamicExplanation();
  };

  window.updateGeneratedCSS = function () {
    const f = (o) =>
      Object.entries(o)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join("\n");
    let css = `.grid-container {\n${f(state.raw)}\n}`;
    state.itemRaw.forEach((o, i) => {
      if (o && Object.keys(o).length) css += `\n\n.item-${i + 1} {\n${f(o)}\n}`;
    });
    $("generated-css").textContent = css;
  };

  window.updatePropertyDisplay = function () {
    const L = lessons[state.currentLesson];
    const p = L.property;
    const props = {
      gap: ["column-gap", "row-gap"],
      span: ["grid-column"],
      "grid lines": ["grid-template-columns"],
      "grid-column + grid-row": ["grid-column", "grid-row"],
    }[p] || [p];
    const it = state.itemRaw[state.selectedItem] || {};
    $("property-name").textContent = p;
    $("property-value").style.whiteSpace = "pre-line";
    $("property-value").textContent = props
      .map((k) => {
        const v = it[k] !== undefined ? it[k] : state.raw[k];
        return `${k}: ${v !== undefined ? v : "initial"};`;
      })
      .join("\n");
  };

  window.updateDynamicExplanation = function () {
    const G = geom();
    const r = state.raw;
    const tc = r["grid-template-columns"] || "";
    const out = state.warnings.map((w) => "⚠ " + w);
    if (!G) out.push("This container isn't display: grid, so grid properties have no effect.");
    else {
      const nc = G.X.t.length,
        nr = G.Y.t.length;
      out.push(
        `The browser built ${nc} column${nc === 1 ? "" : "s"} (${G.X.t.map((t) => Math.round(t.end - t.start) + "px").join(", ") || "none"}) and ${nr} row${nr === 1 ? "" : "s"}.`,
      );
      if (/auto-fit/.test(tc))
        out.push("auto-fit: fits as many columns as possible, then collapses the empty ones to 0px so the filled columns stretch to use the space.");
      if (/auto-fill/.test(tc))
        out.push("auto-fill: fits as many columns as possible and keeps the empty ones, so items never grow past their column.");
      const mm = tc.match(/minmax\(\s*([^,()]+)\s*,\s*([^()]+?)\s*\)/);
      if (mm)
        out.push(`minmax(${mm[1]}, ${mm[2]}): each track is never smaller than ${mm[1]} and grows up to ${mm[2]}.`);
      if (r["grid-auto-flow"])
        out.push(`grid-auto-flow: ${r["grid-auto-flow"]} → ${/dense/.test(r["grid-auto-flow"]) ? "dense backfills earlier holes, so visual order can differ from source order." : "items are placed in source order along that axis."}`);
      if (r["justify-content"] || r["align-content"])
        out.push("justify-content / align-content move the tracks themselves; justify-items / align-items move items inside their cells.");
      const el = G.g.children[state.selectedItem];
      if (el) {
        const p = place(G, el);
        out.push(`Card #${state.selectedItem + 1} spans columns ${p.sc + 1}→${p.ec + 2} and rows ${p.sr + 1}→${p.er + 2}.`);
      }
    }
    const box = $("dynamic-explanation");
    box.style.whiteSpace = "pre-line";
    box.textContent = out.join("\n");
  };

  window.resetLesson = function () {
    const L = lessons[state.currentLesson];
    Object.assign(state, {
      raw: { ...DEFAULT_RAW },
      itemRaw: [],
      warnings: [],
      ran: false,
      itemCount: L.items || 6,
      widthPct: 100,
      selectedItem: 0,
    });
    createItems();
    syncLegacy();
    loadLesson();
    syncControls();
    updateDynamicExplanation();
  };

  /* ---------------------------------------------------------------
     4. EXTRA CONTROLS: item count + container width sliders
  --------------------------------------------------------------- */
  const bar = document.createElement("div");
  bar.className = "mb-3 grid grid-cols-2 gap-3 text-[10px] text-slate-400";
  bar.innerHTML = `
    <label>Items <span id="items-val" class="text-indigo-300"></span>
      <input id="items-range" type="range" min="1" max="12" class="w-full"></label>
    <label>Container width <span id="width-val" class="text-indigo-300"></span>
      <input id="width-range" type="range" min="25" max="100" class="w-full"></label>`;
  $("css-editor").parentNode.insertBefore(bar, $("css-editor"));

  function syncControls() {
    $("items-range").value = state.itemCount;
    $("items-val").textContent = state.itemCount;
    $("width-range").value = state.widthPct;
    $("width-val").textContent = state.widthPct + "%";
  }
  $("items-range").oninput = (e) => {
    state.itemCount = +e.target.value;
    state.selectedItem = Math.min(state.selectedItem, state.itemCount - 1);
    createItems();
    if (state.ran) runCode();
    else {
      syncLegacy();
      renderGrid();
      updateDynamicExplanation();
    }
    syncControls();
  };
  $("width-range").oninput = (e) => {
    state.widthPct = +e.target.value;
    $("width-val").textContent = state.widthPct + "%";
    $("grid-container").style.width = state.widthPct < 100 ? state.widthPct + "%" : "";
  };

  observer.disconnect(); /* re-measure whenever the grid resizes */
  new ResizeObserver(() => {
    drawOverlays();
    updateDynamicExplanation();
  }).observe($("grid-container"));

  const lp = $("lesson-path").parentElement;
  lp.style.maxHeight = "calc(100vh - 7rem)";
  lp.style.overflowY = "auto";

  /* ---------------------------------------------------------------
     5. LESSON FIXES + NEW LESSONS
  --------------------------------------------------------------- */
  const base = `.grid-container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n`;
  const starter = {
    9: `${base}  align-items: start;\n}`,
    10: `${base}  justify-items: center;\n}\n\n.item-1 {\n  /* override the group rule here */\n}`,
    11: `${base}  align-items: center;\n}\n\n.item-1 {\n  /* override the group rule here */\n}`,
    12: `.grid-container {\n  display: grid;\n  grid-template-columns: repeat(3, 100px);\n  justify-content: start;\n}`,
    13: `.grid-container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-template-rows: repeat(2, 80px);\n  align-content: start;\n}`,
    14: `${base}  gap: 16px;\n}\n\n.item-1 {\n}\n\n.item-2 {\n}`,
  };
  /* lessons 9–14 had no starter code, so the editor showed "undefined" */
  lessons.forEach((l) => {
    if (!l.code) l.code = starter[l.id] || base + "}";
  });

  const fit = (kw) =>
    new RegExp(`repeat\\(\\s*${kw}\\s*,\\s*minmax\\(\\s*120px\\s*,\\s*1fr\\s*\\)\\s*\\)`);
  const ex = (c) => `<code class="text-indigo-300">${c}</code>`;

  lessons.push(
    {
      id: 15,
      title: "minmax()",
      category: "Sizing",
      property: "grid-template-columns",
      description: "minmax(min, max) gives a track a size range: never smaller than min, never larger than max.",
      learn: "repeat(3, minmax(100px, 1fr)) makes three columns at least 100px wide that share the leftover space. Drag the width slider to watch them hit the floor.",
      mental: "minmax is a rubber band with a hard floor and a ceiling.",
      why: "<p>Plain <code>1fr</code> can't shrink below its content. <code>minmax(0, 1fr)</code> lets it, and <code>minmax(100px, 1fr)</code> protects a minimum width.</p>",
      example: ex("minmax(100px, 1fr)"),
      code: `${base}}`,
      challenge: {
        title: "Give every column a 100px floor",
        description: "Make 3 columns that are never narrower than 100px but can grow to share the space.",
        goal: "grid-template-columns: repeat(3, minmax(100px, 1fr));",
        check: (s) => /repeat\(\s*3\s*,\s*minmax\(\s*100px\s*,\s*1fr\s*\)\s*\)/.test(s.raw["grid-template-columns"] || ""),
      },
    },
    {
      id: 16,
      title: "auto-fill",
      category: "Responsive",
      property: "grid-template-columns",
      items: 3,
      description: "auto-fill lets the browser decide how many columns fit, instead of you hard-coding the count.",
      learn: "repeat(auto-fill, minmax(120px, 1fr)) creates as many 120px+ columns as fit. Empty columns are kept, so 3 items in a wide container leave empty space on the right.",
      mental: "auto-fill lays out the whole shelf, even the empty slots.",
      why: "<p>Great when you want items to keep a consistent size no matter how many there are. Drag the width slider to watch the column count change.</p>",
      example: ex("repeat(auto-fill, minmax(120px, 1fr))"),
      code: `${base}}`,
      challenge: {
        title: "Make the column count automatic",
        description: "Use auto-fill with a 120px minimum and a 1fr maximum.",
        goal: "grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));",
        check: (s) => fit("auto-fill").test(s.raw["grid-template-columns"] || ""),
      },
    },
    {
      id: 17,
      title: "auto-fit",
      category: "Responsive",
      property: "grid-template-columns",
      items: 3,
      description: "auto-fit works like auto-fill, but empty tracks collapse so the real items stretch to fill the row.",
      learn: "Compare with the last lesson: same code, but with 3 items in a wide container, the cards now grow to fill the whole row.",
      mental: "auto-fill keeps empty slots, auto-fit folds them away.",
      why: "<p>The difference only shows when there are fewer items than fit in the row. Try switching between auto-fill and auto-fit and watch the Columns counter.</p>",
      example: ex("repeat(auto-fit, minmax(120px, 1fr))"),
      code: `${base}}`,
      challenge: {
        title: "Make the cards stretch",
        description: "Use auto-fit with a 120px minimum and a 1fr maximum.",
        goal: "grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));",
        check: (s) => fit("auto-fit").test(s.raw["grid-template-columns"] || ""),
      },
    },
    {
      id: 18,
      title: "grid-auto-flow",
      category: "Auto-placement",
      property: "grid-auto-flow",
      description: "grid-auto-flow controls how unplaced items are slotted in, including backfilling holes with dense.",
      learn: "By default the browser places items in order and never goes back. When a wide item leaves a hole, dense lets later items jump back into it.",
      mental: "Row flow is a typewriter. Dense is a game of Tetris.",
      why: "<p>Dense packing can change visual order away from source order, which matters for accessibility and keyboard focus.</p>",
      example: ex("grid-auto-flow: row dense;"),
      code: `.grid-container {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  grid-auto-flow: row;\n}\n\n.item-1 {\n  grid-column: span 3;\n}\n\n.item-2 {\n  grid-column: span 2;\n}`,
      challenge: {
        title: "Fill the hole",
        description: "Item #2 is too wide for the gap beside #1, leaving a hole. Pack the grid densely.",
        goal: "grid-auto-flow: row dense;",
        check: (s) => /dense/.test(s.raw["grid-auto-flow"] || ""),
      },
    },
    {
      id: 19,
      title: "grid-template-areas",
      category: "Layout",
      property: "grid-template-areas",
      items: 3,
      description: "Name regions of the grid in a visual map, then drop items into them with grid-area.",
      learn: "Each quoted string is a row, each word is a cell. Repeat a name to span cells. Items opt in with grid-area: name.",
      mental: "You draw the page layout in ASCII, and the browser builds it.",
      why: "<p>Areas make layouts readable and easy to rearrange in a media query: change the map, not the items.</p>",
      example: ex('grid-template-areas: "header header" "sidebar main";'),
      code: `.grid-container {\n  display: grid;\n  grid-template-columns: 1fr 2fr;\n  grid-template-areas:\n    "header header"\n    "sidebar main";\n}\n\n.item-1 {\n  grid-area: header;\n}`,
      challenge: {
        title: "Finish the page layout",
        description: "Put Card #2 in the sidebar area and Card #3 in the main area.",
        goal: "Card #2 → grid-area: sidebar\nCard #3 → grid-area: main",
        check: (s) =>
          (s.itemRaw[1] || {})["grid-area"] === "sidebar" &&
          (s.itemRaw[2] || {})["grid-area"] === "main",
      },
    },
  );

  resetLesson(); /* re-render with the upgraded engine */
})();