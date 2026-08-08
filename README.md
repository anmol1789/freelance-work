# Pandey Ji Content Studio — Website

A responsive, single-page website with a live slot-booking flow, built for **Pandey Ji Content Studio Pvt. Ltd.** (Shubham Pratyush).

## Files
- `index.html` — page structure & content
- `style.css` — all styling (cinematic black/red brand theme)
- `script.js` — calendar, slot grid, form, WhatsApp booking logic
- `assets/` — logo, founder photo, and Udyam registration certificate (image + PDF)

### Yes — every photo and the PDF are fully editable
None of them are baked into the design — they're just plain files sitting in the `assets/` folder, referenced by filename in `index.html`. To change one, replace the file (keep the same filename) or point the tag at a new filename. No code knowledge needed beyond opening a text editor if you rename something.

- `assets/logo.png` — navbar & footer logo (transparent background)
- `assets/client-photo.jpg` — founder photo shown in the hero section
- `assets/udyam-cert.png` — certificate image shown in the "Registered" section
- `assets/udyam-certificate.pdf` — the real PDF that opens when someone clicks the certificate image
- `assets/reel-1.mp4` + `assets/reel-1-poster.jpg` — left video in the "Reels & Edits" section
- `assets/reel-2.mp4` + `assets/reel-2-poster.jpg` — right video in the "Reels & Edits" section

To swap any of these, just replace the file with a new one **using the same filename**. Each image/video tag in `index.html` has an `<!-- EDITABLE -->` comment right above it pointing to the exact file to swap. The two videos in `assets/` right now are placeholders (a simple title card) — drop your real reels in with the same filenames and they'll show up automatically. A poster image is optional but recommended (it's the thumbnail shown before the video plays).

### "See What We Do" button
This button (top of the page, next to "Check Slot Availability") now links straight to an Instagram Reel instead of scrolling down the page. Open `index.html`, find the `<!-- EDITABLE -->` comment above it, and replace the placeholder URL with your real reel link:
```html
<a href="https://www.instagram.com/reel/REPLACE_WITH_YOUR_REEL_ID/" ...>
```

## How booking works (no backend needed)
1. Visitor picks a date (next 21 days) and an open time slot (9 AM–8 PM, hourly).
2. They fill in their details and tap **Send Booking Request on WhatsApp**.
3. Their browser opens WhatsApp with a pre-filled message to **+91 92638 50271** containing their name, phone, service, location, date/time and notes.
4. That slot is marked **Requested** on their device (via browser storage) so they can't accidentally double-book it themselves.
5. Shubham confirms the booking by replying on WhatsApp or calling.

### Marking a slot as officially "Booked" for everyone
Because there's no server/database, slot status only syncs on the visitor's own device automatically. Once you've confirmed a booking (by call/WhatsApp), open `script.js` and add it to the `CONFIRMED_BOOKINGS` object near the top:

```js
const CONFIRMED_BOOKINGS = {
  "2026-08-05": ["10:00", "15:00"],   // Aug 5, 2026 — 10 AM and 3 PM booked
  "2026-08-06": ["09:00"],
};
```

Save the file and re-upload/redeploy — that slot will now show as **Booked** (greyed out) for every visitor. Do this every time you confirm a new shoot.

> **Want it fully automatic across every visitor in real time (no manual editing)?**
> That needs a small backend — e.g. a free Google Sheet + Apps Script, Firebase, or Airtable — so every booking writes to one shared calendar instantly. Happy to wire that up if you want to upgrade later.

## Editing content
- **Phone number:** change the `PHONE` constant at the top of `script.js`, and update the `tel:`/`wa.me` links and visible number in `index.html`.
- **Working hours/days:** change `WORK_START_HOUR` / `WORK_END_HOUR` in `script.js`.
- **Services / reel types:** edit the lists in the "Services" and "Specialities" sections of `index.html`, and the `REELS` array in `script.js`.
- **Instagram handle:** update the links in the Contact section and footer of `index.html`.

## Deploying
This is a static site — no build step, no server required. You can host it for free on any of these:
- **Netlify** or **Vercel** — drag-and-drop the folder, done in ~1 minute.
- **GitHub Pages** — push the 3 files to a repo and enable Pages.
- Any regular web hosting (just upload the files via FTP/cPanel).

Then point your domain (e.g. `pandeyjicontentstudio.com`) at it.

## Notes
- **Mobile shows the exact same layout as desktop**, scaled to fit the screen (pinch-to-zoom works, like viewing a desktop site on your phone) — this was a specific request, so the nav, hero, and grids do **not** restructure into a stacked mobile layout.
- No tracking, no ads, no external dependencies besides Google Fonts (loaded via CDN link in `index.html`).
- All copy states the company as **legally registered under the Ministry of Corporate Affairs, Government of India**, without publishing the CIN/certificate number publicly (kept private for the business, as is standard).
