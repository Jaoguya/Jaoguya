# Orbital CV

Two views of the same CV on one page.

**The hero** is an oval orbit seen from a high angle, like a solar system from
above: the slide at the near point of the curve fills the screen, the rest shrink,
blur and swing round behind it.

**Scroll down** and it becomes an ordinary website — the name, then every section
again as plain, readable, linkable document text.

Five files, no build step, **no JavaScript dependencies**.

| File | What it is |
|---|---|
| `index.html` | Markup: hero, document, footer, one modal |
| `style.css` | All styling, including the sky and the planet orbs |
| `main.js` | LaTeX→HTML parser + orbit (~200 lines) |
| `cv.tex` | The CV. Sections are read at runtime |
| `assets/milkyway.avif` | The backdrop photograph |

## How it works

- `main.js` fetches `cv.tex` and splits it on `\section{...}`.
- Each section becomes one slide, in the order it appears in the file.
- `place()` puts every slide on the oval from one continuous number, `pos`:
  `x = sin(a) · radiusX`, `y = (cos(a) − 1) · radiusY`, and
  `scale = 1 / (1 + distance · FALLOFF)` — a perspective-style falloff, so the
  front slide is full size and each one behind drops off sharply.
  Opacity, blur and z-order come off the same distance.
- A small rAF tween eases `pos` toward `target`, so slides follow the *arc*
  rather than cutting a straight line. Dragging scrubs `pos` under your finger.
- `pos` is unbounded, so the orbit loops forever in both directions.
- Only the front slide shows its text; the rest read as labelled cards. The hero
  clips long sections — the document below carries them in full.
- The same sections render again into `#doc` as `.doc-section` articles. Their
  ids are prefixed (`#s-research`) so the hero's own `#research` hash never makes
  the browser jump down the page.

**To reorder the deck, reorder the `\section{}` blocks in `cv.tex`.** No JS changes.

## Navigation

**The wheel never touches the orbit.** Scrolling only ever scrolls the page, so
the two can't fight.

| Input | Action |
|---|---|
| Scroll | move through the page, as on any site |
| Planets in the left rail | jump to that section |
| Drag horizontally, or swipe | next / previous slide |
| `←` `→` keys, `‹` `›` buttons | next / previous slide (hero only) |
| **Read the full CV** | jump to the document |
| `#research`, `#activities`, … | open straight to that slide |

A burst of clicks can queue at most `BACKLOG` slides (1.6), so hammering the
arrows never sends the deck on a long spin you have to wait out.

A slide taller than the card scrolls its own text first; the deck only advances
once you reach the bottom (or top) of that slide.

## Design

- **Type** — Source Serif 4, italic for every heading, label, button and section
  title; upright for body copy so long passages stay readable. The serif is
  deliberate: the CV is typeset in LaTeX with a Times-like face, so the text reads
  like the document it came from. Space Grotesk survives only on dates and section
  numbers, where tabular figures matter.
- **Sky**, bottom to top — the Milky Way photograph, cooled and dimmed
  (`saturate(.58) brightness(.68)`) and slowly swelling; a `.veil` of indigo
  gradients that pulls the photo's warm gold toward the page's palette; a 700-star
  canvas turning once every 240s; and three blurred aurora curtains on
  `mix-blend-mode: screen`, dropped to ~30% opacity so they sit *in* the photo
  rather than on top of it. All motion stops under `prefers-reduced-motion`.
- **The rail** — each section is a lit sphere: a highlight, a body in the section's
  own tint, and an inset terminator shadow. The first is the sun, so section one is
  gold — which also bridges the palette to the photograph's warm core. Every planet
  is the same 26px; only the sun's corona sets it apart.
- **Fallback** — if a browser can't decode AVIF the photo simply doesn't paint and
  the veil plus aurora carry the background on their own.
- **The orbit** — tune the shape in `main.js`: `radiusX` / `radiusY` in `measure()`
  set how wide and how deep the oval is, `FALLOFF` how fast slides shrink behind
  the front one, `EASE` how quickly the deck settles. `--rail-w` in `style.css`
  sets how much room the left rail takes from the orbit.
- **Slide colour** — each slide sets `--tint` from the aurora palette; the border
  glow, bullet markers, scrollbar and rail underline all inherit it.

## Accessibility

Reviewed against the Vercel Web Interface Guidelines. Off-screen slides are `inert`
(no tabbing into invisible cards), slide changes announce through an `aria-live`
region, the modal moves focus in and returns it on close, arrow keys are ignored
while the modal is open, and every section is deep-linkable by `#slug`.

## Editing

Everything tweakable sits in the `edit me` block at the top of `main.js`:

- `RENAME` — show a friendlier heading than the LaTeX one (`Profile` → `About Me`)
- `TINTS` — the per-slide accent colours
- `FRIEND_CODES` — gamer tags shown in the Friend Codes modal
- `CONTACT_HTML` — the Get in Touch modal

The **Download CV** button in `index.html` points at `cv.tex` — compile a
`cv.pdf`, drop it in this folder, and change that one `href`.

## Run locally

```sh
python3 -m http.server 8000    # then open http://localhost:8000
```

`fetch('cv.tex')` is blocked on `file://`, so opening `index.html` from disk
shows an empty deck. It needs a real server.

## Deploy to Vercel

Static — no config, no build command.

```sh
npx vercel --cwd solar --prod
```

Or in the dashboard: import the repo and set **Root Directory** to `solar`.
