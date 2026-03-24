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

// Mini puzzle scene preview for Puzzle Teamwork card
(function () {
    const canvas = document.getElementById('puzzle-preview');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    let frame = 0;

    // Grid layout
    const TILE = 24;
    const COLS = 10;
    const ROWS = 7;
    const gridX = (W - COLS * TILE) / 2;
    const gridY = (H - ROWS * TILE) / 2 + 5;

    // Simple level map: W=wall, .=floor, B=button, D=door, E=exit
    const map = [
        'WWWWWWWWWW',
        'W....B..EW',
        'W..WWW.WWW',
        'W........W',
        'WWW.WWW..W',
        'WE..D....W',
        'WWWWWWWWWW',
    ];

    const PALETTE = {
        bg: '#0a0a1a', floor: '#1e1b30', floorDot: '#28243d',
        wall: '#3d3555', wallTop: '#5a4f7a', wallDark: '#2a2040',
        button: '#ff6b35', buttonOn: '#ffaa00',
        door: '#8b4513', doorOpen: '#5a8a5a',
        exit: '#00e5ff',
        p1: '#4a9eff', p1head: '#7ab8ff',
        p2: '#ff4a7a', p2head: '#ff7a9a',
    };

    // Player AI paths (pre-scripted loop)
    const p1Path = [
        {r:1,c:1},{r:1,c:2},{r:1,c:3},{r:1,c:4},{r:1,c:5},  // walk to button
        {r:1,c:5},{r:1,c:5},{r:1,c:5},{r:1,c:5},{r:1,c:5},  // wait on button
        {r:1,c:5},{r:1,c:5},{r:1,c:5},{r:1,c:5},{r:1,c:5},  // keep waiting
        {r:1,c:4},{r:1,c:3},{r:1,c:2},{r:1,c:1},             // walk back
        {r:2,c:1},{r:3,c:1},{r:3,c:2},{r:3,c:3},             // go down and right
        {r:4,c:3},{r:5,c:3},{r:5,c:2},{r:5,c:1},             // to exit
    ];
    const p2Path = [
        {r:3,c:8},{r:3,c:7},{r:3,c:6},{r:3,c:5},            // walk left
        {r:3,c:4},{r:3,c:3},{r:3,c:3},{r:3,c:3},             // wait
        {r:4,c:3},{r:5,c:3},{r:5,c:4},                        // go to door area
        {r:5,c:4},{r:5,c:4},{r:5,c:4},{r:5,c:4},             // wait for door
        {r:5,c:4},{r:5,c:5},{r:5,c:6},{r:5,c:7},             // through door
        {r:5,c:8},{r:4,c:8},{r:3,c:8},{r:2,c:8},{r:1,c:8},  // up to exit
    ];

    let step = 0;
    let stepTimer = 0;
    const STEP_SPEED = 18; // frames per step

    function getTile(r, c) { return map[r] ? map[r][c] : 'W'; }

    function drawTile(r, c) {
        const x = gridX + c * TILE;
        const y = gridY + r * TILE;
        const ch = getTile(r, c);

        if (ch === 'W') {
            ctx.fillStyle = PALETTE.wall;
            ctx.fillRect(x, y, TILE, TILE);
            ctx.fillStyle = PALETTE.wallTop;
            ctx.fillRect(x, y, TILE, 2);
            // Brick lines
            ctx.fillStyle = PALETTE.wallDark;
            ctx.fillRect(x, y + Math.floor(TILE/3), TILE, 1);
            ctx.fillRect(x, y + Math.floor(TILE*2/3), TILE, 1);
        } else {
            ctx.fillStyle = PALETTE.floor;
            ctx.fillRect(x, y, TILE, TILE);
            // Dots
            ctx.fillStyle = PALETTE.floorDot;
            ctx.fillRect(x + 5, y + 5, 2, 2);
            ctx.fillRect(x + 15, y + 12, 2, 2);
        }

        if (ch === 'B') {
            const onButton = isP1OnButton();
            ctx.fillStyle = onButton ? PALETTE.buttonOn : PALETTE.button;
            ctx.fillRect(x + 5, y + 5, TILE - 10, TILE - 10);
            ctx.fillStyle = onButton ? PALETTE.button : PALETTE.wallDark;
            ctx.fillRect(x + 7, y + 7, TILE - 14, TILE - 14);
        }
        if (ch === 'D') {
            const open = isDoorOpen();
            if (open) {
                ctx.globalAlpha = 0.4;
                ctx.fillStyle = PALETTE.door;
                ctx.fillRect(x, y, 3, TILE);
                ctx.fillRect(x + TILE - 3, y, 3, TILE);
                ctx.globalAlpha = 1;
            } else {
                ctx.fillStyle = PALETTE.door;
                ctx.fillRect(x, y, TILE, TILE);
                ctx.fillStyle = PALETTE.wallDark;
                ctx.fillRect(x + Math.floor(TILE/3), y, 1, TILE);
                ctx.fillRect(x + Math.floor(TILE*2/3), y, 1, TILE);
                ctx.fillRect(x + 2, y + TILE/2 - 1, TILE - 4, 2);
            }
        }
        if (ch === 'E') {
            const pulse = 0.5 + 0.5 * Math.sin(frame * 0.05);
            ctx.globalAlpha = 0.2 + 0.15 * pulse;
            ctx.fillStyle = PALETTE.exit;
            ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
            ctx.globalAlpha = 1;
            ctx.strokeStyle = PALETTE.exit;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 3, y + 3, TILE - 6, TILE - 6);
            // Diamond
            const cx = x + TILE/2, cy = y + TILE/2, s = 4 + pulse * 2;
            ctx.fillStyle = PALETTE.exit;
            ctx.beginPath();
            ctx.moveTo(cx, cy - s); ctx.lineTo(cx + s*0.6, cy);
            ctx.lineTo(cx, cy + s); ctx.lineTo(cx - s*0.6, cy);
            ctx.closePath(); ctx.fill();
        }
    }

    function isP1OnButton() {
        const pos = p1Path[step % p1Path.length];
        return pos.r === 1 && pos.c === 5;
    }

    function isDoorOpen() {
        return isP1OnButton();
    }

    function drawPlayer(path, color, headColor, label) {
        const curr = path[step % path.length];
        const next = path[(step + 1) % path.length];
        const t = stepTimer / STEP_SPEED;

        const r = curr.r + (next.r - curr.r) * t;
        const c = curr.c + (next.c - curr.c) * t;

        const x = gridX + c * TILE + TILE / 2;
        const y = gridY + r * TILE + TILE / 2;

        // Body
        ctx.fillStyle = color;
        ctx.fillRect(x - 5, y - 2, 10, 12);

        // Head
        ctx.fillStyle = headColor;
        ctx.fillRect(x - 4, y - 8, 8, 7);

        // Eyes
        ctx.fillStyle = PALETTE.bg;
        ctx.fillRect(x - 2, y - 6, 2, 2);
        ctx.fillRect(x + 1, y - 6, 2, 2);

        // Label
        ctx.fillStyle = color;
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y - 11);
    }

    function animate() {
        frame++;
        stepTimer++;
        if (stepTimer >= STEP_SPEED) {
            stepTimer = 0;
            step++;
        }

        ctx.clearRect(0, 0, W, H);

        // Background
        ctx.fillStyle = PALETTE.bg;
        ctx.fillRect(0, 0, W, H);

        // Subtle grid bg pattern
        ctx.globalAlpha = 0.03;
        ctx.strokeStyle = '#fff';
        for (let x = 0; x < W; x += 24) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += 24) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Draw tiles
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                drawTile(r, c);
            }
        }

        // Grid lines
        ctx.globalAlpha = 0.06;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 0.5;
        for (let r = 0; r <= ROWS; r++) {
            ctx.beginPath();
            ctx.moveTo(gridX, gridY + r * TILE);
            ctx.lineTo(gridX + COLS * TILE, gridY + r * TILE);
            ctx.stroke();
        }
        for (let c = 0; c <= COLS; c++) {
            ctx.beginPath();
            ctx.moveTo(gridX + c * TILE, gridY);
            ctx.lineTo(gridX + c * TILE, gridY + ROWS * TILE);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Players
        drawPlayer(p1Path, PALETTE.p1, PALETTE.p1head, 'P1');
        drawPlayer(p2Path, PALETTE.p2, PALETTE.p2head, 'P2');

        // Vignette
        const vig = ctx.createRadialGradient(W/2, H/2, W*0.3, W/2, H/2, W*0.7);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);

        requestAnimationFrame(animate);
    }

    animate();
})();
