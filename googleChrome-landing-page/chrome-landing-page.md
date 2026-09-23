You hit the nail on the head! Modern dropdown search containers rely heavily on the **`:focus-within`** CSS pseudo-class.

When any child element (like an `<input>`) gets focused, `:focus-within` detects it on the parent container. This allows us to expand the parent box, change the border radius, shadow, and reveal hidden dropdown items without writing a single line of JavaScript.

---

### Step 1: Base HTML Structure

### Explanation

To recreate this UI, we need a parent container wrapping three main parts:

1. **Search Input Bar:** An icon, the `<input type="text">`, and any extra buttons (like "AI Mode").
2. **Dropdown List:** A list container that starts hidden or collapsed and expands when the input receives focus.
3. **Recent Search Items:** Rows containing a **clock icon**, the **query text**, and a **delete/cancel icon ("✕")** on the far right that highlights on hover.

### Hint

Using inline SVGs for icons gives you full CSS control over their color and size. For the dropdown item, flexbox makes it easy to space out the left icon, text, and right cancel button.

---

### Task 1

Write the HTML for the search wrapper holding:

* A container `<div class="search-box">`
* An `<input type="text" placeholder="Ask Google">` inside an input row
* A `<ul class="suggestions">` list containing at least one `<li>` search item (with a clock icon span, text span, and a close button `✕`).

Write your HTML structure and paste it here!