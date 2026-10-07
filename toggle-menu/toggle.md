







Awesome! Pure CSS first, JavaScript later when you're ready.

Step 2: Pure CSS Responsive Navbar Dropdown
Explanation:
To make a menu toggle work in pure CSS (without JavaScript), we use the "Checkbox Hack":

We create a hidden <input type="checkbox"> in HTML.

We wrap our menu icon in a <label for="..."> that points to that checkbox. Clicking the label checks/unchecks the checkbox!

In CSS, we use the :checked pseudo-class and the general sibling selector (~) to show or hide the menu when the checkbox is checked.

We also add a @media query so the hamburger button and dropdown menu are only visible on smaller screens (e.g., screens under 768px).

Example:
CSS
/* Hide menu by default */
.mobile-dropdown {
  display: none;
}

/* Show menu when checkbox is checked */
#menu-toggle-checkbox:checked ~ .mobile-dropdown {
  display: block;
}
Your Code Task: Update index.html and style.css
1. Update the HTML in index.html:
Replace your <header> and <nav> elements with this pure CSS checkbox version:


The ~ selector means:
"Find a later sibling of the checkbox."

The real missing piece was:

hamburger → checkbox

Using:

<label for="menu-toggle-checkbox">

creates that connection.


If you want the hamburger icon to change

You can also make the menu icon become an X when opened, still with zero JavaScript:

#menu-toggle-checkbox:checked ~ .top-navbar .menu-btn .material-symbols-outlined {
  font-variation-settings: 'FILL' 1;
}

Or, if you want the actual text to change from menu to close, that's a little different because Material Symbols don't automatically change their text content with CSS. We can do that with a tiny CSS/HTML trick or JavaScript.



Making the mobile menu slide down smoothly with **pure CSS** is a fantastic upgrade!

Since CSS cannot animate the `display` property directly (e.g., from `display: none` to `display: block`), we achieve smooth animations using `max-height`, `opacity`, and `transition`.

---

### Step 1D: Smooth Slide-Down Animation with Pure CSS

#### Explanation:

1. **Collapsed State:** Set `max-height: 0`, `opacity: 0`, and `overflow: hidden`. This collapses the menu's height to zero, making it completely invisible and taking up no space.
2. **Expanded State:** When the checkbox is checked (`#menu-toggle:checked ~ .mobile-dropdown`), set `max-height: 300px` (or any height larger than your menu) and `opacity: 1`.
3. **Transition:** Add `transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;` to interpolate smoothly between the two states.

---

#### Example:

```css
/* Animated Container */
.dropdown-menu {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

/* Expanded State */
.checkbox:checked ~ .dropdown-menu {
  max-height: 300px; /* Big enough to fit all content */
  opacity: 1;
}

```

---

### Your Code Task: Update `style.css`

Open your `style.css` file and replace your previous `.mobile-dropdown` and `.menu-toggle-checkbox:checked ~ .mobile-dropdown` rules with this animated version:

```css
/* Mobile Dropdown Styling with CSS Animation */
.mobile-dropdown {
  max-height: 0;             /* Fully collapsed */
  opacity: 0;                /* Invisible */
  overflow: hidden;          /* Prevents content spilling out while animating */
  background-color: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  padding: 0 16px;           /* Vertical padding animated via max-height container */
  
  /* Smooth transition for sliding effect */
  transition: max-height 0.3s ease-in-out, opacity 0.25s ease-in-out, padding 0.3s ease-in-out;
}

.mobile-dropdown ul {
  list-style: none;
}

.mobile-dropdown li {
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.mobile-dropdown li:last-child {
  border-bottom: none;
}

.mobile-dropdown a {
  text-decoration: none;
  color: #171717;
  font-weight: 500;
  display: block;
}

.mobile-dropdown a:hover {
  color: #3b49df;
}

/* PURE CSS TOGGLE RULE: Expand menu when checkbox is checked */
.menu-toggle-checkbox:checked ~ .mobile-dropdown {
  max-height: 300px;         /* Expands smoothly down */
  opacity: 1;                /* Fades in */
  padding: 12px 16px;        /* Restores full padding */
}

```

---

### Test It Out!

Shrink your browser screen to mobile size (< 768px) and click the hamburger icon. You should now see the menu smoothly slide down and fade in!

Once you try it, let me know if it slides nicely so we can jump straight to building the **Expanding `:focus-within` Input** inside the middle grid section!