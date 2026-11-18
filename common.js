/* ===== 全ページ共通JS =====
   ・ナビゲーションバー、フッター、背景パーティクルを全ページに差し込みます
   ・イベント日の色替え（data-theme）を行います
   ・各ページのJSから使う共通の道具（el, loadSiteData, showLoadError, DEPARTMENTS）を用意します
   メニューの項目や著作権表示を変えたいときは、このファイルの先頭を編集してください。 */
"use strict";

const SITE_NAME = "静岡大学吹奏楽団";

const NAV_LINKS = [
  ["index.html", "トップページ"],
  ["org.html", "組織図"],
  ["file.html", "資料・データ"],
  ["schedule.html", "スケジュール"],
];

// 部署名（資料ページ・スケジュールページで使います）
const DEPARTMENTS = ["広報部", "制作・管理部", "許可申請部", "その他"];

// イベント日の設定（theme は colors.css の data-theme と同じ綴り）
// start / end は "月-日"。海の日のように「第n○曜日」の場合は month・nth・dayOfWeek（0=日〜6=土）で指定
const EVENTS = [
  { theme: "newyear", start: "01-01", end: "01-03" },
  { theme: "setubun", start: "02-03", end: "02-03" },
  { theme: "valentine", start: "02-14", end: "02-14" },
  { theme: "hinamaturi", start: "03-03", end: "03-03" },
  { theme: "whiteday", start: "03-14", end: "03-14" },
  { theme: "tanabata", start: "07-07", end: "07-07" },
  { theme: "uminohi", month: 7, nth: 3, dayOfWeek: 1 },
  { theme: "yamanohi", start: "08-11", end: "08-11" },
  { theme: "shuubun", start: "09-23", end: "09-23" },
  { theme: "halloween", start: "10-31", end: "10-31" },
  { theme: "christmas", start: "12-24", end: "12-25" },
  { theme: "newyear", start: "12-31", end: "12-31" },
];

/* ===== 共通の道具 ===== */

// 要素を作る（文字は textContent で入れるので、特殊な文字を含んでも安全です）
function el(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

// site_data.json を読み込む
function loadSiteData() {
  return fetch("site_data.json", { cache: "no-store" }).then((response) => {
    if (!response.ok) throw new Error("site_data.json を読み込めませんでした");
    return response.json();
  });
}

// 読み込み失敗のメッセージを表示する
function showLoadError(container, message = "データの読み込みに失敗しました。しばらくしてからもう一度お試しください。") {
  const error = el("p", "load-error", message);
  error.setAttribute("role", "alert");
  container.replaceChildren(error);
}

/* ===== ナビゲーションバー・フッター ===== */

function createNavbar() {
  const nav = el("nav", "navbar");

  const toggle = el("button", "menu-toggle");
  toggle.type = "button";
  toggle.setAttribute("aria-label", "メニューを開く/閉じる");
  toggle.setAttribute("aria-expanded", "false");
  toggle.append(el("span"), el("span"), el("span"));

  const links = el("div", "nav-links");
  const currentPage = location.pathname.split("/").pop() || "index.html";
  NAV_LINKS.forEach(([href, label]) => {
    const link = el("a", "", label);
    link.href = href;
    if (href === currentPage) link.setAttribute("aria-current", "page");
    links.append(link);
  });

  const setOpen = (isOpen) => {
    links.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  };
  toggle.addEventListener("click", () => setOpen(!links.classList.contains("open")));
  links.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  nav.append(toggle, links);
  return nav;
}

function createFooter() {
  const footer = el("footer");
  footer.append(el("p", "", `© 2026 ${SITE_NAME}. All Rights Reserved.`));
  return footer;
}

/* ===== 背景パーティクル ===== */

function startParticles() {
  const canvas = el("canvas");
  canvas.id = "particle-bg";
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d");
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", resize);
  resize();

  const particles = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 4,
    speedX: Math.random() * 0.3 - 0.15,
    speedY: Math.random() * 0.3 - 0.15,
  }));

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(animate);
  };
  animate();
}

/* ===== イベント日の色替え ===== */

// 今日に当てはまるイベントの theme を返す（なければ null）
function findEventTheme(today) {
  const month = today.getMonth() + 1;
  const monthDay = month * 100 + today.getDate();
  const toNumber = (text) => Number(text.replace("-", ""));

  const found = EVENTS.find((event) => {
    if (event.start) {
      const start = toNumber(event.start);
      const end = toNumber(event.end);
      return start <= end
        ? monthDay >= start && monthDay <= end
        : monthDay >= start || monthDay <= end; // 年をまたぐ期間
    }
    return (
      month === event.month &&
      today.getDay() === event.dayOfWeek &&
      Math.ceil(today.getDate() / 7) === event.nth
    );
  });
  return found ? found.theme : null;
}

function applyEventTheme() {
  // 動作確認のときは new Date("2026-12-24") のように日付を入れます（確認後は new Date() に戻す）
  const today = new Date();
  const theme = findEventTheme(today);
  if (theme) {
    document.documentElement.setAttribute("data-theme", theme);
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

/* ===== 実行 ===== */
// このファイルは defer 付きで読み込むので、ページの読み込み後に実行されます
applyEventTheme();
startParticles();
document.body.prepend(createNavbar());
document.body.append(createFooter());
