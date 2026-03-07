/**
 * Carousel – Plumbing 24 Service Inc
 * Reusable horizontal carousel with responsive 3 / 2 / 1 layout,
 * arrow navigation, dot indicators, auto-scroll, touch/swipe, and pause-on-hover.
 *
 * All layout-critical properties (widths, flex-shrink, positioning) are set
 * via inline styles so the carousel works regardless of which Tailwind
 * utility classes exist in the compiled CSS.
 */
(function () {
  'use strict';

  /* ── helpers ─────────────────────────────────────────────── */
  function qs(id) { return document.getElementById(id); }

  function visibleCount() {
    var w = window.innerWidth;
    if (w >= 1024) return 3;
    if (w >= 768)  return 2;
    return 1;
  }

  /* ── Carousel factory ───────────────────────────────────── */
  function Carousel(cfg) {
    // Required ids
    this.track     = qs(cfg.trackId);
    this.container = qs(cfg.containerId);
    this.prevBtn   = qs(cfg.prevId);
    this.nextBtn   = qs(cfg.nextId);
    this.dotsWrap  = qs(cfg.dotsId);
    if (!this.track || !this.container) return;

    this.slideSelector = cfg.slideSelector;
    this.interval      = cfg.interval || 4000;
    this.idx           = 0;
    this._auto         = null;
    this._resume       = null;

    this._applyTrackStyles();
    this._applySlideStyles();
    this._applyArrowStyles();
    this._buildDots();
    this._bindEvents();
    this._startAuto();
  }

  /* ── prototype ──────────────────────────────────────────── */
  var P = Carousel.prototype;

  /* slides NodeList (live-ish reference) */
  P._slides = function () {
    return this.track.querySelectorAll(this.slideSelector);
  };

  /* total number of slides */
  P._total = function () { return this._slides().length; };

  /* how many positions we can scroll to */
  P._maxIdx = function () { return Math.max(0, this._total() - visibleCount()); };

  /* one slide width in percent */
  P._pct = function () { return 100 / visibleCount(); };

  /* ── inline styles ──────────────────────────────────────── */
  P._applyTrackStyles = function () {
    var s = this.track.style;
    s.display    = 'flex';
    s.transition = 'transform 500ms ease-in-out';
    s.willChange = 'transform';
  };

  P._applySlideStyles = function () {
    var slides = this._slides();
    var pct = this._pct();
    for (var i = 0; i < slides.length; i++) {
      var s = slides[i].style;
      s.flexShrink = '0';
      s.width      = pct + '%';
      s.boxSizing  = 'border-box';
    }
  };

  P._applyArrowStyles = function () {
    /* shared arrow base */
    var base = {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: '20',
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: '#ffffff',
      color: '#2563EB',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      transition: 'background-color 0.3s, color 0.3s',
      fontSize: '18px'
    };

    function apply(btn, extra) {
      if (!btn) return;
      for (var k in base) btn.style[k] = base[k];
      for (var k2 in extra) btn.style[k2] = extra[k2];
      btn.addEventListener('mouseenter', function () {
        btn.style.backgroundColor = '#2563EB';
        btn.style.color = '#ffffff';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.backgroundColor = '#ffffff';
        btn.style.color = '#2563EB';
      });
    }

    apply(this.prevBtn, { left: '0' });
    apply(this.nextBtn, { right: '0' });
  };

  /* ── navigation ─────────────────────────────────────────── */
  P._go = function (i) {
    this.idx = Math.max(0, Math.min(i, this._maxIdx()));
    this.track.style.transform = 'translateX(-' + (this.idx * this._pct()) + '%)';
    this._updateDots();
  };

  P._next = function () {
    this._go(this.idx >= this._maxIdx() ? 0 : this.idx + 1);
  };

  P._prev = function () {
    this._go(this.idx <= 0 ? this._maxIdx() : this.idx - 1);
  };

  /* ── dots ────────────────────────────────────────────────── */
  P._buildDots = function () {
    if (!this.dotsWrap) return;
    this.dotsWrap.innerHTML = '';
    this.dotsWrap.style.display = 'flex';
    this.dotsWrap.style.justifyContent = 'center';
    this.dotsWrap.style.gap = '8px';
    this.dotsWrap.style.marginTop = '24px';

    var count = this._maxIdx() + 1;
    var self = this;
    for (var i = 0; i < count; i++) {
      (function (n) {
        var d = document.createElement('button');
        d.setAttribute('aria-label', 'Go to slide ' + (n + 1));
        d.style.width  = '10px';
        d.style.height = '10px';
        d.style.borderRadius = '50%';
        d.style.border = 'none';
        d.style.cursor = 'pointer';
        d.style.transition = 'background-color 0.3s, transform 0.3s';
        d.style.padding = '0';
        d.addEventListener('click', function () {
          self._go(n);
          self._pauseResume();
        });
        self.dotsWrap.appendChild(d);
      })(i);
    }
    this._updateDots();
  };

  P._updateDots = function () {
    if (!this.dotsWrap) return;
    var dots = this.dotsWrap.querySelectorAll('button');
    for (var i = 0; i < dots.length; i++) {
      if (i === this.idx) {
        dots[i].style.backgroundColor = '#2563EB';
        dots[i].style.transform = 'scale(1.3)';
      } else {
        dots[i].style.backgroundColor = '#D1D5DB';
        dots[i].style.transform = 'scale(1)';
      }
    }
  };

  /* ── auto-scroll ────────────────────────────────────────── */
  P._startAuto = function () {
    this._stopAuto();
    var self = this;
    this._auto = setInterval(function () { self._next(); }, this.interval);
  };

  P._stopAuto = function () {
    if (this._auto) { clearInterval(this._auto); this._auto = null; }
  };

  P._pauseResume = function () {
    this._stopAuto();
    if (this._resume) clearTimeout(this._resume);
    var self = this;
    this._resume = setTimeout(function () { self._startAuto(); }, 5000);
  };

  /* ── event binding ──────────────────────────────────────── */
  P._bindEvents = function () {
    var self = this;

    /* arrows */
    if (this.prevBtn) this.prevBtn.addEventListener('click', function () { self._prev(); self._pauseResume(); });
    if (this.nextBtn) this.nextBtn.addEventListener('click', function () { self._next(); self._pauseResume(); });

    /* hover pause */
    this.container.addEventListener('mouseenter', function () { self._stopAuto(); });
    this.container.addEventListener('mouseleave', function () {
      if (self._resume) clearTimeout(self._resume);
      self._resume = setTimeout(function () { self._startAuto(); }, 2000);
    });

    /* touch / swipe */
    var startX = 0, deltaX = 0, touching = false;
    this.container.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX; deltaX = 0; touching = true;
      self._stopAuto();
      self.track.style.transition = 'none';
    }, { passive: true });

    this.container.addEventListener('touchmove', function (e) {
      if (!touching) return;
      deltaX = e.touches[0].clientX - startX;
      var dragPct = (deltaX / self.container.offsetWidth) * 100;
      self.track.style.transform = 'translateX(-' + (self.idx * self._pct() - dragPct) + '%)';
    }, { passive: true });

    this.container.addEventListener('touchend', function () {
      touching = false;
      self.track.style.transition = 'transform 500ms ease-in-out';
      if (Math.abs(deltaX) > 50) {
        deltaX < 0 ? self._next() : self._prev();
      } else {
        self._go(self.idx);
      }
      self._pauseResume();
    });

    /* resize */
    var debounce;
    window.addEventListener('resize', function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () {
        self._applySlideStyles();
        if (self.idx > self._maxIdx()) self.idx = self._maxIdx();
        self._buildDots();
        self._go(self.idx);
      }, 200);
    });
  };

  /* ── public init ────────────────────────────────────────── */
  window.initCarousel = function (cfg) {
    return new Carousel(cfg);
  };

  /* ── auto-init on DOMContentLoaded ──────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    /* Projects carousel */
    initCarousel({
      trackId:       'projects-track',
      containerId:   'projects-carousel',
      prevId:        'projects-prev',
      nextId:        'projects-next',
      dotsId:        'projects-dots',
      slideSelector: '.project-slide',
      interval:      4500
    });

    /* Reviews carousel */
    initCarousel({
      trackId:       'reviews-track',
      containerId:   'reviews-carousel',
      prevId:        'reviews-prev',
      nextId:        'reviews-next',
      dotsId:        'reviews-dots',
      slideSelector: '.review-slide',
      interval:      4000
    });
  });
})();
