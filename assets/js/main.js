/**
 * SCOTT HOM — PORTFOLIO
 * assets/js/main.js
 *
 * 1. Particle Canvas   — constellation background in hero
 * 2. Terminal Writer   — typewriter animation in hero terminal
 * 3. Counter Animation — animated stat numbers
 * 4. Scroll Reveal     — fade-in on scroll (IntersectionObserver)
 * 5. Navigation        — scroll state, mobile drawer, active link
 */

'use strict';

/* ─── Micro-utilities ──────────────────────────────────── */
const $   = s => document.querySelector(s);
const $$  = s => document.querySelectorAll(s);
const raf = requestAnimationFrame;
const delay = ms => new Promise(r => setTimeout(r, ms));
const rand  = (a, b) => Math.random() * (b - a) + a;

/* ═══════════════════════════════════════════════════════════
   1. PARTICLE CANVAS
   Constellation of dots connected by lines in the hero bg.
   ═══════════════════════════════════════════════════════════ */
function initParticles() {
  const canvas = $('#particle-canvas');
  if (!canvas) return;
  const ctx  = canvas.getContext('2d');
  const hero = $('#hero');

  let W, H, pts = [], animId = null;
  const mouse = { x: null, y: null };

  const CFG = {
    count:       window.innerWidth < 768 ? 45 : 85,
    maxSpeed:    0.35,
    connectDist: 130,
    lineAlpha:   0.18,
    dotAlpha:    0.55,
    dotRadius:   { min: 1, max: 2.2 },
    repelDist:   110,
    repelForce:  0.28,
    color:       '79, 125, 243',      /* blue */
  };

  const resize = () => {
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  };

  const mkPt = () => ({
    x: rand(0, W), y: rand(0, H),
    vx: rand(-CFG.maxSpeed, CFG.maxSpeed),
    vy: rand(-CFG.maxSpeed, CFG.maxSpeed),
    r:  rand(CFG.dotRadius.min, CFG.dotRadius.max),
  });

  const init = () => { resize(); pts = Array.from({ length: CFG.count }, mkPt); };

  const tick = () => {
    pts.forEach(p => {
      /* Mouse repel */
      if (mouse.x !== null) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d  = Math.hypot(dx, dy);
        if (d < CFG.repelDist && d > 0) {
          const f = (CFG.repelDist - d) / CFG.repelDist * CFG.repelForce;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
      }
      /* Dampen & cap */
      p.vx *= 0.99; p.vy *= 0.99;
      const sp = Math.hypot(p.vx, p.vy);
      if (sp > CFG.maxSpeed * 2.5) { p.vx = p.vx / sp * CFG.maxSpeed * 2.5; p.vy = p.vy / sp * CFG.maxSpeed * 2.5; }
      p.x += p.vx; p.y += p.vy;
      /* Wrap */
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    });
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    /* Lines */
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < CFG.connectDist) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(${CFG.color},${(1 - d / CFG.connectDist) * CFG.lineAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    /* Dots */
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CFG.color},${CFG.dotAlpha})`;
      ctx.fill();
    });
  };

  const loop = () => { tick(); draw(); animId = raf(loop); };

  /* Pause when hero scrolls out of view (perf) */
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!animId) loop(); }
    else { cancelAnimationFrame(animId); animId = null; }
  }, { threshold: 0.01 }).observe(hero);

  hero.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  hero.addEventListener('mouseleave', () => { mouse.x = mouse.y = null; });

  window.addEventListener('resize', () => { resize(); pts = Array.from({ length: CFG.count }, mkPt); }, { passive: true });

  init(); loop();
}


/* ═══════════════════════════════════════════════════════════
   2. TERMINAL TYPEWRITER
   Animates a realistic shell session in the hero terminal.
   ═══════════════════════════════════════════════════════════ */
async function runTerminal() {
  const body = $('#terminal-body');
  if (!body) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = { char: reduced ? 0 : 48, variance: reduced ? 0 : 28, out: reduced ? 0 : 55 };

  /* ── DOM helpers ── */
  const mkCmdLine = () => {
    const d = document.createElement('div');
    d.className = 'term-line term-cmd';
    d.innerHTML =
      `<span class="term-prompt">` +
        `<span class="tp-user">schom</span>` +
        `<span class="tp-at">@</span>` +
        `<span class="tp-host">devbox</span>` +
        `<span class="tp-sep">:~$</span>` +
      `</span> ` +
      `<span class="term-typed"></span>` +
      `<span class="term-cursor">▊</span>`;
    return d;
  };

  const scrollDown = () => {
    const el = body.closest('.term-body') || body;
    el.scrollTop = el.scrollHeight;
  };

  /* ── Type a command character by character ── */
  async function typeCmd(text) {
    const line = mkCmdLine();
    body.appendChild(line);
    scrollDown();
    const typed  = line.querySelector('.term-typed');
    const cursor = line.querySelector('.term-cursor');
    for (const ch of text) {
      typed.textContent += ch;
      scrollDown();
      await delay(T.char + rand(0, T.variance));
    }
    await delay(220);
    cursor.remove();
  }

  /* ── Append an output line ── */
  async function out(html, cls = '', isHtml = false) {
    const d = document.createElement('div');
    d.className = `term-line term-out ${cls}`;
    isHtml ? (d.innerHTML = html) : (d.textContent = html);
    body.appendChild(d);
    scrollDown();
    await delay(T.out);
  }

  const blank = async () => { await out(' '); await delay(90); };

  /* ── Run the session ── */
  await delay(800);

  await typeCmd('whoami');
  await out('scott hom', 'out-name');
  await out('DevOps Engineer II  ·  Disney Streaming  ·  Jersey City, NJ', 'out-dim');
  await blank();

  await typeCmd('uptime');
  await out('7+ years in Site Reliability Engineering & DevOps', 'out-cyan');
  await blank();

  await typeCmd('ls ~/certifications/');
  await out('aws-solutions-architect-associate.cert',      'out-green');
  await out('certified-kubernetes-administrator.cert',     'out-green');
  await out('hashicorp-terraform-associate-003.cert',      'out-green');
  await out('servicenow-system-administrator.cert',        'out-green');
  await out('servicenow-implementation-specialist.cert',   'out-green');
  await blank();

  await typeCmd('cat stack.yaml');
  await out('<span class="out-key">cloud:</span>    AWS · Terraform · Ansible · Vault',    'out-yaml', true);
  await out('<span class="out-key">cicd:</span>     Jenkins · GitHub Actions · GitLab CI', 'out-yaml', true);
  await out('<span class="out-key">runtime:</span>  Docker · Kubernetes · AWX',            'out-yaml', true);
  await out('<span class="out-key">code:</span>     Python · Groovy · Rust · Shell/Bash',  'out-yaml', true);
  await blank();

  /* Final blinking cursor prompt */
  const final = mkCmdLine();
  body.appendChild(final);
  scrollDown();

  /* Reveal the hero text alongside the terminal */
  $$('.hero-reveal').forEach(el => el.classList.add('visible'));
}


/* ═══════════════════════════════════════════════════════════
   3. COUNTER ANIMATIONS
   Animates [data-count] numbers from 0 → target on reveal.
   ═══════════════════════════════════════════════════════════ */
function initCounters() {
  const ease = t => 1 - Math.pow(1 - t, 3); /* cubic ease-out */

  new IntersectionObserver((entries) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      const goal  = parseInt(target.dataset.count, 10);
      const dur   = 1400;
      const start = performance.now();
      const tick  = now => {
        const p = Math.min((now - start) / dur, 1);
        target.textContent = Math.round(ease(p) * goal);
        p < 1 ? raf(tick) : (target.textContent = goal);
      };
      raf(tick);
      counterObserver.unobserve(target);
    });
  }, { threshold: 0.6 });

  /* need a ref to unobserve inside callback */
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      const goal  = parseInt(target.dataset.count, 10);
      const dur   = 1400;
      const t0    = performance.now();
      const tick  = now => {
        const p = Math.min((now - t0) / dur, 1);
        target.textContent = Math.round(ease(p) * goal);
        p < 1 ? raf(tick) : (target.textContent = goal);
      };
      raf(tick);
      counterObserver.unobserve(target);
    });
  }, { threshold: 0.6 });

  $$('[data-count]').forEach(el => counterObserver.observe(el));
}


/* ═══════════════════════════════════════════════════════════
   4. SCROLL REVEAL
   ═══════════════════════════════════════════════════════════ */
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (isIntersecting) { target.classList.add('visible'); obs.unobserve(target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });

  $$('.reveal').forEach(el => obs.observe(el));
}


/* ═══════════════════════════════════════════════════════════
   5. NAVIGATION
   ═══════════════════════════════════════════════════════════ */
function initNav() {
  const nav       = $('#nav');
  const toggle    = $('.nav-toggle');
  const drawer    = $('#nav-mobile');
  const allLinks  = $$('.nav-links a, .nav-mobile a');
  const sections  = $$('section[id]');

  /* Scroll state */
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  }, { passive: true });

  /* Mobile drawer */
  toggle.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    drawer.setAttribute('aria-hidden',   String(!open));
  });
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      drawer.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden',   'true');
    });
  });

  /* Active link */
  const setActive = () => {
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 110) cur = s.id; });
    allLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  };
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
}


/* ═══════════════════════════════════════════════════════════
   6. SCROLL PROGRESS BAR
   Thin bar at the top showing how far down the page you've scrolled.
   ═══════════════════════════════════════════════════════════ */
function initScrollProgress() {
  const bar = $('#scroll-progress');
  if (!bar) return;
  const update = () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}


/* ═══════════════════════════════════════════════════════════
   7. 3D TERMINAL TILT
   Subtle perspective tilt on the hero terminal as the mouse moves.
   ═══════════════════════════════════════════════════════════ */
function initTerminalTilt() {
  const terminal = $('.hero-terminal');
  if (!terminal) return;

  const MAX_TILT = 8; /* degrees */

  const hero = $('#hero');
  if (!hero) return;

  hero.addEventListener('mousemove', e => {
    const rect   = terminal.getBoundingClientRect();
    /* Use viewport-relative mouse position mapped to [-1, 1] */
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (window.innerWidth  / 2);
    const dy = (e.clientY - cy) / (window.innerHeight / 2);
    const rx =  dy * MAX_TILT * -1; /* tilt up/down  */
    const ry =  dx * MAX_TILT;      /* tilt left/right */
    terminal.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(0)`;
  });

  hero.addEventListener('mouseleave', () => {
    terminal.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
  });
}


/* ═══════════════════════════════════════════════════════════
   8. CURSOR TRAIL
   Subtle blue dot trail following the mouse for extra flair.
   ═══════════════════════════════════════════════════════════ */
function initCursorTrail() {
  /* Only on non-touch devices */
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const TRAIL_LEN = 10;
  const dots = [];

  for (let i = 0; i < TRAIL_LEN; i++) {
    const d = document.createElement('div');
    d.style.cssText = `
      position:fixed; pointer-events:none; z-index:9999;
      width:${4 + i * 0.6}px; height:${4 + i * 0.6}px;
      border-radius:50%;
      background: rgba(79,125,243,${0.55 - i * 0.045});
      transform:translate(-50%,-50%);
      transition: opacity 0.15s;
      will-change: transform;
    `;
    document.body.appendChild(d);
    dots.push({ el: d, x: -100, y: -100 });
  }

  let mouse = { x: -100, y: -100 };

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX; mouse.y = e.clientY;
  }, { passive: true });

  const step = () => {
    let px = mouse.x, py = mouse.y;
    dots.forEach((dot, i) => {
      const lag = 1 - i * 0.06;
      dot.x += (px - dot.x) * lag;
      dot.y += (py - dot.y) * lag;
      dot.el.style.left = dot.x + 'px';
      dot.el.style.top  = dot.y + 'px';
      px = dot.x; py = dot.y;
    });
    raf(step);
  };
  raf(step);
}


/* ═══════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  /* Year in footer */
  const yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  initParticles();
  initReveal();
  initCounters();
  initNav();
  initScrollProgress();
  initTerminalTilt();
  initCursorTrail();
  runTerminal(); /* async — fires & forgets */
});
