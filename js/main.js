// WCIF 2026 - shared scripts
document.addEventListener('DOMContentLoaded', function () {
  // header scroll state
  var header = document.querySelector('.site-header');
  var onScroll = function () {
    if (window.scrollY > 10) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  // scroll reveal
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
  }

  // accordion
  document.querySelectorAll('.acc-head').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.parentElement.classList.toggle('open');
    });
  });

  // speaker image fallback (initials)
  document.querySelectorAll('.speaker-photo img').forEach(function (img) {
    img.addEventListener('error', function () {
      var name = img.getAttribute('alt') || 'WCIF';
      var wrap = img.parentElement;
      img.remove();
      var fb = document.createElement('div');
      fb.className = 'ph-fallback';
      fb.textContent = name.charAt(0);
      wrap.appendChild(fb);
    });
  });
});
