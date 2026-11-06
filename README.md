# Hulchul – Responsive Event Management Website

A modern, fully responsive website where users can explore upcoming events, search and filter them, view details with a live countdown, and register through a validated form. Built for the **K Explore – Web Designing** task using plain **HTML5, CSS3 and JavaScript** (no frameworks, no build step).

🔗 **Live site:** _add your Netlify / Vercel / GitHub Pages link here_
📁 **Repository:** _add your GitHub link here_

## Features

**Core requirements**
- Hero section introducing the platform, with quick stats
- Featured events and a full upcoming events grid
- Event cards showing image, name, date, venue and short description
- Live search (name, venue, keywords), category filter chips, and sorting
- Event details modal with full description, price, seats left and registration option
- Registration form (name, email, phone, selected event) with JavaScript validation
- Confirmation message with a booking ID after successful submission
- Responsive on mobile, tablet and desktop (CSS Grid, Flexbox, media queries)

**Bonus challenges**
- Dark / light mode (remembers your choice, respects system preference)
- Live countdown timer for every event
- Scroll-reveal animations, hover effects, smooth modal transitions
- Local Storage registration management (view and cancel your registrations, seats update automatically)

**Extras**
- Duplicate-registration check (same email + same event)
- Sold-out handling
- Keyboard accessible (Tab, Enter, Esc) with ARIA labels
- Respects `prefers-reduced-motion`

## Project structure

```
├── index.html   # Page structure (semantic HTML5)
├── style.css    # Design tokens, layout, components, responsive rules
├── script.js    # Data, rendering, filters, modal, validation, storage
└── README.md
```

## How it works

1. **Data:** events live in the `EVENTS` array at the top of `script.js`. Adding an object there adds a new card automatically.
2. **Rendering:** JavaScript builds the cards from that array. Text is escaped before insertion to avoid HTML injection.
3. **Search & filter:** the current search text, category and sort order are kept in one `state` object; changing any of them re-renders the grid.
4. **Modal:** one modal has three panes (details → form → success). A `setInterval` drives the countdown and is cleared when the modal closes.
5. **Validation:** each field has its own validator function.
   - Name: at least 2 characters, letters/spaces only
   - Email: standard `name@domain.tld` pattern
   - Phone: valid 10-digit Indian mobile number (starts with 6–9, optional +91)
   - Event: must be selected

   Fields validate when you leave them and re-validate as you fix mistakes.
6. **Storage:** registrations are saved in `localStorage` under `hulchul.registrations`; the theme under `hulchul.theme`.

## Run locally

Just open `index.html` in a browser, or use a simple server:

```bash
npx serve .
```

## Deploy

- **GitHub Pages:** Repo → Settings → Pages → Deploy from branch → `main` / root
- **Netlify:** drag and drop the folder, or connect the repo (no build command, publish directory `.`)
- **Vercel:** import the repo, framework preset "Other"

## Git workflow

```bash
git init
git add .
git commit -m "feat: initial Hulchul event website"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## Tech stack

HTML5 · CSS3 (Grid, Flexbox, custom properties) · Vanilla JavaScript (ES6+) · Local Storage · Google Fonts (Poppins) · Picsum Photos for demo images

## Possible improvements

- Backend + database for real registrations
- Email confirmation
- Calendar (.ics) download
- Admin page to add events
