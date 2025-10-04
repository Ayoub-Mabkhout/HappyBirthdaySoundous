# 🎁 Autumn-Goofy Birthday Gift Card Website

A static, playful birthday gift-reveal website with an **autumn + goofy** aesthetic.  
Designed to be hosted on **GitHub Pages** (static only — HTML/CSS/JS). Copilot/Codex should read this file and implement the site accordingly.

---

## 📂 Repo Structure (assets already provided)

/index.html (landing page with password + animation)
/gift.html (gift reveal page)
/style.css (site styling / theme)
/script.js (shared JS for animations, audio sequencing, confetti, redirect)

/images/
gift.jpg (present box image)
gift-card.png (the revealed gift card image)
/faces/
face01.png
face02.png
...
face08.png (8 placeholder face images)

/audios/
birthday-song.mp3 (full happy birthday song track)
clap-track.mp3 (applause track to play immediately after song finishes)
party-horn.mp3 (horn sound effect for present reveal)

markdown
Copy code

> **Note:** All assets are already uploaded under the exact paths above. Copilot should wire these into the pages; no asset downloads needed.

---

## 🔎 Overview / UX Flow

**Landing page (`index.html`)**

1. Shows headline: _“Enter the password to claim your gift 🎁”_
2. Password input + **disabled** “Claim Your Gift” button (button enables when correct password is typed).
3. When button clicked:
   - Password input & button **fade out** (despawn).
   - Trigger a confetti burst (use `canvas-confetti`).
   - Run an animated sequence of the 8 face images (bounce/rotate/pop — timeline).
   - Play `birthday-song.mp3` **in full**.
   - Once the song **completes**, immediately play `clap-track.mp3`.
   - Only **after** the clap track finishes, automatically redirect to `gift.html`.

**Gift page (`gift.html`)**

1. Displays headline: _“Happy Birthday [Name]!”_ and centered `gift.jpg`.
2. When the present (`gift.jpg`) is clicked:
   - Trigger a confetti burst (again `canvas-confetti`).
   - Play `party-horn.mp3`.
   - Animate the present to fade out with a goofy transform (e.g., spin + shrink + wobble).
   - Simultaneously fade in `gift-card.png` inside a styled frame.
3. Render a “Replay Animation” button (UI only — Copilot can ignore its logic for now).

---

## 🎨 Visual / Theming Guidelines

- **Core palette (autumn + goofy accents):**
  - Burnt orange `#D35400`
  - Mustard yellow `#F39C12`
  - Deep burgundy `#8E2C2C`
  - Beige `#FAF3E0`
  - Soft brown `#7F6858`
  - Accent purple (goofy) `#7B4B94`
  - Bright comic yellow `#FFEA00`

- **Fonts:**
  - Headings: Comic Sans MS (or similar goofy font). If Comic Sans unavailable, use a playful webfont.
  - Body: Poppins (or another clean sans).

- **Aesthetic:** mix cozy autumn textures with silly/comic elements — think leaf tones + pops of purple/yellow and playful typography.

---

## 🧰 Recommended Libraries / Snippets (use open-source)

Copilot should **integrate existing open-source packages/snippets** rather than re-implement animation mechanics:

- **Confetti:** `canvas-confetti` — <https://www.kirilv.com/canvas-confetti/>
- **Animation sequencing:** GSAP (GreenSock) _or_ Anime.js — choose one and use its timeline features for the face sequence and present reveal.
- **Optional particles/background:** `particles.js` or a very small CSS animation if desired.
- **No backend**: all logic must be client-side JS.

> Copilot is expected to fetch, adapt, and embed snippets from these or equivalent sources as needed.

---

## 🔊 Audio sequencing requirements

- On the landing page claim action:
  1. Start `birthday-song.mp3`.
  2. When **that audio ends** (detect `ended` event), immediately start `clap-track.mp3`.
  3. When **clap-track** ends → perform the redirect to `gift.html`.
  - Ensure the full song always plays (do not skip/trim).
  - Provide a fallback play button/UI if browser blocks autoplay; but implement auto-play attempt first.
- On gift page present click:
  - Play `party-horn.mp3` once during the reveal animation.

---

## Accessibility & Robustness Notes

- If autoplay is blocked, show a clear visible play button that the user must click to start the sequence. Only proceed to the next step (clap → redirect) after the user starts playback or the tracks finish.
- Keep JavaScript defensive: check for asset load errors and fail gracefully (e.g., still show animation but skip audio if file missing).
- Ensure the redirect happens only once (debounce events).

---

## Requirements for Copilot / Implementation checklist

- Use **static files only** (suitable for GitHub Pages).
- Implement password-checking client-side. Plaintext password in `script.js` is acceptable for this project (the user will manage it).
- Button remains **disabled** until the input matches the password.
- Implement face animation timeline (8 images from `/images/faces/`).
- Integrate `canvas-confetti` bursts at:
  - immediate after claim button click,
  - and on present click on `gift.html`.
- Proper audio sequencing: `birthday-song.mp3` → `clap-track.mp3` → redirect.
- Present reveal: present fades/goofs out, gift-card fades in inside a framed container.
- Use either TailwindCSS or plain CSS with CSS variables for the color palette — keep CSS simple and modular.
- Add brief README instructions (below) for customizing assets/password.

---

## Deliverables (what Copilot must create)

- `index.html` — landing page with password input and claim flow.
- `gift.html` — reveal page with present -> gift-card reveal logic.
- `style.css` (or Tailwind setup) — implements the autumn + goofy theme and responsive layout.
- `script.js` — all JS: password check, enabling button, face animations timeline, confetti integration, audio sequencing, redirect, present click reveal.
- `README.md` (this file) — leave it at repo root so Copilot/human devs can read it.

---

## How to customize (instructions for the repo owner)

- To change the password: edit the `PASSWORD_SECRET` constant near the top of `script.js` (default is `pumpkinspice`).
- To replace faces: swap images in `/images/faces/` (keep filenames or update script to list them).
- To replace audio: overwrite files in `/audio/` with the same filenames.
- To edit gift card image: replace `/images/gift-card.png`.
- To change the headline name: edit HTML or expose a JS variable for dynamic name injection.

### Quick local preview

1. Open `index.html` in your browser to test the password flow, music, and redirect.
2. After the redirect, `gift.html` handles the present reveal animation. Refresh either page to replay the fun.
3. If audio is muted on load, click the on-screen prompt to allow playback (most browsers require one tap).

---

## GitHub Pages deployment (quick)

1. Push repo to GitHub.
2. In repository settings → Pages → Select `main` branch and `/ (root)` as build.
3. Your site will be available at `https://<username>.github.io/<repo>/`.

---

## Final notes to Copilot

- This is a **static** interactive experience — leverage open-source animation libraries/snippets (confetti + timeline sequencing).
- Prioritize a small, dependency-light solution that works well on desktop and mobile.
- Keep the code modular and well-commented so the site owner can swap assets or tweak timing easily.

---

Good luck, Copilot. Make it ridiculous and heartwarming. 🎉
