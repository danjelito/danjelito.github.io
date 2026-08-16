/* Site behaviour — theme toggle, mobile nav, scroll reveal. No dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;
  var MOBILE_BP = 700;

  function storedTheme() {
    var t = localStorage.getItem('theme');
    return (t === 'dark' || t === 'light') ? t : null;
  }

  function systemDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function apply(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    var labels = document.querySelectorAll('.theme-label');
    for (var i = 0; i < labels.length; i++) {
      labels[i].textContent = theme === 'dark' ? 'light' : 'dark';
    }
  }

  // Reconcile with the FOUC-avoidance value set in <head>.
  apply(storedTheme() || (systemDark() ? 'dark' : 'light'));

  root.className = (root.className + ' js').trim();

  document.addEventListener('DOMContentLoaded', function () {
    var themeBtn = document.querySelector('.nav__theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', next);
        apply(next);
      });
    }

    var toggle = document.querySelector('.nav__toggle');
    var nav = document.getElementById('site-nav');
    if (toggle && nav) {
      function sync() {
        if (window.innerWidth <= MOBILE_BP) {
          if (!nav.hasAttribute('hidden')) nav.setAttribute('hidden', '');
        } else if (nav.hasAttribute('hidden')) {
          nav.removeAttribute('hidden');
        }
      }
      toggle.addEventListener('click', function () {
        if (nav.hasAttribute('hidden')) {
          nav.removeAttribute('hidden');
          toggle.setAttribute('aria-expanded', 'true');
        } else {
          nav.setAttribute('hidden', '');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
      window.addEventListener('resize', sync);
      sync();
    }

    var items = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && items.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
      for (var i = 0; i < items.length; i++) io.observe(items[i]);
    } else {
      for (var j = 0; j < items.length; j++) items[j].classList.add('is-visible');
    }
  });
})();
