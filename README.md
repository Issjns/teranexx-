# Terranex Elite Infraprojects

A professional, modern website for **Terranex Elite Infraprojects** — a civil engineering and construction company. The hero section features an interactive **3D scene of a JCB backhoe excavator laying pipes underground**, built with [Three.js](https://threejs.org/).

## Features

- Interactive 3D JCB excavator digging a trench and lowering pipes (Three.js)
- Animated work cycle, shadows, camera orbit and mouse parallax
- Sleek dark theme with amber construction accents
- Sections: Hero, About Us, Services, Projects, Contact
- Animated stat counters, scroll-reveal effects, and a working demo contact form
- Fully responsive (desktop, tablet, mobile)

## Project Structure

```
.
├── index.html        # Page markup and all sections
├── css/
│   └── styles.css    # Theme, layout, animations, responsive rules
└── js/
    ├── scene.js      # Three.js 3D JCB pipe-laying hero scene
    └── main.js       # Navbar, preloader, reveal, counters, form
```

## Running Locally

No build step required. Serve the folder with any static server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

> Three.js is loaded from a CDN via an import map, so an internet connection is needed for the 3D scene to render.

## Tech

- HTML5, CSS3 (custom properties, grid, flexbox)
- Vanilla JavaScript (ES modules)
- Three.js v0.160 (CDN)
- Google Fonts: Sora + Inter
