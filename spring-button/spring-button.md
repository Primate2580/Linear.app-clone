The foundation of this animation relies on having a clear container and a dedicated element to trigger the hover state.

### Explanation

To create a custom animated button, we start with standard HTML anchor (`<a>`) or `<button>` tags wrapped inside a container. We use two CSS classes:

* **Base class (`btn`):** Handles common button properties shared across your site (like padding or typography).
* **Variant class (`btn-pulse`):** Applies the specific hover animation and color scheme.

### Hint

Make sure your element has text directly inside it so the text remains visible over the sliding background overlay we'll build later.

---

### Task 1

Write the base HTML code for your button using a link tag (`<a>`) with both the `btn` and `btn-pulse` classes applied.

Once you have written or confirmed your HTML, let me know and we will move on to **Step 2: Base Button Styles**.

<div class = "button-wrapper">
<a href = "" class = "btn btn-pulse"> Explore </a> 
</div>

Great job! Your base HTML structure is ready.

Now we move on to styling the static button container.

### Explanation

Before we add any animation, we need to style the button's layout, text, and border. Two properties here are critical for the animation to work later:

* **`position: relative;`**: This turns the button into a structural frame so our sliding background layer stays constrained inside it.
* **`overflow: hidden;`**: This acts like a window frame. It hides the background layer when it is sitting off to the side before the hover action starts.

### Hint

We also set `z-index: 0` to create a stacking layer, ensuring the text stays sitting on top of the sliding color block.

---

### Task 2

Write the CSS rules for `.btn.btn-pulse` to set up:

1. Position (`relative`) and overflow (`hidden`)
2. Padding, border, text colors, and font styling
3. `z-index: 0` and a `transition` for the text color (`color 0.2s ease-in-out`)

Give it a try and paste your CSS when ready!

very short, why do we have this here, and not on the ::before or on hover:

///transition for the text color (color 0.2s ease-in-out)///

We place transition: color 0.2s ease-in-out on the base .btn.btn-pulse rule so the text color animates smoothly both ways: when you hover on and when you mouse off.

If you put it on :hover instead, the text color would change smoothly when hovering on, but snap instantly back to the original color when you move your cursor away.

```css
.btn.btn-pulse {
  position: relative;
  overflow: hidden;
  padding: 15px 25px;
  color: lightgrey;
  border: 2px solid black;
  font-weight: 700;
  font-size: 1rem;
  z-index: 0;
  transition: color 0.2s ease-in-out;
  text-transform: uppercase;
  text-decoration: none;
}
```

You are almost there! There is just **one small syntax error** in your code:

* On the `padding` line, you used a colon `:` at the end instead of a semicolon `;` (`padding: 15px 25px:`).

Here is the corrected CSS rule:

```css
.btn.btn-pulse {
  position: relative;
  overflow: hidden;
  padding: 15px 25px;
  color: lightgrey;
  border: 2px solid black;
  font-weight: 700;
  font-size: 1rem;
  z-index: 0;
  transition: color 0.2s ease-in-out;
  text-transform: uppercase;
  text-decoration: none;
}

```

---

### Step 3: Create the Animated Background Layer (`::before`)

Now we build the hidden layer that will slide in during hover.

### Explanation

We use a CSS pseudo-element (`::before`) to generate a solid color block inside the button:

* **`position: absolute`** with `top: 0; left: 0; right: 0; bottom: 0;` stretches this hidden block to fill the exact size of the button.
* **`transform: translateX(-101%)`** pushes this block completely off-screen to the left (101% ensures no pixel slivers peek through).
* **`z-index: -1`** places this block behind the button's text.
* **`transition: transform 0.2s ease-in-out`** ensures the sliding motion is smooth when hovering on and off.

### Hint

Don't forget to include `content: "";` — without it, pseudo-elements like `::before` will not render on the page.

---

### Task 3

Write the CSS rule for `.btn.btn-pulse::before` to set up:

1. `content: ""` and `position: absolute` covering all 4 edges (`0`)
2. A solid `background-color` (e.g., `black` or an accent color matching your border)
3. `transform: translateX(-101%)` and `z-index: -1`
4. `transition: transform 0.2s ease-in-out`

Paste your CSS when ready!
```css
.btn.btn-pulse::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: black;
  transform: translateX(-101%);
  z-index: -1;
  transition: transform 0.2s ease-in-out;
}
```
Spot on! Your pseudo-element is setup perfectly.

Now we bring it all to life with the final step: handling the hover state.

---

### Step 4: Configure Hover Interactions

### Explanation

When a user hovers over the button (`:hover`), two things need to happen simultaneously:

1. **Move the background:** Bring the hidden `::before` pseudo-element back inside the button frame by setting its horizontal transform back to `0`.
2. **Update the text color:** Change the button's text color so it remains visible and easy to read against the new dark background.

### Hint

To target the pseudo-element when hovering over the button, chain the selectors like this:

`.btn.btn-pulse:hover::before`

---

### Task 4

Write two CSS hover rules:

1. `.btn.btn-pulse:hover` — Change the text `color` (e.g., to `#ffffff`).
2. `.btn.btn-pulse:hover::before` — Set `transform: translateX(0);` to slide the background into view.

Paste your CSS when ready, and we will review the complete working button!

```css
.btn.btn-pulse:hover{
color: #ffffff;
}

.btn.btn-pulse:hover::before{
transform: translateX(0);
}