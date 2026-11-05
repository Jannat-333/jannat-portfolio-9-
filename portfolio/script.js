/* ==========================================================
   Jannat Tuseef Butt — Portfolio  |  script.js
   Requires GSAP, ScrollTrigger and ScrollToPlugin (loaded in index.html)
   ========================================================== */
(() => {
  'use strict';

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  // Mobile browsers resize the viewport when the URL bar hides; don't re-calculate pins on that.
  ScrollTrigger.config({ ignoreMobileResize: true });

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------------- Navigation ---------------- */
  const nav = $('#nav');
  const burger = $('#burger');

  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });

  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', () => { if (innerWidth > 760) setMenu(false); });

  // Smooth scrolling for every in-page link
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = $(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      gsap.to(window, { duration: 1.3, ease: 'power3.inOut', scrollTo: { y: target, autoKill: true } });
    });
  });

  // Active section indicator
  const setActive = (id) => $$('.nav-link').forEach((l) => l.classList.toggle('active', l.dataset.section === id));
  ['home', 'projects', 'about', 'contact'].forEach((id) => {
    ScrollTrigger.create({
      trigger: '#' + id, start: 'top 55%', end: 'bottom 55%',
      onToggle: (self) => self.isActive && setActive(id),
    });
  });

  /* ---------------- Hero entrance ---------------- */
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero-kicker', { y: 16, opacity: 0, duration: .8 }, .1)
    .from('.line-in', { yPercent: 110, duration: 1.2, stagger: .14 }, .2)
    .from('.hero-title', { y: 20, opacity: 0, duration: .9 }, .75)
    .from('.hero-intro', { y: 20, opacity: 0, duration: .9 }, .9)
    .from('.tags li', { y: 14, opacity: 0, duration: .6, stagger: .06 }, 1.05)
    .from('.hero-portrait', { clipPath: 'inset(100% 0 0 0)', opacity: 0, duration: 1.4, ease: 'power4.out' }, .35)
    .from('.hero-portrait img', { scale: 1.18, duration: 1.8 }, .35)
    .from('.scroll-cue', { opacity: 0, duration: 1 }, 1.5);

  /* ==========================================================
     3. DESKTOP SHOWCASE
     The section is pinned. While pinned, scroll progress (scrub: true) zooms the monitor
     until the screenshot itself fills the viewport. Scrolling up reverses it exactly.
     ========================================================== */
  const deskSec = $('#desktop');
  const monitor = $('.monitor');
  const screen = $('.monitor-screen');

  // Scale + translation that make the screen exactly "contain" in the viewport (aspect ratio preserved).
  const zoomTarget = () => {
    const sw = screen.offsetWidth, sh = screen.offsetHeight;
    const s = Math.min(innerWidth / sw, innerHeight / sh);
    // offset of the screen's centre from the monitor's centre (offsetTop is unaffected by transforms)
    const dx = screen.offsetLeft + sw / 2 - monitor.offsetWidth / 2;
    const dy = screen.offsetTop + sh / 2 - monitor.offsetHeight / 2;
    return { s, x: -dx * s, y: -dy * s };
  };

  // Entrance: the monitor rises into view while the section scrolls in (before it pins)
  gsap.fromTo('.desk-enter',
    { yPercent: 28, opacity: 0, scale: .9 },
    { yPercent: 0, opacity: 1, scale: 1, ease: 'none',
      scrollTrigger: { trigger: deskSec, start: 'top 95%', end: 'top top', scrub: true } });

  const deskTl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: deskSec, start: 'top top',
      end: () => '+=' + innerHeight * (innerWidth < 700 ? 1.7 : 2.3),
      pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
    },
  });
  deskTl
    .to('.desk-caption', { opacity: 0, y: -24, duration: .12 }, 0)
    .to(monitor, { scale: () => zoomTarget().s, x: () => zoomTarget().x, y: () => zoomTarget().y, ease: 'power2.inOut', duration: 1, transformOrigin: '50% 50%' }, .05)
    // Hardware (bezel, stand, base) fades near the end so only the website fills the viewport
    .to('.monitor-neck, .monitor-base', { opacity: 0, duration: .25 }, .45)
    .to('.monitor-frame', { backgroundColor: 'rgba(24,24,24,0)', boxShadow: '0 0 0 0 rgba(0,0,0,0), 0 0 0 0 rgba(0,0,0,0)', duration: .3 }, .7)
    .to('.glare', { opacity: 0, duration: .2 }, .75)
    .to(deskSec, { backgroundColor: '#FFF9F1', duration: .3 }, .7) // matches the screenshot's own background
    .to({}, { duration: .3 }); // short hold on the full-screen website

  /* ==========================================================
     4. SMARTPHONE SHOWCASE
     Pinned timeline (scrub: true):
       A) phone starts ABOVE the viewport and drops to the centre
       B) two small bounces on landing
       C) hold, then rotate 90deg (portrait -> landscape) while the screenshots swap
       D) zoom: the rotated phone scales up until the landscape screenshot fills the viewport
     Reversing the scroll plays everything backwards, including the rise out of the viewport.
     ========================================================== */
  const phoneSec = $('#phone');
  const phone = $('.phone');
  const phoneScreen = $('.phone-screen');

  const dropFrom = () => -(phoneSec.offsetHeight / 2 + phone.offsetHeight / 2 + 40);
  const bump = () => -phoneSec.offsetHeight * 0.035;
  // Scale used in landscape: as large as fits, never wider than 90% of the viewport
  const landScale = () => Math.min(1.35, (innerWidth * .9) / phone.offsetHeight, (phoneSec.offsetHeight * .7) / phone.offsetWidth);

  // Final zoom: the rotated screen is (screen height) wide x (screen width) tall. Scale so it fits the section
  // exactly ("contain"), keeping its aspect ratio. The phone is centred in the section and the bezel is
  // symmetric, so the screen centre already sits at the viewport centre: no translation needed.
  const fullScale = () => Math.max(landScale(),
    Math.min(phoneSec.offsetWidth / phoneScreen.offsetHeight, phoneSec.offsetHeight / phoneScreen.offsetWidth));

  const phoneTl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: phoneSec, start: 'top top',
      end: () => '+=' + innerHeight * (innerWidth < 700 ? 4.4 : 5.2), // longer pin: drop + rotate + zoom
      pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
    },
  });
  phoneTl
    .fromTo(phone, { y: dropFrom }, { y: 0, ease: 'power2.in', duration: 1.1 })        // A) drop
    .to(phone, { y: bump, ease: 'power2.out', duration: .22 })                           // B) bounce 1
    .to(phone, { y: 0, ease: 'power2.in', duration: .22 })
    .to(phone, { y: () => bump() * .35, ease: 'power2.out', duration: .12 })             //    bounce 2
    .to(phone, { y: 0, ease: 'power2.in', duration: .12 })
    .to({}, { duration: .4 })                                                             //    hold (portrait)
    .addLabel('rotate')
    .to(phone, { rotation: 90, scale: landScale, ease: 'power2.inOut', duration: 1.4 }, 'rotate') // C) rotate
    .to('.shot-port', { opacity: 0, duration: .3 }, 'rotate+=.55')                       //    swap screenshots mid-rotation
    .to('.shot-land', { opacity: 1, duration: .3 }, 'rotate+=.55')
    .to('.o-port', { opacity: 0, duration: .2 }, 'rotate+=.5')
    .to('.o-land', { opacity: 1, duration: .2 }, 'rotate+=.5')
    .to({}, { duration: .3 })                                                             //    hold (landscape)
    .addLabel('zoom')
    // D) zoom the whole phone; the inner screen scales with it, so the screenshot grows proportionally
    .to(phone, { scale: fullScale, ease: 'power2.inOut', duration: 1.3 }, 'zoom')
    .to('.phone-caption, .orient', { opacity: 0, duration: .2 }, 'zoom')
    // hardware fades away so only the website remains; screen corners square off
    .to('.phone-body', { '--bezel': 0, duration: .35 }, 'zoom+=.7')
    .to('.side-btn, .island', { opacity: 0, duration: .25 }, 'zoom+=.6')
    .to(phoneScreen, { borderRadius: 0, duration: .3 }, 'zoom+=.7')
    .to(phoneSec, { backgroundColor: '#FFF9F1', duration: .3 }, 'zoom+=.7') // matches the screenshot background
    .to({}, { duration: .4 });                                                            //    hold (fullscreen)

  /* ---------------- Scrolling typography ---------------- */
  gsap.to('.mq-a span', { xPercent: -25, ease: 'none',
    scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: .6 } });
  gsap.fromTo('.mq-b span', { xPercent: -25 }, { xPercent: 0, ease: 'none',
    scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: .6 } });

  /* ---------------- Reveals (about + contact) ---------------- */
  $$('[data-reveal]').forEach((el) => {
    gsap.from(el, { y: 36, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  /* ---------------- Signature: letters draw themselves ---------------- */
  const letters = $$('.sig-l');
  const sigLine = $('.sig-line');
  const lineLen = sigLine.getTotalLength();
  gsap.set(letters, { strokeDasharray: 1500, strokeDashoffset: 1500 });
  gsap.set(sigLine, { strokeDasharray: lineLen, strokeDashoffset: lineLen });
  gsap.set('.sig-text', { fillOpacity: 0 });
  const sigTl = gsap.timeline({ paused: true })
    .to(letters, { strokeDashoffset: 0, duration: 1.1, ease: 'power1.inOut', stagger: .32 })
    .to(sigLine, { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' }, '-=.8')
    .to('.sig-text', { fillOpacity: 1, duration: .9 }, '-=.6');
  ScrollTrigger.create({ trigger: '.signature', start: 'top 88%', once: true, onEnter: () => sigTl.play() });

  /* ---------------- Easter egg ---------------- */
  const eggBtn = $('#eggBtn');
  const eggMsg = $('#eggMsg');
  eggBtn.addEventListener('click', () => {
    eggMsg.textContent = 'Thanks for exploring my little corner of the internet!';
    gsap.fromTo(eggMsg, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .7, ease: 'power3.out' });
    gsap.fromTo(eggBtn, { scale: .92 }, { scale: 1, duration: .6, ease: 'back.out(3)' });
  });

  /* ---------------- Custom cursor (mouse only) ---------------- */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cursor = $('.cursor');
    document.body.classList.add('has-cursor');
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    const qx = gsap.quickTo(cursor, 'x', { duration: .35, ease: 'power3' });
    const qy = gsap.quickTo(cursor, 'y', { duration: .35, ease: 'power3' });
    window.addEventListener('mousemove', (e) => { cursor.classList.add('on'); qx(e.clientX); qy(e.clientY); });
    document.addEventListener('mouseleave', () => cursor.classList.remove('on'));
    const hover = (sel, cls) => $$(sel).forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add(cls));
      el.addEventListener('mouseleave', () => cursor.classList.remove(cls));
    });
    hover('a, button, .tags li', 'is-link');
    hover('[data-cursor="view"]', 'is-view');
  }

  // Re-measure once images and fonts are in so pin distances are exact
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
