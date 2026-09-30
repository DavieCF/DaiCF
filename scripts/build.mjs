// 靜態網站產生器：data/*.json + src/ → dist/
//
//   node scripts/build.mjs            產生 dist/
//   node scripts/build.mjs --out .    直接輸出到 repo 根目錄（上線用，會覆蓋 index.html）
//
// 輸出的網址結構：
//   /            中文首頁          /en/            英文首頁
//   /2023/       中文 2023 論壇    /en/2023/       英文 2023 論壇（2022、2021 同理）
//   舊網址（Forum2023tw.html、2023ForumpageEN.html…）產生轉址頁，保留 Google 已收錄的連結。
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { resolve, dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const argOut = process.argv.indexOf("--out");
const OUT = resolve(ROOT, argOut > -1 ? process.argv[argOut + 1] : "dist");
const IN_PLACE = OUT === ROOT;

const read = (p) => readFileSync(resolve(ROOT, p), "utf8");
const json = (p) => JSON.parse(read(p));
const SITE = json("data/site.json");
const HOME = json("data/home.json");
const EVENTS = readdirSync(resolve(ROOT, "data/events"))
  .filter((f) => /^\d{4}\.json$/.test(f))
  .map((f) => json(`data/events/${f}`))
  .sort((a, b) => a.id.localeCompare(b.id));
const LATEST = EVENTS[EVENTS.length - 1];
const LANGS = SITE.languages;
const OTHER = { zh: "en", en: "zh" };

// ------------------------------------------------------------ helpers
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// 取某語言的值；沒有就退回另一語言（原文只有一種語言時照原文顯示，不自行翻譯）
const tr = (v, lang) => {
  if (v == null) return "";
  if (typeof v !== "object" || Array.isArray(v)) return v;
  const a = v[lang], b = v[OTHER[lang]];
  const ok = (x) => (Array.isArray(x) ? x.length > 0 : x != null && x !== "");
  return ok(a) ? a : ok(b) ? b : "";
};
const only = (v, lang) => (v && v[lang]) || ""; // 不 fallback
const ui = (k, lang) => tr(SITE.ui[k], lang);
const has = (a) => Array.isArray(a) && a.length > 0;
const pad2 = (n) => String(n).padStart(2, "0");
const ytThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const encPath = (p) => p.split("/").map(encodeURIComponent).join("/");

// 頁面路徑（相對網站根目錄，結尾 /）
const pathOf = (lang, year) => (lang === "zh" ? "" : "en/") + (year ? `${year}/` : "");
const absUrl = (lang, year) => `${SITE.domain}/${pathOf(lang, year)}`;
// 從目前頁面到網站根目錄的相對前綴
const prefixFor = (lang, year) => "../".repeat(pathOf(lang, year).split("/").filter(Boolean).length);

const usedAssets = new Set();
const asset = (p, prefix) => { if (!p) return ""; usedAssets.add(p); return prefix + encPath(p); };
const img = (p, alt, prefix, extra = "") => (p ? `<img src="${asset(p, prefix)}" alt="${esc(alt)}" loading="lazy" decoding="async"${extra ? " " + extra : ""}>` : "");

const link = (key, lang) => (SITE.links[key] || {})[lang] || null;
const allTalks = (ev) => ev.agenda.flatMap((s) => s.talks.map((t) => ({ ...t, session: s })));
const playable = (t) => t.video && t.video.available !== false;
const speakerMap = (ev) => Object.fromEntries(ev.speakers.map((s) => [s.id, s]));
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
// 沒有照片的講者（2021 原站無照片）用中性人像圖示，不放姓名首字
const SPEAKER_PLACEHOLDER = `<span class="speaker-placeholder" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><circle cx="12" cy="8.6" r="3.6"/><path d="M5 20c.6-3.7 3.4-6.1 7-6.1s6.4 2.4 7 6.1"/></svg></span>`;

// ------------------------------------------------------------ 共用區塊
function head({ lang, year, title, description, ogImage, jsonld, noindex }) {
  const p = prefixFor(lang, year);
  const alt = LANGS.map((l) => `  <link rel="alternate" hreflang="${l === "zh" ? "zh-Hant" : "en"}" href="${absUrl(l, year)}">`).join("\n");
  const og = ogImage ? `${SITE.domain}/${encPath(ogImage)}` : "";
  if (ogImage) usedAssets.add(ogImage);
  return `<!DOCTYPE html>
<html lang="${lang === "zh" ? "zh-Hant" : "en"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta name="author" content="${esc(SITE.organizer.name.en)}">
  <meta name="theme-color" content="${SITE.themeColor}">
${Object.entries(SITE.verification || {}).filter(([, v]) => v).map(([name, v]) => `  <meta name="${esc(name)}" content="${esc(v)}">\n`).join("")}  <link rel="canonical" href="${absUrl(lang, year)}">
${alt}
  <link rel="alternate" hreflang="x-default" href="${absUrl("zh", year)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(tr(HOME.brand.name, lang))}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${absUrl(lang, year)}">
  <meta property="og:locale" content="${lang === "zh" ? "zh_TW" : "en_US"}">
${og ? `  <meta property="og:image" content="${og}">\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:image" content="${og}">` : ""}
  <link rel="icon" href="${asset(SITE.favicon, p)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://i.ytimg.com">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@600;700&family=Noto+Sans+TC:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${p}assets/site.css">
${jsonld ? `  <script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script>` : ""}
</head>`;
}

function header({ lang, year, nav }) {
  const p = prefixFor(lang, year);
  const navHtml = nav.map(([id, label]) => `<a href="#${id}">${esc(label)}</a>`).join("");
  const years = EVENTS.slice().reverse()
    .map((e) => `<li><a href="${p}${pathOf(lang, e.id)}"${e.id === year ? ' aria-current="page"' : ""}>${esc(tr(e.title, lang))}</a></li>`).join("");
  return `
<a class="skip-link" href="#main">${lang === "zh" ? "跳到主要內容" : "Skip to content"}</a>
<div class="topbar"><div class="topbar-inner container">
  <span>${esc(ui("organizer", lang))}：<a href="${esc((link("home", lang) || link("home", "zh")).url)}" rel="noopener">${esc(tr(SITE.organizer.name, lang))}</a></span>
  <span><a href="${esc((link("contact", lang) || link("contact", "zh")).url)}" rel="noopener">${esc(ui("contactUs", lang))}</a><span class="topbar-sep">·</span><a href="tel:${esc(SITE.organizer.phone.replace(/[^+\d]/g, ""))}">${esc(SITE.organizer.phone)}</a></span>
</div></div>
<header class="site-header"><div class="header-inner container">
  <a class="brand" href="${p}${pathOf(lang)}">
    <span class="brand-name">${esc(tr(HOME.brand.name, lang))}${only(HOME.brand.tagline, lang) ? `<span class="brand-tagline">${esc(only(HOME.brand.tagline, lang))}</span>` : ""}</span>
  </a>
  <nav class="site-nav" id="site-nav" aria-label="${esc(ui("menu", lang))}">${navHtml}</nav>
  <div class="header-actions">
    <details class="year-menu"><summary><span class="year-current">${esc(year || ui("pastEvents", lang))}</span>${year ? `<span class="year-label">${esc(ui("pastEvents", lang))}</span>` : ""}</summary><ul>${years}</ul></details>
    <a class="lang-toggle" href="${p}${pathOf(OTHER[lang], year)}" hreflang="${OTHER[lang] === "zh" ? "zh-Hant" : "en"}" lang="${OTHER[lang] === "zh" ? "zh-Hant" : "en"}">${esc(ui("langOther", lang))}</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="${esc(ui("menu", lang))}"><span></span><span></span><span></span></button>
  </div>
</div></header>`;
}

function footer({ lang, year }) {
  const p = prefixFor(lang, year);
  const o = SITE.organizer;
  const cols = SITE.footerLinks.map((c) => {
    const heading = c.heading === "organizer" ? tr(o.name, lang) : ui(c.heading.replace("_ui.", ""), lang);
    const items = c.items.map((k) => link(k, lang)).filter(Boolean)
      .map((l) => `<li><a href="${esc(l.url)}" rel="noopener">${esc(l.label)}</a></li>`).join("");
    return items ? `<div class="footer-col"><h3>${esc(heading)}</h3><ul>${items}</ul></div>` : "";
  }).join("");
  const past = EVENTS.slice().reverse().map((e) => `<li><a href="${p}${pathOf(lang, e.id)}">${esc(tr(e.title, lang))}</a></li>`).join("");
  const home = link("home", lang) || link("home", "zh");
  return `
<footer class="site-footer">
  <div class="footer-grid">
    <div class="footer-col footer-brand">
      <a href="${esc(home.url)}" rel="noopener">${img(o.logo, tr(o.name, lang), p, 'class="footer-logo" width="360" height="116"')}</a>
      <h3>${esc(ui("contactUs", lang))}</h3>
      <dl class="footer-contact">
        <dt>${esc(ui("phone", lang))}</dt><dd><a href="tel:${esc(o.phone.replace(/[^+\d]/g, ""))}">${esc(o.phone)}</a></dd>
        <dt>${esc(ui("address", lang))}</dt><dd>${esc(tr(o.address, lang))}</dd>
      </dl>
      <div class="social">${o.social.map((s) => `<a href="${esc(s.url)}" rel="noopener">${esc(s.name)}</a>`).join("")}</div>
    </div>
    ${cols}
    <div class="footer-col"><h3>${esc(ui("pastEvents", lang))}</h3><ul>${past}</ul></div>
  </div>
  <p class="copyright">© ${new Date().getFullYear()} <a href="${esc(home.url)}" rel="noopener">${esc(tr(o.name, lang))}</a> · ${esc(tr(HOME.brand.name, lang))}</p>
</footer>
<script src="${p}assets/site.js" defer></script>
</body>
</html>
`;
}

const sectionHead = (id, num, title, sub) =>
  `<header class="section-head"><span class="section-num">${pad2(num)}</span><h2 id="${id}-title">${esc(title)}</h2>${sub ? `<p class="section-sub">${sub}</p>` : ""}</header>`;

function readMoreSection(lang, num) {
  const cards = SITE.readMore.map((k) => link(k, lang)).filter(Boolean)
    .map((l) => `<li><a class="card" href="${esc(l.url)}" rel="noopener"><h3>${esc(l.label)}</h3>${l.desc ? `<p>${esc(clip(l.desc, 90))}</p>` : ""}<span class="card-arrow" aria-hidden="true">→</span></a></li>`).join("");
  return cards ? `<section id="read-more" class="container" aria-labelledby="read-more-title">${sectionHead("read-more", num, ui("readMore", lang), esc(tr(SITE.organizer.name, lang)))}<ul class="cards">${cards}</ul></section>` : "";
}

function editionCard(e, lang, p) {
  const n = allTalks(e).filter(playable).length;
  // 卡片上的日期統一用 date.start（YYYY/M/D），避免 2022 的兩場時間字串太長造成各卡片不對齊
  const [y, m, d] = e.date.start.slice(0, 10).split("-").map(Number);
  return `<li><a class="edition" href="${p}${pathOf(lang, e.id)}">${img(e.hero.image, tr(e.title, lang), p, 'width="1600" height="900"')}<span class="edition-num">${lang === "zh" ? `第 ${e.edition} 屆` : `Edition ${e.edition}`}</span><h3>${esc(tr(e.title, lang))}</h3><p class="edition-theme">${esc(tr(e.theme, lang))}</p><span class="edition-meta"><time datetime="${esc(e.date.start)}">${y}/${m}/${d}</time> · ${n} ${esc(ui("videos", lang))}</span></a></li>`;
}

// ------------------------------------------------------------ 活動頁
function eventPage(ev, lang) {
  const p = prefixFor(lang, ev.id);
  const sp = speakerMap(ev);
  const talks = allTalks(ev);
  const vids = talks.filter(playable);
  const intro = tr(ev.intro, lang);
  const guests = ev.speakers.filter((s) => s.role === "guest");
  const partners = ev.partners || {};
  const hasPartners = has(partners.organizer) || has(partners.coOrganizer) || has(partners.sponsor);

  const sections = [];
  let num = 0;

  if (has(intro)) {
    const links = SITE.introLinks.map((k) => link(k, lang)).filter(Boolean)
      .map((l) => `<a href="${esc(l.url)}" rel="noopener">${esc(l.label)}</a>`).join("｜");
    sections.push(["intro", ui("intro", lang), `${sectionHead("intro", ++num, ui("intro", lang))}<div class="prose">${intro.map((x) => `<p>${esc(x)}</p>`).join("")}${links ? `<p class="prose-more">${esc(ui("readMore", lang))}：${links}</p>` : ""}</div>`]);
  }

  if (has(ev.speakers)) {
    const card = (s) => {
      const title = tr(s.title, lang), org = tr(s.org, lang), bio = only(s.bio, lang) || "";
      const orgHtml = org ? (s.links.website ? `<a href="${esc(s.links.website)}" rel="noopener">${esc(org)}</a>` : esc(org)) : "";
      return `<li class="speaker" id="speaker-${esc(s.id)}">
        <div class="speaker-photo">${s.photo ? img(s.photo, tr(s.name, lang), p, 'width="96" height="96"') : SPEAKER_PLACEHOLDER}</div>
        <div class="speaker-body">
          <h3 class="speaker-name">${esc(tr(s.name, lang))}</h3>
          ${title ? `<p class="speaker-title">${esc(title)}</p>` : ""}
          ${orgHtml ? `<p class="speaker-org">${orgHtml}</p>` : ""}
          ${bio ? `<details class="speaker-bio"><summary>${esc(ui("bio", lang))}</summary><p>${esc(bio)}</p></details>` : ""}
        </div></li>`;
    };
    const groups = guests.length
      ? [["guests", guests], ["speakers", ev.speakers.filter((s) => s.role !== "guest")]]
      : [[null, ev.speakers]];
    const inner = groups.map(([g, list]) => `<div class="speaker-group">${g ? `<h3 class="speaker-group-title">${esc(ui(g, lang))}</h3>` : ""}<ul class="speakers">${list.map(card).join("")}</ul></div>`).join("");
    sections.push(["speakers", ui("speakers", lang), `${sectionHead("speakers", ++num, ui("speakers", lang))}${inner}`]);
  }

  if (talks.length) {
    const rows = ev.agenda.map((s, i) => {
      const items = s.talks.map((t) => {
        const who = sp[t.speaker];
        const aff = tr(t.affiliation, lang) || [tr(who.title, lang), tr(who.org, lang)].filter(Boolean).join(" ");
        const titleHtml = playable(t) ? `<a href="#video-${esc(t.id)}"><span class="talk-title">${esc(tr(t.title, lang))}</span></a>` : `<span class="talk-title">${esc(tr(t.title, lang))}</span>`;
        const summary = only(t.summary, lang);
        return `<li class="talk-row">${titleHtml}<span class="talk-speaker"><a href="#speaker-${esc(who.id)}">${esc(tr(who.name, lang))}</a>${aff ? ` · ${esc(aff)}` : ""}</span>${summary ? `<details class="talk-summary"><summary>${esc(ui("summary", lang))}</summary><p>${esc(summary)}</p></details>` : ""}</li>`;
      }).join("");
      const time = s.time ? `<div class="session-time"><time>${esc(s.time.start)}</time><span class="dash">–</span><time>${esc(s.time.end)}</time></div>` : "";
      return `<li class="session session-${i + 1}${s.time ? "" : " session-untimed"}">${time}<div class="session-body"><h3>${esc(tr(s.session, lang))}</h3><ul class="talks">${items}</ul></div></li>`;
    }).join("");
    sections.push(["agenda", ui("agenda", lang), `${sectionHead("agenda", ++num, ui("agenda", lang), `<time datetime="${esc(ev.date.start)}">${esc(tr(ev.date.display, lang))}</time>`)}<ol class="agenda">${rows}</ol>`]);
  }

  if (vids.length) {
    const cards = vids.map((t) => {
      const who = sp[t.speaker];
      return `<li class="video" id="video-${esc(t.id)}">
        <button class="video-thumb" type="button" data-yt="${esc(t.video.id)}" aria-label="${esc(tr(t.title, lang))} — ${esc(tr(who.name, lang))}">
          <img src="${ytThumb(t.video.id)}" alt="" loading="lazy" decoding="async" width="480" height="360">
          <span class="play" aria-hidden="true"></span>
        </button>
        <h3 class="video-title">${esc(tr(t.title, lang))}</h3>
        <p class="video-speaker"><a href="#speaker-${esc(who.id)}">${esc(tr(who.name, lang))}</a> · <a href="https://www.youtube.com/watch?v=${esc(t.video.id)}" rel="noopener">YouTube</a></p>
      </li>`;
    }).join("");
    sections.push(["videos", ui("videos", lang), `${sectionHead("videos", ++num, ui("videos", lang), `${vids.length} ${esc(ui("talks", lang))}`)}<p class="notice notice-file" hidden>${esc(ui("fileNotice", lang))}</p><ul class="videos">${cards}</ul>`]);
  }

  if (has(ev.faq)) {
    const items = ev.faq.map((f, i) => `<details class="faq-item"${i === 0 ? " open" : ""}><summary>${esc(tr(f.q, lang))}</summary><div class="faq-answer"><p>${esc(tr(f.a, lang))}</p></div></details>`).join("");
    sections.push(["faq", ui("faq", lang), `${sectionHead("faq", ++num, ui("faq", lang))}<div class="faq">${items}</div>`]);
  }

  if (hasPartners) {
    const group = (key, list) => {
      if (!has(list)) return "";
      const items = list.map((x) => {
        const name = tr(x.name, lang);
        const inner = x.logo ? img(x.logo, name, p) : `<span class="partner-name">${esc(name)}</span>`;
        return `<li>${x.url ? `<a href="${esc(x.url)}" rel="noopener${key === "sponsor" ? " sponsored" : ""}">${inner}</a>` : inner}</li>`;
      }).join("");
      return `<div class="partner-group partner-${key}"><h3>${esc(ui(key, lang))}</h3><ul>${items}</ul></div>`;
    };
    // 合成圖無法個別點擊，圖下方另列各家名稱（取自圖片 alt）與官網連結
    const sponsorLinks = partners.sponsor.map((s) => s.url ? `<a href="${esc(s.url)}" rel="noopener sponsored">${esc(tr(s.name, lang))}</a>` : esc(tr(s.name, lang))).join("、");
    const sponsor = ev.sponsorComposite
      ? `<div class="partner-group partner-sponsor"><h3>${esc(ui("sponsor", lang))}</h3><ul class="composite"><li>${img(ev.sponsorComposite, partners.sponsor.map((s) => tr(s.name, lang)).join("、"), p)}</li></ul><p class="partner-links">${sponsorLinks}</p></div>`
      : group("sponsor", partners.sponsor);
    sections.push(["partners", ui("partners", lang), `${sectionHead("partners", ++num, ui("partners", lang))}<div class="partners">${group("organizer", partners.organizer)}${group("coOrganizer", partners.coOrganizer)}${sponsor}</div>`]);
  }

  const others = EVENTS.filter((e) => e.id !== ev.id).reverse();
  const readMore = readMoreSection(lang, ++num);
  const archive = others.length ? `<section id="archive" class="container" aria-labelledby="archive-title">${sectionHead("archive", ++num, ui("pastEvents", lang))}<ul class="editions">${others.map((e) => editionCard(e, lang, p)).join("")}</ul></section>` : "";

  const organizers = (partners.organizer || []).map((o) => o.url ? `<a href="${esc(o.url)}" rel="noopener">${esc(tr(o.name, lang))}</a>` : esc(tr(o.name, lang))).join("、");
  const fmt = tr(ev.format, lang);
  const heroHtml = `
<section class="hero container" aria-label="${esc(tr(ev.title, lang))}"><div class="hero-inner">
  <div class="hero-media">${img(ev.hero.image, tr(ev.title, lang), p, 'fetchpriority="high" loading="eager"').replace(' loading="lazy"', "")}</div>
  <div class="hero-body">
    <p class="eyebrow">${lang === "zh" ? `第 ${ev.edition} 屆` : `Edition ${ev.edition}`}${fmt ? ` · ${esc(fmt)}` : ""}</p>
    <h1>${esc(tr(ev.title, lang))}</h1>
    ${tr(ev.theme, lang) ? `<p class="hero-theme">${esc(tr(ev.theme, lang))}</p>` : ""}
    <p class="hero-meta"><time datetime="${esc(ev.date.start)}">${esc(tr(ev.date.display, lang))}</time></p>
    <div class="cta">${vids.length ? `<a class="btn btn-primary btn-lg" href="#videos">${esc(ui("watch", lang))}</a>` : ""}${talks.length ? `<a class="btn btn-ghost btn-lg" href="#agenda">${esc(ui("agenda", lang))}</a>` : ""}</div>
    ${organizers ? `<p class="hero-host">${esc(ui("organizer", lang))}：${organizers}</p>` : ""}
  </div>
</div></section>`;

  const desc = clip((has(intro) ? intro[0] : `${tr(ev.title, lang)} ${tr(ev.theme, lang)} ${tr(ev.date.display, lang)}`), 155);
  const jsonld = [
    {
      "@context": "https://schema.org", "@type": "Event",
      name: tr(ev.title, lang), description: desc,
      startDate: ev.date.start, endDate: ev.date.end,
      eventStatus: "https://schema.org/EventScheduled",
      ...(ev.location.type === "online" ? { eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode", location: { "@type": "VirtualLocation", url: absUrl(lang, ev.id) } } : {}),
      image: [`${SITE.domain}/${encPath(ev.hero.ogImage)}`],
      inLanguage: lang === "zh" ? "zh-Hant" : "en",
      organizer: (partners.organizer || []).map((o) => ({ "@type": "Organization", name: tr(o.name, lang), ...(o.url ? { url: o.url } : {}) })),
      performer: ev.speakers.map((s) => ({
        "@type": "Person", name: tr(s.name, lang),
        ...(tr(s.title, lang) ? { jobTitle: tr(s.title, lang) } : {}),
        ...(tr(s.org, lang) ? { affiliation: { "@type": "Organization", name: tr(s.org, lang) } } : {}),
        ...(s.links.website ? { sameAs: [s.links.website] } : {}),
        ...(s.photo ? { image: `${SITE.domain}/${encPath(s.photo)}` } : {}),
      })),
      url: absUrl(lang, ev.id),
    },
    ...(has(ev.faq) ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: ev.faq.map((f) => ({ "@type": "Question", name: tr(f.q, lang), acceptedAnswer: { "@type": "Answer", text: tr(f.a, lang) } })) }] : []),
    ...vids.map((t) => ({
      "@context": "https://schema.org", "@type": "VideoObject",
      name: `${tr(t.title, lang)} — ${tr(sp[t.speaker].name, lang)}`,
      description: `${tr(ev.title, lang)}：${tr(t.title, lang)}（${tr(sp[t.speaker].name, lang)}）`,
      thumbnailUrl: ytThumb(t.video.id),
      embedUrl: `https://www.youtube.com/embed/${t.video.id}`,
      contentUrl: `https://www.youtube.com/watch?v=${t.video.id}`,
      uploadDate: ev.date.start,
    })),
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: tr(HOME.brand.name, lang), item: absUrl(lang) },
        { "@type": "ListItem", position: 2, name: tr(ev.title, lang), item: absUrl(lang, ev.id) },
      ],
    },
  ];

  return head({ lang, year: ev.id, title: `${tr(ev.title, lang)} | ${tr(HOME.brand.name, lang)}`, description: desc, ogImage: ev.hero.ogImage, jsonld })
    + `\n<body id="top">`
    + header({ lang, year: ev.id, nav: sections.map(([id, label]) => [id, label]) })
    + `\n<main id="main">${heroHtml}\n${sections.map(([id, , html]) => `<section id="${id}" class="container" aria-labelledby="${id}-title">${html}</section>`).join("\n")}\n${readMore}\n${archive}\n</main>`
    + footer({ lang, year: ev.id });
}

// ------------------------------------------------------------ 首頁
function homePage(lang) {
  const p = prefixFor(lang);
  const intro = tr(HOME.intro, lang);
  let num = 0;
  const desc = clip(intro[0] || "", 155);
  const hero = `
<section class="hero home-hero container" aria-label="${esc(tr(HOME.brand.name, lang))}"><div class="hero-inner">
  <div class="hero-media">${img(LATEST.hero.image, tr(LATEST.title, lang), p, 'fetchpriority="high" loading="eager"').replace(' loading="lazy"', "")}</div>
  <div class="hero-body">
    ${only(HOME.brand.tagline, lang) ? `<p class="eyebrow">${esc(only(HOME.brand.tagline, lang))}</p>` : ""}
    <h1>${esc(tr(HOME.brand.name, lang))}</h1>
    <p class="hero-theme">${esc(tr(HOME.introTitle, lang))}</p>
    <div class="cta"><a class="btn btn-primary btn-lg" href="${p}${pathOf(lang, LATEST.id)}">${esc(tr(LATEST.title, lang))}</a><a class="btn btn-ghost btn-lg" href="#editions">${esc(ui("pastEvents", lang))}</a></div>
    <p class="hero-host">${esc(ui("organizer", lang))}：<a href="${esc((link("home", lang) || link("home", "zh")).url)}" rel="noopener">${esc(tr(SITE.organizer.name, lang))}</a></p>
  </div>
</div></section>`;
  const introLinks = SITE.introLinks.map((k) => link(k, lang)).filter(Boolean).map((l) => `<a href="${esc(l.url)}" rel="noopener">${esc(l.label)}</a>`).join("｜");
  const sections = [
    ["intro", ui("intro", lang), `${sectionHead("intro", ++num, tr(HOME.introTitle, lang))}<div class="prose">${intro.map((x) => `<p>${esc(x)}</p>`).join("")}${introLinks ? `<p class="prose-more">${esc(ui("readMore", lang))}：${introLinks}</p>` : ""}</div>`],
    ["editions", ui("pastEvents", lang), `${sectionHead("editions", ++num, ui("pastEvents", lang))}<ul class="editions">${EVENTS.slice().reverse().map((e) => editionCard(e, lang, p)).join("")}</ul>`],
  ];
  if (has(HOME.highlights)) {
    const items = HOME.highlights.map((h, i) => {
      const im = img(h.image, `${ui("highlights", lang)} ${i + 1}`, p);
      return `<li>${h.link ? `<a href="${esc(h.link)}" rel="noopener">${im}</a>` : im}</li>`;
    }).join("");
    sections.push(["highlights", ui("highlights", lang), `${sectionHead("highlights", ++num, ui("highlights", lang))}<ul class="highlights">${items}</ul>`]);
  }
  const jsonld = [
    { "@context": "https://schema.org", "@type": "WebSite", name: tr(HOME.brand.name, lang), url: absUrl(lang), inLanguage: lang === "zh" ? "zh-Hant" : "en", publisher: { "@type": "Organization", name: tr(SITE.organizer.name, lang), url: SITE.organizer.url } },
    { "@context": "https://schema.org", "@type": "Organization", name: tr(SITE.organizer.name, lang), url: SITE.organizer.url, logo: `${SITE.domain}/${SITE.organizer.logo}`, telephone: SITE.organizer.phone, address: tr(SITE.organizer.address, lang), sameAs: SITE.organizer.social.map((s) => s.url) },
  ];
  usedAssets.add(SITE.organizer.logo);
  return head({ lang, year: null, title: `${tr(HOME.brand.name, lang)}｜${tr(HOME.introTitle, lang)}`, description: desc, ogImage: LATEST.hero.ogImage, jsonld })
    + `\n<body id="top" class="page-home">`
    + header({ lang, year: null, nav: sections.map(([id, label]) => [id, label]) })
    + `\n<main id="main">${hero}\n${sections.map(([id, , html]) => `<section id="${id}" class="container" aria-labelledby="${id}-title">${html}</section>`).join("\n")}\n${readMoreSection(lang, ++num)}\n</main>`
    + footer({ lang, year: null });
}

function notFoundPage() {
  const lang = "zh";
  return head({ lang, year: null, title: `404 | ${tr(HOME.brand.name, lang)}`, description: "", noindex: true }).replace(/href="(?!https?:|#)([^"]*)"/g, 'href="/$1"')
    + `\n<body>` + header({ lang, year: null, nav: [] }).replace(/href="(?!https?:|#|tel:)([^"]*)"/g, 'href="/$1"')
    + `\n<main id="main" class="container not-found"><h1>404</h1><p>${esc(ui("notFound", "zh"))} · ${esc(ui("notFound", "en"))}</p><p><a class="btn btn-primary" href="/">${esc(tr(HOME.brand.name, "zh"))}</a> <a class="btn btn-ghost" href="/en/">${esc(tr(HOME.brand.name, "en"))}</a></p></main>`
    + footer({ lang, year: null }).replace(/(href|src)="(?!https?:|#|tel:)([^"]*)"/g, '$1="/$2"');
}

// ------------------------------------------------------------ 舊網址轉址
const LEGACY = {
  "indextw.html": pathOf("zh"),
  "Forum2021.html": pathOf("en", "2021"), "Forum2021tw.html": pathOf("zh", "2021"),
  "Forum2022.html": pathOf("en", "2022"), "Forum2022tw.html": pathOf("zh", "2022"),
  "Forum2023.html": pathOf("en", "2023"), "Forum2023tw.html": pathOf("zh", "2023"),
  "2022ForumpageEN.html": pathOf("en", "2022"), "2022ForumpageTW.html": pathOf("zh", "2022"),
  "2023ForumpageEN.html": pathOf("en", "2023"), "2023ForumpageTW.html": pathOf("zh", "2023"),
  "EvaSelect2024.html": pathOf("zh"),
};
const redirectPage = (to) => `<!DOCTYPE html>
<html lang="zh-Hant"><head><meta charset="utf-8"><title>${esc(tr(HOME.brand.name, "zh"))}</title>
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${SITE.domain}/${to}">
<meta http-equiv="refresh" content="0; url=./${to}">
<script>location.replace("./${to}" + location.hash);</script>
</head><body><p><a href="./${to}">${SITE.domain}/${to}</a></p></body></html>
`;

// ------------------------------------------------------------ 輸出
function write(rel, content) {
  const f = join(OUT, rel);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, content, "utf8");
}

if (!IN_PLACE && existsSync(OUT)) for (const d of readdirSync(OUT)) rmSync(join(OUT, d), { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const pages = [];
for (const lang of LANGS) {
  write(`${pathOf(lang)}index.html`, homePage(lang));
  pages.push([lang, null]);
  for (const ev of EVENTS) {
    write(`${pathOf(lang, ev.id)}index.html`, eventPage(ev, lang));
    pages.push([lang, ev.id]);
  }
}
write("404.html", notFoundPage());
for (const [from, to] of Object.entries(LEGACY)) write(from, redirectPage(to));

// assets
write("assets/site.css", ["base.css", "theme.css", "site.css"].map((f) => read(`src/styles/${f}`)).join("\n"));
write("assets/site.js", read("src/site.js"));
if (!IN_PLACE) {
  for (const a of usedAssets) {
    const src = resolve(ROOT, a);
    if (!existsSync(src)) { console.warn("缺少圖片：", a); continue; }
    mkdirSync(dirname(join(OUT, a)), { recursive: true });
    copyFileSync(src, join(OUT, a));
  }
  if (existsSync(resolve(ROOT, "CNAME"))) copyFileSync(resolve(ROOT, "CNAME"), join(OUT, "CNAME"));
}

// sitemap / robots
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map(([lang, year]) => `  <url>
    <loc>${absUrl(lang, year)}</loc>
    <lastmod>${today}</lastmod>
${LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l === "zh" ? "zh-Hant" : "en"}" href="${absUrl(l, year)}"/>`).join("\n")}
    <xhtml:link rel="alternate" hreflang="x-default" href="${absUrl("zh", year)}"/>
  </url>`).join("\n")}
</urlset>
`;
write("sitemap.xml", sitemap);
if (SITE.indexNowKey) write(`${SITE.indexNowKey}.txt`, SITE.indexNowKey);
// AI 爬蟲規則：開放 AI 搜尋（AEO，2026-09-30），訓練爬蟲沿用 FlightPath 範本封鎖（2026-09-10）
// /docs/ 放舊站檔案與文件；Actions 部署 dist/ 時本來就不公開，這行是給「從分支根目錄發布」時的保險（2026-09-30）
write("robots.txt", `User-agent: *\nAllow: /\nDisallow: /docs/\n\nSitemap: ${SITE.domain}/sitemap.xml\n\n${read("scripts/robots-ai.txt")}`);

// 圖片最佳化（需要 Python + Pillow；沒有的話保留原圖）
if (!IN_PLACE) {
  const { spawnSync } = await import("node:child_process");
  const r = spawnSync("python", [resolve(ROOT, "scripts/optimize-images.py"), OUT], { encoding: "utf8" });
  if (r.status === 0) process.stdout.write(r.stdout);
  else console.warn("略過圖片最佳化：", String(r.stderr || r.error || "").trim().split(String.fromCharCode(10)).slice(-3).join(" "));
}

const size = (dir) => readdirSync(dir, { withFileTypes: true }).reduce((n, d) => n + (d.isDirectory() ? size(join(dir, d.name)) : statSync(join(dir, d.name)).size), 0);
console.log(`輸出到 ${OUT}`);
console.log(`頁面 ${pages.length}、轉址 ${Object.keys(LEGACY).length}、圖片 ${usedAssets.size}${IN_PLACE ? "" : `、總大小 ${(size(OUT) / 1048576).toFixed(1)} MB`}`);
