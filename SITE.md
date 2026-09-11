# The website in this repo

`index.html`, `style.css` and `main.js` at the repo root are Tagrid's portfolio
site. No build step and no JavaScript dependencies.

> `README.md` is **not** part of the site — this repo is `Jaoguya/Jaoguya`, so
> that file is the GitHub profile page. Leave it alone.

| File | What it is |
|---|---|
| `index.html` | Markup: project hero, CV document, footer, one modal |
| `style.css` | All styling, including the sky and the planet orbs |
| `main.js` | LaTeX parser, GitHub fetch, and the orbit |
| `cv.tex` | The CV. Sections are read at runtime |
| `assets/milkyway.avif` | The backdrop photograph |

## Two sections

**1 — Solar Project System.** An oval orbit seen from a high angle. Each slide is
a GitHub repository; the one at the near point of the curve fills the screen while
the rest shrink, blur and swing round behind it. A left rail lists them as lit
spheres, the sun first.

**2 — The CV.** Scroll down and the page becomes an ordinary two-column site: a
sticky left column carrying the name, a section index and the contact links, with
the CV itself on the right. That column *is* the header — it exists only in this
section, so it appears when you scroll and never covers the orbit.

## Where the content comes from

**Projects — live from GitHub.** `main.js` fetches
`api.github.com/users/Jaoguya/repos`, so a new public repo shows up on the site by
itself. Three knobs at the top of the file:

- `GH_ORDER` — the repos to show first, in this order. Anything not listed is
  appended alphabetically after them.
- `GH_SKIP` — repos to leave out. The profile repo is already in here.
- `NOTES` — the venue and bullet points GitHub can't know. A repo with no entry
  falls back to its GitHub description; a repo with neither says so on the card,
  which is the nudge to go write a description.

The API allows 60 unauthenticated requests an hour per visitor. If that fails, or
the visitor is offline, the orbit falls back to the `GH_ORDER` names as bare links.

**CV — from `cv.tex`.** Split on `\section{...}` and converted to HTML at runtime.
Reorder the `\section{}` blocks and the document reorders with them.

## Navigation

The wheel never touches the orbit — scrolling only ever scrolls the page, so the
two can't fight.

| Input | Action |
|---|---|
| Scroll | move through the page |
| Planets in the left rail | jump to that project |
| Drag horizontally, or swipe | next / previous project |
| `←` `→` keys, `‹` `›` buttons | next / previous project (hero only) |
| **Read the full CV** | jump to the document |

A burst of clicks queues at most `BACKLOG` (1.6) projects, so hammering the arrows
never starts a long spin.

## How it is drawn

`place()` puts every slide on the oval from one continuous number, `pos`:
`x = sin(a)·radiusX`, `y = (cos(a) − 1)·radiusY`, and
`scale = 1 / (1 + distance·FALLOFF)` — a perspective-style falloff. Opacity, blur
and z-order come off the same distance. A small rAF tween eases `pos` toward
`target` so slides follow the arc rather than cutting a straight line; dragging
scrubs `pos` under your finger. `pos` is unbounded, so the orbit loops forever.

Tuning lives in `main.js` (`radiusX`, `radiusY`, `FALLOFF`, `EASE`) and
`style.css` (`--rail-w` for how much room the rail takes from the orbit).

## The sky

Bottom to top: the Milky Way photograph, cooled and dimmed
(`saturate(.58) brightness(.68)`) and slowly swelling; a `.veil` of indigo
gradients pulling its warm gold toward the page palette; a 700-star canvas turning
once every 240s; three blurred aurora curtains at ~30% opacity on
`mix-blend-mode: screen`. All motion stops under `prefers-reduced-motion`. If a
browser can't decode AVIF the photo simply doesn't paint and the rest carries it.

## Type

Source Serif 4 — italic for every heading, label and button, upright for body
copy so long passages stay readable. Space Grotesk survives only on dates and
section numbers, where tabular figures matter.

## Run it

```sh
python3 -m http.server 8000    # then open http://localhost:8000
```

`fetch('cv.tex')` is blocked on `file://`, so it needs a real server. Hard-reload
(`Cmd+Shift+R`) after editing CSS — the dev server's caching is aggressive.

## Deploy

Static, no config, no build command. The site is at the repo root, so a default
Vercel import serves it:

```sh
npx vercel --prod
```
