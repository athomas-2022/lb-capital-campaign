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

/* Stadium Sound card — click anywhere on the card to play/pause the LB fight song.
   Playback starts a couple seconds in to skip the intro. No button — the card itself is the trigger. */
const soundCard = document.querySelector('.sound-card');

if (soundCard) {
  const audio = soundCard.querySelector('.sound-audio');
  const START = 2.5; // seconds skipped at the start — raise/lower to trim more or less of the intro

  if (audio) {
    const seekToStart = () => { try { audio.currentTime = START; } catch (e) {} };
    // Pre-seek once metadata is ready so the very first play also skips the intro.
    if (audio.readyState >= 1) seekToStart();
    else audio.addEventListener('loadedmetadata', seekToStart, { once: true });

    soundCard.addEventListener('click', () => {
      if (audio.paused) {
        if (audio.currentTime < START || audio.ended) seekToStart();
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    });

    audio.addEventListener('play', () => soundCard.classList.add('is-playing'));
    audio.addEventListener('pause', () => soundCard.classList.remove('is-playing'));
    audio.addEventListener('ended', () => { soundCard.classList.remove('is-playing'); seekToStart(); });
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
