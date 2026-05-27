/* ===== 共通JS ===== */
document.addEventListener('DOMContentLoaded', function() {

/* ハンバーガーメニュー */
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links'); 

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });
  }

    /* 背景パーティクルアニメーション */
    const canvas = document.getElementById('particle-bg');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const num = 80;
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();
    for (let i = 0; i < num; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 4,
            speedX: Math.random() * 0.3 - 0.15,
            speedY: Math.random() * 0.3 - 0.15,
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    
    animate();
});

/* イベントカラー変更 */
document.addEventListener("DOMContentLoaded", () => {

  const today = new Date("");/*Date("2020-01-01");のように日付を入力すると変更が確認可能 */
  today.setHours(0,0,0,0);
  const y = today.getFullYear();

  const makeDate = (mmdd, nextYear = false) => {
    const [m, d] = mmdd.split("-").map(Number);
    return new Date(nextYear ? y + 1 : y, m - 1, d);
  };

  const inRange = (start, end) => {
    let s = makeDate(start);
    let e = makeDate(end);
    s.setHours(0,0,0,0);
    e.setHours(23,59,59,999);
    if (e < s) e = makeDate(end, true);
    return today >= s && today <= e;
  };

  const isNthDayOfWeek = (month, nth, dayOfWeek) => {
    const currentMonth = today.getMonth() + 1;
    const currentDate = today.getDate();
    const currentDay = today.getDay();
    if (currentMonth !== month || currentDay !== dayOfWeek) {
      return false;
    }
    const currentNth = Math.ceil(currentDate / 7);
    return currentNth === nth;
  };

  const events = [
    { theme: "newyear",  start: "01-01", end: "01-03" },
    { theme: "setubun",  start: "02-03", end: "02-03" },
    { theme: "valentine",  start: "02-14", end: "02-14" },
    { theme: "hinamaturi",  start: "03-03", end: "03-03" },
    { theme: "whiteday",  start: "03-14", end: "03-14" },
    { theme: "tanabata",  start: "07-07", end: "07-07" },
    { theme: "uminohi",  month: 7,  nth: 3, dayOfWeek: 1 },
    { theme: "yamanohi",  start: "08-11", end: "08-11" },
    { theme: "shuubun",  start: "09-23", end: "09-23" },
    { theme: "halloween",  start: "10-31", end: "10-31" },
    { theme: "christmas",  start: "12-24", end: "12-25" },
    { theme: "newyear",  start: "12-31", end: "12-31" },
  ];

  for (const ev of events) {
    if (ev.start && ev.end) {
      if (inRange(ev.start, ev.end)) {
        document.documentElement.setAttribute("data-theme", ev.theme);
        return;
      }
    } 
    else if (ev.month && ev.nth && ev.dayOfWeek !== undefined) {
      if (isNthDayOfWeek(ev.month, ev.nth, ev.dayOfWeek)) {
        document.documentElement.setAttribute("data-theme", ev.theme);
        return;
      }
    }
  }

  document.documentElement.removeAttribute("data-theme");
});
