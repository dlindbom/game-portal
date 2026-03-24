# Lindbom Arcade – Spelportal

## Översikt
Landningssida/portal för alla Lindbom-spel. Enkel statisk sajt, samma filosofi som Mountain Explorer: ren HTML5 + CSS + vanilla JS, inga ramverk.

## Tech
- **HTML5** med semantisk struktur
- **CSS3** med custom properties, grid, animationer
- **Vanilla JS** för canvas-bakgrund, preview-animationer, interaktivitet
- **GitHub Pages** för hosting

## Filstruktur
```
game-portal/
├── index.html          # Huvudsida
├── css/style.css       # All styling
├── js/
│   ├── background.js   # Animerad stjärnhimmel (canvas)
│   ├── preview.js      # Spelpreview-animationer i kort
│   └── main.js         # Interaktivitet (parallax, hover)
├── CLAUDE.md           # Denna fil
└── .gitignore
```

## Lägga till nytt spel
1. Lägg till ett nytt `<a>` eller `<div>` i `.games-grid` i `index.html`
2. Skapa en preview-canvas i `js/preview.js` (eller separat fil)
3. Lägg till `data-status="live"` eller `data-status="soon"` beroende på status
4. Uppdatera kort-animationsfördröjning i CSS om fler kort

## Design
- Mörkt sci-fi/space-tema med cyan accent (#00e5ff)
- Animerad stjärnbakgrund
- Spelkort med live-preview (canvas), glow-effekter
- Responsivt: fungerar på desktop + mobil/iPad

## URL:er
- **Portal:** https://dlindbom.github.io/game-portal/
- **Mountain Explorer:** https://dlindbom.github.io/mountain-explorer/
