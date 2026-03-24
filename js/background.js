// Animated starfield + floating particles background
(function () {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    const stars = [];
    const particles = [];
    const STAR_COUNT = 120;
    const PARTICLE_COUNT = 25;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function initStars() {
        stars.length = 0;
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 1.8 + 0.3,
                speed: Math.random() * 0.3 + 0.05,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.02 + 0.005
            });
        }
    }

    function initParticles() {
        particles.length = 0;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(createParticle());
        }
    }

    function createParticle() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.4,
            speedY: (Math.random() - 0.5) * 0.3 - 0.1,
            opacity: Math.random() * 0.15 + 0.03,
            hue: Math.random() > 0.5 ? 190 : 270 // cyan or purple
        };
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        // Stars
        for (const s of stars) {
            s.twinkle += s.twinkleSpeed;
            const alpha = 0.3 + Math.sin(s.twinkle) * 0.3;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(220, 230, 255, ${alpha})`;
            ctx.fill();

            s.y += s.speed;
            if (s.y > height + 5) {
                s.y = -5;
                s.x = Math.random() * width;
            }
        }

        // Floating particles
        for (const p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.opacity})`;
            ctx.fill();

            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < -10 || p.x > width + 10 || p.y < -10 || p.y > height + 10) {
                Object.assign(p, createParticle());
                // Reset to edge
                if (Math.random() > 0.5) {
                    p.y = height + 5;
                } else {
                    p.x = Math.random() > 0.5 ? -5 : width + 5;
                }
            }
        }

        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
        resize();
        initStars();
    });

    resize();
    initStars();
    initParticles();
    draw();
})();
