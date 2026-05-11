# Dr. Muhammad Zeeshan Ahmed Raza — Doctor Website

A professional, Mediplus-inspired multi-page website for **Dr. Muhammad Zeeshan Ahmed Raza** (MBBS, MS — Andrologist) practicing at **Cavalry Hospital, Lahore**.

Built as static HTML/CSS/JS — no build tools, no framework, no backend. Open `index.html` in a browser and it works.

## Project location

```
C:\Users\hp\Desktop\dr-zeeshan-website\
```

## File structure

```
dr-zeeshan-website/
├── index.html              Home (hero, services, stats, appointment, testimonials)
├── about.html              Full doctor profile, education, experience
├── services.html           All andrology services + transparent pricing
├── appointment.html        Booking form + clinic hours + what-to-expect
├── contact.html            Contact details, Google Map, message form
├── README.md               This file
└── assets/
    ├── css/
    │   └── style.css       All shared styling (Mediplus-inspired theme)
    ├── js/
    │   └── main.js         Nav toggle, animated counters, form handling
    └── images/             (Place doctor.png and other photos here)
```

## How to view it locally

**Option 1 — open directly:**
Double-click `index.html`. It will open in your default browser.

**Option 2 — local server (recommended for the Google Map iframe):**

```powershell
cd C:\Users\hp\Desktop\dr-zeeshan-website
python -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

## What you should customise before going live

The site is wired with realistic placeholders pulled from the doctor's public ApkaMuaalij profile. Edit these before publishing:

| What | Where | Current placeholder |
|---|---|---|
| WhatsApp number | `assets/js/main.js` line `~50` (and every page's WhatsApp links) | `923194040103` — replace with the doctor's real WhatsApp in international format |
| Email | All HTML files (search `drmzeeshanraza25612@gmail.com`) | `drmzeeshanraza25612@gmail.com` |
| Doctor photo | `assets/images/doctor.png` (transparent PNG) — then uncomment the `<img>` tag in `index.html` hero | placeholder gradient |
| Facebook / Instagram URLs | Top bar + footer — search `href="#"` | `#` (empty) |
| Patient counts in stats | `index.html` — `data-count="10000"` etc. | rough estimates |

To replace the doctor's photo:

1. Save a clean cut-out PNG (transparent background, ideally 800×1000) at `assets/images/doctor.png`.
2. In `index.html`, find the hero `image-wrap` block and uncomment the `<img>` tag.
3. Optionally remove the `<span class="placeholder">DR</span>` line.

## Tech notes

- **No build step.** Pure HTML, CSS, and vanilla JS.
- **Fonts:** Poppins (headings) + Inter (body) loaded from Google Fonts CDN.
- **Icons:** Font Awesome 6.5.1 loaded from cdnjs.
- **Forms:** Submitting an appointment form opens WhatsApp with a pre-filled message. No backend is needed for this flow. If you later want to email or store submissions, swap the form handler in `assets/js/main.js` for a Formspree / Web3Forms / Netlify Forms endpoint.

## Deploying

This site is fully static, so any of these will work — **all free**:

- **Netlify:** drag the `dr-zeeshan-website` folder onto netlify.com/drop. Live in 30 seconds.
- **Vercel:** `vercel deploy` from this folder.
- **GitHub Pages:** push to a repo, enable Pages on the `main` branch.
- **cPanel / shared hosting:** upload the entire folder via FTP to `public_html/`.

## SEO checklist already done

- Unique `<title>` and `<meta description>` per page
- Semantic HTML (`<header>`, `<nav>`, `<section>`, `<footer>`)
- Mobile-responsive (breakpoints at 992px and 768px)
- Schema-friendly content structure
- Internal linking between all pages
- Canonical contact details across every page

## What to add next (suggested)

1. Real doctor photo (transparent PNG)
2. Real WhatsApp number wired into the form handler
3. Blog / articles section linked to YouTube videos (great for SEO + watch hours)
4. Patient testimonial collection — embed real ApkaMuaalij review widget
5. Online payment integration if accepting fees online (Easypaisa / JazzCash / Stripe)
6. Google Search Console verification + submit sitemap

---

**Disclaimer:** All medical content on this website is educational. Diagnosis and treatment require a personal consultation with a qualified physician.
Last updated: testing git push from VS Code.
HI