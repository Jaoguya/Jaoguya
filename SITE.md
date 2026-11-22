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
| `chat.js` | The chat bubble, bottom right. Loads after `main.js` and reads its `CONTACT` |
| `api/chat.js` | Vercel function: answers the chat's typed questions with Claude Haiku 5.5 (needs `ANTHROPIC_API_KEY`) |
| `package.json` | The one dependency, `@anthropic-ai/sdk`, for `api/chat.js` |

## The idea

A clay desktop. One big **Welcome** folder sits in the middle; open it and a
contact card pops out with the email and phone number (copy buttons, Write in
Gmail, Call, LinkedIn). Every public GitHub repo is a smaller folder dropped on a
random free spot round it. The folders shrink as repos are added, so 30+ still fit
on a laptop screen (`folderSize()` in `main.js`). Each folder has a box hitbox, so
none overlap: drag one into another and the one it hits is shoved away, slides,
bounces off the desk edges, the Welcome folder and other folders, and slows to a stop. Click a folder and its flap swings open and a window pops out of it with the
project's details and its README.

Everything is drawn in CSS — no images. A folder is three layers (back panel with
a tab, a sheet of paper, the front flap), sized in `em` so the same build makes the
small icons and the big Welcome. The clay look is one shadow recipe, `--clay`: a
light inner highlight top-left, a darker inner shade bottom-right and a soft drop.
Light theme only.

Soap bubbles drift up behind the folders on a `<canvas>` (`#bubbles`), each tinted
from `COLORS`, and pop with a ring and droplets when the cursor or a finger touches
one. Up to 36 at once, scaled to the screen; drawing pauses in a hidden tab and
becomes a still scatter under `prefers-reduced-motion`.

## The chat bubble

A messenger-style assistant in the bottom-right corner (`chat.js`, styles at the
end of `style.css`). The buttons and forms are scripted; **typed questions are
answered by Claude Haiku 5.5 at the lowest effort** through the Vercel function
`api/chat.js`, which answers only from the `PROFILE` written in that file. A
first-time visitor sees a "Hiring interns?" nudge after 4 s; dismissing it or
opening the chat is remembered in `localStorage` (`chat-seen`).

**AI setup:** the function needs `ANTHROPIC_API_KEY` in the Vercel project's
Environment Variables (Production). Without it, or on a local
`python3 -m http.server` preview where `/api` doesn't exist, typed questions fall
back to the keyword answers in `FAQ`. The function caps each visitor at 12
questions per 10 minutes per warm instance and trims long messages. The
assistant only knows what `PROFILE` says, so update it when the CV changes.

The menu has four buttons:

| Button | What happens |
|---|---|
| Get to know me | Intro, then Education / Research / Internship / Skills. Research can open the ZK-Redact, BVCRSA and PLOSHA-RMFR folders |
| Contact me | Asks company, name, position and email, then writes a "we're interested, please send your CV" email to `CONTACT.email` |
| Ask a question | Keyword answers from `FAQ` (dates, CV, AI, skills, research, location, awards…). Anything unknown can be emailed as a question |
| Report a bug | Asks what went wrong and an optional reply address, then writes a bug email with the page, screen size and browser added |

Emails are never sent by the site: the draft opens in the visitor's mail app
(`mailto:`) or Gmail, or can be copied. Typed text works too: "bug" starts a
bug report, "hiring"/"job" starts Contact, anything else is a question.

Asking for the CV ("CV", "resume", or **📄 My CV** under Get to know me) shows a
card with a picture of its first page, plus **Preview** (opens the PDF in a new
tab) and **Download PDF**. The files are `assets/cv/Tagrid_Chongkolrattanapond_CV.pdf`
and `assets/cv/cv-preview.png` (`CV` in `chat.js`). To update them after editing
the CV:

```sh
cp ~/cv/Tagrid_CV_General.pdf assets/cv/Tagrid_Chongkolrattanapond_CV.pdf
pdftoppm -png -r 60 -f 1 -l 1 -singlefile assets/cv/Tagrid_Chongkolrattanapond_CV.pdf assets/cv/cv-preview
```

To change what it says, edit `ABOUT`, `FAQ` and `SUGGESTED` at the top of `chat.js`.

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
| Drag a folder | move it, shoving aside any it hits; let go mid-swing and it slides on. Spots are remembered in this browser |
| **Shuffle** | scatter every folder to new random spots |
| Esc, the red dot, or clicking outside | close the window |
| `#repo-name` in the URL | opens that folder on load |
| `#contact` in the URL | opens the contact card on load |

Under 720px wide the Welcome folder sits on top and the folders fall into a
grid; dragging is off there so the page can scroll. Under
`prefers-reduced-motion` nothing bobs, springs or flies, and shoved folders just step aside.

## Run it

```sh
python3 -m http.server 8000    # then open http://localhost:8000
```

Hard-reload (`Cmd+Shift+R`) after editing CSS.

## Deploy

Static, no config, no build command; Vercel installs `package.json` for `api/chat.js` and redeploys on every push to `main`.
