// Intersection observer for card entrance animations
(function () {
    // Add hover sound effect (subtle)
    const cards = document.querySelectorAll('.game-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease';
        });
    });

    // Parallax effect on mouse move (subtle)
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distX = (e.clientX - centerX) / window.innerWidth;
            const distY = (e.clientY - centerY) / window.innerHeight;

            card.style.transform = `translateY(${card.matches(':hover') ? -6 : 0}px) perspective(800px) rotateY(${distX * 2}deg) rotateX(${-distY * 2}deg)`;
        });
    });

    // Reset transform on mouse leave
    document.addEventListener('mouseleave', () => {
        cards.forEach(card => {
            card.style.transform = '';
        });
    });
})();
