/* =====================================================================
   FLEXBOX LAB UPGRADE — paste inside a new <script> tag AFTER your
   existing script (just before </body>), or load it as a file after it.

   Same idea as the Grid upgrade: apply the CSS to the real element and
   MEASURE what the browser did, instead of whitelisting values.
===================================================================== */
(() => {
  const DEFAULT_RAW = {
    display: "flex",
    "flex-direction": "row",
    "justify-content": "flex-start",
    "align-items": "stretch",
    "flex-wrap": "nowrap",
    "column-gap": "16px",
    "row-gap": "16px",
  };
  const ALLOWED =
    /^(display|flex(-[a-z]+)*|(row-|column-)?gap|justify-[a-z]+|align-[a-z]+|place-[a-z]+|order|width|height|(min|max)-(width|height)|margin(-[a-z]+)?|padding(-[a-z]+)?|aspect-ratio|overflow|box-sizing)$/;

  Object.assign(state, {
    raw: { ...DEFAULT_RAW },
    itemRaw: [],
    warnings: [],
    ran: false,
    wPct: 100,
    hPct: 100,
  });

  /* ---------------------------------------------------------------
     1. PARSER: any flex property, shorthands, selectors
  --------------------------------------------------------------- */
  function flexExpand(v) {
    v = v.trim();
    if (v === "none") return ["0", "0", "auto"];
    if (v === "auto") return ["1", "1", "auto"];
    if (v === "initial") return ["0", "1", "auto"];
    const nums = [];
    let basis;
    v.split(/\s+/).forEach((t) => {
      if (/^[\d.]+$/.test(t) && nums.length < 2 && basis === undefined)
        nums.push(t);
      else basis = t;
    });
    return [nums[0] ?? "1", nums[1] ?? "1", basis ?? "0%"];
  }

  function expand(m, p, v) {
    const two = (x) => {
      if (x.includes("(")) return [x, x];
      const a = x.trim().split(/\s+/);
      return [a[0], a[1] || a[0]];
    };
    if (p === "gap") {
      const [r, c] = two(v);
      m["row-gap"] = r;
      m["column-gap"] = c;
    } else if (p === "place-content") {
      const [a, j] = two(v);
      m["align-content"] = a;
      m["justify-content"] = j;
    } else if (p === "place-items") {
      const [a, j] = two(v);
      m["align-items"] = a;
      m["justify-items"] = j;
    } else if (p === "place-self") {
      const [a, j] = two(v);
      m["align-self"] = a;
      m["justify-self"] = j;
    } else if (p === "flex") {
      const [g, s, b] = flexExpand(v);
      m["flex-grow"] = g;
      m["flex-shrink"] = s;
      m["flex-basis"] = b;
    } else if (p === "flex-flow") {
      v.trim()
        .split(/\s+/)
        .forEach((t) => {
          if (/^(row|column)/.test(t)) m["flex-direction"] = t;
          else m["flex-wrap"] = t;
        });
    } else m[p] = v;
  }

  function target(s) {
    if (/^(\.flex-container|\.container|\.flex|#flex-container)$/.test(s))
      return { c: 1, spec: 0 };
    if (/^(\.item|\.flex-item|\.flex-container\s*>\s*\*)$/.test(s))
      return { all: 1, spec: 1 };
    let k = s.match(/^\.item-(\d+)$/);
    if (k) return { i: +k[1] - 1, spec: 1 };
    k = s.match(/^\.item:nth-child\(\s*(\d+|odd|even)\s*\)$/);
    if (k) return { nth: k[1], spec: 2 };
    if (s === ".item:first-child") return { i: 0, spec: 2 };
    if (s === ".item:last-child") return { last: 1, spec: 2 };
    return null;
  }

  function parseAll(css) {
    const out = { container: {}, items: [], warnings: [], empty: true };
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
        if (t) {
          rules.push({ t, body, order: order++ });
          out.empty = false;
        } else if (sel && sel[0] !== "@")
          out.warnings.push(
            `Selector "${sel}" isn't used here. Use .flex-container, .item, .item-N or .item:nth-child(n).`,
          );
      });
    }
    rules.sort((a, b) => a.t.spec - b.t.spec || a.order - b.order);
    const N = state.items.length;
    rules.forEach(({ t, body }) => {
      const idx = t.c
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
      body.split(";").forEach((d) => {
        const k = d.indexOf(":");
        if (k < 0) return;
        const prop = d.slice(0, k).trim().toLowerCase();
        const val = d
          .slice(k + 1)
          .replace(/\s*!important\s*$/i, "")
          .trim();
        if (!prop || !val) return;
        if (!ALLOWED.test(prop)) {
          out.warnings.push(
            `"${prop}" is ignored here. The lab applies flex, alignment, sizing and spacing properties.`,
          );
          return;
        }
        if (window.CSS && CSS.supports && !CSS.supports(prop, val)) {
          out.warnings.push(`The browser rejected  ${prop}: ${val}`);
          return;
        }
        if (!idx) expand(out.container, prop, val);
        else
          idx.forEach((i) => {
            if (i >= 0 && i < N)
              expand((out.items[i] = out.items[i] || {}), prop, val);
          });
      });
    });
    return out;
  }

  /* keep the old state shape alive so every existing challenge check works */
  function syncLegacy() {
    const r = state.raw;
    state.container = {
      display: r.display || "flex",
      direction: r["flex-direction"] || "row",
      justifyContent: r["justify-content"] || "flex-start",
      alignItems: r["align-items"] || "stretch",
      flexWrap: r["flex-wrap"] || "nowrap",
      alignContent: r["align-content"] || "normal",
      gap: parseFloat(r["column-gap"]) || 0,
    };
    state.items = state.items.map((it, i) => {
      const o = state.itemRaw[i] || {};
      const b = o["flex-basis"] || "auto";
      const g = Number(o["flex-grow"]),
        s = Number(o["flex-shrink"]);
      return {
        id: it.id,
        grow: o["flex-grow"] === undefined || isNaN(g) ? 0 : g,
        shrink: o["flex-shrink"] === undefined || isNaN(s) ? 1 : s,
        basis: /^0(px|%)?$/.test(b) ? "0px" : b,
        alignSelf: o["align-self"] || "auto",
      };
    });
  }

  /* ---------------------------------------------------------------
     2. SERIALISE STATE BACK TO CSS (editor + Generated CSS panel)
  --------------------------------------------------------------- */
  function block(m, sel) {
    const L = [];
    const same = m["row-gap"] !== undefined && m["row-gap"] === m["column-gap"];
    Object.keys(m).forEach((k) => {
      if ((k === "row-gap" || k === "column-gap") && same) {
        if (k === "row-gap") L.push(`  gap: ${m[k]};`);
      } else L.push(`  ${k}: ${m[k]};`);
    });
    return `${sel} {\n${L.join("\n")}\n}`;
  }

  function fullCSS(forEditor) {
    let s = block(state.raw, ".flex-container");
    state.items.forEach((_, i) => {
      const o = state.itemRaw[i];
      const has = o && Object.keys(o).length;
      if (has) s += "\n\n" + block(o, `.item-${i + 1}`);
      else if (forEditor && i === state.selectedItemIndex)
        s += `\n\n.item-${i + 1} {\n  /* try: flex: 1; align-self: center; order: -1; */\n}`;
    });
    return s;
  }

  window.generateCSS = () => ($("css-output").textContent = fullCSS(false));
  window.refreshEditor = () => {
    $("code-editor").value = fullCSS(true);
    $("editor-message").className = "hidden mt-3 rounded-lg p-3 text-[11px]";
  };

  /* ---------------------------------------------------------------
     3. RENDER + MEASURE
  --------------------------------------------------------------- */
  window.updateCanvas = function () {
    const g = $("flex-container");
    g.style.cssText = "";
    if (state.wPct < 100) g.style.width = state.wPct + "%";
    if (state.hPct < 100) g.style.height = state.hPct + "%";
    Object.entries(state.raw).forEach(([k, v]) => g.style.setProperty(k, v));
    updateAxisVisuals();
    const r = state.raw;
    const col = state.container.direction.includes("column");
    $("visual-direction").textContent = state.container.direction;
    $("visual-justify").textContent = r["justify-content"] || "normal";
    $("visual-align").textContent = r["align-items"] || "normal";
    const gp =
      r["row-gap"] === r["column-gap"]
        ? r["row-gap"]
        : `${r["row-gap"]} / ${r["column-gap"]}`;
    $("visual-gap").textContent = gp;
    $("gap-marker").textContent = `gap: ${gp}`;
    $("visual-main-axis").textContent = col ? "Vertical" : "Horizontal";
    $("visual-cross-axis").textContent = col ? "Horizontal" : "Vertical";
  };

  window.renderItems = function () {
    const g = $("flex-container");
    g.innerHTML = "";
    state.items.forEach((item, i) => {
      const s = itemColors[i % itemColors.length];
      const e = document.createElement("div");
      const sel = i === state.selectedItemIndex;
      e.className =
        "flex-item rounded-xl border-2 flex items-center justify-center cursor-pointer relative min-w-[70px] min-h-[65px] p-3" +
        (sel ? " selected" : "");
      e.style.background = s.bg;
      e.style.borderColor = s.border;
      e.style.color = s.text;
      Object.entries(state.itemRaw[i] || {}).forEach(([k, v]) =>
        e.style.setProperty(k, v),
      );
      e.onclick = (ev) => {
        ev.stopPropagation();
        selectItem(i);
      };
      e.innerHTML = `<div class="text-center">
        <div class="text-sm font-bold">Item ${i + 1}</div>
        <div class="m-flex font-code text-[8px] text-slate-400 mt-1"></div>
        <div class="m-basis font-code text-[8px] text-slate-500 mt-0.5"></div>
        <div class="m-dim font-code text-[8px] text-cyan-400 mt-0.5"></div></div>
        ${sel ? '<span class="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-indigo-500 text-white text-[8px] font-bold whitespace-nowrap">SELECTED</span>' : ""}`;
      g.appendChild(e);
    });
    refreshMeasure();
  };

  function insights() {
    const g = $("flex-container"),
      cs = getComputedStyle(g);
    if (!/flex/.test(cs.display))
      return [
        "This container isn't display: flex, so flex properties have no effect.",
      ];
    const col = cs.flexDirection.indexOf("column") === 0;
    const els = [...g.children];
    const f = (p) => parseFloat(cs[p]) || 0;
    const main = col
      ? g.clientHeight - f("paddingTop") - f("paddingBottom")
      : g.clientWidth - f("paddingLeft") - f("paddingRight");
    const gap = f(col ? "rowGap" : "columnGap");
    const size = (e) => {
      const c = getComputedStyle(e);
      return col
        ? e.offsetHeight +
            (parseFloat(c.marginTop) || 0) +
            (parseFloat(c.marginBottom) || 0)
        : e.offsetWidth +
            (parseFloat(c.marginLeft) || 0) +
            (parseFloat(c.marginRight) || 0);
    };
    const lines = {};
    els.forEach((e) => {
      const k = Math.round(col ? e.offsetLeft : e.offsetTop);
      (lines[k] = lines[k] || []).push(e);
    });
    const L = Object.values(lines);
    const out = [
      `${L.length} flex line${L.length === 1 ? "" : "s"}. Main axis is ${col ? "vertical" : "horizontal"}, ${Math.round(main)}px long.`,
    ];
    L.slice(0, 3).forEach((line, i) => {
      const free = Math.round(
        main - line.reduce((a, e) => a + size(e), 0) - gap * (line.length - 1),
      );
      out.push(
        `Line ${i + 1}: ` +
          (free > 1
            ? `${free}px free. justify-content decides where it goes, and flex-grow can absorb it.`
            : free < -1
              ? `${-free}px overflow, so flex-shrink or flex-wrap is needed.`
              : "exactly full."),
      );
    });
    return out;
  }

  function refreshMeasure() {
    const g = $("flex-container");
    [...g.children].forEach((e, i) => {
      const c = getComputedStyle(e);
      e.querySelector(".m-flex").textContent =
        `grow:${c.flexGrow} • shrink:${c.flexShrink}`;
      e.querySelector(".m-basis").textContent = `basis:${c.flexBasis}`;
      e.querySelector(".m-dim").textContent =
        `${Math.round(e.offsetWidth)}×${Math.round(e.offsetHeight)}px`;
      if (i === state.selectedItemIndex) {
        $("selected-info-item").textContent = `Item ${i + 1}`;
        $("selected-info-style").textContent =
          `flex: ${c.flexGrow} ${c.flexShrink} ${c.flexBasis}`;
      }
    });
    $("dynamic-model").innerHTML = getCurrentMentalModel();
  }

  window.getCurrentMentalModel = function () {
    const col = state.container.direction.includes("column");
    const [a, b] = col
      ? ["vertically", "horizontally"]
      : ["horizontally", "vertically"];
    return (
      `Your main axis is <strong class="text-indigo-300">${col ? "vertical" : "horizontal"}</strong> (<code class="text-indigo-300">flex-direction: ${state.container.direction}</code>), so <code class="text-amber-300">justify-content</code> works ${a} and <code class="text-emerald-300">align-items</code> works ${b}.` +
      `<ul class="mt-3 pt-3 border-t border-slate-800 space-y-1 text-[11px] text-slate-500">${insights()
        .map((x) => `<li>• ${x}</li>`)
        .join("")}</ul>`
    );
  };

  /* ---------------------------------------------------------------
     4. APPLY / EXPLAIN / PRESETS / RESET
  --------------------------------------------------------------- */
  const snap = () =>
    JSON.parse(JSON.stringify({ c: state.raw, i: state.itemRaw }));

  const NOTE = {
    "flex-direction": (v) =>
      `sets the main axis to ${/column/.test(v) ? "vertical" : "horizontal"}${/reverse/.test(v) ? " and reverses the item order" : ""}.`,
    "justify-content": (v) =>
      `distributes leftover space along the main axis (${v}).`,
    "align-items": (v) => `aligns items on the cross axis (${v}).`,
    "align-content": () =>
      "distributes multiple flex lines on the cross axis. It needs wrapping and spare cross-axis space.",
    "flex-wrap": (v) =>
      v === "nowrap"
        ? "keeps everything on one line, so items shrink or overflow."
        : "lets items move onto new lines when they run out of room.",
    "row-gap": () => "is the space between flex lines.",
    "column-gap": () => "is the space between items on the same line.",
    "flex-grow": (v) => `lets the item take ${v} share(s) of free space.`,
    "flex-shrink": (v) =>
      v === "0"
        ? "stops the item from shrinking."
        : `lets the item shrink with weight ${v} when space runs out.`,
    "flex-basis": () =>
      "sets the item's starting main size before grow and shrink run.",
    "align-self": (v) => `overrides align-items for this item (${v}).`,
    order: (v) =>
      `moves the item in the visual order (${v}). The DOM order is unchanged.`,
  };

  function describe(b, a) {
    const L = [];
    const diff = (x, y, who) =>
      new Set([...Object.keys(x || {}), ...Object.keys(y || {})]).forEach(
        (k) => {
          if ((x || {})[k] === (y || {})[k]) return;
          const nv = (y || {})[k];
          L.push(
            nv === undefined
              ? `${who}: <span class="property-highlight">${k}</span> removed, so it goes back to its default.`
              : `${who}: <span class="property-highlight">${k}</span> <span class="value-highlight">${nv}</span> ${NOTE[k] ? NOTE[k](nv) : "applied."}`,
          );
        },
      );
    diff(b.c, a.c, "Container");
    state.items.forEach((_, i) => diff(b.i[i], a.i[i], `Item ${i + 1}`));
    return L.slice(0, 8);
  }

  window.applyEditorCSS = function () {
    const p = parseAll($("code-editor").value);
    const msg = $("editor-message");
    if (p.empty) {
      msg.className =
        "mt-3 rounded-lg p-3 text-[11px] bg-rose-950/50 border border-rose-900 text-rose-300";
      msg.textContent =
        "I couldn't find a valid CSS block. Use .flex-container { ... } or .item-1 { ... }.";
      return;
    }
    const before = snap();
    state.raw = { ...DEFAULT_RAW, ...p.container };
    state.itemRaw = p.items;
    state.warnings = p.warnings;
    state.ran = true;
    syncLegacy();
    updateApp();
    const lines = describe(before, snap());
    const html = [
      ...p.warnings.map((w) => `<span class="text-amber-300">⚠ ${w}</span>`),
      ...(lines.length
        ? lines
        : ["No visible change. Check the property names and values."]),
    ]
      .map(
        (x) =>
          `<div class="mb-2 last:mb-0"><i class="fa-solid fa-arrow-right text-indigo-400 mr-2"></i>${x}</div>`,
      )
      .join("");
    updateExplanation(html, getCurrentMentalModel());
    msg.className = p.warnings.length
      ? "mt-3 rounded-lg p-3 text-[11px] bg-amber-950/50 border border-amber-900 text-amber-300"
      : "mt-3 rounded-lg p-3 text-[11px] bg-emerald-950/50 border border-emerald-900 text-emerald-300";
    msg.innerHTML = p.warnings.length
      ? "Applied, but some declarations were skipped. See Explain."
      : '<i class="fa-solid fa-check mr-1"></i> CSS applied successfully.';
  };

  const PRESETS = {
    center: {
      "justify-content": "center",
      "align-items": "center",
      "column-gap": "20px",
      "row-gap": "20px",
    },
    navbar: { "justify-content": "space-between", "align-items": "center" },
    wrap: { "flex-wrap": "wrap", "align-content": "flex-start" },
    column: { "flex-direction": "column" },
  };
  window.applyPreset = function (type) {
    state.raw = { ...DEFAULT_RAW, ...PRESETS[type] };
    syncLegacy();
    updateApp();
    refreshEditor();
    updateExplanation(
      '<strong class="text-white">Preset applied.</strong><br>Change the values to see why this layout works.',
      getCurrentMentalModel(),
    );
  };

  window.resetEverything = function () {
    state.currentLesson = 1;
    state.completedLessons = [];
    Object.assign(state, {
      raw: { ...DEFAULT_RAW },
      itemRaw: [],
      warnings: [],
      ran: false,
      wPct: 100,
      hPct: 100,
      selectedItemIndex: 0,
    });
    state.items = JSON.parse(JSON.stringify(initialItems));
    syncLegacy();
    syncControls();
    renderLesson();
    updateProgress();
    updateApp();
    refreshEditor();
    updateExplanation(
      '<strong class="text-white">Flexbox reset.</strong><br>Work through the lesson path.',
      getCurrentMentalModel(),
    );
  };

  /* ---------------------------------------------------------------
     5. EXTRA CONTROLS: items / width / height
  --------------------------------------------------------------- */
  $("editor-target").style.display =
    "none"; /* one editor now covers container + every item */
  const bar = document.createElement("div");
  bar.className = "mb-3 grid grid-cols-3 gap-3 text-[10px] text-slate-400";
  bar.innerHTML = `
    <label>Items <span id="n-val" class="text-indigo-300"></span><input id="n-range" type="range" min="1" max="10" class="w-full"></label>
    <label>Width <span id="w-val" class="text-indigo-300"></span><input id="w-range" type="range" min="30" max="100" class="w-full"></label>
    <label>Height <span id="h-val" class="text-indigo-300"></span><input id="h-range" type="range" min="30" max="100" class="w-full"></label>`;
  $("code-editor").parentNode.insertBefore(bar, $("code-editor"));

  function syncControls() {
    $("n-range").value = state.items.length;
    $("n-val").textContent = state.items.length;
    $("w-range").value = state.wPct;
    $("w-val").textContent = state.wPct + "%";
    $("h-range").value = state.hPct;
    $("h-val").textContent = state.hPct + "%";
  }
  $("n-range").oninput = (e) => {
    const n = +e.target.value;
    while (state.items.length < n)
      state.items.push({
        id: Math.max(...state.items.map((x) => x.id)) + 1,
        grow: 0,
        shrink: 1,
        basis: "auto",
        alignSelf: "auto",
      });
    state.items.length = n;
    state.selectedItemIndex = Math.min(state.selectedItemIndex, n - 1);
    if (state.ran) {
      const p = parseAll($("code-editor").value);
      state.raw = { ...DEFAULT_RAW, ...p.container };
      state.itemRaw = p.items;
    }
    syncLegacy();
    updateApp();
    syncControls();
  };
  $("w-range").oninput = (e) => {
    state.wPct = +e.target.value;
    updateApp();
    syncControls();
  };
  $("h-range").oninput = (e) => {
    state.hPct = +e.target.value;
    updateApp();
    syncControls();
  };
  new ResizeObserver(refreshMeasure).observe($("flex-container"));

  /* ---------------------------------------------------------------
     6. NEW LESSONS
  --------------------------------------------------------------- */
  const it = (i) => state.itemRaw[i] || {};
  lessons.push(
    {
      id: 16,
      title: "order",
      property: "order",
      syntax: "order: 1;",
      description:
        "order changes the visual position of a flex item without touching the HTML.",
      why: "Items are sorted by order (default 0), then by source position. Lower values come first.",
      model:
        "The DOM order stays the same, which matters for keyboard focus and screen readers.",
      challenge: {
        title: "Send Item 1 to the end",
        description: "Make Item 1 appear after all the others.",
        requirements: [
          "Give .item-1 an order greater than 0.",
          "Leave the other items alone.",
        ],
        hint: "Higher numbers come later.",
        check: () =>
          Number(it(0).order) > 0 &&
          state.items.slice(1).every((_, i) => !it(i + 1).order),
      },
    },
    {
      id: 17,
      title: "Auto Margins",
      property: "margin-left: auto",
      syntax: "margin-left: auto;",
      description:
        "An auto margin absorbs all free space on that side before justify-content gets any.",
      why: "It is the classic way to push one item away from the rest, such as a logo on the left and a button on the far right.",
      model:
        "Auto margins eat the free space first. justify-content only shares what is left.",
      challenge: {
        title: "Push the last item right",
        description:
          "Push Item 4 to the far end of the row using an auto margin.",
        requirements: [
          "Use margin-left: auto on .item-4.",
          "Keep justify-content: flex-start.",
        ],
        hint: "Add margin-left: auto to .item-4.",
        check: () =>
          it(3)["margin-left"] === "auto" &&
          state.container.justifyContent === "flex-start",
      },
    },
    {
      id: 18,
      title: "Responsive Cards",
      property: "flex: 1 1 200px",
      syntax: ".item {\n  flex: 1 1 200px;\n}",
      description:
        "Combine wrap with grow and a basis to get cards that wrap and stretch with no media queries.",
      why: "The basis is the ideal width, wrap moves cards to a new line, and grow shares the leftover space on each line.",
      model:
        "basis picks how many fit per line. grow decides how the last gap is filled.",
      challenge: {
        title: "Build the card row",
        description:
          "Let every item wrap, then size each one with flex: 1 1 200px.",
        requirements: [
          "flex-wrap: wrap on the container.",
          "Use .item { flex: 1 1 200px; } for all items.",
        ],
        hint: "Use the .item selector. Drag the Width slider and add more items to watch the wrapping.",
        check: () =>
          state.raw["flex-wrap"] === "wrap" &&
          state.items.every(
            (_, i) =>
              it(i)["flex-basis"] === "200px" && it(i)["flex-grow"] === "1",
          ),
      },
    },
    {
      id: 19,
      title: "row-gap & column-gap",
      property: "row-gap / column-gap",
      syntax: "row-gap: 8px;\ncolumn-gap: 32px;",
      description:
        "gap is a shorthand. column-gap is the space between items in a line, and row-gap is the space between lines.",
      why: "row-gap only shows once wrapping creates more than one line.",
      model:
        "Think of the gaps as two separate spacers: one inside a line and one between lines.",
      challenge: {
        title: "Give each axis its own gap",
        description: "Set a 32px column gap and an 8px row gap.",
        requirements: ["column-gap: 32px.", "row-gap: 8px."],
        hint: "Wrap the items so you can see the row gap.",
        check: () =>
          parseFloat(state.raw["column-gap"]) === 32 &&
          parseFloat(state.raw["row-gap"]) === 8,
      },
    },
    {
      id: 20,
      title: "flex-flow",
      property: "flex-flow",
      syntax: "flex-flow: column wrap;",
      description:
        "flex-flow is the shorthand for flex-direction and flex-wrap.",
      why: "Setting both in one declaration keeps direction and wrapping together.",
      model: "flex-flow: <direction> <wrap>. Either value can be left out.",
      challenge: {
        title: "Use the shorthand",
        description: "Make a column that wraps, using flex-flow.",
        requirements: ["flex-direction: column.", "flex-wrap: wrap."],
        hint: "Reduce the Height slider so the column runs out of room and wraps.",
        check: () =>
          state.raw["flex-direction"] === "column" &&
          state.raw["flex-wrap"] === "wrap",
      },
    },
  );

  syncLegacy();
  syncControls();
})();
