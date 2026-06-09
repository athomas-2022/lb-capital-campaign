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
