(function () {
  'use strict';

  var $ = window.jQuery;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setScrollProgress() {
    var doc = document.documentElement;
    var total = doc.scrollHeight - doc.clientHeight;
    var scrolled = total > 0 ? (doc.scrollTop / total) * 100 : 0;
    var progress = qs('.scroll-progress');
    var backToTop = qs('.back-to-top');
    var nav = qs('.portfolio-nav');
    if (progress) progress.style.width = scrolled + '%';
    if (backToTop) backToTop.classList.toggle('show', doc.scrollTop > 520);
    if (nav) nav.classList.toggle('scrolled', doc.scrollTop > 40);
  }

  function initSmoothScroll() {
    if (!$) {
      qsa('a.js-scroll-trigger').forEach(function (link) {
        link.addEventListener('click', function (event) {
          var href = link.getAttribute('href');
          var target = href && href.charAt(0) === '#' ? qs(href) : null;
          if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
          }
        });
      });
      return;
    }

    $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
      if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        if (target.length) {
          $('html, body').animate({ scrollTop: target.offset().top - 70 }, prefersReducedMotion ? 0 : 850, 'easeInOutExpo');
          return false;
        }
      }
    });

    $('.js-scroll-trigger').click(function () {
      $('.navbar-collapse').collapse('hide');
    });
  }

  function initReveals() {
    var items = qsa('.reveal');
    items.forEach(function (item) {
      var delay = item.getAttribute('data-delay');
      if (delay) item.style.setProperty('--delay', delay + 'ms');
    });

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      items.forEach(function (item) { item.classList.add('in-view'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });

    items.forEach(function (item) { observer.observe(item); });
  }

  function initActiveNav() {
    var sections = qsa('main section[id]');
    var navLinks = qsa('.nav-link[href^="#"]');

    function updateActiveLink() {
      var current = '';
      sections.forEach(function (section) {
        if (window.scrollY >= section.offsetTop - 130) current = section.id;
      });
      navLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
      });
    }

    updateActiveLink();
    window.addEventListener('scroll', updateActiveLink, { passive: true });
  }

  function initCounters() {
    var counters = qsa('[data-count]');
    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      counters.forEach(function (counter) { counter.textContent = counter.dataset.count + '+'; });
      return;
    }

    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.dataset.count, 10);
        var start = performance.now();
        function tick(now) {
          var progress = Math.min((now - start) / 1000, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target) + (progress === 1 ? '+' : '');
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (counter) { counterObserver.observe(counter); });
  }

  function initExperienceFilters() {
    var buttons = qsa('.filter-btn');
    var cards = qsa('.timeline-item[data-stream]');

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (btn) { btn.classList.remove('active'); });
        button.classList.add('active');
        var filter = button.dataset.filter;
        cards.forEach(function (card) {
          var streams = card.dataset.stream || '';
          var show = filter === 'all' || streams.indexOf(filter) !== -1;
          card.classList.toggle('is-hidden', !show);
        });
      });
    });
  }

  function initRoleTicker() {
    var roles = ['IT Support Officer', 'Systems Administrator', 'IT Educator', 'Graduate Researcher', 'AI & Voice Privacy Researcher'];
    var ticker = qs('#roleTicker');
    if (!ticker || prefersReducedMotion) return;
    var index = 0;

    setInterval(function () {
      index = (index + 1) % roles.length;
      ticker.style.opacity = '0';
      ticker.style.transform = 'translateY(6px)';
      setTimeout(function () {
        ticker.textContent = roles[index];
        ticker.style.opacity = '1';
        ticker.style.transform = 'translateY(0)';
      }, 170);
    }, 2100);
  }

  function initHeroFocus() {
    var buttons = qsa('.hero-focus button');
    var focusText = qs('#heroFocusText');
    if (!focusText) return;

    var messages = {
      balanced: 'I combine ICT support, teaching, automation, and applied AI research to solve practical technology problems.',
      support: 'I support users, systems, labs, Google Workspace, Windows Server environments, and practical IT workflows.',
      teaching: 'I design beginner-friendly learning experiences for programming, computing, technical training, and digital systems.',
      research: 'I work on applied machine learning research, especially audio profiling and privacy-preserving voice technologies.'
    };

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (btn) { btn.classList.remove('active'); });
        button.classList.add('active');
        focusText.style.opacity = '0';
        setTimeout(function () {
          focusText.textContent = messages[button.dataset.focus] || messages.balanced;
          focusText.style.opacity = '1';
        }, 150);
      });
    });
  }

  function initThemeToggle() {
    var button = qs('.theme-toggle');
    if (!button) return;
    var saved = localStorage.getItem('portfolio-theme');
    if (saved === 'light') document.body.classList.add('light-theme');

    function updateIcon() {
      button.innerHTML = document.body.classList.contains('light-theme') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    updateIcon();
    button.addEventListener('click', function () {
      document.body.classList.toggle('light-theme');
      localStorage.setItem('portfolio-theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
      updateIcon();
    });
  }

  function initTiltCards() {
    if (prefersReducedMotion) return;
    qsa('.tilt-card').forEach(function (card) {
      card.addEventListener('mousemove', function (event) {
        var rect = card.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - 0.5;
        var y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'rotateY(' + (x * 6.5) + 'deg) rotateX(' + (y * -6.5) + 'deg)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = 'rotateY(0deg) rotateX(0deg)';
      });
    });
  }

  function initHeroCanvas() {
    var canvas = qs('#heroCanvas');
    if (!canvas || prefersReducedMotion) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var width = 0;
    var height = 0;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      particles = Array.from({ length: Math.min(82, Math.floor(width / 16)) }, function () {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.38,
          vy: (Math.random() - 0.5) * 0.38,
          r: Math.random() * 1.7 + 0.6
        };
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(function (p, i) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        ctx.fillStyle = 'rgba(55, 240, 194, 0.58)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var dx = p.x - q.x;
          var dy = p.y - q.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 122) {
            ctx.strokeStyle = 'rgba(120, 169, 255,' + (0.13 * (1 - dist / 122)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
  }

  function initCursorGlow() {
    var glow = qs('.cursor-glow');
    if (!glow || prefersReducedMotion) return;
    window.addEventListener('mousemove', function (event) {
      glow.style.left = event.clientX + 'px';
      glow.style.top = event.clientY + 'px';
    }, { passive: true });
  }

  function initBackToTop() {
    var button = qs('.back-to-top');
    if (!button) return;
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSmoothScroll();
    initReveals();
    initActiveNav();
    initCounters();
    initExperienceFilters();
    initRoleTicker();
    initHeroFocus();
    initThemeToggle();
    initTiltCards();
    initHeroCanvas();
    initCursorGlow();
    initBackToTop();
    setScrollProgress();
  });

  window.addEventListener('scroll', setScrollProgress, { passive: true });
})();
