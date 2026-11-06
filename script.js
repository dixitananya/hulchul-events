/* =========================================================
   Hulchul – script.js
   Sections: 1) Data  2) Helpers  3) Rendering  4) Filters
             5) Modal + countdown  6) Form validation
             7) Local Storage  8) Theme + nav  9) Init
   ========================================================= */

/* ---------- 1) DATA ----------
   To add an event, just add an object here. The page rebuilds itself. */
const EVENTS = [
  { id: 1, title: "CodeStorm 24-Hour Hackathon", category: "Tech", featured: true,
    date: "2026-12-12T09:00:00", venue: "Tech Park Auditorium, Bhubaneswar", price: 0, seats: 150,
    img: "https://picsum.photos/seed/hackathon/900/560",
    short: "Build, break and ship a project in 24 hours with mentors on call.",
    long: "Form a team of up to four, pick a problem statement and build a working prototype in 24 hours. Mentors from industry will be available throughout, food and swag are included, and the top three teams win cash prizes and internship interviews." },
  { id: 2, title: "Neon Nights Music Festival", category: "Music", featured: true,
    date: "2026-12-20T18:00:00", venue: "Marine Drive Open Grounds", price: 799, seats: 400,
    img: "https://picsum.photos/seed/musicfest/900/560",
    short: "An open-air night of indie bands, DJs and food trucks.",
    long: "Six live acts, two stages and a late-night DJ set. Gates open at 6 PM. Bring a friend, a light jacket and your dancing shoes. Food stalls and a chill-out zone are available on site." },
  { id: 3, title: "React in a Weekend Workshop", category: "Workshop", featured: false,
    date: "2026-11-21T10:00:00", venue: "Innovation Lab, Block C", price: 299, seats: 40,
    img: "https://picsum.photos/seed/reactworkshop/900/560",
    short: "Hands-on workshop: build and deploy a React app by Sunday.",
    long: "Two days of guided coding. You'll learn components, state, hooks and routing, then deploy your app to the web. Basic HTML, CSS and JavaScript knowledge is enough. Bring your laptop." },
  { id: 4, title: "Startup Pitch Night", category: "Business", featured: true,
    date: "2026-11-28T17:30:00", venue: "Founders Hub, Patia", price: 150, seats: 80,
    img: "https://picsum.photos/seed/startuppitch/900/560",
    short: "Watch ten student startups pitch to real investors.",
    long: "Ten teams get five minutes each to pitch, followed by live feedback from investors and founders. Networking over snacks follows. Great for aspiring entrepreneurs and curious minds." },
  { id: 5, title: "Inter-College Football Cup", category: "Sports", featured: false,
    date: "2026-12-05T08:00:00", venue: "Kalinga Sports Complex", price: 50, seats: 300,
    img: "https://picsum.photos/seed/footballcup/900/560",
    short: "Sixteen teams, one trophy. Come cheer for your college!",
    long: "A knockout tournament with sixteen college teams. Matches run from morning to evening with the final under floodlights. Entry includes a seat in the stands and a match-day cap." },
  { id: 6, title: "Street Art & Photography Walk", category: "Art", featured: false,
    date: "2026-11-15T07:00:00", venue: "Old Town Heritage Lane", price: 100, seats: 25,
    img: "https://picsum.photos/seed/artwalk/900/560",
    short: "Sunrise walk with a pro photographer and local muralists.",
    long: "Explore murals, temples and hidden lanes while learning composition and light from a professional photographer. Any camera, including your phone, is welcome." },
  { id: 7, title: "AI & Machine Learning Summit", category: "Tech", featured: true,
    date: "2027-01-09T09:30:00", venue: "Convention Centre, Hall A", price: 499, seats: 250,
    img: "https://picsum.photos/seed/aisummit/900/560",
    short: "Talks and live demos on the latest in AI from industry experts.",
    long: "A full-day summit with keynotes, live demos and panel discussions covering machine learning, generative AI and careers in the field. Lunch and certificate included." },
  { id: 8, title: "Stand-Up Comedy Evening", category: "Music", featured: false,
    date: "2026-11-14T19:30:00", venue: "The Laugh Loft", price: 349, seats: 0,
    img: "https://picsum.photos/seed/comedynight/900/560",
    short: "Three comedians, ninety minutes, zero dull moments.",
    long: "An evening of observational comedy from three rising stand-ups. This show is sold out, but check back for future dates." },
  { id: 9, title: "Resume & Interview Bootcamp", category: "Workshop", featured: false,
    date: "2026-12-02T14:00:00", venue: "Career Centre, Main Campus", price: 0, seats: 60,
    img: "https://picsum.photos/seed/bootcamp/900/560",
    short: "Polish your resume and ace mock interviews with recruiters.",
    long: "Get your resume reviewed live and practise with real recruiters in mock interviews. You'll leave with a sharper resume and feedback you can use right away." }
];

/* ---------- 2) HELPERS ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// Escape text before putting it in innerHTML so user/data text can't inject HTML.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const fmtDate = (iso) => new Date(iso).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
const fmtPrice = (p) => (p === 0 ? "Free" : "₹" + p.toLocaleString("en-IN"));
const getEvent = (id) => EVENTS.find((e) => e.id === Number(id));

/* ---------- 7) LOCAL STORAGE (defined early; used everywhere) ---------- */
const REG_KEY = "hulchul.registrations";
const THEME_KEY = "hulchul.theme";

function loadRegs() {
  try { return JSON.parse(localStorage.getItem(REG_KEY)) || []; }
  catch { return []; }
}
function saveRegs(list) {
  try { localStorage.setItem(REG_KEY, JSON.stringify(list)); } catch { /* storage blocked */ }
}
// Seats left = original seats minus registrations made in this browser.
function seatsLeft(ev) {
  const taken = loadRegs().filter((r) => r.eventId === ev.id).length;
  return Math.max(ev.seats - taken, 0);
}

/* ---------- 3) RENDERING ---------- */
const state = { query: "", category: "All", sort: "date" };
const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("visible"); revealObserver.unobserve(en.target); } });
    }, { threshold: 0.1 })
  : null;

function cardHTML(ev) {
  const d = new Date(ev.date);
  const left = seatsLeft(ev);
  return `
    <article class="card" data-id="${ev.id}" tabindex="0" aria-label="${esc(ev.title)}">
      <div class="card-img">
        <img src="${esc(ev.img)}" alt="${esc(ev.title)}" loading="lazy" onerror="this.remove()" />
        <span class="card-tag">${esc(ev.category)}</span>
        <div class="card-date"><small>${d.toLocaleString("en-IN", { month: "short" }).toUpperCase()}</small>${d.getDate()}</div>
      </div>
      <div class="card-body">
        <h3>${esc(ev.title)}</h3>
        <p class="card-venue">📍 ${esc(ev.venue)}</p>
        <p class="card-desc">${esc(ev.short)}</p>
        <div class="card-foot">
          <span class="price">${fmtPrice(ev.price)}</span>
          ${left === 0 ? '<span class="sold-out">Sold out</span>' : '<button class="btn btn-primary" type="button">View details</button>'}
        </div>
      </div>
    </article>`;
}

function mountCards(container, list) {
  container.innerHTML = list.map(cardHTML).join("");
  $$(".card", container).forEach((c, i) => {
    c.style.transitionDelay = Math.min(i * 60, 360) + "ms";
    revealObserver ? revealObserver.observe(c) : c.classList.add("visible");
  });
}

function renderFeatured() {
  mountCards($("#featuredGrid"), EVENTS.filter((e) => e.featured).slice(0, 3));
}

function renderEvents() {
  const q = state.query.trim().toLowerCase();
  let list = EVENTS.filter((e) => {
    const matchCat = state.category === "All" || e.category === state.category;
    const hay = (e.title + " " + e.venue + " " + e.short + " " + e.category).toLowerCase();
    return matchCat && (!q || hay.includes(q));
  });

  if (state.sort === "date") list.sort((a, b) => new Date(a.date) - new Date(b.date));
  if (state.sort === "name") list.sort((a, b) => a.title.localeCompare(b.title));
  if (state.sort === "price") list.sort((a, b) => a.price - b.price);

  mountCards($("#eventsGrid"), list);
  $("#emptyState").hidden = list.length > 0;
  $("#resultCount").textContent = `${list.length} event${list.length === 1 ? "" : "s"} found`;
}

function renderChips() {
  const cats = ["All", ...new Set(EVENTS.map((e) => e.category))];
  $("#chips").innerHTML = cats.map((c) =>
    `<button class="chip ${c === state.category ? "active" : ""}" role="tab" aria-selected="${c === state.category}" data-cat="${esc(c)}">${esc(c)}</button>`
  ).join("");
}

function renderStats() {
  const upcoming = EVENTS.filter((e) => new Date(e.date) > new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
  $("#statEvents").textContent = upcoming.length;
  $("#statSeats").textContent = EVENTS.reduce((n, e) => n + seatsLeft(e), 0).toLocaleString("en-IN");
  $("#statNext").textContent = upcoming[0] ? new Date(upcoming[0].date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "–";
}

function renderRegs() {
  const regs = loadRegs();
  $("#regCount").textContent = regs.length;
  const box = $("#regList");
  if (!regs.length) {
    box.innerHTML = `<div class="reg-empty">You haven't registered for anything yet. Pick an event above to get started!</div>`;
    return;
  }
  box.innerHTML = regs.map((r) => {
    const ev = getEvent(r.eventId);
    return `
      <div class="reg-item">
        <h4>${esc(ev ? ev.title : "Event")}</h4>
        <p>📅 ${ev ? esc(fmtDate(ev.date)) : ""}</p>
        <p>👤 ${esc(r.name)} · ${esc(r.email)}</p>
        <p>🎫 ${esc(r.id)}</p>
        <button type="button" data-cancel="${esc(r.id)}">Cancel registration</button>
      </div>`;
  }).join("");
}

function refreshAll() {
  renderStats(); renderFeatured(); renderEvents(); renderRegs();
}

/* ---------- 4) FILTER EVENTS ---------- */
function debounce(fn, ms = 200) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

$("#searchInput").addEventListener("input", debounce((e) => { state.query = e.target.value; renderEvents(); }));
$("#sortSelect").addEventListener("change", (e) => { state.sort = e.target.value; renderEvents(); });
$("#chips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  state.category = chip.dataset.cat;
  renderChips(); renderEvents();
});
$("#resetFilters").addEventListener("click", () => {
  state.query = ""; state.category = "All"; state.sort = "date";
  $("#searchInput").value = ""; $("#sortSelect").value = "date";
  renderChips(); renderEvents();
});

/* ---------- 5) MODAL + COUNTDOWN ---------- */
const modal = $("#modal");
let currentEvent = null;
let timer = null;
let lastFocus = null;

function showPane(name) {
  ["Details", "Form", "Success"].forEach((p) => { $("#pane" + p).hidden = p !== name; });
  modal.querySelector(".modal-card").scrollTop = 0;
}

function openModal(id) {
  currentEvent = getEvent(id);
  if (!currentEvent) return;
  const ev = currentEvent;
  const left = seatsLeft(ev);
  lastFocus = document.activeElement;

  $("#mBanner").innerHTML = `<img src="${esc(ev.img)}" alt="" onerror="this.remove()" />`;
  $("#mCategory").textContent = ev.category;
  $("#modalTitle").textContent = ev.title;
  $("#mDate").textContent = fmtDate(ev.date);
  $("#mVenue").textContent = ev.venue;
  $("#mPrice").textContent = fmtPrice(ev.price);
  $("#mSeats").textContent = left === 0 ? "Sold out" : `${left} seats left`;
  $("#mDesc").textContent = ev.long;

  const btn = $("#goRegister");
  btn.disabled = left === 0 || new Date(ev.date) < new Date();
  btn.textContent = left === 0 ? "Sold out" : "Register for this event";

  startCountdown(ev.date);
  showPane("Details");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  $(".modal-close").focus();
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  clearInterval(timer);
  if (lastFocus) lastFocus.focus();
}

function startCountdown(iso) {
  clearInterval(timer);
  const box = $("#mCountdown");
  const tick = () => {
    const diff = new Date(iso) - new Date();
    if (diff <= 0) { box.innerHTML = `<div class="started">🎬 This event has started or ended</div>`; clearInterval(timer); return; }
    const d = Math.floor(diff / 864e5);
    const h = Math.floor(diff / 36e5) % 24;
    const m = Math.floor(diff / 6e4) % 60;
    const s = Math.floor(diff / 1e3) % 60;
    box.innerHTML = [["Days", d], ["Hours", h], ["Mins", m], ["Secs", s]]
      .map(([l, v]) => `<div><strong>${String(v).padStart(2, "0")}</strong><span>${l}</span></div>`).join("");
  };
  tick();
  timer = setInterval(tick, 1000);
}

// Open modal from any card (click, or Enter/Space for keyboard users)
document.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (card) openModal(card.dataset.id);
  if (e.target.closest("[data-close]")) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  if ((e.key === "Enter" || e.key === " ") && e.target.classList?.contains("card")) { e.preventDefault(); openModal(e.target.dataset.id); }
});

$("#goRegister").addEventListener("click", () => {
  buildEventSelect();
  $("#fEvent").value = currentEvent.id;
  clearErrors();
  showPane("Form");
  $("#fName").focus();
});
$("#backToDetails").addEventListener("click", () => showPane("Details"));

/* ---------- 6) FORM VALIDATION ---------- */
const form = $("#regForm");

function buildEventSelect() {
  const open = EVENTS.filter((e) => seatsLeft(e) > 0 && new Date(e.date) > new Date());
  $("#fEvent").innerHTML = `<option value="">Choose an event…</option>` +
    open.map((e) => `<option value="${e.id}">${esc(e.title)}</option>`).join("");
}

const validators = {
  name(v) {
    v = v.trim();
    if (!v) return "Please enter your name.";
    if (v.length < 2) return "Name must be at least 2 characters.";
    if (!/^[A-Za-z][A-Za-z .'-]*$/.test(v)) return "Use letters, spaces, dots or hyphens only.";
    return "";
  },
  email(v) {
    v = v.trim();
    if (!v) return "Please enter your email address.";
    if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(v)) return "Enter a valid email like name@example.com.";
    return "";
  },
  phone(v) {
    const digits = v.replace(/[\s-]/g, "").replace(/^(\+91|0)/, "");
    if (!v.trim()) return "Please enter your phone number.";
    if (!/^[6-9]\d{9}$/.test(digits)) return "Enter a valid 10-digit mobile number.";
    return "";
  },
  event(v) {
    if (!v) return "Please select an event.";
    return "";
  }
};
const fieldIds = { name: "fName", email: "fEmail", phone: "fPhone", event: "fEvent" };
const errIds = { name: "eName", email: "eEmail", phone: "ePhone", event: "eEvent" };

function validateField(key) {
  const input = $("#" + fieldIds[key]);
  const msg = validators[key](input.value);
  const wrap = input.closest(".field");
  $("#" + errIds[key]).textContent = msg;
  wrap.classList.toggle("invalid", !!msg);
  wrap.classList.toggle("valid", !msg);
  input.setAttribute("aria-invalid", msg ? "true" : "false");
  return !msg;
}
function clearErrors() {
  form.reset();
  Object.keys(fieldIds).forEach((k) => {
    $("#" + errIds[k]).textContent = "";
    $("#" + fieldIds[k]).closest(".field").classList.remove("invalid", "valid");
  });
}

// Live validation: check when the user leaves a field, and re-check while fixing it.
Object.keys(fieldIds).forEach((k) => {
  const input = $("#" + fieldIds[k]);
  input.addEventListener("blur", () => validateField(k));
  input.addEventListener("input", () => { if (input.closest(".field").classList.contains("invalid")) validateField(k); });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const allGood = Object.keys(fieldIds).map(validateField).every(Boolean);
  if (!allGood) { $(".field.invalid input, .field.invalid select")?.focus(); return; }

  const ev = getEvent($("#fEvent").value);
  const email = $("#fEmail").value.trim().toLowerCase();
  const regs = loadRegs();

  if (regs.some((r) => r.eventId === ev.id && r.email === email)) {
    $("#eEmail").textContent = "This email is already registered for this event.";
    $("#fEmail").closest(".field").classList.add("invalid");
    return;
  }
  if (seatsLeft(ev) === 0) { $("#eEvent").textContent = "Sorry, this event just sold out."; return; }

  const reg = {
    id: "EVT-" + Date.now().toString(36).toUpperCase().slice(-6),
    eventId: ev.id,
    name: $("#fName").value.trim(),
    email,
    phone: $("#fPhone").value.trim(),
    createdAt: new Date().toISOString()
  };
  regs.push(reg);
  saveRegs(regs);

  $("#successMsg").textContent = `Thanks ${reg.name.split(" ")[0]}! You're registered for "${ev.title}" on ${fmtDate(ev.date)}. We've saved your booking below.`;
  $("#successId").textContent = reg.id;
  showPane("Success");
  refreshAll();
  toast("Registration confirmed ✔");
});

// Cancel a registration from the "My Registrations" list
$("#regList").addEventListener("click", (e) => {
  const id = e.target.dataset.cancel;
  if (!id) return;
  saveRegs(loadRegs().filter((r) => r.id !== id));
  refreshAll();
  toast("Registration cancelled");
});

/* ---------- 8) THEME + NAV + TOAST ---------- */
function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  $("#themeToggle").textContent = t === "dark" ? "☀️" : "🌙";
}
function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch { /* ignore */ }
  applyTheme(saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
}
$("#themeToggle").addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
});

const navLinks = $("#navLinks");
$("#menuBtn").addEventListener("click", (e) => {
  const open = navLinks.classList.toggle("open");
  e.currentTarget.setAttribute("aria-expanded", open);
});
navLinks.addEventListener("click", (e) => { if (e.target.closest("a")) navLinks.classList.remove("open"); });

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

/* ---------- 9) INIT ---------- */
initTheme();
$("#year").textContent = new Date().getFullYear();
renderChips();
refreshAll();
