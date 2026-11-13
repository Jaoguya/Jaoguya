/* ---------- edit me ---------------------------------------------------- */
const GH_USER = 'Jaoguya';
const GH_SKIP = ['Jaoguya'];           // the profile repo is this site, not a project

// folders in this order, clockwise from the top; anything new on GitHub is added after them
const GH_ORDER = ['BVCRSA', 'PLOSHA-RMFR', 'OJCOMS', 'ZKRedact', 'VeRedact', 'Lost-Found---website', 'jaoguyagmail'];

// what GitHub cannot tell us. `label` renames the folder; the rest fills its window.
// Anything left out falls back to the repo's GitHub description.
const NOTES = {
  'BVCRSA': {
    full: 'Blockchain-Based Verifiable Conjunctive Range Search and Aggregation over Encrypted IIoT Data',
    venue: 'IEEE journal — under review',
    points: [
      'Blockchain-verified search and analytics over encrypted industrial sensor data, with attribute-based access control and verifiable homomorphic aggregation.',
      'Contributed to scheme design; implemented the prototype and ran the evaluation.',
      'An earlier version, AC-SCRAT (Adaptive Context-bound Secure Range-Cover Aggregate Tree over Encrypted IIoT Data), was accepted at IEEE CSCloud 2027.',
    ],
  },
  'PLOSHA-RMFR': {
    full: 'Predictive Load-Sharing Hierarchical Aggregation with Risk-Aware Multi-Layer Fault Recovery',
    venue: 'IEEE Internet of Things Journal — under review',
    points: [
      'Fault-tolerant secure aggregation that keeps industrial IoT data processing running through node failures, cutting recovery time and data loss.',
      'Implemented and debugged the framework and ran the experimental evaluation.',
    ],
  },
  'OJCOMS': {
    full: 'Fog-Assisted Multi-Authority Verifiable Dynamic Searchable Encryption with Adaptive Load Balancing',
    venue: 'IEEE Open Journal of the Communications Society — in progress',
    points: [
      'Self-optimizing encrypted search index that adapts to query patterns for faster range retrieval.',
      'Contributed to scheme design; implemented the prototype and ran the evaluation.',
    ],
  },
  'ZKRedact': {
    full: 'Efficient Zero-Knowledge Authorized Redaction and Provenance Auditing for Permissioned Blockchains',
    venue: 'IEEE KST 2027 — accepted',
    points: [
      'Lets requesters prove in zero knowledge that a redaction is authorized, verifies requests in parallel batches, and keeps a Merkle-authenticated provenance history auditors can check.',
      'Worked with the team on the scheme design and testing.',
    ],
  },
  'VeRedact': {
    full: 'Post-Quantum Secure Verifiable Redaction and Privacy-Preserving Auditing for Large-Scale Permissioned Blockchains',
    points: [
      'Scalable post-quantum redaction with multi-party authorization and verifiable auditing.',
      'Worked on the scheme design and testing.',
    ],
  },
  'Lost-Found---website': { label: 'Lost & Found' },
  'jaoguyagmail': { label: 'Inbox Sorter' },
};

// what the Welcome folder opens
const CONTACT = {
  email: 'guyhd9119@gmail.com',
  phone: '099-757-3959',
  tel: '+66997573959',
  linkedin: 'https://www.linkedin.com/in/tagrid-chongkolrattanapond-7188b63a8/',
};

// the Welcome folder's color, used by no project folder
const WELCOME_COLOR = '#ffb38a';

// 30 candy pastels, one per project folder in order, none repeated until the 31st.
// Each one was picked to be as far as possible from the colors before it.
const COLORS = [
  '#bded82', '#8fd3ff', '#9be7b8', '#c6a8ff', '#ffe27a', '#ff8fa3',
  '#7fe3d8', '#ff8fdd', '#5af6b8', '#8bb1f9', '#ffc2ff', '#52e5ff',
  '#f6b85a', '#f19dc7', '#94f09d', '#eed18b', '#5af6d7', '#f1a3ff',
  '#ff9d5c', '#52baff', '#f9968b', '#bbb8ff', '#5af6f6', '#52d4ff',
  '#ebb470', '#baf19d', '#ff8fc7', '#faa8ee', '#82edb2', '#eee48b',
];

/* ---------- helpers ----------------------------------------------------- */
const $ = s => document.querySelector(s);
const slug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const still = matchMedia('(prefers-reduced-motion: reduce)');
const narrow = matchMedia('(max-width: 720px)');

const store = {                                  // per-visitor only; may be unavailable
  get(area, key) { try { return JSON.parse(area.getItem(key)); } catch { return null; } },
  set(area, key, v) { try { area.setItem(key, JSON.stringify(v)); } catch {} },
  drop(area, key) { try { area.removeItem(key); } catch {} },
};

const desk = $('#desk');
const welcome = $('#welcome');
const holder = $('#folders');
const live = $('#live');

let repos = [];
let folders = [];

/* ---------- menu bar clock ---------------------------------------------- */
const clock = $('#clock');
const tickClock = () => {
  const now = new Date();
  clock.dateTime = now.toISOString();
  clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
tickClock();
setInterval(tickClock, 15000);

/* ---------- layout: an oval of folders round the Welcome folder --------- */
/* positions are stored as fractions of the desk, so a resize keeps the arrangement */
const LAYOUT_KEY = 'desk-layout:v1';
let layout = store.get(localStorage, LAYOUT_KEY) || {};

function defaultSpot(i, n) {
  const W = desk.clientWidth, H = desk.clientHeight;
  const w = welcome.offsetWidth, h = welcome.offsetHeight;
  const rx = Math.min(W / 2 - 90, Math.max(w / 2 + 130, W * 0.36));
  const ry = Math.min(H / 2 - 80, Math.max(h / 2 + 90, H * 0.36));
  const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
  return [(W / 2 + Math.cos(a) * rx) / W, (H / 2 + Math.sin(a) * ry) / H];
}

function clampPx(el, x, y) {
  const W = desk.clientWidth, H = desk.clientHeight;
  const hw = el.offsetWidth / 2, hh = el.offsetHeight / 2;
  return [Math.min(W - hw, Math.max(hw, x)), Math.min(H - hh, Math.max(hh, y))];
}

function placeAll(animate = false) {
  if (narrow.matches) {                          // phone: CSS grid does the layout
    folders.forEach(el => { el.style.left = el.style.top = ''; });
    return;
  }
  const W = desk.clientWidth, H = desk.clientHeight;
  folders.forEach((el, i) => {
    const [fx, fy] = layout[el.dataset.repo] || defaultSpot(i, folders.length);
    const [x, y] = clampPx(el, fx * W, fy * H);
    el.classList.toggle('settle', animate && !still.matches);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  });
}

$('#tidy').onclick = () => {
  layout = {};
  store.drop(localStorage, LAYOUT_KEY);
  placeAll(true);
  live.textContent = 'Folders tidied';
};

addEventListener('resize', () => placeAll());
narrow.addEventListener('change', () => placeAll());

/* ---------- dragging ----------------------------------------------------- */
let drag = null;
let topZ = 10;

function onDown(e) {
  if (narrow.matches || e.button !== 0) return;
  const el = e.currentTarget;
  drag = { el, id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: el.offsetLeft, oy: el.offsetTop, moved: false };
  el.setPointerCapture(e.pointerId);
}

function onMove(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
  if (!drag.moved) {
    if (Math.hypot(dx, dy) < 6) return;          // still a click
    drag.moved = true;
    drag.el.classList.remove('settle');
    drag.el.classList.add('dragging');
    drag.el.style.zIndex = ++topZ;
  }
  const [x, y] = clampPx(drag.el, drag.ox + dx, drag.oy + dy);
  drag.el.style.left = `${x}px`;
  drag.el.style.top = `${y}px`;
}

function onUp(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const { el, moved } = drag;
  drag = null;
  if (!moved) return;
  el.classList.remove('dragging');
  el._dragged = true;                            // swallow the click that follows
  layout[el.dataset.repo] = [el.offsetLeft / desk.clientWidth, el.offsetTop / desk.clientHeight];
  store.set(localStorage, LAYOUT_KEY, layout);
}

/* ---------- building the folders ---------------------------------------- */
const nameOf = r => NOTES[r.name]?.label || r.name;

function buildDesk(list) {
  repos = list;
  holder.innerHTML = list.map((r, i) => `
    <button class="folder item" type="button" data-repo="${esc(r.name)}" data-i="${i}"
            style="--c:${COLORS[i % COLORS.length]}" aria-haspopup="dialog">
      <span class="f-art">
        <span class="f-back"></span>
        <span class="f-paper"></span>
        <span class="f-flap">${r.language ? `<span class="f-tag">${esc(r.language)}</span>` : ''}</span>
      </span>
      <span class="f-name">${esc(nameOf(r))}</span>
    </button>`).join('');

  folders = [...holder.children];
  folders.forEach(el => {
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('click', () => {
      if (el._dragged) { el._dragged = false; return; }
      openProject(+el.dataset.i);
    });
  });

  placeAll();
  openFromHash();
}

/* known repos first, in GH_ORDER; anything new lands after them */
function orderRepos(list) {
  const rank = r => {
    const i = GH_ORDER.indexOf(r.name);
    return i < 0 ? GH_ORDER.length : i;
  };
  return list
    .filter(r => !GH_SKIP.includes(r.name))
    .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}

const CACHE_KEY = 'repos:' + GH_USER;

function loadProjects() {
  const cached = store.get(sessionStorage, CACHE_KEY);
  if (cached) buildDesk(orderRepos(cached));          // paint at once on a repeat visit

  fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=updated`)
    .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
    .then(list => {
      const lean = list.map(({ name, description, language, pushed_at, html_url, default_branch }) =>
        ({ name, description, language, pushed_at, html_url, default_branch }));
      store.set(sessionStorage, CACHE_KEY, lean);
      if (!cached) buildDesk(orderRepos(lean));
    })
    .catch(() => {                                     // offline, or rate-limited
      if (cached) return;
      buildDesk(GH_ORDER.map(name => ({ name, html_url: `https://github.com/${GH_USER}/${name}` })));
    });
}

/* ---------- the window: a project, or the contact card ------------------ */
const win = $('#win');
const card = $('#win-card');
const closeBtn = $('#win-close');
const readmeBox = $('#win-readme');
const readmeWrap = $('#win-readme-wrap');
let opened = null;            // the folder whose window is showing
let openKey = '';             // its #hash: a repo slug, or 'contact'

const fmtDate = iso => new Intl.DateTimeFormat(navigator.language || 'en', { month: 'short', year: 'numeric' })
  .format(new Date(iso));

function infoHtml(r) {
  const n = NOTES[r.name] || {};
  const lead = n.full || r.description;
  return [
    n.venue ? `<p class="venue">${esc(n.venue)}</p>` : '',
    lead ? `<p class="lead">${esc(lead)}</p>` : '',
    n.full && r.description && r.description !== n.full ? `<p>${esc(r.description)}</p>` : '',
    n.points ? `<ul>${n.points.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '',
    `<p class="meta">${[
      r.language ? `<span class="chip">${esc(r.language)}</span>` : '',
      r.pushed_at ? `<span class="chip">Updated ${esc(fmtDate(r.pushed_at))}</span>` : '',
      `<a class="chip" href="${esc(r.html_url)}" target="_blank" rel="noopener">Open on GitHub ↗</a>`,
    ].join('')}</p>`,
  ].join('');
}

const contactHtml = () => `
  <p class="lead">Happy to talk about research, internships or CTFs. Email or call me.</p>
  <div class="contact">
    <div class="c-row">
      <span class="c-k">Email</span>
      <a class="c-v" href="mailto:${CONTACT.email}">${CONTACT.email}</a>
      <button class="chip" type="button" data-copy="${CONTACT.email}">Copy</button>
    </div>
    <div class="c-row">
      <span class="c-k">Phone</span>
      <a class="c-v" href="tel:${CONTACT.tel}">${CONTACT.phone}</a>
      <button class="chip" type="button" data-copy="${CONTACT.phone}">Copy</button>
    </div>
  </div>
  <p class="meta">
    <a class="chip" href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=${CONTACT.email}" target="_blank" rel="noopener">Write in Gmail ↗</a>
    <a class="chip" href="tel:${CONTACT.tel}">Call ${CONTACT.phone}</a>
    <a class="chip" href="${CONTACT.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a>
  </p>`;

/* the window grows out of its folder and shrinks back into it */
function fly(folder, out) {
  const f = folder.getBoundingClientRect(), c = card.getBoundingClientRect();
  const away = {
    transform: `translate(${f.left + f.width / 2 - (c.left + c.width / 2)}px, ${f.top + f.height / 2 - (c.top + c.height / 2)}px) scale(.15)`,
    opacity: 0,
  };
  const here = { transform: 'none', opacity: 1 };
  return card.animate(out ? [here, away] : [away, here], out
    ? { duration: 300, easing: 'cubic-bezier(.5, 0, .75, 0)' }
    : { duration: 520, easing: 'cubic-bezier(.3, 1.35, .45, 1)' });
}

function openWindow({ folder, color, title, html, key, readme, animate = true }) {
  if (opened && opened !== folder) opened.classList.remove('open');
  opened = folder;
  openKey = key;
  folder.classList.add('open');
  card.style.setProperty('--c', color);
  $('#win-title').textContent = title;
  $('#win-info').innerHTML = html;
  readmeWrap.hidden = !readme;
  $('#win-body').scrollTop = 0;
  win.hidden = false;
  closeBtn.focus();
  if (animate && !still.matches) fly(folder, false);

  history.replaceState(null, '', '#' + key);
  live.textContent = `Opened ${title}`;
  if (readme) loadReadme(readme);
}

function openProject(i, opts = {}) {
  const r = repos[i];
  if (!r) return;
  openWindow({ folder: folders[i], color: COLORS[i % COLORS.length], title: nameOf(r),
    html: infoHtml(r), key: slug(r.name), readme: r, ...opts });
}

function openContact(opts = {}) {
  openWindow({ folder: welcome, color: WELCOME_COLOR, title: 'Get in touch',
    html: contactHtml(), key: 'contact', readme: null, ...opts });
}
welcome.addEventListener('click', () => openContact());

function closeWindow() {
  if (win.hidden) return;
  const folder = opened;
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    win.hidden = true;
    folder?.classList.remove('open');
    folder?.focus();
  };
  opened = null;
  openKey = '';
  history.replaceState(null, '', location.pathname + location.search);

  card.getAnimations().forEach(a => a.cancel());   // a close mid-open starts from rest
  if (still.matches || !folder) return finish();
  fly(folder, true).onfinish = finish;
  setTimeout(finish, 450);                          // never leave it open if frames stall
}

closeBtn.onclick = closeWindow;
win.addEventListener('click', e => { if (e.target === win) closeWindow(); });
addEventListener('keydown', e => { if (e.key === 'Escape') closeWindow(); });

// Copy buttons; where the clipboard is refused, select the text instead
card.addEventListener('click', async e => {
  const btn = e.target.closest('[data-copy]');
  if (!btn) return;
  try {
    await navigator.clipboard.writeText(btn.dataset.copy);
    btn.textContent = 'Copied';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(btn.previousElementSibling);
    getSelection().removeAllRanges();
    getSelection().addRange(range);
    btn.textContent = 'Selected';
  }
  setTimeout(() => (btn.textContent = 'Copy'), 1600);
});

// keep Tab inside the open window
win.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const items = [...card.querySelectorAll('a[href], button')].filter(el => el.offsetParent);
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* #contact opens the Welcome folder; #repo-name opens that folder */
function openFromHash() {
  const want = decodeURIComponent(location.hash.slice(1));
  if (!want || want === openKey) return;
  if (want === 'contact') return openContact({ animate: false });
  const i = repos.findIndex(r => slug(r.name) === want);
  if (i >= 0) openProject(i, { animate: false });
}
addEventListener('hashchange', openFromHash);

/* ---------- README, rendered by GitHub ----------------------------------- */
/* one API call per repo, only when its window opens, cached for the visit */
async function loadReadme(r) {
  readmeBox.dataset.repo = r.name;
  readmeBox.innerHTML = '<p class="note">Loading README…</p>';

  const key = 'readme:' + r.name;
  let html = store.get(sessionStorage, key);
  if (html === null) {
    try {
      const res = await fetch(`https://api.github.com/repos/${GH_USER}/${r.name}/readme`,
        { headers: { Accept: 'application/vnd.github.html+json' } });
      if (res.status === 404) html = '';
      else if (!res.ok) throw res.status;
      else html = await res.text();
      store.set(sessionStorage, key, html);
    } catch {
      if (readmeBox.dataset.repo !== r.name) return;
      readmeBox.innerHTML = `<p class="note">The README couldn't load right now. <a href="${esc(r.html_url)}" target="_blank" rel="noopener">Read it on GitHub</a>.</p>`;
      return;
    }
  }
  if (readmeBox.dataset.repo !== r.name) return;     // another folder was opened meanwhile
  readmeBox.replaceChildren(...(html ? cleanReadme(html, r) : []));
  if (!html) readmeBox.innerHTML = '<p class="note">This repo has no README yet.</p>';
}

/* strip anything active, give ids their own namespace, point relative links at GitHub */
function cleanReadme(html, r) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script, style, link, meta, iframe, object, embed, form, input, button').forEach(n => n.remove());

  const branch = r.default_branch || 'HEAD';
  const raw = `https://raw.githubusercontent.com/${GH_USER}/${r.name}/${branch}/`;
  const blob = `https://github.com/${GH_USER}/${r.name}/blob/${branch}/`;
  const isAbs = u => /^(https?:)?\/\//i.test(u) || /^(data|mailto):/i.test(u);

  doc.body.querySelectorAll('*').forEach(el => {
    for (const { name } of [...el.attributes]) {
      if (name.startsWith('on')) el.removeAttribute(name);
    }
    if (el.id && !el.id.startsWith('user-content-')) el.removeAttribute('id');   // never clash with the page

    if (el.tagName === 'IMG') {
      const src = el.getAttribute('src') || '';
      if (src && !isAbs(src)) el.src = raw + src.replace(/^\.?\//, '');
      el.loading = 'lazy';
    }
    if (el.tagName === 'A') {
      const href = el.getAttribute('href') || '';
      if (/^\s*javascript:/i.test(href)) el.removeAttribute('href');
      else if (href.startsWith('#')) return;
      else {
        if (href && !isAbs(href)) el.href = blob + href.replace(/^\.?\//, '');
        el.target = '_blank';
        el.rel = 'noopener';
      }
    }
  });
  return [...doc.body.childNodes];
}

/* ---------- bubbles ------------------------------------------------------ */
/* soap bubbles rise behind the folders and pop when the cursor touches them */
const sky = $('#bubbles');
const ctx = sky.getContext('2d');
const TINTS = [WELCOME_COLOR, ...COLORS].map(h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(','));
const rand = (a, b) => a + Math.random() * (b - a);
let skyW = 0, skyH = 0, bubbles = [], pops = [], skyRaf = 0, lastT = 0;
const pointer = { x: -1e4, y: -1e4 };

function spawn(anywhere) {
  const r = rand(6, 26);
  return {
    r,
    x: rand(0, skyW),
    y: anywhere ? rand(0, skyH) : skyH + r + rand(0, skyH * 0.25),
    vy: rand(16, 34) * (1.25 - r / 40),           // small bubbles rise faster
    phase: rand(0, Math.PI * 2),
    sway: rand(6, 22),
    tint: TINTS[Math.floor(rand(0, TINTS.length))],
  };
}

function sizeSky() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  skyW = innerWidth;
  skyH = innerHeight;
  sky.width = skyW * dpr;
  sky.height = skyH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const want = Math.round(Math.min(36, Math.max(12, (skyW * skyH) / 36000)));
  while (bubbles.length < want) bubbles.push(spawn(true));
  bubbles.length = want;
}

function drawBubble(x, y, r, tint) {
  const film = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  film.addColorStop(0, 'rgba(255,255,255,.5)');
  film.addColorStop(0.6, `rgba(${tint},.08)`);
  film.addColorStop(0.9, `rgba(${tint},.32)`);
  film.addColorStop(1, `rgba(${tint},.6)`);
  ctx.fillStyle = film;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.85)';          // the window glint
  ctx.beginPath();
  ctx.ellipse(x - r * 0.38, y - r * 0.42, r * 0.22, r * 0.12, -0.6, 0, Math.PI * 2);
  ctx.fill();
}

function drawPop(p) {
  const k = p.t / 0.35;                              // 0 → 1 over the pop
  ctx.strokeStyle = `rgba(${p.tint},${0.7 * (1 - k)})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r * (1 + k * 0.8), 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = `rgba(${p.tint},${0.8 * (1 - k)})`;
  for (let i = 0; i < 6; i++) {                      // droplets flung outward
    const a = (i / 6) * Math.PI * 2 + p.r;
    const d = p.r * (1 + k * 1.6);
    ctx.beginPath();
    ctx.arc(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function skyFrame(t) {
  const dt = Math.min(0.05, (t - (lastT || t)) / 1000);
  lastT = t;
  ctx.clearRect(0, 0, skyW, skyH);
  for (const b of bubbles) {
    b.y -= b.vy * dt;
    b.phase += dt * 1.3;
    const x = b.x + Math.sin(b.phase) * b.sway;
    if (b.y < -b.r * 2) Object.assign(b, spawn(false));
    else if (Math.hypot(pointer.x - x, pointer.y - b.y) < b.r + 4) {
      pops.push({ x, y: b.y, r: b.r, tint: b.tint, t: 0 });
      Object.assign(b, spawn(false));
    } else drawBubble(x, b.y, b.r, b.tint);
  }
  pops = pops.filter(p => (p.t += dt) < 0.35);
  pops.forEach(drawPop);
  skyRaf = requestAnimationFrame(skyFrame);
}

function startSky() {
  cancelAnimationFrame(skyRaf);
  skyRaf = 0;
  lastT = 0;
  if (still.matches) {                               // reduced motion: a still scatter
    ctx.clearRect(0, 0, skyW, skyH);
    bubbles.forEach(b => drawBubble(b.x, b.y, b.r, b.tint));
    return;
  }
  if (!document.hidden) skyRaf = requestAnimationFrame(skyFrame);
}

addEventListener('pointermove', e => {
  if (e.pointerType === 'mouse') { pointer.x = e.clientX; pointer.y = e.clientY; }
}, { passive: true });
addEventListener('pointerdown', e => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
addEventListener('pointerup', e => {
  if (e.pointerType !== 'mouse') pointer.x = pointer.y = -1e4;   // a finger lifts away
}, { passive: true });
document.documentElement.addEventListener('pointerleave', () => { pointer.x = pointer.y = -1e4; });

addEventListener('resize', () => { sizeSky(); startSky(); });
document.addEventListener('visibilitychange', startSky);
still.addEventListener('change', startSky);

/* ---------- go ---------------------------------------------------------- */
sizeSky();
startSky();
loadProjects();
