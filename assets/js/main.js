document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const navList = document.getElementById('navList');

navToggle.addEventListener('click', () => {
  const isOpen = navList.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navList.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navList.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Scroll-reveal: fade + rise elements into view as the user scrolls */
const revealEls = document.querySelectorAll('[data-reveal]');

if (reduceMotion) {
  revealEls.forEach((el) => el.classList.add('is-visible'));
} else {
  revealEls.forEach((el, index) => {
    const delayAttr = el.getAttribute('data-reveal-delay');
    const delay = delayAttr ? Number(delayAttr) : (index % 3) * 90;
    el.style.setProperty('--reveal-delay', `${delay}ms`);
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

  revealEls.forEach((el) => revealObserver.observe(el));
}

/* Count-up animation for big stat numbers */
const countEls = document.querySelectorAll('[data-count-to]');

function animateCount(el) {
  const target = Number(el.getAttribute('data-count-to'));
  const prefix = el.getAttribute('data-prefix') || '';
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 1400;
  const start = performance.now();

  const format = (n) => n.toLocaleString('en-US');

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    el.textContent = `${prefix}${format(value)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  }

  if (reduceMotion) {
    el.textContent = `${prefix}${format(target)}${suffix}`;
  } else {
    requestAnimationFrame(tick);
  }
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });

countEls.forEach((el) => countObserver.observe(el));

/* Capital Campaign 2026 progress thermometer — fills the bar based on raised vs. goal */
const campaignProgress = document.querySelector('.campaign-progress');

if (campaignProgress) {
  const goal = Number(campaignProgress.getAttribute('data-goal')) || 0;
  const amountEl = campaignProgress.querySelector('.progress-amount');
  const raised = amountEl ? Number(amountEl.getAttribute('data-count-to')) || 0 : 0;
  const fill = campaignProgress.querySelector('.progress-fill');
  const percentEl = campaignProgress.querySelector('.progress-percent');
  const pct = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;

  function fillBar() {
    if (fill) fill.style.width = `${Math.max(pct, 4)}%`;
    if (percentEl) percentEl.textContent = `${pct}%`;
  }

  if (reduceMotion) {
    fillBar();
  } else {
    const progressObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fillBar();
          progressObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    progressObserver.observe(campaignProgress);
  }
}

/* Donor wall — tabbed giving levels with auto-counted badges */
const donorTabs = document.querySelectorAll('.donor-tab');

if (donorTabs.length) {
  // Populate each tab's count badge from its panel's list length
  donorTabs.forEach((tab) => {
    const panel = document.getElementById(`panel-${tab.getAttribute('data-panel')}`);
    const badge = tab.querySelector('.donor-count');
    if (panel && badge) {
      badge.textContent = panel.querySelectorAll('.donor-list li').length;
    }
  });

  donorTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetId = `panel-${tab.getAttribute('data-panel')}`;

      donorTabs.forEach((t) => {
        const isActive = t === tab;
        t.classList.toggle('is-active', isActive);
        t.setAttribute('aria-selected', String(isActive));
      });

      document.querySelectorAll('.donor-panel').forEach((panel) => {
        const isActive = panel.id === targetId;
        panel.classList.toggle('is-active', isActive);
        panel.hidden = !isActive;
      });
    });
  });
}

/* Collapsible donor list — collapse to a preview with a "Show all" toggle.
   Progressive enhancement: with no JS the full list shows and the button stays hidden. */
const donorWall = document.querySelector('.donor-wall');

if (donorWall) {
  const wrap = donorWall.querySelector('.donor-list-wrap');
  const toggle = donorWall.querySelector('.donor-toggle');
  const label = toggle ? toggle.querySelector('.donor-toggle-label') : null;
  const count = donorWall.querySelectorAll('.donor-list li').length;

  if (wrap && toggle && label) {
    wrap.classList.add('is-collapsed');
    toggle.hidden = false;

    const sync = () => {
      const collapsed = wrap.classList.contains('is-collapsed');
      toggle.setAttribute('aria-expanded', String(!collapsed));
      label.textContent = collapsed ? `Show all ${count} donors` : 'Show fewer';
    };
    sync();

    toggle.addEventListener('click', () => {
      const collapsing = !wrap.classList.contains('is-collapsed');
      wrap.classList.toggle('is-collapsed');
      sync();
      // When collapsing, bring the reader back up to the donor section instead of stranding them far below.
      if (collapsing) {
        donorWall.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  }
}

/* Stadium Sound card — click anywhere on the card to play a short clip of the LB fight song:
   start a few seconds in (skip the intro), play ~8s, then fade out and stop. No button. */
const soundCard = document.querySelector('.sound-card');

if (soundCard) {
  const audio = soundCard.querySelector('.sound-audio');
  const START = 3.5;        // seconds skipped at the start (cuts the intro)
  const PLAY_SECONDS = 13;  // length of the clip before it stops
  const FADE_SECONDS = 1.5; // fade-out tail (included in PLAY_SECONDS)

  if (audio) {
    let rafId = null;

    const seekToStart = () => { try { audio.currentTime = START; } catch (e) {} };
    // Pre-seek once metadata is ready so the very first play also skips the intro.
    if (audio.readyState >= 1) seekToStart();
    else audio.addEventListener('loadedmetadata', seekToStart, { once: true });

    const stopClip = () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      audio.pause();
      audio.volume = 1;
      seekToStart();
    };

    // Drive the timed fade-out off the real playback position, frame by frame.
    const tick = () => {
      if (audio.paused) { rafId = null; return; }
      const elapsed = audio.currentTime - START;
      if (elapsed >= PLAY_SECONDS) { stopClip(); return; }
      const fadeStart = PLAY_SECONDS - FADE_SECONDS;
      audio.volume = elapsed > fadeStart
        ? Math.max(0, 1 - (elapsed - fadeStart) / FADE_SECONDS)
        : 1;
      rafId = requestAnimationFrame(tick);
    };

    soundCard.addEventListener('click', () => {
      if (audio.paused) {
        if (audio.currentTime < START || audio.ended) seekToStart();
        audio.volume = 1;
        audio.play().catch(() => {});
      } else {
        stopClip();
      }
    });

    audio.addEventListener('play', () => {
      soundCard.classList.add('is-playing');
      if (!rafId) rafId = requestAnimationFrame(tick);
    });
    audio.addEventListener('pause', () => soundCard.classList.remove('is-playing'));
    audio.addEventListener('ended', () => { soundCard.classList.remove('is-playing'); stopClip(); });
  }
}

/* 3D tilt effect on cards — follows the cursor for a subtle depth feel */
if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.tilt').forEach((card) => {
    const maxTilt = 7;

    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * maxTilt * 2;
      const rotateX = (0.5 - py) * maxTilt * 2;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}

/* Full-screen light show — interacting with the lighting card triggers a wave of
   stadium lights (the "Tsunami") sweeping across the screen. No effect on the card itself. */
if (!reduceMotion) {
  const lightShow = document.createElement('div');
  lightShow.className = 'lightshow';
  lightShow.setAttribute('aria-hidden', 'true');
  const PODS = 9;
  let pods = '';
  for (let i = 0; i < PODS; i++) {
    pods += '<span style="left:' + ((100 / (PODS + 1)) * (i + 1)) + '%;--i:' + i + '"></span>';
  }
  lightShow.innerHTML =
    '<div class="ls-sky"></div><div class="ls-pods">' + pods + '</div>' +
    '<div class="ls-beam ls-beam-1"></div><div class="ls-beam ls-beam-2"></div><div class="ls-beam ls-beam-3"></div>' +
    '<div class="ls-wave"></div>';
  document.body.appendChild(lightShow);

  let cooling = false;
  const playLightShow = () => {
    if (cooling) return;            // debounce so it can't spam on repeated hovers
    cooling = true;
    lightShow.classList.remove('playing');
    void lightShow.offsetWidth;     // restart the animation
    lightShow.classList.add('playing');
    setTimeout(() => lightShow.classList.remove('playing'), 2900);
    setTimeout(() => { cooling = false; }, 3300);
  };

  document.querySelectorAll('.lights-card').forEach((card) => {
    card.addEventListener('mouseenter', playLightShow);
    card.addEventListener('focusin', playLightShow);
    card.addEventListener('touchstart', playLightShow, { passive: true });
  });
}

/* Commitment Card modal — opens a styled pledge form and posts it to the
   committee's Google Form (responses collect into a Google Sheet). */
const commitOverlay = document.querySelector('[data-commit-overlay]');

if (commitOverlay) {
  // Google Form backend. action = the form's /formResponse URL; map = each
  // field name -> its Google Form entry id. Submissions land in the linked Sheet.
  const COMMIT = {
    action: 'https://docs.google.com/forms/d/e/1FAIpQLSdCv9HU_L3CIW1xf2BX-NeREs-2xAeXcHieoYR7-98jd35r3A/formResponse',
    map: {
      name: 'entry.1003847543',
      email: 'entry.1329781320',
      phone: 'entry.1120385269',
      amount: 'entry.84697686',
      level: 'entry.62043281',
      project: 'entry.1573963699',
      recognition: 'entry.1725010829',
      anonymous: 'entry.96586109'
    }
  };

  const modal = commitOverlay.querySelector('.commit-modal');
  const form = commitOverlay.querySelector('[data-commit-form]');
  const errorEl = commitOverlay.querySelector('[data-commit-error]');
  const formView = commitOverlay.querySelector('[data-commit-view="form"]');
  const successView = commitOverlay.querySelector('[data-commit-view="success"]');
  const submitBtn = form.querySelector('.commit-submit');
  let lastFocus = null;

  const openModal = () => {
    lastFocus = document.activeElement;
    commitOverlay.hidden = false;
    document.body.classList.add('commit-lock');
    // force reflow so the opacity/transform transition runs
    void commitOverlay.offsetWidth;
    commitOverlay.classList.add('is-open');
    const first = form.querySelector('input, select');
    if (first) first.focus();
  };

  const closeModal = () => {
    commitOverlay.classList.remove('is-open');
    document.body.classList.remove('commit-lock');
    const finish = () => {
      commitOverlay.hidden = true;
      // reset back to the form view for next time
      formView.hidden = false;
      successView.hidden = true;
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    };
    if (reduceMotion) finish();
    else setTimeout(finish, 240);
  };

  document.querySelectorAll('[data-commit-open]').forEach((btn) => {
    btn.addEventListener('click', openModal);
  });
  commitOverlay.querySelectorAll('[data-commit-close]').forEach((btn) => {
    btn.addEventListener('click', closeModal);
  });
  commitOverlay.addEventListener('mousedown', (e) => {
    if (e.target === commitOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !commitOverlay.hidden) closeModal();
  });

  // Keep tab focus inside the dialog while it's open.
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const items = modal.querySelectorAll('button, input, select, textarea, a[href]');
    const focusable = Array.from(items).filter((el) => !el.disabled && el.offsetParent !== null);
    if (!focusable.length) return;
    const firstEl = focusable[0];
    const lastEl = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
    else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
  });

  const showError = (msg) => {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = false;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorEl.hidden = true;

    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      amount: form.amount.value.trim(),
      level: form.level.value,
      project: form.project.value,
      recognition: form.recognition.value.trim(),
      anonymous: form.anonymous.checked ? 'Yes' : ''
    };

    ['name', 'email', 'amount'].forEach((k) => {
      form[k].setAttribute('aria-invalid', data[k] ? 'false' : 'true');
    });
    if (!data.name || !data.email || !data.amount) {
      return showError('Please add your name, email, and a pledge amount.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      form.email.setAttribute('aria-invalid', 'true');
      return showError('Please enter a valid email address.');
    }

    const payload = new URLSearchParams();
    Object.keys(COMMIT.map).forEach((key) => {
      if (data[key]) payload.append(COMMIT.map[key], data[key]);
    });

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    // Google Forms doesn't send CORS headers, so we post no-cors (opaque
    // response) and treat completion as success.
    fetch(COMMIT.action, { method: 'POST', mode: 'no-cors', body: payload })
      .then(() => {
        formView.hidden = true;
        successView.hidden = false;
      })
      .catch(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Commitment';
        showError('Something went wrong sending your commitment. Please email lbcap2020@gmail.com and we’ll take care of it.');
      });
  });
}
