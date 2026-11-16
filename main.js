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

/* ---------- layout: folders scattered at random round the desk ---------- */
/* positions are stored as fractions of the desk, so a resize keeps the arrangement */
const LAYOUT_KEY = 'desk-layout:v2';
let layout = store.get(localStorage, LAYOUT_KEY) || {};
let bodies = [];                                 // { el, x, y, vx, vy, hw, hh }: centre and half size, px

const GAP = 8;                                   // breathing room between hitboxes

/* the biggest folders that leave the desk roomy enough for n of them */
function folderSize(n) {
  const W = desk.clientWidth, H = desk.clientHeight;
  const free = W * H - (welcome.offsetWidth + 40) * (welcome.offsetHeight + 40);
  for (let f = 7.5; f > 4.5; f -= 0.25) {
    const w = 15 * f + GAP, h = 11.3 * f + 40 + GAP;
    if (n * w * h * 2.4 <= free) return f;
  }
  return 4.5;
}

function welcomeBox() {
  const d = desk.getBoundingClientRect(), r = welcome.getBoundingClientRect();
  return { x: r.left - d.left + r.width / 2, y: r.top - d.top + r.height / 2, hw: r.width / 2 + 6, hh: r.height / 2 + 6 };
}

/* how far apart two boxes are: below 0 they overlap */
const clearance = (a, b) =>
  Math.max(Math.abs(a.x - b.x) - a.hw - b.hw, Math.abs(a.y - b.y) - a.hh - b.hh);

/* drop each folder on a random free spot; the best of many tries if none is free */
function scatter(list, placed) {
  const W = desk.clientWidth, H = desk.clientHeight;
  for (const b of list) {
    let best = null, bestGap = -Infinity;
    for (let t = 0; t < 400; t++) {
      const c = { x: b.hw + Math.random() * (W - 2 * b.hw), y: b.hh + Math.random() * (H - 2 * b.hh), hw: b.hw, hh: b.hh };
      const g = Math.min(Infinity, ...placed.map(o => clearance(c, o)));
      if (g > bestGap) { best = c; bestGap = g; }
      if (g >= GAP) break;
    }
    b.x = best.x; b.y = best.y;
    placed.push(b);
  }
}

function render(b) {
  b.el.style.left = `${b.x}px`;
  b.el.style.top = `${b.y}px`;
}

function saveLayout() {
  const W = desk.clientWidth, H = desk.clientHeight;
  bodies.forEach(b => { layout[b.el.dataset.repo] = [b.x / W, b.y / H]; });
  store.set(localStorage, LAYOUT_KEY, layout);
}

function placeAll(shuffle = false) {
  if (narrow.matches) {                          // phone: CSS grid does the layout
    holder.style.removeProperty('--f');
    folders.forEach(el => { el.style.left = el.style.top = ''; });
    return;
  }
  holder.style.setProperty('--f', `${folderSize(folders.length)}px`);
  const W = desk.clientWidth, H = desk.clientHeight;
  bodies = folders.map(el => ({ el, x: 0, y: 0, vx: 0, vy: 0, hw: el.offsetWidth / 2, hh: el.offsetHeight / 2 }));
  const fresh = [];
  bodies.forEach(b => {
    const spot = !shuffle && layout[b.el.dataset.repo];
    if (spot) { b.x = spot[0] * W; b.y = spot[1] * H; } else fresh.push(b);
  });
  scatter(fresh, [welcomeBox(), ...bodies.filter(b => !fresh.includes(b))]);
  folders.forEach(el => el.classList.toggle('settle', shuffle && !still.matches));
  bodies.forEach(render);
  if (shuffle) setTimeout(() => { folders.forEach(el => el.classList.remove('settle')); saveLayout(); }, 600);
  else wake();                                   // nudge apart anything a resize squashed together
  if (fresh.length && !shuffle) saveLayout();
}

$('#tidy').onclick = () => {
  placeAll(true);
  live.textContent = 'Folders shuffled';
};

addEventListener('resize', () => placeAll());
narrow.addEventListener('change', () => placeAll());

/* ---------- physics: hitboxes, shoves and bounces ------------------------ */
/* a dragged folder shoves the ones it hits; they slide off, bounce off the
   desk edges, the Welcome folder and each other, and slow to a stop */
const BOUNCE = 0.7;                              // speed kept after hitting something
const DRAG = 3.2;                                // friction: how fast a slide dies away, per second
const KICK = 260;                                // px/s a shoved folder gets on top of the drag speed
let running = false, last = 0;

function wake() {
  if (running || narrow.matches) return;
  running = true;
  last = performance.now();
  requestAnimationFrame(tick);
}

/* push b out of the fixed box o along the shallower axis; true if they touched */
function pushOut(b, o, gap, kick) {
  const ox = b.hw + o.hw + gap - Math.abs(b.x - o.x);
  const oy = b.hh + o.hh + gap - Math.abs(b.y - o.y);
  if (ox <= 0 || oy <= 0) return false;
  if (ox < oy) {
    const s = Math.sign(b.x - o.x) || (Math.random() < .5 ? -1 : 1);
    b.x += s * ox;
    b.vx = kick ? s * Math.max(Math.abs(b.vx), Math.abs(kick.vx) + KICK) : (s * b.vx < 0 ? -b.vx * BOUNCE : b.vx);
  } else {
    const s = Math.sign(b.y - o.y) || (Math.random() < .5 ? -1 : 1);
    b.y += s * oy;
    b.vy = kick ? s * Math.max(Math.abs(b.vy), Math.abs(kick.vy) + KICK) : (s * b.vy < 0 ? -b.vy * BOUNCE : b.vy);
  }
  return true;
}

/* two loose folders: split the overlap and trade speed along the hit axis */
function collide(a, b) {
  const ox = a.hw + b.hw + GAP - Math.abs(a.x - b.x);
  const oy = a.hh + b.hh + GAP - Math.abs(a.y - b.y);
  if (ox <= 0 || oy <= 0) return false;
  const [p, v, o] = ox < oy ? ['x', 'vx', ox] : ['y', 'vy', oy];
  const s = Math.sign(b[p] - a[p]) || 1;
  a[p] -= s * o / 2; b[p] += s * o / 2;
  if (s * (b[v] - a[v]) < 0) {                   // closing in: equal masses swap speeds
    const av = a[v];
    a[v] = b[v] * BOUNCE; b[v] = av * BOUNCE;
  }
  return true;
}

function tick(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  const W = desk.clientWidth, H = desk.clientHeight;
  const held = drag?.moved ? drag.body : null;
  const wb = welcomeBox();
  const fade = Math.exp(-DRAG * dt);
  let busy = !!held;

  for (const b of bodies) {
    if (b === held) continue;
    b.x += b.vx * dt; b.y += b.vy * dt;
    b.vx *= fade; b.vy *= fade;
    if (Math.hypot(b.vx, b.vy) < 8) b.vx = b.vy = 0;
  }
  for (let pass = 0; pass < 4; pass++) {         // a few passes settle chains of shoves
    for (let i = 0; i < bodies.length; i++) {
      const a = bodies[i];
      for (let j = i + 1; j < bodies.length; j++) {
        const b = bodies[j];
        if (a === held) busy = pushOut(b, a, GAP, still.matches ? null : drag) || busy;
        else if (b === held) busy = pushOut(a, b, GAP, still.matches ? null : drag) || busy;
        else busy = collide(a, b) || busy;
      }
    }
    for (const b of bodies) {
      if (b === held) continue;
      busy = pushOut(b, wb, GAP, null) || busy;
      // desk edges
      if (b.x < b.hw) { b.x = b.hw; b.vx = Math.abs(b.vx) * BOUNCE; }
      if (b.x > W - b.hw) { b.x = W - b.hw; b.vx = -Math.abs(b.vx) * BOUNCE; }
      if (b.y < b.hh) { b.y = b.hh; b.vy = Math.abs(b.vy) * BOUNCE; }
      if (b.y > H - b.hh) { b.y = H - b.hh; b.vy = -Math.abs(b.vy) * BOUNCE; }
    }
  }
  if (still.matches) bodies.forEach(b => { b.vx = b.vy = 0; });
  bodies.forEach(b => { if (b !== held) render(b); });
  busy ||= bodies.some(b => b.vx || b.vy);

  if (busy) requestAnimationFrame(tick);
  else { running = false; saveLayout(); }
}

/* ---------- dragging ----------------------------------------------------- */
let drag = null;
let topZ = 10;

function onDown(e) {
  if (narrow.matches || e.button !== 0) return;
  const el = e.currentTarget;
  const body = bodies.find(b => b.el === el);
  if (!body) return;
  drag = { el, body, id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: body.x, oy: body.y, moved: false, vx: 0, vy: 0, t: performance.now() };
  el.setPointerCapture(e.pointerId);
}

function onMove(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
  if (!drag.moved) {
    if (Math.hypot(dx, dy) < 6) return;          // still a click
    drag.moved = true;
    folders.forEach(el => el.classList.remove('settle'));
    drag.el.classList.add('dragging');
    drag.el.style.zIndex = ++topZ;
    drag.body.vx = drag.body.vy = 0;
  }
  const b = drag.body, W = desk.clientWidth, H = desk.clientHeight;
  const x = Math.min(W - b.hw, Math.max(b.hw, drag.ox + dx));
  const y = Math.min(H - b.hh, Math.max(b.hh, drag.oy + dy));
  const now = performance.now(), dt = Math.max(1, now - drag.t) / 1000;
  drag.vx = drag.vx * 0.6 + ((x - b.x) / dt) * 0.4;   // smoothed hand speed, px/s
  drag.vy = drag.vy * 0.6 + ((y - b.y) / dt) * 0.4;
  drag.t = now;
  b.x = x; b.y = y;
  render(b);
  wake();
}

function onUp(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const { el, body, moved } = drag;
  const fling = still.matches ? 0 : 0.5;         // let go mid-swing and the folder carries on a bit
  if (moved) { body.vx = drag.vx * fling; body.vy = drag.vy * fling; }
  drag = null;
  if (!moved) return;
  el.classList.remove('dragging');
  el._dragged = true;                            // swallow the click that follows
  wake();
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
