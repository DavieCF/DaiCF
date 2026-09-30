/* 前端只做互動，內容全部在靜態 HTML 裡（搜尋引擎直接讀得到）。 */
(function () {
  var isFile = location.protocol === "file:";
  var body = document.body;

  // 手機選單
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }
  document.querySelectorAll(".site-nav a").forEach(function (a) {
    a.addEventListener("click", function () { body.classList.remove("nav-open"); });
  });

  // 年份選單：點外面就關
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".year-menu")) {
      document.querySelectorAll(".year-menu[open]").forEach(function (d) { d.removeAttribute("open"); });
    }
  });

  // 捲動時 header 陰影
  var onScroll = function () { body.classList.toggle("scrolled", window.scrollY > 24); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // 目前區塊高亮
  if ("IntersectionObserver" in window) {
    var links = document.querySelectorAll(".site-nav a[href^='#']");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { io.observe(s); });
  }

  // 影片：點縮圖才載入 YouTube。
  // YouTube 要求嵌入頁送出 Referer，否則顯示「錯誤 153」，所以 iframe 一定要帶 referrerpolicy。
  // file:// 開啟時瀏覽器不送 Referer，改成另開 YouTube。
  if (isFile) {
    document.querySelectorAll(".notice-file").forEach(function (n) { n.hidden = false; });
  }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".video-thumb");
    if (!btn) return;
    var id = btn.getAttribute("data-yt");
    if (isFile) { window.open("https://www.youtube.com/watch?v=" + id, "_blank", "noopener"); return; }
    var f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
    f.title = btn.getAttribute("aria-label") || "";
    f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    f.referrerPolicy = "strict-origin-when-cross-origin";
    f.allowFullscreen = true;
    var wrap = document.createElement("div");
    wrap.className = "video-frame";
    wrap.appendChild(f);
    btn.replaceWith(wrap);
  });
})();
