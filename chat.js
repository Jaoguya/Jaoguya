/* Chat bubble in the bottom-right corner: a scripted assistant, no server.
   Four paths from the menu: get to know me, contact me (writes a hiring email),
   ask a question (keyword answers), report a bug (writes a bug email).
   Emails open in the visitor's own mail app or Gmail, ready to send.
   Load after main.js: the address and LinkedIn come from its CONTACT. */
(() => {
/* ---------- edit me ---------------------------------------------------- */
const ME = { email: CONTACT.email, linkedin: CONTACT.linkedin };

// what "Get to know me" says. Plain strings; <b> and <a> are allowed.
const ABOUT = {
  intro: [
    `I'm <b>Tagrid Chongkolrattanapond</b>, a final-year Computer Engineering student at SIIT, Thammasat University.`,
    `I build and test secure data systems: encrypted search, blockchain auditing and privacy for IoT data. Some of it is published at IEEE venues.`,
  ],
  education: [
    `<b>B.Eng. in Computer Engineering</b>, Cloud Computing &amp; Cyber Security track.`,
    `Sirindhorn International Institute of Technology (SIIT), Thammasat University. Graduating in 2027.`,
    `Coursework I enjoyed most: Database Systems, Cloud Computing, Operating Systems, Computer Networks, and Computer &amp; Communication Security.`,
  ],
  research: [
    `<b>ZK-Redact</b>: erasing personal data from a company blockchain with zero-knowledge proofs. Accepted at IEEE KST 2027.`,
    `<b>BVCRSA</b>: searching and totalling encrypted factory sensor data. Under review at an IEEE journal, with an earlier version accepted at IEEE CSCloud 2027.`,
    `<b>PLOSHA-RMFR</b>: keeping secure edge–fog data aggregation running when nodes fail. Under review at the IEEE Internet of Things Journal.`,
  ],
  internship: [
    `I'm looking for an <b>internship from 4 January to 14 May 2027</b>, and I can extend it up to 6 months.`,
    `Roles I'm most interested in: <b>AI engineering</b>, <b>data and cloud engineering</b>, and <b>security</b>.`,
    `I'm based in Bangkok and happy with on-site or hybrid work.`,
  ],
  skills: [
    `<b>Languages:</b> Python, Go, SQL, C/C++, JavaScript, PHP.`,
    `<b>Data &amp; cloud:</b> MySQL, MongoDB, Hyperledger Fabric, Docker, Linux, AWS (EC2, S3, IAM), Git, GitHub Actions.`,
    `<b>Spoken:</b> Thai (native), English (TOEIC 710).`,
  ],
};

// the CV the chat hands out, and a picture of its first page
const CV = { pdf: 'assets/cv/Tagrid_Chongkolrattanapond_CV.pdf', preview: 'assets/cv/cv-preview.png' };

// folders the research answer can open (the #hash main.js listens for)
const PROJECTS = [['ZK-Redact', 'zkredact'], ['BVCRSA', 'bvcrsa'], ['PLOSHA-RMFR', 'plosha-rmfr']];

// "Ask a question": the first entry whose keyword appears in the question answers it
const FAQ = [
  { keys: ['start', 'available', 'availability', 'when', 'period', 'date', 'month'],
    say: [`I'm free for an internship from <b>4 January to 14 May 2027</b>, and I can extend it up to 6 months.`] },
  { keys: ['cv', 'resume', 'résumé'],
    say: [`Of course! Here's my CV. Tap it to preview, or download the PDF.`],
    next: 'cv' },
  { keys: ['ai', 'machine learning', 'ml', 'model', 'llm', 'speech', 'robot'],
    say: [`On our team's security robot I built the spoken-password check with offline <b>Vosk speech recognition</b> on ROS 2, and a test tool that compares two listening methods on the same recordings.`,
          `I'm looking for an AI engineering internship to go further: training, evaluating and deploying models.`] },
  { keys: ['skill', 'stack', 'language', 'tech', 'python', 'go', 'aws', 'docker', 'sql'],
    say: () => ABOUT.skills },
  { keys: ['research', 'paper', 'publication', 'ieee', 'zk', 'blockchain', 'encrypt'],
    say: () => ABOUT.research, next: 'projects' },
  { keys: ['school', 'university', 'study', 'education', 'degree', 'gpa', 'graduate', 'siit'],
    say: () => ABOUT.education },
  { keys: ['where', 'location', 'based', 'live', 'bangkok', 'remote', 'hybrid', 'onsite', 'on-site'],
    say: [`I'm based in Bangkok, Thailand. On-site or hybrid both work for me.`] },
  { keys: ['ctf', 'award', 'competition', 'hackathon'],
    say: [`I competed in <b>Thailand Cyber Top Talent 2026</b> (a CTF by NCSA Thailand &amp; Huawei), and my term-project paper was in the top 5 for Cloud Computing and Security at SIIT.`] },
  { keys: ['phone', 'call', 'email', 'contact', 'reach', 'linkedin'],
    say: () => [`Email: <a href="mailto:${ME.email}">${ME.email}</a>. LinkedIn: <a href="${ME.linkedin}" target="_blank" rel="noopener">Tagrid Chongkolrattanapond ↗</a>.`],
    next: 'contact' },
  { keys: ['hello', 'hi', 'hey', 'sawasdee', 'สวัสดี'],
    say: [`Hi! 👋 Ask me anything, or pick one of the buttons.`] },
];

const SUGGESTED = ['When can you start?', 'Do you have AI experience?', 'What are your skills?', 'Can I see your CV?'];

/* ---------- helpers ---------------------------------------------------- */
const still = matchMedia('(prefers-reduced-motion: reduce)');
const wait = ms => new Promise(r => setTimeout(r, still.matches ? 0 : ms));
const isEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const enc = encodeURIComponent;
const hover = () => matchMedia('(hover: hover)').matches;
const store = {
  get: k => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
};
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

/* ---------- the widget --------------------------------------------------- */
const root = el('div', 'chat');
root.innerHTML = `
  <p class="chat-teaser" hidden>
    <button type="button" class="chat-teaser-msg">Hi! 👋 Hiring interns? I can help.</button>
    <button type="button" class="chat-teaser-x" aria-label="Dismiss">×</button>
  </p>
  <section class="chat-panel" hidden aria-label="Chat with Tagrid's assistant">
    <header class="chat-head">
      <span class="chat-ava" aria-hidden="true">T</span>
      <span class="chat-who">
        <b>Tagrid's assistant</b>
        <small>Auto-replies instantly · I'm a bot</small>
      </span>
      <button type="button" class="chat-min" aria-label="Minimise chat">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12" /></svg>
      </button>
    </header>
    <div class="chat-log" role="log" aria-live="polite"></div>
    <div class="chat-quick"></div>
    <form class="chat-form" autocomplete="off">
      <input class="chat-input" type="text" enterkeyhint="send" placeholder="Type a message…" aria-label="Message">
      <button class="chat-send" type="submit" aria-label="Send">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12 20 4l-6 16-3-7-7-1Z" /></svg>
      </button>
    </form>
  </section>
  <button type="button" class="chat-fab" aria-expanded="false" aria-label="Open chat">
    <svg class="i-chat" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-5 4v-4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" /></svg>
    <svg class="i-close" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" /></svg>
    <span class="chat-dot" hidden></span>
  </button>`;
document.body.append(root);

const q = s => root.querySelector(s);
const panel = q('.chat-panel'), log = q('.chat-log'), quick = q('.chat-quick');
const form = q('.chat-form'), input = q('.chat-input'), fab = q('.chat-fab');
const teaser = q('.chat-teaser'), dot = q('.chat-dot');

let started = false;
let flow = null;        // what typed text is for: { kind: 'ask' } or a step-by-step form
let busy = Promise.resolve();

function setOpen(open) {
  panel.hidden = !open;
  root.classList.toggle('open', open);
  fab.setAttribute('aria-expanded', open);
  fab.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
  if (!open) return;
  teaser.hidden = true;
  dot.hidden = true;
  store.set('chat-seen', '1');
  if (!started) { started = true; greet(); }
  if (hover()) input.focus();
}
fab.onclick = () => setOpen(panel.hidden);
q('.chat-min').onclick = () => { setOpen(false); fab.focus(); };
root.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !panel.hidden) { e.stopPropagation(); setOpen(false); fab.focus(); }
});
q('.chat-teaser-msg').onclick = () => setOpen(true);
q('.chat-teaser-x').onclick = () => { teaser.hidden = true; dot.hidden = true; store.set('chat-seen', '1'); };

// first visit: nudge once after a few seconds
if (!store.get('chat-seen')) setTimeout(() => { if (panel.hidden) { teaser.hidden = false; dot.hidden = false; } }, 4000);

/* ---------- messages ----------------------------------------------------- */
const scroll = () => { log.scrollTop = log.scrollHeight; };

function userSays(text) {
  const b = el('p', 'msg me');
  b.textContent = text;
  log.append(b);
  scroll();
}

// bot lines: strings (trusted markup written above) or nodes; queued so they never interleave
function botSays(lines) {
  const list = [].concat(lines);
  busy = busy.then(async () => {
    for (const line of list) {
      const typing = el('p', 'msg bot typing', '<span></span><span></span><span></span>');
      typing.setAttribute('aria-hidden', 'true');
      log.append(typing);
      scroll();
      await wait(Math.min(350 + (typeof line === 'string' ? line.length : 80) * 6, 1100));
      typing.remove();
      const b = typeof line === 'string' ? el('p', 'msg bot', line) : line;
      b.classList.add('msg', 'bot');
      log.append(b);
      scroll();
    }
  });
  return busy;
}

// quick-reply buttons under the log; each is [label, action]
function offer(options) {
  busy.then(() => {
    quick.replaceChildren(...options.map(([label, act]) => {
      const b = el('button', 'chat-chip');
      b.type = 'button';
      b.textContent = label;
      b.onclick = () => { quick.replaceChildren(); userSays(label); act(); };
      return b;
    }));
    scroll();
  });
}

const MENU = () => [
  ['👋 Get to know me', knowMe],
  ['✉️ Contact me', startContact],
  ['💬 Ask a question', startAsk],
  ['🐞 Report a bug', startBug],
];
const backToMenu = () => ['↩ Menu', menu];

function greet() {
  const h = new Date().getHours();
  const hello = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  botSays([`${hello}! 👋 I'm Tagrid's assistant.`, 'What would you like to do?']);
  offer(MENU());
}

function menu() {
  flow = null;
  input.placeholder = 'Type a message…';
  botSays('Anything else I can help with?');
  offer(MENU());
}

/* ---------- 1. get to know me -------------------------------------------- */
const TOPICS = {
  edu: ['🎓 Education', () => ABOUT.education],
  res: ['🔬 Research', () => ABOUT.research],
  int: ['💼 Internship', () => ABOUT.internship],
  ski: ['🛠 Skills', () => ABOUT.skills],
};
function knowMe() {
  botSays(ABOUT.intro);
  offerAbout();
}
function tell(key) {
  botSays(TOPICS[key][1]());
  if (key === 'res') offerProjects(); else offerAbout(key);
}
function offerAbout(skip) {
  offer([
    ...Object.keys(TOPICS).filter(k => k !== skip).map(k => [TOPICS[k][0], () => tell(k)]),
    ['📄 My CV', myCv],
    ['✉️ Contact me', startContact],
    backToMenu(),
  ]);
}

function myCv() {
  botSays(`Here's my CV. Tap it to preview, or download the PDF.`);
  showCv();
}

// the CV as a card: first-page picture that opens the PDF, then Preview / Download
function showCv() {
  const card = el('a', 'cv-card');
  card.href = CV.pdf;
  card.target = '_blank';
  card.rel = 'noopener';
  card.innerHTML = `<img src="${CV.preview}" alt="First page of Tagrid's CV" loading="lazy" width="497" height="702">
    <span class="cv-name">📄 Tagrid_Chongkolrattanapond_CV.pdf</span>`;
  botSays(card);
  busy.then(() => {
    const link = (label, extra) => {
      const a = el('a', 'chat-chip');
      a.href = CV.pdf;
      a.textContent = label;
      Object.assign(a, extra);
      return a;
    };
    const contact = el('button', 'chat-chip');
    contact.type = 'button';
    contact.textContent = '✉️ Contact me';
    contact.onclick = () => { quick.replaceChildren(); userSays(contact.textContent); startContact(); };
    const back = el('button', 'chat-chip');
    back.type = 'button';
    back.textContent = '↩ Menu';
    back.onclick = () => { quick.replaceChildren(); userSays(back.textContent); menu(); };
    quick.replaceChildren(
      link('👀 Preview', { target: '_blank', rel: 'noopener', className: 'chat-chip send' }),
      link('⬇️ Download PDF', { download: 'Tagrid_Chongkolrattanapond_CV.pdf' }),
      contact, back);
    scroll();
  });
}
function offerProjects() {
  offer([
    ...PROJECTS.map(([label, hash]) => [`📂 Open ${label}`, () => openFolder(label, hash)]),
    [TOPICS.int[0], () => tell('int')],
    backToMenu(),
  ]);
}
function openFolder(label, hash) {
  botSays(`Opening the ${label} folder for you.`).then(() => {
    if (matchMedia('(max-width: 720px)').matches) setOpen(false);
    location.hash = hash;
  });
  offerAbout('res');
}

/* ---------- 2. contact me: a hiring email -------------------------------- */
const CONTACT_STEPS = [
  { key: 'company', ask: `Great! Which company are you from?`, hint: 'Company name' },
  { key: 'name', ask: `And your name?`, hint: 'Your name' },
  { key: 'role', ask: `Which position is it for?`, hint: 'e.g. AI Engineer Intern',
    chips: ['Internship', 'Co-op internship', 'Full-time role'] },
  { key: 'email', ask: `Where should Tagrid send the CV? Your work email, please.`, hint: 'you@company.com',
    check: v => isEmail(v) || `That doesn't look like an email address. Could you check it?` },
];

function startContact() {
  flow = { steps: CONTACT_STEPS, step: 0, data: {}, done: contactDone };
  botSays(`I'll write the email for you. Just four short questions.`);
  askStep();
}

function contactDone(d) {
  const role = /intern|role|position/i.test(d.role) ? d.role.toLowerCase() : `${d.role} position`;
  const subject = `${d.company} is interested in you: ${d.role}`;
  const body =
`Hi Tagrid,

My name is ${d.name}, and I'm reaching out from ${d.company}. We came across your portfolio and we're interested in you for our ${role}.

If you're interested in joining us, please send your CV/résumé back to ${d.email}, and we'll get in touch about the next steps.

Best regards,
${d.name}
${d.company}
${d.email}`;
  botSays(`Here's your message. Have a look, then send it from your email app or Gmail.`);
  showDraft(subject, body, 'Thanks! Tagrid will get back to you soon. 🙌');
}

/* ---------- 3. ask a question -------------------------------------------- */
function startAsk() {
  flow = { kind: 'ask' };
  input.placeholder = 'Ask about skills, dates, research…';
  botSays(`Sure, type your question below, or pick one of these.`);
  offerAsk();
}
function offerAsk() {
  offer([...SUGGESTED.map(s => [s, () => answer(s)]), backToMenu()]);
}
function askAgain() {
  flow = { kind: 'ask' };
  botSays('Go ahead!');
  offerAsk();
}

// short keys must stand alone ("ai" should not match "said"); longer ones can sit inside a word
const matches = (t, k) => k.length <= 3 ? new RegExp(`(^|[^a-z])${k}([^a-z]|$)`).test(t) : t.includes(k);

function answer(text) {
  const t = text.toLowerCase();
  const hit = FAQ.find(f => f.keys.some(k => matches(t, k)));
  if (!hit) {
    botSays([`I'm a simple bot and don't know that one yet. 🙈`, `I can send your question to Tagrid by email instead.`]);
    offer([['✉️ Email this question', () => emailQuestion(text)], ['💬 Ask something else', askAgain], backToMenu()]);
    return;
  }
  botSays(typeof hit.say === 'function' ? hit.say() : hit.say);
  if (hit.next === 'contact') offer([['✉️ Contact me', startContact], ['💬 Ask something else', askAgain], backToMenu()]);
  else if (hit.next === 'projects') offerProjects();
  else if (hit.next === 'cv') showCv();
  else offerAsk();
}

function emailQuestion(text) {
  flow = null;
  showDraft('Question from your portfolio site', `Hi Tagrid,\n\nI have a question from your portfolio site:\n\n${text}\n`, 'Sent your way. 📬');
}

/* ---------- 4. report a bug ---------------------------------------------- */
const BUG_STEPS = [
  { key: 'what', ask: `Sorry about that! What went wrong? Tell me what you did and what you saw.`, hint: 'e.g. a folder won’t open' },
  { key: 'reply', ask: `Want a reply when it's fixed? Leave your email, or skip.`, hint: 'you@email.com (optional)',
    chips: ['Skip'], check: v => v === 'Skip' || isEmail(v) || `That doesn't look like an email address. Try again, or press Skip.` },
];
function startBug() {
  flow = { steps: BUG_STEPS, step: 0, data: {}, done: bugDone };
  askStep();
}
function bugDone(d) {
  const body =
`Hi Tagrid,

I found a bug on your portfolio site.

What happened:
${d.what}

Reply to: ${d.reply === 'Skip' ? '(none)' : d.reply}

--- added automatically ---
Page: ${location.href}
Screen: ${innerWidth}×${innerHeight} (${devicePixelRatio}x)
Browser: ${navigator.userAgent}
Time: ${new Date().toString()}`;
  botSays(`Thanks! I've written the report and added your browser and screen size so it's easy to reproduce.`);
  showDraft(`Bug report: ${d.what.length > 50 ? d.what.slice(0, 50) + '…' : d.what}`, body, 'Thanks for helping fix it! 🛠');
}

/* ---------- shared: step-by-step forms and the email draft --------------- */
function stepChips(s) {
  return [...(s.chips || []).map(c => [c, () => takeStep(c)]), ['✖ Cancel', menu]];
}

function askStep() {
  const s = flow.steps[flow.step];
  input.placeholder = s.hint;
  botSays(s.ask);
  offer(stepChips(s));
  if (hover()) busy.then(() => input.focus());
}

function takeStep(value) {
  const s = flow.steps[flow.step];
  const bad = s.check && s.check(value);
  if (typeof bad === 'string') { botSays(bad); offer(stepChips(s)); return; }
  flow.data[s.key] = value;
  flow.step += 1;
  if (flow.step < flow.steps.length) return askStep();
  const { done, data } = flow;
  flow = null;
  input.placeholder = 'Type a message…';
  done(data);
}

function showDraft(subject, body, thanks) {
  const card = el('div', 'draft');
  const to = el('p', 'draft-to', 'To: ');
  to.append(Object.assign(el('b'), { textContent: ME.email }));
  const s = el('p', 'draft-subject');
  s.textContent = subject;
  const pre = el('pre', 'draft-body');
  pre.textContent = body;
  card.append(to, s, pre);
  botSays(card);

  const mailto = `mailto:${ME.email}?subject=${enc(subject)}&body=${enc(body)}`;
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(ME.email)}&su=${enc(subject)}&body=${enc(body)}`;
  const sent = () => { botSays(thanks); offer([backToMenu()]); };
  busy.then(() => {
    const link = (label, href, blank) => {
      const a = el('a', 'chat-chip send');
      a.href = href;
      a.textContent = label;
      if (blank) { a.target = '_blank'; a.rel = 'noopener'; }
      a.onclick = () => { quick.replaceChildren(); userSays(label); sent(); };
      return a;
    };
    const copy = el('button', 'chat-chip');
    copy.type = 'button';
    copy.textContent = '📋 Copy text';
    copy.onclick = async () => {
      try { await navigator.clipboard.writeText(`To: ${ME.email}\nSubject: ${subject}\n\n${body}`); copy.textContent = '✓ Copied'; }
      catch { copy.textContent = 'Copy failed'; }
    };
    const redo = el('button', 'chat-chip');
    redo.type = 'button';
    redo.textContent = '✖ Start over';
    redo.onclick = () => { quick.replaceChildren(); userSays('Start over'); menu(); };
    quick.replaceChildren(link('📧 Send with email app', mailto), link('Open in Gmail ↗', gmail, true), copy, redo);
    scroll();
  });
}

/* ---------- typing ------------------------------------------------------- */
form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  quick.replaceChildren();
  userSays(text);
  if (flow?.steps) return takeStep(text);
  if (flow?.kind === 'ask') return answer(text);
  // typed from the menu: route the obvious intents, else treat it as a question
  const t = text.toLowerCase();
  if (/\bbug\b|broken|error|doesn.?t work|not working/.test(t)) return startBug();
  if (/\b(hire|hiring|recruit|job|offer|interview)\b/.test(t)) return startContact();
  answer(text);
});
})();
