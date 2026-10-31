(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Scroll: progress bar + back-to-top (one rAF-throttled listener) */
  const bar = $('#readingBar'), top = $('#backTop');
  let tick = false;
  const onScroll = () => {
    tick = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
    top.classList.toggle('visible', scrollY > 600);
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* Nav drawer */
  const toggle = $('#navToggle'), nav = $('#chapterNav');
  const setNav = (open) => {
    nav.classList.toggle('open', open);
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  };
  toggle.addEventListener('click', () => setNav(!nav.classList.contains('open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

  /* Active chapter: highlight link, keep it in view, show "03 / 17 · Title" */
  const links = $$('.chapter-nav a[data-s]');
  const label = $('.topnav-right'), base = label.innerHTML;
  const heads = links.map((a) => $('#' + a.dataset.s)).filter(Boolean);
  const chapterIds = heads.filter((h) => /^ch-/.test(h.id)).map((h) => h.id);
  let current = '';
  const activate = (id) => {
    if (id === current) return;
    current = id;
    links.forEach((a) => {
      const on = a.dataset.s === id;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      if (on && innerWidth >= 900) a.scrollIntoView({ inline: 'center', block: 'nearest', behavior: calm ? 'auto' : 'smooth' });
    });
    const n = chapterIds.indexOf(id) + 1;
    const name = links.find((a) => a.dataset.s === id)?.textContent;
    label.innerHTML = n ? `<b>${String(n).padStart(2, '0')}</b> / ${chapterIds.length} · ${name}` : (name && id !== 'listen' ? name : base);
  };
  const spy = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) activate(e.target.id); });
  }, { rootMargin: '-15% 0px -75% 0px' });
  heads.forEach((h) => spy.observe(h));

  /* Reveal: sections + staggered children */
  $$('.lesson-card,.principle,.limitation,.glossary-entry,.checklist li,.tracklist li').forEach((el) => {
    el.classList.add('reveal');
    el.style.setProperty('--i', Math.min($$(':scope > ' + el.tagName.toLowerCase(), el.parentElement).indexOf(el), 7));
  });
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  }), { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach((el) => io.observe(el));
  const ho = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('vis', e.isIntersecting)), { threshold: 0.25 });
  $$('.chapter-head').forEach((h) => ho.observe(h));

  /* Cover: stat count-up (numeric stats only) */
  if (!calm) $$('.cover-stat-val').forEach((el) => {
    const end = Number(el.textContent);
    if (!Number.isInteger(end) || end > 99) return;
    const t0 = performance.now() + 700;
    const step = (t) => {
      const p = Math.min(Math.max((t - t0) / 900, 0), 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = '0';
    requestAnimationFrame(step);
  });

  /* Anchor jump: update hash without layout jump, move focus for a11y */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const t = $(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: calm ? 'auto' : 'smooth' });
    history.replaceState(null, '', a.getAttribute('href'));
  });

  /* Listen: on-demand players. Change the IDs below to feature another release. */
  const BC_ALBUM_ID = '204154880';
  const YT_PLAYLIST = 'PLE7xqQB69sf6MtY6PxdStT8oVcuOkUtPK';
  const keys = ['bandcamp', 'youtube'];
  const pane = {}, tab = {}, loaded = {};
  keys.forEach((k) => { pane[k] = $('#pane-' + k); tab[k] = $('#tab-' + k); loaded[k] = false; });
  const nowText = $('#playerNow'), nowHead = $('#playerTitle'), listen = $('#listen');
  const BC = (auto) => `https://bandcamp.com/EmbeddedPlayer/v=2/album=${BC_ALBUM_ID}/size=large/artwork=small/tracklist=false/bgcol=131010/linkcol=f2705b/transparent=true/${auto ? 'autoplay=true/' : ''}`;
  const YT = (id, auto) => `https://www.youtube-nocookie.com/embed/${id || 'videoseries?list=' + YT_PLAYLIST}${id ? '?' : '&'}${auto ? 'autoplay=1&' : ''}rel=0&playsinline=1`;
  const show = (key) => keys.forEach((k) => {
    pane[k].classList.toggle('active', k === key);
    tab[k].classList.toggle('active', k === key);
    tab[k].setAttribute('aria-pressed', k === key);
  });
  const inject = (key, src, title, allow) => {
    $('.player-facade', pane[key])?.remove();
    const f = Object.assign(document.createElement('iframe'), { src, title, loading: 'lazy' });
    f.setAttribute('allow', allow);
    pane[key].appendChild(f);
    loaded[key] = true;
  };
  const mark = (id) => $$('.track').forEach((b) => b.classList.toggle('playing', !!id && b.dataset.yt === id));
  const now = (text) => { nowText.textContent = text; nowHead.classList.add('playing'); listen.classList.add('is-playing'); };
  const YA = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  const playBC = () => {
    show('bandcamp');
    if (!loaded.bandcamp) inject('bandcamp', BC(true), 'Fighting Death — Bandcamp album player', 'autoplay');
    now('Now playing — Fighting Death · full album (Bandcamp)');
    mark(null);
  };
  const playYT = (id, text) => {
    show('youtube');
    const src = YT(id, true);
    if (loaded.youtube) $('iframe', pane.youtube).src = src;
    else inject('youtube', src, 'Fighting Death — YouTube player', YA);
    now(text || 'Now playing — Fighting Death · full album (YouTube)');
    mark(id || null);
    if (innerWidth < 760) pane.youtube.scrollIntoView({ block: 'center', behavior: calm ? 'auto' : 'smooth' });
  };
  $('#coverPlay').addEventListener('click', playBC);
  $('#facadeBandcamp').addEventListener('click', playBC);
  $('#facadeYouTube').addEventListener('click', () => playYT());
  keys.forEach((k) => tab[k].addEventListener('click', () => {
    show(k);
    if (k === 'bandcamp' && !loaded.bandcamp) inject('bandcamp', BC(false), 'Fighting Death — Bandcamp album player', 'autoplay');
    if (k === 'youtube' && !loaded.youtube) inject('youtube', YT(null, false), 'Fighting Death — YouTube player', YA);
  }));
  const tracks = $$('.track');
  $$('.track, .text-btn[data-yt]').forEach((b) => b.addEventListener('click', () => playYT(b.dataset.yt, b.dataset.np)));
  /* Arrow keys move through the tracklist */
  tracks.forEach((b, i) => b.addEventListener('keydown', (e) => {
    const d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    tracks[(i + d + tracks.length) % tracks.length].focus();
  }));
})();
