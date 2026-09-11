/* ---------- edit me ---------------------------------------------------- */
const CV_URL = 'cv.tex';
const GH_USER = 'Jaoguya';
const GH_SKIP = ['Jaoguya'];           // the profile repo itself is not a project

// order the ones you care about; anything new on GitHub is appended automatically
const GH_ORDER = ['BVCRSA', 'PLOSHA-RMFR', 'OJCOMS', 'ZKRedact'];

// what GitHub cannot tell us. Anything omitted falls back to the repo description.
const NOTES = {
  'BVCRSA': {
    full: 'Blockchain-Based Verifiable Conjunctive Range Search and Aggregation over Encrypted IIoT Data',
    venue: 'IEEE Internet of Things Journal — 2nd revision',
    points: [
      'Blockchain-verified search and analytics over encrypted industrial sensor data, with attribute-based access control and verifiable homomorphic aggregation.',
      'Contributed to scheme design; implemented the prototype and ran the evaluation.',
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
    full: 'Achieving Post-Quantum and Dynamic Load-Balanced Verifiable Searchable Encryption for Multi-Authority IoMT Data Sharing',
    venue: 'IEEE Open Journal of the Communications Society — in progress',
    points: [
      'Self-optimizing encrypted search index that adapts to query patterns for faster range retrieval.',
      'Contributed to scheme design; implemented the prototype and ran the evaluation.',
    ],
  },
};

const RENAME = { 'Profile': 'About Me' };   // show a friendlier title for a \section
const TINTS = ['#ffb765', '#4fe0a8', '#52c7ff', '#a97bff', '#ff7ab8', '#4fe0a8', '#52c7ff'];
const CONTACT_HTML = `
  <p>Happy to talk about research, internships, or CTFs.</p>
  <p><b>Email:</b> <a href="mailto:guyhd9119@gmail.com">guyhd9119@gmail.com</a></p>
  <p><b>LinkedIn:</b> <a href="https://www.linkedin.com/in/tagrid-chongkolrattanapond-7188b63a8/" target="_blank" rel="noopener">Tagrid Chongkolrattanapond</a></p>
  <p><b>GitHub:</b> <a href="https://github.com/Jaoguya" target="_blank" rel="noopener">Jaoguya</a></p>`;

/* ---------- LaTeX -> HTML ---------------------------------------------- */
function toHtml(s) {
  return s
    .replace(/(^|[^\\])%.*$/gm, '$1')
    .replace(/\\entry\{((?:[^{}]|\{[^{}]*\})*)\}\s*\{([^{}]*)\}/g,
      (_, t, d) => `\n<h3>${d ? `<span class="date">${d}</span>` : ''}${t}</h3>\n`)
    .replace(/\\venue\{((?:[^{}]|\{[^{}]*\})*)\}/g, '<p class="venue">$1</p>')
    .replace(/\\skill\{([^{}]*)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g, '<p><b>$1:</b> $2</p>')
    .replace(/\\begin\{details\}/g, '<ul>')
    .replace(/\\end\{details\}/g, '</ul>')
    .replace(/\\item\s*/g, '<li>')
    .replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, '<a href="$1" target="_blank" rel="noopener">$2</a>')
    .replace(/\\textbf\{([^{}]*)\}/g, '<b>$1</b>')
    .replace(/\\textit\{([^{}]*)\}/g, '<i>$1</i>')
    .replace(/\$\\times\$/g, '×')
    .replace(/\\&/g, '&amp;').replace(/\\([%$_#])/g, '$1')
    .replace(/---/g, '—').replace(/--/g, '–').replace(/``/g, '“').replace(/''/g, '”')
    .replace(/\\[a-zA-Z]+\*?(\{[^{}]*\})*(\[[^\]]*\])?/g, '')
    .replace(/\\\\(\[[^\]]*\])?/g, '')
    .split(/\n\s*\n/).map(t => t.trim()).filter(Boolean)
    .map(t => /^<(h3|ul|p|div)/.test(t) ? t : `<p>${t}</p>`).join('\n');
}

const clean = t => t.replace(/\\&/g, '&').replace(/\\[a-zA-Z]+/g, '').trim();

function parseCV(tex) {
  const parts = (tex.split('\\begin{document}')[1] || tex).split(/\\section\*?\{([^}]*)\}/);
  const out = [];
  for (let i = 1; i < parts.length; i += 2) {
    const title = clean(parts[i]);
    out.push({ title: RENAME[title] || title, html: toHtml(parts[i + 1]) });
  }
  return out;
}

/* ---------- modal ------------------------------------------------------- */
const modal = document.getElementById('modal');
const closeBtn = document.getElementById('close');
let opener = null;

const open = (title, html) => {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = html;
  modal.hidden = false;
  opener = document.activeElement;
  closeBtn.focus();
};
const shut = () => {
  modal.hidden = true;
  if (opener) opener.focus();
  opener = null;
};
closeBtn.onclick = shut;
modal.onclick = e => { if (e.target === modal) shut(); };

document.getElementById('contact-btn').onclick = () => open('Get in touch', CONTACT_HTML);

/* ---------- orbital deck ------------------------------------------------ */
/* Slides ride an oval seen from above. The one at the near point of the
   curve fills the screen; the rest shrink and swing round behind it.        */

const stage = document.getElementById('stage');
const ring = document.getElementById('ring');
const live = document.getElementById('live');
const slug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const FALLOFF = 0.85;         // how fast a slide shrinks as it leaves the front
const EASE = 0.18;            // tween stiffness

let slides = [], titles = [], N = 0;
let pos = 0, target = 0, raf = 0;   // pos is continuous, target is the slide we head to
let radiusX = 0, radiusY = 0;

const cur = () => ((Math.round(target) % N) + N) % N;

function measure() {
  radiusX = stage.clientWidth * 0.31;
  radiusY = stage.clientHeight * 0.125;
}

/* put every slide on the oval for the current `pos` */
function place() {
  slides.forEach((s, i) => {
    let d = (((i - pos) % N) + N) % N;
    if (d > N / 2) d -= N;                       // nearest way round
    const a = d * (Math.PI * 2 / N);             // 0 = front of the curve
    const away = Math.abs(d);                    // slides from the front
    const scale = 1 / (1 + away * FALLOFF);      // perspective-style falloff

    const x = Math.sin(a) * radiusX;
    const y = (Math.cos(a) - 1) * radiusY;       // near sits centred, far rides up

    s.style.transform =
      `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)` +
      ` scale(${scale.toFixed(3)}) rotateY(${(-Math.sin(a) * 22).toFixed(1)}deg)` +
      ` rotateX(${((1 - Math.cos(a)) * 5).toFixed(1)}deg)`;
    s.style.opacity = (1 / (1 + away * 0.42)).toFixed(3);
    s.style.filter = away < 0.05 ? 'none' : `blur(${Math.min(away * 0.95, 2.6).toFixed(2)}px)`;
    s.style.zIndex = 1000 - Math.round(away * 100);

    const front = Math.abs(d) < 0.5;
    s.classList.toggle('active', front);
    s.inert = !front;
  });
}

/* rail, screen-reader announcement and URL follow the settled slide */
function sync() {
  const now = cur();
  if (titles[now]) {
    live.textContent = `Step ${now + 1} of ${N}: ${titles[now]}`;
    history.replaceState(null, '', '#' + slug(titles[now]));
  }
}

function tick() {
  const diff = target - pos;
  pos += diff * EASE;
  if (Math.abs(diff) < 0.001) {
    pos = target;
    raf = 0;
    place();
    return;
  }
  place();
  raf = requestAnimationFrame(tick);
}
const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

const BACKLOG = 1.6;          // most slides a burst of input may queue up

const go = n => {
  target += n;
  const over = target - pos;
  // round, or a clamped burst leaves the deck resting between two slides
  if (Math.abs(over) > BACKLOG) target = Math.round(pos + Math.sign(over) * BACKLOG);
  sync();
  kick();
};

function jump() {                                        // honour a #section link
  const i = titles.findIndex(t => slug(t) === decodeURIComponent(location.hash.slice(1)));
  if (i < 0) return false;
  let d = (((i - target) % N) + N) % N;
  if (d > N / 2) d -= N;
  target += d;
  return true;
}
addEventListener('hashchange', () => { if (jump()) { sync(); kick(); } });


/* ---------- 1: the projects in orbit ------------------------------------ */
const fmtDate = iso => new Intl.DateTimeFormat(navigator.language || 'en', {
  month: 'short', year: 'numeric',
}).format(new Date(iso));

function projectHtml(p) {
  const n = NOTES[p.name] || {};
  const lead = n.full || p.description;
  const meta = [
    p.language,
    p.pushed_at ? `updated ${fmtDate(p.pushed_at)}` : '',
    `<a href="${p.html_url}" target="_blank" rel="noopener">View on GitHub</a>`,
  ].filter(Boolean).join(' · ');

  return [
    n.venue ? `<p class="venue">${n.venue}</p>` : '',
    lead ? `<p>${lead}</p>` : `<p class="venue">No description yet — add one on GitHub and it shows up here.</p>`,
    n.points ? `<ul>${n.points.map(t => `<li>${t}</li>`).join('')}</ul>` : '',
    `<p class="meta">${meta}</p>`,
  ].join('');
}

function buildOrbit(repos) {
  N = repos.length;
  titles = repos.map(r => r.name);

  ring.innerHTML = repos.map((r, i) => `
    <article class="slide" style="--tint:${TINTS[i % TINTS.length]}">
      <p class="step">Project ${i + 1} of ${N}</p>
      <h2>${r.name}</h2>
      <div class="body">${projectHtml(r)}</div>
    </article>`).join('');
  slides = [...ring.children];

  measure();
  jump();
  pos = target;
  place();
  sync();
}

/* known repos first, in GH_ORDER; anything new lands after them */
function orderRepos(list) {
  const keep = list.filter(r => !GH_SKIP.includes(r.name));
  const rank = r => {
    const i = GH_ORDER.indexOf(r.name);
    return i < 0 ? GH_ORDER.length : i;
  };
  return keep.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}

fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=updated`)
  .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
  .then(list => buildOrbit(orderRepos(list)))
  .catch(() => {                                         // offline, or rate-limited
    buildOrbit(GH_ORDER.map(name => ({
      name, html_url: `https://github.com/${GH_USER}/${name}`,
    })));
  });

/* ---------- 2: the CV as a document ------------------------------------- */
function buildDoc(sections) {
  document.getElementById('sections').innerHTML = sections.map((s, i) => `
    <article class="doc-section" id="s-${slug(s.title)}" style="--tint:${TINTS[i % TINTS.length]}">
      <h2><span class="n">${String(i + 1).padStart(2, '0')}</span>${s.title}</h2>
      <div class="body">${s.html}</div>
    </article>`).join('');

  const toc = document.getElementById('toc');
  toc.innerHTML = sections.map((s, i) =>
    `<a href="#s-${slug(s.title)}" style="--tint:${TINTS[i % TINTS.length]}">${s.title}</a>`).join('');

  // light up whichever section the reader is in
  const links = [...toc.children];
  const marks = [...document.querySelectorAll('.doc-section')];
  let pending = 0;
  const spy = () => {
    pending = 0;
    let at = 0;
    marks.forEach((el, i) => { if (el.getBoundingClientRect().top < innerHeight * 0.35) at = i; });
    links.forEach((a, i) => a.classList.toggle('on', i === at));
  };
  addEventListener('scroll', () => { pending ||= requestAnimationFrame(spy); }, { passive: true });
  spy();
}

fetch(CV_URL).then(r => r.text()).then(tex => buildDoc(parseCV(tex)));

/* ---------- input ------------------------------------------------------- */
/* the wheel is left entirely to the page; the orbit moves on clicks, drags and keys */
document.getElementById('more').onclick = () =>
  document.getElementById('doc').scrollIntoView({ behavior: 'smooth', block: 'start' });

document.getElementById('next').onclick = () => go(1);
document.getElementById('prev').onclick = () => go(-1);

addEventListener('keydown', e => {
  if (e.key === 'Escape') return shut();
  if (!modal.hidden) return;
  if (scrollY > innerHeight * 0.6) return;               // reading the document, not the orbit
  if (e.key === 'ArrowRight') go(1);
  else if (e.key === 'ArrowLeft') go(-1);
});

/* dragging scrubs the orbit under your finger, then settles on a slide */
const PX_PER_SLIDE = 300;
let dragX = null, dragFrom = 0;
stage.addEventListener('pointerdown', e => { dragX = e.clientX; dragFrom = target; });
stage.addEventListener('pointermove', e => {
  if (dragX === null) return;
  target = dragFrom - (e.clientX - dragX) / PX_PER_SLIDE;
  kick();
});
stage.addEventListener('pointerup', () => {
  if (dragX === null) return;
  dragX = null;
  target = Math.round(target);
  sync();
  kick();
});
stage.addEventListener('pointercancel', () => (dragX = null));

// a hidden tab pauses rAF; snap so it never comes back mid-flight
addEventListener('visibilitychange', () => {
  if (!document.hidden) return kick();
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  pos = target = Math.round(target);
  place();
  sync();
});

addEventListener('resize', () => {
  if (!N) return;
  measure();
  place();
});
