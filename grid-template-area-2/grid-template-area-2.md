The part I want you to study

Don't worry about all the CSS at once. Focus on this:

.page-layout {
  display: grid;

  grid-template-columns:
    230px
    minmax(0, 1fr)
    280px;

  grid-template-areas:
    "header header header"
    "left   main   right"
    "footer footer footer";
}

You're basically drawing your website with CSS:

┌─────────────────────────────────────────────┐
│                   HEADER                    │
├──────────────┬─────────────────┬────────────┤
│              │                 │            │
│     LEFT     │      MAIN       │    RIGHT   │
│              │                 │            │
├──────────────┴─────────────────┴────────────┤
│                   FOOTER                    │
└─────────────────────────────────────────────┘

Then:

.site-header {
  grid-area: header;
}

means:

Put .site-header where I wrote header.

And:

.sidebar-left {
  grid-area: left;
}

means:

Put .sidebar-left where I wrote left.

That's the fundamental idea behind grid-template-areas.

The really useful part is the mobile version:

grid-template-areas:
  "header"
  "main"
  "footer";

You're essentially telling the browser:

"Forget the three-column desktop arrangement. On a small screen, I want one column."

And you haven't had to rearrange your HTML at all.