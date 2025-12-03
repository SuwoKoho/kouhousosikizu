/* ===== [共通アクション設定] (common.js) ===== */
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
            size: Math.random() * 2,
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
