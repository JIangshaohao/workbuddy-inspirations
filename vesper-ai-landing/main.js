/* Intelligence Designed To Evolve — 交互脚本
   1. 统计数字滚动（IntersectionObserver 触发一次，easeOutCubic）
   2. 移动端菜单（遮罩 / Escape / 链接点击 / 窗口变宽时关闭）
*/
(function () {
  "use strict";

  var doc = document;
  var body = doc.body;

  /* ---------- 1. 数字滚动 ---------- */

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function countUp(el, index) {
    var target = parseFloat(el.getAttribute("data-target"));
    var decimals = parseInt(el.getAttribute("data-decimals"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1500 + index * 80;
    var startDelay = 480 + index * 90;

    setTimeout(function () {
      var start = null;

      function frame(now) {
        if (start === null) start = now;
        var elapsed = now - start;
        var progress = Math.min(elapsed / duration, 1);
        var value = target * easeOutCubic(progress);
        el.textContent = value.toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);
    }, startDelay);
  }

  var values = Array.prototype.slice.call(doc.querySelectorAll(".stat-value"));

  if ("IntersectionObserver" in window && values.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        observer.unobserve(el);
        countUp(el, values.indexOf(el));
      });
    }, { threshold: 0.25 });

    values.forEach(function (el) { observer.observe(el); });
  } else {
    // 兜底：直接显示终值
    values.forEach(function (el) {
      var decimals = parseInt(el.getAttribute("data-decimals"), 10) || 0;
      el.textContent = parseFloat(el.getAttribute("data-target")).toFixed(decimals) +
        (el.getAttribute("data-suffix") || "");
    });
  }

  /* ---------- 2. 移动端菜单 ---------- */

  var burger = doc.getElementById("menu-toggle");
  var overlay = doc.getElementById("menu-overlay");
  var sheet = doc.getElementById("mobile-menu");

  function isOpen() {
    return body.classList.contains("menu-open");
  }

  function setMenu(open) {
    body.classList.toggle("menu-open", open);
    if (burger) {
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    if (overlay) overlay.hidden = !open;
    if (sheet) sheet.hidden = !open;
  }

  if (burger && overlay && sheet) {
    burger.addEventListener("click", function () {
      setMenu(!isOpen());
    });

    overlay.addEventListener("click", function () {
      setMenu(false);
    });

    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) setMenu(false);
    });

    sheet.addEventListener("click", function (event) {
      var link = event.target.closest ? event.target.closest("a") : null;
      if (link) setMenu(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 720 && isOpen()) setMenu(false);
    });
  }
})();
