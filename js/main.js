// ===== Terranex Elite Infraprojects — UI interactions =====
(function () {
  'use strict';

  // --- Preloader ---
  const preloader = document.getElementById('preloader');
  function hidePreloader() {
    if (preloader) preloader.classList.add('hide');
  }
  window.addEventListener('load', () => {
    // Give the 3D scene a brief moment, then reveal
    setTimeout(hidePreloader, 600);
  });
  // Safety fallback so the loader never gets stuck
  setTimeout(hidePreloader, 3500);

  // --- Year in footer ---
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Navbar scroll state ---
  const navbar = document.getElementById('navbar');
  function onScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Mobile nav toggle ---
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  // --- Scroll reveal ---
  const revealTargets = document.querySelectorAll(
    '.about-grid, .about-values, .service-card, .project-tile, .contact-card, .section-head'
  );
  revealTargets.forEach((el) => el.classList.add('reveal'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('visible'));
  }

  // --- Animated stat counters ---
  const counters = document.querySelectorAll('.hero-stats strong[data-count]');
  function runCounter(el) {
    const goal = parseInt(el.getAttribute('data-count'), 10) || 0;
    const duration = 1600;
    const startTime = performance.now();
    function step(now) {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(goal * eased) + (p === 1 && goal >= 100 ? '+' : '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  // Trigger counters shortly after load
  window.addEventListener('load', () => {
    setTimeout(() => counters.forEach(runCounter), 900);
  });

  // --- Contact form (front-end demo) ---
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      if (note) {
        note.style.color = '#3da9fc';
        note.textContent = `Thank you, ${name || 'there'}! Your message has been received. Our team will reach out shortly.`;
      }
      form.reset();
    });
  }
})();
