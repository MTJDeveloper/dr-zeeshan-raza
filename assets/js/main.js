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

  // Appointment form + professional payment step (client-side, no backend)
  const WA_NUMBER = '923194040103'; // Doctor's WhatsApp (international format, no + or spaces)
  // ── Manual payment accounts (edit these freely) ────────────────────────
  const ACCOUNTS = {
    bank:      { title: 'ZEESHAN AHMAD RAZA', bank: 'Faysal Bank Limited', iban: 'PK22FAYS3708301000003772' },
    jazzcash:  { title: 'ZEESHAN AHMAD RAZA', number: '0319 4040103' },  // ← confirm/change JazzCash number
    easypaisa: { title: 'ZEESHAN AHMAD RAZA', number: '0319 4040103' }   // ← confirm/change Easypaisa number
  };
  // Bookings are delivered to the doctor on WhatsApp (booking details prefilled;
  // the patient attaches the payment screenshot in the chat). No email/backend needed.

  const form = document.querySelector('form[data-appointment]');
  if (form) {
    const LOC_LABEL = { cavalry: 'Cavalry Hospital, Lahore', sialkot: 'Sialkot' };
    const detectFee = (data) => {
      const t = `${data.consultation_type || ''} ${data.service || ''}`.toLowerCase();
      if (t.includes('inclinic') || t.includes('in-clinic') || t.includes('in clinic') || t.includes('3,500') || t.includes('3500')) {
        const loc = LOC_LABEL[data.location] || 'Cavalry Hospital, Lahore';
        return { amount: 3500, label: 'In-Clinic Visit — ' + loc };
      }
      return { amount: 2500, label: 'Online Video Consultation' };
    };

    const METHOD_LABEL = { bank: 'Bank Transfer (Faysal Bank)', jazzcash: 'JazzCash', easypaisa: 'Easypaisa' };

    const isClinicData = (data) => /inclinic|in-clinic|clinic/.test((data.consultation_type || '').toLowerCase());
    const bookingText = (data, fee, method) => {
      const isClinic = isClinicData(data);
      const loc = LOC_LABEL[data.location];
      const payLine = method === 'clinic'
        ? 'Payment: To be paid at the clinic (in-person)'
        : `Paid via: ${METHOD_LABEL[method] || method}\nPayment screenshot: attached`;
      return `Appointment request for Dr. Muhammad Zeeshan Ahmad Raza

Name: ${data.name}
Phone: ${data.phone}
Email: ${data.email || '-'}
Consultation: ${isClinic ? 'In-Clinic Visit' : 'Online Video Consultation'}${(isClinic && loc) ? '\nLocation: ' + loc : ''}
Service: ${data.service || '-'}
Preferred date: ${data.date}
Preferred time: ${data.time || '-'}
Notes: ${data.notes || '-'}

Consultation fee: Rs. ${fee.amount.toLocaleString()}
${payLine}`;
    };

    const payModal = document.createElement('div');
    payModal.className = 'pay-modal';
    payModal.setAttribute('aria-hidden', 'true');
    payModal.innerHTML = `
      <div class="pay-card" role="dialog" aria-modal="true" aria-label="Pay and confirm your booking">
        <button class="pay-close" type="button" aria-label="Close">&times;</button>
        <div class="pay-body">
          <div class="pay-head">
            <span class="pay-secure"><i class="fa-solid fa-lock"></i> Secure Booking</span>
            <h3>Pay &amp; Confirm Your Booking</h3>
            <p class="pay-sub">Send the fee using any method below, then upload your payment screenshot to confirm.</p>
          </div>
          <div class="pay-amount">
            <span>Amount to Pay</span>
            <strong data-pay-amount>Rs. 2,500</strong>
            <small data-pay-label>Online Video Consultation</small>
          </div>
          <div class="pay-methods">
            <button type="button" class="pay-method is-active" data-tab="bank"><i class="fa-solid fa-building-columns"></i> Bank</button>
            <button type="button" class="pay-method" data-tab="jazzcash"><i class="fa-solid fa-mobile-screen-button"></i> JazzCash</button>
            <button type="button" class="pay-method" data-tab="easypaisa"><i class="fa-solid fa-wallet"></i> Easypaisa</button>
          </div>

          <div class="pay-panel" data-panel="bank">
            <div class="pay-bank">
              <div class="pay-row"><span>Account Title</span><b>${ACCOUNTS.bank.title}</b></div>
              <div class="pay-row"><span>Bank</span><b>${ACCOUNTS.bank.bank}</b></div>
              <div class="pay-row pay-iban"><span>IBAN</span>
                <b><code>${ACCOUNTS.bank.iban}</code>
                  <button type="button" class="pay-copy" data-copy="${ACCOUNTS.bank.iban}"><i class="fa-regular fa-copy"></i> Copy</button></b>
              </div>
            </div>
          </div>
          <div class="pay-panel" data-panel="jazzcash" hidden>
            <div class="pay-bank">
              <div class="pay-row"><span>Account Title</span><b>${ACCOUNTS.jazzcash.title}</b></div>
              <div class="pay-row pay-iban"><span>JazzCash No.</span>
                <b><code>${ACCOUNTS.jazzcash.number}</code>
                  <button type="button" class="pay-copy" data-copy="${ACCOUNTS.jazzcash.number}"><i class="fa-regular fa-copy"></i> Copy</button></b>
              </div>
            </div>
          </div>
          <div class="pay-panel" data-panel="easypaisa" hidden>
            <div class="pay-bank">
              <div class="pay-row"><span>Account Title</span><b>${ACCOUNTS.easypaisa.title}</b></div>
              <div class="pay-row pay-iban"><span>Easypaisa No.</span>
                <b><code>${ACCOUNTS.easypaisa.number}</code>
                  <button type="button" class="pay-copy" data-copy="${ACCOUNTS.easypaisa.number}"><i class="fa-regular fa-copy"></i> Copy</button></b>
              </div>
            </div>
          </div>

          <div class="pay-upload">
            <p class="pay-upload-title"><span class="pay-step-num">1</span> Send <b data-pay-amount2>Rs. 2,500</b> &nbsp;·&nbsp; <span class="pay-step-num">2</span> Upload the screenshot below</p>
            <label class="pay-upload-label" for="paySshot">
              <i class="fa-solid fa-cloud-arrow-up"></i>
              <span class="pay-upload-cta">Upload payment screenshot</span>
              <small>JPG or PNG — tap to choose</small>
            </label>
            <input type="file" id="paySshot" accept="image/*" hidden />
            <div class="pay-upload-preview" hidden>
              <span class="pay-upload-thumb"><img alt="Payment screenshot preview" /><i class="fa-regular fa-file-image"></i></span>
              <span class="pay-upload-info"><b class="pay-upload-name"></b><small class="pay-upload-ok"><i class="fa-solid fa-circle-check"></i> Screenshot ready</small></span>
              <button type="button" class="pay-upload-remove" aria-label="Remove screenshot">&times;</button>
            </div>
            <p class="pay-upload-error" hidden></p>
          </div>

          <div class="pay-actions">
            <button type="button" class="btn btn-primary btn-lg pay-send"><i class="fa-brands fa-whatsapp"></i> Send Booking + Screenshot</button>
          </div>
          <p class="pay-note"><i class="fa-solid fa-shield-halved"></i> Your slot is confirmed by the clinic on WhatsApp once payment is verified. No card details needed — pay directly to the account above.</p>
        </div>

        <div class="pay-success" hidden>
          <span class="pay-success-icon"><i class="fa-solid fa-circle-check"></i></span>
          <h3>Almost Done!</h3>
          <p>WhatsApp has opened with your booking details. <b>Please attach your payment screenshot in that chat and press send</b> — the clinic will then confirm your appointment time.</p>
          <button type="button" class="btn btn-primary pay-success-wa"><i class="fa-brands fa-whatsapp"></i> Open WhatsApp Again</button>
          <button type="button" class="btn btn-outline pay-success-close">Done</button>
        </div>
      </div>`;
    document.body.appendChild(payModal);

    const $ = (s) => payModal.querySelector(s);
    const amountEl = $('[data-pay-amount]');
    const amount2El = $('[data-pay-amount2]');
    const labelEl = $('[data-pay-label]');
    const tabBtns = payModal.querySelectorAll('.pay-method[data-tab]');
    const panels = payModal.querySelectorAll('.pay-panel');
    const fileInput = $('#paySshot');
    const uploadLabel = $('.pay-upload-label');
    const preview = $('.pay-upload-preview');
    const previewImg = preview.querySelector('img');
    const previewName = $('.pay-upload-name');
    const removeBtn = $('.pay-upload-remove');
    const uploadError = $('.pay-upload-error');
    const sendBtn = $('.pay-send');
    const bodyEl = $('.pay-body');
    const successEl = $('.pay-success');
    const successWaBtn = $('.pay-success-wa');
    const successCloseBtn = $('.pay-success-close');

    let pending = null;       // { data, fee }
    let activeMethod = 'bank';
    let screenshot = null;    // File
    let lastWaUrl = '';

    const openPay = () => { payModal.classList.add('is-open'); payModal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
    const closePay = () => { payModal.classList.remove('is-open'); payModal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };

    const showTab = (tab) => {
      activeMethod = tab;
      tabBtns.forEach(b => b.classList.toggle('is-active', b.dataset.tab === tab));
      panels.forEach(pn => { pn.hidden = pn.dataset.panel !== tab; });
    };
    tabBtns.forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));

    // Copy buttons (delegated)
    payModal.addEventListener('click', async (e) => {
      const btn = e.target.closest('.pay-copy');
      if (!btn) return;
      const val = btn.getAttribute('data-copy');
      try {
        if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(val); }
        else { const t = document.createElement('textarea'); t.value = val; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.focus(); t.select(); document.execCommand('copy'); t.remove(); }
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
        setTimeout(() => { btn.innerHTML = orig; }, 2000);
      } catch (err) { /* ignore */ }
    });

    // Screenshot selection + preview
    fileInput.addEventListener('change', () => {
      const f = fileInput.files && fileInput.files[0];
      if (!f) return;
      if (!f.type.startsWith('image/')) { showUploadError('Please choose an image file (JPG or PNG).'); return; }
      if (f.size > 6 * 1024 * 1024) { showUploadError('Image is too large. Please upload one under 6 MB.'); return; }
      screenshot = f;
      // Always show a clean file icon (no image thumbnail → never a broken-image glyph)
      preview.querySelector('.pay-upload-thumb').classList.add('no-img');
      previewName.textContent = f.name;
      preview.hidden = false;
      uploadLabel.hidden = true;
      uploadError.hidden = true;
      sendBtn.classList.remove('btn-shake');
    });
    removeBtn.addEventListener('click', () => {
      screenshot = null; fileInput.value = '';
      preview.hidden = true; uploadLabel.hidden = false;
    });
    const showUploadError = (msg) => {
      uploadError.textContent = msg; uploadError.hidden = false;
      sendBtn.classList.remove('btn-shake'); void sendBtn.offsetWidth; sendBtn.classList.add('btn-shake');
      uploadLabel.classList.add('is-error');
      setTimeout(() => uploadLabel.classList.remove('is-error'), 1500);
    };

    const openWhatsApp = (data, fee, method) => {
      lastWaUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(bookingText(data, fee, method))}`;
      window.open(lastWaUrl, '_blank');
    };

    const showSuccess = () => { bodyEl.hidden = true; successEl.hidden = false; };

    const sendBooking = () => {
      if (!pending) return;
      if (!screenshot) { showUploadError('Please upload your payment screenshot first.'); return; }
      const { data, fee } = pending;
      // Send the booking details to the clinic on WhatsApp; patient attaches the screenshot there
      openWhatsApp(data, fee, activeMethod);
      showSuccess();
      form.reset();
    };

    sendBtn.addEventListener('click', sendBooking);
    successWaBtn.addEventListener('click', () => { if (lastWaUrl) window.open(lastWaUrl, '_blank'); });
    successCloseBtn.addEventListener('click', closePay);
    $('.pay-close').addEventListener('click', closePay);
    payModal.addEventListener('click', (e) => { if (e.target === payModal) closePay(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && payModal.classList.contains('is-open')) closePay(); });

    const resetModal = () => {
      bodyEl.hidden = false; successEl.hidden = true;
      sendBtn.disabled = false; sendBtn.innerHTML = '<i class="fa-brands fa-whatsapp"></i> Send Booking + Screenshot';
      screenshot = null; fileInput.value = '';
      preview.hidden = true; uploadLabel.hidden = false; uploadError.hidden = true;
      showTab('bank');
    };

    // In-clinic bookings pay at the clinic → no payment modal, just send the request on WhatsApp
    const sendInClinicBooking = (data, fee) => {
      const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(bookingText(data, fee, 'clinic'))}`;
      window.open(url, '_blank');
      const status = form.querySelector('.form-status');
      if (status) {
        status.innerHTML = '✅ Booking request sent on WhatsApp! The clinic will confirm your appointment time. You can pay at the clinic on your visit.';
        status.style.color = 'var(--success)';
      }
      form.reset();
    };

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const status = form.querySelector('.form-status');
      const data = Object.fromEntries(new FormData(form).entries());
      if (!data.name || !data.phone || !data.date) {
        if (status) { status.textContent = 'Please fill name, phone and preferred date.'; status.style.color = 'var(--danger)'; }
        return;
      }
      const fee = detectFee(data);

      // In-clinic → pay at clinic, skip the payment window entirely
      if (isClinicData(data)) { sendInClinicBooking(data, fee); return; }

      // Online video consultation → advance payment via the payment window
      pending = { data, fee };
      resetModal();
      amountEl.textContent = `Rs. ${fee.amount.toLocaleString()}`;
      if (amount2El) amount2El.textContent = `Rs. ${fee.amount.toLocaleString()}`;
      labelEl.textContent = fee.label;
      if (status) { status.textContent = ''; }
      openPay();
    });
  }

  // Appointment: location-based days + time slots + date validation
  const cType = document.getElementById('consultationType');
  if (cType) {
    const LOC = {
      cavalry: { label: 'Cavalry Hospital, Lahore', days: [1,2,4], dayNames: 'Mon, Tue & Thu', range: '3:00–5:30 PM',
        slots: ['3:00 PM – 3:30 PM','3:30 PM – 4:00 PM','4:00 PM – 4:30 PM','4:30 PM – 5:00 PM','5:00 PM – 5:30 PM'] },
      sialkot: { label: 'Sialkot', days: [3], dayNames: 'Wednesday', range: '3:30–6:30 PM',
        slots: ['3:30 PM – 4:00 PM','4:00 PM – 4:30 PM','4:30 PM – 5:00 PM','5:00 PM – 5:30 PM','5:30 PM – 6:00 PM','6:00 PM – 6:30 PM'] }
    };
    const ONLINE_SLOTS = ['3:00 PM – 3:30 PM','3:30 PM – 4:00 PM','4:00 PM – 4:30 PM','4:30 PM – 5:00 PM','5:00 PM – 5:30 PM','5:30 PM – 6:00 PM','6:00 PM – 6:30 PM'];
    const locGroup = document.getElementById('locationGroup');
    const locSel = document.getElementById('locationSelect');
    const timeSel = document.getElementById('prefTime');
    const availHint = document.getElementById('availHint');
    const dateEl = document.getElementById('prefDate');
    const dateHint = document.getElementById('dateHint');

    const fillSlots = (slots) => { timeSel.innerHTML = '<option value="">Select time</option>' + slots.map(s => `<option>${s}</option>`).join(''); };
    const allowedDays = () => (cType.value === 'inclinic' ? LOC[locSel.value].days : null);

    const validateDate = () => {
      if (!dateEl) return;
      dateEl.setCustomValidity(''); if (dateHint) dateHint.hidden = true;
      const days = allowedDays();
      if (!days || !dateEl.value) return;
      const wd = new Date(dateEl.value + 'T00:00:00').getDay();
      if (!days.includes(wd)) {
        const cfg = LOC[locSel.value];
        if (dateHint) { dateHint.hidden = false; dateHint.textContent = `${cfg.label} is open on ${cfg.dayNames} only — please pick one of those days.`; }
        dateEl.setCustomValidity('Please choose an available day for this location.');
      }
    };
    const update = () => {
      if (cType.value === 'inclinic') {
        if (locGroup) locGroup.hidden = false;
        const cfg = LOC[locSel.value];
        fillSlots(cfg.slots);
        if (availHint) { availHint.hidden = false; availHint.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${cfg.label}: open <b>${cfg.dayNames}</b>, ${cfg.range}.`; }
      } else if (cType.value === 'online') {
        if (locGroup) locGroup.hidden = true;
        fillSlots(ONLINE_SLOTS);
        if (availHint) { availHint.hidden = false; availHint.innerHTML = `<i class="fa-solid fa-video"></i> Online — available any day by appointment; final timing confirmed on WhatsApp.`; }
      } else {
        if (locGroup) locGroup.hidden = true;
        if (availHint) availHint.hidden = true;
        fillSlots([]);
      }
      validateDate();
    };
    cType.addEventListener('change', update);
    if (locSel) locSel.addEventListener('change', update);
    if (dateEl) dateEl.addEventListener('change', validateDate);
    update();
  }

  // Set min date on date pickers to today
  document.querySelectorAll('input[type="date"]').forEach(el => {
    const today = new Date().toISOString().split('T')[0];
    el.setAttribute('min', today);
  });

  // Footer year
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Floating WhatsApp contact button (site-wide)
  if (!document.querySelector('.wa-float')) {
    const wa = document.createElement('a');
    wa.className = 'wa-float';
    wa.href = 'https://wa.me/923194040103?text=' + encodeURIComponent('Assalam o Alaikum, I would like to ask about a consultation with Dr. Muhammad Zeeshan Ahmad Raza.');
    wa.target = '_blank';
    wa.rel = 'noopener';
    wa.setAttribute('aria-label', 'Chat on WhatsApp');
    wa.innerHTML = '<i class="fa-brands fa-whatsapp"></i><span class="wa-float-label">Chat with us</span>';
    document.body.appendChild(wa);
  }

  // Google Business Profile (GMB) review links
  // ===== Website reviews (patient submits → auto-shows in the carousel) =====
  // Optional: to share reviews across ALL visitors + collect them centrally, paste a
  // free Google Apps Script Web App URL below (setup steps provided). When empty,
  // reviews are stored in the visitor's own browser (localStorage) and shown instantly.
  const REVIEWS_ENDPOINT = '';
  const REVIEWS_KEY = 'dz_reviews';
  const AVATAR_COLORS = ['#1A76D1','#00A085','#E8710A','#9334E6'];
  const loadLocalReviews = () => { try { return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]'); } catch (e) { return []; } };
  const saveLocalReview = (r) => { const a = loadLocalReviews(); a.unshift(r); try { localStorage.setItem(REVIEWS_KEY, JSON.stringify(a.slice(0, 50))); } catch (e) {} };
  const escHtml = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const reviewSlideHTML = (r) => {
    const name = escHtml(r.name || 'Patient');
    const initial = (String(r.name || 'P').trim()[0] || 'P').toUpperCase();
    const color = AVATAR_COLORS[String(r.name || '').length % AVATAR_COLORS.length];
    const rating = Math.max(1, Math.min(5, +r.rating || 5));
    const stars = Array.from({ length: 5 }, (_, i) => `<i class="fa-${i < rating ? 'solid' : 'regular'} fa-star"></i>`).join('');
    return `<div class="rev-slide"><div class="rev-card">
      <div class="rev-top"><span class="rev-avatar" style="background:${color};">${initial}</span>
        <div class="rev-meta"><strong>${name}</strong><small>${escHtml(r.when || 'just now')}</small></div>
        <i class="fa-solid fa-circle-check rev-g" style="color:#00A085;" title="Verified patient"></i></div>
      <div class="rev-stars">${stars}</div>
      <p>${escHtml(r.text || '')}</p></div></div>`;
  };
  const postReviewToEndpoint = (r) => {
    if (!REVIEWS_ENDPOINT) return;
    try { fetch(REVIEWS_ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(r) }); } catch (e) {}
  };
  let refreshReviews = null; // set by the carousel block; called after a new review is submitted

  // Write-a-review popup: pick stars + write review → saved + shown in the reviews section
  const reviewTriggers = document.querySelectorAll('[data-gmb-write]');
  if (reviewTriggers.length) {
    const rvModal = document.createElement('div');
    rvModal.className = 'rv-modal';
    rvModal.setAttribute('aria-hidden', 'true');
    rvModal.innerHTML = `
      <div class="rv-card" role="dialog" aria-modal="true" aria-label="Write a review">
        <button class="rv-close" type="button" aria-label="Close">&times;</button>
        <span class="rv-google"><i class="fa-solid fa-star"></i> Your Review</span>
        <h3>Rate Your Experience</h3>
        <p class="rv-sub">Your feedback helps other patients. Give a rating and write a few words.</p>
        <div class="rv-stars" role="radiogroup" aria-label="Star rating">
          ${[1,2,3,4,5].map(n => `<button type="button" class="rv-star" data-star="${n}" aria-label="${n} star"><i class="fa-solid fa-star"></i></button>`).join('')}
        </div>
        <input type="text" class="rv-name" placeholder="Your name (optional)" />
        <textarea class="rv-text" rows="4" placeholder="What was your experience like? (e.g. professional, private, and really helped my problem…)"></textarea>
        <button type="button" class="btn btn-primary btn-lg rv-post"><i class="fa-solid fa-paper-plane"></i> Submit Review</button>
        <p class="rv-note" hidden></p>
        <p class="rv-hint">Your review appears in the reviews section right away. Thank you for sharing your experience!</p>
      </div>`;
    document.body.appendChild(rvModal);

    const rvStars = rvModal.querySelectorAll('.rv-star');
    const rvName = rvModal.querySelector('.rv-name');
    const rvText = rvModal.querySelector('.rv-text');
    const rvPost = rvModal.querySelector('.rv-post');
    const rvNote = rvModal.querySelector('.rv-note');
    let rating = 0;

    const paintStars = (val) => rvStars.forEach(s => s.classList.toggle('is-on', +s.dataset.star <= val));
    rvStars.forEach(s => {
      s.addEventListener('mouseenter', () => paintStars(+s.dataset.star));
      s.addEventListener('mouseleave', () => paintStars(rating));
      s.addEventListener('click', () => { rating = +s.dataset.star; paintStars(rating); rvNote.hidden = true; });
    });
    const openRv = () => { rvModal.classList.add('is-open'); rvModal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
    const closeRv = () => { rvModal.classList.remove('is-open'); rvModal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };

    reviewTriggers.forEach(t => t.addEventListener('click', (e) => { e.preventDefault(); rating = 0; paintStars(0); rvText.value = ''; rvName.value = ''; rvNote.hidden = true; rvNote.className = 'rv-note'; rvPost.disabled = false; openRv(); }));
    rvModal.querySelector('.rv-close').addEventListener('click', closeRv);
    rvModal.addEventListener('click', (e) => { if (e.target === rvModal) closeRv(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && rvModal.classList.contains('is-open')) closeRv(); });

    rvPost.addEventListener('click', () => {
      if (rating === 0) {
        rvNote.hidden = false; rvNote.className = 'rv-note rv-note-err';
        rvNote.innerHTML = '<i class="fa-solid fa-star"></i> Please tap the stars to rate first.';
        return;
      }
      const review = { name: rvName.value.trim() || 'Patient', rating, text: rvText.value.trim(), when: 'just now' };
      saveLocalReview(review);       // remember it (shows on this device + future visits)
      postReviewToEndpoint(review);  // share to all visitors, if an endpoint is configured
      if (typeof refreshReviews === 'function') refreshReviews(); // update the carousel now
      rvPost.disabled = true;
      rvNote.hidden = false; rvNote.className = 'rv-note';
      rvNote.innerHTML = '<i class="fa-solid fa-circle-check"></i> Thank you! Your review has been added below.';
      setTimeout(closeRv, 1500);
    });
  }

  // Reviews carousel (sliding) — shows patient-submitted reviews first, then samples
  const revSlider = document.querySelector('[data-rev-slider]');
  if (revSlider) {
    const track = revSlider.querySelector('[data-rev-track]');
    const dotsWrap = revSlider.querySelector('[data-rev-dots]');
    const prevBtn = revSlider.querySelector('.rev-prev');
    const nextBtn = revSlider.querySelector('.rev-next');
    const SAMPLE_HTML = track.innerHTML; // the built-in example cards
    let slides = [], index = 0, perView = 3, maxIndex = 0, timer = null;

    const renderAll = () => {
      const mine = loadLocalReviews().map(reviewSlideHTML).join('');
      track.innerHTML = mine + SAMPLE_HTML;
      slides = Array.from(track.querySelectorAll('.rev-slide'));
    };
    const calcPerView = () => { const w = window.innerWidth; return w > 992 ? 3 : (w > 768 ? 2 : 1); };
    const update = () => {
      track.style.transform = `translateX(-${index * (100 / perView)}%)`;
      dotsWrap.querySelectorAll('button').forEach((d, i) => d.classList.toggle('is-active', i === index));
    };
    const buildDots = () => {
      dotsWrap.innerHTML = '';
      for (let i = 0; i <= maxIndex; i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Go to review group ${i + 1}`);
        b.addEventListener('click', () => { index = i; update(); restart(); });
        dotsWrap.appendChild(b);
      }
    };
    const layout = () => {
      perView = calcPerView();
      maxIndex = Math.max(0, slides.length - perView);
      if (index > maxIndex) index = maxIndex;
      buildDots();
      update();
    };
    const go = (dir) => {
      index += dir;
      if (index > maxIndex) index = 0;
      if (index < 0) index = maxIndex;
      update();
    };
    const restart = () => { if (timer) clearInterval(timer); timer = setInterval(() => go(1), 4500); };

    nextBtn.addEventListener('click', () => { go(1); restart(); });
    prevBtn.addEventListener('click', () => { go(-1); restart(); });
    revSlider.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
    revSlider.addEventListener('mouseleave', restart);
    window.addEventListener('resize', layout);

    // Expose refresh so the review popup can update the carousel after a submit
    refreshReviews = () => { renderAll(); index = 0; layout(); restart(); };

    // Optionally pull shared reviews from the endpoint (falls back silently if unavailable)
    if (REVIEWS_ENDPOINT) {
      fetch(REVIEWS_ENDPOINT).then(r => r.json()).then(list => {
        if (Array.isArray(list) && list.length) {
          try { localStorage.setItem(REVIEWS_KEY, JSON.stringify(list.slice(0, 50))); } catch (e) {}
          refreshReviews();
        }
      }).catch(() => {});
    }

    renderAll();
    layout();
    restart();
  }

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

    introCard.addEventListener('click', openIntro);
    introCard.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openIntro(); } });
    closeBtn && closeBtn.addEventListener('click', closeIntro);
    introModal.addEventListener('click', (e) => { if (e.target === introModal) closeIntro(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeIntro(); });
  }
});
