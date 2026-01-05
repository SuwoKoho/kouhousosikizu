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
    if (!canvas) return;
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

  const today = new Date();
  const y = today.getFullYear();

  const makeDate = (mmdd, nextYear = false) => {
    const [m, d] = mmdd.split("-").map(Number);
    return new Date(nextYear ? y + 1 : y, m - 1, d);
  };

  const inRange = (start, end) => {
    let s = makeDate(start);
    let e = makeDate(end);
    if (e < s) e = makeDate(end, true);
    return today >= s && today <= e;
  };

  const events = [
    { theme: "valentineday",  start: "2-14", end: "2-14" },
    { theme: "whiteday",  start: "3-14", end: "3-14" },
    { theme: "aprilfool",    start: "4-1", end: "4-1" },
    { theme: "childrensday",  start: "5-5", end: "5-5" },
    { theme: "mitei",  start: "6-1", end: "6-1" },
    { theme: "tanabata",    start: "7-7", end: "7-7" },
    { theme: "mitei",  start: "8-1", end: "8-1" },
    { theme: "tsukimi",  start: "9-1", end: "9-1" },
    { theme: "mitei",    start: "10-1", end: "10-1" },
    { theme: "halloween",  start: "10-31", end: "10-31" },
    { theme: "christmas",  start: "12-24", end: "12-25" },
    { theme: "newyear",    start: "12-31", end: "01-03" },
  ];

  for (const ev of events) {
    if (inRange(ev.start, ev.end)) {
      document.documentElement.setAttribute("data-theme", ev.theme);
      return;
    }
  }

  document.documentElement.removeAttribute("data-theme");
});
