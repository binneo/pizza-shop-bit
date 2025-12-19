# Bit Pizzeria — Website

This is a small static website for **Bit Pizzeria** — a playful pizza shop that nods to Bitcoin and celebrates Pizza Day (Feb 9).

Files:
- `index.html` — homepage
- `styles.css` — site styles
- `script.js` — small interactive behaviors (nav toggle, Pizza Day countdown, BTC modal)
- `assets/` — small SVG assets (pizza and favicon)

How to view locally:
1. Open `index.html` in your browser (double-click or `xdg-open`).
   - `xdg-open index.html` on Linux
2. Or serve with a simple Python server:
   - `python3 -m http.server 8000` then open http://localhost:8000

Notes:
- The "Pay with Bitcoin" button shows a demo modal and a placeholder QR.
- Pizza Day is hard-coded as Feb 9 and a simple countdown is shown on the homepage. On Pizza Day the site triggers a confetti celebration and you can also trigger a celebration manually using the "Celebrate" button in the Pizza Day section. You can toggle emoji confetti (🍕/₿) via the checkbox in the Pizza Day promo — the engine keeps particle counts limited and respects `prefers-reduced-motion` for a lightweight, accessible experience.
- Optionally use image sprites (better crispness on some platforms) with the "Use image sprites" checkbox.
- Opt into a short confetti sound via the "Sound" checkbox. Sound is off by default to respect users and browsers, and the engine only plays a short per-burst pop when enabled.
- A small live counter shows how many confetti particles have been launched this session.

Ideas to extend:
- Add a working Lightning or on-chain checkout
- Add real images, menu pricing fetched from a backend, and animations

Enjoy! 🍕 ₿
