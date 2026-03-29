/**
 * SCOTT HOM — PORTFOLIO
 * File: assets/js/main.js
 *
 * Sections:
 * 1. Auto-update year
 * 2. Nav scroll behaviour
 * 3. Mobile nav toggle
 * 4. Scroll-reveal animations (IntersectionObserver)
 * 5. Active nav link on scroll
 */


/* ── 1. Auto-update footer year ───────────────────────── */
document.getElementById('year').textContent = new Date().getFullYear();


/* ── 2. Nav: add border + opacity when user scrolls down ─ */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });


/* ── 3. Mobile nav toggle ─────────────────────────────── */
const toggle    = document.querySelector('.nav-toggle');
const mobileNav = document.getElementById('nav-mobile');

toggle.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  toggle.classList.toggle('open', isOpen);
  toggle.setAttribute('aria-expanded', String(isOpen));
  mobileNav.setAttribute('aria-hidden', String(!isOpen));
});

// Close drawer when any mobile link is tapped
mobileNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
  });
});


/* ── 4. Scroll-reveal (IntersectionObserver) ──────────── */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Un-observe once revealed — no re-animation on scroll back up
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,              // trigger when 12% of element is visible
    rootMargin: '0px 0px -40px 0px'  // slight buffer from bottom of viewport
  }
);

revealEls.forEach(el => revealObserver.observe(el));


/* ── 5. Highlight active nav link on scroll ───────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a, .nav-mobile a');

function updateActiveLink() {
  let current = '';

  sections.forEach(sec => {
    // Section is "active" once its top passes 90px from viewport top
    if (window.scrollY >= sec.offsetTop - 90) {
      current = sec.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    // Highlight matching link; clear others
    link.style.color = (link.getAttribute('href') === '#' + current)
      ? 'var(--text-1)'
      : '';
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });
updateActiveLink(); // run once on load to set correct initial state
