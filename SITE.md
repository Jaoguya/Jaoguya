# The website in this repo

`index.html`, `style.css` and `main.js` at the repo root are Tagrid's portfolio
site, live at https://jaoguya.vercel.app. No build step and no JavaScript
dependencies.

> `README.md` is **not** part of the site — this repo is `Jaoguya/Jaoguya`, so
> that file is the GitHub profile page. Leave it alone.

| File | What it is |
|---|---|
| `index.html` | Markup: menu bar, the desk, the Welcome folder, the project window |
| `style.css` | All styling: the clay recipe, the folders, the window |
| `main.js` | GitHub fetch, folder layout and dragging, the window, README rendering |

## The idea

A clay desktop. One big **Welcome** folder sits in the middle; open it and a
contact card pops out with the email and phone number (copy buttons, Write in
Gmail, Call, LinkedIn). Every public GitHub repo is a smaller folder spaced round it in an
oval. Click a folder and its flap swings open and a window pops out of it with the
project's details and its README.

Everything is drawn in CSS — no images. A folder is three layers (back panel with
a tab, a sheet of paper, the front flap), sized in `em` so the same build makes the
small icons and the big Welcome. The clay look is one shadow recipe, `--clay`: a
light inner highlight top-left, a darker inner shade bottom-right and a soft drop.
Light theme only.

## Where the content comes from

**Folders — live from GitHub.** `main.js` fetches
`api.github.com/users/Jaoguya/repos`, so a new public repo gets a folder by itself.
Knobs at the top of the file:

- `GH_ORDER` — folder order, clockwise from the top. Repos not listed come after.
- `GH_SKIP` — repos to leave out. The profile repo (this site) is in here.
- `NOTES` — what GitHub can't know: `label` (a nicer folder name), `full` title,
  `venue`, `points`. A repo without notes uses its GitHub description.
- `COLORS` — the pastel each folder gets, in turn.
- `CONTACT` — the email, phone and LinkedIn the Welcome folder shows.

**README — rendered by GitHub.** Opening a folder asks the API for that repo's
README as HTML (`application/vnd.github.html+json`), once per repo per visit.
`cleanReadme()` strips scripts and event handlers, drops any id that isn't one of
GitHub's `user-content-*` ones so it can't clash with the page's own, and points
relative images and links at the repo.

The API allows 60 unauthenticated requests an hour per visitor. If the repo list
fails, the folders fall back to the `GH_ORDER` names; if a README fails, the window
links to it on GitHub instead.

## Using it

| Input | Action |
|---|---|
| Click / Enter on a folder | open its window |
| Click the Welcome folder | open the contact card |
| Drag a folder | move it; the spot is remembered in this browser |
| **Tidy up** | put every folder back in the oval |
| Esc, the red dot, or clicking outside | close the window |
| `#repo-name` in the URL | opens that folder on load |
| `#contact` in the URL | opens the contact card on load |

Under 720px wide the Welcome folder sits on top and the folders fall into a
two-column grid; dragging is off there so the page can scroll. Under
`prefers-reduced-motion` nothing bobs, springs or flies.

## Run it

```sh
python3 -m http.server 8000    # then open http://localhost:8000
```

Hard-reload (`Cmd+Shift+R`) after editing CSS.

## Deploy

Static, no config, no build command. Vercel redeploys on every push to `main`.
