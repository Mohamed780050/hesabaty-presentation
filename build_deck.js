// build_deck.js - Generator for hesabaty-investor-deck.html
// Generates a single, self-contained 10-slide 3D investor presentation

const fs = require('fs');
const path = require('path');

const dir = __dirname;
const geoData = JSON.parse(fs.readFileSync(path.join(dir, 'geo_data.json'), 'utf8'));
const logoWordmarkB64 = fs.readFileSync(path.join(dir, 'images', 'image1_base64.txt'), 'utf8').trim();
const logoWordmarkSrc = logoWordmarkB64.startsWith('data:') ? logoWordmarkB64 : 'data:image/png;base64,' + logoWordmarkB64;
const logoIconB64 = fs.readFileSync(path.join(dir, 'images', 'image3_base64.txt'), 'utf8').trim();
const logo3DPolys = JSON.parse(fs.readFileSync(path.join(dir, 'clean_logo_polys.json'), 'utf8'));

console.log('Generating index.html...');

const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>حساباتي | Hesabaty - Investor Presentation 2026</title>
  
  <!-- Modern Google Fonts: Cairo for Arabic & Outfit for Tech/Numbers -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  
  <!-- Three.js CDN for 3D Geography and Isometric Visuals -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

  <style>
    :root {
      --bg-dark: #07111F;
      --bg-surface: #0B162C;
      --bg-card: rgba(15, 26, 49, 0.78);
      --bg-card-hover: rgba(22, 38, 70, 0.88);
      --border-subtle: rgba(96, 165, 250, 0.18);
      --border-accent: rgba(96, 165, 250, 0.45);
      
      --primary-blue: #2563EB;
      --deep-blue: #1D4ED8;
      --light-blue: #60A5FA;
      --cyan-accent: #38BDF8;
      --emerald-accent: #10B981;
      --amber-accent: #F59E0B;
      --danger-accent: #EF4444;
      
      --text-white: #F8FAFC;
      --text-muted: #94A3B8;
      --text-dim: #64748B;
      
      --font-ar: 'Cairo', system-ui, -apple-system, sans-serif;
      --font-en: 'Outfit', system-ui, -apple-system, sans-serif;
      --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }

    body {
      background-color: var(--bg-dark);
      color: var(--text-white);
      font-family: var(--font-ar);
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
    }

    /* Background Ambient Canvas & Atmosphere */
    #ambient-bg {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background: radial-gradient(circle at 75% 20%, rgba(37, 99, 235, 0.15) 0%, transparent 50%),
                  radial-gradient(circle at 20% 80%, rgba(56, 189, 248, 0.1) 0%, transparent 45%),
                  radial-gradient(circle at 50% 50%, rgba(11, 22, 44, 0.95) 0%, #07111F 100%);
    }

    /* Fixed 16:9 Presentation Frame */
    .deck-viewport {
      position: relative;
      width: 100vw;
      height: 100vh;
      max-width: 177.78vh; /* 16:9 ratio */
      max-height: 56.25vw;
      z-index: 10;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 2.5vh 3.5vw;
      box-shadow: 0 0 100px rgba(0, 0, 0, 0.8);
    }

    /* Deck Header */
    .deck-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 50;
      height: 6vh;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 14px;
      cursor: pointer;
    }

    .brand-logo-img {
      height: 40px;
      width: auto;
      object-fit: contain;
      filter: drop-shadow(0 2px 8px rgba(37, 99, 235, 0.5));
    }

    .brand-tag {
      font-family: var(--font-en);
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--light-blue);
      background: rgba(37, 99, 235, 0.15);
      border: 1px solid var(--border-subtle);
      padding: 4px 12px;
      border-radius: 999px;
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .control-btn {
      background: rgba(15, 26, 49, 0.8);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.9rem;
      font-family: var(--font-en);
      transition: all 0.2s var(--ease-smooth);
    }

    .control-btn:hover {
      background: rgba(37, 99, 235, 0.25);
      border-color: var(--light-blue);
      color: var(--text-white);
      transform: translateY(-1px);
    }

    .slide-counter {
      font-family: var(--font-en);
      font-weight: 700;
      font-size: 1.05rem;
      letter-spacing: 0.1em;
      color: var(--cyan-accent);
      padding: 0 10px;
      direction: ltr;
    }

    /* Main Slides Stage */
    .slides-container {
      position: relative;
      flex: 1;
      width: 100%;
      height: calc(100% - 12vh);
      margin: 1vh 0;
    }

    .slide {
      position: absolute;
      inset: 0;
      opacity: 0;
      visibility: hidden;
      transform: translateX(40px) scale(0.98);
      transition: opacity 0.5s var(--ease-smooth), transform 0.5s var(--ease-smooth), visibility 0.5s;
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 3.5vw;
      align-items: center;
      pointer-events: none;
    }

    .slide.active {
      opacity: 1;
      visibility: visible;
      transform: translateX(0) scale(1);
      pointer-events: auto;
    }

    /* Slide Typography & Content */
    .slide-content {
      display: flex;
      flex-direction: column;
      gap: 2vh;
      z-index: 20;
    }

    .slide-kicker {
      font-family: var(--font-en);
      font-size: 0.88rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--cyan-accent);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .slide-kicker::before {
      content: '';
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--cyan-accent);
      box-shadow: 0 0 10px var(--cyan-accent);
    }

    .slide-title {
      font-size: 2.8vw;
      font-weight: 800;
      line-height: 1.15;
      color: var(--text-white);
      letter-spacing: -0.01em;
    }

    .slide-title span.highlight {
      background: linear-gradient(135deg, #60A5FA 0%, #38BDF8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .slide-subtitle {
      font-size: 1.25vw;
      font-weight: 400;
      line-height: 1.6;
      color: var(--text-muted);
      max-width: 95%;
    }

    .feature-points {
      display: flex;
      flex-direction: column;
      gap: 1.4vh;
      margin-top: 1vh;
    }

    .point-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 1.4vh 1.4vw;
      display: flex;
      align-items: flex-start;
      gap: 14px;
      transition: all 0.3s var(--ease-smooth);
      backdrop-filter: blur(12px);
      cursor: pointer;
    }

    .point-card:hover {
      border-color: var(--light-blue);
      background: var(--bg-card-hover);
      transform: translateX(-4px);
    }

    .point-card.active {
      border-color: var(--cyan-accent) !important;
      background: rgba(37, 99, 235, 0.22) !important;
      box-shadow: 0 0 20px rgba(56, 189, 248, 0.25) !important;
      transform: translateX(-4px);
    }

    .point-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(37, 99, 245, 0.2);
      border: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: var(--light-blue);
      flex-shrink: 0;
    }

    .point-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-white);
      margin-bottom: 3px;
    }

    .point-desc {
      font-size: 0.88rem;
      color: var(--text-muted);
      line-height: 1.45;
    }

    /* Scoped styling for Slide 1 Hero Cover */
    #slide-1 .slide-content {
      justify-content: center;
      gap: 2.2vh;
      padding-right: 1.5vw;
    }
    #slide-1 .hero-kicker-badge {
      font-family: var(--font-en);
      font-size: 0.92rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #38BDF8;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.38);
      padding: 6px 16px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      width: fit-content;
      box-shadow: 0 0 25px rgba(56, 189, 248, 0.15);
    }
    #slide-1 .hero-kicker-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #38BDF8;
      box-shadow: 0 0 10px #38BDF8;
      animation: heroPulse 2s infinite ease-in-out;
    }
    @keyframes heroPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    #slide-1 .hero-logo-wrap {
      display: flex;
      align-items: center;
      margin: 0.5vh 0;
    }
    #slide-1 .hero-brand-logo {
      height: clamp(80px, 10.5vh, 115px);
      width: auto;
      object-fit: contain;
      filter: drop-shadow(0 4px 20px rgba(37, 99, 235, 0.5)) drop-shadow(0 0 35px rgba(56, 189, 248, 0.45));
    }
    #slide-1 .hero-tagline-ar {
      font-size: 1.55vw;
      font-weight: 600;
      line-height: 1.65;
      color: #F8FAFC;
      max-width: 92%;
      text-shadow: 0 2px 14px rgba(0, 0, 0, 0.6);
    }

    /* Scoped styling for Slide 2 Problem Cards & Camera Interactive Feedback */
    #slide-2 .slide-content {
      gap: 2.2vh;
    }
    #slide-2 .point-card {
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      user-select: none;
      position: relative;
    }
    #slide-2 .point-card:hover {
      transform: translateX(-6px);
      border-color: #38bdf8;
      background: rgba(22, 38, 70, 0.95);
      box-shadow: 0 4px 20px rgba(56, 189, 248, 0.2);
    }
    #slide-2 .point-card.active {
      border-color: #38bdf8 !important;
      background: rgba(37, 99, 235, 0.28) !important;
      box-shadow: 0 0 25px rgba(56, 189, 248, 0.35), inset 0 0 15px rgba(56, 189, 248, 0.15);
      transform: translateX(-8px) scale(1.02);
    }
    #slide-2 .point-card.active::after {
      content: '🔍 تركيز 3D';
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.75rem;
      font-weight: 700;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.4);
      padding: 3px 10px;
      border-radius: 999px;
      letter-spacing: 0.05em;
    }

    /* Scoped styling for Slide 3 Solution Cards & Camera Interactive Feedback */
    #slide-3 .slide-content {
      gap: 1.8vh;
    }
    #slide-3 .feature-points {
      gap: 1vh;
      margin-top: 0.5vh;
    }
    #slide-3 .point-card {
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      user-select: none;
      position: relative;
      padding: 1.1vh 1.2vw;
      gap: 12px;
    }
    #slide-3 .point-card:hover {
      transform: translateX(-6px);
      border-color: #38bdf8;
      background: rgba(22, 38, 70, 0.95);
      box-shadow: 0 4px 20px rgba(56, 189, 248, 0.2);
    }
    #slide-3 .point-card.active {
      border-color: #38bdf8 !important;
      background: rgba(37, 99, 235, 0.28) !important;
      box-shadow: 0 0 25px rgba(56, 189, 248, 0.35), inset 0 0 15px rgba(56, 189, 248, 0.15);
      transform: translateX(-8px) scale(1.02);
    }
    #slide-3 .point-card.active::after {
      content: '🔍 تركيز 3D';
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.75rem;
      font-weight: 700;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.4);
      padding: 3px 10px;
      border-radius: 999px;
      letter-spacing: 0.05em;
    }

    /* Scoped styling for Slide 4 Market Opportunity Cards */
    #slide-4 .slide-content {
      gap: 2.2vh;
    }
    #slide-4 .point-card {
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      user-select: none;
      position: relative;
    }
    #slide-4 .point-card:hover {
      transform: translateX(-6px);
      border-color: #38bdf8;
      background: rgba(22, 38, 70, 0.95);
      box-shadow: 0 4px 20px rgba(56, 189, 248, 0.2);
    }
    #slide-4 .point-card.active {
      border-color: #38bdf8 !important;
      background: rgba(37, 99, 235, 0.28) !important;
      box-shadow: 0 0 25px rgba(56, 189, 248, 0.35), inset 0 0 15px rgba(56, 189, 248, 0.15);
      transform: translateX(-8px) scale(1.02);
    }
    #slide-4 .point-card.active::after {
      content: '🗺️ تركيز الخريطة';
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.75rem;
      font-weight: 700;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.4);
      padding: 3px 10px;
      border-radius: 999px;
      letter-spacing: 0.05em;
    }

    /* Scoped styling for Slide 5 SaaS Vault & Cubes */
    #slide-5 .slide-content {
      gap: 1.8vh;
    }
    #slide-5 .stat-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 0.5vh;
    }
    #slide-5 .stat-box {
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      padding: 1.2vh 1vw;
      border: 1px solid rgba(56, 189, 248, 0.2);
      border-radius: 12px;
      background: rgba(15, 23, 42, 0.7);
      text-align: center;
    }
    #slide-5 .stat-box:hover {
      border-color: #38bdf8;
      transform: translateY(-3px);
      background: rgba(22, 38, 70, 0.9);
    }
    #slide-5 .stat-box.active {
      border-color: #38bdf8 !important;
      background: rgba(37, 99, 235, 0.25) !important;
      box-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
      transform: translateY(-4px) scale(1.03);
    }
    #slide-5 .feature-points {
      gap: 1vh;
      margin-top: 1vh;
    }
    #slide-5 .point-card {
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      padding: 1.1vh 1.2vw;
      gap: 12px;
    }
    #slide-5 .point-card:hover {
      transform: translateX(-6px);
      border-color: #38bdf8;
      background: rgba(22, 38, 70, 0.95);
    }

    /* Scoped styling for Slide 10 4-card layout */
    #slide-10 .feature-points {
      gap: 0.8vh;
      margin-top: 1vh;
    }
    #slide-10 .point-card {
      padding: 1vh 1.2vw;
      gap: 10px;
    }
    #slide-10 .point-icon {
      width: 36px;
      height: 36px;
      font-size: 1.1rem;
    }
    #slide-10 .point-title {
      font-size: 0.95rem;
      margin-bottom: 2px;
    }
    #slide-10 .point-desc {
      font-size: 0.82rem;
      line-height: 1.38;
    }

    /* 3D Visual Stage Container */
    .visual-stage {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 440px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 20px;
      overflow: hidden;
      background: radial-gradient(circle at center, rgba(37, 99, 235, 0.08) 0%, rgba(7, 17, 31, 0.5) 70%);
      border: 1px solid rgba(96, 165, 250, 0.12);
    }

    .visual-canvas {
      width: 100% !important;
      height: 100% !important;
      outline: none;
    }

    /* Footer Navigation & Progress */
    .deck-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 50;
      height: 5vh;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 1vh;
    }

    .footer-note {
      font-size: 0.78rem;
      color: var(--text-dim);
      font-family: var(--font-en);
    }

    .nav-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .nav-btn {
      background: rgba(37, 99, 235, 0.2);
      border: 1px solid var(--border-subtle);
      color: var(--text-white);
      padding: 6px 16px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s var(--ease-smooth);
    }

    .nav-btn:hover {
      background: var(--primary-blue);
      border-color: var(--light-blue);
      box-shadow: 0 0 15px rgba(37, 99, 235, 0.5);
    }

    .progress-bar-container {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: rgba(255, 255, 255, 0.05);
      z-index: 100;
    }

    .progress-bar-fill {
      height: 100%;
      width: 10%;
      background: linear-gradient(90deg, var(--primary-blue), var(--cyan-accent));
      transition: width 0.4s var(--ease-smooth);
      box-shadow: 0 0 8px var(--cyan-accent);
    }

    /* Interactive Badges & Stats */
    .stat-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1vw;
      margin-top: 1.5vh;
    }

    .stat-box {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 1.4vh 1vw;
      text-align: center;
      backdrop-filter: blur(10px);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .stat-box:hover {
      border-color: var(--light-blue);
      transform: translateY(-3px);
    }

    .stat-box.active {
      border-color: var(--cyan-accent) !important;
      background: rgba(37, 99, 235, 0.25) !important;
      box-shadow: 0 0 20px rgba(56, 189, 248, 0.25);
      transform: translateY(-3px);
    }

    .stat-num {
      font-family: var(--font-en);
      font-size: 1.8vw;
      font-weight: 800;
      color: var(--cyan-accent);
      direction: ltr;
      display: inline-block;
    }

    .stat-label {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* Presenter Notes Panel */
    #notes-drawer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 35vh;
      background: rgba(7, 17, 31, 0.96);
      border-top: 2px solid var(--primary-blue);
      backdrop-filter: blur(25px);
      z-index: 200;
      transform: translateY(100%);
      transition: transform 0.4s var(--ease-smooth);
      padding: 2.5vh 4vw;
      display: flex;
      flex-direction: column;
      gap: 1.5vh;
      box-shadow: 0 -20px 40px rgba(0, 0, 0, 0.7);
    }

    #notes-drawer.open {
      transform: translateY(0);
    }

    .notes-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 1vh;
    }

    .notes-title {
      font-weight: 700;
      color: var(--cyan-accent);
      font-size: 1rem;
    }

    .notes-content {
      overflow-y: auto;
      font-size: 0.95rem;
      line-height: 1.7;
      color: #CBD5E1;
      direction: rtl;
    }

    /* 3D Map Custom Controls for Slide 4 */
    .map-controls-bar {
      position: absolute;
      top: 15px;
      left: 15px;
      z-index: 30;
      display: flex;
      gap: 8px;
    }

    .map-btn {
      background: rgba(11, 22, 44, 0.85);
      border: 1px solid var(--border-subtle);
      color: var(--text-white);
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: var(--font-en);
    }

    .map-btn.active, .map-btn:hover {
      background: var(--primary-blue);
      border-color: var(--cyan-accent);
      color: white;
    }

    /* Responsive adjustments */
    @media (max-width: 1024px) {
      .deck-viewport {
        padding: 2vh 2vw;
      }
      .slide {
        grid-template-columns: 1fr;
        gap: 2vh;
      }
      .visual-stage {
        min-height: 280px;
      }
      .slide-title {
        font-size: 5vw;
      }
      .slide-subtitle {
        font-size: 2.5vw;
      }
    }
  </style>
</head>
<body>

  <div id="ambient-bg"></div>

  <div class="deck-viewport">
    
    <!-- Top Deck Header -->
    <header class="deck-header">
      <div class="brand-group" onclick="deck.goTo(0)">
        <img class="brand-logo-img" src="${logoWordmarkSrc}" alt="حساباتي - Hesabaty">
        <span class="brand-tag">Investor Deck 2026</span>
      </div>

      <div class="header-controls">
        <button class="control-btn" id="btn-reduced-motion" title="تبديل تقليل الحركة (M)">⚡</button>
        <button class="control-btn" id="btn-notes" title="ملاحظات العارض (N)">📝</button>
        <button class="control-btn" id="btn-fullscreen" title="ملء الشاشة (F)">⛶</button>
        <div class="slide-counter" id="slide-indicator">01 / 10</div>
      </div>
    </header>

    <!-- Main 10 Slides Container -->
    <main class="slides-container">

      <!-- SLIDE 1: TITLE & ONE-LINER -->
      <section class="slide active" id="slide-1" data-title="حساباتي | المقدمة">
        <div class="slide-content">
          <div class="hero-kicker-badge">
            <span class="hero-kicker-dot"></span>
            Cloud Mini-ERP &amp; Retail POS
          </div>
          <div class="hero-logo-wrap">
            <img class="hero-brand-logo" src="${logoWordmarkSrc}" alt="حساباتي">
          </div>
          <p class="hero-tagline-ar">
            المنظومة السحابية الذكية لإدارة المبيعات، المخزون، والديون لتجار التجزئة في مصر.
          </p>
        </div>

        <div class="visual-stage" id="stage-slide-1">
          <canvas class="visual-canvas" id="canvas-slide-1"></canvas>
        </div>
      </section>

      <!-- SLIDE 2: THE PROBLEM -->
      <section class="slide" id="slide-2" data-title="المشكلة | The Problem">
        <div class="slide-content">
          <div class="hero-kicker-badge">
            <span class="hero-kicker-dot" style="background: var(--danger-accent); box-shadow: 0 0 10px var(--danger-accent);"></span>
            تحديات التجزئة
          </div>
          <h2 class="slide-title" style="font-size: 3vw; font-weight: 800; color: #FFFFFF; line-height: 1.2;">
            أين تضيع <span class="highlight">أرباح المتاجر؟</span>
          </h2>

          <div class="feature-points">
            <div class="point-card" id="card-prob-0" title="انقر لتكبير المجسم ثلاثي الأبعاد">
              <div class="point-icon" style="color: var(--amber-accent); background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35);">📦</div>
              <div>
                <div class="point-title" style="color: #F8FAFC; font-weight: 700; font-size: 1.1rem;">عجز وفروقات المخزون</div>
                <div class="point-desc" style="color: #93C5FD; font-size: 0.92rem;">غياب تتبع الأصناف والنواقص.</div>
              </div>
            </div>

            <div class="point-card" id="card-prob-1" title="انقر لتكبير المجسم ثلاثي الأبعاد">
              <div class="point-icon" style="color: var(--cyan-accent); background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35);">💻</div>
              <div>
                <div class="point-title" style="color: #F8FAFC; font-weight: 700; font-size: 1.1rem;">أنظمة مكتبية وعتاد باهظ</div>
                <div class="point-desc" style="color: #93C5FD; font-size: 0.92rem;">برمجيات معزولة بلا سحابة.</div>
              </div>
            </div>

            <div class="point-card" id="card-prob-2" title="انقر لتكبير المجسم ثلاثي الأبعاد">
              <div class="point-icon" style="color: var(--danger-accent); background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35);">📑</div>
              <div>
                <div class="point-title" style="color: #F8FAFC; font-weight: 700; font-size: 1.1rem;">ضياع ديون الشكك</div>
                <div class="point-desc" style="color: #93C5FD; font-size: 0.92rem;">تراكم الآجل وصعوبة التحصيل.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="visual-stage" id="stage-slide-2">
          <canvas class="visual-canvas" id="canvas-slide-2"></canvas>
        </div>
      </section>

      <!-- SLIDE 3: THE SOLUTION -->
      <section class="slide" id="slide-3" data-title="الحل | The Solution">
        <div class="slide-content">
          <div class="hero-kicker-badge">
            <span class="hero-kicker-dot"></span>
            منظومة التجزئة
          </div>
          <h2 class="slide-title" style="font-size: 3vw; font-weight: 800; color: #FFFFFF; line-height: 1.2;">
            تحكم تشغيلي <span class="highlight">متكامل</span>
          </h2>

          <div class="feature-points">
            <div class="point-card" id="card-sol-0" title="انقر للتكبير ثلاثي الأبعاد">
              <div class="point-icon" style="color: var(--cyan-accent); background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35);">🛒</div>
              <div>
                <div class="point-title" style="color: #F8FAFC; font-weight: 700; font-size: 1.05rem;">كاشير الموبايل السريع</div>
                <div class="point-desc" style="color: #93C5FD; font-size: 0.88rem;">مسح باركود فوري.</div>
              </div>
            </div>

            <div class="point-card" id="card-sol-1" title="انقر للتكبير ثلاثي الأبعاد">
              <div class="point-icon" style="color: var(--light-blue); background: rgba(96, 165, 250, 0.15); border: 1px solid rgba(96, 165, 250, 0.35);">📊</div>
              <div>
                <div class="point-title" style="color: #F8FAFC; font-weight: 700; font-size: 1.05rem;">المخزون متعدد الوحدات</div>
                <div class="point-desc" style="color: #93C5FD; font-size: 0.88rem;">تتبع دقيق للنواقص.</div>
              </div>
            </div>

            <div class="point-card" id="card-sol-2" title="انقر للتكبير ثلاثي الأبعاد">
              <div class="point-icon" style="color: var(--amber-accent); background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35);">🧾</div>
              <div>
                <div class="point-title" style="color: #F8FAFC; font-weight: 700; font-size: 1.05rem;">الإيصال الإلكتروني المعتمد</div>
                <div class="point-desc" style="color: #93C5FD; font-size: 0.88rem;">توافق ضريبي كامل.</div>
              </div>
            </div>

            <div class="point-card" id="card-sol-3" title="انقر للتكبير ثلاثي الأبعاد">
              <div class="point-icon" style="color: var(--emerald-accent); background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35);">💬</div>
              <div>
                <div class="point-title" style="color: #F8FAFC; font-weight: 700; font-size: 1.05rem;">أتمتة الشكك بالواتساب</div>
                <div class="point-desc" style="color: #93C5FD; font-size: 0.88rem;">تصفير آلي للديون.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="visual-stage" id="stage-slide-3">
          <canvas class="visual-canvas" id="canvas-slide-3"></canvas>
        </div>
      </section>

      <!-- SLIDE 4: MARKET OPPORTUNITY (TAM / SAM / SOM) -->
      <section class="slide" id="slide-4" data-title="الفرصة السوقية | TAM SAM SOM">
        <div class="slide-content">
          <div class="hero-kicker-badge">
            <span class="hero-kicker-dot"></span>
            حجم السوق
          </div>
          <h2 class="slide-title" style="font-size: 3vw; font-weight: 800; color: #FFFFFF; line-height: 1.2;">
            فرصة التوسع في <span class="highlight">مصر</span>
          </h2>

          <div class="feature-points">
            <div class="point-card active" id="card-tam" onclick="focusMap('tam')">
              <div class="point-icon" style="color: var(--cyan-accent); background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35);">🇪🇬</div>
              <div>
                <div class="point-title" style="color: #F8FAFC; font-weight: 700; font-size: 1.1rem;">TAM: مصر بالكامل</div>
                <div class="point-desc" style="color: #93C5FD; font-size: 0.92rem;">2.2 مليون منشأة تجزئة.</div>
              </div>
            </div>

            <div class="point-card" id="card-sam" onclick="focusMap('sam')">
              <div class="point-icon" style="color: var(--light-blue); background: rgba(96, 165, 250, 0.15); border: 1px solid rgba(96, 165, 250, 0.35);">🌊</div>
              <div>
                <div class="point-title" style="color: #F8FAFC; font-weight: 700; font-size: 1.1rem;">SAM: الإسكندرية والدلتا</div>
                <div class="point-desc" style="color: #93C5FD; font-size: 0.92rem;">30,000 متجر مؤهل سحابياً.</div>
              </div>
            </div>

            <div class="point-card" id="card-som" onclick="focusMap('som')">
              <div class="point-icon" style="color: var(--emerald-accent); background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35);">🎯</div>
              <div>
                <div class="point-title" style="color: #F8FAFC; font-weight: 700; font-size: 1.1rem;">SOM: شرق الإسكندرية</div>
                <div class="point-desc" style="color: #93C5FD; font-size: 0.92rem;">270 متجراً مستهدفاً بالانطلاق.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="visual-stage" id="stage-slide-4">
          <div class="map-controls-bar">
            <button class="map-btn active" id="btn-focus-tam" onclick="focusMap('tam')">TAM (مصر)</button>
            <button class="map-btn" id="btn-focus-sam" onclick="focusMap('sam')">SAM (الإسكندرية)</button>
            <button class="map-btn" id="btn-focus-som" onclick="focusMap('som')">SOM (شرق الإسكندرية)</button>
          </div>
          <canvas class="visual-canvas" id="canvas-slide-4"></canvas>
        </div>
      </section>

      <!-- SLIDE 5: BUSINESS MODEL & UNIT ECONOMICS -->
      <section class="slide" id="slide-5" data-title="نموذج العمل والوحدة الاقتصادية">
        <div class="slide-content">
          <div class="hero-kicker-badge">
            <span class="hero-kicker-dot"></span>
            نموذج العمل
          </div>
          <h2 class="slide-title" style="font-size: 3vw; font-weight: 800; color: #FFFFFF; line-height: 1.2;">
            اشتراكات متكررة <span class="highlight">وهوامش 90%</span>
          </h2>

          <div class="stat-row">
            <div class="stat-box" id="stat-tier-0" onclick="selectTier(0)" title="انقر لعرض تفاصيل باقة Starter في الـ 3D">
              <div class="stat-num">500 <span style="font-size: 1rem;">ج.م/ش</span></div>
              <div class="stat-label">Starter</div>
            </div>
            <div class="stat-box active" id="stat-tier-1" onclick="selectTier(1)" title="انقر لعرض تفاصيل باقة Pro في الـ 3D">
              <div class="stat-num" style="color: var(--cyan-accent);">1,500 <span style="font-size: 1rem;">ج.م/ش</span></div>
              <div class="stat-label">Pro ⭐</div>
            </div>
            <div class="stat-box" id="stat-tier-2" onclick="selectTier(2)" title="انقر لعرض تفاصيل باقة Max AI في الـ 3D">
              <div class="stat-num" style="color: #c084fc;">مخصصة</div>
              <div class="stat-label">Max AI</div>
            </div>
          </div>

          <div class="feature-points" style="margin-top: 1.2vh; gap: 1vh;">
            <div class="point-card" id="card-tier-unit" onclick="selectTier(1)">
              <div class="point-icon" style="color: var(--amber-accent); background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35);">🎯</div>
              <div>
                <div class="point-title" style="color: #F8FAFC; font-weight: 700; font-size: 1.05rem;">كفاءة استثنائية LTV/CAC</div>
                <div class="point-desc" style="color: #93C5FD; font-size: 0.88rem;">عائد يصل 32:1.</div>
              </div>
            </div>

            <div class="point-card" id="card-tier-break" onclick="selectTier(1)">
              <div class="point-icon" style="color: var(--emerald-accent); background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35);">⚖️</div>
              <div>
                <div class="point-title" style="color: #F8FAFC; font-weight: 700; font-size: 1.05rem;">أمان مالي واسترداد سريع</div>
                <div class="point-desc" style="color: #93C5FD; font-size: 0.88rem;">تعادل عند 20 متجراً.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="visual-stage" id="stage-slide-5">
          <div class="map-controls-bar">
            <button class="map-btn" id="btn-tier-0" onclick="selectTier(0)">Starter (500 ج)</button>
            <button class="map-btn active" id="btn-tier-1" onclick="selectTier(1)">Pro (1,500 ج) ⭐</button>
            <button class="map-btn" id="btn-tier-2" onclick="selectTier(2)">Max AI (مخصصة)</button>
          </div>
          <canvas class="visual-canvas" id="canvas-slide-5"></canvas>
        </div>
      </section>

      <!-- SLIDE 6: GO TO MARKET -->
      <section class="slide" id="slide-6" data-title="استراتيجية النفاذ للسوق | GTM">
        <div class="slide-content">
          <div class="slide-kicker">استراتيجية النمو</div>
          <h2 class="slide-title">خطة انطلاق <span class="highlight">ثلاثية المراحل</span></h2>

          <div class="feature-points">
            <div class="point-card active" id="card-gtm-0" onclick="selectGtmStage(0)">
              <div class="point-icon">🏪</div>
              <div>
                <div class="point-title">1: النفاذ الميداني</div>
                <div class="point-desc">عروض حية لتجار شرق الإسكندرية.</div>
              </div>
            </div>

            <div class="point-card" id="card-gtm-1" onclick="selectGtmStage(1)">
              <div class="point-icon">🔄</div>
              <div>
                <div class="point-title">2: محركات الإحالة</div>
                <div class="point-desc">شهر مجاني وشراكات مع المحاسبين.</div>
              </div>
            </div>

            <div class="point-card" id="card-gtm-2" onclick="selectGtmStage(2)">
              <div class="point-icon">🚀</div>
              <div>
                <div class="point-title">3: التوسع الإقليمي</div>
                <div class="point-desc">التمدد للدلتا والقاهرة والخليج.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="visual-stage" id="stage-slide-6">
          <div class="map-controls-bar">
            <button class="map-btn active" id="btn-gtm-0" onclick="selectGtmStage(0)">📍 1: النفاذ الميداني</button>
            <button class="map-btn" id="btn-gtm-1" onclick="selectGtmStage(1)">🔄 2: محرك الإحالة</button>
            <button class="map-btn" id="btn-gtm-2" onclick="selectGtmStage(2)">🚀 3: التوسع الإقليمي</button>
          </div>
          <canvas class="visual-canvas" id="canvas-slide-6"></canvas>
        </div>
      </section>

      <!-- SLIDE 7: TRACTION & VALIDATION -->
      <section class="slide" id="slide-7" data-title="التحقق والجاهزية | Traction">
        <div class="slide-content">
          <div class="slide-kicker">التحقق الميداني</div>
          <h2 class="slide-title">أدلة واقعية <span class="highlight">قبل التوسع</span></h2>

          <div class="feature-points">
            <div class="point-card active" id="card-val-0" onclick="selectValTest(0)">
              <div class="point-icon">⚡</div>
              <div>
                <div class="point-title">1: مسح الكاميرا (&lt; 1s)</div>
                <div class="point-desc">وفّر 20,000 ج.م أجهزة ماسح.</div>
              </div>
            </div>

            <div class="point-card" id="card-val-1" onclick="selectValTest(1)">
              <div class="point-icon">💾</div>
              <div>
                <div class="point-title">2: صمود أوفلاين (50/50)</div>
                <div class="point-desc">مزامنة سحابية تامة دون انقطاع.</div>
              </div>
            </div>

            <div class="point-card" id="card-val-2" onclick="selectValTest(2)">
              <div class="point-icon">⚖️</div>
              <div>
                <div class="point-title">3: اعتماد 5 محاسبين</div>
                <div class="point-desc">مطابقة قانون 152 للإيصال الإلكتروني.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="visual-stage" id="stage-slide-7">
          <div class="map-controls-bar">
            <button class="map-btn active" id="btn-val-0" onclick="selectValTest(0)">⚡ 1: مسح الكاميرا &lt; 1s</button>
            <button class="map-btn" id="btn-val-1" onclick="selectValTest(1)">💾 2: صمود الأوفلاين 50/50</button>
            <button class="map-btn" id="btn-val-2" onclick="selectValTest(2)">⚖️ 3: اعتماد قانون 152</button>
          </div>
          <canvas class="visual-canvas" id="canvas-slide-7"></canvas>
        </div>
      </section>

      <!-- SLIDE 8: COMPETITION -->
      <section class="slide" id="slide-8" data-title="المنافسة والتموضع | Competition">
        <div class="slide-content">
          <div class="slide-kicker">التموضع التنافسي</div>
          <h2 class="slide-title">سد فجوة السوق</h2>

          <div class="feature-points">
            <div class="point-card active" id="card-comp-0" onclick="selectCompLayer(0)">
              <div class="point-icon" style="color: var(--cyan-accent);">✨</div>
              <div>
                <div class="point-title">حساباتي (100%)</div>
                <div class="point-desc">صفر أجهزة، مسح فوري، وتسعير بالجنيه.</div>
              </div>
            </div>

            <div class="point-card" id="card-comp-1" onclick="selectCompLayer(1)">
              <div class="point-icon">❌</div>
              <div>
                <div class="point-title">الأنظمة القديمة</div>
                <div class="point-desc">عتاد مكلف (25k) وبلا سحابة.</div>
              </div>
            </div>

            <div class="point-card" id="card-comp-2" onclick="selectCompLayer(2)">
              <div class="point-icon">⚠️</div>
              <div>
                <div class="point-title">أنظمة ERP</div>
                <div class="point-desc">اشتراك دولاري وبلا كاميرا.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="visual-stage" id="stage-slide-8">
          <div class="map-controls-bar">
            <button class="map-btn active" id="btn-comp-0" onclick="selectCompLayer(0)">✨ حساباتي</button>
            <button class="map-btn" id="btn-comp-1" onclick="selectCompLayer(1)">❌ قديمة</button>
            <button class="map-btn" id="btn-comp-2" onclick="selectCompLayer(2)">⚠️ ERP</button>
          </div>
          <canvas class="visual-canvas" id="canvas-slide-8"></canvas>
        </div>
      </section>

      <!-- SLIDE 9: TEAM -->
      <section class="slide" id="slide-9" data-title="فريق العمل | Team">
        <div class="slide-content">
          <div class="slide-kicker">فريق العمل</div>
          <h2 class="slide-title">كفاءة التنفيذ</h2>

          <div class="feature-points">
            <div class="point-card active" id="card-team-0" onclick="selectTeamMember(0)">
              <div class="point-icon">👨‍💻</div>
              <div>
                <div class="point-title">محمد عمر</div>
                <div class="point-desc">معماري سحابي ومبيعات.</div>
              </div>
            </div>

            <div class="point-card" id="card-team-1" onclick="selectTeamMember(1)">
              <div class="point-icon">📈</div>
              <div>
                <div class="point-title">محمد نبيل</div>
                <div class="point-desc">خبير مالي ومطابقة ضريبية.</div>
              </div>
            </div>

            <div class="point-card" id="card-team-2" onclick="selectTeamMember(2)">
              <div class="point-icon">⚡</div>
              <div>
                <div class="point-title">التكامل</div>
                <div class="point-desc">سرعة ابتكار واستدامة.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="visual-stage" id="stage-slide-9">
          <div class="map-controls-bar">
            <button class="map-btn active" id="btn-team-0" onclick="selectTeamMember(0)">👨‍💻 عمر</button>
            <button class="map-btn" id="btn-team-1" onclick="selectTeamMember(1)">📈 نبيل</button>
            <button class="map-btn" id="btn-team-2" onclick="selectTeamMember(2)">⚡ تكامل</button>
          </div>
          <canvas class="visual-canvas" id="canvas-slide-9"></canvas>
        </div>
      </section>

      <!-- SLIDE 10: FINANCIALS & THE ASK -->
      <section class="slide" id="slide-10" data-title="الماليات والطلب الاستثماري | The Ask">
        <div class="slide-content">
          <div class="slide-kicker">الطلب الاستثماري</div>
          <h2 class="slide-title">175,000 ج.م</h2>

          <div class="feature-points">
            <div class="point-card active" id="card-fund-0" onclick="selectFundSector(0)">
              <div class="point-icon" style="color: var(--cyan-accent);">📍</div>
              <div>
                <div class="point-title">مبيعات (45%)</div>
                <div class="point-desc">78k ج.م للتوسع.</div>
              </div>
            </div>

            <div class="point-card" id="card-fund-1" onclick="selectFundSector(1)">
              <div class="point-icon" style="color: var(--emerald-accent);">⚡</div>
              <div>
                <div class="point-title">سحابة (30%)</div>
                <div class="point-desc">52k ج.م للبنية.</div>
              </div>
            </div>

            <div class="point-card" id="card-fund-2" onclick="selectFundSector(2)">
              <div class="point-icon" style="color: var(--amber-accent);">🛡️</div>
              <div>
                <div class="point-title">تشغيل (25%)</div>
                <div class="point-desc">44k ج.م تدريب وسيولة.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="visual-stage" id="stage-slide-10">
          <div class="map-controls-bar">
            <button class="map-btn active" id="btn-fund-0" onclick="selectFundSector(0)">📍 مبيعات</button>
            <button class="map-btn" id="btn-fund-1" onclick="selectFundSector(1)">⚡ سحابة</button>
            <button class="map-btn" id="btn-fund-2" onclick="selectFundSector(2)">🛡️ تشغيل</button>
          </div>
          <canvas class="visual-canvas" id="canvas-slide-10"></canvas>
        </div>
      </section>

    </main>

    <!-- Bottom Deck Footer -->
    <footer class="deck-footer">
      <div class="footer-note">Hesabaty © 2026 | Confidential Investor Presentation | Alex, Egypt</div>

      <div class="nav-group">
        <button class="nav-btn" id="btn-prev" onclick="deck.prev()">السابق ➔</button>
        <button class="nav-btn" id="btn-next" onclick="deck.next()">➔ التالي</button>
      </div>
    </footer>

    <!-- Progress Bar -->
    <div class="progress-bar-container">
      <div class="progress-bar-fill" id="progress-bar"></div>
    </div>

  </div>

  <!-- Presenter Notes Drawer -->
  <aside id="notes-drawer">
    <div class="notes-header">
      <div class="notes-title" id="notes-slide-title">ملاحظات العارض والمصادر الرسمية</div>
      <button class="control-btn" onclick="toggleNotes()">✕</button>
    </div>
    <div class="notes-content" id="notes-text">
      <!-- Injected dynamically per slide -->
    </div>
  </aside>

  <!-- Embedded Geographic Data for 3D Engine -->
  <script>
    window.GEO_DATA = ${JSON.stringify(geoData)};
    window.LOGO_3D_POLYS = ${JSON.stringify(logo3DPolys)};
  </script>

  <!-- Presentation Logic & 3D WebGL Engine -->
  <script>
    // --- Slide Controller ---
    const deck = {
      currentIndex: 0,
      slides: document.querySelectorAll('.slide'),
      total: 10,
      reducedMotion: false,

      notes: [
        // Slide 1
        "الشريحة الأولى: حساباتي هي منصة سحابية PWA بديلة لأنظمة الكاشير المكتبية في مصر. الميزة الجوهرية هي تحويل الهاتف المحمول العادي إلى كاشير وقارئ باركود دون الحاجة لشراء عتاد بـ 15,000 إلى 25,000 جنيه، مع دعم الأوفلاين وأتمتة نوتة الشكك عبر الواتساب وتليجرام.",
        // Slide 2
        "الشريحة الثانية: يعاني قطاع التجزئة في مصر من 3 اختناقات متزامنة: عدم دقة المخزون وفروقات الجرد، تشتت الأنظمة بين دفاتر ورقية وبرمجيات مكتبية لا تتيح الرؤية عن بعد، وضياع مبالغ الديون بالآجل (نوتة الشكك). الحل لا يكمن في برنامج محاسبي معقد، بل في أداة تشغيل يومية سريعة.",
        // Slide 3
        "الشريحة الثالثة: المنظومة تجمع 5 وظائف محورية: نقطة البيع السريعة، المخزون وتعدد الوحدات، الفواتير المتوافقة مع الإيصال الإلكتروني وقانون 152، إدارة الديون والخزن بنظام FIFO، والتقارير الذكية. كل ذلك في واجهة عربية سريعة ومريحة.",
        // Slide 4
        "الشريحة الرابعة: استناداً للتعداد الاقتصادي السادس 2022/2023 للجهاز المركزي للتعبئة العامة والإحصاء (CAPMAS): إجمالي المنشآت الاقتصادية بمصر 3.858 مليون منشأة، تجارة التجزئة والجملة تمثل 54.4% (2.2 مليون منشأة). فجوة الرقمنة تتجاوز 99% حيث لا يستخدم البيع الرقمي سوى 21,844 منشأة. نطاق الانطلاق Beachhead بشرق الإسكندرية يركز على أحياء الرمل والمنتزه وسيدي جابر لاقتناص 50-80 متجراً بالسنة الأولى.",
        // Slide 5
        "الشريحة الخامسة: وحدة الاقتصاديات مبنية على تسعير المنشأة لا الموظف: Starter بـ 500 ج/ش، Pro بـ 1500 ج/ش. تكلفة الاستحواذ CAC بين 300 و600 ج.م عبر حملات ميتا المركزة (3000 ج.م/ش) والنزول الميداني. القيمة الممتدة LTV تقارب 10,000 ج.م بنسبة LTV:CAC قياسية تصل إلى 32:1، ونقطة التعادل تتحقق عند 20 متجراً فقط.",
        // Slide 6
        "الشريحة السادسة: استراتيجية النفاذ ترتكز على 3 مراحل: النزول الميداني المباشر بعرض تجربة حية لكاميرا الهاتف أمام التاجر في دقيقتين، ثم تفعيل شبكة الإحالات والشراكات مع محاسبي وموردي أجهزة التجزئة، ثم التوسع نحو باقي المحافظات والخليج العربي.",
        // Slide 7
        "الشريحة السابعة: تم إثبات الجاهزية التشغيلية عبر تجارب حية: قراءة الباركود بكاميرات هواتف اقتصادية في أقل من ثانية، إصدار 50 فاتورة متتالية أوفلاين في IndexedDB ومزامنتها بنجاح 100%، واعتماد التوافق مع قانون 152 للإيصال الإلكتروني بواسطة 5 محاسبين قانونيين.",
        // Slide 8
        "الشريحة الثامنة: التموضع التنافسي: الأنظمة المكتبية (MegaStore) تكلف 15-25 ألف عتاد + 10 آلاف ترقية وتفتقر للسحابة. الأنظمة السحابية الكبرى (دفترة) تسعيرها دولاري مرتفع ورسوم على كل فرع. حساباتي تقدم البديل المتكامل بالجنيه المصري وبدون أي تكلفة عتاد.",
        // Slide 9
        "الشريحة التاسعة: المؤسسان: محمد عمر رمضان (هندسة البرمجيات السحابية والمنتج والمبيعات الميدانية)، ومحمد نبيل أحمد (المدير المالي والمطابقة الضريبية والمحاسبية). تكامل بين سرعة بناء المنتج وضبط الجدوى المالية.",
        // Slide 10
        "الشريحة العاشرة: الطلب الاستثماري هو 175,000 جنيه مصري لتوفير سيولة تشغيلية لـ 12-18 شهراً. 45% للتسويق والمبيعات الميدانية، 30% للبنية التحتية ونماذج AI، 15% لتهيئة المتاجر والدعم الفني، و10% احتياطي تشغيلي. المستهدف هو الوصول لنقطة التعادل بالشهر السادس وتحقيق 50-80 متجراً نشطاً بنهاية السنة الأولى."
      ],

      init() {
        let startIdx = 0;
        const match = (window.location.href || '').match(/slide[-=](\d+)/i);
        if (match) {
          startIdx = parseInt(match[1], 10) - 1;
        }
        this.updateSlide(Math.max(0, Math.min(startIdx, this.total - 1)));
        this.setupEvents();
      },

      updateSlide(index) {
        if (index < 0 || index >= this.total) return;
        this.currentIndex = index;

        if (window.location.hash !== ('#slide-' + (index + 1)) && window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '#slide-' + (index + 1));
        }

        this.slides.forEach((s, idx) => {
          if (idx === index) {
            s.classList.add('active');
          } else {
            s.classList.remove('active');
          }
        });

        // Update Counter & Progress
        const formatted = String(index + 1).padStart(2, '0');
        document.getElementById('slide-indicator').textContent = \`\${formatted} / 10\`;
        document.getElementById('progress-bar').style.width = \`\${((index + 1) / this.total) * 100}%\`;

        // Update Notes Content
        document.getElementById('notes-slide-title').textContent = this.slides[index].getAttribute('data-title') || 'ملاحظات العارض';
        document.getElementById('notes-text').textContent = this.notes[index];

        // Trigger Scene Render for Active Slide
        if (window.renderSceneForSlide) {
          window.renderSceneForSlide(index);
        }
      },

      next() {
        if (this.currentIndex < this.total - 1) {
          this.updateSlide(this.currentIndex + 1);
        }
      },

      prev() {
        if (this.currentIndex > 0) {
          this.updateSlide(this.currentIndex - 1);
        }
      },

      goTo(index) {
        this.updateSlide(index);
      },

      setupEvents() {
        document.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
            e.preventDefault();
            this.next();
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            this.prev();
          } else if (e.key.toLowerCase() === 'n') {
            toggleNotes();
          } else if (e.key.toLowerCase() === 'f') {
            toggleFullscreen();
          } else if (e.key.toLowerCase() === 'm') {
            toggleReducedMotion();
          } else if (e.key === 'Home') {
            this.goTo(0);
          } else if (e.key === 'End') {
            this.goTo(this.total - 1);
          }
        });

        // Touch Swipe Navigation for Mobile & Tablets
        let touchStartX = 0;
        let touchEndX = 0;
        document.addEventListener('touchstart', (e) => {
          touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        document.addEventListener('touchend', (e) => {
          touchEndX = e.changedTouches[0].screenX;
          if (touchStartX - touchEndX > 50) {
            this.next();
          } else if (touchEndX - touchStartX > 50) {
            this.prev();
          }
        }, { passive: true });
      }
    };

    // --- Helper UI Toggles ---
    function toggleNotes() {
      const drawer = document.getElementById('notes-drawer');
      drawer.classList.toggle('open');
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
      } else {
        document.exitFullscreen().catch(err => console.log(err));
      }
    }

    function toggleReducedMotion() {
      deck.reducedMotion = !deck.reducedMotion;
      const btn = document.getElementById('btn-reduced-motion');
      btn.style.borderColor = deck.reducedMotion ? 'var(--amber-accent)' : 'var(--border-subtle)';
      btn.style.color = deck.reducedMotion ? 'var(--amber-accent)' : 'var(--text-muted)';
    }

    document.getElementById('btn-notes').addEventListener('click', toggleNotes);
    document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreen);
    document.getElementById('btn-reduced-motion').addEventListener('click', toggleReducedMotion);

    // ==========================================
    // THREE.JS 3D SCENES ENGINE
    // ==========================================

    const scenes = {};
    const renderers = {};
    const cameras = {};
    const animators = {};

    function initThreeStage(slideNum, buildSceneFn) {
      const canvas = document.getElementById('canvas-slide-' + slideNum);
      const stage = document.getElementById('stage-slide-' + slideNum);
      if (!canvas || !stage) return;

      const width = stage.clientWidth || 500;
      const height = stage.clientHeight || 450;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Global Subtle Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0x60a5fa, 1.2);
      dirLight.position.set(10, 20, 15);
      scene.add(dirLight);

      const bluePoint = new THREE.PointLight(0x2563eb, 2, 50);
      bluePoint.position.set(-10, -5, 10);
      scene.add(bluePoint);

      scenes[slideNum] = scene;
      cameras[slideNum] = camera;
      renderers[slideNum] = renderer;

      const customObj = buildSceneFn(scene, camera);
      animators[slideNum] = customObj;

      window.addEventListener('resize', () => {
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });
    }

    // --- SLIDE 1: 3D Hesabaty Logo with Dynamic Parallax & Halo ---
    function buildSlide1Scene(scene, camera) {
      camera.position.set(0, 0, 15);
      camera.lookAt(0, 0, 0);

      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      const logoGroup = new THREE.Group();
      rootGroup.add(logoGroup);

      const polys = window.LOGO_3D_POLYS || {};

      function makeExtruded(pts, depth, mat, edgeColor, bevel = 0.08) {
        if (!pts || pts.length < 3) return null;
        const shape = new THREE.Shape();
        pts.forEach(([x, y], idx) => {
          if (idx === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
        });
        shape.closePath();

        const geom = new THREE.ExtrudeGeometry(shape, {
          depth: depth,
          bevelEnabled: true,
          bevelSegments: 3,
          steps: 1,
          bevelSize: bevel,
          bevelThickness: bevel
        });
        geom.center(); // Center local pivot
        const mesh = new THREE.Mesh(geom, mat);

        if (edgeColor) {
          const edges = new THREE.EdgesGeometry(geom, 25);
          const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
            color: edgeColor,
            transparent: true,
            opacity: 0.55
          }));
          mesh.add(line);
        }
        return mesh;
      }

      // 1. Ribbon (Deep Royal Blue)
      const ribbonMat = new THREE.MeshStandardMaterial({
        color: 0x1d4ed8,
        metalness: 0.85,
        roughness: 0.2,
      });
      const ribbonMesh = makeExtruded(polys.ribbon, 0.75, ribbonMat, 0x60a5fa, 0.09);
      if (ribbonMesh) {
        ribbonMesh.position.set(0.05, 0.08, 0);
        logoGroup.add(ribbonMesh);
      }

      // 2. Bar 1 (Shortest - Glowing Cyan)
      const bar1Mat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.35,
        metalness: 0.4,
        roughness: 0.25,
      });
      const bar1Mesh = makeExtruded(polys.bar1, 0.95, bar1Mat, 0xbae6fd, 0.06);
      if (bar1Mesh) {
        bar1Mesh.position.set(-1.88, -1.25, 0.1);
        logoGroup.add(bar1Mesh);
      }

      // 3. Bar 2 (Medium - Vibrant Sky Blue)
      const bar2Mat = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        emissive: 0x0369a1,
        emissiveIntensity: 0.3,
        metalness: 0.5,
        roughness: 0.25,
      });
      const bar2Mesh = makeExtruded(polys.bar2, 1.1, bar2Mat, 0x7dd3fc, 0.06);
      if (bar2Mesh) {
        bar2Mesh.position.set(-0.72, -0.9, 0.18);
        logoGroup.add(bar2Mesh);
      }

      // 4. Bar 3 (Tall - Royal Blue)
      const bar3Mat = new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.25,
        metalness: 0.6,
        roughness: 0.22,
      });
      const bar3Mesh = makeExtruded(polys.bar3, 1.25, bar3Mat, 0x93c5fd, 0.06);
      if (bar3Mesh) {
        bar3Mesh.position.set(0.48, -0.42, 0.25);
        logoGroup.add(bar3Mesh);
      }

      // 5. Bar 4 (Arrow - Deep Blue with Glowing Cyan Arrow Tip)
      const bar4Mat = new THREE.MeshStandardMaterial({
        color: 0x1e40af,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.45,
        metalness: 0.75,
        roughness: 0.18,
      });
      const bar4Mesh = makeExtruded(polys.bar4, 1.45, bar4Mat, 0x38bdf8, 0.08);
      if (bar4Mesh) {
        bar4Mesh.position.set(1.76, 0.35, 0.35);
        logoGroup.add(bar4Mesh);
      }

      // Glass Pedestal Disc Beneath
      const discGeo = new THREE.CylinderGeometry(5.6, 5.8, 0.25, 64);
      const discMat = new THREE.MeshStandardMaterial({
        color: 0x0b162c,
        metalness: 0.9,
        roughness: 0.15,
        transparent: true,
        opacity: 0.65
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.set(0, -4.8, -1.2);
      disc.rotation.x = 0.4;
      rootGroup.add(disc);

      // Glowing Halo Ring around Pedestal
      const ringGeo = new THREE.TorusGeometry(6.0, 0.045, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(disc.position);
      ring.rotation.x = disc.rotation.x;
      rootGroup.add(ring);

      // 4 Orbiting 3D Satellite Nodes (Pillars of Hesabaty)
      const satellites = [];
      const satColors = [0x38bdf8, 0x60a5fa, 0x10b981, 0x93c5fd];
      for (let i = 0; i < 4; i++) {
        const satGeo = new THREE.SphereGeometry(0.32, 16, 16);
        const satMat = new THREE.MeshStandardMaterial({
          color: satColors[i],
          emissive: satColors[i],
          emissiveIntensity: 0.4,
          roughness: 0.2
        });
        const sat = new THREE.Mesh(satGeo, satMat);
        rootGroup.add(sat);
        satellites.push({
          mesh: sat,
          angle: (i / 4) * Math.PI * 2,
          radius: 5.6 + (i % 2) * 0.8,
          speed: 0.4 + i * 0.08,
          yOffset: (i - 1.5) * 1.5
        });
      }

      // Specular Dynamic Light for Metallic Reflections
      const specLight = new THREE.PointLight(0x60a5fa, 2.5, 30);
      specLight.position.set(4, 5, 8);
      scene.add(specLight);

      // Ambient Particle Dust
      const partGeo = new THREE.BufferGeometry();
      const partCount = 100;
      const posArray = new Float32Array(partCount * 3);
      for (let i = 0; i < partCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 18;
      }
      partGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const partMat = new THREE.PointsMaterial({ size: 0.08, color: 0x60a5fa, transparent: true, opacity: 0.65 });
      const particles = new THREE.Points(partGeo, partMat);
      scene.add(particles);

      // Interactive Mouse Parallax
      let mouseX = 0, mouseY = 0;
      const stageElem = document.getElementById('stage-slide-1');
      if (stageElem) {
        stageElem.addEventListener('mousemove', (e) => {
          const rect = stageElem.getBoundingClientRect();
          mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        });
        stageElem.addEventListener('mouseleave', () => {
          mouseX = 0;
          mouseY = 0;
        });
      }

      return {
        update(time) {
          // Smooth Parallax Rotation
          const targetRotY = mouseX * 0.55 + Math.sin(time * 0.4) * 0.12;
          const targetRotX = -mouseY * 0.35 + 0.18 + Math.cos(time * 0.5) * 0.06;
          logoGroup.rotation.y += (targetRotY - logoGroup.rotation.y) * 0.08;
          logoGroup.rotation.x += (targetRotX - logoGroup.rotation.x) * 0.08;

          // Floating Hover
          logoGroup.position.y = Math.sin(time * 0.8) * 0.22;

          // Subtle Bar Wave Elevation
          if (bar1Mesh) bar1Mesh.position.z = 0.1 + Math.sin(time * 2.2) * 0.05;
          if (bar2Mesh) bar2Mesh.position.z = 0.18 + Math.sin(time * 2.2 + 0.5) * 0.06;
          if (bar3Mesh) bar3Mesh.position.z = 0.25 + Math.sin(time * 2.2 + 1.0) * 0.07;
          if (bar4Mesh) bar4Mesh.position.z = 0.35 + Math.sin(time * 2.2 + 1.5) * 0.08;

          // Orbiting Satellites
          satellites.forEach(sat => {
            const currentAngle = sat.angle + time * sat.speed * 0.6;
            sat.mesh.position.set(
              Math.cos(currentAngle) * sat.radius,
              sat.yOffset + Math.sin(time * 1.2 + sat.angle) * 0.3,
              Math.sin(currentAngle) * (sat.radius * 0.5)
            );
          });

          // Pedestal subtle rotation
          disc.rotation.y = time * 0.1;
          ring.rotation.z = time * 0.15;
          particles.rotation.y = time * 0.02;

          // Orbit specular light
          specLight.position.x = Math.sin(time * 0.6) * 8;
          specLight.position.y = 4 + Math.cos(time * 0.4) * 3;
        }
      };
    }

    // --- SLIDE 2: Realistic Retail Operational Audit (The Problem) ---
    function buildSlide2Scene(scene, camera) {
      camera.position.set(0, 5.5, 14.5);
      camera.lookAt(0, 0, 0);

      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      // Desk ambient and spot lighting
      const deskLamp = new THREE.PointLight(0xffedd5, 1.8, 25);
      deskLamp.position.set(-3, 6, 4);
      scene.add(deskLamp);

      const alertLight = new THREE.PointLight(0xef4444, 1.5, 20);
      alertLight.position.set(4, 4, 3);
      scene.add(alertLight);

      // Mouse Parallax Setup
      let mouseX = 0, mouseY = 0;
      const stageElem = document.getElementById('stage-slide-2');
      if (stageElem) {
        stageElem.addEventListener('mousemove', (e) => {
          const rect = stageElem.getBoundingClientRect();
          mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        });
        stageElem.addEventListener('mouseleave', () => {
          mouseX = 0;
          mouseY = 0;
        });
      }

      // Cinematic Camera Presets for Problem Focus
      const OVERVIEW_INDEX = -1;
      let activeTargetIndex = OVERVIEW_INDEX;

      const camPresets = [
        // Target 0: Shelf (عجز وفروقات المخزون)
        {
          camPos: new THREE.Vector3(3.6, 0.3, 4.2),
          lookTarget: new THREE.Vector3(3.7, -0.1, -1.6)
        },
        // Target 1: POS Computer & Crash Screen (أنظمة مكتبية وعتاد باهظ)
        {
          camPos: new THREE.Vector3(-0.3, 0.0, 3.8),
          lookTarget: new THREE.Vector3(-0.3, -0.9, -0.3)
        },
        // Target 2: Debt Notebook (ضياع ديون الشكك)
        {
          camPos: new THREE.Vector3(-3.2, 0.2, 3.4),
          lookTarget: new THREE.Vector3(-3.2, -2.2, 0.7)
        }
      ];

      const overviewPreset = {
        camPos: new THREE.Vector3(0, 5.5, 14.5),
        lookTarget: new THREE.Vector3(0, 0, 0)
      };

      const currentCamPos = overviewPreset.camPos.clone();
      const currentLookAt = overviewPreset.lookTarget.clone();
      const targetCamPos = overviewPreset.camPos.clone();
      const targetLookAt = overviewPreset.lookTarget.clone();
      camera.position.copy(currentCamPos);
      camera.lookAt(currentLookAt);

      const cards = [
        document.getElementById('card-prob-0'),
        document.getElementById('card-prob-1'),
        document.getElementById('card-prob-2')
      ];

      function setActiveTarget(idx) {
        if (activeTargetIndex === idx) {
          activeTargetIndex = OVERVIEW_INDEX;
        } else {
          activeTargetIndex = idx;
        }

        cards.forEach((card, i) => {
          if (!card) return;
          if (i === activeTargetIndex) {
            card.classList.add('active');
          } else {
            card.classList.remove('active');
          }
        });

        if (activeTargetIndex === OVERVIEW_INDEX) {
          targetCamPos.copy(overviewPreset.camPos);
          targetLookAt.copy(overviewPreset.lookTarget);
        } else {
          targetCamPos.copy(camPresets[activeTargetIndex].camPos);
          targetLookAt.copy(camPresets[activeTargetIndex].lookTarget);
        }
      }

      cards.forEach((card, i) => {
        if (card) {
          card.addEventListener('click', (e) => {
            e.stopPropagation();
            setActiveTarget(i);
          });
        }
      });

      if (stageElem) {
        stageElem.addEventListener('click', () => {
          if (activeTargetIndex !== OVERVIEW_INDEX) {
            setActiveTarget(OVERVIEW_INDEX);
          }
        });
      }

      // ==========================================
      // TEXTURE GENERATORS (High Detail & Meaningful)
      // ==========================================

      // 1. Arabic Debt Ledger Texture ("نوتة الشكك")
      function makeLedgerTexture() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 512;
        const ctx = c.getContext('2d');

        // Aged paper background
        ctx.fillStyle = '#fefce8';
        ctx.fillRect(0, 0, 512, 512);

        // Lined paper rules
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        for (let y = 60; y < 512; y += 32) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(512, y);
          ctx.stroke();
        }

        // Red margin line
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(100, 0);
        ctx.lineTo(100, 512);
        ctx.stroke();

        // Arabic handwritten records
        ctx.font = 'bold 22px Cairo, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.direction = 'rtl';
        ctx.fillText('دفتر حسابات الشكك والآجل (2026)', 480, 42);

        ctx.font = '17px Cairo, sans-serif';
        ctx.fillStyle = '#334155';
        ctx.fillText('• الحاج إبراهيم: 2,850 ج.م (متأخر)', 480, 92);
        ctx.fillText('• كمال عطية: 4,100 ج.م (دفعة ناقصة)', 480, 124);
        ctx.fillText('• محل الأمل: 1,450 ج.م (غير مسجل)', 480, 156);
        ctx.fillText('• توريدات ألبان: 7,200 ج.م (مستحق مورد)', 480, 188);
        ctx.fillText('• سيد البقال: 950 ج.م (شكك)', 480, 220);

        // Coffee mug ring stain
        ctx.save();
        ctx.beginPath();
        ctx.arc(360, 360, 55, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(180, 83, 9, 0.25)';
        ctx.lineWidth = 8;
        ctx.stroke();
        ctx.restore();

        // Big Red Warning Stamp
        ctx.save();
        ctx.translate(260, 340);
        ctx.rotate(-0.2);
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 4;
        ctx.strokeRect(-120, -32, 240, 64);
        ctx.font = 'bold 24px Cairo, sans-serif';
        ctx.fillStyle = '#dc2626';
        ctx.fillText('مخاطر ديون معدومة', 105, 10);
        ctx.restore();

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      // 2. Retail Product Box Texture
      function makeProductTexture(title, subtitle, barcodeStr, bgColor, tagColor) {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, 256, 256);

        // Top Brand Header Banner
        ctx.fillStyle = tagColor;
        ctx.fillRect(8, 8, 240, 60);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Cairo, sans-serif';
        ctx.direction = 'rtl';
        ctx.fillText(title, 230, 46);

        // Subtitle
        ctx.font = '14px Cairo, sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(subtitle, 230, 95);

        // Realistic Barcode Area
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(25, 145, 206, 75);

        ctx.fillStyle = '#000000';
        for (let x = 35; x < 220; x += 5) {
          if (Math.random() > 0.25) {
            ctx.fillRect(x, 152, Math.random() > 0.5 ? 3 : 2, 48);
          }
        }
        ctx.font = '12px Outfit, monospace';
        ctx.direction = 'ltr';
        ctx.fillText(barcodeStr, 65, 212);

        return new THREE.CanvasTexture(c);
      }

      // 3. Thermal Paper Receipt Texture
      function makeReceiptTexture() {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 512;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, 256, 512);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 15px Courier, monospace';
        ctx.direction = 'ltr';
        ctx.fillText('*** LOCAL RETAIL POS ***', 18, 30);
        ctx.fillText('DATE: 2026-02-14  19:24', 18, 55);
        ctx.fillText('TERMINAL ID: POS-01-OFFLINE', 18, 75);
        ctx.fillText('========================', 18, 95);
        ctx.fillText('ITEM 102          65.00', 18, 125);
        ctx.fillText('ITEM 409         180.00', 18, 150);
        ctx.fillText('ITEM 881         340.00', 18, 175);
        ctx.fillText('------------------------', 18, 205);
        ctx.fillText('TOTAL EGP:       585.00', 18, 235);
        ctx.fillText('CASH TENDERED:   600.00', 18, 260);
        ctx.fillText('CHANGE:           15.00', 18, 285);

        // Red Warning Overlay
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 16px Cairo, sans-serif';
        ctx.direction = 'rtl';
        ctx.fillText('غير مربوط بالإيصال الإلكتروني', 235, 340);
        ctx.fillText('فاتورة ورقية - بدون سحابة', 235, 370);
        ctx.fillText('مخالفة لقانون 206 لسنة 2020', 235, 400);

        return new THREE.CanvasTexture(c);
      }

      // 4. Realistic Computer Desktop Error UI Texture
      function makeComputerScreenTexture() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 340;
        const ctx = c.getContext('2d');

        // Dark Desktop background
        ctx.fillStyle = '#09101d';
        ctx.fillRect(0, 0, 512, 340);

        // Top App Bar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(16, 16, 480, 308);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.strokeRect(16, 16, 480, 308);

        // Title Bar
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(18, 18, 476, 38);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Cairo, sans-serif';
        ctx.direction = 'rtl';
        ctx.fillText('نظام الكاشير المكتبي - [خطأ جسيم في الاتصال]', 470, 44);

        ctx.direction = 'ltr';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('[X]', 30, 43);

        // Error Dialog Box
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(40, 75, 432, 220);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(40, 75, 432, 220);

        // Alert Icon
        ctx.font = '36px sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('⚠️', 60, 130);

        // Messages
        ctx.font = 'bold 18px Cairo, sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.direction = 'rtl';
        ctx.fillText('فشل النظام: قاعدة البيانات المحلية معطلة', 450, 120);

        ctx.font = '14px Cairo, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('• لا يدعم السحابة (Local Offline Lock-in)', 450, 155);
        ctx.fillText('• توقف عمليات البيع وحفظ الفواتير فوراً', 450, 185);
        ctx.fillText('• رسوم صيانة وترقية باهظة (10,000 ج.م)', 450, 215);

        // Retry Button
        ctx.fillStyle = '#334155';
        ctx.fillRect(180, 245, 140, 34);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Cairo, sans-serif';
        ctx.fillText('إعادة المحاولة', 255, 268);

        return new THREE.CanvasTexture(c);
      }

      // 5. Computer Keyboard Texture
      function makeKeyboardTexture() {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 128;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 256, 128);

        // Keys grid
        ctx.fillStyle = '#334155';
        for (let r = 0; r < 4; r++) {
          for (let col = 0; col < 14; col++) {
            ctx.fillRect(8 + col * 17, 10 + r * 22, 13, 16);
          }
        }
        // Spacebar
        ctx.fillRect(65, 100, 120, 18);
        return new THREE.CanvasTexture(c);
      }

      // 6. Floating 3D HUD Badge Texture
      function makeHudCardTexture(badgeTitle, badgeValue, iconEmoji, accentColor) {
        const c = document.createElement('canvas');
        c.width = 384;
        c.height = 128;
        const ctx = c.getContext('2d');

        // Glass dark background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fillRect(0, 0, 384, 128);

        // Glowing border
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 380, 124);

        // Icon circle
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(330, 64, 34, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '32px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(iconEmoji, 314, 76);

        // Text details
        ctx.font = 'bold 20px Cairo, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.direction = 'rtl';
        ctx.fillText(badgeTitle, 280, 50);

        ctx.font = '16px Cairo, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(badgeValue, 280, 85);

        return new THREE.CanvasTexture(c);
      }

      // ==========================================
      // 3D GEOMETRIES & SCENE COMPOSITION
      // ==========================================

      // The Retail Counter Base (المنضدة واسعة ومريحة لجميع العناصر)
      const counterGeo = new THREE.BoxGeometry(13.5, 0.6, 7.5);
      const counterMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.8,
        roughness: 0.3
      });
      const counter = new THREE.Mesh(counterGeo, counterMat);
      counter.position.set(0, -2.8, 0);
      rootGroup.add(counter);

      const counterEdges = new THREE.EdgesGeometry(counterGeo);
      counter.add(new THREE.LineSegments(counterEdges, new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.3 })));

      // ------------------------------------------
      // 1. The Realistic Debt Notebook ("نوتة الشكك")
      // ------------------------------------------
      const ledgerGroup = new THREE.Group();
      // Lying perfectly flat on the counter (zero x/z tilt to eliminate table clipping)
      ledgerGroup.position.set(-3.5, -2.42, 0.6);
      ledgerGroup.rotation.set(0, 0.18, 0);
      rootGroup.add(ledgerGroup);

      const ledgerCoverGeo = new THREE.BoxGeometry(2.6, 0.14, 3.4);
      const ledgerCoverMat = new THREE.MeshStandardMaterial({ color: 0x881337, roughness: 0.7 });
      const ledgerCover = new THREE.Mesh(ledgerCoverGeo, ledgerCoverMat);
      ledgerGroup.add(ledgerCover);

      const ledgerPageGeo = new THREE.PlaneGeometry(2.45, 3.25);
      const ledgerPageMat = new THREE.MeshBasicMaterial({
        map: makeLedgerTexture(),
        side: THREE.DoubleSide
      });
      const ledgerPage = new THREE.Mesh(ledgerPageGeo, ledgerPageMat);
      ledgerPage.rotation.x = -Math.PI / 2;
      ledgerPage.position.y = 0.08;
      ledgerGroup.add(ledgerPage);

      // Spiral wire along spine
      for (let i = 0; i < 11; i++) {
        const ringGeo = new THREE.TorusGeometry(0.11, 0.022, 8, 24);
        const ring = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9 }));
        ring.position.set(-1.3, 0.08, -1.4 + i * 0.28);
        ring.rotation.y = Math.PI / 2;
        ledgerGroup.add(ring);
      }

      // ------------------------------------------
      // 2. Retail Store Shelf with Mismatched Stock
      // ------------------------------------------
      const shelfGroup = new THREE.Group();
      shelfGroup.position.set(3.8, -0.6, -1.6);
      rootGroup.add(shelfGroup);

      const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
      const shelfTier1 = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.12, 1.8), frameMat);
      shelfTier1.position.set(0, -1.8, 0);
      shelfGroup.add(shelfTier1);

      const shelfTier2 = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.12, 1.8), frameMat);
      shelfTier2.position.set(0, 0.2, 0);
      shelfGroup.add(shelfTier2);

      // Product Boxes
      const box1Mat = new THREE.MeshStandardMaterial({ map: makeProductTexture('أرز الضحى', 'عبوة 1 كجم - كود 982', '622104928172', '#0f766e', '#0d9488') });
      const box1 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 0.8), box1Mat);
      box1.position.set(-1.4, -1.0, 0);
      shelfGroup.add(box1);

      const box2Mat = new THREE.MeshStandardMaterial({ map: makeProductTexture('زيت كريستال', 'ذرة 800 مللي', '622400192831', '#b45309', '#d97706') });
      const box2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.5, 0.8), box2Mat);
      box2.position.set(-0.2, -0.95, 0);
      shelfGroup.add(box2);

      // Empty slot with blinking red alert
      const emptySlotGeo = new THREE.BoxGeometry(1.0, 1.4, 0.8);
      const emptySlotEdges = new THREE.EdgesGeometry(emptySlotGeo);
      const emptySlotLine = new THREE.LineSegments(emptySlotEdges, new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 }));
      emptySlotLine.position.set(1.2, -1.0, 0);
      shelfGroup.add(emptySlotLine);

      // Top Shelf Boxes
      const box3Mat = new THREE.MeshStandardMaterial({ map: makeProductTexture('مسحوق غسيل', 'أوتوماتيك 2.5 كجم', '622991028371', '#1d4ed8', '#2563eb') });
      const box3 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 0.8), box3Mat);
      box3.position.set(-1.0, 1.1, 0);
      shelfGroup.add(box3);

      const box4Mat = new THREE.MeshStandardMaterial({ map: makeProductTexture('شاي العروسة', 'أسود ناعم 250 جم', '622119028122', '#be123c', '#e11d48') });
      const box4 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.3, 0.8), box4Mat);
      box4.position.set(0.4, 0.95, 0);
      shelfGroup.add(box4);

      // ------------------------------------------
      // 3. Real Desktop Computer & Retail POS Terminal
      // ------------------------------------------
      const pcGroup = new THREE.Group();
      pcGroup.position.set(-0.3, -2.4, -0.2);
      rootGroup.add(pcGroup);

      // Cash Drawer base sitting directly on counter
      const cashDrawerGeo = new THREE.BoxGeometry(2.8, 0.42, 2.5);
      const cashDrawerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 });
      const cashDrawer = new THREE.Mesh(cashDrawerGeo, cashDrawerMat);
      cashDrawer.position.set(0, 0.21, 0);
      pcGroup.add(cashDrawer);

      // Drawer Keyhole & seam line
      const keyhole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 12), new THREE.MeshBasicMaterial({ color: 0x94a3b8 }));
      keyhole.rotation.x = Math.PI / 2;
      keyhole.position.set(0.7, 0.21, 1.26);
      pcGroup.add(keyhole);

      // Monitor Stand Base & Neck
      const standBase = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 0.8), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 }));
      standBase.position.set(0, 0.45, -0.2);
      pcGroup.add(standBase);

      const standNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.85, 16), new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.95 }));
      standNeck.position.set(0, 0.92, -0.3);
      pcGroup.add(standNeck);

      // Monitor Frame
      const monFrameGeo = new THREE.BoxGeometry(2.5, 1.65, 0.14);
      const monFrameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
      const monFrame = new THREE.Mesh(monFrameGeo, monFrameMat);
      monFrame.position.set(0, 1.55, -0.25);
      monFrame.rotation.x = -0.1;
      pcGroup.add(monFrame);

      // Computer Screen LCD with realistic Error UI
      const lcdGeo = new THREE.PlaneGeometry(2.36, 1.5);
      const lcdMat = new THREE.MeshBasicMaterial({ map: makeComputerScreenTexture() });
      const lcd = new THREE.Mesh(lcdGeo, lcdMat);
      lcd.position.set(0, 1.55, -0.17);
      lcd.rotation.x = -0.1;
      pcGroup.add(lcd);

      // Keyboard lying on counter in front
      const kbGeo = new THREE.BoxGeometry(2.3, 0.06, 0.85);
      const kbMat = new THREE.MeshStandardMaterial({ map: makeKeyboardTexture() });
      const keyboard = new THREE.Mesh(kbGeo, kbMat);
      keyboard.position.set(0, 0.03, 1.6);
      keyboard.rotation.x = -0.05;
      pcGroup.add(keyboard);

      // Mouse beside keyboard
      const mouseGeo = new THREE.BoxGeometry(0.26, 0.11, 0.42);
      const mouseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
      const mouse = new THREE.Mesh(mouseGeo, mouseMat);
      mouse.position.set(1.4, 0.05, 1.6);
      mouse.rotation.y = -0.1;
      pcGroup.add(mouse);

      // ------------------------------------------
      // 4. Dedicated Thermal Receipt Printer (Placed with clear clearance at x=2.2)
      // ------------------------------------------
      const printerGroup = new THREE.Group();
      printerGroup.position.set(2.2, -2.4, 0.2);
      rootGroup.add(printerGroup);

      // Thermal Printer Body
      const printerBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.75, 1.1),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.3 })
      );
      printerBody.position.set(0, 0.38, 0);
      printerGroup.add(printerBody);

      // Paper Exit Slit on Printer Top
      const slit = new THREE.Mesh(
        new THREE.BoxGeometry(0.72, 0.04, 0.06),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
      );
      slit.position.set(0, 0.76, 0.2);
      printerGroup.add(slit);

      // Receipt Paper - Lies FLAT on the table surface in front of printer, completely free of any collision!
      const receiptGeo = new THREE.PlaneGeometry(0.72, 1.7);
      const receiptMat = new THREE.MeshBasicMaterial({
        map: makeReceiptTexture(),
        side: THREE.DoubleSide
      });
      const receiptMesh = new THREE.Mesh(receiptGeo, receiptMat);
      // Flat on counter (rotation.x = -Math.PI / 2) with slight natural angle
      receiptMesh.rotation.set(-Math.PI / 2, 0, 0.08);
      receiptMesh.position.set(0, 0.02, 1.25);
      printerGroup.add(receiptMesh);

      // ------------------------------------------
      // 5. Floating 3D Metric HUD Callout Badges
      // ------------------------------------------
      const hudGroup = new THREE.Group();
      rootGroup.add(hudGroup);

      function createHudPlane(texture, x, y, z) {
        const geo = new THREE.PlaneGeometry(2.8, 0.95);
        const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        hudGroup.add(mesh);
        return mesh;
      }

      // Callout 1: Debt Ledger Blindspot (Above Ledger)
      const hudDebt = createHudPlane(
        makeHudCardTexture('نوتة الشكك الورقية', '42,000 ج.م ديون معلقة ومعرضة للضياع', '📑', '#ef4444'),
        -3.6, 1.8, 0.8
      );

      // Callout 2: Computer Hardware CapEx (Directly Above Computer)
      const hudCapex = createHudPlane(
        makeHudCardTexture('تكلفة العتاد الرأسمالي', '20,000+ ج.م لشراء أجهزة كاشير منفصلة', '💻', '#38bdf8'),
        -0.2, 2.4, -0.3
      );

      // Callout 3: Inventory Discrepancies (Above Shelf)
      const hudStock = createHudPlane(
        makeHudCardTexture('فروقات الجرد والوحدات', 'عجز صامت: -18% لغياب تتبع الدفعات', '📦', '#f59e0b'),
        3.4, 1.8, -1.5
      );

      return {
        update(time) {
          // Smooth cinematic camera interpolation
          currentCamPos.lerp(targetCamPos, 0.055);
          currentLookAt.lerp(targetLookAt, 0.055);
          camera.position.copy(currentCamPos);
          camera.lookAt(currentLookAt);

          // Subtle hover for HUD badges
          hudDebt.position.y = 1.8 + Math.sin(time * 1.5) * 0.08;
          hudCapex.position.y = 2.4 + Math.sin(time * 1.5 + 1.0) * 0.08;
          hudStock.position.y = 1.8 + Math.sin(time * 1.5 + 2.0) * 0.08;

          // Blinking empty shelf alert slot
          const blink = Math.sin(time * 4) > 0;
          emptySlotLine.visible = blink;

          // Mouse Parallax across the retail counter (softened when zoomed in)
          const pWeight = activeTargetIndex === OVERVIEW_INDEX ? 1.0 : 0.25;
          const targetRotY = (mouseX * 0.32 + Math.sin(time * 0.4) * 0.03) * pWeight;
          const targetRotX = (-mouseY * 0.22 + 0.12 + Math.cos(time * 0.5) * 0.02) * pWeight;
          rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.08;
          rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.08;
        }
      };
    }

    // --- SLIDE 3: The Solution (Smartphone Hub & 4 Operational Pods) ---
    function buildSlide3Scene(scene, camera) {
      camera.position.set(0, 0, 18.2);
      camera.lookAt(0, 0, 0);

      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      // Mouse Parallax Setup
      let mouseX = 0, mouseY = 0;
      const stageElem = document.getElementById('stage-slide-3');
      if (stageElem) {
        stageElem.addEventListener('mousemove', (e) => {
          const rect = stageElem.getBoundingClientRect();
          mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        });
        stageElem.addEventListener('mouseleave', () => {
          mouseX = 0;
          mouseY = 0;
        });
      }

      // Cinematic Camera Presets for Solution Hub & 4 Operational Pods
      const OVERVIEW_INDEX = -1;
      let activeTargetIndex = OVERVIEW_INDEX;

      const camPresets = [
        // Target 0: Central 3D Smartphone (كاشير الموبايل السريع)
        {
          camPos: new THREE.Vector3(0.0, 0.0, 10.5),
          lookTarget: new THREE.Vector3(0.0, 0.0, 0.5)
        },
        // Target 1: Multi-Unit Inventory Pod (المخزون متعدد الوحدات) - Top-Left
        {
          camPos: new THREE.Vector3(-4.8, 2.6, 5.8),
          lookTarget: new THREE.Vector3(-4.8, 2.6, -0.5)
        },
        // Target 2: B2C Tax Compliance Pod (الإيصال الإلكتروني المعتمد) - Bottom-Right
        {
          camPos: new THREE.Vector3(4.8, -2.6, 5.8),
          lookTarget: new THREE.Vector3(4.8, -2.6, -0.5)
        },
        // Target 3: WhatsApp Invoicing Pod (أتمتة الشكك بالواتساب) - Top-Right
        {
          camPos: new THREE.Vector3(4.8, 2.6, 5.8),
          lookTarget: new THREE.Vector3(4.8, 2.6, -0.5)
        }
      ];

      const overviewPreset = {
        camPos: new THREE.Vector3(0, 0, 18.2),
        lookTarget: new THREE.Vector3(0, 0, 0)
      };

      const currentCamPos = overviewPreset.camPos.clone();
      const currentLookAt = overviewPreset.lookTarget.clone();
      const targetCamPos = overviewPreset.camPos.clone();
      const targetLookAt = overviewPreset.lookTarget.clone();
      camera.position.copy(currentCamPos);
      camera.lookAt(currentLookAt);

      const cards = [
        document.getElementById('card-sol-0'),
        document.getElementById('card-sol-1'),
        document.getElementById('card-sol-2'),
        document.getElementById('card-sol-3')
      ];

      function setActiveTarget(idx) {
        if (activeTargetIndex === idx) {
          activeTargetIndex = OVERVIEW_INDEX;
        } else {
          activeTargetIndex = idx;
        }

        cards.forEach((card, i) => {
          if (!card) return;
          if (i === activeTargetIndex) {
            card.classList.add('active');
          } else {
            card.classList.remove('active');
          }
        });

        if (activeTargetIndex === OVERVIEW_INDEX) {
          targetCamPos.copy(overviewPreset.camPos);
          targetLookAt.copy(overviewPreset.lookTarget);
        } else {
          targetCamPos.copy(camPresets[activeTargetIndex].camPos);
          targetLookAt.copy(camPresets[activeTargetIndex].lookTarget);
        }
      }

      cards.forEach((card, i) => {
        if (card) {
          card.addEventListener('click', (e) => {
            e.stopPropagation();
            setActiveTarget(i);
          });
        }
      });

      if (stageElem) {
        stageElem.addEventListener('click', () => {
          if (activeTargetIndex !== OVERVIEW_INDEX) {
            setActiveTarget(OVERVIEW_INDEX);
          }
        });
      }

      // ==========================================
      // TEXTURE GENERATORS (Detailed & Professional)
      // ==========================================

      // 1. Phone Screen Interface (Hesabaty Mobile POS PWA)
      function makePhoneScreenTexture() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 960;
        const ctx = c.getContext('2d');

        // Dark background
        ctx.fillStyle = '#07111f';
        ctx.fillRect(0, 0, 512, 960);

        // Status bar
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 16px Outfit, sans-serif';
        ctx.fillText('19:42', 25, 35);
        ctx.fillText('⚡ 98%', 440, 35);

        // App Top Bar
        ctx.fillStyle = '#0b162c';
        ctx.fillRect(0, 50, 512, 70);
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.2)';
        ctx.strokeRect(0, 50, 512, 70);

        ctx.font = 'bold 24px Cairo, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.direction = 'rtl';
        ctx.fillText('حساباتي | نقطة البيع السريعة', 485, 95);

        // Camera Viewfinder Box (Barcode Scanning)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(30, 145, 452, 340);
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        ctx.strokeRect(30, 145, 452, 340);

        // Viewfinder reticle corners
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 6;
        // Top-left
        ctx.beginPath(); ctx.moveTo(30, 195); ctx.lineTo(30, 145); ctx.lineTo(80, 145); ctx.stroke();
        // Top-right
        ctx.beginPath(); ctx.moveTo(432, 145); ctx.lineTo(482, 145); ctx.lineTo(482, 195); ctx.stroke();
        // Bottom-left
        ctx.beginPath(); ctx.moveTo(30, 435); ctx.lineTo(30, 485); ctx.lineTo(80, 485); ctx.stroke();
        // Bottom-right
        ctx.beginPath(); ctx.moveTo(432, 485); ctx.lineTo(482, 485); ctx.lineTo(482, 435); ctx.stroke();

        // Barcode in viewfinder
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(110, 240, 292, 95);
        ctx.fillStyle = '#000000';
        for (let x = 125; x < 385; x += 6) {
          if (Math.random() > 0.25) {
            ctx.fillRect(x, 250, Math.random() > 0.5 ? 4 : 2, 60);
          }
        }
        ctx.font = '14px Outfit, monospace';
        ctx.direction = 'ltr';
        ctx.fillText('622104928172 - SCANNING', 170, 325);

        // Scan Speed Tag
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.fillRect(130, 410, 252, 45);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.strokeRect(130, 410, 252, 45);
        ctx.font = 'bold 18px Cairo, sans-serif';
        ctx.fillStyle = '#10b981';
        ctx.direction = 'rtl';
        ctx.fillText('⚡ سرعة القراءة: < ثانية واحدة', 360, 440);

        // Cart items list
        ctx.font = 'bold 20px Cairo, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText('سلة المبيعات الحالية (3 أصناف):', 485, 530);

        // Item row 1
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(30, 550, 452, 65);
        ctx.font = '18px Cairo, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('• أرز الضحى 1 كجم (1 قطعة)', 465, 590);
        ctx.direction = 'ltr';
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 18px Outfit, sans-serif';
        ctx.fillText('38.00 EGP', 50, 590);

        // Item row 2
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(30, 625, 452, 65);
        ctx.direction = 'rtl';
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Cairo, sans-serif';
        ctx.fillText('• شاي العروسة 250 جم (1 علبة)', 465, 665);
        ctx.direction = 'ltr';
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 18px Outfit, sans-serif';
        ctx.fillText('28.50 EGP', 50, 665);

        // Checkout Button
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(30, 720, 452, 85);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Cairo, sans-serif';
        ctx.direction = 'rtl';
        ctx.fillText('✓ إتمام البيع والفاتورة | 66.50 ج.م', 420, 772);

        // Bottom Cloud Sync Bar
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.fillRect(30, 830, 452, 50);
        ctx.font = '16px Cairo, sans-serif';
        ctx.fillStyle = '#10b981';
        ctx.fillText('🟢 متصل بالسحابة | IndexedDB جاهز للعمل أوفلاين', 460, 862);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      // 2. WhatsApp Invoicing Pod Texture
      function makeWhatsAppPodTexture() {
        const c = document.createElement('canvas');
        c.width = 440;
        c.height = 240;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#064e3b';
        ctx.fillRect(0, 0, 440, 240);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 436, 236);

        // Header
        ctx.fillStyle = '#10b981';
        ctx.fillRect(0, 0, 440, 45);
        ctx.font = 'bold 18px Cairo, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.direction = 'rtl';
        ctx.fillText('💬 أتمتة الفواتير والشكك (WhatsApp & Telegram)', 425, 30);

        // Message body
        ctx.font = 'bold 18px Cairo, sans-serif';
        ctx.fillStyle = '#a7f3d0';
        ctx.fillText('فاتورة مبيعات معتمدة #1042', 425, 80);

        ctx.font = '15px Cairo, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('• إجمالي الفاتورة: 500.00 ج.م (سداد نقدي)', 425, 115);
        ctx.fillText('• تسوية رصيد الشكك بنظام FIFO: تم تصفير الدين', 425, 145);
        ctx.fillText('• رابط الفاتورة الإلكترونية مع رمز QR فوري', 425, 175);

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 14px Outfit, sans-serif';
        ctx.direction = 'ltr';
        ctx.fillText('Delivered ✓✓  19:42', 20, 220);

        return new THREE.CanvasTexture(c);
      }

      // 3. Multi-Unit Inventory Pod Texture
      function makeInventoryPodTexture() {
        const c = document.createElement('canvas');
        c.width = 440;
        c.height = 240;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 440, 240);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 436, 236);

        // Header
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(0, 0, 440, 45);
        ctx.font = 'bold 18px Cairo, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.direction = 'rtl';
        ctx.fillText('📦 إدارة المخزون وتعدد الوحدات (Multi-Unit)', 425, 30);

        // Body
        ctx.font = 'bold 18px Cairo, sans-serif';
        ctx.fillStyle = '#bae6fd';
        ctx.fillText('تتبع دقيق لدفعات وتواريخ الصلاحية:', 425, 80);

        ctx.font = '15px Cairo, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText('• 1 كرتونة = 24 علبة (تحويل آلي فوري عند البيع)', 425, 115);
        ctx.fillText('• دفعة رقم: #2026-Batch-04 | الصلاحية: 2027/08', 425, 145);
        ctx.fillText('• تنبيه ذكي بالنواقص لمنع ركود البضائع في المحل', 425, 175);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 14px Cairo, sans-serif';
        ctx.fillText('🟢 حالة المخزون: منضبط 100%', 425, 215);

        return new THREE.CanvasTexture(c);
      }

      // 4. B2C Electronic Tax Compliance Pod Texture
      function makeTaxPodTexture() {
        const c = document.createElement('canvas');
        c.width = 440;
        c.height = 240;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(0, 0, 440, 240);
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 436, 236);

        // Header
        ctx.fillStyle = '#4f46e5';
        ctx.fillRect(0, 0, 440, 45);
        ctx.font = 'bold 18px Cairo, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.direction = 'rtl';
        ctx.fillText('⚖️ منظومة الإيصال الإلكتروني B2C والضرائب', 425, 30);

        // Body
        ctx.font = 'bold 18px Cairo, sans-serif';
        ctx.fillStyle = '#c7d2fe';
        ctx.fillText('جاهزية وتوافق تشريعي وضريبي كامل:', 425, 80);

        ctx.font = '15px Cairo, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText('• متوافق مع قانون الإجراءات الضريبية 206 لسنة 2020', 425, 115);
        ctx.fillText('• متوافق مع ضوابط وتسهيلات قانون 152 لسنة 2020', 425, 145);
        ctx.fillText('• تقارير حجم الأعمال السنوية معتمدة من 5 محاسبين (CPAs)', 425, 175);

        ctx.fillStyle = '#a5b4fc';
        ctx.font = 'bold 14px Cairo, sans-serif';
        ctx.fillText('🛡️ أمان قانوني وضريبي كامل للتاجر', 425, 215);

        return new THREE.CanvasTexture(c);
      }

      // 5. Offline-First Resilience Pod Texture
      function makeOfflinePodTexture() {
        const c = document.createElement('canvas');
        c.width = 440;
        c.height = 240;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#172554';
        ctx.fillRect(0, 0, 440, 240);
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 436, 236);

        // Header
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(0, 0, 440, 45);
        ctx.font = 'bold 18px Cairo, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.direction = 'rtl';
        ctx.fillText('⚡ الصمود التشغيلي بدون إنترنت (Offline-First)', 425, 30);

        // Body
        ctx.font = 'bold 18px Cairo, sans-serif';
        ctx.fillStyle = '#93c5fd';
        ctx.fillText('استمرار حركة المبيعات دون انقطاع:', 425, 80);

        ctx.font = '15px Cairo, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText('• حفظ الفواتير ونقاط البيع محلياً عبر IndexedDB', 425, 115);
        ctx.fillText('• تزامن تلقائي ومباشر فور استعادة الاتصال بالشبكة', 425, 145);
        ctx.fillText('• اختبار صمود 50 فاتورة متتالية أوفلاين بنجاح 100%', 425, 175);

        ctx.fillStyle = '#60a5fa';
        ctx.font = 'bold 14px Cairo, sans-serif';
        ctx.fillText('📶 لا توقف للمبيعات أبداً عند انقطاع الإنترنت', 425, 215);

        return new THREE.CanvasTexture(c);
      }

      // ==========================================
      // 3D SCENE MESHES & COMPOSITION
      // ==========================================

      // 1. Center Hero: 3D Smartphone
      const phoneGroup = new THREE.Group();
      phoneGroup.position.set(0, 0, 0.5);
      phoneGroup.rotation.set(0.12, -0.15, 0.04);
      rootGroup.add(phoneGroup);

      // Phone Body Frame
      const phoneFrameGeo = new THREE.BoxGeometry(3.8, 7.2, 0.32);
      const phoneFrameMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.9,
        roughness: 0.2
      });
      const phoneFrame = new THREE.Mesh(phoneFrameGeo, phoneFrameMat);
      phoneGroup.add(phoneFrame);

      // Beveled Phone Rim Line
      const phoneEdges = new THREE.EdgesGeometry(phoneFrameGeo);
      phoneGroup.add(new THREE.LineSegments(phoneEdges, new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 })));

      // Phone Screen Display with PWA UI
      const phoneScreenGeo = new THREE.PlaneGeometry(3.6, 7.0);
      const phoneScreenMat = new THREE.MeshBasicMaterial({ map: makePhoneScreenTexture() });
      const phoneScreen = new THREE.Mesh(phoneScreenGeo, phoneScreenMat);
      phoneScreen.position.z = 0.17;
      phoneGroup.add(phoneScreen);

      // Animated Laser Barcode Scanner Beam
      const laserGeo = new THREE.PlaneGeometry(3.2, 0.08);
      const laserMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.9 });
      const laserBeam = new THREE.Mesh(laserGeo, laserMat);
      laserBeam.position.set(0, 1.2, 0.19);
      phoneGroup.add(laserBeam);

      // ------------------------------------------
      // 2. The 4 Floating Operational Pods
      // ------------------------------------------
      const pods = [];

      function createPod(texture, x, y, z, rotY) {
        const podGroup = new THREE.Group();
        podGroup.position.set(x, y, z);
        podGroup.rotation.y = rotY;
        rootGroup.add(podGroup);

        const cardGeo = new THREE.PlaneGeometry(4.2, 2.3);
        const cardMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        const cardMesh = new THREE.Mesh(cardGeo, cardMat);
        podGroup.add(cardMesh);

        // Thin back slab for depth
        const backSlabGeo = new THREE.BoxGeometry(4.25, 2.35, 0.08);
        const backSlabMat = new THREE.MeshStandardMaterial({ color: 0x07111f, metalness: 0.8, roughness: 0.2 });
        const backSlab = new THREE.Mesh(backSlabGeo, backSlabMat);
        backSlab.position.z = -0.05;
        podGroup.add(backSlab);

        // Connecting Data Beam to Phone Center
        const beamGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(x * 0.85, y * 0.85, z * 0.85)
        ]);
        const beamLine = new THREE.Line(beamGeo, new THREE.LineDashedMaterial({
          color: 0x38bdf8,
          dashSize: 0.4,
          gapSize: 0.2,
          transparent: true,
          opacity: 0.6
        }));
        beamLine.computeLineDistances();
        rootGroup.add(beamLine);

        // Floating Data Packet traveling along line
        const packetGeo = new THREE.SphereGeometry(0.12, 12, 12);
        const packetMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const packet = new THREE.Mesh(packetGeo, packetMat);
        rootGroup.add(packet);

        pods.push({
          group: podGroup,
          baseY: y,
          targetPos: new THREE.Vector3(x, y, z),
          packet: packet,
          speed: 0.8 + Math.random() * 0.4
        });
      }

      // Pod 1: WhatsApp Invoicing (Top-Right)
      createPod(makeWhatsAppPodTexture(), 4.8, 2.6, -0.5, -0.15);

      // Pod 2: Multi-Unit Inventory (Top-Left)
      createPod(makeInventoryPodTexture(), -4.8, 2.6, -0.5, 0.15);

      // Pod 3: B2C Tax Compliance (Bottom-Right)
      createPod(makeTaxPodTexture(), 4.8, -2.6, -0.5, -0.15);

      // Pod 4: Offline-First Resilience (Bottom-Left)
      createPod(makeOfflinePodTexture(), -4.8, -2.6, -0.5, 0.15);

      // Ambient Particle Dust
      const partGeo = new THREE.BufferGeometry();
      const partCount = 80;
      const posArray = new Float32Array(partCount * 3);
      for (let i = 0; i < partCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 20;
      }
      partGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const partMat = new THREE.PointsMaterial({ size: 0.08, color: 0x38bdf8, transparent: true, opacity: 0.6 });
      const particles = new THREE.Points(partGeo, partMat);
      rootGroup.add(particles);

      return {
        update(time) {
          // Smooth cinematic camera interpolation
          currentCamPos.lerp(targetCamPos, 0.055);
          currentLookAt.lerp(targetLookAt, 0.055);
          camera.position.copy(currentCamPos);
          camera.lookAt(currentLookAt);

          // Phone Floating Hover
          phoneGroup.position.y = Math.sin(time * 0.8) * 0.18;

          // Barcode Scanner Laser sweep up/down
          laserBeam.position.y = 1.1 + Math.sin(time * 3.5) * 0.8;

          // Floating Pods & Traveling Data Packets
          pods.forEach((pod, idx) => {
            pod.group.position.y = pod.baseY + Math.sin(time * pod.speed + idx) * 0.12;

            // Travel packet from phone (0,0) to pod target
            const progress = (time * 0.6 + idx * 0.25) % 1.0;
            pod.packet.position.lerpVectors(
              phoneGroup.position,
              pod.group.position,
              progress
            );
          });

          // Particles drift
          particles.rotation.y = time * 0.02;

          // Mouse Parallax across the entire Solution scene (softened when zoomed in)
          const pWeight = activeTargetIndex === OVERVIEW_INDEX ? 1.0 : 0.25;
          const targetRotY = (mouseX * 0.28 + Math.sin(time * 0.3) * 0.04) * pWeight;
          const targetRotX = (-mouseY * 0.2 + Math.cos(time * 0.4) * 0.03) * pWeight;
          rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.08;
          rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.08;
        }
      };
    }

    // --- SLIDE 4: 3D Geographic Visualization (TAM, SAM, SOM) ---
    // --- SLIDE 4: 3D Geographic Visualization (TAM, SAM, SOM) ---
    let mapController = null;

    function buildSlide4Scene(scene, camera) {
      camera.near = 0.02;
      camera.far = 1000;
      camera.updateProjectionMatrix();

      camera.position.set(0, -0.6, 14.5);
      camera.lookAt(0, 0, 0.05);

      const mapMasterGroup = new THREE.Group();
      scene.add(mapMasterGroup);

      const geo = window.GEO_DATA || {};

      const cLon = 30.80;
      const cLat = 26.84;
      const scale = 1.0;

      function project(coords) {
        return coords.map(([lon, lat]) => [
          (lon - cLon) * scale,
          (lat - cLat) * scale
        ]);
      }

      const alexCenter = [ (29.8403 - cLon) * scale, (30.8460 - cLat) * scale ]; // [-0.96, 4.01]
      const somCenter = [ (29.9962 - cLon) * scale, (31.2555 - cLat) * scale ];   // [-0.804, 4.415]

      // Helper for extruded polygon mesh with exact Z offset
      function makeExtrudedPoly(coordList, depth, zPos, material, edgeColor, edgeOpacity = 0.8) {
        if (!coordList || coordList.length < 3) return null;
        const pts = project(coordList);
        const shape = new THREE.Shape();
        shape.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          shape.lineTo(pts[i][0], pts[i][1]);
        }
        shape.closePath();

        const geom = new THREE.ExtrudeGeometry(shape, {
          depth: depth,
          bevelEnabled: true,
          bevelSegments: 2,
          steps: 1,
          bevelSize: Math.min(depth * 0.05, 0.005),
          bevelThickness: Math.min(depth * 0.05, 0.005)
        });

        const mesh = new THREE.Mesh(geom, material);
        mesh.position.z = zPos;

        if (edgeColor) {
          const edges = new THREE.EdgesGeometry(geom);
          const lineMat = new THREE.LineBasicMaterial({
            color: edgeColor,
            transparent: true,
            opacity: edgeOpacity
          });
          const line = new THREE.LineSegments(edges, lineMat);
          mesh.add(line);
          mesh.userData.lineMat = lineMat;
        }
        mesh.userData.mainMat = material;
        return mesh;
      }

      // Helper for elevated perimeter neon border line
      function makePerimeterLine(coordList, zHeight, color, opacity = 1.0) {
        if (!coordList || coordList.length < 3) return null;
        const pts = project(coordList);
        const v3Pts = pts.map(p => new THREE.Vector3(p[0], p[1], zHeight));
        v3Pts.push(v3Pts[0].clone());
        const geo = new THREE.BufferGeometry().setFromPoints(v3Pts);
        const mat = new THREE.LineBasicMaterial({
          color: color,
          transparent: true,
          opacity: opacity,
          linewidth: 2
        });
        const line = new THREE.Line(geo, mat);
        line.userData.lineMat = mat;
        return line;
      }

      // HUD Texture Maker
      function makeHudCardTexture(badgeTitle, badgeVal1, badgeVal2, accentColor, iconEmoji) {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 180;
        const ctx = c.getContext('2d');

        // Dark background
        ctx.fillStyle = 'rgba(7, 17, 31, 0.94)';
        ctx.fillRect(0, 0, 512, 180);

        // Glowing border
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 508, 176);

        // Header bar
        ctx.fillStyle = 'rgba(30, 58, 138, 0.5)';
        ctx.fillRect(0, 0, 512, 45);

        // Icon
        ctx.font = '26px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(iconEmoji, 465, 33);

        // Title
        ctx.font = 'bold 20px Cairo, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.direction = 'rtl';
        ctx.fillText(badgeTitle, 450, 32);

        // Values
        ctx.font = 'bold 18px Cairo, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(badgeVal1, 480, 85);

        ctx.font = '16px Cairo, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(badgeVal2, 480, 135);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      // Hub Label Pin Texture Maker
      function makeHubLabelTexture(name, colorHex) {
        const c = document.createElement('canvas');
        c.width = 192;
        c.height = 64;
        const ctx = c.getContext('2d');

        // Dark rounded badge background
        ctx.fillStyle = 'rgba(11, 22, 44, 0.92)';
        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(4, 4, 184, 56, 12) : ctx.rect(4, 4, 184, 56);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 24px Cairo, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('📍 ' + name, 96, 40);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      // Global directional lighting - NO point lights right on Alexandria to avoid blinding flares!
      const sunLight = new THREE.DirectionalLight(0xdbeafe, 1.2);
      sunLight.position.set(12, 16, 22);
      mapMasterGroup.add(sunLight);

      const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.7);
      fillLight.position.set(-12, -8, 16);
      mapMasterGroup.add(fillLight);

      // ==========================================
      // 1. TAM - EGYPT (National Mainland + Sinai)
      // ==========================================
      const tamGroup = new THREE.Group();
      mapMasterGroup.add(tamGroup);

      // Grid Base beneath Egypt
      const grid = new THREE.GridHelper(20, 20, 0x1d4ed8, 0x0f172a);
      grid.rotation.x = Math.PI / 2;
      grid.position.set(0, 0, -0.05);
      tamGroup.add(grid);

      const egyptMat = new THREE.MeshStandardMaterial({
        color: 0x1d4ed8,
        emissive: 0x0f2d6b,
        emissiveIntensity: 0.25,
        metalness: 0.8,
        roughness: 0.3,
        transparent: true,
        opacity: 0.95
      });

      if (geo.egypt) {
        if (geo.egypt.mainland) {
          const m = makeExtrudedPoly(geo.egypt.mainland, 0.08, 0, egyptMat, 0x60a5fa, 0.85);
          if (m) tamGroup.add(m);
        }
        if (geo.egypt.sinai) {
          const s = makeExtrudedPoly(geo.egypt.sinai, 0.09, 0, egyptMat, 0x60a5fa, 0.85);
          if (s) tamGroup.add(s);
        }
      }

      // TAM Pulsing Beacon on Alexandria (visible ONLY in TAM)
      const alexBeaconGroup = new THREE.Group();
      tamGroup.add(alexBeaconGroup);

      const alexBeaconRing = new THREE.Mesh(
        new THREE.RingGeometry(0.12, 0.16, 32),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
      );
      alexBeaconRing.position.set(alexCenter[0], alexCenter[1], 0.09);
      alexBeaconGroup.add(alexBeaconRing);

      const alexBeaconPin = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      alexBeaconPin.position.set(alexCenter[0], alexCenter[1], 0.14);
      alexBeaconGroup.add(alexBeaconPin);

      // TAM Floating HUD Card
      const tamHudGeo = new THREE.PlaneGeometry(4.6, 1.6);
      const tamHudMat = new THREE.MeshBasicMaterial({
        map: makeHudCardTexture('السوق الكلي المتاح (TAM) - جمهورية مصر العربية', '2.2 مليون منشأة تجزئة وجملة (54.4% من 3.86M)', 'الفرصة السنوية الكلية: 13.2B - 39.6B ج.م', '#38bdf8', '🇪🇬'),
        transparent: true,
        side: THREE.DoubleSide
      });
      const tamHudMesh = new THREE.Mesh(tamHudGeo, tamHudMat);
      tamHudMesh.position.set(0, -2.8, 0.5);
      tamGroup.add(tamHudMesh);

      // ==========================================
      // 2. SAM - ALEXANDRIA GOVERNORATE
      // ==========================================
      const samGroup = new THREE.Group();
      samGroup.visible = false; // MUST NOT appear in TAM!
      mapMasterGroup.add(samGroup);

      const alexMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x0369a1,
        emissiveIntensity: 0.45,
        metalness: 0.75,
        roughness: 0.2,
        transparent: true,
        opacity: 0.0
      });

      let alexMesh = null;
      let alexBorderLine = null;

      if (geo.alexandria) {
        // Alexandria sits on top of Egypt (z = 0.081, depth = 0.04)
        alexMesh = makeExtrudedPoly(geo.alexandria, 0.04, 0.081, alexMat, 0x38bdf8, 1.0);
        if (alexMesh) samGroup.add(alexMesh);

        // Prominent neon perimeter border line standing on top (z = 0.123)
        alexBorderLine = makePerimeterLine(geo.alexandria, 0.123, 0x38bdf8, 1.0);
        if (alexBorderLine) samGroup.add(alexBorderLine);
      }

      // SAM Pulsing Beacon on Eastern Alexandria (visible ONLY in SAM)
      const somBeaconGroup = new THREE.Group();
      somBeaconGroup.visible = false;
      samGroup.add(somBeaconGroup);

      const somBeaconRing = new THREE.Mesh(
        new THREE.RingGeometry(0.025, 0.035, 32),
        new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
      );
      somBeaconRing.position.set(somCenter[0], somCenter[1], 0.125);
      somBeaconGroup.add(somBeaconRing);

      const somBeaconPin = new THREE.Mesh(
        new THREE.SphereGeometry(0.015, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x10b981 })
      );
      somBeaconPin.position.set(somCenter[0], somCenter[1], 0.145);
      somBeaconGroup.add(somBeaconPin);

      // SAM Floating HUD Card
      const samHudGeo = new THREE.PlaneGeometry(0.85, 0.28);
      const samHudMat = new THREE.MeshBasicMaterial({
        map: makeHudCardTexture('محافظة الإسكندرية والدلتا (SAM)', '20,000 - 30,000 متجر تجزئة منظم', 'الفرصة السنوية المستهدفة: 168M - 252M ج.م', '#38bdf8', '🌊'),
        transparent: true,
        side: THREE.DoubleSide
      });
      const samHudMesh = new THREE.Mesh(samHudGeo, samHudMat);
      samHudMesh.position.set(alexCenter[0] - 0.35, alexCenter[1] + 0.50, 0.35);
      samGroup.add(samHudMesh);

      // ==========================================
      // 3. SOM - EASTERN ALEXANDRIA BEACHHEAD
      // ==========================================
      const somGroup = new THREE.Group();
      somGroup.visible = false; // MUST NOT appear in TAM or SAM!
      mapMasterGroup.add(somGroup);

      const districtColors = {
        'Al Raml': { color: 0x38bdf8, emissive: 0x0284c7 },
        'Muntazah': { color: 0x3b82f6, emissive: 0x1d4ed8 },
        'Sidi Gabir': { color: 0x10b981, emissive: 0x059669 },
        'Bab Sharqi': { color: 0x8b5cf6, emissive: 0x6d28d9 },
        'Kesm than Al Raml': { color: 0xf59e0b, emissive: 0xd97706 }
      };

      const somDistrictMeshes = [];

      if (geo.eastern_alexandria_districts) {
        Object.keys(geo.eastern_alexandria_districts).forEach(distKey => {
          const dist = geo.eastern_alexandria_districts[distKey];
          if (dist.coordinates && dist.coordinates.length > 2) {
            const pal = districtColors[distKey] || { color: 0x38bdf8, emissive: 0x0284c7 };
            const dMat = new THREE.MeshStandardMaterial({
              color: pal.color,
              emissive: pal.emissive,
              emissiveIntensity: 0.45,
              metalness: 0.7,
              roughness: 0.2,
              transparent: true,
              opacity: 0.0
            });
            // Districts sit on top of Alexandria: z = 0.122, sleek depth = 0.03
            const dMesh = makeExtrudedPoly(dist.coordinates, 0.03, 0.122, dMat, 0xffffff, 0.9);
            if (dMesh) {
              somGroup.add(dMesh);
              somDistrictMeshes.push(dMesh);
            }
            // Perimeter border line at z = 0.154
            const dLine = makePerimeterLine(dist.coordinates, 0.154, 0xffffff, 1.0);
            if (dLine) {
              somGroup.add(dLine);
              somDistrictMeshes.push(dLine);
            }
          }
        });
      }

      // 5 Commercial Retail Hub Pins (Smouha, Miami, Loran, Bacos, Ibrahimia)
      const hubs = [
        { name: 'سموحة', coords: [29.959, 31.216], color: '#10b981' },
        { name: 'ميامي', coords: [30.031, 31.264], color: '#3b82f6' },
        { name: 'لوران', coords: [29.971, 31.237], color: '#38bdf8' },
        { name: 'باكوس', coords: [29.998, 31.211], color: '#f59e0b' },
        { name: 'الإبراهيمية', coords: [29.929, 31.205], color: '#8b5cf6' }
      ];

      const hubPinsGroup = new THREE.Group();
      hubPinsGroup.visible = false;
      somGroup.add(hubPinsGroup);

      hubs.forEach(hub => {
        const hp = project([hub.coords])[0];
        const hGroup = new THREE.Group();
        hGroup.position.set(hp[0], hp[1], 0.154);

        // Thin pin stem standing vertically
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0012, 0.0012, 0.022, 8),
          new THREE.MeshBasicMaterial({ color: hub.color })
        );
        stem.position.z = 0.011;
        stem.rotation.x = Math.PI / 2;
        hGroup.add(stem);

        // Pin head sphere
        const pinHead = new THREE.Mesh(
          new THREE.SphereGeometry(0.0035, 12, 12),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        pinHead.position.z = 0.023;
        hGroup.add(pinHead);

        // Label sprite
        const labelGeo = new THREE.PlaneGeometry(0.040, 0.014);
        const labelMat = new THREE.MeshBasicMaterial({
          map: makeHubLabelTexture(hub.name, hub.color),
          transparent: true,
          side: THREE.DoubleSide
        });
        const labelMesh = new THREE.Mesh(labelGeo, labelMat);
        labelMesh.position.set(0, 0.008, 0.032);
        hGroup.add(labelMesh);

        hubPinsGroup.add(hGroup);
      });

      // SOM Floating HUD Card (Cleanly placed at the upper edge of SOM view)
      const somHudGeo = new THREE.PlaneGeometry(0.14, 0.048);
      const somHudMat = new THREE.MeshBasicMaterial({
        map: makeHudCardTexture('نطاق الانطلاق (SOM) - شرق الإسكندرية', '50-80 متجر سنة 1 ➔ 200-270 متجر 36 شهر', 'الإيراد السنوي المستهدف: 1.2M - 4.8M ج.م ARR', '#10b981', '🎯'),
        transparent: true,
        side: THREE.DoubleSide
      });
      const somHudMesh = new THREE.Mesh(somHudGeo, somHudMat);
      somHudMesh.position.set(somCenter[0], somCenter[1] + 0.10, 0.20);
      somGroup.add(somHudMesh);

      // State & Camera Transitions (Proportional Bird-Eye Framing)
      const camStates = {
        tam: {
          camPos: new THREE.Vector3(0, -0.6, 14.5),
          lookAt: new THREE.Vector3(0, 0, 0.05),
          tiltX: 0.20,
          tiltY: 0
        },
        sam: {
          camPos: new THREE.Vector3(alexCenter[0], alexCenter[1] - 0.40, 2.5),
          lookAt: new THREE.Vector3(alexCenter[0], alexCenter[1], 0.10),
          tiltX: 0.28,
          tiltY: 0.06
        },
        som: {
          camPos: new THREE.Vector3(somCenter[0], somCenter[1] - 0.14, 0.52),
          lookAt: new THREE.Vector3(somCenter[0], somCenter[1], 0.15),
          tiltX: 0.32,
          tiltY: -0.02
        }
      };

      let currentCamPos = new THREE.Vector3(0, -0.6, 14.5);
      let currentLookAt = new THREE.Vector3(0, 0, 0.05);

      let alexOpacity = 0.0;
      let somOpacity = 0.0;
      let alexTargetOpacity = 0.0;
      let somTargetOpacity = 0.0;

      // Mouse Parallax Setup
      let mouseX = 0, mouseY = 0;
      const stageElem = document.getElementById('stage-slide-4');
      if (stageElem) {
        stageElem.addEventListener('mousemove', (e) => {
          const rect = stageElem.getBoundingClientRect();
          mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        });
        stageElem.addEventListener('mouseleave', () => {
          mouseX = 0;
          mouseY = 0;
        });
      }

      mapController = {
        mode: 'tam',
        setMode(mode) {
          this.mode = mode;

          // Sync Buttons
          document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('active'));
          const btn = document.getElementById('btn-focus-' + mode);
          if (btn) btn.classList.add('active');

          // Sync Cards
          document.querySelectorAll('#card-tam, #card-sam, #card-som').forEach(c => c.classList.remove('active'));
          const card = document.getElementById('card-' + mode);
          if (card) card.classList.add('active');

          if (mode === 'tam') {
            alexTargetOpacity = 0.0;
            somTargetOpacity = 0.0;
          } else if (mode === 'sam') {
            samGroup.visible = true;
            alexTargetOpacity = 1.0;
            somTargetOpacity = 0.0;
          } else if (mode === 'som') {
            samGroup.visible = true;
            somGroup.visible = true;
            alexTargetOpacity = 0.40;
            somTargetOpacity = 1.0;
          }
        }
      };

      return {
        update(time) {
          const targetState = camStates[mapController.mode] || camStates.tam;

          // Smooth camera position & lookAt lerp
          currentCamPos.lerp(targetState.camPos, 0.06);
          currentLookAt.lerp(targetState.lookAt, 0.06);
          camera.position.copy(currentCamPos);
          camera.lookAt(currentLookAt);

          // Smooth Opacity Interpolation
          alexOpacity += (alexTargetOpacity - alexOpacity) * 0.08;
          somOpacity += (somTargetOpacity - somOpacity) * 0.08;

          const isTam = mapController.mode === 'tam';
          const isSam = mapController.mode === 'sam';
          const isSom = mapController.mode === 'som';

          // Controlled Beacon Visibilities
          alexBeaconGroup.visible = isTam;
          somBeaconGroup.visible = isSam;
          hubPinsGroup.visible = isSom;

          // Controlled HUD Visibilities
          tamHudMesh.visible = isTam;
          samHudMesh.visible = isSam;
          somHudMesh.visible = isSom;

          // Visibility switches
          if (alexOpacity < 0.01 && alexTargetOpacity === 0) {
            samGroup.visible = false;
          } else {
            samGroup.visible = true;
            alexMat.opacity = alexOpacity;
            if (alexBorderLine && alexBorderLine.userData.lineMat) {
              alexBorderLine.userData.lineMat.opacity = alexOpacity;
            }
          }

          if (somOpacity < 0.01 && somTargetOpacity === 0) {
            somGroup.visible = false;
          } else {
            somGroup.visible = true;
            somDistrictMeshes.forEach(mesh => {
              if (mesh.userData.mainMat) mesh.userData.mainMat.opacity = somOpacity;
              if (mesh.userData.lineMat) mesh.userData.lineMat.opacity = somOpacity;
            });
          }

          // Pulsing beacons
          const pulse = (Math.sin(time * 3.5) + 1) * 0.5;
          alexBeaconRing.scale.setScalar(1.0 + pulse * 0.25);
          somBeaconRing.scale.setScalar(1.0 + pulse * 0.25);

          // Subtle Mouse Parallax based on zoom level
          const pFactor = isTam ? 0.10 : (isSam ? 0.03 : 0.01);
          mapMasterGroup.rotation.y = mouseX * pFactor + Math.sin(time * 0.3) * (pFactor * 0.3);
          mapMasterGroup.rotation.x = -mouseY * pFactor;
        }
      };
    }

    window.focusMap = function(mode) {
      if (mapController) mapController.setMode(mode);
    };

    // --- SLIDE 5: 3D Cloud Revenue Vault & Crystalline Tier Cubes ---
    let tierSelector = null;

    function buildSlide5Scene(scene, camera) {
      camera.position.set(0, 0.6, 11.5);
      camera.lookAt(0, 0.0, 0);

      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      // Mouse Parallax Setup
      let mouseX = 0, mouseY = 0;
      const stageElem = document.getElementById('stage-slide-5');
      if (stageElem) {
        stageElem.addEventListener('mousemove', (e) => {
          const rect = stageElem.getBoundingClientRect();
          mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        });
        stageElem.addEventListener('mouseleave', () => {
          mouseX = 0;
          mouseY = 0;
        });
      }

      // Rich Cinematic Lighting
      const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
      dirLight.position.set(6, 12, 10);
      scene.add(dirLight);

      const cyanPoint = new THREE.PointLight(0x38bdf8, 2.2, 25);
      cyanPoint.position.set(-4, 3, 5);
      scene.add(cyanPoint);

      const goldPoint = new THREE.PointLight(0xf59e0b, 2.5, 25);
      goldPoint.position.set(0, 4, 6);
      scene.add(goldPoint);

      const purplePoint = new THREE.PointLight(0xa855f7, 2.0, 25);
      purplePoint.position.set(4, 3, 5);
      scene.add(purplePoint);

      // ==========================================
      // 1. HEXAGONAL CYBER BASE PLATFORM
      // ==========================================
      const hexBaseGeo = new THREE.CylinderGeometry(6.6, 7.2, 0.45, 6);
      const hexBaseMat = new THREE.MeshStandardMaterial({
        color: 0x07111f,
        metalness: 0.95,
        roughness: 0.18
      });
      const hexBase = new THREE.Mesh(hexBaseGeo, hexBaseMat);
      hexBase.position.set(0, -3.2, 0);
      rootGroup.add(hexBase);

      const hexEdges = new THREE.EdgesGeometry(hexBaseGeo);
      hexBase.add(new THREE.LineSegments(hexEdges, new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.55
      })));

      // Glowing Neon Rings on Platform
      const outerRing = new THREE.Mesh(
        new THREE.TorusGeometry(5.4, 0.035, 16, 64),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      outerRing.position.set(0, -2.96, 0);
      outerRing.rotation.x = Math.PI / 2;
      rootGroup.add(outerRing);

      const innerRing = new THREE.Mesh(
        new THREE.TorusGeometry(3.2, 0.03, 16, 64),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b })
      );
      innerRing.position.set(0, -2.96, 0);
      innerRing.rotation.x = Math.PI / 2;
      rootGroup.add(innerRing);

      // ==========================================
      // 2. CENTRAL SAAS REVENUE VAULT (خزينة الإيرادات)
      // ==========================================
      const vaultChamber = new THREE.Group();
      vaultChamber.position.set(0, -2.6, 0.2);
      rootGroup.add(vaultChamber);

      // Vault Metallic Cylindrical Hub
      const vHubGeo = new THREE.CylinderGeometry(1.6, 1.85, 0.6, 32);
      const vHubMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.9,
        roughness: 0.2
      });
      const vHubMesh = new THREE.Mesh(vHubGeo, vHubMat);
      vaultChamber.add(vHubMesh);

      // Vault Hatch Glowing Torus Rim
      const vHatch = new THREE.Mesh(
        new THREE.TorusGeometry(1.65, 0.045, 16, 32),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xb45309, emissiveIntensity: 0.5 })
      );
      vHatch.position.y = 0.3;
      vHatch.rotation.x = Math.PI / 2;
      vaultChamber.add(vHatch);

      // Pulsing Golden Iris Core
      const vCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 24, 24),
        new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xd97706,
          emissiveIntensity: 0.8,
          roughness: 0.2
        })
      );
      vCore.position.y = 0.25;
      vaultChamber.add(vCore);

      // Central Vault Badge
      function makeVaultLabelTexture() {
        const c = document.createElement('canvas');
        c.width = 360; c.height = 70;
        const ctx = c.getContext('2d');
        ctx.fillStyle = 'rgba(7, 17, 31, 0.95)';
        ctx.fillRect(0, 0, 360, 70);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.strokeRect(2, 2, 356, 66);
        ctx.font = 'bold 18px Cairo, sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.direction = 'rtl';
        ctx.fillText('خزينة الإيرادات المتكررة | SaaS Core', 340, 42);
        return new THREE.CanvasTexture(c);
      }
      const vLabel = new THREE.Mesh(
        new THREE.PlaneGeometry(2.3, 0.45),
        new THREE.MeshBasicMaterial({ map: makeVaultLabelTexture(), side: THREE.DoubleSide })
      );
      vLabel.position.set(0, -0.15, 1.4);
      vaultChamber.add(vLabel);

      // ==========================================
      // 3. TEXTURE GENERATORS
      // ==========================================

      // Projected Hologram Detail Screen Texture
      function makeHoloDetailTexture(tierName, priceMonth, priceYear, bullets, accentColor, isPopular) {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 340;
        const ctx = c.getContext('2d');

        // Dark Frosted Glass background
        ctx.fillStyle = 'rgba(7, 17, 31, 0.96)';
        ctx.fillRect(0, 0, 512, 340);

        // Border
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = isPopular ? 6 : 4;
        ctx.strokeRect(3, 3, 506, 334);

        // Top banner
        ctx.fillStyle = isPopular ? 'rgba(245, 158, 11, 0.25)' : 'rgba(30, 58, 138, 0.35)';
        ctx.fillRect(0, 0, 512, 54);

        // Header Title
        ctx.font = 'bold 24px Cairo, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.direction = 'rtl';
        ctx.fillText(tierName, 485, 38);

        if (isPopular) {
          ctx.font = 'bold 15px Cairo, sans-serif';
          ctx.fillStyle = '#f59e0b';
          ctx.fillText('⭐ الأكثر طلباً', 140, 37);
        }

        // Monthly Price
        ctx.font = 'bold 30px Cairo, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(priceMonth, 485, 105);

        // Annual Price / Savings
        ctx.font = '16px Cairo, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.fillText(priceYear, 485, 140);

        // Divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(25, 155); ctx.lineTo(485, 155); ctx.stroke();

        // Feature Bullets
        ctx.font = '16px Cairo, sans-serif';
        ctx.fillStyle = '#f1f5f9';
        bullets.forEach((b, idx) => {
          ctx.fillText('✓  ' + b, 485, 192 + idx * 34);
        });

        // Bottom Protection Bar
        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.fillRect(0, 295, 512, 45);
        ctx.font = 'bold 14px Cairo, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.fillText('🛡️ تسعير المنشأة الواحدة — مستخدمين غير محدودين', 485, 324);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 8;
        return tex;
      }

      // Metric Badge Texture
      function makeMetricBadgeTexture(title, value, sub, accentColor, emoji) {
        const c = document.createElement('canvas');
        c.width = 380;
        c.height = 140;
        const ctx = c.getContext('2d');

        ctx.fillStyle = 'rgba(11, 22, 44, 0.95)';
        ctx.fillRect(0, 0, 380, 140);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 376, 136);

        // Emoji Circle
        ctx.fillStyle = accentColor;
        ctx.beginPath(); ctx.arc(330, 70, 32, 0, Math.PI * 2); ctx.fill();
        ctx.font = '30px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(emoji, 315, 80);

        ctx.font = 'bold 16px Cairo, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.direction = 'rtl';
        ctx.fillText(title, 280, 45);

        ctx.font = 'bold 22px Cairo, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.fillText(value, 280, 82);

        ctx.font = '13px Cairo, sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(sub, 280, 115);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      // Small Badge Texture Maker
      function makePillBadgeTexture(text, accentColor) {
        const c = document.createElement('canvas');
        c.width = 300; c.height = 80;
        const ctx = c.getContext('2d');
        ctx.fillStyle = 'rgba(7, 17, 31, 0.92)';
        ctx.fillRect(0, 0, 300, 80);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(2, 2, 296, 76);
        ctx.font = 'bold 22px Cairo, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.textAlign = 'center';
        ctx.fillText(text, 150, 48);
        return new THREE.CanvasTexture(c);
      }

      // ==========================================
      // 4. THE 3 ENHANCED 3D SUBSCRIPTION VAULTS
      // ==========================================
      const vaults = [];

      function createVaultCube(config) {
        const vGroup = new THREE.Group();
        vGroup.position.set(config.x, config.baseY, config.z);
        rootGroup.add(vGroup);

        const w = config.w;
        const h = config.h;
        const d = config.d;

        // ------------------------------------------
        // A. SCULPTED 3D BASE PEDESTAL (قاعدة الخزينة المشطوفة)
        // ------------------------------------------
        const plinthGroup = new THREE.Group();
        plinthGroup.position.set(0, -h / 2 - 0.16, 0);
        vGroup.add(plinthGroup);

        // Octagonal Plinth
        const plinthGeo = new THREE.CylinderGeometry(w * 0.72, w * 0.8, 0.32, 8);
        const plinthMat = new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          metalness: 0.95,
          roughness: 0.18
        });
        const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
        plinthGroup.add(plinthMesh);

        // Neon Base Ring
        const baseRing = new THREE.Mesh(
          new THREE.TorusGeometry(w * 0.74, 0.035, 16, 32),
          new THREE.MeshBasicMaterial({ color: config.neonColor })
        );
        baseRing.position.y = 0.16;
        baseRing.rotation.x = Math.PI / 2;
        plinthGroup.add(baseRing);

        // ------------------------------------------
        // B. 3D CHASSIS & INNER CRYSTAL CHAMBER
        // ------------------------------------------
        const boxGeo = new THREE.BoxGeometry(w, h, d);
        const boxMat = new THREE.MeshStandardMaterial({
          color: config.glassColor,
          emissive: config.emissiveColor,
          emissiveIntensity: 0.35,
          metalness: 0.85,
          roughness: 0.15,
          transparent: true,
          opacity: 0.7
        });
        const boxMesh = new THREE.Mesh(boxGeo, boxMat);
        vGroup.add(boxMesh);

        // Outer Neon Chamfer Edges
        const edges = new THREE.EdgesGeometry(boxGeo);
        const edgeLines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
          color: config.neonColor,
          transparent: true,
          opacity: 0.95
        }));
        vGroup.add(edgeLines);

        // ------------------------------------------
        // C. 4 TITANIUM ARMOR CORNER PILLARS
        // ------------------------------------------
        const halfW = w / 2 - 0.04;
        const halfD = d / 2 - 0.04;
        const pillarGeo = new THREE.CylinderGeometry(0.12, 0.12, h * 1.02, 16);
        const pillarMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          metalness: 0.95,
          roughness: 0.15
        });

        [
          [-halfW, -halfD],
          [halfW, -halfD],
          [-halfW, halfD],
          [halfW, halfD]
        ].forEach(([px, pz]) => {
          const pMesh = new THREE.Mesh(pillarGeo, pillarMat);
          pMesh.position.set(px, 0, pz);
          vGroup.add(pMesh);

          // LED status rings at top and bottom of each pillar
          const ringTop = new THREE.Mesh(
            new THREE.TorusGeometry(0.13, 0.02, 8, 16),
            new THREE.MeshBasicMaterial({ color: config.neonColor })
          );
          ringTop.position.set(px, h / 2 - 0.05, pz);
          ringTop.rotation.x = Math.PI / 2;
          vGroup.add(ringTop);

          const ringBot = new THREE.Mesh(
            new THREE.TorusGeometry(0.13, 0.02, 8, 16),
            new THREE.MeshBasicMaterial({ color: config.neonColor })
          );
          ringBot.position.set(px, -h / 2 + 0.05, pz);
          ringBot.rotation.x = Math.PI / 2;
          vGroup.add(ringBot);
        });

        // ------------------------------------------
        // D. 3D FRONT VAULT DOOR & MECHANICAL LOCK WHEEL
        // ------------------------------------------
        const doorGroup = new THREE.Group();
        doorGroup.position.set(0, -0.05, d / 2 + 0.04);
        vGroup.add(doorGroup);

        // Reinforced circular steel door frame
        const doorFrame = new THREE.Mesh(
          new THREE.TorusGeometry(0.55, 0.055, 16, 32),
          new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.95, roughness: 0.2 })
        );
        doorGroup.add(doorFrame);

        // Rotating Lock Wheel
        const wheelGroup = new THREE.Group();
        doorGroup.add(wheelGroup);

        const wheelHub = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16),
          new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.95, roughness: 0.15 })
        );
        wheelHub.rotation.x = Math.PI / 2;
        wheelGroup.add(wheelHub);

        // 4 Radiating Spokes
        const spokeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 1.0, roughness: 0.1 });
        const spoke1 = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.96, 8), spokeMat);
        wheelGroup.add(spoke1);
        const spoke2 = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.96, 8), spokeMat);
        spoke2.rotation.z = Math.PI / 2;
        wheelGroup.add(spoke2);

        // Central Key Emblem / Jewel
        const jewel = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 16, 16),
          new THREE.MeshBasicMaterial({ color: config.neonColor })
        );
        jewel.position.z = 0.07;
        wheelGroup.add(jewel);

        // ------------------------------------------
        // E. HINGED VAULT LID & PROJECTOR EMITTER HEAD (رأس الخزينة)
        // ------------------------------------------
        const lidGroup = new THREE.Group();
        lidGroup.position.set(0, h / 2, -d / 2);
        vGroup.add(lidGroup);

        const lidGeo = new THREE.BoxGeometry(w * 1.03, 0.18, d * 1.03);
        const lidMat = new THREE.MeshStandardMaterial({
          color: config.lidColor,
          metalness: 0.92,
          roughness: 0.18
        });
        const lidMesh = new THREE.Mesh(lidGeo, lidMat);
        lidMesh.position.set(0, 0.09, d / 2);
        lidGroup.add(lidMesh);

        const lidEdge = new THREE.EdgesGeometry(lidGeo);
        lidMesh.add(new THREE.LineSegments(lidEdge, new THREE.LineBasicMaterial({ color: config.neonColor })));

        // Projector Emitter Lens on the Head of the Vault
        const emitterHead = new THREE.Group();
        emitterHead.position.set(0, 0.19, d / 2);
        lidMesh.add(emitterHead);

        const lensRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.55, 0.035, 16, 32),
          new THREE.MeshBasicMaterial({ color: config.neonColor })
        );
        lensRing.rotation.x = Math.PI / 2;
        emitterHead.add(lensRing);

        const lensCore = new THREE.Mesh(
          new THREE.CylinderGeometry(0.48, 0.52, 0.06, 24),
          new THREE.MeshStandardMaterial({
            color: config.glassColor,
            emissive: config.emissiveColor,
            emissiveIntensity: 0.9,
            metalness: 0.9
          })
        );
        emitterHead.add(lensCore);

        // ------------------------------------------
        // F. INTERNAL TECH CORE
        // ------------------------------------------
        const coreGroup = new THREE.Group();
        coreGroup.position.set(0, 0, 0);
        vGroup.add(coreGroup);
        if (config.buildCoreFn) {
          config.buildCoreFn(coreGroup);
        }

        // ------------------------------------------
        // G. 3D HOLOGRAPHIC PLAN TABLET AT THE HEAD OF THE VAULT
        // ------------------------------------------
        const screenGroup = new THREE.Group();
        screenGroup.position.set(0, 0.2, 0.4);
        screenGroup.scale.set(0.01, 0.01, 0.01);
        vGroup.add(screenGroup);

        // 3D Glass Tablet Chassis (سميك ومجسم ثلاثي الأبعاد)
        const tabletThickness = 0.12;
        const tabletGeo = new THREE.BoxGeometry(config.screenW, config.screenH, tabletThickness);
        const tabletMatArray = [
          new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 }),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 }),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 }),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 }),
          new THREE.MeshBasicMaterial({ map: config.detailTexture }),
          new THREE.MeshStandardMaterial({ color: 0x07111f, metalness: 0.95, roughness: 0.15 })
        ];
        const tabletMesh = new THREE.Mesh(tabletGeo, tabletMatArray);
        screenGroup.add(tabletMesh);

        // Tablet Neon Edges
        const tabletEdges = new THREE.EdgesGeometry(tabletGeo);
        tabletMesh.add(new THREE.LineSegments(tabletEdges, new THREE.LineBasicMaterial({
          color: config.neonColor,
          transparent: true,
          opacity: 0.95
        })));

        // 4 Corner Brackets on the Plan Tablet
        const bracketGeo = new THREE.BoxGeometry(0.18, 0.18, tabletThickness * 1.15);
        const bracketMat = new THREE.MeshBasicMaterial({ color: config.neonColor });
        const halfSW = config.screenW / 2;
        const halfSH = config.screenH / 2;
        [
          [-halfSW, -halfSH],
          [halfSW, -halfSH],
          [-halfSW, halfSH],
          [halfSW, halfSH]
        ].forEach(([bx, by]) => {
          const b = new THREE.Mesh(bracketGeo, bracketMat);
          b.position.set(bx, by, 0);
          screenGroup.add(b);
        });

        // 4 Projection Laser Beams from Vault Head to Plan Tablet
        const beamGeo = new THREE.BufferGeometry();
        const beamPositions = new Float32Array(4 * 2 * 3);
        beamGeo.setAttribute('position', new THREE.BufferAttribute(beamPositions, 3));
        const beamLines = new THREE.LineSegments(
          beamGeo,
          new THREE.LineBasicMaterial({ color: config.neonColor, transparent: true, opacity: 0.55 })
        );
        vGroup.add(beamLines);

        // Floating Outer Badge (when closed)
        const badgeGeo = new THREE.PlaneGeometry(config.badgeW, config.badgeH);
        const badgeMat = new THREE.MeshBasicMaterial({ map: config.badgeTexture, side: THREE.DoubleSide, transparent: true });
        const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
        badgeMesh.position.set(0, h / 2 + 0.45, 0.3);
        vGroup.add(badgeMesh);

        vaults.push({
          idx: config.idx,
          group: vGroup,
          baseY: config.baseY,
          targetY: config.baseY,
          lidGroup: lidGroup,
          targetLidRotX: 0,
          wheelGroup: wheelGroup,
          targetWheelRotZ: 0,
          currentWheelRotZ: 0,
          screenGroup: screenGroup,
          targetScreenY: 0.2,
          currentScreenY: 0.2,
          targetScreenScale: 0.01,
          badgeMesh: badgeMesh,
          coreGroup: coreGroup,
          emitterHead: emitterHead,
          beamLines: beamLines,
          w, h, d,
          screenW: config.screenW,
          screenH: config.screenH
        });
      }

      // 1. Starter Vault (Left: x = -3.8)
      createVaultCube({
        idx: 0,
        x: -3.8,
        baseY: -0.3,
        z: 0.0,
        w: 2.3, h: 2.2, d: 2.3,
        screenW: 3.2, screenH: 2.1,
        glassColor: 0x0f2d6b,
        emissiveColor: 0x1d4ed8,
        neonColor: 0x38bdf8,
        lidColor: 0x172554,
        badgeW: 2.2, badgeH: 0.6,
        badgeTexture: makePillBadgeTexture('Starter | 500 ج/ش', '#38bdf8'),
        detailTexture: makeHoloDetailTexture(
          'باقة Starter',
          '500 ج.م / شهرياً',
          '5,000 ج.م / سنوياً (توفير 17%)',
          ['كاشير سريع ومسح باركود بالهاتف', 'صمود كامل بدون إنترنت عبر IndexedDB', 'مشاركة فورية للفواتير عبر واتساب'],
          '#38bdf8',
          false
        ),
        buildCoreFn(grp) {
          const phone = new THREE.Mesh(
            new THREE.BoxGeometry(0.7, 1.25, 0.08),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
          );
          grp.add(phone);
          const laser = new THREE.Mesh(
            new THREE.PlaneGeometry(0.6, 0.05),
            new THREE.MeshBasicMaterial({ color: 0x10b981 })
          );
          laser.position.z = 0.05;
          phone.add(laser);
          grp.userData.phone = phone;
        }
      });

      // 2. Pro Star Vault (Center: x = 0.0 - Recommended Hero ⭐)
      createVaultCube({
        idx: 1,
        x: 0.0,
        baseY: 0.2,
        z: 0.5,
        w: 2.6, h: 2.5, d: 2.6,
        screenW: 3.5, screenH: 2.3,
        glassColor: 0x082f49,
        emissiveColor: 0xb45309,
        neonColor: 0xf59e0b,
        lidColor: 0x0c4a6e,
        badgeW: 2.4, badgeH: 0.65,
        badgeTexture: makePillBadgeTexture('⭐ Pro | 1,500 ج/ش', '#f59e0b'),
        detailTexture: makeHoloDetailTexture(
          '⭐ باقة Pro (الأكثر طلباً)',
          '1,500 ج.م / شهرياً',
          '12,000 ج.م / سنوياً (خصم 33%)',
          ['إدارة المخزون والدفعات وتعدد الوحدات', 'أتمتة الواتساب وتصفير الشكك بنظام FIFO', 'الفاتورة والإيصال الإلكتروني قانون 152/206', 'تقارير معتمدة من 5 محاسبين (CPAs)'],
          '#f59e0b',
          true
        ),
        buildCoreFn(grp) {
          const crown = new THREE.Mesh(
            new THREE.TorusGeometry(0.6, 0.04, 16, 32),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 })
          );
          crown.rotation.x = Math.PI / 2;
          grp.add(crown);

          const halo2 = new THREE.Mesh(
            new THREE.TorusGeometry(0.8, 0.025, 16, 32),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
          );
          halo2.rotation.y = Math.PI / 3;
          grp.add(halo2);

          const starCore = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.35),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.8 })
          );
          grp.add(starCore);

          grp.userData.crown = crown;
          grp.userData.halo2 = halo2;
          grp.userData.starCore = starCore;
        }
      });

      // 3. Max AI Enterprise Vault (Right: x = 3.8)
      createVaultCube({
        idx: 2,
        x: 3.8,
        baseY: -0.3,
        z: 0.0,
        w: 2.3, h: 2.2, d: 2.3,
        screenW: 3.2, screenH: 2.1,
        glassColor: 0x1e1b4b,
        emissiveColor: 0x6d28d9,
        neonColor: 0xa855f7,
        lidColor: 0x2e1065,
        badgeW: 2.2, badgeH: 0.6,
        badgeTexture: makePillBadgeTexture('Max AI | مخصصة', '#a855f7'),
        detailTexture: makeHoloDetailTexture(
          'باقة Max AI & Branches',
          'تسعير مخصص (Enterprise)',
          'عقود سنوية وتجهيز فروع',
          ['ربط سحابي للفروع المتعددة والمخازن', 'تنبؤ ذكي بالطلب وإعادة الطلب بالـ AI', 'بوابة الموردين ودعم مخصص VIP 24/7'],
          '#a855f7',
          false
        ),
        buildCoreFn(grp) {
          const ico = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.5, 1),
            new THREE.MeshStandardMaterial({ color: 0xa855f7, wireframe: true })
          );
          grp.add(ico);
          const core = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.7 })
          );
          grp.add(core);
          grp.userData.ico = ico;
        }
      });

      // ==========================================
      // 5. LUMINOUS ENERGY CONDUITS & PARTICLES
      // ==========================================
      const streamParticles = [];
      const particleCount = 45;
      const streamGeo = new THREE.SphereGeometry(0.08, 10, 10);
      const streamMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

      for (let i = 0; i < particleCount; i++) {
        const p = new THREE.Mesh(streamGeo, streamMat);
        rootGroup.add(p);
        streamParticles.push({
          mesh: p,
          vaultIdx: i % 3,
          progress: Math.random()
        });
      }

      // Ambient Particle Dust
      const dustGeo = new THREE.BufferGeometry();
      const dustCount = 80;
      const dustPos = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount * 3; i++) {
        dustPos[i] = (Math.random() - 0.5) * 18;
      }
      dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
      const dustMat = new THREE.PointsMaterial({ size: 0.08, color: 0x38bdf8, transparent: true, opacity: 0.6 });
      const ambientDust = new THREE.Points(dustGeo, dustMat);
      rootGroup.add(ambientDust);

      // ==========================================
      // 6. THREE UNIT ECONOMICS HOLOGRAPHIC GAUGES
      // ==========================================
      function createGauge(texture, x, y, z) {
        const geo = new THREE.PlaneGeometry(2.4, 0.88);
        const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        rootGroup.add(mesh);
        return mesh;
      }

      // Gauge 1: Payback Speedometer (Above Starter)
      const gaugePayback = createGauge(
        makeMetricBadgeTexture('سرعة استرداد التكلفة', '< شهر واحد', 'هامش ربح إجمالي ~90%', '#10b981', '⚡'),
        -3.8, 3.5, -0.2
      );

      // Gauge 2: LTV / CAC Multiplier (Above Pro)
      const gaugeLtvCac = createGauge(
        makeMetricBadgeTexture('عائد استثنائي لرأس المال', '16x - 32x LTV/CAC', 'LTV: 10,000 ج.م | CAC: 300-600 ج.م', '#f59e0b', '🎯'),
        0, 4.3, 0.3
      );

      // Gauge 3: Breakeven Point (Above Max AI)
      const gaugeBreakeven = createGauge(
        makeMetricBadgeTexture('الأمان المالي والتعادل', '20 متجراً فقط', 'تغطية التكاليف التشغيلية بالكامل', '#38bdf8', '⚖️'),
        3.8, 3.5, -0.2
      );

      // ==========================================
      // 7. CAMERA TARGETS & TIER CONTROLLER
      // ==========================================
      const tierCamTargets = [
        // 0: Starter
        {
          camPos: new THREE.Vector3(-3.8, 1.4, 9.0),
          lookAt: new THREE.Vector3(-3.8, 1.3, 0.0)
        },
        // 1: Pro ⭐ Hero
        {
          camPos: new THREE.Vector3(0.0, 1.8, 9.6),
          lookAt: new THREE.Vector3(0.0, 1.6, 0.4)
        },
        // 2: Max AI
        {
          camPos: new THREE.Vector3(3.8, 1.4, 9.0),
          lookAt: new THREE.Vector3(3.8, 1.3, 0.0)
        }
      ];

      let currentCamPos = tierCamTargets[1].camPos.clone();
      let currentLookAt = tierCamTargets[1].lookAt.clone();
      let targetCamPos = tierCamTargets[1].camPos.clone();
      let targetLookAt = tierCamTargets[1].lookAt.clone();
      camera.position.copy(currentCamPos);
      camera.lookAt(currentLookAt);

      tierSelector = {
        select(idx) {
          if (tierCamTargets[idx]) {
            targetCamPos.copy(tierCamTargets[idx].camPos);
            targetLookAt.copy(tierCamTargets[idx].lookAt);
          }

          // Sync HTML
          [0, 1, 2].forEach(i => {
            const el = document.getElementById('stat-tier-' + i);
            if (el) {
              if (i === idx) el.classList.add('active');
              else el.classList.remove('active');
            }
            const btn = document.getElementById('btn-tier-' + i);
            if (btn) {
              if (i === idx) btn.classList.add('active');
              else btn.classList.remove('active');
            }
          });

          // Animate Vaults: Open selected, close others
          vaults.forEach(v => {
            if (v.idx === idx) {
              v.targetY = v.baseY + 0.35;
              v.targetWheelRotZ = Math.PI * 2; // Unlock spin
              v.targetLidRotX = -Math.PI * 0.42; // Swing lid open backward
              v.targetScreenY = v.h / 2 + 1.85; // Moves right to head of vault!
              v.targetScreenScale = 1.0;
              v.badgeMesh.visible = false;
              v.beamLines.visible = true;
            } else {
              v.targetY = v.baseY;
              v.targetWheelRotZ = 0;
              v.targetLidRotX = 0;
              v.targetScreenY = 0.2;
              v.targetScreenScale = 0.01;
              v.badgeMesh.visible = true;
              v.beamLines.visible = false;
            }
          });
        }
      };

      // Initial state: Pro (idx = 1)
      tierSelector.select(1);

      // Direct Click Raycasting on Vault Cubes
      if (stageElem) {
        const raycaster = new THREE.Raycaster();
        const clickVec = new THREE.Vector2();
        stageElem.addEventListener('click', (e) => {
          const rect = stageElem.getBoundingClientRect();
          clickVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          clickVec.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
          raycaster.setFromCamera(clickVec, camera);

          vaults.forEach(v => {
            const hits = raycaster.intersectObjects(v.group.children, true);
            if (hits.length > 0) {
              tierSelector.select(v.idx);
            }
          });
        });
      }

      return {
        update(time) {
          // Smooth Camera Glide
          currentCamPos.lerp(targetCamPos, 0.055);
          currentLookAt.lerp(targetLookAt, 0.055);

          const pX = mouseX * 0.22;
          const pY = -mouseY * 0.14;
          camera.position.set(currentCamPos.x + pX, currentCamPos.y + pY, currentCamPos.z);
          camera.lookAt(currentLookAt.x, currentLookAt.y, currentLookAt.z);

          // Animate Vault Cubes, Wheel Locks & Head Plan Tablets
          vaults.forEach(v => {
            v.group.position.y += (v.targetY - v.group.position.y) * 0.08;

            // Rotate 3D mechanical lock wheel
            v.currentWheelRotZ += (v.targetWheelRotZ - v.currentWheelRotZ) * 0.08;
            v.wheelGroup.rotation.z = v.currentWheelRotZ;

            // Swing lid smoothly
            v.lidGroup.rotation.x += (v.targetLidRotX - v.lidGroup.rotation.x) * 0.08;

            // Move plan tablet to head of vault
            v.currentScreenY += (v.targetScreenY - v.currentScreenY) * 0.08;
            const currentScale = v.screenGroup.scale.x;
            const nextScale = currentScale + (v.targetScreenScale - currentScale) * 0.08;
            v.screenGroup.scale.set(nextScale, nextScale, nextScale);

            // Floating gentle hover at head of vault when open
            if (nextScale > 0.5) {
              v.screenGroup.position.y = v.currentScreenY + Math.sin(time * 2.2 + v.idx) * 0.06;
              v.screenGroup.rotation.y = Math.sin(time * 1.2) * 0.03;
              v.screenGroup.rotation.x = -0.05;

              // Update 4 projection beams from head emitter to tablet corners
              const posAttr = v.beamLines.geometry.attributes.position;
              const emitterX = 0, emitterY = v.h / 2 + 0.15, emitterZ = v.d / 2;
              const scrX = v.screenGroup.position.x;
              const scrY = v.screenGroup.position.y;
              const scrZ = v.screenGroup.position.z;
              const hw = v.screenW / 2;
              const hh = v.screenH / 2;

              const corners = [
                [scrX - hw, scrY - hh, scrZ],
                [scrX + hw, scrY - hh, scrZ],
                [scrX - hw, scrY + hh, scrZ],
                [scrX + hw, scrY + hh, scrZ]
              ];

              let ptr = 0;
              corners.forEach(([cx, cy, cz]) => {
                posAttr.setXYZ(ptr++, emitterX, emitterY, emitterZ);
                posAttr.setXYZ(ptr++, cx, cy, cz);
              });
              posAttr.needsUpdate = true;
            }

            // Internal Item Animations
            if (v.coreGroup.userData.crown) {
              v.coreGroup.userData.crown.rotation.z = time * 0.7;
            }
            if (v.coreGroup.userData.halo2) {
              v.coreGroup.userData.halo2.rotation.y = time * 0.9;
            }
            if (v.coreGroup.userData.starCore) {
              v.coreGroup.userData.starCore.rotation.y = time * 0.5;
            }
            if (v.coreGroup.userData.ico) {
              v.coreGroup.userData.ico.rotation.y = time * 0.8;
              v.coreGroup.userData.ico.rotation.x = time * 0.5;
            }
          });

          // Central Vault Core Pulsing & Iris Spin
          vCore.scale.setScalar(1.0 + Math.sin(time * 3.0) * 0.08);
          vHatch.rotation.z = time * 0.4;

          // Stream Energy Particles into Central Vault
          streamParticles.forEach(sp => {
            sp.progress = (sp.progress + 0.012) % 1.0;
            const v = vaults[sp.vaultIdx];
            if (v) {
              const startX = v.group.position.x;
              const startY = v.group.position.y - v.h / 2;
              const startZ = v.group.position.z;

              const endX = 0;
              const endY = -2.3;
              const endZ = 0.2;

              sp.mesh.position.x = startX + (endX - startX) * sp.progress;
              sp.mesh.position.y = startY + (endY - startY) * sp.progress;
              sp.mesh.position.z = startZ + (endZ - startZ) * sp.progress;
            }
          });

          // Floating metric gauges gentle bob
          gaugePayback.position.y = 3.5 + Math.sin(time * 1.5) * 0.06;
          gaugeLtvCac.position.y = 4.3 + Math.sin(time * 1.5 + 1.0) * 0.08;
          gaugeBreakeven.position.y = 3.5 + Math.sin(time * 1.5 + 2.0) * 0.06;

          // Ambient dust drift
          ambientDust.rotation.y = time * 0.02;
        }
      };
    }

    window.selectTier = function(idx) {
      if (tierSelector) tierSelector.select(idx);
    };

    // --- SLIDE 6: 3D Interactive Alexandria Retail Street & Storefronts Diorama (GTM) ---
    let gtmSelector = null;

    function buildSlide6Scene(scene, camera) {
      camera.position.set(-2.9, 0.9, 6.4);
      camera.lookAt(-2.6, 0.6, 0.0);

      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      // Mouse Parallax Setup
      let mouseX = 0, mouseY = 0;
      const stageElem = document.getElementById('stage-slide-6');
      if (stageElem) {
        stageElem.addEventListener('mousemove', (e) => {
          const rect = stageElem.getBoundingClientRect();
          mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        });
        stageElem.addEventListener('mouseleave', () => {
          mouseX = 0;
          mouseY = 0;
        });
      }

      // ------------------------------------------
      // LIGHTING RIG
      // ------------------------------------------
      const ambientLight = new THREE.AmbientLight(0x94a3b8, 0.6);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.1);
      sunLight.position.set(5, 12, 7);
      scene.add(sunLight);

      const streetLight1 = new THREE.PointLight(0xffb703, 1.8, 6);
      streetLight1.position.set(-4.5, 1.4, 0.5);
      scene.add(streetLight1);

      const streetLight2 = new THREE.PointLight(0xffb703, 1.8, 6);
      streetLight2.position.set(1.5, 1.4, 0.5);
      scene.add(streetLight2);

      const stage0Spot = new THREE.PointLight(0x38bdf8, 1.5, 7);
      stage0Spot.position.set(-3.4, 1.0, 0.8);
      scene.add(stage0Spot);

      const stage1Spot = new THREE.PointLight(0xf59e0b, 1.5, 7);
      stage1Spot.position.set(0.0, 1.0, 0.8);
      scene.add(stage1Spot);

      const stage2Spot = new THREE.PointLight(0xa78bfa, 1.8, 8);
      stage2Spot.position.set(3.6, 2.5, 0.4);
      scene.add(stage2Spot);

      // ------------------------------------------
      // PROCEDURAL TEXTURE GENERATORS
      // ------------------------------------------
      function makeAwningTexture(c1, c2) {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');
        const stripeWidth = 32;
        for (let x = 0; x < c.width; x += stripeWidth * 2) {
          ctx.fillStyle = c1;
          ctx.fillRect(x, 0, stripeWidth, c.height);
          ctx.fillStyle = c2;
          ctx.fillRect(x + stripeWidth, 0, stripeWidth, c.height);
        }
        // Subtle fabric shadow gradient
        const grad = ctx.createLinearGradient(0, 0, 0, c.height);
        grad.addColorStop(0, 'rgba(0,0,0,0.3)');
        grad.addColorStop(0.3, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.35)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, c.width, c.height);

        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 1);
        return tex;
      }

      function makeShopSignTexture(titleAr, subEn, icon, bgGrad1, bgGrad2, accent) {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 140;
        const ctx = c.getContext('2d');

        // Background gradient
        const bg = ctx.createLinearGradient(0, 0, 512, 140);
        bg.addColorStop(0, bgGrad1);
        bg.addColorStop(1, bgGrad2);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 512, 140);

        // Border
        ctx.strokeStyle = accent;
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, 506, 134);

        // Inner glowing border line
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(8, 8, 496, 124);

        // Icon
        ctx.font = '48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(icon, 60, 85);

        // Arabic Title
        ctx.font = 'bold 34px Cairo, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.direction = 'rtl';
        ctx.fillText(titleAr, 485, 62);

        // Subtitle English
        ctx.font = 'bold 15px Outfit, sans-serif';
        ctx.fillStyle = accent;
        ctx.direction = 'ltr';
        ctx.fillText(subEn, 120, 105);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      function makeGroceryWindowTexture() {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 256, 256);

        // Warm interior shop shelves
        for (let row = 0; row < 4; row++) {
          const y = row * 60 + 20;
          ctx.fillStyle = '#334155';
          ctx.fillRect(10, y + 35, 236, 6);

          // Products on shelf
          for (let col = 0; col < 6; col++) {
            const x = 20 + col * 38;
            const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
            ctx.fillStyle = colors[(row + col) % colors.length];
            ctx.fillRect(x, y + 10, 26, 25);
            // Cap / detail
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 5, y + 5, 16, 5);
          }
        }
        const tex = new THREE.CanvasTexture(c);
        return tex;
      }

      function makeRoasteryWindowTexture() {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#1c1917';
        ctx.fillRect(0, 0, 256, 256);

        // Glass jars of coffee beans & spices
        for (let row = 0; row < 3; row++) {
          const y = row * 75 + 30;
          ctx.fillStyle = '#78350f';
          ctx.fillRect(10, y + 50, 236, 8);

          for (let col = 0; col < 5; col++) {
            const x = 25 + col * 46;
            ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
            ctx.fillRect(x, y + 12, 32, 38);
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y + 12, 32, 38);
            // Brass lid
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(x + 2, y + 4, 28, 8);
          }
        }
        const tex = new THREE.CanvasTexture(c);
        return tex;
      }

      function makeRoadTexture() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 256;
        const ctx = c.getContext('2d');

        // Dark asphalt with subtle noise
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 512, 256);

        // White dashed center line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.setLineDash([28, 20]);
        ctx.beginPath();
        ctx.moveTo(0, 128);
        ctx.lineTo(512, 128);
        ctx.stroke();
        ctx.setLineDash([]);

        // Zebra pedestrian crosswalk stripes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        for (let i = 0; i < 7; i++) {
          ctx.fillRect(200 + i * 24, 20, 14, 216);
        }

        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.repeat.set(2, 1);
        return tex;
      }

      function makePavementTexture() {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#334155';
        ctx.fillRect(0, 0, 256, 256);

        // Tile grid
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        const step = 32;
        for (let x = 0; x <= 256; x += step) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke();
        }
        for (let y = 0; y <= 256; y += step) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke();
        }

        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(4, 3);
        return tex;
      }

      function makeFloatingBadgeTexture(emoji, label, color) {
        const c = document.createElement('canvas');
        c.width = 240;
        c.height = 90;
        const ctx = c.getContext('2d');

        ctx.fillStyle = 'rgba(11, 22, 44, 0.95)';
        ctx.beginPath();
        ctx.roundRect(4, 4, 232, 82, 18);
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        ctx.font = '36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(emoji, 44, 58);

        ctx.font = 'bold 20px Cairo, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.fillText(label, 220, 52);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      function makeStageBannerTexture(stageTitle, tag, subText, accentColor) {
        const c = document.createElement('canvas');
        c.width = 480;
        c.height = 140;
        const ctx = c.getContext('2d');

        // Glass dark backdrop
        ctx.fillStyle = 'rgba(6, 15, 30, 0.94)';
        ctx.beginPath();
        ctx.roundRect(4, 4, 472, 132, 14);
        ctx.fill();

        // Glowing border
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Top Tag
        ctx.font = 'bold 13px Outfit, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.direction = 'ltr';
        ctx.fillText(tag, 22, 34);

        // Stage Title
        ctx.font = 'bold 22px Cairo, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.direction = 'rtl';
        ctx.fillText(stageTitle, 455, 68);

        // Divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(22, 85); ctx.lineTo(455, 85); ctx.stroke();

        // Subtext / description
        ctx.font = 'bold 14px Cairo, sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.direction = 'rtl';
        ctx.fillText(subText, 455, 116);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      // ------------------------------------------
      // URBAN BLOCK DIORAMA BASE
      // ------------------------------------------
      const dioramaGroup = new THREE.Group();
      rootGroup.add(dioramaGroup);

      // Main structural base slab
      const baseSlabGeo = new THREE.BoxGeometry(12.4, 0.45, 6.4);
      const baseSlabMat = new THREE.MeshStandardMaterial({
        color: 0x090d16,
        roughness: 0.3,
        metalness: 0.8
      });
      const baseSlab = new THREE.Mesh(baseSlabGeo, baseSlabMat);
      baseSlab.position.set(0, -1.2, 0);
      dioramaGroup.add(baseSlab);

      // Neon base rim accent
      const baseTrimGeo = new THREE.BoxGeometry(12.46, 0.05, 6.46);
      const baseTrimMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
      const baseTrim = new THREE.Mesh(baseTrimGeo, baseTrimMat);
      baseTrim.position.set(0, -0.98, 0);
      dioramaGroup.add(baseTrim);

      // Asphalt Roadway (in front)
      const roadGeo = new THREE.BoxGeometry(12.4, 0.06, 2.4);
      const roadMat = new THREE.MeshStandardMaterial({
        map: makeRoadTexture(),
        roughness: 0.8,
        metalness: 0.1
      });
      const roadMesh = new THREE.Mesh(roadGeo, roadMat);
      roadMesh.position.set(0, -0.95, 2.0);
      dioramaGroup.add(roadMesh);

      // Concrete Sidewalk (raised pavement)
      const sidewalkGeo = new THREE.BoxGeometry(12.4, 0.18, 4.0);
      const sidewalkMat = new THREE.MeshStandardMaterial({
        map: makePavementTexture(),
        roughness: 0.7,
        metalness: 0.1
      });
      const sidewalkMesh = new THREE.Mesh(sidewalkGeo, sidewalkMat);
      sidewalkMesh.position.set(0, -0.87, -1.2);
      dioramaGroup.add(sidewalkMesh);

      // Sidewalk Curb Stone
      const curbGeo = new THREE.BoxGeometry(12.4, 0.22, 0.14);
      const curbMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
      const curbMesh = new THREE.Mesh(curbGeo, curbMat);
      curbMesh.position.set(0, -0.85, 0.76);
      dioramaGroup.add(curbMesh);

      // Street Lamps (Vintage Alexandria street style)
      function createStreetLamp(x, z) {
        const lampGroup = new THREE.Group();
        lampGroup.position.set(x, -0.78, z);

        // Base
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.16, 0.2, 8),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 })
        );
        lampGroup.add(base);

        // Pole
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.045, 0.06, 2.3, 8),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 })
        );
        pole.position.y = 1.15;
        lampGroup.add(pole);

        // Lantern head
        const lantern = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.08, 0.28, 6),
          new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
        );
        lantern.position.y = 2.35;
        lampGroup.add(lantern);

        // Glowing bulb inside
        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 12, 12),
          new THREE.MeshBasicMaterial({ color: 0xfef08a })
        );
        bulb.position.y = 2.35;
        lampGroup.add(bulb);

        dioramaGroup.add(lampGroup);
      }
      createStreetLamp(-4.5, 0.5);
      createStreetLamp(1.5, 0.5);

      // Sidewalk Planter Box
      function createPlanter(x, z) {
        const planter = new THREE.Mesh(
          new THREE.BoxGeometry(0.65, 0.35, 0.35),
          new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 })
        );
        planter.position.set(x, -0.65, z);
        dioramaGroup.add(planter);

        const bush = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.24),
          new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 })
        );
        bush.position.set(x, -0.4, z);
        dioramaGroup.add(bush);
      }
      createPlanter(-1.8, 0.5);
      createPlanter(1.0, 0.5);

      // ------------------------------------------
      // STAGE 0: DIRECT FIELD BEACHHEAD (SUPERMARKET)
      // ------------------------------------------
      const stage0Group = new THREE.Group();
      stage0Group.position.set(-3.4, 0, -0.6);
      rootGroup.add(stage0Group);

      // Building Structure
      const bldg0Mat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.2 });
      const bldg0 = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.2, 2.0), bldg0Mat);
      bldg0.position.set(0, 0.8, 0);
      stage0Group.add(bldg0);

      // Ground Floor Storefront Glass
      const storeWindow0 = new THREE.Mesh(
        new THREE.PlaneGeometry(2.6, 1.4),
        new THREE.MeshStandardMaterial({ map: makeGroceryWindowTexture(), roughness: 0.1 })
      );
      storeWindow0.position.set(0, 0.05, 1.01);
      stage0Group.add(storeWindow0);

      // Red & White Striped Awning
      const awning0 = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.08, 0.85),
        new THREE.MeshStandardMaterial({ map: makeAwningTexture('#dc2626', '#ffffff'), roughness: 0.4 })
      );
      awning0.position.set(0, 0.85, 1.35);
      awning0.rotation.x = 0.38;
      stage0Group.add(awning0);

      // Shop Signboard
      const sign0 = new THREE.Mesh(
        new THREE.BoxGeometry(2.9, 0.55, 0.1),
        new THREE.MeshStandardMaterial({
          map: makeShopSignTexture('سوبرماركت البركة', 'AL-BARAKA MARKET • EAST ALEX', '🛒', '#020617', '#1e3a8a', '#38bdf8'),
          roughness: 0.2
        })
      );
      sign0.position.set(0, 1.35, 1.05);
      stage0Group.add(sign0);

      // Fruit Crates on Sidewalk
      const crateMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.7 });
      const crate1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.28, 0.35), crateMat);
      crate1.position.set(-0.9, -0.62, 1.35);
      stage0Group.add(crate1);

      // Orange fruits inside crate
      for (let fx = -0.15; fx <= 0.15; fx += 0.15) {
        for (let fz = -0.08; fz <= 0.08; fz += 0.08) {
          const fruit = new THREE.Mesh(
            new THREE.SphereGeometry(0.045, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0xf97316 })
          );
          fruit.position.set(-0.9 + fx, -0.45, 1.35 + fz);
          stage0Group.add(fruit);
        }
      }

      // Checkout Counter Desk
      const counterDesk = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.5, 0.45),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 })
      );
      counterDesk.position.set(0.45, -0.52, 1.35);
      stage0Group.add(counterDesk);

      // Smartphone on Stand running Hesabaty POS
      const phoneGroup = new THREE.Group();
      phoneGroup.position.set(0.45, -0.08, 1.38);
      phoneGroup.rotation.y = 0.25;
      stage0Group.add(phoneGroup);

      const phoneBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.44, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 })
      );
      phoneGroup.add(phoneBody);

      // Phone screen
      const phoneScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.21, 0.4),
        new THREE.MeshBasicMaterial({ color: 0x0284c7 })
      );
      phoneScreen.position.z = 0.018;
      phoneGroup.add(phoneScreen);

      // Laser Scanner Beam Plane
      const laserMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.25, 0.03),
        new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide })
      );
      laserMesh.position.set(0, 0, 0.025);
      phoneGroup.add(laserMesh);

      // Product box with barcode
      const productBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.22, 0.12),
        new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
      );
      productBox.position.set(0.68, -0.42, 1.38);
      stage0Group.add(productBox);

      // Floating WhatsApp Beacon Badge
      const waBadgeMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.0, 0.38),
        new THREE.MeshBasicMaterial({
          map: makeFloatingBadgeTexture('💬', 'واتساب 2 دقيقة', '#22c55e'),
          side: THREE.DoubleSide
        })
      );
      waBadgeMesh.position.set(0.45, 0.32, 1.4);
      stage0Group.add(waBadgeMesh);

      // Floating Alexandria District Map Pin (Roof Corner Indicator)
      const pinGroup = new THREE.Group();
      pinGroup.position.set(-1.15, 2.45, 0.85);
      stage0Group.add(pinGroup);

      const pinStem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
      );
      pinGroup.add(pinStem);

      const pinSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8 })
      );
      pinSphere.position.y = 0.2;
      pinGroup.add(pinSphere);

      // Stage 0 Floating Banner
      const plaque0Mat = new THREE.MeshBasicMaterial({
        map: makeStageBannerTexture(
          '1️⃣ النفاذ الميداني المباشر',
          'BEACHHEAD • EAST ALEX',
          '📍 شوارع سموحة وميامي • عروض حية لكاميرا الهاتف في دقيقتين',
          '#38bdf8'
        ),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
      });
      const plaque0 = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.68), plaque0Mat);
      plaque0.position.set(0.1, 2.45, 0.7);
      stage0Group.add(plaque0);

      // ------------------------------------------
      // STAGE 1: VIRAL REFERRAL & PARTNER ECOSYSTEM (ROASTERY)
      // ------------------------------------------
      const stage1Group = new THREE.Group();
      stage1Group.position.set(0.0, 0, -0.6);
      rootGroup.add(stage1Group);

      // Roastery Building Structure
      const bldg1Mat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.4, metalness: 0.3 });
      const bldg1 = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.2, 2.0), bldg1Mat);
      bldg1.position.set(0, 0.8, 0);
      stage1Group.add(bldg1);

      // Roastery Glass Window
      const storeWindow1 = new THREE.Mesh(
        new THREE.PlaneGeometry(2.6, 1.4),
        new THREE.MeshStandardMaterial({ map: makeRoasteryWindowTexture(), roughness: 0.1 })
      );
      storeWindow1.position.set(0, 0.05, 1.01);
      stage1Group.add(storeWindow1);

      // Green & Gold Striped Awning
      const awning1 = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.08, 0.85),
        new THREE.MeshStandardMaterial({ map: makeAwningTexture('#15803d', '#fef08a'), roughness: 0.4 })
      );
      awning1.position.set(0, 0.85, 1.35);
      awning1.rotation.x = 0.38;
      stage1Group.add(awning1);

      // Shop Signboard
      const sign1 = new THREE.Mesh(
        new THREE.BoxGeometry(2.9, 0.55, 0.1),
        new THREE.MeshStandardMaterial({
          map: makeShopSignTexture('محمصة ومطحنة الفيروز', 'AL-FAYROUZ ROASTERY & SPICES', '☕', '#1c1917', '#451a03', '#f59e0b'),
          roughness: 0.2
        })
      );
      sign1.position.set(0, 1.35, 1.05);
      stage1Group.add(sign1);

      // CPA & Hardware Partner Desk (outside Roastery)
      const partnerDesk = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.5, 0.45),
        new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.3 })
      );
      partnerDesk.position.set(0.65, -0.52, 1.35);
      stage1Group.add(partnerDesk);

      // Thermal Receipt Printer Model
      const printerMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.18, 0.22),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6 })
      );
      printerMesh.position.set(0.65, -0.22, 1.35);
      stage1Group.add(printerMesh);

      // Paper Receipt Ribbon
      const receiptSlip = new THREE.Mesh(
        new THREE.PlaneGeometry(0.12, 0.22),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      );
      receiptSlip.position.set(0.65, -0.06, 1.4);
      receiptSlip.rotation.x = 0.3;
      stage1Group.add(receiptSlip);

      // CPA Wall Plaque
      const cpaPlaque = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.32, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 })
      );
      cpaPlaque.position.set(1.15, 0.1, 1.02);
      stage1Group.add(cpaPlaque);

      // ------------------------------------------
      // REFERRAL BRIDGE (STORE 0 -> STORE 1)
      // ------------------------------------------
      const bridgeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.9, -0.3, 0.8),
        new THREE.Vector3(-1.8, 0.6, 1.1),
        new THREE.Vector3(-0.7, -0.3, 0.8)
      ]);

      const bridgeGeo = new THREE.TubeGeometry(bridgeCurve, 32, 0.04, 10, false);
      const bridgeMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.7,
        metalness: 0.8,
        roughness: 0.2
      });
      const bridgeMesh = new THREE.Mesh(bridgeGeo, bridgeMat);
      rootGroup.add(bridgeMesh);

      // Referral Energy Transit Particles
      const refParticles = [];
      const refPartGeo = new THREE.SphereGeometry(0.06, 10, 10);
      const refPartMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
      for (let i = 0; i < 6; i++) {
        const rp = new THREE.Mesh(refPartGeo, refPartMat);
        rootGroup.add(rp);
        refParticles.push({ mesh: rp, offset: i / 6 });
      }

      // Floating 3D Gift Box (1 Month Free Referral Token)
      const giftGroup = new THREE.Group();
      giftGroup.position.set(-1.8, 0.75, 1.1);
      rootGroup.add(giftGroup);

      const giftBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.32, 0.32),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.2 })
      );
      giftGroup.add(giftBox);

      const ribbon1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.33, 0.33, 0.06),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      giftGroup.add(ribbon1);

      const ribbon2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.33, 0.33),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      giftGroup.add(ribbon2);

      const giftBadge = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 0.4),
        new THREE.MeshBasicMaterial({
          map: makeFloatingBadgeTexture('🎁', 'شهر مجاني لكل إحالة', '#f59e0b'),
          side: THREE.DoubleSide
        })
      );
      giftBadge.position.set(0, 0.45, 0);
      giftGroup.add(giftBadge);

      // Stage 1 Floating Banner
      const plaque1Mat = new THREE.MeshBasicMaterial({
        map: makeStageBannerTexture(
          '2️⃣ محركات الإحالة والشراكات',
          'VIRAL REFERRAL & CPAS',
          '🎁 شهر مجاني لكل متجر مُحال • تحالفات مع المحاسبين القانونيين',
          '#f59e0b'
        ),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
      });
      const plaque1 = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.68), plaque1Mat);
      plaque1.position.set(0.0, 2.45, 0.7);
      stage1Group.add(plaque1);

      // ------------------------------------------
      // STAGE 2: REGIONAL PAN-EGYPT & GULF EXPANSION (TOWER & WAYPOINTS)
      // ------------------------------------------
      const stage2Group = new THREE.Group();
      stage2Group.position.set(3.6, 0, -0.4);
      rootGroup.add(stage2Group);

      // Cyber pedestal base
      const pedGeo = new THREE.CylinderGeometry(1.1, 1.3, 0.4, 8);
      const pedMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.8, roughness: 0.2 });
      const pedMesh = new THREE.Mesh(pedGeo, pedMat);
      pedMesh.position.y = -0.58;
      stage2Group.add(pedMesh);

      // Glowing cyber ring
      const cyberRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.2, 0.035, 12, 32),
        new THREE.MeshBasicMaterial({ color: 0xa78bfa })
      );
      cyberRing.position.y = -0.38;
      cyberRing.rotation.x = Math.PI / 2;
      stage2Group.add(cyberRing);

      // Telecom Lattice Tower (3.6m tall)
      const towerGroup = new THREE.Group();
      towerGroup.position.set(0, -0.38, 0);
      stage2Group.add(towerGroup);

      // Central Mast
      const mastGeo = new THREE.CylinderGeometry(0.04, 0.12, 3.4, 8);
      const mastMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.y = 1.7;
      towerGroup.add(mast);

      // Truss Rings along mast
      for (let tr = 1; tr <= 4; tr++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.35 - tr * 0.06, 0.02, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 })
        );
        ring.position.y = tr * 0.7;
        ring.rotation.x = Math.PI / 2;
        towerGroup.add(ring);
      }

      // Rotating Radar Dish at top
      const radarDish = new THREE.Mesh(
        new THREE.ConeGeometry(0.28, 0.12, 16, 1, true),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, side: THREE.DoubleSide })
      );
      radarDish.position.set(0, 3.3, 0);
      radarDish.rotation.x = -Math.PI / 3;
      towerGroup.add(radarDish);

      // Top Obstruction Flashing Beacon
      const towerBeacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      towerBeacon.position.y = 3.5;
      towerGroup.add(towerBeacon);

      // Expanding Broadcast Signal Waves
      const broadcastRings = [];
      for (let br = 0; br < 3; br++) {
        const bRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.5, 0.025, 8, 32),
          new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.7 })
        );
        bRing.position.set(0, 3.4, 0);
        bRing.rotation.x = Math.PI / 2;
        stage2Group.add(bRing);
        broadcastRings.push({ mesh: bRing, offset: br * 0.33 });
      }

      // Floating Regional Spatial Waypoints: Delta, Cairo, Saudi ZATCA
      const waypoints = [
        {
          emoji: '🌾',
          label: 'مدن الدلتا',
          color: '#38bdf8',
          pos: new THREE.Vector3(-1.1, 1.4, 0.6)
        },
        {
          emoji: '🏛️',
          label: 'القاهرة (2.2M)',
          color: '#f59e0b',
          pos: new THREE.Vector3(0.0, 2.2, 0.8)
        },
        {
          emoji: '🛡️',
          label: 'الخليج ZATCA',
          color: '#10b981',
          pos: new THREE.Vector3(1.2, 1.5, 0.5)
        }
      ];

      const waypointMeshes = [];
      waypoints.forEach((wp) => {
        const wpGroup = new THREE.Group();
        wpGroup.position.copy(wp.pos);
        stage2Group.add(wpGroup);

        const orb = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 16, 16),
          new THREE.MeshStandardMaterial({ color: wp.color, emissive: wp.color, emissiveIntensity: 0.8 })
        );
        wpGroup.add(orb);

        const wpBadge = new THREE.Mesh(
          new THREE.PlaneGeometry(1.25, 0.42),
          new THREE.MeshBasicMaterial({
            map: makeFloatingBadgeTexture(wp.emoji, wp.label, wp.color),
            side: THREE.DoubleSide
          })
        );
        wpBadge.position.set(0, 0.42, 0);
        wpGroup.add(wpBadge);

        // Beam linking tower to waypoint
        const beamGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 3.4, 0),
          wp.pos
        ]);
        const beamMat = new THREE.LineBasicMaterial({ color: wp.color, transparent: true, opacity: 0.6 });
        const beamLine = new THREE.Line(beamGeo, beamMat);
        stage2Group.add(beamLine);

        waypointMeshes.push({ group: wpGroup, baseY: wp.pos.y, speed: Math.random() * 0.5 + 1.5 });
      });

      // Stage 2 Floating Banner
      const plaque2Mat = new THREE.MeshBasicMaterial({
        map: makeStageBannerTexture(
          '3️⃣ التوسع الجغرافي والإقليمي',
          'NATIONAL & GULF SCALE',
          '🚀 الدلتا • القاهرة الكبرى (2.2M) • السعودية والخليج (ZATCA)',
          '#a78bfa'
        ),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
      });
      const plaque2 = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.68), plaque2Mat);
      plaque2.position.set(0.0, 2.55, 0.7);
      stage2Group.add(plaque2);

      // ------------------------------------------
      // CAMERA GLIDE TARGETS FOR THE 3 REAL STAGES
      // ------------------------------------------
      const gtmCamTargets = [
        // 0: Storefront 1 (Direct Field Beachhead: East Alex)
        {
          camPos: new THREE.Vector3(-2.9, 0.9, 6.4),
          lookAt: new THREE.Vector3(-2.6, 0.6, 0.0)
        },
        // 1: Storefront 2 (Referral Bridge & CPA Partner Desk)
        {
          camPos: new THREE.Vector3(-0.3, 1.0, 6.8),
          lookAt: new THREE.Vector3(-0.3, 0.7, 0.0)
        },
        // 2: Expansion Hub (Telecom Tower, Egypt & Gulf Waypoints)
        {
          camPos: new THREE.Vector3(2.6, 1.3, 7.2),
          lookAt: new THREE.Vector3(2.4, 0.9, 0.0)
        }
      ];

      let currentCamPos = gtmCamTargets[0].camPos.clone();
      let currentLookAt = gtmCamTargets[0].lookAt.clone();
      let targetCamPos = gtmCamTargets[0].camPos.clone();
      let targetLookAt = gtmCamTargets[0].lookAt.clone();

      const stages = [
        { group: stage0Group, plaque: plaque0, spot: stage0Spot, idx: 0 },
        { group: stage1Group, plaque: plaque1, spot: stage1Spot, idx: 1 },
        { group: stage2Group, plaque: plaque2, spot: stage2Spot, idx: 2 }
      ];

      gtmSelector = {
        select(idx) {
          if (gtmCamTargets[idx]) {
            targetCamPos.copy(gtmCamTargets[idx].camPos);
            targetLookAt.copy(gtmCamTargets[idx].lookAt);
          }

          // Sync buttons & side cards
          [0, 1, 2].forEach(i => {
            const btn = document.getElementById('btn-gtm-' + i);
            if (btn) {
              if (i === idx) btn.classList.add('active');
              else btn.classList.remove('active');
            }
            const card = document.getElementById('card-gtm-' + i);
            if (card) {
              if (i === idx) card.classList.add('active');
              else card.classList.remove('active');
            }
          });

          // Spotlight & Plaque Highlighting
          stages.forEach(st => {
            if (st.idx === idx) {
              st.spot.intensity = 2.2;
              st.plaque.scale.set(1.1, 1.1, 1.1);
              st.plaque.material.opacity = 1.0;
            } else {
              st.spot.intensity = 0.8;
              st.plaque.scale.set(0.95, 0.95, 0.95);
              st.plaque.material.opacity = 0.55;
            }
          });
        }
      };

      // Initial state
      gtmSelector.select(0);

      // Direct 3D Canvas Click to select stage
      if (stageElem) {
        const raycaster = new THREE.Raycaster();
        const clickVec = new THREE.Vector2();
        stageElem.addEventListener('click', (e) => {
          const rect = stageElem.getBoundingClientRect();
          clickVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          clickVec.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
          raycaster.setFromCamera(clickVec, camera);

          stages.forEach(st => {
            const intersects = raycaster.intersectObjects(st.group.children, true);
            if (intersects.length > 0) {
              gtmSelector.select(st.idx);
            }
          });
        });
      }

      return {
        update(time) {
          // Smooth Camera Lerp
          currentCamPos.lerp(targetCamPos, 0.055);
          currentLookAt.lerp(targetLookAt, 0.055);

          const pX = mouseX * 0.22;
          const pY = -mouseY * 0.14;
          camera.position.set(currentCamPos.x + pX, currentCamPos.y + pY, currentCamPos.z);
          camera.lookAt(currentLookAt.x, currentLookAt.y, currentLookAt.z);

          // Stage 0 Animations: Barcode laser sweep & WhatsApp beacon
          if (laserMesh) {
            laserMesh.position.y = Math.sin(time * 4.0) * 0.15;
          }
          if (waBadgeMesh) {
            waBadgeMesh.position.y = 0.32 + Math.sin(time * 2.5) * 0.04;
          }
          if (pinSphere) {
            pinSphere.position.y = 0.24 + Math.sin(time * 2.0) * 0.03;
          }

          // Stage 1 Animations: Referral Particles along arch & Gift Box
          refParticles.forEach(rp => {
            const t = (time * 0.25 + rp.offset) % 1.0;
            const pt = bridgeCurve.getPointAt(t);
            rp.mesh.position.copy(pt);
          });
          if (giftGroup) {
            giftGroup.rotation.y = time * 0.8;
            giftGroup.position.y = 0.75 + Math.sin(time * 2.5) * 0.06;
          }

          // Stage 2 Animations: Radar Dish rotation, Tower Beacon pulse, Broadcast waves
          if (radarDish) {
            radarDish.rotation.z = time * 1.5;
          }
          if (towerBeacon) {
            towerBeacon.material.color.setHex((Math.floor(time * 3) % 2 === 0) ? 0xef4444 : 0x0284c7);
          }
          broadcastRings.forEach(br => {
            const progress = (time * 0.4 + br.offset) % 1.0;
            const scale = 0.4 + progress * 2.2;
            br.mesh.scale.set(scale, scale, scale);
            br.mesh.material.opacity = Math.max(0, (1.0 - progress) * 0.8);
          });
          waypointMeshes.forEach((wm, idx) => {
            wm.group.position.y = wm.baseY + Math.sin(time * wm.speed + idx) * 0.06;
          });
        }
      };
    }

    window.selectGtmStage = function(idx) {
      if (gtmSelector) gtmSelector.select(idx);
    };

    // --- SLIDE 7: 3D Specific Operational Validation Testbed ---
    let valSelector = null;

    function buildSlide7Scene(scene, camera) {
      camera.position.set(0, 0.2, 10.8);
      camera.lookAt(0, -0.4, 0);

      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      // Mouse Parallax Setup
      let mouseX = 0, mouseY = 0;
      const stageElem = document.getElementById('stage-slide-7');
      if (stageElem) {
        stageElem.addEventListener('mousemove', (e) => {
          const rect = stageElem.getBoundingClientRect();
          mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        });
        stageElem.addEventListener('mouseleave', () => {
          mouseX = 0;
          mouseY = 0;
        });
      }

      // Lights
      const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
      dirLight.position.set(6, 14, 10);
      scene.add(dirLight);

      const ambLight = new THREE.AmbientLight(0x0a1628, 1.0);
      scene.add(ambLight);

      const emeraldLight = new THREE.PointLight(0x10b981, 2.8, 16);
      emeraldLight.position.set(-3.2, 1.6, 3.5);
      scene.add(emeraldLight);

      const cyanLight = new THREE.PointLight(0x38bdf8, 2.8, 18);
      cyanLight.position.set(0.0, 2.2, 4.0);
      scene.add(cyanLight);

      const goldLight = new THREE.PointLight(0xf59e0b, 2.8, 16);
      goldLight.position.set(3.2, 1.6, 3.5);
      scene.add(goldLight);

      // Base Curved Stage Platform
      const discGeo = new THREE.CylinderGeometry(6.6, 7.0, 0.22, 64);
      const discMat = new THREE.MeshStandardMaterial({
        color: 0x050d18,
        metalness: 0.92,
        roughness: 0.2,
        transparent: true,
        opacity: 0.92
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.set(0, -3.2, 0);
      disc.rotation.x = 0.12;
      rootGroup.add(disc);

      const discEdge = new THREE.EdgesGeometry(discGeo);
      disc.add(new THREE.LineSegments(discEdge, new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.3 })));

      // ------------------------------------------
      // CONNECTING PIPELINE CONVEYOR TRACK
      // ------------------------------------------
      const trackPoints = [
        new THREE.Vector3(-4.4, -2.5, 0.0),
        new THREE.Vector3(-3.2, -2.4, 0.2),
        new THREE.Vector3(-1.6, -2.2, 0.4),
        new THREE.Vector3(0.0, -2.1, 0.5),
        new THREE.Vector3(1.6, -2.2, 0.4),
        new THREE.Vector3(3.2, -2.4, 0.2),
        new THREE.Vector3(4.4, -2.5, 0.0)
      ];
      const pipelineCurve = new THREE.CatmullRomCurve3(trackPoints);

      const tubeGeo = new THREE.TubeGeometry(pipelineCurve, 64, 0.07, 12, false);
      const tubeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.2 });
      rootGroup.add(new THREE.Mesh(tubeGeo, tubeMat));

      const leftRailPts = trackPoints.map(p => new THREE.Vector3(p.x, p.y + 0.08, p.z + 0.22));
      const rightRailPts = trackPoints.map(p => new THREE.Vector3(p.x, p.y + 0.08, p.z - 0.22));
      const leftRailGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(leftRailPts), 64, 0.02, 8, false);
      const rightRailGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rightRailPts), 64, 0.02, 8, false);
      const neonRailMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });
      rootGroup.add(new THREE.Mesh(leftRailGeo, neonRailMat));
      rootGroup.add(new THREE.Mesh(rightRailGeo, neonRailMat));

      // ------------------------------------------
      // TEXTURE UTILITIES FOR REALISTIC MODELS
      // ------------------------------------------
      function makeJuiceCartonTexture() {
        const c = document.createElement('canvas');
        c.width = 320; c.height = 320;
        const ctx = c.getContext('2d');
        // Carton background
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(0, 0, 320, 320);
        // Header
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(10, 10, 300, 70);
        ctx.fillStyle = '#0369a1';
        ctx.font = 'bold 26px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('عصير فواكه طبيعي', 160, 52);
        // Fruit graphic
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(160, 140, 42, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#10b981';
        ctx.beginPath(); ctx.ellipse(160, 95, 12, 22, Math.PI / 4, 0, Math.PI * 2); ctx.fill();
        // Barcode Box
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(20, 205, 280, 100);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'center';
        const startX = 35;
        for (let i = 0; i < 34; i++) {
          const w = (i % 4 === 0) ? 6 : (i % 2 === 0 ? 3 : 2);
          ctx.fillRect(startX + i * 7, 215, w, 62);
        }
        ctx.fillText('6 221008 459123', 160, 295);
        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      function makePhoneCameraScreenTexture() {
        const c = document.createElement('canvas');
        c.width = 280; c.height = 540;
        const ctx = c.getContext('2d');
        // Camera Viewport
        ctx.fillStyle = '#081320';
        ctx.fillRect(0, 0, 280, 540);
        // Top App Bar
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 280, 56);
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 18px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ حساباتي POS - مسح', 140, 36);
        // Viewfinder Target Brackets
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        const boxX = 35, boxY = 140, boxW = 210, boxH = 210;
        // 4 corners
        ctx.beginPath();
        // Top Left
        ctx.moveTo(boxX, boxY + 30); ctx.lineTo(boxX, boxY); ctx.lineTo(boxX + 30, boxY);
        // Top Right
        ctx.moveTo(boxX + boxW - 30, boxY); ctx.lineTo(boxX + boxW, boxY); ctx.lineTo(boxX + boxW, boxY + 30);
        // Bottom Right
        ctx.moveTo(boxX + boxW, boxY + boxH - 30); ctx.lineTo(boxX + boxW, boxY + boxH); ctx.lineTo(boxX + boxW - 30, boxY + boxH);
        // Bottom Left
        ctx.moveTo(boxX + 30, boxY + boxH); ctx.lineTo(boxX, boxY + boxH); ctx.lineTo(boxX, boxY + boxH - 30);
        ctx.stroke();
        // Laser Scan line in center
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(boxX + 8, boxY + 105); ctx.lineTo(boxX + boxW - 8, boxY + 105); ctx.stroke();
        // Scanned Price Tag Popup
        ctx.fillStyle = 'rgba(16, 185, 129, 0.95)';
        ctx.fillRect(25, 380, 230, 55);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Cairo, sans-serif';
        ctx.fillText('تم الالتقاط: 15.00 ج.م', 140, 415);
        // Status indicator
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 16px Outfit, sans-serif';
        ctx.fillText('Speed: 0.72s (OK)', 140, 475);
        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      function makePaperReceiptTexture() {
        const c = document.createElement('canvas');
        c.width = 300; c.height = 460;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, 300, 460);
        // Receipt Header
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 20px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('فاتورة تجزئة (أوفلاين)', 150, 40);
        ctx.font = '13px Cairo, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('متجر السلام - الإسكندرية', 150, 64);
        ctx.fillText('رقم: #INV-2026-050', 150, 84);
        ctx.fillText('التاريخ: 2026-10-30 | 09:45 PM', 150, 102);
        // Dashed line
        ctx.strokeStyle = '#94a3b8';
        ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.moveTo(15, 116); ctx.lineTo(285, 116); ctx.stroke();
        ctx.setLineDash([]);
        // Items
        ctx.font = '13px Cairo, sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'right';
        ctx.fillText('2x عصير طبيعي', 270, 145); ctx.fillText('30.00 ج.م', 70, 145);
        ctx.fillText('1x كانز مياه غازية', 270, 172); ctx.fillText('15.00 ج.م', 70, 172);
        ctx.fillText('1x علبة شاي فاخر', 270, 199); ctx.fillText('25.00 ج.م', 70, 199);
        // Total
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(15, 218); ctx.lineTo(285, 218); ctx.stroke();
        ctx.font = 'bold 18px Cairo, sans-serif';
        ctx.fillText('الإجمالي:', 270, 248); ctx.fillText('70.00 ج.م', 80, 248);
        // Offline badge
        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 13px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💾 محفوظة محلياً - جاهزة للمزامنة', 150, 280);
        // Barcode at bottom of receipt
        ctx.fillStyle = '#000000';
        const startX = 40;
        for (let i = 0; i < 28; i++) {
          const w = (i % 3 === 0) ? 5 : 2;
          ctx.fillRect(startX + i * 8, 305, w, 55);
        }
        ctx.font = '12px monospace';
        ctx.fillText('* 50/50 OFFLINE SYNC *', 150, 385);
        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      function makeTaxInvoiceDocTexture() {
        const c = document.createElement('canvas');
        c.width = 340; c.height = 480;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 340, 480);
        // Watermark Coat of Arms
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, 320, 460);
        // Official Header
        ctx.fillStyle = '#065f46';
        ctx.font = 'bold 18px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('جمهورية مصر العربية', 170, 38);
        ctx.font = 'bold 16px Cairo, sans-serif';
        ctx.fillText('مصلحة الضرائب المصرية', 170, 62);
        ctx.font = '13px Cairo, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText('منظومة الإيصال والفاتورة الإلكترونية B2C', 170, 84);
        // Divider
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(25, 96); ctx.lineTo(315, 96); ctx.stroke();
        // Legal data
        ctx.font = '12px Cairo, sans-serif';
        ctx.fillStyle = '#334155';
        ctx.textAlign = 'right';
        ctx.fillText('رقم التسجيل الضريبي: 589-102-471', 305, 122);
        ctx.fillText('القانون المطبق: قانون 152 للمشروعات', 305, 142);
        ctx.fillText('كود التحقق الإلكتروني: ETA-2026-X992', 305, 162);
        ctx.fillText('ضريبة القيمة المضافة (14%): 49.00 ج.م', 305, 182);
        ctx.fillText('صافي القيمة الإجمالية: 399.00 ج.م', 305, 202);
        // Big QR Code Box
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(105, 222, 130, 130);
        ctx.fillStyle = '#ffffff';
        for (let r = 0; r < 10; r++) {
          for (let col = 0; col < 10; col++) {
            if ((r + col) % 2 === 0 || (r < 3 && col < 3) || (r > 6 && col < 3) || (r < 3 && col > 6)) {
              ctx.fillRect(112 + col * 11.5, 229 + r * 11.5, 9, 9);
            }
          }
        }
        // Stamp Circle Graphic
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(170, 412, 44, 0, Math.PI * 2); ctx.stroke();
        ctx.font = 'bold 12px Cairo, sans-serif';
        ctx.fillStyle = '#059669';
        ctx.fillText('✓ معتمد ضريبياً', 170, 408);
        ctx.fillText('قانون 152', 170, 424);
        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      function makeFloatingTagTexture(icon, text, subtext, color) {
        const c = document.createElement('canvas');
        c.width = 320; c.height = 110;
        const ctx = c.getContext('2d');
        ctx.fillStyle = 'rgba(7, 17, 31, 0.94)';
        ctx.fillRect(4, 4, 312, 102);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3.5;
        ctx.strokeRect(4, 4, 312, 102);
        // Icon
        ctx.font = '36px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(icon, 300, 56);
        // Main Text
        ctx.font = 'bold 20px Cairo, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, 250, 46);
        // Subtext
        ctx.font = 'bold 14px Cairo, sans-serif';
        ctx.fillStyle = color;
        ctx.fillText(subtext, 250, 80);
        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      // ------------------------------------------
      // THREE SPECIFIC OPERATIONAL STATIONS
      // ------------------------------------------
      const valStations = [];

      function createStationPodium(idx, x, baseY, z, radius, color, rimColor, tagIcon, tagTitle, tagSub, buildContentFn) {
        const sGroup = new THREE.Group();
        sGroup.position.set(x, baseY, z);
        rootGroup.add(sGroup);

        // Hex Base Podium
        const podGeo = new THREE.CylinderGeometry(radius, radius * 1.08, 0.35, 6);
        const podMat = new THREE.MeshStandardMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 0.25,
          metalness: 0.9,
          roughness: 0.2
        });
        const podMesh = new THREE.Mesh(podGeo, podMat);
        sGroup.add(podMesh);

        // Glowing Rim
        const rimGeo = new THREE.TorusGeometry(radius * 1.03, 0.035, 16, 6);
        const rimMat = new THREE.MeshBasicMaterial({ color: rimColor });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.position.y = 0.18;
        rim.rotation.x = Math.PI / 2;
        sGroup.add(rim);

        // Clean Floating 3D Label Tag (Hovering above the station)
        const tagGeo = new THREE.PlaneGeometry(2.1, 0.72);
        const tagMat = new THREE.MeshBasicMaterial({
          map: makeFloatingTagTexture(tagIcon, tagTitle, tagSub, rimColor),
          side: THREE.DoubleSide
        });
        const tagMesh = new THREE.Mesh(tagGeo, tagMat);
        tagMesh.position.set(0, 2.15, 0);
        sGroup.add(tagMesh);

        // Content Container in the foreground
        const contentGroup = new THREE.Group();
        contentGroup.position.set(0, 0.18, 0);
        sGroup.add(contentGroup);

        if (buildContentFn) {
          buildContentFn(contentGroup);
        }

        valStations.push({
          group: sGroup,
          baseY: baseY,
          targetY: baseY,
          rim: rim,
          tagMesh: tagMesh,
          contentGroup: contentGroup,
          idx: idx
        });
      }

      // -------------------------------------------------------------
      // STATION 0: RETAIL CASHIER & SMARTPHONE BARCODE SCANNER (< 1s)
      // -------------------------------------------------------------
      let scanLaserPlane = null;
      let scanPulseRing = null;
      let phoneMesh = null;

      createStationPodium(
        0,
        -3.2, -2.4, 0.2,
        1.55,
        0x064e3b,
        0x10b981,
        '⚡', 'مسح الباركود بالكاميرا', '< 1.0s وبدون أجهزة إضافية',
        (grp) => {
          // 1. Retail Checkout Desk Counter
          const counter = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.42, 0.9),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
          );
          counter.position.set(0, 0.21, 0);
          grp.add(counter);

          // Counter Rubber Conveyor Top
          const conveyorTop = new THREE.Mesh(
            new THREE.BoxGeometry(1.52, 0.04, 0.92),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 })
          );
          conveyorTop.position.set(0, 0.43, 0);
          grp.add(conveyorTop);

          // Neon Accent Edge Line
          const edgeLine = new THREE.Mesh(
            new THREE.BoxGeometry(1.52, 0.02, 0.03),
            new THREE.MeshBasicMaterial({ color: 0x10b981 })
          );
          edgeLine.position.set(0, 0.44, 0.46);
          grp.add(edgeLine);

          // 2. Retail Grocery Item: Egyptian Juice/Milk Carton with Barcode
          const cartonMat = new THREE.MeshStandardMaterial({
            map: makeJuiceCartonTexture(),
            roughness: 0.3
          });
          const carton = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.32), cartonMat);
          carton.position.set(-0.24, 0.71, 0.12);
          grp.add(carton);

          // 3. Retail Grocery Item 2: Aluminum Soda Can
          const canMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.92, roughness: 0.1 });
          const can = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.36, 24), canMat);
          can.position.set(0.36, 0.63, 0.18);
          grp.add(can);

          // Silver Pull-Tab on Soda Can
          const canTab = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.01, 0.12),
            new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95 })
          );
          canTab.position.set(0.36, 0.815, 0.18);
          grp.add(canTab);

          // 4. Smartphone Holding Gooseneck Stand
          const standBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.14, 0.05, 16),
            new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 })
          );
          standBase.position.set(-0.24, 0.47, -0.25);
          grp.add(standBase);

          const standArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.025, 0.72, 12),
            new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 })
          );
          standArm.position.set(-0.24, 0.81, -0.15);
          standArm.rotation.x = 0.32;
          grp.add(standArm);

          // 5. Realistic Smartphone Body
          const phoneGrp = new THREE.Group();
          phoneGrp.position.set(-0.24, 1.15, 0.08);
          phoneGrp.rotation.x = 0.62;
          grp.add(phoneGrp);
          phoneMesh = phoneGrp;

          // Phone Metal Frame
          const phoneBody = new THREE.Mesh(
            new THREE.BoxGeometry(0.48, 0.84, 0.035),
            new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.92, roughness: 0.15 })
          );
          phoneGrp.add(phoneBody);

          // Camera Lens on back
          const lensRim = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16),
            new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 })
          );
          lensRim.position.set(-0.12, 0.3, -0.025);
          lensRim.rotation.x = Math.PI / 2;
          phoneGrp.add(lensRim);

          // Phone Screen Displaying Scanner Viewfinder
          const phoneScreen = new THREE.Mesh(
            new THREE.PlaneGeometry(0.44, 0.78),
            new THREE.MeshBasicMaterial({ map: makePhoneCameraScreenTexture() })
          );
          phoneScreen.position.set(0, 0, 0.02);
          phoneGrp.add(phoneScreen);

          // 6. Active Animated Emerald Laser Fan (Projecting from Phone to Barcode)
          const laserGeo = new THREE.PlaneGeometry(0.52, 0.65);
          const laserMat = new THREE.MeshBasicMaterial({
            color: 0x10b981,
            transparent: true,
            opacity: 0.55,
            side: THREE.DoubleSide
          });
          scanLaserPlane = new THREE.Mesh(laserGeo, laserMat);
          scanLaserPlane.position.set(0, -0.42, 0.18);
          scanLaserPlane.rotation.x = -Math.PI / 4;
          phoneGrp.add(scanLaserPlane);

          // Glowing ripple scan ring on the carton barcode
          scanPulseRing = new THREE.Mesh(
            new THREE.RingGeometry(0.08, 0.22, 24),
            new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
          );
          scanPulseRing.position.set(-0.24, 0.98, 0.12);
          scanPulseRing.rotation.x = -Math.PI / 2;
          grp.add(scanPulseRing);
        }
      );

      // -------------------------------------------------------------
      // STATION 1: DISCONNECTED ROUTER + OFFLINE THERMAL PRINTER + CLOUD
      // -------------------------------------------------------------
      let routerWifiLed = null;
      let cloudMeshGroup = null;
      const receiptStackCubes = [];
      const cloudSyncStream = [];

      createStationPodium(
        1,
        0.0, -2.4, 0.4,
        1.55,
        0x0c4a6e,
        0x38bdf8,
        '💾', 'صمود الأوفلاين والمزامنة', '50/50 فاتورة بدون انقطاع',
        (grp) => {
          // Counter Table
          const counter = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.42, 0.9),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
          );
          counter.position.set(0, 0.21, 0);
          grp.add(counter);

          // 1. Wi-Fi Router (Unmistakable Home/Shop Internet Router)
          const routerBody = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 0.09, 0.38),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.6 })
          );
          routerBody.position.set(-0.38, 0.46, 0.12);
          grp.add(routerBody);

          // 3 Black Antennas on Router
          [-0.18, 0, 0.18].forEach((aX, i) => {
            const ant = new THREE.Mesh(
              new THREE.CylinderGeometry(0.015, 0.015, 0.42, 8),
              new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.2 })
            );
            ant.position.set(-0.38 + aX, 0.65, -0.06);
            ant.rotation.x = -0.35 + (i === 1 ? -0.1 : 0.1);
            ant.rotation.z = (i === 0 ? -0.2 : (i === 2 ? 0.2 : 0));
            grp.add(ant);
          });

          // Front LEDs on Router (Power = Green, Internet = Blinking Red Offline)
          const pwrLed = new THREE.Mesh(
            new THREE.SphereGeometry(0.018, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0x10b981 })
          );
          pwrLed.position.set(-0.52, 0.46, 0.315);
          grp.add(pwrLed);

          routerWifiLed = new THREE.Mesh(
            new THREE.SphereGeometry(0.024, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xef4444 })
          );
          routerWifiLed.position.set(-0.46, 0.46, 0.315);
          grp.add(routerWifiLed);

          // Unplugged Ethernet Cable lying loose beside router
          const cable = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.025, 0.38, 8),
            new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
          );
          cable.position.set(-0.55, 0.44, 0.32);
          cable.rotation.z = Math.PI / 3;
          grp.add(cable);

          // 2. POS Thermal Receipt Printer
          const printer = new THREE.Mesh(
            new THREE.BoxGeometry(0.48, 0.36, 0.46),
            new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.8, roughness: 0.2 })
          );
          printer.position.set(0.32, 0.6, 0.12);
          grp.add(printer);

          // Paper Exit Slot
          const slot = new THREE.Mesh(
            new THREE.BoxGeometry(0.36, 0.03, 0.04),
            new THREE.MeshBasicMaterial({ color: 0x64748b })
          );
          slot.position.set(0.32, 0.785, 0.12);
          grp.add(slot);

          // Paper Receipt rolling out of printer
          const paperReceipt = new THREE.Mesh(
            new THREE.PlaneGeometry(0.34, 0.48),
            new THREE.MeshStandardMaterial({
              map: makePaperReceiptTexture(),
              roughness: 0.2,
              side: THREE.DoubleSide
            })
          );
          paperReceipt.position.set(0.32, 0.95, 0.16);
          paperReceipt.rotation.x = -0.35;
          grp.add(paperReceipt);

          // Stack of Invoices inside Transparent Tray (IndexedDB Buffer)
          for (let s = 0; s < 5; s++) {
            const stackMesh = new THREE.Mesh(
              new THREE.BoxGeometry(0.36, 0.028, 0.32),
              new THREE.MeshStandardMaterial({
                color: 0x38bdf8,
                emissive: 0x0284c7,
                emissiveIntensity: 0.7,
                roughness: 0.1
              })
            );
            stackMesh.position.set(0.32, 0.44 + s * 0.032, -0.22);
            grp.add(stackMesh);
            receiptStackCubes.push(stackMesh);
          }

          // 3. Fluffy 3D Cloud Server Model
          cloudMeshGroup = new THREE.Group();
          cloudMeshGroup.position.set(0.0, 1.68, 0);
          grp.add(cloudMeshGroup);

          const cloudMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x0284c7,
            emissiveIntensity: 0.45,
            metalness: 0.1,
            roughness: 0.3
          });

          // 5 Merged Spheres forming an actual fluffy cloud
          const cloudParts = [
            { x: 0, y: 0, z: 0, r: 0.28 },
            { x: -0.24, y: -0.05, z: 0.04, r: 0.21 },
            { x: 0.24, y: -0.05, z: 0.04, r: 0.21 },
            { x: -0.12, y: 0.15, z: 0, r: 0.18 },
            { x: 0.12, y: 0.15, z: 0, r: 0.18 }
          ];
          cloudParts.forEach(cp => {
            const sp = new THREE.Mesh(new THREE.SphereGeometry(cp.r, 16, 16), cloudMat);
            sp.position.set(cp.x, cp.y, cp.z);
            cloudMeshGroup.add(sp);
          });

          // Ascending Data Stream Particles (from local buffer up to cloud)
          const syncCount = 10;
          const pGeo = new THREE.SphereGeometry(0.042, 8, 8);
          const pMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
          for (let p = 0; p < syncCount; p++) {
            const pMesh = new THREE.Mesh(pGeo, pMat);
            grp.add(pMesh);
            cloudSyncStream.push({ mesh: pMesh, offset: p / syncCount });
          }
        }
      );

      // -------------------------------------------------------------
      // STATION 2: EGYPTIAN TAX INVOICE & 3D BRASS OFFICIAL STAMP PRESS
      // -------------------------------------------------------------
      let stampPlungerGroup = null;
      let stampFlashRing = null;
      const cpaSealMedals = [];

      createStationPodium(
        2,
        3.2, -2.4, 0.2,
        1.55,
        0x451a03,
        0xf59e0b,
        '⚖️', 'الاعتماد الضريبي الرسمي', 'قانون 152 و5 محاسبين معتمدين',
        (grp) => {
          // Polished Mahogany Executive Legal Desk
          const desk = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.42, 0.9),
            new THREE.MeshStandardMaterial({ color: 0x27170e, roughness: 0.25, metalness: 0.2 })
          );
          desk.position.set(0, 0.21, 0);
          grp.add(desk);

          // Desk Inlay Rim
          const deskRim = new THREE.Mesh(
            new THREE.BoxGeometry(1.52, 0.03, 0.92),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 })
          );
          deskRim.position.set(0, 0.43, 0);
          grp.add(deskRim);

          // 1. Official Egyptian Tax Invoice Document
          const taxDoc = new THREE.Mesh(
            new THREE.PlaneGeometry(0.88, 1.22),
            new THREE.MeshStandardMaterial({
              map: makeTaxInvoiceDocTexture(),
              roughness: 0.2,
              side: THREE.DoubleSide
            })
          );
          taxDoc.position.set(-0.15, 0.45, 0.08);
          taxDoc.rotation.x = -Math.PI / 2;
          taxDoc.rotation.z = 0.08;
          grp.add(taxDoc);

          // 2. Realistic 3D Brass & Wood Stamp Press (مكبس الختم الرسمي)
          stampPlungerGroup = new THREE.Group();
          stampPlungerGroup.position.set(-0.12, 0.95, 0.25);
          grp.add(stampPlungerGroup);

          // Wooden Knob Handle on Top
          const woodKnob = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.3 })
          );
          woodKnob.position.set(0, 0.38, 0);
          stampPlungerGroup.add(woodKnob);

          // Heavy Solid Brass Plunger Shaft
          const brassShaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.35, 16),
            new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.95, roughness: 0.08 })
          );
          brassShaft.position.set(0, 0.2, 0);
          stampPlungerGroup.add(brassShaft);

          // Heavy Brass Stamp Base
          const stampBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.16, 0.18, 0.08, 24),
            new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95, roughness: 0.1 })
          );
          stampBase.position.set(0, 0.04, 0);
          stampPlungerGroup.add(stampBase);

          // Stamp Contact Flash Ring on the Document
          stampFlashRing = new THREE.Mesh(
            new THREE.RingGeometry(0.12, 0.28, 24),
            new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
          );
          stampFlashRing.position.set(-0.12, 0.46, 0.25);
          stampFlashRing.rotation.x = -Math.PI / 2;
          grp.add(stampFlashRing);

          // 3. Five Distinct 3D CPA Golden Medallions (أختام 5 محاسبين معتمدين)
          for (let m = 0; m < 5; m++) {
            const medalGrp = new THREE.Group();
            grp.add(medalGrp);

            // Gold Disc
            const discMesh = new THREE.Mesh(
              new THREE.CylinderGeometry(0.13, 0.13, 0.025, 24),
              new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.1 })
            );
            discMesh.rotation.x = Math.PI / 4;
            medalGrp.add(discMesh);

            // Green Ribbon underneath
            const ribbon = new THREE.Mesh(
              new THREE.BoxGeometry(0.06, 0.16, 0.01),
              new THREE.MeshBasicMaterial({ color: 0x10b981 })
            );
            ribbon.position.set(0, -0.12, -0.01);
            medalGrp.add(ribbon);

            cpaSealMedals.push({
              group: medalGrp,
              baseAngle: (m * Math.PI * 2) / 5,
              radius: 0.78
            });
          }
        }
      );

      // --- HERO TRAVELING INVOICE PACKET (Follows the Pipeline) ---
      const heroInvoice = new THREE.Mesh(
        new THREE.PlaneGeometry(0.48, 0.7),
        new THREE.MeshBasicMaterial({
          map: makePaperReceiptTexture(),
          transparent: true,
          opacity: 0.95,
          side: THREE.DoubleSide
        })
      );
      heroInvoice.position.set(-3.2, -1.8, 0.4);
      rootGroup.add(heroInvoice);

      // Ambient Space Particles
      const partGeo = new THREE.BufferGeometry();
      const partCount = 75;
      const posArray = new Float32Array(partCount * 3);
      for (let i = 0; i < partCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 18;
      }
      partGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const partMat = new THREE.PointsMaterial({ size: 0.075, color: 0x38bdf8, transparent: true, opacity: 0.65 });
      const particles = new THREE.Points(partGeo, partMat);
      rootGroup.add(particles);

      // ------------------------------------------
      // CAMERA GLIDE TARGETS (Focused on the 3D Models)
      // ------------------------------------------
      const valCamTargets = [
        // 0: Barcode Scan - close-up on phone and juice carton
        {
          camPos: new THREE.Vector3(-3.2, -0.9, 6.8),
          lookAt: new THREE.Vector3(-3.2, -1.35, 0.2)
        },
        // 1: Offline Mode - close-up on router, printer and cloud
        {
          camPos: new THREE.Vector3(0.0, -0.7, 7.0),
          lookAt: new THREE.Vector3(0.0, -1.25, 0.3)
        },
        // 2: Tax Law 152 - close-up on document and stamp press
        {
          camPos: new THREE.Vector3(3.2, -0.9, 6.8),
          lookAt: new THREE.Vector3(3.2, -1.35, 0.2)
        }
      ];

      let currentCamPos = new THREE.Vector3(-3.2, -0.9, 6.8);
      let currentLookAt = new THREE.Vector3(-3.2, -1.35, 0.2);
      let targetCamPos = valCamTargets[0].camPos.clone();
      let targetLookAt = valCamTargets[0].lookAt.clone();

      valSelector = {
        select(idx) {
          if (valCamTargets[idx]) {
            targetCamPos.copy(valCamTargets[idx].camPos);
            targetLookAt.copy(valCamTargets[idx].lookAt);
          }

          // Sync buttons & cards
          [0, 1, 2].forEach(i => {
            const btn = document.getElementById('btn-val-' + i);
            if (btn) {
              if (i === idx) btn.classList.add('active');
              else btn.classList.remove('active');
            }
            const card = document.getElementById('card-val-' + i);
            if (card) {
              if (i === idx) card.classList.add('active');
              else card.classList.remove('active');
            }
          });

          // Elevate selected station podium
          valStations.forEach(st => {
            if (st.idx === idx) {
              st.targetY = st.baseY + 0.42;
              st.rim.scale.set(1.15, 1.15, 1.15);
            } else {
              st.targetY = st.baseY;
              st.rim.scale.set(1.0, 1.0, 1.0);
            }
          });
        }
      };

      // Set initial station (Speed Benchmark = 0)
      valSelector.select(0);

      // Direct Canvas Click to select station
      if (stageElem) {
        const raycaster = new THREE.Raycaster();
        const clickVec = new THREE.Vector2();
        stageElem.addEventListener('click', (e) => {
          const rect = stageElem.getBoundingClientRect();
          clickVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          clickVec.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
          raycaster.setFromCamera(clickVec, camera);

          valStations.forEach(st => {
            const intersects = raycaster.intersectObjects(st.group.children, true);
            if (intersects.length > 0) {
              valSelector.select(st.idx);
            }
          });
        });
      }

      return {
        update(time) {
          // Smooth Camera Lerp
          currentCamPos.lerp(targetCamPos, 0.055);
          currentLookAt.lerp(targetLookAt, 0.055);

          const pX = mouseX * 0.22;
          const pY = -mouseY * 0.14;
          camera.position.set(currentCamPos.x + pX, currentCamPos.y + pY, currentCamPos.z);
          camera.lookAt(currentLookAt.x, currentLookAt.y, currentLookAt.z);

          // Elevate stations smoothly
          valStations.forEach(st => {
            st.group.position.y += (st.targetY - st.group.position.y) * 0.08;
          });

          // Station 0 Animations: Barcode Laser Scanning Sweep & Pulse
          if (scanLaserPlane) {
            scanLaserPlane.rotation.z = Math.sin(time * 3.8) * 0.25;
          }
          if (scanPulseRing) {
            const pScale = 1.0 + Math.abs(Math.sin(time * 3.8)) * 0.45;
            scanPulseRing.scale.set(pScale, pScale, pScale);
            scanPulseRing.material.opacity = 0.4 + Math.abs(Math.sin(time * 3.8)) * 0.6;
          }
          if (phoneMesh) {
            phoneMesh.rotation.z = Math.sin(time * 1.5) * 0.03;
          }

          // Station 1 Animations: Router LED blink + Cloud stream
          if (routerWifiLed) {
            routerWifiLed.material.color.setHex((Math.floor(time * 4) % 2 === 0) ? 0xef4444 : 0x7f1d1d);
          }
          if (cloudMeshGroup) {
            cloudMeshGroup.position.y = 1.68 + Math.sin(time * 2.0) * 0.04;
            cloudMeshGroup.rotation.y = time * 0.35;
          }
          cloudSyncStream.forEach(sp => {
            const frac = (time * 0.65 + sp.offset) % 1.0;
            sp.mesh.position.set(0.32 - frac * 0.32, 0.72 + frac * 0.95, -0.15 + frac * 0.15);
          });
          receiptStackCubes.forEach((cube, i) => {
            cube.material.emissiveIntensity = 0.5 + Math.sin(time * 2.5 + i) * 0.3;
          });

          // Station 2 Animations: 3D Stamp Mechanical Action
          if (stampPlungerGroup) {
            // Stamp cycle: lifts up, pauses, plunges down onto invoice
            const cycle = (time * 1.8) % (Math.PI * 2);
            const plunge = Math.max(0, Math.sin(cycle));
            stampPlungerGroup.position.y = 0.85 - plunge * 0.32;

            if (stampFlashRing) {
              const isHitting = plunge > 0.88;
              stampFlashRing.scale.setScalar(isHitting ? 1.3 : 1.0);
              stampFlashRing.material.opacity = isHitting ? 1.0 : 0.2;
            }
          }
          // 5 CPA Medals floating in orbit
          cpaSealMedals.forEach(seal => {
            const angle = seal.baseAngle + time * 0.55;
            seal.group.position.set(
              Math.cos(angle) * seal.radius,
              0.82 + Math.sin(time * 2.0 + seal.baseAngle) * 0.05,
              Math.sin(angle) * seal.radius * 0.4
            );
            seal.group.rotation.y = time * 0.8;
          });

          // Hero Traveling Invoice Journey along pipeline
          const journeyT = (time * 0.12) % 1.0;
          const invoicePos = pipelineCurve.getPointAt(journeyT);
          heroInvoice.position.set(invoicePos.x, invoicePos.y + 0.42, invoicePos.z + 0.12);
          heroInvoice.rotation.y = Math.sin(time * 2.0) * 0.15;

          // Space dust gentle drift
          particles.rotation.y = time * 0.02;
        }
      };
    }

    window.selectValTest = function(idx) {
      if (valSelector) valSelector.select(idx);
    };

    // --- SLIDE 8: Cinematic 3D Comparative Benchmark Arena ---
    let compSelector = null;

    function buildSlide8Scene(scene, camera) {
      camera.position.set(0.0, 9.4, 6.8);
      camera.lookAt(0.0, 0.2, 0.0);

      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      // Mouse Parallax Setup
      let mouseX = 0, mouseY = 0;
      const stageElem = document.getElementById('stage-slide-8');
      if (stageElem) {
        stageElem.addEventListener('mousemove', (e) => {
          const rect = stageElem.getBoundingClientRect();
          mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        });
        stageElem.addEventListener('mouseleave', () => {
          mouseX = 0;
          mouseY = 0;
        });
      }

      // Lights - Cinematic Moody Lighting
      const ambientLight = new THREE.AmbientLight(0x0a1122, 1.2);
      scene.add(ambientLight);

      const mainSpot = new THREE.SpotLight(0x38bdf8, 3.2, 28, Math.PI / 3.5, 0.4, 1.2);
      mainSpot.position.set(0, 10, 6);
      scene.add(mainSpot);

      const rimLight = new THREE.DirectionalLight(0x00f0ff, 1.5);
      rimLight.position.set(-8, 6, -5);
      scene.add(rimLight);

      const warmAccentLight = new THREE.PointLight(0xf59e0b, 1.4, 18);
      warmAccentLight.position.set(5, 2, 4);
      scene.add(warmAccentLight);

      const redAccentLight = new THREE.PointLight(0xef4444, 1.2, 18);
      redAccentLight.position.set(-5, 2, 4);
      scene.add(redAccentLight);

      // -------------------------------------------------------------
      // 1. PHYSICAL 3D ARENA PLATFORM (Obsidian & Titanium Base)
      // -------------------------------------------------------------
      const arenaGroup = new THREE.Group();
      arenaGroup.position.set(0.0, -0.3, 0.0);
      arenaGroup.scale.set(0.88, 0.88, 0.88);
      rootGroup.add(arenaGroup);

      // Tier 1 Base: Beveled Dark Carbon Plinth
      const baseGeo = new THREE.CylinderGeometry(4.6, 4.85, 0.35, 64);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x070d18,
        metalness: 0.9,
        roughness: 0.22
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = -0.175;
      arenaGroup.add(baseMesh);

      // Tier 2: Inset Dark Reflective Glass Platform
      const floorGeo = new THREE.CylinderGeometry(4.35, 4.35, 0.08, 64);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0x091428,
        metalness: 0.95,
        roughness: 0.12
      });
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.position.y = 0.04;
      arenaGroup.add(floorMesh);

      // Outer Recessed Glowing Neon Tube Rim
      const rimGeo = new THREE.TorusGeometry(4.42, 0.038, 16, 64);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 2.5
      });
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.y = 0.07;
      arenaGroup.add(rimMesh);

      // Concentric Laser Floor Rings (Grid lines)
      [1.1, 2.1, 3.1].forEach((rad, rIdx) => {
        const ringGeo = new THREE.RingGeometry(rad - 0.012, rad + 0.012, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: rIdx === 2 ? 0x38bdf8 : 0x1e3a8a,
          transparent: true,
          opacity: rIdx === 2 ? 0.75 : 0.35,
          side: THREE.DoubleSide
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = 0.082;
        arenaGroup.add(ringMesh);
      });

      // -------------------------------------------------------------
      // 2. CENTER HOLOGRAPHIC GYROSCOPE CORE
      // -------------------------------------------------------------
      const coreGroup = new THREE.Group();
      coreGroup.position.set(0, 0.35, 0);
      arenaGroup.add(coreGroup);

      // Central Floating Power Crystal
      const crystalGeo = new THREE.OctahedronGeometry(0.3, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.2,
        roughness: 0.15,
        metalness: 0.8
      });
      const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
      coreGroup.add(crystalMesh);

      // Nested Gyroscope Rings
      const ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.018, 16, 48),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1, emissive: 0xf59e0b, emissiveIntensity: 0.4 })
      );
      coreGroup.add(ring1);

      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(0.72, 0.018, 16, 48),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.1, emissive: 0x38bdf8, emissiveIntensity: 0.5 })
      );
      ring2.rotation.x = Math.PI / 3;
      coreGroup.add(ring2);

      // -------------------------------------------------------------
      // 3. THE 6 BENCHMARK STATIONS (Pedestals, Badges & 3D Pillars)
      // -------------------------------------------------------------
      const stationRadius = 3.15;
      const axesCount = 6;
      const stationAngles = [];
      for (let i = 0; i < axesCount; i++) {
        stationAngles.push(i * (Math.PI / 3) - Math.PI / 2);
      }

      // Station Definitions
      const stationDefs = [
        { icon: '📱', title: '0 ج.م عتاد', en: 'Zero Hardware' },
        { icon: '⚡', title: 'مسح < 1s', en: 'Fast Camera' },
        { icon: '💾', title: 'صمود أوفلاين', en: 'IndexedDB' },
        { icon: '📖', title: 'نوتة شكك FIFO', en: 'Debt Ledger' },
        { icon: '💬', title: 'واتساب وتليجرام', en: 'Instant Share' },
        { icon: '💰', title: 'تسعير عادل EGP', en: 'Local EGP' }
      ];

      // Station Badge Texture Generator
      function makeStationBadgeTexture(icon, title, en) {
        const c = document.createElement('canvas');
        c.width = 260;
        c.height = 80;
        const ctx = c.getContext('2d');

        // Dark Rounded Glass Card
        ctx.fillStyle = 'rgba(7, 15, 30, 0.95)';
        ctx.beginPath();
        ctx.roundRect(4, 4, 252, 72, 12);
        ctx.fill();

        // Glowing border
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Arabic Title
        ctx.font = 'bold 21px Cairo, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.direction = 'rtl';
        ctx.fillText(icon + ' ' + title, 245, 36);

        // English Subtitle
        ctx.font = '13px Cairo, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(en, 245, 60);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      // Benchmark Scores per Competitor:
      // Hesabaty: 100% across all 6 axes
      const scoresHesabaty = [2.2, 2.2, 2.2, 2.2, 2.2, 2.2];
      // Legacy Desktop (MegaStore): Only high on offline, fails mobile & messaging & zero-capex
      const scoresLegacy = [0.3, 0.25, 1.85, 0.55, 0.2, 0.6];
      // Cloud ERP (Odoo / Daftra): Moderate, but expensive USD and no fast mobile camera
      const scoresCloudERP = [0.85, 0.4, 0.7, 0.6, 1.1, 0.75];

      const stations = [];

      stationAngles.forEach((angle, idx) => {
        const stGroup = new THREE.Group();
        const sx = Math.cos(angle) * stationRadius;
        const sz = Math.sin(angle) * stationRadius;
        stGroup.position.set(sx, 0.05, sz);
        arenaGroup.add(stGroup);

        // Radial Guide Track connecting center to station
        const trackPts = [new THREE.Vector3(0, 0.083, 0), new THREE.Vector3(sx, 0.083, sz)];
        const trackGeo = new THREE.BufferGeometry().setFromPoints(trackPts);
        const trackMat = new THREE.LineBasicMaterial({ color: 0x1e3a8a, transparent: true, opacity: 0.6 });
        arenaGroup.add(new THREE.Line(trackGeo, trackMat));

        // Pedestal Base: Dark machined titanium disc
        const plinthGeo = new THREE.CylinderGeometry(0.52, 0.58, 0.16, 32);
        const plinthMat = new THREE.MeshStandardMaterial({ color: 0x0b162c, metalness: 0.9, roughness: 0.25 });
        const plinth = new THREE.Mesh(plinthGeo, plinthMat);
        plinth.position.y = 0.08;
        stGroup.add(plinth);

        // Plinth Neon Ring
        const pRingGeo = new THREE.TorusGeometry(0.53, 0.016, 16, 32);
        const pRingMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 1.5 });
        const pRing = new THREE.Mesh(pRingGeo, pRingMat);
        pRing.rotation.x = Math.PI / 2;
        pRing.position.y = 0.16;
        stGroup.add(pRing);

        // 3D PHYSICAL VOLUMETRIC PILLARS AT EACH STATION:
        // 1. Hesabaty Column (Center of pedestal)
        const hHeight = scoresHesabaty[idx];
        const hGeo = new THREE.CylinderGeometry(0.16, 0.18, hHeight, 16);
        const hMat = new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          emissive: 0x38bdf8,
          emissiveIntensity: 0.7,
          metalness: 0.45,
          roughness: 0.12,
          transparent: true,
          opacity: 0.92
        });
        const hMesh = new THREE.Mesh(hGeo, hMat);
        hMesh.position.set(0, 0.16 + hHeight / 2, 0);
        stGroup.add(hMesh);

        // Glowing internal fiber/core inside Hesabaty column
        const coreFiberGeo = new THREE.CylinderGeometry(0.04, 0.04, hHeight * 0.95, 8);
        const coreFiberMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const coreFiber = new THREE.Mesh(coreFiberGeo, coreFiberMat);
        hMesh.add(coreFiber);

        // Golden Pyramid Crown on top of Hesabaty column
        const crownGeo = new THREE.ConeGeometry(0.22, 0.28, 4);
        const crownMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xb45309,
          emissiveIntensity: 0.5,
          metalness: 0.95,
          roughness: 0.1
        });
        const crown = new THREE.Mesh(crownGeo, crownMat);
        crown.position.set(0, 0.16 + hHeight + 0.14, 0);
        crown.rotation.y = Math.PI / 4;
        stGroup.add(crown);

        // 2. Legacy Desktop Column (Offset left)
        const lHeight = scoresLegacy[idx];
        const lGeo = new THREE.CylinderGeometry(0.11, 0.13, lHeight, 12);
        const lMat = new THREE.MeshStandardMaterial({
          color: 0x450a0a,
          emissive: 0xef4444,
          emissiveIntensity: 0.35,
          metalness: 0.7,
          roughness: 0.75
        });
        const lMesh = new THREE.Mesh(lGeo, lMat);
        lMesh.position.set(-0.25, 0.16 + lHeight / 2, 0.1);
        stGroup.add(lMesh);

        // Red indicator cap
        const lCap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 0.04, 12),
          new THREE.MeshBasicMaterial({ color: 0xef4444 })
        );
        lCap.position.set(-0.25, 0.16 + lHeight + 0.02, 0.1);
        stGroup.add(lCap);

        // 3. Cloud ERP Column (Offset right)
        const cHeight = scoresCloudERP[idx];
        const cGeo = new THREE.CylinderGeometry(0.11, 0.13, cHeight, 12);
        const cMat = new THREE.MeshStandardMaterial({
          color: 0x78350f,
          emissive: 0xf59e0b,
          emissiveIntensity: 0.45,
          metalness: 0.5,
          roughness: 0.3
        });
        const cMesh = new THREE.Mesh(cGeo, cMat);
        cMesh.position.set(0.25, 0.16 + cHeight / 2, -0.1);
        stGroup.add(cMesh);

        // Amber indicator cap
        const cCap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 0.04, 12),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b })
        );
        cCap.position.set(0.25, 0.16 + cHeight + 0.02, -0.1);
        stGroup.add(cCap);

        // Floating Station Badge (Positioned radially outward on the arena rim)
        const badgeGeo = new THREE.PlaneGeometry(1.3, 0.4);
        const badgeMat = new THREE.MeshBasicMaterial({
          map: makeStationBadgeTexture(stationDefs[idx].icon, stationDefs[idx].title, stationDefs[idx].en),
          side: THREE.DoubleSide,
          transparent: true
        });
        const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
        badgeMesh.position.set(Math.cos(angle) * 0.95, 0.35, Math.sin(angle) * 0.95);
        stGroup.add(badgeMesh);

        stations.push({
          group: stGroup,
          angle: angle,
          hMesh: hMesh,
          hHeight: hHeight,
          crown: crown,
          lMesh: lMesh,
          lHeight: lHeight,
          cMesh: cMesh,
          cHeight: cHeight,
          badge: badgeMesh
        });
      });

      // -------------------------------------------------------------
      // 4. SMOOTH MORPHING 3D HOLOGRAPHIC RADAR CANOPY (Silk Energy Hull)
      // -------------------------------------------------------------
      // 6 Outer Vertices + 1 Center Apex Vertex = 7 Vertices
      // 6 Triangular Faces connecting Center Apex to adjacent outer vertices
      const canopyGeo = new THREE.BufferGeometry();
      const vertexCount = 7;
      const positions = new Float32Array(vertexCount * 3);
      const targetHeights = new Float32Array(vertexCount);
      const currentHeights = new Float32Array(vertexCount);
      const targetRadii = new Float32Array(vertexCount);
      const currentRadii = new Float32Array(vertexCount);

      // Indices for 6 triangles from apex (index 0) to (1,2), (2,3), (3,4), (4,5), (5,6), (6,1)
      const indices = [
        0, 1, 2,
        0, 2, 3,
        0, 3, 4,
        0, 4, 5,
        0, 5, 6,
        0, 6, 1,
        // Double-sided backfaces
        0, 2, 1,
        0, 3, 2,
        0, 4, 3,
        0, 5, 4,
        0, 6, 5,
        0, 1, 6
      ];
      canopyGeo.setIndex(indices);
      canopyGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const canopyMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.65,
        roughness: 0.15,
        metalness: 0.7,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide
      });
      const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
      canopyMesh.position.y = 0.16;
      arenaGroup.add(canopyMesh);

      // Boundary Glowing Laser Ribbon
      const ribbonPts = [];
      for (let i = 0; i <= axesCount; i++) {
        ribbonPts.push(new THREE.Vector3(0, 0, 0));
      }
      const ribbonGeo = new THREE.BufferGeometry().setFromPoints(ribbonPts);
      const ribbonMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2.5 });
      const ribbonLine = new THREE.Line(ribbonGeo, ribbonMat);
      ribbonLine.position.y = 0.16;
      arenaGroup.add(ribbonLine);

      // 6 Glowing Joint Spheres on the Canopy Rim
      const jointSpheres = [];
      const jointGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const jointMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      for (let i = 0; i < axesCount; i++) {
        const jMesh = new THREE.Mesh(jointGeo, jointMat);
        arenaGroup.add(jMesh);
        jointSpheres.push(jMesh);
      }

      // Initialize canopy heights for Hesabaty (100% full dome)
      targetHeights[0] = 2.6; // Apex
      currentHeights[0] = 2.6;
      for (let i = 0; i < axesCount; i++) {
        targetHeights[i + 1] = scoresHesabaty[i];
        currentHeights[i + 1] = scoresHesabaty[i];
        targetRadii[i + 1] = stationRadius;
        currentRadii[i + 1] = stationRadius;
      }

      // -------------------------------------------------------------
      // 5. CINEMATIC ROTATING RADAR SWEEP FAN
      // -------------------------------------------------------------
      const sweepGeo = new THREE.CylinderGeometry(0.01, 3.8, 0.02, 32, 1, false, 0, Math.PI / 3);
      const sweepMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide
      });
      const sweepMesh = new THREE.Mesh(sweepGeo, sweepMat);
      sweepMesh.position.y = 0.09;
      arenaGroup.add(sweepMesh);

      // Ambient Drifting Stardust
      const dustGeo = new THREE.BufferGeometry();
      const dustCount = 85;
      const dustPos = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount * 3; i++) {
        dustPos[i] = (Math.random() - 0.5) * 16;
      }
      dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
      const dustMat = new THREE.PointsMaterial({ size: 0.07, color: 0x38bdf8, transparent: true, opacity: 0.6 });
      const dustParticles = new THREE.Points(dustGeo, dustMat);
      arenaGroup.add(dustParticles);

      // -------------------------------------------------------------
      // 6. CAMERA TARGETS & COMPETITOR SELECTION LOGIC
      // -------------------------------------------------------------
      const compCamTargets = [
        // 0: Hesabaty Hero View (Overhead Isometric Perspective)
        {
          camPos: new THREE.Vector3(0.0, 9.4, 6.8),
          lookAt: new THREE.Vector3(0.0, 0.2, 0.0)
        },
        // 1: Legacy Desktop (Overhead view craning slightly left)
        {
          camPos: new THREE.Vector3(-2.8, 9.0, 6.4),
          lookAt: new THREE.Vector3(-0.6, 0.2, 0.0)
        },
        // 2: Cloud ERP (Overhead view craning slightly right)
        {
          camPos: new THREE.Vector3(2.8, 9.0, 6.4),
          lookAt: new THREE.Vector3(0.6, 0.2, 0.0)
        }
      ];

      let currentCamPos = new THREE.Vector3(0.0, 9.4, 6.8);
      let currentLookAt = new THREE.Vector3(0.0, 0.2, 0.0);
      let targetCamPos = compCamTargets[0].camPos.clone();
      let targetLookAt = compCamTargets[0].lookAt.clone();
      let currentActiveIdx = 0;

      compSelector = {
        select(idx) {
          currentActiveIdx = idx;
          if (compCamTargets[idx]) {
            targetCamPos.copy(compCamTargets[idx].camPos);
            targetLookAt.copy(compCamTargets[idx].lookAt);
          }

          // Sync Buttons & Cards
          [0, 1, 2].forEach(i => {
            const btn = document.getElementById('btn-comp-' + i);
            if (btn) {
              if (i === idx) btn.classList.add('active');
              else btn.classList.remove('active');
            }
            const card = document.getElementById('card-comp-' + i);
            if (card) {
              if (i === idx) card.classList.add('active');
              else card.classList.remove('active');
            }
          });

          // Update Target Heights and Materials for Canopy Morphing
          if (idx === 0) {
            // Hesabaty 100% Dome
            targetHeights[0] = 2.7;
            canopyMat.color.setHex(0x0284c7);
            canopyMat.emissive.setHex(0x38bdf8);
            canopyMat.opacity = 0.5;
            ribbonMat.color.setHex(0x38bdf8);
            mainSpot.color.setHex(0x38bdf8);

            for (let i = 0; i < axesCount; i++) {
              targetHeights[i + 1] = scoresHesabaty[i];
              targetRadii[i + 1] = stationRadius;
            }
          } else if (idx === 1) {
            // Legacy Desktop Collapse (Red / skewed)
            targetHeights[0] = 1.1;
            canopyMat.color.setHex(0x7f1d1d);
            canopyMat.emissive.setHex(0xef4444);
            canopyMat.opacity = 0.42;
            ribbonMat.color.setHex(0xef4444);
            mainSpot.color.setHex(0xf87171);

            for (let i = 0; i < axesCount; i++) {
              targetHeights[i + 1] = scoresLegacy[i];
              targetRadii[i + 1] = stationRadius * 0.75;
            }
          } else if (idx === 2) {
            // Cloud ERP (Amber / irregular)
            targetHeights[0] = 1.4;
            canopyMat.color.setHex(0x78350f);
            canopyMat.emissive.setHex(0xf59e0b);
            canopyMat.opacity = 0.42;
            ribbonMat.color.setHex(0xf59e0b);
            mainSpot.color.setHex(0xfbbf24);

            for (let i = 0; i < axesCount; i++) {
              targetHeights[i + 1] = scoresCloudERP[i];
              targetRadii[i + 1] = stationRadius * 0.85;
            }
          }
        }
      };

      // Direct Canvas Click Handling
      if (stageElem) {
        const raycaster = new THREE.Raycaster();
        const clickVec = new THREE.Vector2();
        stageElem.addEventListener('click', (e) => {
          const rect = stageElem.getBoundingClientRect();
          clickVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          clickVec.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
          raycaster.setFromCamera(clickVec, camera);

          // Cycle to next competitor on canvas click
          const nextIdx = (currentActiveIdx + 1) % 3;
          compSelector.select(nextIdx);
        });
      }

      // Initial Selection
      compSelector.select(0);

      // Return Animation Loop
      return {
        update(time) {
          // 1. Ultra-Smooth Cinematic Camera Glide
          currentCamPos.lerp(targetCamPos, 0.055);
          currentLookAt.lerp(targetLookAt, 0.055);

          // Cinematic Floating Breathing Motion + Mouse Parallax
          const breath = Math.sin(time * 0.6) * 0.05;
          const pX = mouseX * 0.25;
          const pY = -mouseY * 0.15;
          camera.position.set(currentCamPos.x + pX, currentCamPos.y + breath + pY, currentCamPos.z);
          camera.lookAt(currentLookAt.x, currentLookAt.y, currentLookAt.z);

          // 2. Center Gyroscope Core Rotations
          ring1.rotation.x = time * 0.65;
          ring1.rotation.y = time * 0.45;
          ring2.rotation.y = -time * 0.55;
          ring2.rotation.z = time * 0.35;
          crystalMesh.rotation.y = time * 0.8;
          crystalMesh.position.y = Math.sin(time * 1.5) * 0.04;

          // 3. Radar Sweep Fan Rotation
          sweepMesh.rotation.y = -time * 0.75;

          // 4. Smooth Morphing of 3D Canopy Vertices
          // Apex vertex (index 0)
          currentHeights[0] += (targetHeights[0] - currentHeights[0]) * 0.075;
          positions[0] = 0;
          positions[1] = currentHeights[0];
          positions[2] = 0;

          // Outer 6 vertices (indices 1 to 6)
          const ribbonPos = ribbonLine.geometry.attributes.position.array;
          for (let i = 0; i < axesCount; i++) {
            currentHeights[i + 1] += (targetHeights[i + 1] - currentHeights[i + 1]) * 0.075;
            currentRadii[i + 1] += (targetRadii[i + 1] - currentRadii[i + 1]) * 0.075;

            const angle = stationAngles[i];
            const px = Math.cos(angle) * currentRadii[i + 1];
            const py = currentHeights[i + 1];
            const pz = Math.sin(angle) * currentRadii[i + 1];

            const vIdx = (i + 1) * 3;
            positions[vIdx] = px;
            positions[vIdx + 1] = py;
            positions[vIdx + 2] = pz;

            // Update boundary ribbon positions
            const rIdx = i * 3;
            ribbonPos[rIdx] = px;
            ribbonPos[rIdx + 1] = py;
            ribbonPos[rIdx + 2] = pz;

            // Update joint spheres
            jointSpheres[i].position.set(px, py + 0.16, pz);

            // Billboarding: Station badges gently track camera angle directly
            stations[i].badge.lookAt(camera.position.x, camera.position.y, camera.position.z);
          }
          // Loop ribbon back to start
          ribbonPos[axesCount * 3] = ribbonPos[0];
          ribbonPos[axesCount * 3 + 1] = ribbonPos[1];
          ribbonPos[axesCount * 3 + 2] = ribbonPos[2];

          canopyGeo.attributes.position.needsUpdate = true;
          canopyGeo.computeVertexNormals();
          ribbonLine.geometry.attributes.position.needsUpdate = true;

          // 5. Crown and Pillar Pulsing
          stations.forEach((st, idx) => {
            st.crown.rotation.y = time * 0.5 + idx;
            if (currentActiveIdx === 0) {
              st.hMesh.material.emissiveIntensity = 0.7 + Math.sin(time * 3 + idx) * 0.2;
            }
          });

          // 6. Gentle Space Dust Drift
          dustParticles.rotation.y = time * 0.018;
        }
      };
    }

    window.selectCompLayer = function(idx) {
      if (compSelector) compSelector.select(idx);
    };

    // --- SLIDE 9: 3D Holographic Dual Founder Pods & Synergy Arc ---
    let teamSelector = null;

    function buildSlide9Scene(scene, camera) {
      camera.position.set(0.0, 0.45, 11.8);
      camera.lookAt(0.0, -0.3, 0.0);

      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      // Mouse Parallax Setup
      let mouseX = 0, mouseY = 0;
      const stageElem = document.getElementById('stage-slide-9');
      if (stageElem) {
        stageElem.addEventListener('mousemove', (e) => {
          const rect = stageElem.getBoundingClientRect();
          mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        });
        stageElem.addEventListener('mouseleave', () => {
          mouseX = 0;
          mouseY = 0;
        });
      }

      // Lights
      const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
      dirLight.position.set(6, 12, 10);
      scene.add(dirLight);

      const cyanPoint = new THREE.PointLight(0x38bdf8, 2.0, 25);
      cyanPoint.position.set(-3, 2, 5);
      scene.add(cyanPoint);

      const goldPoint = new THREE.PointLight(0xf59e0b, 2.0, 25);
      goldPoint.position.set(3, 2, 5);
      scene.add(goldPoint);

      const centerPoint = new THREE.PointLight(0x10b981, 1.4, 20);
      centerPoint.position.set(0, 3, 4);
      scene.add(centerPoint);

      // Base Platform Disc
      const discGeo = new THREE.CylinderGeometry(6.6, 7.0, 0.25, 64);
      const discMat = new THREE.MeshStandardMaterial({
        color: 0x07111f,
        metalness: 0.9,
        roughness: 0.2,
        transparent: true,
        opacity: 0.85
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.set(0, -3.2, 0);
      disc.rotation.x = 0.12;
      rootGroup.add(disc);

      const discEdge = new THREE.EdgesGeometry(discGeo);
      disc.add(new THREE.LineSegments(discEdge, new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 })));

      // ------------------------------------------
      // ULTRA-SHARP TEXTURE GENERATOR FOR FOUNDER PROFILE CARDS (960x580)
      // ------------------------------------------
      function makeTeamCardTexture(name, title, tag, bullets, quote, accentColor) {
        const c = document.createElement('canvas');
        c.width = 960;
        c.height = 580;
        const ctx = c.getContext('2d');

        function drawRoundRect(x, y, w, h, r) {
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.arcTo(x + w, y, x + w, y + h, r);
          ctx.arcTo(x + w, y + h, x, y + h, r);
          ctx.arcTo(x, y + h, x, y, r);
          ctx.arcTo(x, y, x + w, y, r);
          ctx.closePath();
        }

        // Deep Midnight Gradient Background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 580);
        bgGrad.addColorStop(0, '#09152b');
        bgGrad.addColorStop(0.5, '#060d1b');
        bgGrad.addColorStop(1, '#030712');
        ctx.fillStyle = bgGrad;
        drawRoundRect(0, 0, 960, 580, 26);
        ctx.fill();

        // Glowing Outer Border
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 4;
        drawRoundRect(4, 4, 952, 572, 24);
        ctx.stroke();

        // Inner Subtle Glass Rim
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1.5;
        drawRoundRect(10, 10, 940, 560, 20);
        ctx.stroke();

        // Header Pill Bar
        const headerGrad = ctx.createLinearGradient(0, 14, 960, 14);
        headerGrad.addColorStop(0, 'rgba(30, 58, 138, 0.2)');
        headerGrad.addColorStop(0.5, 'rgba(30, 58, 138, 0.5)');
        headerGrad.addColorStop(1, 'rgba(15, 23, 42, 0.7)');
        ctx.fillStyle = headerGrad;
        drawRoundRect(14, 14, 932, 92, 18);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        drawRoundRect(14, 14, 932, 92, 18);
        ctx.stroke();

        // Founder Name (Right-aligned in RTL)
        ctx.direction = 'rtl';
        ctx.textAlign = 'right';
        ctx.font = 'bold 32px Cairo, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.fillText(name, 915, 68);

        // Tag Pill Badge (Left-aligned)
        ctx.direction = 'ltr';
        ctx.textAlign = 'left';
        ctx.font = 'bold 18px Cairo, sans-serif';
        const tagTextWidth = ctx.measureText(tag).width;
        const tagBoxWidth = Math.max(tagTextWidth + 36, 140);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        drawRoundRect(36, 36, tagBoxWidth, 48, 12);
        ctx.fill();
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.5;
        drawRoundRect(36, 36, tagBoxWidth, 48, 12);
        ctx.stroke();
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(tag, 54, 67);

        // Subtitle / Role Bar
        ctx.direction = 'rtl';
        ctx.textAlign = 'right';
        ctx.font = 'bold 24px Cairo, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(title, 915, 148);

        // Glowing Gradient Divider
        const divGrad = ctx.createLinearGradient(40, 175, 920, 175);
        divGrad.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
        divGrad.addColorStop(0.3, accentColor);
        divGrad.addColorStop(0.7, accentColor);
        divGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
        ctx.strokeStyle = divGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, 175);
        ctx.lineTo(920, 175);
        ctx.stroke();

        // 3 Key Bullets
        bullets.forEach((b, idx) => {
          const bulletY = 226 + idx * 64;

          // Glowing Bullet Dot
          ctx.save();
          ctx.fillStyle = accentColor;
          ctx.beginPath();
          ctx.arc(905, bulletY - 8, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Bullet Text
          ctx.font = '22px Cairo, sans-serif';
          ctx.fillStyle = '#e2e8f0';
          ctx.fillText(b, 885, bulletY);
        });

        // Quote / Key Takeaway Callout Box at Bottom
        const quoteGrad = ctx.createLinearGradient(36, 435, 36, 545);
        quoteGrad.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
        quoteGrad.addColorStop(1, 'rgba(10, 18, 36, 0.98)');
        ctx.fillStyle = quoteGrad;
        drawRoundRect(36, 435, 888, 108, 16);
        ctx.fill();

        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        drawRoundRect(36, 435, 888, 108, 16);
        ctx.stroke();

        ctx.direction = 'rtl';
        ctx.textAlign = 'right';
        ctx.font = 'bold 22px Cairo, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.fillText(quote, 895, 498);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 16;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        return tex;
      }

      function makeBadgeDiscTexture(emoji, text, color) {
        const c = document.createElement('canvas');
        c.width = 160;
        c.height = 160;
        const ctx = c.getContext('2d');

        ctx.fillStyle = 'rgba(11, 22, 44, 0.95)';
        ctx.beginPath(); ctx.arc(80, 80, 76, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.font = '48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(emoji, 80, 72);

        ctx.font = 'bold 16px Cairo, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, 80, 120);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 8;
        return tex;
      }

      // Shared Card Geometry (Width 2.65, Height 1.60)
      const cardGeo = new THREE.PlaneGeometry(2.65, 1.60);
      const frameGeo = new THREE.BoxGeometry(2.69, 1.64, 0.04);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x07111f,
        metalness: 0.9,
        roughness: 0.2
      });

      // ------------------------------------------
      // DUAL FOUNDER PODS
      // ------------------------------------------
      const founderPods = [];

      function createFounderPod(idx, x, baseY, z, radius, color, rimColor, badgeTexture, buildArtifactsFn) {
        const pGroup = new THREE.Group();
        pGroup.position.set(x, baseY, z);
        rootGroup.add(pGroup);

        // Hex Base Podium
        const podGeo = new THREE.CylinderGeometry(radius, radius * 1.1, 0.38, 6);
        const podMat = new THREE.MeshStandardMaterial({
          color: color,
          emissive: 0x051b38,
          emissiveIntensity: 0.35,
          metalness: 0.9,
          roughness: 0.2
        });
        const podMesh = new THREE.Mesh(podGeo, podMat);
        pGroup.add(podMesh);

        // Glowing Hex Rim
        const rimGeo = new THREE.TorusGeometry(radius * 1.03, 0.035, 16, 6);
        const rimMat = new THREE.MeshBasicMaterial({ color: rimColor });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.position.y = 0.2;
        rim.rotation.x = Math.PI / 2;
        pGroup.add(rim);

        // Backing Frame Mesh
        const frameMesh = new THREE.Mesh(frameGeo, frameMat);
        frameMesh.position.set(0, 1.55, 0.33);
        pGroup.add(frameMesh);

        // Upright Profile Card Plaque
        const cardMat = new THREE.MeshBasicMaterial({ map: badgeTexture, side: THREE.DoubleSide });
        const cardMesh = new THREE.Mesh(cardGeo, cardMat);
        cardMesh.position.set(0, 1.55, 0.352);
        pGroup.add(cardMesh);

        // Artifacts Container
        const artGroup = new THREE.Group();
        artGroup.position.set(0, 0.25, 0);
        pGroup.add(artGroup);

        if (buildArtifactsFn) {
          buildArtifactsFn(artGroup);
        }

        founderPods.push({
          group: pGroup,
          baseY: baseY,
          targetY: baseY,
          rim: rim,
          cardMesh: cardMesh,
          artGroup: artGroup,
          idx: idx
        });
      }

      // 1. Mohamed Omer Ramadan (CEO & CTO) - Left
      let omerDodeca = null;
      createFounderPod(
        0,
        -2.5, -2.4, 0.2,
        1.5,
        0x0369a1,
        0x38bdf8,
        makeTeamCardTexture(
          '👨‍💻 م/ محمد عمر رمضان',
          'المؤسس والمدير التنفيذي والتقني (CEO & CTO)',
          '⚡ Cloud Architect & Field Sales',
          [
            '• هندسة وتطوير المعماريات السحابية (Next.js, Bun, PostgreSQL)',
            '• ابتكار محرك مسح الباركود بالكاميرا < 1s وصمود IndexedDB أوفلاين',
            '• قيادة النزول الميداني المباشر للشوارع التجارية بشرق الإسكندرية'
          ],
          '🎯 "بناء منتج مصمم لواقع الشارع المصري بدون أي تكلفة عتاد."',
          '#38bdf8'
        ),
        (grp) => {
          // Cloud Tech Core: Wireframe Dodecahedron with golden inner core
          omerDodeca = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.48, 0),
            new THREE.MeshStandardMaterial({ color: 0x38bdf8, wireframe: true })
          );
          omerDodeca.position.set(0, 0.55, 0);
          grp.add(omerDodeca);

          const core = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.7 })
          );
          core.position.set(0, 0.55, 0);
          grp.add(core);

          // Orbiting Satellites: Next.js & IndexedDB
          const sat1 = new THREE.Mesh(
            new THREE.CircleGeometry(0.2, 24),
            new THREE.MeshBasicMaterial({ map: makeBadgeDiscTexture('⚡', 'Next.js', '#38bdf8'), side: THREE.DoubleSide })
          );
          sat1.position.set(-0.65, 0.65, 0.15);
          grp.add(sat1);

          const sat2 = new THREE.Mesh(
            new THREE.CircleGeometry(0.2, 24),
            new THREE.MeshBasicMaterial({ map: makeBadgeDiscTexture('💾', 'Offline', '#10b981'), side: THREE.DoubleSide })
          );
          sat2.position.set(0.65, 0.65, 0.15);
          grp.add(sat2);
        }
      );

      // 2. Mohamed Nabil Ahmed (CFO) - Right
      let nabilScaleBeam = null;
      let nabilPanLeft = null;
      let nabilPanRight = null;
      createFounderPod(
        1,
        2.5, -2.4, 0.2,
        1.5,
        0x1e1b4b,
        0xf59e0b,
        makeTeamCardTexture(
          '📈 أ/ محمد نبيل أحمد',
          'الشريك المؤسس والمدير المالي (CFO)',
          '⚖️ Financial Controller & CPAs',
          [
            '• النمذجة المالية وإدارة التدفقات النقدية وهوامش ربح إجمالي > 90%',
            '• المطابقة المحاسبية لقانون 152 لسنة 2020 ومنظومة الإيصال الإلكتروني',
            '• بناء وتنسيق شبكة الشراكات مع المحاسبين القانونيين (CPAs)'
          ],
          '🎯 "انضباط مالي يضمن استرداد التكلفة والتعادل عند 20 متجراً فقط."',
          '#f59e0b'
        ),
        (grp) => {
          // Golden Financial Scales
          const pillar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.022, 0.04, 0.75, 12),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 })
          );
          pillar.position.set(0, 0.45, 0);
          grp.add(pillar);

          nabilScaleBeam = new THREE.Mesh(
            new THREE.CylinderGeometry(0.016, 0.016, 0.65, 8),
            new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9 })
          );
          nabilScaleBeam.position.set(0, 0.78, 0);
          nabilScaleBeam.rotation.z = Math.PI / 2;
          grp.add(nabilScaleBeam);

          nabilPanLeft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.02, 0.04, 16),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 })
          );
          nabilPanLeft.position.set(-0.3, 0.62, 0);
          grp.add(nabilPanLeft);

          nabilPanRight = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.02, 0.04, 16),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 })
          );
          nabilPanRight.position.set(0.3, 0.62, 0);
          grp.add(nabilPanRight);

          // Orbiting Satellites: Law 152 & 90% Margin
          const sat1 = new THREE.Mesh(
            new THREE.CircleGeometry(0.2, 24),
            new THREE.MeshBasicMaterial({ map: makeBadgeDiscTexture('📜', 'قانون 152', '#f59e0b'), side: THREE.DoubleSide })
          );
          sat1.position.set(-0.65, 0.65, 0.15);
          grp.add(sat1);

          const sat2 = new THREE.Mesh(
            new THREE.CircleGeometry(0.2, 24),
            new THREE.MeshBasicMaterial({ map: makeBadgeDiscTexture('🎯', 'هامش 90%', '#10b981'), side: THREE.DoubleSide })
          );
          sat2.position.set(0.65, 0.65, 0.15);
          grp.add(sat2);
        }
      );

      // ------------------------------------------
      // CONNECTING SYNERGY LASER ARC & EMBLEM
      // ------------------------------------------
      const synergyCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.5, -0.6, 0.2),
        new THREE.Vector3(-1.3, 0.6, 0.35),
        new THREE.Vector3(0.0, 1.1, 0.4),
        new THREE.Vector3(1.3, 0.6, 0.35),
        new THREE.Vector3(2.5, -0.6, 0.2)
      ]);

      const arcTubeGeo = new THREE.TubeGeometry(synergyCurve, 40, 0.065, 10, false);
      const arcTubeMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.65,
        transparent: true,
        opacity: 0.8
      });
      const arcTube = new THREE.Mesh(arcTubeGeo, arcTubeMat);
      rootGroup.add(arcTube);

      // Synergy Transit Particles
      const synCount = 10;
      const synSpheres = [];
      const synPGeo = new THREE.SphereGeometry(0.065, 10, 10);
      for (let i = 0; i < synCount; i++) {
        const spMat = new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0x38bdf8 : 0xf59e0b
        });
        const spMesh = new THREE.Mesh(synPGeo, spMat);
        rootGroup.add(spMesh);
        synSpheres.push({ mesh: spMesh, offset: i / synCount });
      }

      // Hesabaty Nexus Diamond Emblem at Arc Apex
      const nexusDiamond = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.35, 0),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.8,
          metalness: 0.9,
          roughness: 0.1
        })
      );
      nexusDiamond.position.set(0.0, 1.1, 0.4);
      rootGroup.add(nexusDiamond);

      // Golden Crown Ring around Nexus
      const nexusCrown = new THREE.Mesh(
        new THREE.TorusGeometry(0.48, 0.03, 16, 32),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 })
      );
      nexusCrown.position.set(0.0, 1.1, 0.4);
      nexusCrown.rotation.x = Math.PI / 2;
      rootGroup.add(nexusCrown);

      // Central Synergy Card Plaque Group (Mode 2)
      const centerSynergyGroup = new THREE.Group();
      centerSynergyGroup.position.set(0.0, -0.47, 0.55);
      rootGroup.add(centerSynergyGroup);

      const centerFrame = new THREE.Mesh(frameGeo, frameMat);
      centerFrame.position.set(0, 0, -0.02);
      centerSynergyGroup.add(centerFrame);

      const centerSynergyCardMat = new THREE.MeshBasicMaterial({
        map: makeTeamCardTexture(
          '⚡ التكامل التنفيذي الحاسم',
          'التناغم بين سرعة بناء المنتج والانضباط المالي',
          '🎯 Founder-Market Fit',
          [
            '• تكامل داخلي كامل (In-House): سرعة في اتخاذ القرارات والتنفيذ',
            '• خفض تكلفة الاستحواذ والتطوير دون الاعتماد على جهات خارجية',
            '• فهم عميق لواقع التجارة المصرية وشبكة علاقات موثوقة مع المحاسبين'
          ],
          '🌟 "تكامل يُحول الموارد الاستثمارية إلى نمو فوري ومستدام."',
          '#10b981'
        ),
        side: THREE.DoubleSide
      });
      const centerSynergyCard = new THREE.Mesh(cardGeo, centerSynergyCardMat);
      centerSynergyGroup.add(centerSynergyCard);
      centerSynergyGroup.visible = false;

      // ------------------------------------------
      // NEXT STRATEGIC HIRES PLATFORM (BACK)
      // ------------------------------------------
      const hiresGroup = new THREE.Group();
      hiresGroup.position.set(0, -1.8, -1.2);
      rootGroup.add(hiresGroup);

      const hirePlatform = new THREE.Mesh(
        new THREE.CylinderGeometry(2.4, 2.6, 0.25, 32),
        new THREE.MeshStandardMaterial({ color: 0x1e1b4b, emissive: 0x312e81, emissiveIntensity: 0.4, transparent: true, opacity: 0.85 })
      );
      hiresGroup.add(hirePlatform);

      // Two silhouette beacons on the hire platform
      const hireBeacon1 = new THREE.Mesh(
        new THREE.CircleGeometry(0.24, 24),
        new THREE.MeshBasicMaterial({ map: makeBadgeDiscTexture('🚶‍♂️', 'مبيعات ميدانية', '#a78bfa'), side: THREE.DoubleSide })
      );
      hireBeacon1.position.set(-0.85, 0.65, 0.1);
      hiresGroup.add(hireBeacon1);

      const hireBeacon2 = new THREE.Mesh(
        new THREE.CircleGeometry(0.24, 24),
        new THREE.MeshBasicMaterial({ map: makeBadgeDiscTexture('🎧', 'دعم وتهيئة', '#38bdf8'), side: THREE.DoubleSide })
      );
      hireBeacon2.position.set(0.85, 0.65, 0.1);
      hiresGroup.add(hireBeacon2);

      const hiresFrame = new THREE.Mesh(frameGeo, frameMat);
      hiresFrame.position.set(0, 1.33, 0.18);
      hiresGroup.add(hiresFrame);

      const hiresCardMat = new THREE.MeshBasicMaterial({
        map: makeTeamCardTexture(
          '🚀 أولويات التوظيف والتوسع القادم',
          'خريطة التعيينات التشغيلية للأشهر الـ 12 القادمة',
          '👥 Next Strategic Hires',
          [
            '• مسؤول مبيعات وزيارات ميدانية: لتكثيف التغطية اليومية للشوارع التجارية',
            '• أخصائي تهيئة ودعم فني: لسرعة تدريب الكاشيرات ورفع كتالوج الأصناف',
            '• مسوق رقمي ومحلل بيانات: لإدارة حملات Meta Ads ورؤى السوق'
          ],
          '📈 "تعيينات دقيقة لتعظيم العائد على كل جنيه مستثمر."',
          '#a78bfa'
        ),
        side: THREE.DoubleSide
      });
      const hiresCard = new THREE.Mesh(cardGeo, hiresCardMat);
      hiresCard.position.set(0, 1.33, 0.202);
      hiresGroup.add(hiresCard);

      // Ambient Space Particles
      const partGeo = new THREE.BufferGeometry();
      const partCount = 75;
      const posArray = new Float32Array(partCount * 3);
      for (let i = 0; i < partCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 18;
      }
      partGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const partMat = new THREE.PointsMaterial({ size: 0.075, color: 0x38bdf8, transparent: true, opacity: 0.65 });
      const particles = new THREE.Points(partGeo, partMat);
      rootGroup.add(particles);

      // ------------------------------------------
      // DYNAMIC ZOOM DISTANCE & CAMERA TARGETS
      // ------------------------------------------
      function getZoomDistance() {
        const cardW = 2.65;
        const desiredFraction = 0.90; // Takes 90% of the canvas width
        const vTan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const aspect = camera.aspect || (stageElem ? stageElem.clientWidth / stageElem.clientHeight : 0.74);
        const dist = cardW / (2 * vTan * aspect * desiredFraction);
        return Math.min(Math.max(dist, 3.2), 6.5);
      }

      function getTargetForIdx(idx) {
        const dist = getZoomDistance();
        switch (idx) {
          case 0: // Mohamed Omer (Left)
            return {
              camPos: new THREE.Vector3(-2.5, -0.47, 0.55 + dist),
              lookAt: new THREE.Vector3(-2.5, -0.47, 0.55)
            };
          case 1: // Mohamed Nabil (Right)
            return {
              camPos: new THREE.Vector3(2.5, -0.47, 0.55 + dist),
              lookAt: new THREE.Vector3(2.5, -0.47, 0.55)
            };
          case 2: // Founder Synergy Nexus
            return {
              camPos: new THREE.Vector3(0.0, -0.47, 0.55 + dist),
              lookAt: new THREE.Vector3(0.0, -0.47, 0.55)
            };
          case 3: // Next Hires Platform
            return {
              camPos: new THREE.Vector3(0.0, -0.47, -1.0 + dist),
              lookAt: new THREE.Vector3(0.0, -0.47, -1.0)
            };
          case 4: // Overview
          default:
            return {
              camPos: new THREE.Vector3(0.0, 0.45, 11.8),
              lookAt: new THREE.Vector3(0.0, -0.3, 0.0)
            };
        }
      }

      let currentCamPos = new THREE.Vector3(0.0, 0.45, 11.8);
      let currentLookAt = new THREE.Vector3(0.0, -0.3, 0.0);
      let targetCamPos = new THREE.Vector3(0.0, 0.45, 11.8);
      let targetLookAt = new THREE.Vector3(0.0, -0.3, 0.0);
      let currentSelectedIdx = 0;

      teamSelector = {
        select(idx) {
          currentSelectedIdx = idx;
          const target = getTargetForIdx(idx);
          targetCamPos.copy(target.camPos);
          targetLookAt.copy(target.lookAt);

          // Center Synergy Card Visibility
          centerSynergyGroup.visible = (idx === 2);

          // Sync buttons & right-hand cards
          for (let i = 0; i <= 4; i++) {
            const btn = document.getElementById('btn-team-' + i);
            if (btn) {
              if (i === idx) btn.classList.add('active');
              else btn.classList.remove('active');
            }
            const card = document.getElementById('card-team-' + i);
            if (card) {
              if (i === idx) card.classList.add('active');
              else card.classList.remove('active');
            }
          }

          // Elevate selected founder pod
          founderPods.forEach(p => {
            if (p.idx === idx) {
              p.targetY = p.baseY + 0.38;
              p.rim.scale.set(1.15, 1.15, 1.15);
            } else {
              p.targetY = p.baseY;
              p.rim.scale.set(1.0, 1.0, 1.0);
            }
          });
        }
      };

      // Set initial view: Mohamed Omer (idx = 0)
      teamSelector.select(0);
      currentCamPos.copy(targetCamPos);
      currentLookAt.copy(targetLookAt);

      // Handle window resize to recompute zoom distance if zoomed in
      window.addEventListener('resize', () => {
        if (currentSelectedIdx !== 4) {
          const t = getTargetForIdx(currentSelectedIdx);
          targetCamPos.copy(t.camPos);
          targetLookAt.copy(t.lookAt);
        }
      });

      // Direct Canvas Click Raycaster & Cursor Styling
      if (stageElem) {
        const raycaster = new THREE.Raycaster();
        const mouseVec = new THREE.Vector2();

        stageElem.addEventListener('click', (e) => {
          const rect = stageElem.getBoundingClientRect();
          mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouseVec.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
          raycaster.setFromCamera(mouseVec, camera);

          // Check Left Pod (Mohamed Omer)
          const hitPod0 = raycaster.intersectObjects(founderPods[0].group.children, true);
          if (hitPod0.length > 0) {
            if (currentSelectedIdx === 0) teamSelector.select(4);
            else teamSelector.select(0);
            return;
          }

          // Check Right Pod (Mohamed Nabil)
          const hitPod1 = raycaster.intersectObjects(founderPods[1].group.children, true);
          if (hitPod1.length > 0) {
            if (currentSelectedIdx === 1) teamSelector.select(4);
            else teamSelector.select(1);
            return;
          }

          // Check Center Synergy Elements (Card, Diamond, Arc)
          const hitSynergy = raycaster.intersectObjects([nexusDiamond, arcTube, ...centerSynergyGroup.children], true);
          if (hitSynergy.length > 0) {
            if (currentSelectedIdx === 2) teamSelector.select(4);
            else teamSelector.select(2);
            return;
          }

          // Check Next Strategic Hires Platform
          const hitHires = raycaster.intersectObjects(hiresGroup.children, true);
          if (hitHires.length > 0) {
            if (currentSelectedIdx === 3) teamSelector.select(4);
            else teamSelector.select(3);
            return;
          }

          // Clicked empty background: toggle to overview if currently zoomed in
          if (currentSelectedIdx !== 4) {
            teamSelector.select(4);
          }
        });

        // Hover cursor pointer feedback
        stageElem.addEventListener('mousemove', (e) => {
          const rect = stageElem.getBoundingClientRect();
          mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouseVec.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
          raycaster.setFromCamera(mouseVec, camera);

          const allClickables = [
            ...founderPods[0].group.children,
            ...founderPods[1].group.children,
            nexusDiamond, arcTube,
            ...centerSynergyGroup.children,
            ...hiresGroup.children
          ];
          const hits = raycaster.intersectObjects(allClickables, true);
          stageElem.style.cursor = hits.length > 0 ? 'pointer' : 'default';
        });
      }

      return {
        update(time) {
          // Smooth Camera Lerp
          currentCamPos.lerp(targetCamPos, 0.06);
          currentLookAt.lerp(targetLookAt, 0.06);

          // Subtle Parallax (softened when zoomed in for reading stability)
          const isZoomed = currentSelectedIdx !== 4;
          const pFactor = isZoomed ? 0.06 : 0.22;
          const pX = mouseX * pFactor;
          const pY = -mouseY * (pFactor * 0.6);
          camera.position.set(currentCamPos.x + pX, currentCamPos.y + pY, currentCamPos.z);
          camera.lookAt(currentLookAt.x, currentLookAt.y, currentLookAt.z);

          // Elevate pods smoothly
          founderPods.forEach(p => {
            p.group.position.y += (p.targetY - p.group.position.y) * 0.08;
          });

          // Mohamed Omer Dodecahedron Rotation
          if (omerDodeca) {
            omerDodeca.rotation.y = time * 0.6;
            omerDodeca.rotation.x = time * 0.3;
          }

          // Mohamed Nabil Balance Scale Gentle Rocking
          if (nabilScaleBeam) {
            const rock = Math.sin(time * 1.5) * 0.08;
            nabilScaleBeam.rotation.z = Math.PI / 2 + rock;
            if (nabilPanLeft) nabilPanLeft.position.y = 0.62 - rock * 0.3;
            if (nabilPanRight) nabilPanRight.position.y = 0.62 + rock * 0.3;
          }

          // Synergy Arc Transit Particles Flow
          synSpheres.forEach(sp => {
            const frac = (time * 0.14 + sp.offset) % 1.0;
            const pt = synergyCurve.getPointAt(frac);
            sp.mesh.position.copy(pt);
          });

          // Nexus Diamond & Crown Rotation
          nexusDiamond.rotation.y = time * 0.7;
          nexusDiamond.rotation.z = time * 0.35;
          nexusCrown.rotation.z = -time * 0.5;

          // Space dust gentle drift
          particles.rotation.y = time * 0.02;
        }
      };
    }

    window.selectTeamMember = function(idx) {
      if (teamSelector) teamSelector.select(idx);
    };

    // --- SLIDE 10: Real 3D Capital Vault Engine & Enhanced Animation ---
    let fundSelector = null;

    function buildSlide10Scene(scene, camera) {
      camera.position.set(0.0, 0.2, 11.5);
      camera.lookAt(0.0, -0.1, 0.0);

      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      // Scale and tilt for comfortable framing
      rootGroup.scale.set(0.86, 0.86, 0.86);
      rootGroup.rotation.x = 0.22;

      // Mouse Parallax Setup
      let mouseX = 0, mouseY = 0;
      const stageElem = document.getElementById('stage-slide-10');
      if (stageElem) {
        stageElem.addEventListener('mousemove', (e) => {
          const rect = stageElem.getBoundingClientRect();
          mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        });
        stageElem.addEventListener('mouseleave', () => {
          mouseX = 0;
          mouseY = 0;
        });
      }

      // Lights - Cinematic Vault Specular Lighting
      const ambientLight = new THREE.AmbientLight(0x0a1428, 1.2);
      scene.add(ambientLight);

      const mainSpot = new THREE.SpotLight(0x38bdf8, 3.6, 32, Math.PI / 3.2, 0.35, 1.2);
      mainSpot.position.set(0, 12, 6);
      scene.add(mainSpot);

      const cyanPoint = new THREE.PointLight(0x38bdf8, 2.2, 22);
      cyanPoint.position.set(-5, 4, 6);
      scene.add(cyanPoint);

      const emeraldPoint = new THREE.PointLight(0x10b981, 2.0, 22);
      emeraldPoint.position.set(5, 4, 6);
      scene.add(emeraldPoint);

      const goldDirectional = new THREE.DirectionalLight(0xf59e0b, 1.6);
      goldDirectional.position.set(0, 8, -8);
      scene.add(goldDirectional);

      // -------------------------------------------------------------
      // 1. PHYSICAL 3D VAULT PLATFORM (Tiered Obsidian & Titanium Dais)
      // -------------------------------------------------------------
      const vaultDaisGroup = new THREE.Group();
      vaultDaisGroup.position.set(0, 0, -0.45);
      rootGroup.add(vaultDaisGroup);

      // Tier 1 Base: Heavy Dark Titanium Plinth
      const baseGeo = new THREE.CylinderGeometry(5.1, 5.4, 0.32, 64);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x070e1c,
        metalness: 0.92,
        roughness: 0.22
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.rotation.x = Math.PI / 2;
      vaultDaisGroup.add(baseMesh);

      // Recessed Glowing Neon Tube Rim
      const rimGeo = new THREE.TorusGeometry(5.02, 0.042, 16, 64);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 2.2
      });
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.position.z = 0.16;
      vaultDaisGroup.add(rimMesh);

      // Concentric Floor Laser Guide Tracks
      [1.6, 2.7, 3.8].forEach((r, rIdx) => {
        const ringGeo = new THREE.RingGeometry(r - 0.015, r + 0.015, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: rIdx === 2 ? 0x38bdf8 : 0x1e3a8a,
          transparent: true,
          opacity: rIdx === 2 ? 0.75 : 0.35,
          side: THREE.DoubleSide
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.z = 0.17;
        vaultDaisGroup.add(ringMesh);
      });

      // -------------------------------------------------------------
      // 2. THE 3 CAPITAL VAULT SECTORS & TANGIBLE 3D OBJECTS
      // -------------------------------------------------------------
      const sectorDefs = [
        {
          idx: 0,
          pct: 0.45,
          pctText: '45%',
          amountText: '78.8k ج.م',
          title: '📍 مبيعات',
          color: 0x0284c7,
          emissive: 0x38bdf8,
          accentHex: '#38bdf8'
        },
        {
          idx: 1,
          pct: 0.30,
          pctText: '30%',
          amountText: '52.5k ج.م',
          title: '⚡ سحابة',
          color: 0x065f46,
          emissive: 0x10b981,
          accentHex: '#10b981'
        },
        {
          idx: 2,
          pct: 0.25,
          pctText: '25%',
          amountText: '43.8k ج.م',
          title: '🛡️ تشغيل',
          color: 0x78350f,
          emissive: 0xf59e0b,
          accentHex: '#f59e0b'
        }
      ];

      function makeBadgeDiscTexture(pct, amount, colorHex) {
        const c = document.createElement('canvas');
        c.width = 240;
        c.height = 100;
        const ctx = c.getContext('2d');

        // Dark Rounded Glass Tag
        ctx.fillStyle = 'rgba(7, 15, 30, 0.95)';
        ctx.beginPath();
        ctx.roundRect(4, 4, 232, 92, 16);
        ctx.fill();

        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        ctx.font = 'bold 36px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = colorHex;
        ctx.fillText(pct, 120, 48);

        ctx.font = 'bold 20px Cairo, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(amount, 120, 80);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      const sectorsGroup = new THREE.Group();
      rootGroup.add(sectorsGroup);

      const rIn = 1.55;
      const rOut = 3.85;
      const gap = 0.08;
      let currentAngle = 0.0;
      const sectorNodes = [];

      sectorDefs.forEach((sec, sIdx) => {
        const span = (sec.pct * Math.PI * 2) - gap;
        const startA = currentAngle + gap / 2;
        const endA = startA + span;
        const midA = (startA + endA) / 2;
        currentAngle += sec.pct * Math.PI * 2;

        // Extruded 3D Annulus Geometry with deep bevel
        const shape = new THREE.Shape();
        const nSegs = 40;
        for (let i = 0; i <= nSegs; i++) {
          const theta = startA + (i / nSegs) * span;
          const x = Math.cos(theta) * rOut;
          const y = Math.sin(theta) * rOut;
          if (i === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
        }
        for (let i = nSegs; i >= 0; i--) {
          const theta = startA + (i / nSegs) * span;
          const x = Math.cos(theta) * rIn;
          const y = Math.sin(theta) * rIn;
          shape.lineTo(x, y);
        }
        shape.closePath();

        const geo = new THREE.ExtrudeGeometry(shape, {
          depth: 0.65,
          bevelEnabled: true,
          bevelSegments: 4,
          steps: 1,
          bevelSize: 0.045,
          bevelThickness: 0.045
        });
        geo.translate(0, 0, -0.325);

        const mat = new THREE.MeshStandardMaterial({
          color: sec.color,
          emissive: sec.emissive,
          emissiveIntensity: 0.55,
          metalness: 0.85,
          roughness: 0.18
        });
        const mesh = new THREE.Mesh(geo, mat);

        // Glowing Chamfer Rim Lines
        const edgeGeo = new THREE.EdgesGeometry(geo);
        const edgeLine = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({
          color: sec.emissive,
          transparent: true,
          opacity: 0.85
        }));
        mesh.add(edgeLine);

        // Individual Group for Vertical Lift & Radial Explosion
        const sliceGroup = new THREE.Group();
        sectorsGroup.add(sliceGroup);
        sliceGroup.add(mesh);

        // TANGIBLE 3D MODEL MOUNTED ON EACH SECTOR:
        const objectAnchorR = (rIn + rOut) / 2;
        const ox = Math.cos(midA) * objectAnchorR;
        const oy = Math.sin(midA) * objectAnchorR;

        const modelAnchor = new THREE.Group();
        modelAnchor.position.set(ox, oy, 0.38);
        mesh.add(modelAnchor);

        let dynamicModel = null;

        if (sIdx === 0) {
          // SECTOR 0 (45% SALES): Retail Expansion Beacon Tower
          const beaconBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.32, 0.38, 0.15, 24),
            new THREE.MeshStandardMaterial({ color: 0x07152b, metalness: 0.9, roughness: 0.1 })
          );
          beaconBase.rotation.x = Math.PI / 2;
          modelAnchor.add(beaconBase);

          const spire = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.22, 1.1, 16),
            new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x38bdf8, emissiveIntensity: 0.8, metalness: 0.4 })
          );
          spire.rotation.x = Math.PI / 2;
          spire.position.z = 0.55;
          modelAnchor.add(spire);

          const beaconOrb = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x00f0ff, emissiveIntensity: 1.5 })
          );
          beaconOrb.position.z = 1.15;
          modelAnchor.add(beaconOrb);
          dynamicModel = beaconOrb;

        } else if (sIdx === 1) {
          // SECTOR 1 (30% CLOUD & AI): Neural Server Cube
          const serverBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.32, 0.38, 0.15, 24),
            new THREE.MeshStandardMaterial({ color: 0x062817, metalness: 0.9, roughness: 0.1 })
          );
          serverBase.rotation.x = Math.PI / 2;
          modelAnchor.add(serverBase);

          const cubeMat = new THREE.MeshStandardMaterial({
            color: 0x065f46,
            emissive: 0x10b981,
            emissiveIntensity: 0.9,
            metalness: 0.7,
            roughness: 0.2
          });
          const cube = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), cubeMat);
          cube.position.z = 0.48;
          modelAnchor.add(cube);

          const cubeWire = new THREE.LineSegments(
            new THREE.EdgesGeometry(cube.geometry),
            new THREE.LineBasicMaterial({ color: 0x34d399, linewidth: 2 })
          );
          cube.add(cubeWire);
          dynamicModel = cube;

        } else if (sIdx === 2) {
          // SECTOR 2 (25% OPERATIONS & BUFFER): Gold Sovereign Coin Stack & Shield
          const shieldBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.32, 0.38, 0.15, 24),
            new THREE.MeshStandardMaterial({ color: 0x271704, metalness: 0.9, roughness: 0.1 })
          );
          shieldBase.rotation.x = Math.PI / 2;
          modelAnchor.add(shieldBase);

          // 3 Stacked Golden Coins
          const coinGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.09, 24);
          const coinMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.1 });
          [0.18, 0.29, 0.40].forEach(cz => {
            const coin = new THREE.Mesh(coinGeo, coinMat);
            coin.rotation.x = Math.PI / 2;
            coin.position.z = cz;
            modelAnchor.add(coin);
          });

          // Metallic Vault Shield
          const shield = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.32, 0),
            new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xb45309, emissiveIntensity: 0.5, metalness: 0.95 })
          );
          shield.position.z = 0.72;
          modelAnchor.add(shield);
          dynamicModel = shield;
        }

        // Floating Percentage Badge Tag
        const badgeGeo = new THREE.PlaneGeometry(1.2, 0.5);
        const badgeMat = new THREE.MeshBasicMaterial({
          map: makeBadgeDiscTexture(sec.pctText, sec.amountText, sec.accentHex),
          side: THREE.DoubleSide,
          transparent: true
        });
        const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
        badgeMesh.position.set(ox * 1.12, oy * 1.12, 0.85);
        mesh.add(badgeMesh);

        sectorNodes.push({
          idx: sIdx,
          sec: sec,
          group: sliceGroup,
          mesh: mesh,
          midA: midA,
          dynamicModel: dynamicModel,
          badge: badgeMesh,
          currentLift: 0,
          targetLift: 0,
          currentExplode: 0,
          targetExplode: 0
        });
      });

      // -------------------------------------------------------------
      // 3. CENTRAL CAPITAL VAULT CORE (175,000 EGP ASK)
      // -------------------------------------------------------------
      const coreGroup = new THREE.Group();
      coreGroup.position.set(0, 0, 0.15);
      rootGroup.add(coreGroup);

      // Elevated Central Dais
      const corePlinthGeo = new THREE.CylinderGeometry(1.35, 1.45, 0.35, 48);
      const corePlinthMat = new THREE.MeshStandardMaterial({
        color: 0x060d1b,
        metalness: 0.95,
        roughness: 0.15
      });
      const corePlinth = new THREE.Mesh(corePlinthGeo, corePlinthMat);
      corePlinth.rotation.x = Math.PI / 2;
      coreGroup.add(corePlinth);

      // Central Floating Faceted Golden Diamond Gem
      const gemGeo = new THREE.OctahedronGeometry(0.48, 0);
      const gemMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.75,
        metalness: 0.95,
        roughness: 0.08
      });
      const gemMesh = new THREE.Mesh(gemGeo, gemMat);
      gemMesh.position.z = 0.55;
      coreGroup.add(gemMesh);

      // Nested Orbital Gyroscope Rings
      const ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(0.85, 0.022, 16, 48),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.6, metalness: 0.9 })
      );
      ring1.position.z = 0.55;
      coreGroup.add(ring1);

      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(1.05, 0.022, 16, 48),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.6, metalness: 0.9 })
      );
      ring2.position.z = 0.55;
      ring2.rotation.x = Math.PI / 3;
      coreGroup.add(ring2);

      // Ultra-Crisp Floating HUD Disc for 175,000 EGP
      function makeCentralAskHudTexture() {
        const c = document.createElement('canvas');
        c.width = 480;
        c.height = 200;
        const ctx = c.getContext('2d');

        // Dark rounded glass HUD
        ctx.fillStyle = 'rgba(7, 15, 30, 0.95)';
        ctx.beginPath();
        ctx.roundRect(6, 6, 468, 188, 20);
        ctx.fill();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.font = 'bold 22px Cairo, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('🎯 المبلغ المطلوب (The Ask)', 240, 42);

        ctx.font = 'bold 56px Outfit, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('175,000', 240, 108);

        ctx.font = 'bold 24px Cairo, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText('جنيه مصري • Runway 12-18 شهر', 240, 158);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 8;
        return tex;
      }

      const hudGeo = new THREE.PlaneGeometry(1.75, 0.72);
      const hudMat = new THREE.MeshBasicMaterial({
        map: makeCentralAskHudTexture(),
        side: THREE.DoubleSide,
        transparent: true
      });
      const hudMesh = new THREE.Mesh(hudGeo, hudMat);
      hudMesh.position.set(0, -1.2, 0.85);
      coreGroup.add(hudMesh);

      // Ambient Financial Particle Motes
      const partGeo = new THREE.BufferGeometry();
      const partCount = 90;
      const posArray = new Float32Array(partCount * 3);
      for (let i = 0; i < partCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 16;
      }
      partGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const partMat = new THREE.PointsMaterial({ size: 0.075, color: 0x38bdf8, transparent: true, opacity: 0.65 });
      const particles = new THREE.Points(partGeo, partMat);
      rootGroup.add(particles);

      // -------------------------------------------------------------
      // 4. CAMERA TARGETS & INTERACTIVE SECTOR SELECTION
      // -------------------------------------------------------------
      const compCamTargets = [
        // 0: Sales Sector (45%) focus
        {
          camPos: new THREE.Vector3(0.0, 0.8, 10.5),
          lookAt: new THREE.Vector3(0.0, 0.5, 0.0)
        },
        // 1: Cloud & AI Sector (30%) focus
        {
          camPos: new THREE.Vector3(-1.4, -0.6, 10.5),
          lookAt: new THREE.Vector3(-0.9, -0.5, 0.0)
        },
        // 2: Operations & Runway Sector (25%) focus
        {
          camPos: new THREE.Vector3(1.4, -0.6, 10.5),
          lookAt: new THREE.Vector3(0.9, -0.5, 0.0)
        },
        // 3: Overview Centered View
        {
          camPos: new THREE.Vector3(0.0, 0.2, 11.5),
          lookAt: new THREE.Vector3(0.0, -0.1, 0.0)
        }
      ];

      let currentCamPos = new THREE.Vector3(0.0, 0.2, 11.5);
      let currentLookAt = new THREE.Vector3(0.0, -0.1, 0.0);
      let targetCamPos = compCamTargets[0].camPos.clone();
      let targetLookAt = compCamTargets[0].lookAt.clone();
      let currentSelectedIdx = 0;

      fundSelector = {
        select(idx) {
          currentSelectedIdx = idx;
          if (compCamTargets[idx]) {
            targetCamPos.copy(compCamTargets[idx].camPos);
            targetLookAt.copy(compCamTargets[idx].lookAt);
          }

          // Sector lift & radial explosion animation targets
          sectorNodes.forEach((node, i) => {
            if (i === idx) {
              node.targetLift = 0.55;     // Floating upwards!
              node.targetExplode = 0.75;  // Expanding outwards!
              node.mesh.material.emissiveIntensity = 0.95;
            } else {
              node.targetLift = 0.0;
              node.targetExplode = 0.0;
              node.mesh.material.emissiveIntensity = 0.35;
            }
          });

          // Sync Buttons & Cards
          for (let i = 0; i <= 2; i++) {
            const btn = document.getElementById('btn-fund-' + i);
            if (btn) {
              if (i === idx) btn.classList.add('active');
              else btn.classList.remove('active');
            }
            const card = document.getElementById('card-fund-' + i);
            if (card) {
              if (i === idx) card.classList.add('active');
              else card.classList.remove('active');
            }
          }
        }
      };

      // Set initial view: Sector 0 active
      fundSelector.select(0);

      // Direct Canvas Click Handling
      if (stageElem) {
        const raycaster = new THREE.Raycaster();
        const mouseVec = new THREE.Vector2();

        stageElem.addEventListener('click', (e) => {
          const rect = stageElem.getBoundingClientRect();
          mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouseVec.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
          raycaster.setFromCamera(mouseVec, camera);

          // Check click on sectors
          for (let i = 0; i < sectorNodes.length; i++) {
            const hits = raycaster.intersectObjects(sectorNodes[i].group.children, true);
            if (hits.length > 0) {
              fundSelector.select(i);
              return;
            }
          }

          // Click on central gem cycles next
          const hitCore = raycaster.intersectObjects(coreGroup.children, true);
          if (hitCore.length > 0) {
            fundSelector.select((currentSelectedIdx + 1) % 3);
          }
        });
      }

      // Return Smooth Animation Loop
      return {
        update(time) {
          // 1. Ultra-Smooth Cinematic Camera Glide
          currentCamPos.lerp(targetCamPos, 0.055);
          currentLookAt.lerp(targetLookAt, 0.055);

          const breath = Math.sin(time * 0.6) * 0.04;
          const pX = mouseX * 0.22;
          const pY = -mouseY * 0.12;
          camera.position.set(currentCamPos.x + pX, currentCamPos.y + breath + pY, currentCamPos.z);
          camera.lookAt(currentLookAt.x, currentLookAt.y, currentLookAt.z);

          // 2. Liquid Radial Explosion & Vertical Float per Sector
          sectorNodes.forEach(node => {
            node.currentLift += (node.targetLift - node.currentLift) * 0.075;
            node.currentExplode += (node.targetExplode - node.currentExplode) * 0.075;

            const ex = Math.cos(node.midA) * node.currentExplode;
            const ey = Math.sin(node.midA) * node.currentExplode;
            const ez = node.currentLift;
            node.group.position.set(ex, ey, ez);

            // Animate sector 3D object
            if (node.dynamicModel) {
              node.dynamicModel.rotation.z = time * 0.8;
            }

            // Billboard badges towards camera
            node.badge.lookAt(camera.position.x, camera.position.y, camera.position.z);
          });

          // 3. Central Vault Core Animation
          gemMesh.rotation.y = time * 0.7;
          gemMesh.rotation.x = Math.sin(time * 0.5) * 0.15;
          gemMesh.position.z = 0.55 + Math.sin(time * 1.8) * 0.04;

          ring1.rotation.x = time * 0.75;
          ring1.rotation.y = time * 0.5;
          ring2.rotation.y = -time * 0.65;
          ring2.rotation.z = time * 0.4;

          hudMesh.lookAt(camera.position.x, camera.position.y, camera.position.z);

          // 4. Currency Particles Floating Upward
          particles.rotation.y = time * 0.018;
        }
      };
    }

    window.selectFundSector = function(idx) {
      if (fundSelector) fundSelector.select(idx);
    };

    // --- Master Render Loop ---
    let lastTime = 0;
    function masterAnimate(now) {
      requestAnimationFrame(masterAnimate);
      const time = now * 0.001;

      // Animate active slide's scene
      const activeSlide = deck.currentIndex + 1;
      if (animators[activeSlide] && renderers[activeSlide] && scenes[activeSlide] && cameras[activeSlide]) {
        if (!deck.reducedMotion) {
          animators[activeSlide].update(time);
        }
        renderers[activeSlide].render(scenes[activeSlide], cameras[activeSlide]);
      }
    }

    // Initialize Deck & Scenes
    window.addEventListener('DOMContentLoaded', () => {
      // Build 3D scenes for all slides
      initThreeStage(1, buildSlide1Scene);
      initThreeStage(2, buildSlide2Scene);
      initThreeStage(3, buildSlide3Scene);
      initThreeStage(4, buildSlide4Scene);
      initThreeStage(5, buildSlide5Scene);
      initThreeStage(6, buildSlide6Scene);
      initThreeStage(7, buildSlide7Scene);
      initThreeStage(8, buildSlide8Scene);
      initThreeStage(9, buildSlide9Scene);
      initThreeStage(10, buildSlide10Scene);

      deck.init();

      requestAnimationFrame(masterAnimate);
    });
  </script>
</body>
</html>
`;

const outputPath1 = path.join(dir, 'index.html');
const outputPath2 = path.join(dir, 'hesabaty-investor-deck.html');
fs.writeFileSync(outputPath1, htmlContent, 'utf8');
fs.writeFileSync(outputPath2, htmlContent, 'utf8');

console.log('Successfully generated:', outputPath1);
console.log('Successfully generated:', outputPath2);
console.log('File size:', (fs.statSync(outputPath1).size / 1024).toFixed(2), 'KB');
