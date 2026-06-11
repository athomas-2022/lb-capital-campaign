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
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

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

/* Full-screen light show — interacting with the lighting card triggers a center-out
   burst plus random twinkles flashing across the screen. No effect on the card itself. */
if (!reduceMotion) {
  const lightShow = document.createElement('div');
  lightShow.className = 'lightshow';
  lightShow.setAttribute('aria-hidden', 'true');

  let html = '<div class="ls-sky"></div><div class="ls-rays"></div>' +
             '<div class="ls-burst"></div><div class="ls-burst ls-burst-2"></div>';
  const TWINKLES = 24;
  for (let i = 0; i < TWINKLES; i++) {
    html += '<span class="ls-twinkle"></span>';
  }
  lightShow.innerHTML = html;
  document.body.appendChild(lightShow);

  const twinkles = lightShow.querySelectorAll('.ls-twinkle');
  const scatter = () => {
    twinkles.forEach((t) => {
      t.style.left = (4 + Math.random() * 92).toFixed(1) + '%';
      t.style.top = (5 + Math.random() * 90).toFixed(1) + '%';
      t.style.setProperty('--s', (1.2 + Math.random() * 3.2).toFixed(2) + 'vmin');
      t.style.setProperty('--delay', (Math.random() * 0.8).toFixed(2) + 's');
      t.style.setProperty('--d', (0.45 + Math.random() * 0.5).toFixed(2) + 's');
    });
  };

  let cooling = false;
  const playLightShow = () => {
    if (cooling) return;            // debounce so it can't spam on repeated hovers
    cooling = true;
    scatter();                      // fresh random twinkle pattern each time
    lightShow.classList.remove('playing');
    void lightShow.offsetWidth;     // restart the animation
    lightShow.classList.add('playing');
    setTimeout(() => lightShow.classList.remove('playing'), 1600);
    setTimeout(() => { cooling = false; }, 1900);
  };

  document.querySelectorAll('.lights-card').forEach((card) => {
    card.addEventListener('mouseenter', playLightShow);
    card.addEventListener('focusin', playLightShow);
    card.addEventListener('touchstart', playLightShow, { passive: true });
  });
}
