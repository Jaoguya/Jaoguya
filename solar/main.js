/* ---------- edit me ---------------------------------------------------- */
const CV_URL = 'cv.tex';               // swap the header link to cv.pdf once you compile one
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

/* ---------- starfield --------------------------------------------------- */
const sky = document.getElementById('stars');
function drawStars() {
  const r = sky.getBoundingClientRect();
  sky.width = r.width;
  sky.height = r.height;
  const g = sky.getContext('2d');
  const hues = ['#ffffff', '#cfe4ff', '#ffe9d6', '#d8ccff'];
  for (let i = 0; i < 700; i++) {
    const size = Math.random() < 0.10 ? 2 : 1;
    g.globalAlpha = 0.15 + Math.random() * 0.75;
    g.fillStyle = hues[(Math.random() * hues.length) | 0];
    g.fillRect(Math.random() * sky.width, Math.random() * sky.height, size, size);
  }
}


/* ---------- orbital deck ------------------------------------------------ */
/* Slides ride an oval seen from above. The one at the near point of the
   curve fills the screen; the rest shrink and swing round behind it.        */

const stage = document.getElementById('stage');
const ring = document.getElementById('ring');
const chapters = document.getElementById('chapters');
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
  [...chapters.children].forEach((b, i) => {
    b.classList.toggle('on', i === now);
    b.setAttribute('aria-current', i === now ? 'true' : 'false');
  });
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

const goTo = i => {                                      // one deliberate jump, no clamp
  let d = (((i - target) % N) + N) % N;
  target += d > N / 2 ? d - N : d;
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

function build(sections) {
  N = sections.length;
  titles = sections.map(s => s.title);
  ring.innerHTML = sections.map((s, i) => `
    <article class="slide" style="--tint:${TINTS[i % TINTS.length]}">
      <p class="step">Step ${i + 1} of ${N}</p>
      <h2>${s.title}</h2>
      <div class="body">${s.html}</div>
    </article>`).join('');
  slides = [...ring.children];
  chapters.innerHTML = sections.map((s, i) =>
    `<button style="--tint:${TINTS[i % TINTS.length]}">
       <span class="orb${i ? '' : ' sun'}"></span><span>${s.title}</span>
     </button>`).join('');
  [...chapters.children].forEach((b, i) => (b.onclick = () => goTo(i)));

  // the same sections again, as a plain scrolling document
  document.getElementById('sections').innerHTML = sections.map((s, i) => `
    <article class="doc-section" id="s-${slug(s.title)}" style="--tint:${TINTS[i % TINTS.length]}">
      <h2><span class="n">${String(i + 1).padStart(2, '0')}</span>${s.title}</h2>
      <div class="body">${s.html}</div>
    </article>`).join('');
  measure();
  jump();
  pos = target;
  place();
  sync();
}

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
  drawStars();
  if (!N) return;
  measure();
  place();
});

/* ---------- load CV ----------------------------------------------------- */
drawStars();
fetch(CV_URL).then(r => r.text()).then(tex => build(parseCV(tex)));
