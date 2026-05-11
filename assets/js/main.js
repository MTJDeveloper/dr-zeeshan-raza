/* Dr. Zeeshan website — main script */

// Page loader — hide as soon as DOM is ready (with a brief minimum visible time),
// or at the latest when window.load fires.
(function () {
  const hide = () => {
    const loader = document.getElementById('pageLoader');
    if (loader) loader.classList.add('loaded');
  };
  // Minimum visible window so it doesn't flash on fast loads
  document.addEventListener('DOMContentLoaded', () => setTimeout(hide, 500));
  // Safety net: hide on full window load
  window.addEventListener('load', hide);
  // Hard fallback after 4s, no matter what
  setTimeout(hide, 4000);
})();

document.addEventListener('DOMContentLoaded', () => {

  // Mobile nav toggle
  const toggle = document.querySelector('.menu-toggle');
  const navList = document.querySelector('.nav-list');
  if (toggle && navList) {
    toggle.addEventListener('click', () => {
      navList.classList.toggle('open');
      const expanded = navList.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded);
      toggle.innerHTML = expanded
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    });
    navList.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navList.classList.remove('open');
        toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      });
    });
  }

  // Highlight current page in nav
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-list a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Animate stat counters when in view
  const counters = document.querySelectorAll('.stat-item .num[data-count]');
  if (counters.length) {
    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const ease = 1 - Math.pow(1 - t, 3);
        const value = target * ease;
        el.textContent = (Number.isInteger(target) ? Math.round(value) : value.toFixed(1)) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animate(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(c => io.observe(c));
  }

  // Appointment form (client-side, no backend)
  const form = document.querySelector('form[data-appointment]');
  if (form) {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const status = form.querySelector('.form-status');
      const data = Object.fromEntries(new FormData(form).entries());
      if (!data.name || !data.phone || !data.date) {
        status.textContent = 'Please fill name, phone and preferred date.';
        status.style.color = 'var(--danger)';
        return;
      }
      // Build a WhatsApp message — most practical fallback for a clinic site
      const msg = encodeURIComponent(
`Appointment request for Dr. Muhammad Zeeshan Ahmed Raza

Name: ${data.name}
Phone: ${data.phone}
Email: ${data.email || '-'}
Service: ${data.service || '-'}
Preferred date: ${data.date}
Preferred time: ${data.time || '-'}
Notes: ${data.notes || '-'}`);
      const waNumber = '923194040103'; // Replace with the doctor's real WhatsApp (international format, no + or spaces)
      const url = `https://wa.me/${waNumber}?text=${msg}`;
      status.innerHTML = `Opening WhatsApp to send your request… <a href="${url}" target="_blank" rel="noopener">Click here if it does not open.</a>`;
      status.style.color = 'var(--success)';
      window.open(url, '_blank');
      form.reset();
    });
  }

  // Set min date on date pickers to today
  document.querySelectorAll('input[type="date"]').forEach(el => {
    const today = new Date().toISOString().split('T')[0];
    el.setAttribute('min', today);
  });

  // Footer year
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // In-page intro video card → lightbox modal on hover/click
  const introCard = document.getElementById('introVideoCard');
  const introModal = document.getElementById('introModal');
  const introVid = document.getElementById('introVideoEl');
  const previewVid = introCard ? introCard.querySelector('.intro-preview') : null;

  if (previewVid) {
    const playPreview = () => previewVid.play().catch(() => {});
    previewVid.addEventListener('loadedmetadata', playPreview, { once: true });
    playPreview();
  }

  if (introCard && introModal && introVid) {
    const closeBtn = introModal.querySelector('.intro-close');

    const openIntro = () => {
      if (introModal.classList.contains('is-open')) return;
      introModal.classList.add('is-open');
      introModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      introVid.currentTime = 0;
      introVid.muted = false;
      introVid.volume = 1;
      introVid.play().catch(() => { introVid.muted = true; introVid.play().catch(() => {}); });
    };
    const closeIntro = () => {
      if (!introModal.classList.contains('is-open')) return;
      introModal.classList.remove('is-open');
      introModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      introVid.pause();
      introVid.currentTime = 0;
    };

    introCard.addEventListener('mouseenter', openIntro);
    introCard.addEventListener('click', openIntro);
    introCard.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openIntro(); } });
    closeBtn && closeBtn.addEventListener('click', closeIntro);
    introModal.addEventListener('click', (e) => { if (e.target === introModal) closeIntro(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeIntro(); });
  }
});
