# Metal AI Music — No Limits

An editorial publication by **NM Studio** documenting a nine-track AI-assisted metal album — ***Fighting Death*** — conceived, composed and shipped end-to-end on a mid-range Android device. Twenty chapters of process, workflow, prompts, failures and principle — and now **the record itself streams inside the guide**: the official Bandcamp album player plus a privacy-enhanced YouTube playlist, both loaded on demand.

> **Live demo:** `https://<your-username>.github.io/metal-ai-music/` *(after you enable Pages — see below)*

---

## Highlights

**Content**
- The full *Fighting Death* record: Bandcamp embed, YouTube playlist and per-track playback from one styled tracklist
- Twenty-chapter editorial volume — research, workflow, prompt methodology, lyrics, composition, sound design, publishing, lessons and limits
- Editorial components throughout: pull quotes, callouts, principle stacks, flow diagrams, specification tables, checklists
- Appendix with glossary, operational checklist and document record

**The Listen plate**
- **Two sources, one plate** — Bandcamp (official album player) and YouTube (playlist + full-album mix) behind a segmented switcher
- **On-demand loading (facade pattern)** — no third-party iframe, script or cookie runs until the visitor presses play; the page itself stays 100 % first-party
- **Per-track playback** — every track row is a button; clicking it switches to the privacy-enhanced `youtube-nocookie.com` player and starts that track
- **Now-playing strip** — live-dot pulse + current track label above the player, equalizer bars on the active row, cover "breathing" while audio plays
- Full-album mix shortcut (34:27 continuous stream) for one-tap listening

**Craft**
- Single-file static page — zero dependencies, zero build step
- Tokenized design system ("**No Limits**"): Playfair Display / Source Serif 4 / JetBrains Mono on near-black with a single crimson accent
- Fluid type scale, 4 px spacing rhythm, film-grain texture, crimson spine motifs
- Sticky chapter nav with scrollspy, mobile drawer, reading-progress bar, back-to-top
- Scroll-reveal animations — all disabled under `prefers-reduced-motion`
- Semantic HTML, ARIA-labelled controls, visible `:focus-visible` rings
- Social-ready: favicon, Open Graph and Twitter card tags, local og-image

---

## Repository structure

```
metal-ai-music/
├── index.html        ← the publication (content + design system + behaviors)
├── favicon.svg
├── og-image.png      ← social preview card
├── .nojekyll         ← serve assets as-is on GitHub Pages
└── assets/
    └── cover.jpg     ← Fighting Death album artwork (640×640, optimized)
```

---

## Deploy to GitHub Pages

1. Create a new repository on GitHub (e.g. `metal-ai-music`).
2. Push this folder's contents to the default branch (`main`):

   ```bash
   git init
   git add .
   git commit -m "Metal AI Music — No Limits v1.2"
   git branch -M main
   git remote add origin https://github.com/<your-username>/metal-ai-music.git
   git push -u origin main
   ```

3. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pick `main` / `(root)`, save.
4. Your publication is live at `https://<your-username>.github.io/metal-ai-music/`.

No build step is needed — the site is plain static files.

---

## Customizing

- **Palette & type** — edit the `:root` token block at the top of `index.html` (`--crimson`, `--bg`, font stacks, column widths). Every component references the tokens.
- **Featured release** — in the `LISTEN` module at the bottom of `index.html`, change the two constants `BC_ALBUM_ID` (Bandcamp album number) and `YT_PLAYLIST` (YouTube playlist ID), and update the `data-yt` attributes on the track buttons.
- **Artwork** — replace `assets/cover.jpg` (square image, ≥ 640 px recommended).
- **Social preview** — replace `og-image.png` (1200 × 630).

### Browser support

Evergreen browsers. Uses `backdrop-filter`, `aspect-ratio`, CSS Grid and `IntersectionObserver` — all cosmetic; content remains fully readable if any of them are unavailable. The Bandcamp/YouTube players inherit those services' own availability; outbound links are provided as fallback.

---

## Credits & license

Words, music and artwork © 2026 NM Studio. All rights reserved.

*Fighting Death* by Limon — stream on [Bandcamp](https://limoon.bandcamp.com/album/fighting-death) or [YouTube](https://www.youtube.com/playlist?list=PLE7xqQB69sf6MtY6PxdStT8oVcuOkUtPK). Embedded playback is provided by the official Bandcamp EmbeddedPlayer and YouTube's privacy-enhanced mode; their terms apply to the streamed media.
