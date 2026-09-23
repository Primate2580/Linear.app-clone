CSS Grid Layout with template areas gives you a two-dimensional grid where you can visually map out your design directly in code.

---

## 1. How CSS Grid Template Areas Work

`grid-template-areas` turns your CSS into an ASCII map of your webpage layout.

### The 3 Core Rules

1. **Define the Map:** Use `grid-template-areas` on the parent container, enclosing each row in quotes (`"..."`).
2. **Assign the Items:** Use `grid-area` on child elements to give them names that match your map.
3. **Keep It Rectangular:** Every named region must form a seamless rectangle or square. Irregular shapes (L-shapes or T-shapes) will break the grid.

---

## 2. Basic Example

### HTML

```html
<div class="layout">
  <header class="site-header">Header</header>
  <aside class="site-sidebar">Sidebar</aside>
  <main class="site-main">Main Content</main>
  <footer class="site-footer">Footer</footer>
</div>

```

### CSS

```css
/* 1. Parent Container */
.layout {
  display: grid;
  grid-template-columns: 200px 1fr; /* Sidebar fixed 200px, Main takes remaining space */
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
  
  grid-template-areas:
    "head head"
    "side main"
    "foot foot";
}

/* 2. Assigning Children to Area Names */
.site-header  { grid-area: head; }
.site-sidebar { grid-area: side; }
.site-main    { grid-area: main; }
.site-footer  { grid-area: foot; }

```

---

## 3. Two Crucial Patterns to Know

### 1. The Dot Notation (`.`)

Use a period (`.`) to leave an area empty or create blank space inside your layout map:

```css
grid-template-areas:
  "head head head"
  "side main ...."  /* The last column is an empty space */
  "foot foot foot";

```

### 2. Desktop-First / Mobile-First Responsive Grid Areas

To reorder or rearrange items across screen sizes, redefine `grid-template-areas` inside a media query without touching the HTML markup.

```css
/* Mobile Default (Stacked Layout) */
.layout {
  display: grid;
  gap: 1rem;
  grid-template-areas:
    "head"
    "main"
    "side"
    "foot";
}

/* Desktop Upgrade (Side-by-Side Layout) */
@media (min-width: 768px) {
  .layout {
    grid-template-columns: 250px 1fr;
    grid-template-areas:
      "head head"
      "side main"
      "foot foot";
  }
}

```

---

## Your Task (Grid Area Challenge)

Build a 3-column desktop layout with a header, sidebar, main content area, right widget panel, and footer.

### Requirements:

1. Write HTML with 5 distinct sections inside a `.dashboard` container:
* Header
* Sidebar
* Main Content
* Widgets Panel
* Footer


2. Write CSS for `.dashboard` using `display: grid` and `grid-template-areas` mapped out like this:
* **Row 1:** Header spans across all 3 columns.
* **Row 2:** Sidebar in column 1 (`200px`), Main Content in column 2 (`1fr`), Widgets Panel in column 3 (`250px`).
* **Row 3:** Footer spans across all 3 columns.


3. Assign the respective `grid-area` property to each child class.

Share your HTML and CSS when ready!

That CSS code links your HTML elements directly to the names defined in the parent grid's layout map (`grid-template-areas`).

### What Each Part Does

1. **`.site-header { grid-area: head; }`**
Tells the browser: *"Take the element with class `.site-header` and place it in the region named `head`."*
2. **`.site-sidebar { grid-area: side; }`**
Places `.site-sidebar` into the region named `side`.
3. **`.site-main { grid-area: main; }`**
Places `.site-main` into the region named `main`.
4. **`.site-footer { grid-area: foot; }`**
Places `.site-footer` into the region named `foot`.

---

### How It Works Together with the Parent Grid

Without those assignments, the browser doesn't know which HTML element belongs where in the visual layout map.

When paired with the parent grid:

```css
.layout {
  display: grid;
  grid-template-areas:
    "head head"  /* Row 1: head spans both columns */
    "side main"  /* Row 2: side in col 1, main in col 2 */
    "foot foot"; /* Row 3: foot spans both columns */
}

```

The browser matches the names:

* **`head`** spans the entire top row, so `.site-header` stretches across both columns at the top.
* **`side`** sits in row 2, column 1, so `.site-sidebar` goes there.
* **`main`** sits in row 2, column 2, so `.site-main` goes there.
* **`foot`** spans the bottom row, so `.site-footer` stretches across the bottom.

---

### Key Takeaway

`grid-template-areas` on the parent draws the blueprint, and `grid-area: name;` on the children assigns each element to its spot on that blueprint.

Ready to try your Grid Area challenge, or do you have any questions about this part?


Your Grid Areas solution is **100% correct in CSS structure and syntax**.

You mapped out a 3-column, 3-row layout, aligned `grid-template-columns` directly with the layout blueprint (`200px 1fr 250px`), and linked every child class to its designated grid area name.

---

### One Minor HTML Tag Fix

In your HTML, `<sidebar>` is written as a tag name. Standard HTML does not have a `<sidebar>` tag—it uses `<aside>` for sidebars:

```html
<!-- Incorrect HTML Tag -->
<sidebar class="site-sidebar">Sidebar</sidebar>

<!-- Correct HTML Standard Tag -->
<aside class="site-sidebar">Sidebar</aside>

```

---

### The Power of Grid Template Areas: Instant Responsive Re-ordering

The biggest advantage of `grid-template-areas` is how fast you can completely change a layout for mobile without touching your HTML markup.

To turn your 3-column desktop dashboard into a single-column mobile view, you just redefine `grid-template-areas` inside a mobile media query:

```css
/* Mobile View (Default / Base) */
.dashboard {
  display: grid;
  grid-template-columns: 1fr; /* Single column layout */
  gap: 1rem;
  grid-template-areas:
    "header"
    "main"
    "widgets"
    "sidebar"
    "footer";
}

/* Desktop Upgrade */
@media (min-width: 1024px) {
  .dashboard {
    grid-template-columns: 200px 1fr 250px;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
      "header  header header"
      "sidebar main   widgets"
      "footer  footer footer";
  }
}

```

Notice how on mobile, the `main` content area moves to the top right under the header, and the `sidebar` drops down above the footer—all controlled directly from CSS.

---

### Ready for Lesson 1 of `::before` and `::after`?

Now that you've mastered responsiveness and grid template areas, let's return to your initial `::before` and `::after` task!

**Task Requirements:**

1. Write HTML for a button: `<button class="buy-btn">Buy Now</button>`.
2. Write CSS using `::before` or `::after` to insert a price tag via `content` (e.g., `$19.99 - `).
3. Apply styling (color, font-weight, or background) to make the inserted text stand out from the main text.

Drop your HTML and CSS below!

`overflow-y` controls **what happens to content when it is taller than its container vertically** (along the Y-axis).

### What `overflow-y: auto;` Does

1. **Default Behavior (No Overflow):** If the content fits inside `.content`, nothing changes—no scrollbar appears.
2. **When Content Overflows:** If the content grows taller than the available height of `.content`, the browser **automatically adds a vertical scrollbar** *only* to that section.

---

### Why It's Crucial for Dashboard Layouts

In fixed dashboard layouts (like a header + sidebar + main content grid), you usually want the header and sidebar to stay fixed on screen while **only the main content scrolls**.

```css
.content {
  grid-area: content;
  padding: var(--space-8);
  
  /* Limits height or lets grid dictate height, then enables inner scrolling */
  overflow-y: auto; 
}

```

Without `overflow-y: auto;`, long content will either:

* **Spill out visually** over the footer or outside the grid container.
* **Force the entire webpage window to scroll**, causing the header and sidebar to slide off screen as you scroll down.

---

### Key `overflow-y` Values

| Value | Behavior |
| --- | --- |
| `visible` | *(Default)* Content leaks outside the box without scrollbars. |
| `hidden` | Any overflowing content is chopped off and hidden completely. |
| `scroll` | **Always** shows a vertical scrollbar, even if content fits. |
| `auto` | Shows a vertical scrollbar **only when needed** (best practice). |

---

Would you like to write the CSS for the dashboard with the **metrics row**, or move straight to **Lesson 1 of `::before` and `::after**`?

That CSS rule is a classic **"Zero-Media-Query Responsive Layout."** It tells the browser to create as many columns as will fit, adjust their size automatically, and never let a card get smaller than `200px`.

Here is how each piece breaks down:

---

### 1. `repeat()`

Instead of writing `200px 200px 200px 200px` manually, `repeat(count, size)` repeats a column pattern for you.

---

### 2. `auto-fit`

Instead of passing a hardcoded number like `repeat(4, ...)`, `auto-fit` lets the browser calculate the number of columns dynamically based on the parent container's current width.

* **On a wide screen:** It fits 4 or 5 columns side-by-side.
* **On a phone screen:** It automatically drops down to 1 or 2 columns without needing a `@media` query.

---

### 3. `minmax(200px, 1fr)`

This sets a **minimum** and **maximum** width range for every column:

$$\text{minmax}(\text{MIN}, \text{MAX})$$

* **`200px` (Minimum):** Columns will never shrink below `200px`. If the screen is too narrow to fit another `200px` column, the browser wraps the extra card onto a new row.
* **`1fr` (Maximum):** `1fr` means "1 fraction of available space." Once the minimum `200px` requirements are met, any extra empty space on the right side of the container is divided equally among all cards, expanding them so they fill the row completely.

---

### How It Behaves in Real Life

Imagine a dashboard container that is **$900\text{px}$ wide**:

1. The browser calculates how many $200\text{px}$ cards fit into $900\text{px}$ (including gap space).
2. It determines that **4 cards** can fit ($4 \times 200\text{px} = 800\text{px}$).
3. There is $100\text{px}$ of extra space left over. Because of `1fr`, it distributes that extra space evenly so each card stretches slightly wider than $200\text{px}$ to fill the whole width cleanly.
4. If you resize the browser down to **$500\text{px}$ wide**, 4 cards no longer fit. The grid automatically rearranges into **2 columns**, wrapping the other cards onto the next row.

---

### Ready for Lesson 1 of `::before` and `::after`?

Now that we've covered responsive grids, let's complete your initial `::before` / `::after` task!

**Task Requirements:**

1. Write HTML for a button: `<button class="buy-btn">Buy Now</button>`.
2. Write CSS using `::before` or `::after` to insert a price tag via `content` (e.g., `$19.99 - `).
3. Apply styling (color, font-weight, or background) to make the pseudo-element stand out from the main text.

Drop your HTML and CSS below!