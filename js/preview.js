// Mini mountain scene preview for Mountain Explorer card
(function () {
    const canvas = document.getElementById('mountain-preview');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    let frame = 0;
    let playerX = 80;
    let playerY = 0;
    let playerVY = 0;
    let onGround = true;
    let direction = 1;
    let jumpTimer = 0;

    // Platforms
    const platforms = [
        { x: 20, y: 170, w: 100 },
        { x: 150, y: 140, w: 80 },
        { x: 260, y: 110, w: 90 },
        { x: 170, y: 75, w: 70 },
        { x: 50, y: 45, w: 100 },
    ];

    // Clouds
    const clouds = [
        { x: 50, y: 25, w: 60 },
        { x: 200, y: 15, w: 45 },
        { x: 320, y: 35, w: 55 },
    ];

    // Snow particles
    const snow = [];
    for (let i = 0; i < 30; i++) {
        snow.push({
            x: Math.random() * W,
            y: Math.random() * H,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.5 + 0.2,
            drift: Math.random() * 0.3 - 0.15
        });
    }

    playerY = platforms[0].y - 16;

    function drawSky() {
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#1a1a3e');
        grad.addColorStop(0.5, '#2d1b4e');
        grad.addColorStop(1, '#4a2c6e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
    }

    function drawMountains() {
        // Far mountains
        ctx.fillStyle = '#1e1540';
        ctx.beginPath();
        ctx.moveTo(0, H);
        ctx.lineTo(0, 120);
        ctx.lineTo(60, 60);
        ctx.lineTo(120, 100);
        ctx.lineTo(180, 40);
        ctx.lineTo(240, 90);
        ctx.lineTo(300, 50);
        ctx.lineTo(360, 80);
        ctx.lineTo(W, 100);
        ctx.lineTo(W, H);
        ctx.fill();

        // Near mountains
        ctx.fillStyle = '#2a1f50';
        ctx.beginPath();
        ctx.moveTo(0, H);
        ctx.lineTo(0, 150);
        ctx.lineTo(80, 90);
        ctx.lineTo(160, 130);
        ctx.lineTo(250, 70);
        ctx.lineTo(340, 120);
        ctx.lineTo(W, 90);
        ctx.lineTo(W, H);
        ctx.fill();
    }

    function drawClouds() {
        for (const c of clouds) {
            const cx = (c.x + frame * 0.15) % (W + c.w) - c.w / 2;
            ctx.fillStyle = 'rgba(200, 200, 255, 0.06)';
            ctx.beginPath();
            ctx.ellipse(cx, c.y, c.w / 2, 10, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawPlatforms() {
        for (const p of platforms) {
            // Rock body
            ctx.fillStyle = '#3d3555';
            roundRect(ctx, p.x, p.y, p.w, 14, 4);
            ctx.fill();

            // Top surface
            ctx.fillStyle = '#6b5c8a';
            roundRect(ctx, p.x, p.y, p.w, 5, 3);
            ctx.fill();

            // Snow on top
            ctx.fillStyle = 'rgba(220, 230, 255, 0.3)';
            roundRect(ctx, p.x + 3, p.y - 1, p.w - 6, 3, 2);
            ctx.fill();
        }
    }

    function drawPlayer(x, y) {
        // Body
        ctx.fillStyle = '#ff6b35';
        roundRect(ctx, x - 6, y - 14, 12, 14, 3);
        ctx.fill();

        // Head
        ctx.fillStyle = '#ffcc99';
        ctx.beginPath();
        ctx.arc(x, y - 18, 5, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#333';
        ctx.fillRect(x - 3 + (direction > 0 ? 1 : 0), y - 19, 1.5, 1.5);
        ctx.fillRect(x + 1 + (direction > 0 ? 1 : 0), y - 19, 1.5, 1.5);
    }

    function drawSnow() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (const s of snow) {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();

            s.y += s.speed;
            s.x += s.drift + Math.sin(frame * 0.02 + s.x) * 0.15;
            if (s.y > H + 5) {
                s.y = -5;
                s.x = Math.random() * W;
            }
        }
    }

    function drawCoins() {
        const t = frame * 0.05;
        // A few floating coins
        const coins = [
            { x: 185, y: 125 },
            { x: 290, y: 95 },
            { x: 80, y: 30 },
        ];
        for (const c of coins) {
            const bob = Math.sin(t + c.x) * 3;
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(c.x, c.y + bob, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(c.x, c.y + bob, 7, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    // Simple AI: walk and jump between platforms
    let currentPlatform = 0;
    let targetPlatform = 1;

    function updatePlayer() {
        const target = platforms[targetPlatform];
        const targetX = target.x + target.w / 2;

        // Move toward target
        const dx = targetX - playerX;
        direction = dx > 0 ? 1 : -1;

        if (Math.abs(dx) > 3) {
            playerX += direction * 1.2;
        }

        // Jump when near target platform x
        jumpTimer++;
        if (onGround && jumpTimer > 30 && Math.abs(dx) < 40) {
            playerVY = -4.5;
            onGround = false;
            jumpTimer = 0;
        }

        // Gravity
        if (!onGround) {
            playerVY += 0.18;
            playerY += playerVY;
        }

        // Check platform collision
        for (let i = 0; i < platforms.length; i++) {
            const p = platforms[i];
            if (playerX > p.x && playerX < p.x + p.w &&
                playerY >= p.y - 16 && playerY <= p.y &&
                playerVY >= 0) {
                playerY = p.y - 16;
                playerVY = 0;
                onGround = true;
                currentPlatform = i;

                if (i === targetPlatform) {
                    targetPlatform = (targetPlatform + 1) % platforms.length;
                }
                break;
            }
        }

        // Reset if fallen
        if (playerY > H + 20) {
            currentPlatform = 0;
            targetPlatform = 1;
            playerX = platforms[0].x + platforms[0].w / 2;
            playerY = platforms[0].y - 16;
            playerVY = 0;
            onGround = true;
        }
    }

    function animate() {
        frame++;
        ctx.clearRect(0, 0, W, H);

        drawSky();
        drawMountains();
        drawClouds();
        drawSnow();
        drawPlatforms();
        drawCoins();
        updatePlayer();
        drawPlayer(playerX, playerY);

        // Subtle vignette
        const vignette = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.7);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, W, H);

        requestAnimationFrame(animate);
    }

    animate();
})();
