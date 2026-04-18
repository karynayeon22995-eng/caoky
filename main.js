/* ============================================
   KY PORTFOLIO — JavaScript v2
   Motion · Interactions · GSAP
   ============================================ */

const hasGSAP = typeof gsap !== 'undefined';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {

  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
  }

  initPreloader();
  initNavbar();
  initHeroVisibleClass();
  initCounters();
  initScrollReveal();
  initPortfolioFilter();
  initContactForm();
  initCardTilt();
  initChaosHero();
  initParallax();
  initMagneticButtons();
  initPageTransitions();
  initScrollToTop();
  initFloatingLogos();
  initDynamicFooterYear();

  console.log('✨ KY Portfolio v3 — Premium Motion Edition');
});


// ============ NAVBAR ============
function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
  });

  document.querySelectorAll('.nav-link, .btn-nav-cta').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close mobile menu on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.focus();
    }
  });
}


// ============ HERO VISIBLE CLASS (dark hero navbar) ============
function initHeroVisibleClass() {
  const navbar = document.getElementById('navbar');
  const hero   = document.querySelector('.hero');
  if (!navbar || !hero) return;

  navbar.classList.add('hero-visible');

  const obs = new IntersectionObserver(([entry]) => {
    navbar.classList.toggle('hero-visible', entry.isIntersecting);
  }, { threshold: 0.05 });

  obs.observe(hero);
}


// ============ COUNTER ANIMATION ============
function initCounters() {
  const counters = document.querySelectorAll('.stat-val[data-target]');
  if (!counters.length) return;

  let done = false;

  function runCounters() {
    if (done) return;
    done = true;
    counters.forEach(el => {
      const target = +el.dataset.target;
      const dur    = 1600;
      const start  = performance.now();
      const tick   = now => {
        const p    = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(ease * target);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  const strip = document.querySelector('.stats-strip');
  if (strip) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) runCounters();
    }, { threshold: 0.5 }).observe(strip);
  }
}


// ============ SCROLL REVEAL (GSAP or CSS fallback) ============
function initScrollReveal() {
  const cardSelectors = [
    '.skill-card', '.service-card', '.course-card',
    '.portfolio-card', '.about-pill', '.contact-info-card', '.about-mini-card',
    '.session-card'
  ];

  if (!hasGSAP) {
    // CSS fallback
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    cardSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach((el, i) => {
        el.classList.add('reveal');
        if (i % 3 === 1) el.classList.add('reveal-d1');
        if (i % 3 === 2) el.classList.add('reveal-d2');
        revealObs.observe(el);
      });
    });

    document.querySelectorAll('.section-title, .section-subtitle, .section-label').forEach(el => {
      el.classList.add('reveal');
      revealObs.observe(el);
    });
    return;
  }

  // GSAP ScrollTrigger batch reveals
  cardSelectors.forEach(sel => {
    const els = document.querySelectorAll(sel);
    if (!els.length) return;

    ScrollTrigger.batch(els, {
      onEnter: batch => gsap.fromTo(batch,
        { opacity: 0, y: 32 },
        {
          opacity: 1, y: 0,
          duration: 0.65,
          ease: 'power3.out',
          stagger: 0.08,
          overwrite: true
        }
      ),
      start: 'top 88%',
      once: true
    });
  });

  // Section text reveals
  document.querySelectorAll('.section-label, .section-title, .section-subtitle').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      }
    );
  });
}


// ============ PORTFOLIO FILTER ============
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.portfolio-card');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        if (match) {
          card.style.display = '';
          requestAnimationFrame(() => {
            card.style.opacity   = '1';
            card.style.transform = '';
          });
        } else {
          card.style.opacity   = '0';
          card.style.transform = 'scale(0.96)';
          setTimeout(() => { card.style.display = 'none'; }, 300);
        }
      });
    });
  });
}


// ============ CONTACT FORM ============
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Pre-fill service dropdown from ?service= URL param (linked from course detail CTAs)
  const svc = new URLSearchParams(location.search).get('service');
  const sel = document.getElementById('formService');
  if (svc && sel?.querySelector(`option[value="${CSS.escape(svc)}"]`)) {
    sel.value = svc;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = document.getElementById('formSubmitBtn');
    btn.innerHTML   = '<span>✓ Sent! I\'ll reach out soon.</span>';
    btn.style.background   = '#059669';
    btn.style.borderColor  = '#059669';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML  = '<span>Send Message</span><span class="arrow-icon">→</span>';
      btn.style.background  = '';
      btn.style.borderColor = '';
      btn.disabled = false;
      form.reset();
    }, 4000);
  });
}


// ============ CARD TILT ============
function initCardTilt() {
  document.querySelectorAll('.course-card, .service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - 0.5;
      const y  = (e.clientY - r.top)  / r.height - 0.5;
      const isFeat = card.classList.contains('is-featured');
      card.style.transform = `translateY(-${isFeat ? 4 : 3}px) rotateX(${y * -3}deg) rotateY(${x * 3}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}


// ============ CHAOS HERO — Brain Hub with connected logos ============
function initChaosHero() {
  const hero = document.querySelector('.hero-chaos');
  const brainCenter = document.getElementById('brainCenter');
  const brainCircle = document.getElementById('brainCircle');
  const linesSvg = document.getElementById('brainLines');
  if (!hero || !brainCenter || !linesSvg) return;

  const allLogos = Array.from(hero.querySelectorAll('.brain-logo'));
  if (!allLogos.length) return;

  const heroRect = () => hero.getBoundingClientRect();
  let isHovering = false;
  let animId = null;
  let hoverT = 0;           // 0→1 smooth transition for hover state
  let hoverTime = 0;        // seconds since hover started
  let pullJustEnded = false; // flag to neutralize inward velocity after pull
  let mouseX = -999, mouseY = -999; // cursor position relative to hero

  // Speed constants
  const SPEED_NORMAL = 0.6;  // faster default
  const SPEED_HOVER = 0.15;  // slower when hovering CTA
  const PULL_STRENGTH = 0.01;  // gentle pull toward CTA direction
  const PULL_DURATION = 0.2;   // pull only lasts 0.2s then stops
  const REPEL_STRENGTH = 0.0008; // gentle drift away from center
  const DEAD_ZONE = 150;         // empty zone radius around CTA — logos stay outside
  const LOGO_MIN_DIST = 60;      // minimum distance between logos (collision avoidance)
  const CURSOR_RADIUS = 250;     // cursor neuron detection radius

  // Per-logo floating state
  const state = allLogos.map((el, i) => {
    const hr = heroRect();
    let x, y;
    do {
      x = 60 + Math.random() * (hr.width - 120);
      y = 80 + Math.random() * (hr.height - 160);
    } while (Math.hypot(x - hr.width / 2, y - hr.height / 2) < 180);

    return {
      el, x, y,
      vx: (Math.random() - 0.5) * 1.6,
      vy: (Math.random() - 0.5) * 1.6,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeedX: 0.3 + Math.random() * 0.5,
      wobbleSpeedY: 0.4 + Math.random() * 0.5,
      seed: i * 13 + 42,
      scalePhase: Math.random() * Math.PI * 2,
      scaleSpeed: 0.15 + Math.random() * 0.25, // how fast it pulses
      scaleAmp: 0.3 + Math.random() * 0.4,     // max extra scale (0.3–0.7)
      dispX: x, dispY: y, // rendered position cache
    };
  });

  function seededRand(seed) {
    const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  // Organic curve between two points
  function buildCurve(ax, ay, bx, by, seed) {
    const f = n => n.toFixed(1);
    const dx = bx - ax, dy = by - ay;
    const w1 = (seededRand(seed) - 0.5) * 50;
    const w2 = (seededRand(seed + 7) - 0.5) * 50;
    return `M ${f(ax)} ${f(ay)} C ${f(ax + dx * 0.25)} ${f(ay + dy * 0.25 + w1)}, ${f(ax + dx * 0.75)} ${f(ay + dy * 0.75 + w2)}, ${f(bx)} ${f(by)}`;
  }

  // ---- SVG path pools ----
  // Center→logo paths (24)
  const centerPaths = allLogos.map((logo) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'brain-line');
    path.setAttribute('stroke', logo.dataset.side === 'left' ? 'url(#lineGradL)' : 'url(#lineGradR)');
    path.setAttribute('filter', 'url(#lineGlow)');
    path.style.opacity = '0';
    linesSvg.appendChild(path);
    return path;
  });

  // Cursor-neuron paths (3 lines near cursor)
  const CURSOR_LINES = 3;
  const cursorPaths = [];
  for (let i = 0; i < CURSOR_LINES; i++) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'brain-line');
    path.setAttribute('stroke', 'url(#lineGradL)');
    path.setAttribute('filter', 'url(#lineGlow)');
    path.style.opacity = '0';
    linesSvg.appendChild(path);
    cursorPaths.push(path);
  }

  // Inter-logo paths (random connections on hover, pool of 6)
  const INTER_LINES = 6;
  const interPaths = [];
  for (let i = 0; i < INTER_LINES; i++) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'brain-line');
    path.setAttribute('stroke', 'url(#lineGradR)');
    path.setAttribute('filter', 'url(#lineGlow)');
    path.style.opacity = '0';
    linesSvg.appendChild(path);
    interPaths.push(path);
  }

  // Pick random inter-logo pairs (refreshed on each hover)
  let interPairs = [];
  function pickInterPairs() {
    interPairs = [];
    const n = allLogos.length;
    const used = new Set();
    for (let k = 0; k < INTER_LINES; k++) {
      let a, b, key;
      let tries = 0;
      do {
        a = Math.floor(Math.random() * n);
        b = Math.floor(Math.random() * n);
        key = Math.min(a, b) + '-' + Math.max(a, b);
        tries++;
      } while ((a === b || used.has(key)) && tries < 30);
      used.add(key);
      interPairs.push([a, b]);
    }
  }

  // ---- Track cursor on hero ----
  hero.addEventListener('mousemove', (e) => {
    const hr = heroRect();
    mouseX = e.clientX - hr.left;
    mouseY = e.clientY - hr.top;
  });
  hero.addEventListener('mouseleave', () => { mouseX = -999; mouseY = -999; });

  // ---- Hover on brain center ----
  brainCenter.addEventListener('mouseenter', () => {
    isHovering = true;
    hoverTime = 0; // reset pull timer
    pullJustEnded = false;
    hero.classList.add('hovered');
    pickInterPairs();
  });
  brainCenter.addEventListener('mouseleave', () => {
    isHovering = false;
    hero.classList.remove('hovered');
  });

  // ---- Main animation loop ----
  function tick() {
    const hr = heroRect();
    const time = performance.now() / 1000;
    // Use actual brain circle center, not hero center
    const circleRect = brainCircle.getBoundingClientRect();
    const centerX = circleRect.left - hr.left + circleRect.width / 2;
    const centerY = circleRect.top - hr.top + circleRect.height / 2;

    // Smooth hover transition (0→1)
    if (isHovering && hoverT < 1) hoverT = Math.min(1, hoverT + 0.03);
    else if (!isHovering && hoverT > 0) hoverT = Math.max(0, hoverT - 0.05);

    // Track how long we've been hovering (in seconds, ~16ms per frame)
    if (isHovering) hoverTime += 0.016;

    // Interpolated speed
    const speed = SPEED_NORMAL + (SPEED_HOVER - SPEED_NORMAL) * hoverT;

    // Pull fades out after PULL_DURATION
    const pullFade = isHovering ? Math.max(0, 1 - hoverTime / PULL_DURATION) : 0;

    // Detect when pull just ended → neutralize inward velocity once
    if (isHovering && hoverTime >= PULL_DURATION && !pullJustEnded) {
      pullJustEnded = true;
      state.forEach(s => {
        // Remove inward velocity component (keep tangential motion)
        const dxC = s.x - centerX;
        const dyC = s.y - centerY;
        const dist = Math.sqrt(dxC * dxC + dyC * dyC) || 1;
        const nx = dxC / dist, ny = dyC / dist;
        const inward = s.vx * nx + s.vy * ny; // dot product = inward component
        if (inward < 0) { // moving toward center
          s.vx -= nx * inward; // remove inward component
          s.vy -= ny * inward;
        }
      });
    }

    // ---- Update each logo ----
    state.forEach((s, i) => {
      const wx = Math.sin(time * s.wobbleSpeedX + s.wobblePhase) * 12;
      const wy = Math.cos(time * s.wobbleSpeedY + s.wobblePhase) * 10;

      s.x += s.vx * speed;
      s.y += s.vy * speed;

      // Vector from center to logo
      const dxC = s.x - centerX;
      const dyC = s.y - centerY;
      const distC = Math.sqrt(dxC * dxC + dyC * dyC) || 1;
      const nxC = dxC / distC;
      const nyC = dyC / distC;

      // Dead zone — hard push logos out if they enter
      if (distC < DEAD_ZONE) {
        const pushForce = (DEAD_ZONE - distC) * 0.05;
        s.vx += nxC * pushForce;
        s.vy += nyC * pushForce;
        // Snap to edge if too close
        s.x = centerX + nxC * DEAD_ZONE;
        s.y = centerY + nyC * DEAD_ZONE;
      }

      // Gentle drift AWAY from center (fades out at edges so logos don't pile up)
      const edgeDist = Math.min(s.x, s.y, hr.width - s.x, hr.height - s.y);
      const edgeFade = Math.min(1, edgeDist / 200); // weaken near edges
      s.vx += nxC * REPEL_STRENGTH * edgeFade;
      s.vy += nyC * REPEL_STRENGTH * edgeFade;

      // Brief pull toward CTA direction (only first 0.2s of hover)
      if (pullFade > 0) {
        s.vx -= dxC * PULL_STRENGTH * pullFade;
        s.vy -= dyC * PULL_STRENGTH * pullFade;
      }

      // Bounce off edges
      const pad = 50;
      if (s.x < pad) { s.x = pad; s.vx = Math.abs(s.vx); }
      if (s.x > hr.width - pad) { s.x = hr.width - pad; s.vx = -Math.abs(s.vx); }
      if (s.y < pad) { s.y = pad; s.vy = Math.abs(s.vy); }
      if (s.y > hr.height - pad) { s.y = hr.height - pad; s.vy = -Math.abs(s.vy); }

      // Random scale pulse
      const scale = 1 + Math.sin(time * s.scaleSpeed + s.scalePhase) * s.scaleAmp * 0.5;
      s.currentScale = scale;

      // Collision avoidance — push apart if too close (account for scale)
      for (let j = i + 1; j < state.length; j++) {
        const o = state[j];
        const ddx = s.x - o.x;
        const ddy = s.y - o.y;
        const dd = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
        const minDist = LOGO_MIN_DIST * Math.max(scale, o.currentScale || 1);
        if (dd < minDist) {
          const push = (minDist - dd) * 0.04;
          const nx = ddx / dd, ny = ddy / dd;
          // Bigger logo pushes more
          const sWeight = scale / (scale + (o.currentScale || 1));
          s.vx += nx * push * (1 - sWeight); s.vy += ny * push * (1 - sWeight);
          o.vx -= nx * push * sWeight; o.vy -= ny * push * sWeight;
        }
      }

      // Random drift
      s.vx += (Math.random() - 0.5) * 0.04;
      s.vy += (Math.random() - 0.5) * 0.04;
      const maxV = 1.0;
      const v = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      if (v > maxV) { s.vx = (s.vx / v) * maxV; s.vy = (s.vy / v) * maxV; }

      const dispX = s.x + wx;
      const dispY = s.y + wy;
      s.dispX = dispX;
      s.dispY = dispY;
      s.el.style.transform = `translate(${dispX - 22}px, ${dispY - 22}px) scale(${scale.toFixed(3)})`;

      // ---- Center→logo lines (shoot outward on hover) ----
      const path = centerPaths[i];
      if (hoverT > 0) {
        const d = buildCurve(centerX, centerY, dispX, dispY, s.seed);
        path.setAttribute('d', d);
        const totalLen = path.getTotalLength();

        // Staggered shoot-out from center
        const stagger = i / allLogos.length * 0.45;
        const prog = Math.max(0, Math.min(1, (hoverT - stagger) / (1 - stagger)));
        const eased = 1 - Math.pow(1 - prog, 3); // cubic ease-out

        path.style.strokeDasharray = totalLen;
        // Line travels from center outward: dashoffset goes from totalLen → 0
        path.style.strokeDashoffset = totalLen * (1 - eased);
        path.style.opacity = String(Math.min(eased * 1.2, 0.8));
      } else {
        path.style.opacity = '0';
      }
    });

    // ---- Cursor neuron effect (when NOT hovering CTA) ----
    if (mouseX > 0 && mouseY > 0 && hoverT < 0.3) {
      // Find logos closest to cursor
      const nearby = [];
      state.forEach((s, i) => {
        const dist = Math.hypot(s.dispX - mouseX, s.dispY - mouseY);
        if (dist < CURSOR_RADIUS) nearby.push({ i, dist, s });
      });
      nearby.sort((a, b) => a.dist - b.dist);

      // Draw lines from cursor to nearest logos + between them
      for (let k = 0; k < CURSOR_LINES; k++) {
        const cp = cursorPaths[k];
        if (nearby.length >= 1 && k < nearby.length) {
          const target = nearby[k].s;
          // Lines go from cursor to each nearby logo
          const d = buildCurve(mouseX, mouseY, target.dispX, target.dispY, k * 37);
          cp.setAttribute('d', d);
          const totalLen = cp.getTotalLength();
          const fade = Math.max(0, 1 - nearby[k].dist / CURSOR_RADIUS);
          cp.style.strokeDasharray = totalLen;
          cp.style.strokeDashoffset = '0';
          cp.style.opacity = String(fade * 0.8);
          cp.style.strokeWidth = String(1.5 + fade);
        } else {
          cp.style.opacity = '0';
        }
      }
    } else {
      cursorPaths.forEach(cp => { cp.style.opacity = '0'; });
    }

    // ---- Inter-logo connections (random pairs on hover) ----
    if (hoverT > 0.2) {
      const interFade = Math.min(1, (hoverT - 0.2) / 0.5);
      interPairs.forEach(([a, b], k) => {
        const ip = interPaths[k];
        if (!ip) return;
        const sa = state[a], sb = state[b];
        const d = buildCurve(sa.dispX, sa.dispY, sb.dispX, sb.dispY, a * 7 + b * 3);
        ip.setAttribute('d', d);
        const totalLen = ip.getTotalLength();
        const stagger = k / INTER_LINES * 0.3;
        const prog = Math.max(0, Math.min(1, (interFade - stagger) / (1 - stagger)));
        const eased = 1 - Math.pow(1 - prog, 2);
        ip.style.strokeDasharray = totalLen;
        ip.style.strokeDashoffset = totalLen * (1 - eased);
        ip.style.opacity = String(eased * 0.4);
      });
    } else {
      interPaths.forEach(ip => { ip.style.opacity = '0'; });
    }

    animId = requestAnimationFrame(tick);
  }

  // ---- Entry animation ----
  allLogos.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.position = 'absolute';
    setTimeout(() => {
      el.style.transition = 'opacity 0.6s ease';
      el.style.opacity = '0.8';
    }, 200 + i * 60);
  });

  if (hasGSAP) {
    gsap.fromTo('.brain-center',
      { opacity: 0, scale: 0.7 },
      { opacity: 1, scale: 1, duration: 1.2, delay: 0.3, ease: 'power3.out' }
    );
    gsap.to(brainCircle, {
      scale: 1.03, duration: 2.5, ease: 'sine.inOut', repeat: -1, yoyo: true
    });
  }

  tick();

  // Pause when off-screen
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { if (!animId) tick(); }
    else { if (animId) { cancelAnimationFrame(animId); animId = null; } }
  }, { threshold: 0.05 });
  obs.observe(hero);

  // ---- "New AI app" notification + logo spawner ----
  const MAX_LOGOS = 30;
  const spawnPool = [
    { src: 'logos/grok.webp', name: 'Grok' },
    { src: 'logos/kling.webp', name: 'Kling AI' },
    { src: 'logos/luma.webp', name: 'Luma Dream Machine' },
    { src: 'logos/pika.webp', name: 'Pika' },
    { src: 'logos/ideogram.webp', name: 'Ideogram' },
    { src: 'logos/recraft.webp', name: 'Recraft' },
    { src: 'logos/microsoft-copilot.webp', name: 'Microsoft Copilot' },
    { src: 'logos/github.webp', name: 'GitHub Copilot' },
    { src: 'logos/chatgpt.webp', name: 'ChatGPT' },
    { src: 'logos/gemini.webp', name: 'Gemini' },
    { src: 'logos/claude.webp', name: 'Claude' },
    { src: 'logos/midjourney.webp', name: 'Midjourney' },
    { src: 'logos/runway.webp', name: 'Runway' },
    { src: 'logos/sora.webp', name: 'Sora' },
    { src: 'logos/elevenlabs.webp', name: 'ElevenLabs' },
    { src: 'logos/stable.webp', name: 'Stable Diffusion' },
  ];
  let spawnIndex = 0;
  const spawnedExtras = []; // track extra logos for removal

  // Use nav notification box
  const navNotif = document.getElementById('navNotif');

  function showNotification(name) {
    if (!navNotif) return;
    const span = document.createElement('span');
    span.className = 'nav-notif-text';
    span.textContent = `🚀 ${name} joined the AI ecosystem`;
    navNotif.innerHTML = '';
    navNotif.appendChild(span);
    // Clean up after animation
    setTimeout(() => { if (span.parentNode) span.remove(); }, 3600);
  }

  function spawnLogo() {
    const pool = spawnPool[spawnIndex % spawnPool.length];
    spawnIndex++;

    // Remove oldest extra if at cap
    if (state.length >= MAX_LOGOS && spawnedExtras.length > 0) {
      const old = spawnedExtras.shift();
      old.el.remove();
      old.path.remove();
      const idx = state.indexOf(old.state);
      if (idx > -1) { state.splice(idx, 1); centerPaths.splice(idx, 1); }
    }

    // Create logo element
    const logoEl = document.createElement('div');
    logoEl.className = 'brain-logo';
    logoEl.dataset.side = 'left';
    logoEl.innerHTML = `<img src="${pool.src}" alt="" class="cl-img" />`;
    logoEl.style.position = 'absolute';
    logoEl.style.opacity = '0';
    // Append to brain-left container
    const container = hero.querySelector('.brain-left') || hero;
    container.appendChild(logoEl);

    // Random position outside dead zone
    const hr = heroRect();
    const cx = hr.width / 2, cy = hr.height / 2;
    let x, y;
    do {
      x = 80 + Math.random() * (hr.width - 160);
      y = 80 + Math.random() * (hr.height - 160);
    } while (Math.hypot(x - cx, y - cy) < 200);

    const newState = {
      el: logoEl, x, y,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeedX: 0.3 + Math.random() * 0.5,
      wobbleSpeedY: 0.4 + Math.random() * 0.5,
      seed: (state.length + 1) * 13 + 42,
      scalePhase: Math.random() * Math.PI * 2,
      scaleSpeed: 0.15 + Math.random() * 0.25,
      scaleAmp: 0.3 + Math.random() * 0.4,
      currentScale: 1,
      dispX: x, dispY: y,
    };
    state.push(newState);

    // Create SVG path for this logo
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'brain-line');
    path.setAttribute('stroke', 'url(#lineGradL)');
    path.setAttribute('filter', 'url(#lineGlow)');
    path.style.opacity = '0';
    linesSvg.appendChild(path);
    centerPaths.push(path);

    spawnedExtras.push({ el: logoEl, path, state: newState });

    // Fade in with scale pop
    setTimeout(() => {
      logoEl.style.transition = 'opacity 0.8s ease';
      logoEl.style.opacity = '0.8';
    }, 100);

    showNotification(pool.name);
  }

  // Spawn every 10s
  setInterval(spawnLogo, 10000);
}


// ============ PARALLAX ============
function initParallax() {
  document.addEventListener('mousemove', e => {
    const heroBefore = document.querySelector('.hero');
    if (!heroBefore) return;
    const mx = (e.clientX / window.innerWidth  - 0.5) * 12;
    const my = (e.clientY / window.innerHeight - 0.5) * 12;
    heroBefore.style.setProperty('--mx', `${mx}px`);
    heroBefore.style.setProperty('--my', `${my}px`);
  });
}


// ============ MAGNETIC BUTTONS ============
function initMagneticButtons() {
  const STRENGTH = 0.3;

  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const dx   = (e.clientX - (rect.left + rect.width  / 2)) * STRENGTH;
      const dy   = (e.clientY - (rect.top  + rect.height / 2)) * STRENGTH;

      if (hasGSAP) {
        gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out', overwrite: true });
      } else {
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    });

    btn.addEventListener('mouseleave', () => {
      if (hasGSAP) {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)', overwrite: true });
      } else {
        btn.style.transform = '';
      }
    });
  });
}


// ============ PRELOADER ============
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('loaded');
    }, 400);
  });

  // Fallback: hide preloader after 3s even if load event doesn't fire
  setTimeout(() => {
    preloader.classList.add('loaded');
  }, 3000);
}


// ============ PAGE TRANSITIONS ============
function initPageTransitions() {
  const overlay = document.getElementById('pageTransition');
  if (!overlay) return;

  // Entry: fade overlay out on page load
  overlay.style.opacity       = '1';
  overlay.style.pointerEvents = 'all';

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.opacity       = '0';
      overlay.style.pointerEvents = 'none';
    });
  });

  // Intercept internal HTML page links
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href
      || href.startsWith('#')
      || href.startsWith('mailto:')
      || href.startsWith('tel:')
      || href.startsWith('http')
      || !href.endsWith('.html')
    ) return;

    link.addEventListener('click', e => {
      e.preventDefault();
      const target = link.href;
      overlay.classList.add('is-leaving');
      setTimeout(() => {
        window.location.href = target;
      }, 420);
    });
  });
}


// ============ SCROLL TO TOP ============
function initScrollToTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


// ============ FLOATING LOGOS — Course sections ============
function initFloatingLogos() {
  // Inject unique keyframes for each icon
  const style = document.createElement('style');
  const keyframes = [];

  let iconIndex = 0;

  document.querySelectorAll('.course-section-wrap').forEach(section => {
    const container = section.querySelector('.floating-logos-bg');
    if (!container) return;
    const icons = container.querySelectorAll('.float-icon');
    if (!icons.length) return;

    icons.forEach((icon, i) => {
      const id = iconIndex++;

      // Random start position
      const sx = 5 + Math.random() * 85;
      const sy = 5 + Math.random() * 85;

      // Generate 4 random waypoints for the keyframes
      const pts = [];
      for (let k = 0; k < 4; k++) {
        pts.push({
          x: 5 + Math.random() * 85,
          y: 5 + Math.random() * 85,
          r: (Math.random() - 0.5) * 30,
          s: 0.85 + Math.random() * 0.3
        });
      }

      // Build keyframes with 5 stops (0%, 25%, 50%, 75%, 100%=start)
      keyframes.push(`
        @keyframes floatWander${id} {
          0%   { left: ${sx}%; top: ${sy}%; transform: rotate(0deg) scale(1); }
          25%  { left: ${pts[0].x}%; top: ${pts[0].y}%; transform: rotate(${pts[0].r}deg) scale(${pts[0].s}); }
          50%  { left: ${pts[1].x}%; top: ${pts[1].y}%; transform: rotate(${pts[1].r}deg) scale(${pts[1].s}); }
          75%  { left: ${pts[2].x}%; top: ${pts[2].y}%; transform: rotate(${pts[2].r}deg) scale(${pts[2].s}); }
          100% { left: ${sx}%; top: ${sy}%; transform: rotate(0deg) scale(1); }
        }
      `);

      const duration = 18 + (id * 3.7 % 14); // 18-32s
      const delay = i * 0.3;

      icon.style.left = sx + '%';
      icon.style.top = sy + '%';
      icon.style.animation = `floatWander${id} ${duration}s ${delay}s ease-in-out infinite`;
    });
  });

  style.textContent = keyframes.join('\n');
  document.head.appendChild(style);
}


// ============ DYNAMIC FOOTER YEAR ============
function initDynamicFooterYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
}


