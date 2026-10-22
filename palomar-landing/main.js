/**
 * Palomar Landing — 交互脚本
 * 职责：导航栏滚动态、移动端菜单开关、滚动锁定
 */
(function () {
  'use strict';

  var navbar = document.getElementById('navbar');
  var toggle = document.getElementById('menu-toggle');
  var menu = document.getElementById('mobile-menu');

  /* -------------------- 导航栏滚动态（scrollY > 20） -------------------- */

  function onScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ------------------------- 移动端菜单开关 ------------------------- */

  function setMenu(open) {
    toggle.classList.toggle('is-open', open);
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  toggle.addEventListener('click', function () {
    setMenu(!menu.classList.contains('is-open'));
  });

  // 点击菜单中任意项后关闭
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      setMenu(false);
    }
  });

  // ESC 关闭
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  /* ----------------------- 视频自动播放兜底 ----------------------- */

  var video = document.getElementById('hero-video');
  if (video) {
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        // 某些浏览器需要用户手势后再试一次
        video.play().catch(function () {});
      });
    }
  }
})();
