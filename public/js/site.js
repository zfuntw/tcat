(function () {
  var header = document.getElementById('siteHeader');
  var hasHero = !!document.querySelector('.hero, .page-head');
  if (!hasHero) header.classList.add('inner');
  function onScroll() {
    header.classList.toggle('solid', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var toggle = document.getElementById('navToggle');
  toggle.addEventListener('click', function () {
    var open = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open);
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  // 分享按鈕
  var url = encodeURIComponent(location.href.split('#')[0]);
  document.querySelectorAll('[data-share]').forEach(function (a) { a.href += url; });
  var copy = document.querySelector('[data-copy]');
  if (copy) copy.addEventListener('click', function () {
    navigator.clipboard.writeText(location.href).then(function () { copy.textContent = '已複製 ✓'; });
  });

  // 表單送出成功 → 送出轉換事件
  if (document.querySelector('[data-lead]')) {
    if (window.fbq) fbq('track', 'Lead');
    if (window.gtag) gtag('event', 'generate_lead');
    if (window.dataLayer) dataLayer.push({ event: 'contact_form_submit' });
    // 移除 ?sent=1，避免重新整理時重複計算轉換
    history.replaceState(null, '', location.pathname);
  }
})();
