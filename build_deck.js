// build_deck.js - Generator for hesabaty-investor-deck.html
// Generates a single, self-contained 10-slide 3D investor presentation

const fs = require('fs');
const path = require('path');

const dir = __dirname;
const geoData = JSON.parse(fs.readFileSync(path.join(dir, 'geo_data.json'), 'utf8'));
const logoWordmarkB64 = fs.readFileSync(path.join(dir, 'images', 'image1_base64.txt'), 'utf8').trim();
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
        <img class="brand-logo-img" src="${logoWordmarkB64}" alt="حساباتي - Hesabaty">
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
          <div class="slide-kicker">Cloud Mini-ERP & Retail POS</div>
          <h1 class="slide-title">حساباتي <span class="highlight">| Hesabaty</span></h1>
          <p class="slide-subtitle">
            "نظام سحابي متكامل يساعد تجار التجزئة في مصر على إحكام السيطرة التامة على المخزون، المبيعات، الفواتير، والديون."
          </p>
          <p style="font-size: 0.95rem; color: var(--text-dim); margin-top: -1vh;">
            "One simple cloud ERP helping Egypt's retailers control inventory, sales, invoices, and debts."
          </p>

          <div class="feature-points">
            <div class="point-card">
              <div class="point-icon">📱</div>
              <div>
                <div class="point-title">صفر تكلفة عتاد (Zero-CapEx)</div>
                <div class="point-desc">استخدام كاميرا الهاتف لمسح الباركود بسرعة &lt; 1 ثانية بديلاً عن أجهزة الكاشير باهظة الثمن (15k-25k ج.م).</div>
              </div>
            </div>

            <div class="point-card">
              <div class="point-icon">⚡</div>
              <div>
                <div class="point-title">صمود تشغيلي بدون إنترنت (Offline-First)</div>
                <div class="point-desc">استمرار عمليات البيع وإصدار الفواتير محلياً مع مزامنة سحابية فورية وتلقائية عند عودة الاتصال.</div>
              </div>
            </div>

            <div class="point-card">
              <div class="point-icon">💬</div>
              <div>
                <div class="point-title">أتمتة الديون وفواتير الواتساب وتليجرام</div>
                <div class="point-desc">معالجة "نوتة الشكك" بمعيار FIFO وإرسال كشوف الحسابات المعتمدة ورموز QR آلياً للعملاء.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="visual-stage" id="stage-slide-1">
          <canvas class="visual-canvas" id="canvas-slide-1"></canvas>
        </div>
      </section>

      <!-- SLIDE 2: THE PROBLEM -->
      <section class="slide" id="slide-2" data-title="المشكلة | The Problem">
        <div class="slide-content">
          <div class="slide-kicker">Retail Operational Blindspots</div>
          <h2 class="slide-title">"لا يمكن للتجار إدارة ما لا يستطيعون <span class="highlight">رؤيته</span>"</h2>
          <p class="slide-subtitle">"Retailers can't manage what they can't see." — العمليات اليدوية والأدوات المشتتة تخفي الأخطاء وتعطل اتخاذ القرار.</p>

          <div class="feature-points">
            <div class="point-card">
              <div class="point-icon" style="color: var(--danger-accent);">📦</div>
              <div>
                <div class="point-title">تخبط وفقدان السيطرة على المخزون (Stock Uncertainty)</div>
                <div class="point-desc">سجلات غير دقيقة، فروقات جرد متكررة، وعجز عن تتبع وحدات القياس المتعددة وتواريخ الصلاحية.</div>
              </div>
            </div>

            <div class="point-card">
              <div class="point-icon" style="color: var(--amber-accent);">🧩</div>
              <div>
                <div class="point-title">تشتت العمليات والأنظمة (Fragmented Operations)</div>
                <div class="point-desc">إدارة المبيعات والفواتير والخزينة عبر دفاتر ورقية أو برمجيات قديمة لا تتيح الرؤية عن بُعد.</div>
              </div>
            </div>

            <div class="point-card">
              <div class="point-icon" style="color: var(--light-blue);">📑</div>
              <div>
                <div class="point-title">ضياع وتراكم ديون العملاء (Unclear Balances)</div>
                <div class="point-desc">صعوبة تحصيل "الشكك"، غياب تتبع مستحقات الموردين، وعدم معرفة حركة النقدية الفعلية داخل الدرج.</div>
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
          <div class="slide-kicker">Integrated Retail Cloud Core</div>
          <h2 class="slide-title">مساحة عمل واحدة. <span class="highlight">تحكم تشغيلي كامل.</span></h2>
          <p class="slide-subtitle">"One workspace. Full operational control." — ربط دورة المتجر اليومية في منظومة متكاملة واحدة.</p>

          <div class="feature-points">
            <div class="point-card">
              <div class="point-icon">🛒</div>
              <div>
                <div class="point-title">نقطة البيع السريعة (POS & Sales)</div>
                <div class="point-desc">واجهة سريعة باللغة العربية تدعم مسح الباركود بكاميرا الموبايل والعمل بدون إنترنت عبر IndexedDB.</div>
              </div>
            </div>

            <div class="point-card">
              <div class="point-icon">📊</div>
              <div>
                <div class="point-title">المخزون والوحدات المتعددة (Inventory & Batches)</div>
                <div class="point-desc">جرد فوري، دعم تتبع أرقام التشغيل والتواريخ، وتنبيهات ذكية بالنواقص لمنع ركود البضائع.</div>
              </div>
            </div>

            <div class="point-card">
              <div class="point-icon">🧾</div>
              <div>
                <div class="point-title">الفواتير والإيصال الإلكتروني (Invoices & Compliance)</div>
                <div class="point-desc">فواتير بيع وشراء ومرتجعات متوافقة كلياً مع منظومة الإيصال الإلكتروني وقانون 152 لسنة 2020.</div>
              </div>
            </div>

            <div class="point-card">
              <div class="point-icon">💰</div>
              <div>
                <div class="point-title">الديون والخزائن (Debts, Cash & Shifts)</div>
                <div class="point-desc">أتمتة كشوف حسابات العملاء والموردين بنظام FIFO مع إرسال فوري عبر WhatsApp & Telegram.</div>
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
          <div class="slide-kicker">Market Sizing & 3D Geography</div>
          <h2 class="slide-title">فرصة وطنية كبرى. <span class="highlight">انطلاق إقليمي مركز.</span></h2>
          <p class="slide-subtitle">"Large national opportunity. Focused regional entry. Measurable local expansion."</p>

          <div class="feature-points">
            <div class="point-card active" id="card-tam" onclick="focusMap('tam')">
              <div class="point-icon">🇪🇬</div>
              <div>
                <div class="point-title">TAM: جمهورية مصر العربية</div>
                <div class="point-desc"><strong>2.2 مليون</strong> منشأة تجارة تجزئة وجملة (54.4% من 3.858 مليون منشأة بالتعداد الاقتصادي 2022/2023) | فرصة سنوية: <strong>13.2B - 39.6B ج.م</strong>.</div>
              </div>
            </div>

            <div class="point-card" id="card-sam" onclick="focusMap('sam')">
              <div class="point-icon">🌊</div>
              <div>
                <div class="point-title">SAM: محافظة الإسكندرية والدلتا</div>
                <div class="point-desc"><strong>20,000 - 30,000</strong> متجر تجزئة منظم ومؤهل لتبني المنظومة السحابية | فرصة سنوية: <strong>168M - 252M ج.م</strong>.</div>
              </div>
            </div>

            <div class="point-card" id="card-som" onclick="focusMap('som')">
              <div class="point-icon">🎯</div>
              <div>
                <div class="point-title">SOM: نطاق الانطلاق بشرق الإسكندرية</div>
                <div class="point-desc"><strong>50 - 80 متجراً</strong> بالسنة الأولى (270k-720k ج.م)، مستهدفاً <strong>200 - 270 متجراً</strong> خلال 36 شهراً (1.2M - 4.8M ج.م ARR) في أحياء الرمل والمنتزه وسيدي جابر.</div>
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
          <div class="slide-kicker">SaaS Model & Unit Economics</div>
          <h2 class="slide-title">اشتراكات متكررة، <span class="highlight">تسعير للمنشأة.</span></h2>
          <p class="slide-subtitle">"Recurring revenue, priced per business." — باقات شهرية وسنوية واضحة للمتجر، لا لكل كاشير.</p>

          <div class="stat-row">
            <div class="stat-box" id="stat-tier-0" onclick="selectTier(0)">
              <div class="stat-num">500 <span style="font-size: 1rem;">ج.م/ش</span></div>
              <div class="stat-label">باقة Starter (5,000 ج/س)</div>
            </div>
            <div class="stat-box active" id="stat-tier-1" onclick="selectTier(1)">
              <div class="stat-num" style="color: var(--cyan-accent);">1,500 <span style="font-size: 1rem;">ج.م/ش</span></div>
              <div class="stat-label">باقة Pro (12,000 ج/س) ⭐</div>
            </div>
            <div class="stat-box" id="stat-tier-2" onclick="selectTier(2)">
              <div class="stat-num">مخصصة</div>
              <div class="stat-label">باقة Max AI & Branches</div>
            </div>
          </div>

          <div class="feature-points" style="margin-top: 1.5vh;">
            <div class="point-card">
              <div class="point-icon">🎯</div>
              <div>
                <div class="point-title">كفاءة الاستحواذ والقيمة الممتدة (CAC & LTV)</div>
                <div class="point-desc">تكلفة الاستحواذ <strong>CAC: 300 - 600 ج.م</strong> | القيمة الممتدة <strong>LTV: 9,665 - 10,000 ج.م</strong> | نسبة <strong>LTV/CAC = 16:1 إلى 32:1</strong>.</div>
              </div>
            </div>

            <div class="point-card">
              <div class="point-icon">⚖️</div>
              <div>
                <div class="point-title">نقطة التعادل وهوامش الربح (Margins & Breakeven)</div>
                <div class="point-desc">هامش ربح إجمالي <strong>Gross Margin ~90%</strong> | استرداد تكلفة العميل <strong>CAC Payback: &lt; شهر</strong> | التعادل عند <strong>20 مشتركاً مرجحاً</strong> فقط.</div>
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
          <div class="slide-kicker">3-Stage Commercial Expansion</div>
          <h2 class="slide-title">حسم النطاق الأولي. <span class="highlight">إثبات النموذج. التوسع.</span></h2>
          <p class="slide-subtitle">"Win one territory. Prove the model. Expand." — مسار تدريجي منخفض المخاطر وسريع التحقق.</p>

          <div class="feature-points">
            <div class="point-card active" id="card-gtm-0" onclick="selectGtmStage(0)">
              <div class="point-icon">1️⃣</div>
              <div>
                <div class="point-title">المرحلة الأولى: النفاذ الميداني المباشر (شرق الإسكندرية)</div>
                <div class="point-desc">زيارات ميدانية وعروض حية لكاميرا الهاتف بالشوارع التجارية (سموحة، ميامي، لوران) مع تجربة مجانية 14 يوماً وإعلانات Meta (100 ج/يوم).</div>
              </div>
            </div>

            <div class="point-card" id="card-gtm-1" onclick="selectGtmStage(1)">
              <div class="point-icon">2️⃣</div>
              <div>
                <div class="point-title">المرحلة الثانية: محركات الإحالة والشراكات المحلية</div>
                <div class="point-desc">منح شهر مجاني لكل متجر مُحال، وبناء شبكة شراكات مع المحاسبين المحليين وموردي طابعات ومعدات نقاط البيع.</div>
              </div>
            </div>

            <div class="point-card" id="card-gtm-2" onclick="selectGtmStage(2)">
              <div class="point-icon">3️⃣</div>
              <div>
                <div class="point-title">المرحلة الثالثة: التوسع الجغرافي والإقليمي</div>
                <div class="point-desc">التمدد نحو كامل الإسكندرية ومدن الدلتا والقاهرة الكبرى، تمهيداً للتوسع بدول الخليج (متطلبات ZATCA).</div>
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
          <div class="slide-kicker">Operational & Field Validation</div>
          <h2 class="slide-title">الأدلة الميدانية <span class="highlight">قبل التوسع.</span></h2>
          <p class="slide-subtitle">"Evidence before scale." — نموذج أولي مكتمل (MVP) تم التحقق من كفاءته التشغيلية والتقنية بالميدان.</p>

          <div class="stat-row">
            <div class="stat-box active" id="stat-val-0" onclick="selectValTest(0)" style="cursor: pointer;">
              <div class="stat-num">&lt; 1.0s</div>
              <div class="stat-label">سرعة قراءة الباركود بالموبايل</div>
            </div>
            <div class="stat-box" id="stat-val-1" onclick="selectValTest(1)" style="cursor: pointer;">
              <div class="stat-num">50/50</div>
              <div class="stat-label">فواتير أوفلاين تم مزامنتها بنجاح</div>
            </div>
            <div class="stat-box" id="stat-val-2" onclick="selectValTest(2)" style="cursor: pointer;">
              <div class="stat-num">5 CPAs</div>
              <div class="stat-label">محاسبين اعتمدوا التوافق الضريبي</div>
            </div>
          </div>

          <div class="feature-points" style="margin-top: 1.5vh;">
            <div class="point-card active" id="card-val-0" onclick="selectValTest(0)">
              <div class="point-icon">⚡</div>
              <div>
                <div class="point-title">سرعة مسح الباركود بهواتف اقتصادية (&lt; 1.0s)</div>
                <div class="point-desc">تجارب ميدانية في 10 محلات بقالة؛ استجابة لحظية في مختلف ظروف الإضاءة وفرت 20,000 ج.م على التاجر.</div>
              </div>
            </div>

            <div class="point-card" id="card-val-1" onclick="selectValTest(1)">
              <div class="point-icon">💾</div>
              <div>
                <div class="point-title">صمود الأوفلاين والمزامنة السحابية (IndexedDB)</div>
                <div class="point-desc">اختبار فصل الإنترنت بمتجر مزدوج الورديات وإصدار 50 فاتورة متتالية ومزامنتها بنجاح 100% فور عودة الشبكة.</div>
              </div>
            </div>

            <div class="point-card" id="card-val-2" onclick="selectValTest(2)">
              <div class="point-icon">⚖️</div>
              <div>
                <div class="point-title">التوافق والاعتماد الضريبي (قانون 152 للإيصال الإلكتروني)</div>
                <div class="point-desc">5 محاسبين قانونيين معتمدين فحصوا واعتمدوا تقارير المنصة ومطابقتها للضريبة المقطوعة والنسبية.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="visual-stage" id="stage-slide-7">
          <div class="map-controls-bar">
            <button class="map-btn active" id="btn-val-0" onclick="selectValTest(0)">⚡ سرعة الكاميرا &lt; 1s</button>
            <button class="map-btn" id="btn-val-1" onclick="selectValTest(1)">💾 صمود الأوفلاين 50/50</button>
            <button class="map-btn" id="btn-val-2" onclick="selectValTest(2)">⚖️ اعتماد 5 محاسبين</button>
          </div>
          <canvas class="visual-canvas" id="canvas-slide-7"></canvas>
        </div>
      </section>

      <!-- SLIDE 8: COMPETITION -->
      <section class="slide" id="slide-8" data-title="المنافسة والتموضع | Competition">
        <div class="slide-content">
          <div class="slide-kicker">Strategic Positioning</div>
          <h2 class="slide-title">مصمم للواقع اليومي <span class="highlight">للتجارة المصرية.</span></h2>
          <p class="slide-subtitle">"Built for the everyday reality of Egyptian retailers." — سد الفجوة بين البرامج القديمة والأنظمة المعقدة.</p>

          <div class="feature-points">
            <div class="point-card active" id="card-comp-0" onclick="selectCompLayer(0)">
              <div class="point-icon" style="color: var(--cyan-accent);">✨</div>
              <div>
                <div class="point-title">حساباتي: التميز الحاسم والريادة (تغطية 100%)</div>
                <div class="point-desc">0 ج.م أجهزة، مسح باركود بالموبايل &lt; 1s، صمود أوفلاين في IndexedDB، تتبع ديون FIFO، مشاركة واتساب وتليجرام، وتسعير محلي عادل بالجنيه.</div>
              </div>
            </div>

            <div class="point-card" id="card-comp-1" onclick="selectCompLayer(1)">
              <div class="point-icon">❌</div>
              <div>
                <div class="point-title">الأنظمة المكتبية التقليدية (RiseSoft / MegaStore)</div>
                <div class="point-desc">تكلفة أجهزة باهظة (15k-25k ج.م) + 10k رسوم ترقية، بدون سحابة، ولا يدعم العمل عبر الهاتف المحمول أو المتابعة عن بعد.</div>
              </div>
            </div>

            <div class="point-card" id="card-comp-2" onclick="selectCompLayer(2)">
              <div class="point-icon">⚠️</div>
              <div>
                <div class="point-title">أنظمة ERP السحابية الكبرى (دفترة / Odoo)</div>
                <div class="point-desc">تسعير دولاري مرتفع ($20-$50/شهر) مع رسوم إضافية على كل فرع ومستخدم، وتجربة معقدة تفتقر للمسح بالكاميرا ونظام الشكك.</div>
              </div>
            </div>

            <div class="point-card" id="card-comp-3" onclick="selectCompLayer(3)">
              <div class="point-icon">⚖️</div>
              <div>
                <div class="point-title">المقارنة الشاملة والفجوة الهيكلية المكتسحة</div>
                <div class="point-desc">حساباتي تنفرد بالجمع بين أقصى سهولة تشغيل يومية وأقل تكلفة امتلاك، وتلبي متطلبات 2.2 مليون منشأة تجزئة مصرية.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="visual-stage" id="stage-slide-8">
          <div class="map-controls-bar">
            <button class="map-btn active" id="btn-comp-0" onclick="selectCompLayer(0)">✨ حساباتي (100%)</button>
            <button class="map-btn" id="btn-comp-1" onclick="selectCompLayer(1)">❌ الأنظمة المكتبية</button>
            <button class="map-btn" id="btn-comp-2" onclick="selectCompLayer(2)">⚠️ أنظمة ERP الكبرى</button>
            <button class="map-btn" id="btn-comp-3" onclick="selectCompLayer(3)">⚖️ المقارنة الشاملة</button>
          </div>
          <canvas class="visual-canvas" id="canvas-slide-8"></canvas>
        </div>
      </section>

      <!-- SLIDE 9: TEAM -->
      <section class="slide" id="slide-9" data-title="فريق العمل | Team">
        <div class="slide-content">
          <div class="slide-kicker">Founder-Market Fit</div>
          <h2 class="slide-title">بُني برؤية هندسية <span class="highlight">تنفيذية تركز على المنتج.</span></h2>
          <p class="slide-subtitle">"Built with a product-first approach." — تكامل بين العمارة السحابية والخبرة المحاسبية والتشغيل الميداني.</p>

          <div class="feature-points">
            <div class="point-card active" id="card-team-0" onclick="selectTeamMember(0)">
              <div class="point-icon">👨‍💻</div>
              <div>
                <div class="point-title">محمد عمر رمضان — المؤسس والمدير التنفيذي والتقني (CEO & CTO)</div>
                <div class="point-desc">مهندس معماريات سحابية وتطبيقات ويب متقدمة (Next.js, Bun, IndexedDB, PostgreSQL)، يقود التطوير البرمجي والمبيعات الميدانية والتوسع بشرق الإسكندرية.</div>
              </div>
            </div>

            <div class="point-card" id="card-team-1" onclick="selectTeamMember(1)">
              <div class="point-icon">📈</div>
              <div>
                <div class="point-title">محمد نبيل أحمد — الشريك المؤسس والمدير المالي (CFO)</div>
                <div class="point-desc">خبير مالي ومحاسبي، يتولى النمذجة المالية وإدارة التكاليف وضمان المطابقة المحاسبية والضريبية لقانون 152 لسنة 2020 وتنسيق شبكة المحاسبين (CPAs).</div>
              </div>
            </div>

            <div class="point-card" id="card-team-2" onclick="selectTeamMember(2)">
              <div class="point-icon">⚡</div>
              <div>
                <div class="point-title">التكامل التنفيذي الحاسم (Founder-Market Synergy)</div>
                <div class="point-desc">تكامل فريد يجمع بين سرعة ابتكار وبناء المنتج (Product Velocity) والانضباط المالي والرقابي، مما يُحقق نقطة التعادل بأقل تكلفة تشغيلية.</div>
              </div>
            </div>

            <div class="point-card" id="card-team-3" onclick="selectTeamMember(3)">
              <div class="point-icon">🚀</div>
              <div>
                <div class="point-title">أولويات التوظيف والتوسع التشغيلي القادم</div>
                <div class="point-desc">مسؤول مبيعات وزيارات ميدانية لتكثيف النزول للشوارع التجارية، وأخصائي تهيئة ودعم فني لسرعة رفع الأصناف وتدريب الكاشيرات.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="visual-stage" id="stage-slide-9">
          <div class="map-controls-bar">
            <button class="map-btn active" id="btn-team-0" onclick="selectTeamMember(0)">👨‍💻 م/ محمد عمر</button>
            <button class="map-btn" id="btn-team-1" onclick="selectTeamMember(1)">📈 أ/ محمد نبيل</button>
            <button class="map-btn" id="btn-team-2" onclick="selectTeamMember(2)">⚡ تكامل الفريق</button>
            <button class="map-btn" id="btn-team-3" onclick="selectTeamMember(3)">🚀 خطة التوظيف</button>
            <button class="map-btn" id="btn-team-4" onclick="selectTeamMember(4)">🌐 نظرة شاملة</button>
          </div>
          <canvas class="visual-canvas" id="canvas-slide-9"></canvas>
        </div>
      </section>

      <!-- SLIDE 10: FINANCIALS & THE ASK -->
      <section class="slide" id="slide-10" data-title="الماليات والطلب الاستثماري | The Ask">
        <div class="slide-content">
          <div class="slide-kicker">Funding & Financial Outlook</div>
          <h2 class="slide-title">تمويل المرحلة القادمة <span class="highlight">من النمو المقاس.</span></h2>
          <p class="slide-subtitle">"Funding the next stage of measurable growth." — مسار واضح نحو الربحية والتوسع الميداني.</p>

          <div class="stat-row">
            <div class="stat-box" style="border-color: var(--cyan-accent); background: rgba(37, 99, 235, 0.2);">
              <div class="stat-num" style="color: var(--cyan-accent);">175,000 <span style="font-size: 1rem;">ج.م</span></div>
              <div class="stat-label">المبلغ المطلوب (The Ask)</div>
            </div>
            <div class="stat-box">
              <div class="stat-num">12 - 18</div>
              <div class="stat-label">أشهر Runway حتى الربحية</div>
            </div>
            <div class="stat-box">
              <div class="stat-num">50 - 80</div>
              <div class="stat-label">متاجر ممولة بالسنة الأولى</div>
            </div>
          </div>

          <div class="feature-points" style="margin-top: 1.2vh;">
            <div class="point-card" id="card-fund-0" onclick="selectFundSector(0)">
              <div class="point-icon" style="color: var(--cyan-accent);">📍</div>
              <div>
                <div class="point-title">المبيعات الميدانية والاستحواذ — 45% (78,750 ج.م)</div>
                <div class="point-desc">عمولات زيارات يومية للشوارع التجارية بشرق الإسكندرية (سموحة، ميامي، لوران) + حملات Meta Ads مستهدفة + مواد دعائية مطبوعة.</div>
              </div>
            </div>

            <div class="point-card" id="card-fund-1" onclick="selectFundSector(1)">
              <div class="point-icon" style="color: var(--emerald-accent);">⚡</div>
              <div>
                <div class="point-title">البنية السحابية ونماذج الذكاء الاصطناعي — 30% (52,500 ج.م)</div>
                <div class="point-desc">استضافة PostgreSQL وBun عالية الصمود، واجهات AI لمسح الفواتير الورقية والباركود، والتوافق مع منظومة الإيصال الإلكتروني.</div>
              </div>
            </div>

            <div class="point-card" id="card-fund-2" onclick="selectFundSector(2)">
              <div class="point-icon" style="color: var(--amber-accent);">👥</div>
              <div>
                <div class="point-title">التهيئة الميدانية وتدريب الكاشيرات — 15% (26,250 ج.م)</div>
                <div class="point-desc">رفع أول 1000 صنف للمحل وتدريب الكاشير في 30 دقيقة مجاناً، ودعم فني لحظي عبر واتساب وتليجرام لضمان عدم مغادرة أي عميل.</div>
              </div>
            </div>

            <div class="point-card" id="card-fund-3" onclick="selectFundSector(3)">
              <div class="point-icon" style="color: #a855f7;">🛡️</div>
              <div>
                <div class="point-title">احتياطي تشغيلي وسيولة أمان — 10% (17,500 ج.م)</div>
                <div class="point-desc">سيولة نقدية للطوارئ تضمن مدرج أمان (Runway) يمتد حتى 18 شهراً لتجاوز نقطة التعادل والوصول للربحية المستدامة.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="visual-stage" id="stage-slide-10">
          <div class="map-controls-bar">
            <button class="map-btn" id="btn-fund-0" onclick="selectFundSector(0)">📍 مبيعات (45%)</button>
            <button class="map-btn" id="btn-fund-1" onclick="selectFundSector(1)">⚡ سحابة وAI (30%)</button>
            <button class="map-btn" id="btn-fund-2" onclick="selectFundSector(2)">👥 تدريب (15%)</button>
            <button class="map-btn" id="btn-fund-3" onclick="selectFundSector(3)">🛡️ أمان (10%)</button>
            <button class="map-btn active" id="btn-fund-4" onclick="selectFundSector(4)">🌐 نظرة شاملة</button>
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
        this.updateSlide(0);
        this.setupEvents();
      },

      updateSlide(index) {
        if (index < 0 || index >= this.total) return;
        this.currentIndex = index;

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
          // Subtle hover for HUD badges
          hudDebt.position.y = 1.8 + Math.sin(time * 1.5) * 0.08;
          hudCapex.position.y = 2.4 + Math.sin(time * 1.5 + 1.0) * 0.08;
          hudStock.position.y = 1.8 + Math.sin(time * 1.5 + 2.0) * 0.08;

          // Blinking empty shelf alert slot
          const blink = Math.sin(time * 4) > 0;
          emptySlotLine.visible = blink;

          // Mouse Parallax across the entire retail counter
          const targetRotY = mouseX * 0.32 + Math.sin(time * 0.4) * 0.03;
          const targetRotX = -mouseY * 0.22 + 0.12 + Math.cos(time * 0.5) * 0.02;
          rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.08;
          rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.08;
        }
      };
    }

    // --- SLIDE 3: The Solution (Smartphone Hub & 4 Operational Pods) ---
    function buildSlide3Scene(scene, camera) {
      camera.position.set(0, 0, 15.5);
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

          // Mouse Parallax across the entire Solution scene
          const targetRotY = mouseX * 0.28 + Math.sin(time * 0.3) * 0.04;
          const targetRotX = -mouseY * 0.2 + Math.cos(time * 0.4) * 0.03;
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

    // --- SLIDE 5: 3D Interactive SaaS Tier Pedestals + Unit Economics Turbine ---
    let tierSelector = null;

    function buildSlide5Scene(scene, camera) {
      camera.position.set(0, 0.3, 11.8);
      camera.lookAt(0, -0.2, 0);

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

      // Lights
      const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
      dirLight.position.set(8, 14, 12);
      scene.add(dirLight);

      const cyanPoint = new THREE.PointLight(0x38bdf8, 1.8, 25);
      cyanPoint.position.set(0, 2, 6);
      scene.add(cyanPoint);

      const amberPoint = new THREE.PointLight(0xf59e0b, 1.2, 20);
      amberPoint.position.set(0, 4, 3);
      scene.add(amberPoint);

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
      // TEXTURE GENERATORS
      // ------------------------------------------

      // 1. Tier Card Texture
      function makeTierCardTexture(tierName, priceMonth, priceYear, bullets, accentColor, isPopular) {
        const c = document.createElement('canvas');
        c.width = 440;
        c.height = 260;
        const ctx = c.getContext('2d');

        // Background
        ctx.fillStyle = 'rgba(7, 17, 31, 0.95)';
        ctx.fillRect(0, 0, 440, 260);

        // Border
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = isPopular ? 5 : 3;
        ctx.strokeRect(2, 2, 436, 256);

        // Header bar
        ctx.fillStyle = isPopular ? 'rgba(14, 165, 233, 0.35)' : 'rgba(30, 58, 138, 0.3)';
        ctx.fillRect(0, 0, 440, 48);

        if (isPopular) {
          ctx.font = 'bold 14px Cairo, sans-serif';
          ctx.fillStyle = '#f59e0b';
          ctx.direction = 'rtl';
          ctx.fillText('⭐ الأكثر طلباً للمتاجر المنظمة', 420, 30);
        }

        // Tier Title
        ctx.font = 'bold 22px Cairo, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.direction = 'rtl';
        ctx.fillText(tierName, isPopular ? 180 : 420, 32);

        // Price Month
        ctx.font = 'bold 26px Cairo, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(priceMonth, 420, 95);

        // Price Year / Discount
        ctx.font = '15px Cairo, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(priceYear, 420, 130);

        // Divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(20, 145); ctx.lineTo(420, 145); ctx.stroke();

        // Bullets
        ctx.font = '14px Cairo, sans-serif';
        ctx.fillStyle = '#cbd5e1';
        bullets.forEach((b, idx) => {
          ctx.fillText('✓  ' + b, 420, 175 + idx * 26);
        });

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      // 2. Unit Economics Metric Badge Texture
      function makeMetricBadgeTexture(title, value, sub, accentColor, emoji) {
        const c = document.createElement('canvas');
        c.width = 380;
        c.height = 140;
        const ctx = c.getContext('2d');

        // Background
        ctx.fillStyle = 'rgba(11, 22, 44, 0.95)';
        ctx.fillRect(0, 0, 380, 140);

        // Border
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 376, 136);

        // Icon circle
        ctx.fillStyle = accentColor;
        ctx.beginPath(); ctx.arc(330, 70, 32, 0, Math.PI * 2); ctx.fill();
        ctx.font = '30px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(emoji, 315, 80);

        // Title
        ctx.font = 'bold 16px Cairo, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.direction = 'rtl';
        ctx.fillText(title, 280, 45);

        // Value
        ctx.font = 'bold 22px Cairo, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.fillText(value, 280, 82);

        // Subtitle
        ctx.font = '13px Cairo, sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(sub, 280, 115);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      // ------------------------------------------
      // 3D PEDESTALS CREATION
      // ------------------------------------------
      const pedestals = [];

      function createPedestal(config) {
        const pGroup = new THREE.Group();
        pGroup.position.set(config.x, config.baseY, config.z);
        rootGroup.add(pGroup);

        // Pedestal Cylinder Mesh
        const pedGeo = new THREE.CylinderGeometry(config.radiusTop, config.radiusBot, config.height, 32);
        const pedMat = new THREE.MeshStandardMaterial({
          color: config.color,
          emissive: config.emissive || 0x000000,
          emissiveIntensity: config.emissiveIntensity || 0.2,
          metalness: 0.85,
          roughness: 0.2
        });
        const pedMesh = new THREE.Mesh(pedGeo, pedMat);
        pedMesh.position.y = config.height / 2;
        pGroup.add(pedMesh);

        // Glowing Top Rim
        const rimGeo = new THREE.TorusGeometry(config.radiusTop * 1.02, 0.03, 16, 32);
        const rimMat = new THREE.MeshBasicMaterial({ color: config.rimColor });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.position.y = config.height;
        rim.rotation.x = Math.PI / 2;
        pGroup.add(rim);

        // Floating Card Badge
        const badgeGeo = new THREE.PlaneGeometry(config.badgeW, config.badgeH);
        const badgeMat = new THREE.MeshBasicMaterial({ map: config.badgeTexture, side: THREE.DoubleSide });
        const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
        badgeMesh.position.set(0, config.height + config.badgeOffsetY, 0.4);
        pGroup.add(badgeMesh);

        // Floating 3D Item on top
        const itemGroup = new THREE.Group();
        itemGroup.position.set(0, config.height + 0.35, 0);
        pGroup.add(itemGroup);
        if (config.buildItemFn) {
          config.buildItemFn(itemGroup);
        }

        pedestals.push({
          group: pGroup,
          baseY: config.baseY,
          targetY: config.baseY,
          itemGroup: itemGroup,
          rim: rim,
          idx: config.idx
        });
      }

      // 1. Starter Pedestal (Left: x = -3.2)
      createPedestal({
        idx: 0,
        x: -3.2,
        baseY: -2.7,
        z: 0,
        radiusTop: 1.35,
        radiusBot: 1.5,
        height: 2.2,
        color: 0x1d4ed8,
        emissive: 0x0f2d6b,
        emissiveIntensity: 0.3,
        rimColor: 0x60a5fa,
        badgeW: 2.3,
        badgeH: 1.35,
        badgeOffsetY: 1.15,
        badgeTexture: makeTierCardTexture(
          'باقة Starter',
          '500 ج.م / شهر',
          '5,000 ج.م / سنة (خصم 17%)',
          ['كاشير سريع ومسح باركود بالهاتف', 'مشاركة فورية للفواتير عبر واتساب', 'حفظ محلي وصمود أوفلاين كامل'],
          '#60a5fa',
          false
        ),
        buildItemFn(grp) {
          // Mini 3D Phone with Barcode laser
          const phone = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 1.0, 0.05),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
          );
          phone.position.set(0, 0, 0.35);
          grp.add(phone);
          const laser = new THREE.Mesh(
            new THREE.PlaneGeometry(0.48, 0.04),
            new THREE.MeshBasicMaterial({ color: 0x10b981 })
          );
          laser.position.z = 0.03;
          phone.add(laser);
        }
      });

      // 2. Pro Pedestal (Center: x = 0 - Recommended Hero)
      createPedestal({
        idx: 1,
        x: 0,
        baseY: -2.5,
        z: 0.35,
        radiusTop: 1.55,
        radiusBot: 1.7,
        height: 2.8,
        color: 0x0284c7,
        emissive: 0x0369a1,
        emissiveIntensity: 0.45,
        rimColor: 0x38bdf8,
        badgeW: 2.5,
        badgeH: 1.45,
        badgeOffsetY: 1.3,
        badgeTexture: makeTierCardTexture(
          'باقة Pro',
          '1,500 ج.م / شهر',
          '12,000 ج.م / سنة (خصم 33%)',
          ['إدارة المخزون والدفعات وتعدد الوحدات', 'تسوية رصيد الشكك بنظام FIFO الآلي', 'جاهزية الإيصال الإلكتروني وقانون 152/206'],
          '#38bdf8',
          true
        ),
        buildItemFn(grp) {
          // Multi-unit retail carton box + Golden crown ring
          const box = new THREE.Mesh(
            new THREE.BoxGeometry(0.75, 0.75, 0.75),
            new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 })
          );
          box.position.set(0, 0, 0.35);
          grp.add(box);

          // Golden Crown Ring
          const crown = new THREE.Mesh(
            new THREE.TorusGeometry(0.65, 0.035, 16, 32),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 })
          );
          crown.position.set(0, 0.65, 0.35);
          crown.rotation.x = Math.PI / 2;
          grp.add(crown);
          grp.userData.crown = crown;
        }
      });

      // 3. Max AI Pedestal (Right: x = +3.2)
      createPedestal({
        idx: 2,
        x: 3.2,
        baseY: -2.3,
        z: 0,
        radiusTop: 1.35,
        radiusBot: 1.5,
        height: 3.4,
        color: 0x4f46e5,
        emissive: 0x3730a3,
        emissiveIntensity: 0.35,
        rimColor: 0xa78bfa,
        badgeW: 2.3,
        badgeH: 1.35,
        badgeOffsetY: 1.15,
        badgeTexture: makeTierCardTexture(
          'باقة Max AI & Branches',
          'تسعير مخصص (Enterprise)',
          'عقود سنوية وتجهيز فروع',
          ['ربط سحابي للفروع المتعددة والمخازن', 'تنبؤ بالطلب والمشتريات بالذكاء الاصطناعي', 'بوابة الموردين ودعم مخصص VIP'],
          '#a78bfa',
          false
        ),
        buildItemFn(grp) {
          // AI Core: Icosahedron wireframe with golden core
          const ico = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.42, 1),
            new THREE.MeshStandardMaterial({ color: 0x818cf8, wireframe: true })
          );
          ico.position.set(0, 0, 0.35);
          grp.add(ico);
          const core = new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.6 })
          );
          core.position.set(0, 0, 0.35);
          grp.add(core);
          grp.userData.ico = ico;
        }
      });

      // ------------------------------------------
      // THREE UNIT ECONOMICS HOLOGRAPHIC GAUGES
      // ------------------------------------------
      function createGauge(texture, x, y, z) {
        const geo = new THREE.PlaneGeometry(2.4, 0.88);
        const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        rootGroup.add(mesh);
        return mesh;
      }

      // Gauge 1: Payback Speedometer (Left: aligned above Starter)
      const gaugePayback = createGauge(
        makeMetricBadgeTexture('سرعة استرداد التكلفة', '< شهر واحد', 'هامش ربح إجمالي ~90%', '#10b981', '⚡'),
        -3.2, 2.7, -0.2
      );

      // Gauge 2: LTV / CAC Multiplier (Center - Gold: aligned above Pro)
      const gaugeLtvCac = createGauge(
        makeMetricBadgeTexture('عائد استثنائي لرأس المال', '16x - 32x LTV/CAC', 'LTV: 10,000 ج.م | CAC: 300-600 ج.م', '#f59e0b', '🎯'),
        0, 3.4, 0.3
      );

      // Gauge 3: Breakeven Point (Right: aligned above Max AI)
      const gaugeBreakeven = createGauge(
        makeMetricBadgeTexture('الأمان المالي والتعادل', '20 متجراً فقط', 'تغطية التكاليف التشغيلية بالكامل', '#38bdf8', '⚖️'),
        3.2, 2.7, -0.2
      );

      // Ambient Particle Dust
      const partGeo = new THREE.BufferGeometry();
      const partCount = 70;
      const posArray = new Float32Array(partCount * 3);
      for (let i = 0; i < partCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 18;
      }
      partGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const partMat = new THREE.PointsMaterial({ size: 0.08, color: 0x38bdf8, transparent: true, opacity: 0.65 });
      const particles = new THREE.Points(partGeo, partMat);
      rootGroup.add(particles);

      // Camera Glide Targets for each Tier (Stepped back with gentle framing)
      const tierCamTargets = [
        // 0: Starter (Gently frames Starter while keeping full stage in view)
        {
          camPos: new THREE.Vector3(-1.8, 0.3, 11.5),
          lookAt: new THREE.Vector3(-1.2, -0.2, 0.0)
        },
        // 1: Pro (Hero center view with full breathing room)
        {
          camPos: new THREE.Vector3(0.0, 0.3, 11.8),
          lookAt: new THREE.Vector3(0.0, -0.2, 0.0)
        },
        // 2: Max AI (Gently frames Max AI while keeping full stage in view)
        {
          camPos: new THREE.Vector3(1.8, 0.3, 11.5),
          lookAt: new THREE.Vector3(1.2, -0.2, 0.0)
        }
      ];

      let currentCamPos = new THREE.Vector3(0.0, 0.3, 11.8);
      let currentLookAt = new THREE.Vector3(0.0, -0.2, 0.0);
      let targetCamPos = tierCamTargets[1].camPos.clone();
      let targetLookAt = tierCamTargets[1].lookAt.clone();

      // Selected Tier State (Default to Pro = 1)
      let currentSelectedTier = 1;

      tierSelector = {
        select(idx) {
          currentSelectedTier = idx;

          // Update camera glide targets
          if (tierCamTargets[idx]) {
            targetCamPos.copy(tierCamTargets[idx].camPos);
            targetLookAt.copy(tierCamTargets[idx].lookAt);
          }

          // Sync HTML stat-box active classes
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

          // Update pedestal target elevations
          pedestals.forEach(p => {
            if (p.idx === idx) {
              p.targetY = p.baseY + 0.45;
              p.rim.scale.set(1.15, 1.15, 1.15);
            } else {
              p.targetY = p.baseY;
              p.rim.scale.set(1.0, 1.0, 1.0);
            }
          });
        }
      };

      // Set initial state
      tierSelector.select(1);

      // Canvas click to select pedestal directly in 3D
      if (stageElem) {
        const raycaster = new THREE.Raycaster();
        const clickVec = new THREE.Vector2();
        stageElem.addEventListener('click', (e) => {
          const rect = stageElem.getBoundingClientRect();
          clickVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          clickVec.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
          raycaster.setFromCamera(clickVec, camera);

          pedestals.forEach(p => {
            const intersects = raycaster.intersectObjects(p.group.children, true);
            if (intersects.length > 0) {
              tierSelector.select(p.idx);
            }
          });
        });
      }

      return {
        update(time) {
          // Smooth Camera Gliding Lerp
          currentCamPos.lerp(targetCamPos, 0.055);
          currentLookAt.lerp(targetLookAt, 0.055);

          // Subtle Mouse Parallax offset
          const pX = mouseX * 0.22;
          const pY = -mouseY * 0.14;
          camera.position.set(currentCamPos.x + pX, currentCamPos.y + pY, currentCamPos.z);
          camera.lookAt(currentLookAt.x, currentLookAt.y, currentLookAt.z);

          // Smooth pedestal elevation interpolation
          pedestals.forEach(p => {
            p.group.position.y += (p.targetY - p.group.position.y) * 0.08;

            // Bobbing floating items on top
            p.itemGroup.position.y = (p.group.children[0].geometry.parameters.height || 2.5) + 0.35 + Math.sin(time * 2.2 + p.idx) * 0.08;

            // Pro crown rotation
            if (p.itemGroup.userData.crown) {
              p.itemGroup.userData.crown.rotation.z = time * 0.6;
            }
            // Max AI icosahedron rotation
            if (p.itemGroup.userData.ico) {
              p.itemGroup.userData.ico.rotation.y = time * 0.8;
              p.itemGroup.userData.ico.rotation.x = time * 0.4;
            }
          });

          // Floating gauges gentle hover
          gaugePayback.position.y = 2.7 + Math.sin(time * 1.5) * 0.06;
          gaugeLtvCac.position.y = 3.4 + Math.sin(time * 1.5 + 1.0) * 0.08;
          gaugeBreakeven.position.y = 2.7 + Math.sin(time * 1.5 + 2.0) * 0.06;

          // Particle drift
          particles.rotation.y = time * 0.02;
        }
      };
    }

    window.selectTier = function(idx) {
      if (tierSelector) tierSelector.select(idx);
    };

    // --- SLIDE 6: 3D Interactive Stepped Expansion Highway & Launchpad (GTM) ---
    let gtmSelector = null;

    function buildSlide6Scene(scene, camera) {
      camera.position.set(0, 0.2, 11.8);
      camera.lookAt(0, 0.0, 0);

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

      // Lights
      const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
      dirLight.position.set(6, 12, 10);
      scene.add(dirLight);

      const cyanLight = new THREE.PointLight(0x38bdf8, 1.6, 25);
      cyanLight.position.set(-2, 2, 6);
      scene.add(cyanLight);

      const amberLight = new THREE.PointLight(0xf59e0b, 1.4, 22);
      amberLight.position.set(2, 4, 5);
      scene.add(amberLight);

      // ------------------------------------------
      // TEXTURE GENERATORS FOR GTM CARDS & BADGES
      // ------------------------------------------
      function makeGtmCardTexture(stageNum, tag, title, bullets, targetText, accentColor) {
        const c = document.createElement('canvas');
        c.width = 460;
        c.height = 270;
        const ctx = c.getContext('2d');

        // Background
        ctx.fillStyle = 'rgba(7, 17, 31, 0.95)';
        ctx.fillRect(0, 0, 460, 270);

        // Border
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 3.5;
        ctx.strokeRect(2, 2, 456, 266);

        // Header bar
        ctx.fillStyle = 'rgba(30, 58, 138, 0.35)';
        ctx.fillRect(0, 0, 460, 48);

        // Stage Number badge
        ctx.font = 'bold 16px Cairo, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.direction = 'rtl';
        ctx.fillText(stageNum, 440, 32);

        // Tag
        ctx.font = '13px Cairo, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(tag, 230, 32);

        // Main Title
        ctx.font = 'bold 20px Cairo, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(title, 440, 85);

        // Divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(20, 102); ctx.lineTo(440, 102); ctx.stroke();

        // Bullets
        ctx.font = '14px Cairo, sans-serif';
        ctx.fillStyle = '#cbd5e1';
        bullets.forEach((b, idx) => {
          ctx.fillText(b, 440, 134 + idx * 28);
        });

        // Target Box at bottom
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(15, 202, 430, 50);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(15, 202, 430, 50);

        ctx.font = 'bold 15px Cairo, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.fillText(targetText, 430, 234);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      function makeBadgeIconTexture(emoji, label, color) {
        const c = document.createElement('canvas');
        c.width = 160;
        c.height = 160;
        const ctx = c.getContext('2d');

        ctx.fillStyle = 'rgba(11, 22, 44, 0.95)';
        ctx.beginPath(); ctx.arc(80, 80, 76, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.font = '54px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(emoji, 80, 75);

        ctx.font = 'bold 18px Cairo, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, 80, 122);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      // ------------------------------------------
      // CONNECTING ASCENDING NEON HIGHWAY
      // ------------------------------------------
      const highwayCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3.2, -1.8, 0.0),
        new THREE.Vector3(-1.6, -0.9, 0.25),
        new THREE.Vector3(0.0, 0.0, 0.2),
        new THREE.Vector3(1.6, 0.8, 0.25),
        new THREE.Vector3(3.2, 1.6, 0.0)
      ]);

      const highwayGeo = new THREE.TubeGeometry(highwayCurve, 50, 0.09, 12, false);
      const highwayMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x0369a1,
        emissiveIntensity: 0.6,
        metalness: 0.85,
        roughness: 0.2,
        transparent: true,
        opacity: 0.8
      });
      const highwayMesh = new THREE.Mesh(highwayGeo, highwayMat);
      rootGroup.add(highwayMesh);

      // Highway wireframe shell
      const hwWireMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.35 });
      const hwWireMesh = new THREE.Mesh(new THREE.TubeGeometry(highwayCurve, 50, 0.12, 8, false), hwWireMat);
      rootGroup.add(hwWireMesh);

      // Energetic Growth Transit Particles along the Highway
      const transitCount = 14;
      const transitSpheres = [];
      const particleGeo = new THREE.SphereGeometry(0.075, 12, 12);
      for (let i = 0; i < transitCount; i++) {
        const pMat = new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0x38bdf8 : 0xf59e0b
        });
        const pMesh = new THREE.Mesh(particleGeo, pMat);
        rootGroup.add(pMesh);
        transitSpheres.push({ mesh: pMesh, offset: i / transitCount });
      }

      // ------------------------------------------
      // THREE STEPPED STAGE PLATFORMS
      // ------------------------------------------
      const gtmStages = [];

      function createStagePodium(idx, x, baseY, z, radius, color, rimColor, badgeTexture, buildContentFn) {
        const sGroup = new THREE.Group();
        sGroup.position.set(x, baseY, z);
        rootGroup.add(sGroup);

        // Hex Podium Cylinder
        const podGeo = new THREE.CylinderGeometry(radius, radius * 1.1, 0.38, 6);
        const podMat = new THREE.MeshStandardMaterial({
          color: color,
          emissive: 0x031738,
          emissiveIntensity: 0.3,
          metalness: 0.9,
          roughness: 0.2
        });
        const podMesh = new THREE.Mesh(podGeo, podMat);
        sGroup.add(podMesh);

        // Glowing Hex Rim
        const rimGeo = new THREE.TorusGeometry(radius * 1.03, 0.035, 16, 6);
        const rimMat = new THREE.MeshBasicMaterial({ color: rimColor });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.position.y = 0.2;
        rim.rotation.x = Math.PI / 2;
        sGroup.add(rim);

        // Floating Info Card Badge
        const cardGeo = new THREE.PlaneGeometry(2.35, 1.38);
        const cardMat = new THREE.MeshBasicMaterial({ map: badgeTexture, side: THREE.DoubleSide });
        const cardMesh = new THREE.Mesh(cardGeo, cardMat);
        cardMesh.position.set(0, 1.55, 0.35);
        sGroup.add(cardMesh);

        // Content items container
        const contentGroup = new THREE.Group();
        contentGroup.position.set(0, 0.25, 0);
        sGroup.add(contentGroup);

        if (buildContentFn) {
          buildContentFn(contentGroup);
        }

        gtmStages.push({
          group: sGroup,
          baseY: baseY,
          targetY: baseY,
          rim: rim,
          contentGroup: contentGroup,
          idx: idx
        });
      }

      // --- STAGE 0: Direct Field Outreach (Beachhead: Eastern Alex) ---
      let phoneLaser = null;
      let waBeacon = null;
      createStagePodium(
        0,
        -3.2, -1.8, 0.0,
        1.55,
        0x1e3a8a,
        0x38bdf8,
        makeGtmCardTexture(
          '1️⃣ المرحلة الأولى',
          '📍 Beachhead: شرق الإسكندرية',
          'النفاذ الميداني المباشر',
          [
            '• عروض حية لكاميرا الهاتف أمام التاجر في دقيقتين',
            '• تركيز جغرافي بشوارع سموحة، ميامي، ولوران',
            '• إعلانات Meta موجهة Click-to-WhatsApp (100 ج/يوم)'
          ],
          '🎯 المستهدف: 10 - 30 متجراً مرجعياً وتجربة مجانية 14 يوماً',
          '#38bdf8'
        ),
        (grp) => {
          // Mini Retail Counter Desk
          const counter = new THREE.Mesh(
            new THREE.BoxGeometry(0.9, 0.2, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 })
          );
          counter.position.set(0, 0.1, 0.1);
          grp.add(counter);

          // Upright Smartphone
          const phone = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.62, 0.035),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 })
          );
          phone.position.set(-0.15, 0.48, 0.12);
          phone.rotation.y = 0.2;
          grp.add(phone);

          // Laser Scanning Beam
          phoneLaser = new THREE.Mesh(
            new THREE.PlaneGeometry(0.28, 0.03),
            new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide })
          );
          phoneLaser.position.set(0, 0, 0.025);
          phone.add(phoneLaser);

          // Floating WhatsApp Beacon Disc
          waBeacon = new THREE.Mesh(
            new THREE.CircleGeometry(0.26, 32),
            new THREE.MeshBasicMaterial({
              map: makeBadgeIconTexture('💬', 'واتساب', '#22c55e'),
              side: THREE.DoubleSide
            })
          );
          waBeacon.position.set(0.35, 0.65, 0.15);
          grp.add(waBeacon);

          // 3 Landmark Map Pins: Smouha, Miami, Loran
          const pinPositions = [
            { x: -0.45, z: -0.3, label: 'سموحة' },
            { x: 0.0, z: -0.45, label: 'ميامي' },
            { x: 0.45, z: -0.3, label: 'لوران' }
          ];
          pinPositions.forEach(pin => {
            const stem = new THREE.Mesh(
              new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8),
              new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
            );
            stem.position.set(pin.x, 0.2, pin.z);
            grp.add(stem);

            const head = new THREE.Mesh(
              new THREE.SphereGeometry(0.07, 12, 12),
              new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.7 })
            );
            head.position.set(pin.x, 0.38, pin.z);
            grp.add(head);
          });
        }
      );

      // --- STAGE 1: Viral Referral & Local Partner Ecosystem ---
      let flywheelRing = null;
      const partnerNodes = [];
      createStagePodium(
        1,
        0.0, 0.0, 0.2,
        1.65,
        0x0c4a6e,
        0xf59e0b,
        makeGtmCardTexture(
          '2️⃣ المرحلة الثانية',
          '🔄 Viral Referral & CPAs',
          'محركات الإحالة والشراكات',
          [
            '• شهر مجاني لكل متجر مُحال يضمن انتشاراً عضوياً ذاتياً',
            '• تحالفات مع المحاسبين القانونيين (CPAs) المعتمدين',
            '• شبكة موزعي طابعات الإيصالات وأجهزة نقاط البيع'
          ],
          '🎯 المستهدف: الوصول إلى 50 متجراً ونقطة التعادل المالي',
          '#f59e0b'
        ),
        (grp) => {
          // Central Referral Flywheel Outer Gear Ring
          flywheelRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.72, 0.045, 16, 32),
            new THREE.MeshStandardMaterial({
              color: 0xf59e0b,
              emissive: 0xd97706,
              emissiveIntensity: 0.5,
              metalness: 0.85,
              roughness: 0.2
            })
          );
          flywheelRing.position.set(0, 0.55, 0);
          flywheelRing.rotation.x = Math.PI / 2;
          grp.add(flywheelRing);

          // Flywheel Spokes
          for (let s = 0; s < 4; s++) {
            const spoke = new THREE.Mesh(
              new THREE.CylinderGeometry(0.018, 0.018, 1.4, 8),
              new THREE.MeshStandardMaterial({ color: 0xb45309 })
            );
            spoke.rotation.z = (s * Math.PI) / 4;
            spoke.position.y = 0.55;
            grp.add(spoke);
          }

          // Center Gift / Referral Coin
          const coin = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 0.05, 24),
            new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.1 })
          );
          coin.position.set(0, 0.55, 0);
          grp.add(coin);

          // 3 Orbiting Partner Satellites: CPAs, Hardware POS, Retailers
          const partners = [
            { emoji: '⚖️', label: 'المحاسبين', color: '#38bdf8' },
            { emoji: '🖨️', label: 'الموزعين', color: '#f59e0b' },
            { emoji: '🏪', label: 'المتاجر', color: '#10b981' }
          ];
          partners.forEach((p, idx) => {
            const nodeMesh = new THREE.Mesh(
              new THREE.CircleGeometry(0.22, 24),
              new THREE.MeshBasicMaterial({
                map: makeBadgeIconTexture(p.emoji, p.label, p.color),
                side: THREE.DoubleSide
              })
            );
            grp.add(nodeMesh);
            partnerNodes.push({ mesh: nodeMesh, baseAngle: (idx * Math.PI * 2) / 3, radius: 0.85 });
          });
        }
      );

      // --- STAGE 2: Regional Pan-Egypt & Gulf Expansion ---
      let globeWire = null;
      let globeCore = null;
      let zatcaShield = null;
      createStagePodium(
        2,
        3.2, 1.6, 0.0,
        1.55,
        0x312e81,
        0xa78bfa,
        makeGtmCardTexture(
          '3️⃣ المرحلة الثالثة',
          '🚀 National & Gulf Expansion',
          'التوسع الجغرافي والإقليمي',
          [
            '• التمدد لكامل الإسكندرية، مدن الدلتا، والقاهرة الكبرى',
            '• استهداف قطاع التجزئة الوطني (2.2 مليون منشأة تجارية)',
            '• التوسع بأسواق الخليج (معايير الفوترة ZATCA بالسعودية)'
          ],
          '🎯 المستهدف: 80 - 270 متجراً نشطاً وحصة سوقية رائدة',
          '#a78bfa'
        ),
        (grp) => {
          // 3D Holographic Globe
          globeWire = new THREE.Mesh(
            new THREE.SphereGeometry(0.62, 18, 18),
            new THREE.MeshStandardMaterial({
              color: 0x818cf8,
              wireframe: true,
              transparent: true,
              opacity: 0.65
            })
          );
          globeWire.position.set(0, 0.65, 0);
          globeWire.rotation.z = 0.41; // Earth axial tilt
          grp.add(globeWire);

          // Inner Glowing Core
          globeCore = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 16, 16),
            new THREE.MeshStandardMaterial({
              color: 0x4f46e5,
              emissive: 0x3730a3,
              emissiveIntensity: 0.8,
              roughness: 0.3
            })
          );
          globeCore.position.set(0, 0.65, 0);
          grp.add(globeCore);

          // ZATCA / Tax Compliance Floating Shield
          zatcaShield = new THREE.Mesh(
            new THREE.CircleGeometry(0.24, 6),
            new THREE.MeshBasicMaterial({
              map: makeBadgeIconTexture('🛡️', 'ZATCA', '#10b981'),
              side: THREE.DoubleSide
            })
          );
          zatcaShield.position.set(0.65, 0.85, 0.2);
          grp.add(zatcaShield);

          // Ascending Expansion Laser Arcs towards Egypt & Gulf
          const arcGeo = new THREE.TorusGeometry(0.85, 0.02, 12, 48, Math.PI);
          const arcMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 });
          const arc = new THREE.Mesh(arcGeo, arcMat);
          arc.position.set(0, 0.65, 0);
          arc.rotation.y = 0.6;
          grp.add(arc);
        }
      );

      // Ambient Space Dust
      const dustGeo = new THREE.BufferGeometry();
      const dustCount = 80;
      const dustPos = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount * 3; i++) {
        dustPos[i] = (Math.random() - 0.5) * 18;
      }
      dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
      const dustMat = new THREE.PointsMaterial({ size: 0.075, color: 0x38bdf8, transparent: true, opacity: 0.6 });
      const dustParticles = new THREE.Points(dustGeo, dustMat);
      rootGroup.add(dustParticles);

      // ------------------------------------------
      // CAMERA GLIDE TARGETS FOR THE 3 STAGES
      // ------------------------------------------
      const gtmCamTargets = [
        // 0: Stage 1 (Direct Field Outreach)
        {
          camPos: new THREE.Vector3(-1.8, -0.4, 11.2),
          lookAt: new THREE.Vector3(-1.4, -0.7, 0.0)
        },
        // 1: Stage 2 (Viral Referral & CPAs)
        {
          camPos: new THREE.Vector3(0.0, 0.2, 11.6),
          lookAt: new THREE.Vector3(0.0, 0.0, 0.0)
        },
        // 2: Stage 3 (National & Gulf Expansion)
        {
          camPos: new THREE.Vector3(1.8, 0.8, 11.2),
          lookAt: new THREE.Vector3(1.4, 0.5, 0.0)
        }
      ];

      let currentCamPos = new THREE.Vector3(-1.8, -0.4, 11.2);
      let currentLookAt = new THREE.Vector3(-1.4, -0.7, 0.0);
      let targetCamPos = gtmCamTargets[0].camPos.clone();
      let targetLookAt = gtmCamTargets[0].lookAt.clone();

      // Selector controller
      gtmSelector = {
        select(idx) {
          if (gtmCamTargets[idx]) {
            targetCamPos.copy(gtmCamTargets[idx].camPos);
            targetLookAt.copy(gtmCamTargets[idx].lookAt);
          }

          // Sync buttons & right-hand cards
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

          // Elevate selected platform
          gtmStages.forEach(st => {
            if (st.idx === idx) {
              st.targetY = st.baseY + 0.35;
              st.rim.scale.set(1.15, 1.15, 1.15);
            } else {
              st.targetY = st.baseY;
              st.rim.scale.set(1.0, 1.0, 1.0);
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

          gtmStages.forEach(st => {
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

          // Elevate platforms smoothly
          gtmStages.forEach(st => {
            st.group.position.y += (st.targetY - st.group.position.y) * 0.08;
          });

          // Pulse growth transit spheres along highway
          transitSpheres.forEach(ts => {
            const t = (time * 0.12 + ts.offset) % 1.0;
            const pt = highwayCurve.getPointAt(t);
            ts.mesh.position.copy(pt);
          });

          // Stage 0: Phone barcode laser scanning sweep
          if (phoneLaser) {
            phoneLaser.position.y = Math.sin(time * 3.5) * 0.22;
          }
          if (waBeacon) {
            waBeacon.position.y = 0.65 + Math.sin(time * 2.0) * 0.05;
          }

          // Stage 1: Flywheel rotation & satellite orbit
          if (flywheelRing) {
            flywheelRing.rotation.z = time * 0.5;
          }
          partnerNodes.forEach(pn => {
            const angle = pn.baseAngle + time * 0.6;
            pn.mesh.position.set(Math.cos(angle) * pn.radius, 0.55 + Math.sin(time * 2.5 + pn.baseAngle) * 0.04, Math.sin(angle) * pn.radius * 0.5);
          });

          // Stage 2: Globe rotation & shield hover
          if (globeWire) {
            globeWire.rotation.y = time * 0.4;
          }
          if (globeCore) {
            globeCore.rotation.y = -time * 0.2;
          }
          if (zatcaShield) {
            zatcaShield.position.y = 0.85 + Math.sin(time * 2.0 + 1.0) * 0.05;
          }

          // Dust particle gentle drift
          dustParticles.rotation.y = time * 0.02;
        }
      };
    }

    window.selectGtmStage = function(idx) {
      if (gtmSelector) gtmSelector.select(idx);
    };

    // --- SLIDE 7: 3D Interactive Validation Lab & Live Stress-Test Console ---
    let valSelector = null;

    function buildSlide7Scene(scene, camera) {
      camera.position.set(0, 0.25, 11.8);
      camera.lookAt(0, -0.2, 0);

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
      const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
      dirLight.position.set(6, 12, 10);
      scene.add(dirLight);

      const emeraldLight = new THREE.PointLight(0x10b981, 1.8, 22);
      emeraldLight.position.set(-3, 2, 5);
      scene.add(emeraldLight);

      const cyanLight = new THREE.PointLight(0x38bdf8, 1.8, 25);
      cyanLight.position.set(0, 3, 6);
      scene.add(cyanLight);

      const goldLight = new THREE.PointLight(0xf59e0b, 1.6, 22);
      goldLight.position.set(3, 2, 5);
      scene.add(goldLight);

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
      disc.add(new THREE.LineSegments(discEdge, new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.4 })));

      // ------------------------------------------
      // TEXTURE GENERATOR FOR VALIDATION CARDS
      // ------------------------------------------
      function makeValCardTexture(badgeTitle, tag, headline, bullets, resultText, accentColor) {
        const c = document.createElement('canvas');
        c.width = 460;
        c.height = 270;
        const ctx = c.getContext('2d');

        // Background
        ctx.fillStyle = 'rgba(7, 17, 31, 0.95)';
        ctx.fillRect(0, 0, 460, 270);

        // Border
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 3.5;
        ctx.strokeRect(2, 2, 456, 266);

        // Header bar
        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.fillRect(0, 0, 460, 48);

        // Stage / Test Title
        ctx.font = 'bold 16px Cairo, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.direction = 'rtl';
        ctx.fillText(badgeTitle, 440, 32);

        // Tag
        ctx.font = '13px Cairo, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(tag, 220, 32);

        // Main Title
        ctx.font = 'bold 20px Cairo, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(headline, 440, 85);

        // Divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(20, 102); ctx.lineTo(440, 102); ctx.stroke();

        // Bullets
        ctx.font = '14px Cairo, sans-serif';
        ctx.fillStyle = '#cbd5e1';
        bullets.forEach((b, idx) => {
          ctx.fillText(b, 440, 134 + idx * 28);
        });

        // Result Box at bottom
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(15, 202, 430, 50);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(15, 202, 430, 50);

        ctx.font = 'bold 15px Cairo, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.fillText(resultText, 430, 234);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      function makeBadgeDiscTexture(emoji, val, label, color) {
        const c = document.createElement('canvas');
        c.width = 180;
        c.height = 180;
        const ctx = c.getContext('2d');

        ctx.fillStyle = 'rgba(11, 22, 44, 0.95)';
        ctx.beginPath(); ctx.arc(90, 90, 86, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.font = '40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(emoji, 90, 60);

        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = color;
        ctx.fillText(val, 90, 105);

        ctx.font = 'bold 16px Cairo, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, 90, 142);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      // ------------------------------------------
      // THREE VALIDATION STATIONS
      // ------------------------------------------
      const valStations = [];

      function createValStation(idx, x, baseY, z, radius, color, rimColor, badgeTexture, buildContentFn) {
        const sGroup = new THREE.Group();
        sGroup.position.set(x, baseY, z);
        rootGroup.add(sGroup);

        // Hex Base Podium
        const podGeo = new THREE.CylinderGeometry(radius, radius * 1.1, 0.38, 6);
        const podMat = new THREE.MeshStandardMaterial({
          color: color,
          emissive: 0x052e16,
          emissiveIntensity: 0.3,
          metalness: 0.9,
          roughness: 0.2
        });
        const podMesh = new THREE.Mesh(podGeo, podMat);
        sGroup.add(podMesh);

        // Glowing Rim
        const rimGeo = new THREE.TorusGeometry(radius * 1.03, 0.035, 16, 6);
        const rimMat = new THREE.MeshBasicMaterial({ color: rimColor });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.position.y = 0.2;
        rim.rotation.x = Math.PI / 2;
        sGroup.add(rim);

        // Floating Info Card Badge
        const cardGeo = new THREE.PlaneGeometry(2.35, 1.38);
        const cardMat = new THREE.MeshBasicMaterial({ map: badgeTexture, side: THREE.DoubleSide });
        const cardMesh = new THREE.Mesh(cardGeo, cardMat);
        cardMesh.position.set(0, 1.55, 0.35);
        sGroup.add(cardMesh);

        // Content Container
        const contentGroup = new THREE.Group();
        contentGroup.position.set(0, 0.25, 0);
        sGroup.add(contentGroup);

        if (buildContentFn) {
          buildContentFn(contentGroup);
        }

        valStations.push({
          group: sGroup,
          baseY: baseY,
          targetY: baseY,
          rim: rim,
          contentGroup: contentGroup,
          idx: idx
        });
      }

      // --- STATION 0: Scanner Speed Benchmark (< 1.0s) ---
      let scanLaser = null;
      let speedBadge = null;
      createValStation(
        0,
        -3.2, -2.6, 0.0,
        1.45,
        0x064e3b,
        0x10b981,
        makeValCardTexture(
          '⚡ اختبار سرعة المسح بالكاميرا',
          '📱 Mobile Barcode Engine',
          'استجابة فورية بأقل من ثانية واحدة',
          [
            '• قراءة فورية باستخدام كاميرا هواتف اقتصادية بـ 10 بقالات',
            '• كفاءة عالية تحت ظروف الإضاءة الضعيفة والمائلة والمهتزة',
            '• صفر تكلفة أجهزة كاشير أو قارئات ليزر خارجية متخصصة'
          ],
          '✅ النتيجة: وفر 20,000 ج.م على التاجر وسجل زمناً < 1.0s',
          '#10b981'
        ),
        (grp) => {
          // Mini Counter Table
          const table = new THREE.Mesh(
            new THREE.BoxGeometry(0.85, 0.18, 0.48),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 })
          );
          table.position.set(0, 0.09, 0.1);
          grp.add(table);

          // Retail product box with barcode
          const box = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.26, 0.22),
            new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 })
          );
          box.position.set(0.18, 0.28, 0.1);
          grp.add(box);

          // Upright Smartphone
          const phone = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.62, 0.035),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 })
          );
          phone.position.set(-0.16, 0.46, 0.12);
          phone.rotation.y = 0.22;
          grp.add(phone);

          // Live Animated Laser Scanning Beam
          scanLaser = new THREE.Mesh(
            new THREE.PlaneGeometry(0.28, 0.035),
            new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide })
          );
          scanLaser.position.set(0, 0, 0.025);
          phone.add(scanLaser);

          // Floating Speed Meter Badge: < 0.85s
          speedBadge = new THREE.Mesh(
            new THREE.CircleGeometry(0.28, 32),
            new THREE.MeshBasicMaterial({
              map: makeBadgeDiscTexture('⚡', '< 0.85s', 'سرعة المسح', '#10b981'),
              side: THREE.DoubleSide
            })
          );
          speedBadge.position.set(0.42, 0.68, 0.15);
          grp.add(speedBadge);
        }
      );

      // --- STATION 1: Offline Resilience & Cloud Sync (50/50 IndexedDB) ---
      let dbGlass = null;
      let syncPulseParticles = [];
      const invoiceCubes = [];
      let cloudMesh = null;
      createValStation(
        1,
        0.0, -2.3, 0.3,
        1.6,
        0x0c4a6e,
        0x38bdf8,
        makeValCardTexture(
          '💾 اختبار صمود الأوفلاين والمزامنة',
          '🧪 IndexedDB + Cloud Sync',
          'بيع مستمر بدون انقطاع ومزامنة 100%',
          [
            '• فصل شبكة الإنترنت في متجر مزدوج الورديات بالكامل',
            '• إصدار 50 فاتورة متتالية وتخزينها محلياً في IndexedDB',
            '• مزامنة فورية وتلقائية بالكامل فور عودة الشبكة للسحابة'
          ],
          '✅ النتيجة: 50 / 50 فاتورة تمت مزامنتها بنجاح دون أي خطأ',
          '#38bdf8'
        ),
        (grp) => {
          // Glass Cylinder (IndexedDB Vault)
          const glassGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.95, 32);
          const glassMat = new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            transparent: true,
            opacity: 0.35,
            metalness: 0.8,
            roughness: 0.1
          });
          dbGlass = new THREE.Mesh(glassGeo, glassMat);
          dbGlass.position.set(0, 0.52, 0);
          grp.add(dbGlass);

          // Top & bottom metallic rings on the glass vault
          const vRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.69, 0.025, 16, 32), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
          vRing1.position.set(0, 0.05, 0); vRing1.rotation.x = Math.PI / 2; grp.add(vRing1);
          const vRing2 = new THREE.Mesh(new THREE.TorusGeometry(0.69, 0.025, 16, 32), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
          vRing2.position.set(0, 0.98, 0); vRing2.rotation.x = Math.PI / 2; grp.add(vRing2);

          // 5 Stacked Glowing Invoices inside IndexedDB
          for (let i = 0; i < 5; i++) {
            const cube = new THREE.Mesh(
              new THREE.BoxGeometry(0.48, 0.08, 0.48),
              new THREE.MeshStandardMaterial({
                color: 0x38bdf8,
                emissive: 0x0284c7,
                emissiveIntensity: 0.6,
                roughness: 0.2
              })
            );
            cube.position.set(0, 0.22 + i * 0.14, 0);
            grp.add(cube);
            invoiceCubes.push(cube);
          }

          // Floating Stylized Cloud at top
          cloudMesh = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.28, 1),
            new THREE.MeshStandardMaterial({ color: 0x38bdf8, wireframe: true })
          );
          cloudMesh.position.set(0, 1.35, 0);
          grp.add(cloudMesh);

          // Cloud Sync Laser Stream Particles
          const syncPCount = 8;
          const pGeo = new THREE.SphereGeometry(0.045, 8, 8);
          const pMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
          for (let p = 0; p < syncPCount; p++) {
            const sp = new THREE.Mesh(pGeo, pMat);
            grp.add(sp);
            syncPulseParticles.push({ mesh: sp, offset: p / syncPCount });
          }

          // Badge: 50/50 Synced
          const syncBadge = new THREE.Mesh(
            new THREE.CircleGeometry(0.28, 32),
            new THREE.MeshBasicMaterial({
              map: makeBadgeDiscTexture('☁️', '50 / 50', 'مزامنة كاملة', '#38bdf8'),
              side: THREE.DoubleSide
            })
          );
          syncBadge.position.set(0.65, 0.65, 0.15);
          grp.add(syncBadge);
        }
      );

      // --- STATION 2: Accounting & Egyptian Tax Law 152 (5 CPAs Certified) ---
      let scaleBeam = null;
      let scalePanLeft = null;
      let scalePanRight = null;
      const cpaSeals = [];
      let taxShield = null;
      createValStation(
        2,
        3.2, -2.6, 0.0,
        1.45,
        0x312e81,
        0xf59e0b,
        makeValCardTexture(
          '⚖️ التحقق والمطابقة المحاسبية',
          '📜 Egyptian Tax Law 152',
          'اعتماد 5 محاسبين قانونيين معتمدين',
          [
            '• مطابقة تقارير حجم الأعمال للضريبة المقطوعة والنسبية',
            '• جاهزية تامة لمنظومة الإيصال والفاتورة الإلكترونية B2C',
            '• تسوية وتدقيق حركة الخزن ونظام ديون FIFO للعملاء'
          ],
          '✅ النتيجة: اعتماد رسمي كامل وتوافق تام مع قانون 152',
          '#f59e0b'
        ),
        (grp) => {
          // 3D Golden Balance Scales
          const pillar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.045, 0.85, 12),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 })
          );
          pillar.position.set(0, 0.45, 0);
          grp.add(pillar);

          // Horizontal Beam
          scaleBeam = new THREE.Mesh(
            new THREE.CylinderGeometry(0.018, 0.018, 0.75, 8),
            new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.1 })
          );
          scaleBeam.position.set(0, 0.82, 0);
          scaleBeam.rotation.z = Math.PI / 2;
          grp.add(scaleBeam);

          // Left Pan
          scalePanLeft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.02, 0.05, 16),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 })
          );
          scalePanLeft.position.set(-0.35, 0.62, 0);
          grp.add(scalePanLeft);

          // Right Pan
          scalePanRight = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.02, 0.05, 16),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 })
          );
          scalePanRight.position.set(0.35, 0.62, 0);
          grp.add(scalePanRight);

          // Tax Law 152 Shield
          taxShield = new THREE.Mesh(
            new THREE.CircleGeometry(0.24, 6),
            new THREE.MeshBasicMaterial({
              map: makeBadgeDiscTexture('📜', 'قانون 152', 'إيصال إلكتروني', '#f59e0b'),
              side: THREE.DoubleSide
            })
          );
          taxShield.position.set(0, 1.15, 0.1);
          grp.add(taxShield);

          // 5 Orbiting CPA Certified Seals
          for (let s = 0; s < 5; s++) {
            const sealMesh = new THREE.Mesh(
              new THREE.CircleGeometry(0.11, 16),
              new THREE.MeshBasicMaterial({
                map: makeBadgeDiscTexture('✓', \`CPA \${s + 1}\`, 'معتمد', '#10b981'),
                side: THREE.DoubleSide
              })
            );
            grp.add(sealMesh);
            cpaSeals.push({ mesh: sealMesh, baseAngle: (s * Math.PI * 2) / 5, radius: 0.65 });
          }
        }
      );

      // Ambient Space Particles
      const partGeo = new THREE.BufferGeometry();
      const partCount = 75;
      const posArray = new Float32Array(partCount * 3);
      for (let i = 0; i < partCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 18;
      }
      partGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const partMat = new THREE.PointsMaterial({ size: 0.075, color: 0x10b981, transparent: true, opacity: 0.65 });
      const particles = new THREE.Points(partGeo, partMat);
      rootGroup.add(particles);

      // ------------------------------------------
      // CAMERA GLIDE TARGETS FOR THE 3 STATIONS
      // ------------------------------------------
      const valCamTargets = [
        // 0: Scanner Speed Benchmark (< 1.0s)
        {
          camPos: new THREE.Vector3(-1.8, 0.05, 11.3),
          lookAt: new THREE.Vector3(-1.3, -0.4, 0.0)
        },
        // 1: Offline Resilience & Sync (50/50)
        {
          camPos: new THREE.Vector3(0.0, 0.25, 11.6),
          lookAt: new THREE.Vector3(0.0, -0.2, 0.0)
        },
        // 2: 5 CPAs & Law 152
        {
          camPos: new THREE.Vector3(1.8, 0.05, 11.3),
          lookAt: new THREE.Vector3(1.3, -0.4, 0.0)
        }
      ];

      let currentCamPos = new THREE.Vector3(-1.8, 0.05, 11.3);
      let currentLookAt = new THREE.Vector3(-1.3, -0.4, 0.0);
      let targetCamPos = valCamTargets[0].camPos.clone();
      let targetLookAt = valCamTargets[0].lookAt.clone();

      valSelector = {
        select(idx) {
          if (valCamTargets[idx]) {
            targetCamPos.copy(valCamTargets[idx].camPos);
            targetLookAt.copy(valCamTargets[idx].lookAt);
          }

          // Sync buttons, stat-boxes & right cards
          [0, 1, 2].forEach(i => {
            const btn = document.getElementById('btn-val-' + i);
            if (btn) {
              if (i === idx) btn.classList.add('active');
              else btn.classList.remove('active');
            }
            const stat = document.getElementById('stat-val-' + i);
            if (stat) {
              if (i === idx) stat.classList.add('active');
              else stat.classList.remove('active');
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
              st.targetY = st.baseY + 0.38;
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

          // Station 0: Live Barcode Laser Scanning Sweep
          if (scanLaser) {
            scanLaser.position.y = Math.sin(time * 3.8) * 0.22;
          }
          if (speedBadge) {
            speedBadge.position.y = 0.68 + Math.sin(time * 2.2) * 0.04;
          }

          // Station 1: Cloud laser sync particle flow
          syncPulseParticles.forEach(sp => {
            const frac = (time * 0.7 + sp.offset) % 1.0;
            sp.mesh.position.set(0, 0.98 + frac * 0.38, 0);
          });
          if (cloudMesh) {
            cloudMesh.rotation.y = time * 0.4;
          }
          // Invoices gentle pulse
          invoiceCubes.forEach((cube, i) => {
            cube.material.emissiveIntensity = 0.4 + Math.sin(time * 2.5 + i) * 0.25;
          });

          // Station 2: Balance scale rocking equilibrium
          if (scaleBeam) {
            const rock = Math.sin(time * 1.5) * 0.08;
            scaleBeam.rotation.z = Math.PI / 2 + rock;
            if (scalePanLeft) scalePanLeft.position.y = 0.62 - rock * 0.35;
            if (scalePanRight) scalePanRight.position.y = 0.62 + rock * 0.35;
          }
          if (taxShield) {
            taxShield.position.y = 1.15 + Math.sin(time * 2.0) * 0.04;
          }
          // CPA Seals Orbiting
          cpaSeals.forEach(seal => {
            const angle = seal.baseAngle + time * 0.55;
            seal.mesh.position.set(
              Math.cos(angle) * seal.radius,
              0.65 + Math.sin(time * 2.0 + seal.baseAngle) * 0.04,
              Math.sin(angle) * seal.radius * 0.4
            );
          });

          // Space dust gentle drift
          particles.rotation.y = time * 0.02;
        }
      };
    }

    window.selectValTest = function(idx) {
      if (valSelector) valSelector.select(idx);
    };

    // --- SLIDE 8: 3D Hexagonal Spider-Web Competitive Radar ---
    let compSelector = null;

    function buildSlide8Scene(scene, camera) {
      camera.position.set(0.0, 1.2, 11.8);
      camera.lookAt(0.0, -0.4, 0.0);

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

      // Lights
      const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
      dirLight.position.set(6, 12, 10);
      scene.add(dirLight);

      const cyanLight = new THREE.PointLight(0x38bdf8, 1.8, 25);
      cyanLight.position.set(0, 3, 6);
      scene.add(cyanLight);

      const amberLight = new THREE.PointLight(0xf59e0b, 1.4, 20);
      amberLight.position.set(3, 1, 5);
      scene.add(amberLight);

      const redLight = new THREE.PointLight(0xef4444, 1.4, 20);
      redLight.position.set(-3, 1, 5);
      scene.add(redLight);

      // ------------------------------------------
      // RADAR GEOMETRY & AXES (6 Dimensions)
      // ------------------------------------------
      const radarGroup = new THREE.Group();
      radarGroup.position.set(0.0, -0.9, 0.0);
      radarGroup.rotation.x = 0.52; // Tilted towards camera for perspective
      rootGroup.add(radarGroup);

      const radarR = 3.3;
      const axesCount = 6;
      const axesAngles = [];
      for (let i = 0; i < axesCount; i++) {
        axesAngles.push(i * (Math.PI / 3) - Math.PI / 2);
      }

      // 4 Concentric Hexagonal Spider-Web Grid Rings
      const gridLevels = [0.25, 0.5, 0.75, 1.0];
      gridLevels.forEach((level, lvlIdx) => {
        const pts = [];
        for (let i = 0; i <= axesCount; i++) {
          const angle = axesAngles[i % axesCount];
          pts.push(new THREE.Vector3(Math.cos(angle) * radarR * level, Math.sin(angle) * radarR * level, 0));
        }
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({
          color: lvlIdx === 3 ? 0x38bdf8 : 0x1e3a8a,
          transparent: true,
          opacity: lvlIdx === 3 ? 0.65 : 0.35
        });
        radarGroup.add(new THREE.Line(geo, mat));
      });

      // 6 Radial Spokes from Center
      axesAngles.forEach(angle => {
        const pts = [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(Math.cos(angle) * radarR, Math.sin(angle) * radarR, 0)
        ];
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        radarGroup.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x1e3a8a, transparent: true, opacity: 0.45 })));
      });

      // 6 Outer Vertex Label Badges
      const axesLabels = [
        { icon: '📱', text: '0 ج.م عتاد' },
        { icon: '⚡', text: 'كاميرا < 1s' },
        { icon: '💾', text: 'صمود أوفلاين' },
        { icon: '📖', text: 'ديون FIFO' },
        { icon: '💬', text: 'واتساب وتليجرام' },
        { icon: '💰', text: 'تسعير عادل بالجنيه' }
      ];

      function makeVertexBadgeTexture(icon, text) {
        const c = document.createElement('canvas');
        c.width = 240;
        c.height = 70;
        const ctx = c.getContext('2d');

        ctx.fillStyle = 'rgba(11, 22, 44, 0.95)';
        ctx.fillRect(0, 0, 240, 70);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(2, 2, 236, 66);

        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillStyle = '#f8fafc';
        ctx.direction = 'rtl';
        ctx.fillText(icon + ' ' + text, 225, 45);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      axesAngles.forEach((angle, idx) => {
        const lx = Math.cos(angle) * (radarR * 1.18);
        const ly = Math.sin(angle) * (radarR * 1.18);

        const bGeo = new THREE.PlaneGeometry(1.4, 0.42);
        const bMat = new THREE.MeshBasicMaterial({
          map: makeVertexBadgeTexture(axesLabels[idx].icon, axesLabels[idx].text),
          side: THREE.DoubleSide
        });
        const bMesh = new THREE.Mesh(bGeo, bMat);
        bMesh.position.set(lx, ly, 0.05);
        radarGroup.add(bMesh);
      });

      // ------------------------------------------
      // 3 COMPETITOR RADAR POLYGONS
      // ------------------------------------------
      function createRadarPolygon(values, fillColor, strokeColor, baseOpacity, zOffset) {
        const polyGroup = new THREE.Group();
        polyGroup.position.z = zOffset;
        radarGroup.add(polyGroup);

        const shape = new THREE.Shape();
        const linePts = [];

        values.forEach((val, i) => {
          const angle = axesAngles[i];
          const px = Math.cos(angle) * radarR * val;
          const py = Math.sin(angle) * radarR * val;
          if (i === 0) shape.moveTo(px, py);
          else shape.lineTo(px, py);
          linePts.push(new THREE.Vector3(px, py, 0));
        });
        shape.closePath();
        linePts.push(linePts[0].clone());

        // Filled Polygon Mesh
        const shapeGeo = new THREE.ShapeGeometry(shape);
        const shapeMat = new THREE.MeshStandardMaterial({
          color: fillColor,
          emissive: fillColor,
          emissiveIntensity: 0.35,
          transparent: true,
          opacity: baseOpacity,
          side: THREE.DoubleSide
        });
        const shapeMesh = new THREE.Mesh(shapeGeo, shapeMat);
        polyGroup.add(shapeMesh);

        // Boundary Line
        const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
        const lineMat = new THREE.LineBasicMaterial({ color: strokeColor, linewidth: 2.5 });
        const lineMesh = new THREE.Line(lineGeo, lineMat);
        polyGroup.add(lineMesh);

        // Vertex Spheres
        const vSpheres = [];
        values.forEach((val, i) => {
          const angle = axesAngles[i];
          const px = Math.cos(angle) * radarR * val;
          const py = Math.sin(angle) * radarR * val;

          const sMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.075, 12, 12),
            new THREE.MeshStandardMaterial({ color: strokeColor, emissive: strokeColor, emissiveIntensity: 0.8 })
          );
          sMesh.position.set(px, py, 0.02);
          polyGroup.add(sMesh);
          vSpheres.push(sMesh);
        });

        return {
          group: polyGroup,
          mesh: shapeMesh,
          line: lineMesh,
          spheres: vSpheres,
          baseOpacity: baseOpacity,
          targetOpacity: baseOpacity,
          targetScale: 1.0
        };
      }

      // 0: Hesabaty (100% full hexagon)
      const polyHesabaty = createRadarPolygon(
        [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
        0x0284c7,
        0x38bdf8,
        0.55,
        0.04
      );

      // 1: MegaStore / RiseSoft (Heavy offline only, 0 mobile, 0 capex, 0 messaging)
      const polyMegaStore = createRadarPolygon(
        [0.08, 0.06, 0.75, 0.22, 0.06, 0.22],
        0xef4444,
        0xf87171,
        0.4,
        0.02
      );

      // 2: Daftra / Odoo (Cloud ERP, but no mobile camera scan, no FIFO debt notebook, expensive USD)
      const polyDaftra = createRadarPolygon(
        [0.35, 0.1, 0.25, 0.2, 0.45, 0.35],
        0xf59e0b,
        0xfbbf24,
        0.4,
        0.03
      );

      // Rotating Crown Emblem on Hesabaty Center
      const crownMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.35, 0.035, 16, 32),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 })
      );
      crownMesh.position.set(0, 0, 0.08);
      radarGroup.add(crownMesh);

      // ------------------------------------------
      // TEXTURE GENERATOR FOR COMPETITIVE CARDS
      // ------------------------------------------
      function makeCompCardTexture(badgeTitle, tag, headline, bullets, resultText, accentColor) {
        const c = document.createElement('canvas');
        c.width = 460;
        c.height = 270;
        const ctx = c.getContext('2d');

        // Background
        ctx.fillStyle = 'rgba(7, 17, 31, 0.95)';
        ctx.fillRect(0, 0, 460, 270);

        // Border
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 3.5;
        ctx.strokeRect(2, 2, 456, 266);

        // Header bar
        ctx.fillStyle = 'rgba(30, 58, 138, 0.35)';
        ctx.fillRect(0, 0, 460, 48);

        // Title
        ctx.font = 'bold 16px Cairo, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.direction = 'rtl';
        ctx.fillText(badgeTitle, 440, 32);

        // Tag
        ctx.font = '13px Cairo, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(tag, 220, 32);

        // Main Title
        ctx.font = 'bold 20px Cairo, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(headline, 440, 85);

        // Divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(20, 102); ctx.lineTo(440, 102); ctx.stroke();

        // Bullets
        ctx.font = '14px Cairo, sans-serif';
        ctx.fillStyle = '#cbd5e1';
        bullets.forEach((b, idx) => {
          ctx.fillText(b, 440, 134 + idx * 28);
        });

        // Result Box at bottom
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(15, 202, 430, 50);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(15, 202, 430, 50);

        ctx.font = 'bold 15px Cairo, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.fillText(resultText, 430, 234);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      // ------------------------------------------
      // FLOATING BREAKDOWN CARDS
      // ------------------------------------------
      const cardTextures = [
        // 0: Hesabaty
        makeCompCardTexture(
          '✨ حساباتي: التميز الحاسم والريادة',
          '🏆 100% Fit for Egyptian Retail',
          'اكتمال كافة محاور التشغيل اليومي للشارع المصري',
          [
            '• صفر جنيه أجهزة — وفر مباشر يتجاوز 25,000 ج.م على التاجر',
            '• سرعة مسح بالكاميرا < ثانية وصمود كامل أوفلاين بـ IndexedDB',
            '• تتبع رصيد نوتة الشكك بنظام FIFO ومشاركة الفواتير بالواتساب'
          ],
          '✅ تغطية 6 من 6 محاور استراتيجية لا تجتمع في أي بديل بالسوق',
          '#38bdf8'
        ),
        // 1: MegaStore
        makeCompCardTexture(
          '❌ الأنظمة المكتبية التقليدية (MegaStore)',
          '⚠️ Legacy Desktop & High Capex',
          'تكلفة أولية مرهقة وجمود تقني تام',
          [
            '• تكلفة أجهزة باهظة (15k - 25k ج.م) لشاشات وكاسيت كاشير وسكانر',
            '• فرض 10,000 ج.م رسوم للترقية واشتراط زيارات صيانة مدفوعة',
            '• غياب السحابة تماماً ولا يدعم العمل عبر الهاتف المحمول أو عن بعد'
          ],
          '⛔ عائق مالي وتشغيلي كبير أمام نمو وتوسع المحلات التجارية',
          '#ef4444'
        ),
        // 2: Daftra / Odoo
        makeCompCardTexture(
          '⚠️ أنظمة ERP السحابية الكبرى (دفترة / Odoo)',
          '🌐 Complex Cloud & USD Pricing',
          'تعقيد محاسبي وتسعير مرتفع بالدولار',
          [
            '• تسعير دولاري ($20 - $50 شهرياً) يتضاعف مع كل فرع ومستخدم',
            '• واجهات محاسبية معقدة جداً لا تناسب سرعة الكاشير اليومي',
            '• لا يدعم كاميرا الهاتف للمسح السريع ولا يعالج نوتة الشكك بـ FIFO'
          ],
          '⛔ هدر مالي وتشغيلي لا يتناسب مع طبيعة تجارة التجزئة المحلية',
          '#f59e0b'
        ),
        // 3: Comprehensive Comparison
        makeCompCardTexture(
          '⚖️ المقارنة الشاملة والفجوة الهيكلية',
          '📊 Structural Market Gap',
          'لماذا تكتسح «حساباتي» السوق المستهدف؟',
          [
            '• فجوة العتاد: من 25,000 ج.م إلى صفر جنيه على هاتف التاجر',
            '• فجوة التسعير: من اشتراكات بالدولار إلى تسعير محلي عادل بالجنيه',
            '• فجوة السرعة: واجهة عربية سريعة بنظام أوفلاين وفواتير واتساب'
          ],
          '🎯 حساباتي هي الحل الوحيد المصمم لواقع التجارة المصرية بنسبة 100%',
          '#10b981'
        )
      ];

      const floatingCardGeo = new THREE.PlaneGeometry(2.35, 1.38);
      const floatingCardMat = new THREE.MeshBasicMaterial({ map: cardTextures[0], side: THREE.DoubleSide });
      const floatingCard = new THREE.Mesh(floatingCardGeo, floatingCardMat);
      floatingCard.position.set(0, 1.85, 0.2);
      rootGroup.add(floatingCard);

      // Ambient Space Dust
      const dustGeo = new THREE.BufferGeometry();
      const dustCount = 75;
      const dustPos = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount * 3; i++) {
        dustPos[i] = (Math.random() - 0.5) * 18;
      }
      dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
      const dustMat = new THREE.PointsMaterial({ size: 0.075, color: 0x38bdf8, transparent: true, opacity: 0.65 });
      const dustParticles = new THREE.Points(dustGeo, dustMat);
      rootGroup.add(dustParticles);

      // ------------------------------------------
      // CAMERA GLIDE TARGETS FOR COMPETITOR VIEWS
      // ------------------------------------------
      const compCamTargets = [
        // 0: Hesabaty (Centered Hero View)
        {
          camPos: new THREE.Vector3(0.0, 1.1, 11.4),
          lookAt: new THREE.Vector3(0.0, -0.4, 0.0)
        },
        // 1: MegaStore (Left focus)
        {
          camPos: new THREE.Vector3(-1.4, 0.9, 11.4),
          lookAt: new THREE.Vector3(-0.9, -0.5, 0.0)
        },
        // 2: Daftra (Right focus)
        {
          camPos: new THREE.Vector3(1.4, 0.9, 11.4),
          lookAt: new THREE.Vector3(0.9, -0.5, 0.0)
        },
        // 3: All Layers Overview
        {
          camPos: new THREE.Vector3(0.0, 1.3, 11.8),
          lookAt: new THREE.Vector3(0.0, -0.4, 0.0)
        }
      ];

      let currentCamPos = new THREE.Vector3(0.0, 1.1, 11.4);
      let currentLookAt = new THREE.Vector3(0.0, -0.4, 0.0);
      let targetCamPos = compCamTargets[0].camPos.clone();
      let targetLookAt = compCamTargets[0].lookAt.clone();

      compSelector = {
        select(idx) {
          if (compCamTargets[idx]) {
            targetCamPos.copy(compCamTargets[idx].camPos);
            targetLookAt.copy(compCamTargets[idx].lookAt);
          }

          // Update floating card texture
          if (cardTextures[idx]) {
            floatingCard.material.map = cardTextures[idx];
            floatingCard.material.needsUpdate = true;
          }

          // Sync buttons & right-hand cards
          [0, 1, 2, 3].forEach(i => {
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

          // Adjust layer opacities based on mode
          if (idx === 0) {
            // Hesabaty Hero Focus
            polyHesabaty.targetOpacity = 0.65;
            polyHesabaty.targetScale = 1.05;
            polyMegaStore.targetOpacity = 0.15;
            polyMegaStore.targetScale = 1.0;
            polyDaftra.targetOpacity = 0.15;
            polyDaftra.targetScale = 1.0;
          } else if (idx === 1) {
            // MegaStore Focus
            polyHesabaty.targetOpacity = 0.2;
            polyHesabaty.targetScale = 1.0;
            polyMegaStore.targetOpacity = 0.7;
            polyMegaStore.targetScale = 1.08;
            polyDaftra.targetOpacity = 0.12;
            polyDaftra.targetScale = 1.0;
          } else if (idx === 2) {
            // Daftra Focus
            polyHesabaty.targetOpacity = 0.2;
            polyHesabaty.targetScale = 1.0;
            polyMegaStore.targetOpacity = 0.12;
            polyMegaStore.targetScale = 1.0;
            polyDaftra.targetOpacity = 0.7;
            polyDaftra.targetScale = 1.08;
          } else if (idx === 3) {
            // All Overview
            polyHesabaty.targetOpacity = 0.55;
            polyHesabaty.targetScale = 1.0;
            polyMegaStore.targetOpacity = 0.45;
            polyMegaStore.targetScale = 1.0;
            polyDaftra.targetOpacity = 0.45;
            polyDaftra.targetScale = 1.0;
          }
        }
      };

      // Initial selection
      compSelector.select(0);

      // Direct Canvas Click to select competitor
      if (stageElem) {
        const raycaster = new THREE.Raycaster();
        const clickVec = new THREE.Vector2();
        stageElem.addEventListener('click', (e) => {
          const rect = stageElem.getBoundingClientRect();
          clickVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          clickVec.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
          raycaster.setFromCamera(clickVec, camera);

          if (raycaster.intersectObject(polyHesabaty.mesh).length > 0) {
            compSelector.select(0);
          } else if (raycaster.intersectObject(polyMegaStore.mesh).length > 0) {
            compSelector.select(1);
          } else if (raycaster.intersectObject(polyDaftra.mesh).length > 0) {
            compSelector.select(2);
          }
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

          // Gentle rocking on radar group
          radarGroup.rotation.z = Math.sin(time * 0.35) * 0.08;

          // Interpolate polygon opacities and scales
          [polyHesabaty, polyMegaStore, polyDaftra].forEach(poly => {
            poly.mesh.material.opacity += (poly.targetOpacity - poly.mesh.material.opacity) * 0.08;
            const currentScale = poly.group.scale.x;
            const newScale = currentScale + (poly.targetScale - currentScale) * 0.08;
            poly.group.scale.set(newScale, newScale, newScale);
          });

          // Crown rotation
          crownMesh.rotation.z = time * 0.5;

          // Floating Card Gentle Hover
          floatingCard.position.y = 1.85 + Math.sin(time * 1.5) * 0.04;

          // Space dust gentle drift
          dustParticles.rotation.y = time * 0.02;
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

    // --- SLIDE 10: Interactive Exploded 3D Donut Engine (The Ask: 175,000 EGP) ---
    let fundSelector = null;

    function buildSlide10Scene(scene, camera) {
      camera.position.set(0.0, 0.25, 11.2);
      camera.lookAt(0.0, -0.2, 0.0);

      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      // Tilt donut ring towards camera for 3D depth
      rootGroup.rotation.x = 0.42;

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

      // Lights
      const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
      dirLight.position.set(6, 12, 10);
      scene.add(dirLight);

      const cyanPoint = new THREE.PointLight(0x38bdf8, 2.2, 25);
      cyanPoint.position.set(-4, 3, 5);
      scene.add(cyanPoint);

      const emeraldPoint = new THREE.PointLight(0x10b981, 2.0, 25);
      emeraldPoint.position.set(0, 4, 4);
      scene.add(emeraldPoint);

      const goldPoint = new THREE.PointLight(0xf59e0b, 2.0, 25);
      goldPoint.position.set(4, -2, 5);
      scene.add(goldPoint);

      const purplePoint = new THREE.PointLight(0xa855f7, 1.8, 20);
      purplePoint.position.set(0, -4, 4);
      scene.add(purplePoint);

      // Base Platform Disc
      const discGeo = new THREE.CylinderGeometry(4.4, 4.7, 0.22, 64);
      const discMat = new THREE.MeshStandardMaterial({
        color: 0x07111f,
        metalness: 0.9,
        roughness: 0.2,
        transparent: true,
        opacity: 0.85
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.set(0, 0, -0.55);
      rootGroup.add(disc);

      const discEdge = new THREE.EdgesGeometry(discGeo);
      disc.add(new THREE.LineSegments(discEdge, new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 })));

      // ------------------------------------------
      // SECTOR DATA (175,000 EGP TOTAL)
      // ------------------------------------------
      const fundSectorsData = [
        {
          idx: 0,
          percentage: 0.45,
          pctText: '45%',
          amountText: '78,750 ج.م',
          name: '📍 المبيعات الميدانية والاستحواذ',
          subtitle: 'Field Sales & Merchant Acquisition (45%)',
          color: 0x38bdf8,
          colorHex: '#38bdf8',
          emissive: 0x0284c7,
          bullets: [
            '• حوافز وعمولات الزيارات اليومية لمحلات التجزئة بشرق الإسكندرية',
            '• إعلانات Meta Ads جغرافية مستهدفة (100-150 ج.م/يوم) للتجار بالمنطقة',
            '• مواد مطبوعة ودلائل تعريفية وبرشورات تدريبية ميدانية للمتاجر'
          ],
          quote: '🎯 "الهدف: تمويل وتجهيز 50 - 80 متجراً نشطاً بنهاية العام الأول."'
        },
        {
          idx: 1,
          percentage: 0.30,
          pctText: '30%',
          amountText: '52,500 ج.م',
          name: '⚡ البنية السحابية ونماذج الذكاء الاصطناعي',
          subtitle: 'Cloud Infrastructure & AI Vision Models (30%)',
          color: 0x10b981,
          colorHex: '#10b981',
          emissive: 0x059669,
          bullets: [
            '• خوادم وقواعد بيانات سحابية سريعة (PostgreSQL, Bun, Fast Edge CDN)',
            '• اشتراكات واجهات AI لمسح وقراءة الفواتير الورقية والباركود بالهاتف',
            '• بنية تحتية آمنة ومتوافقة 100% مع منظومة الإيصال الإلكتروني'
          ],
          quote: '⚡ "عمارة برمجية فائقة السرعة مع صمود أوفلاين وتكلفة سيرفرات دنيا."'
        },
        {
          idx: 2,
          percentage: 0.15,
          pctText: '15%',
          amountText: '26,250 ج.م',
          name: '👥 التهيئة الميدانية وتدريب الكاشيرات',
          subtitle: 'Store Onboarding & Customer Success (15%)',
          color: 0xf59e0b,
          colorHex: '#f59e0b',
          emissive: 0xd97706,
          bullets: [
            '• زيارات ميدانية لرفع أول 1000 صنف للمحل وتدريب الكاشيرات مجاناً',
            '• تسليم تشغيلي فوري للمتجر في أقل من 30 دقيقة بدون أي تعقيد',
            '• دعم فني لحظي عبر WhatsApp وTelegram لضمان نسبة استبقاء 100%'
          ],
          quote: '🤝 "استبقاء كامل للعملاء وخفض معدل الإلغاء (Zero Churn)."'
        },
        {
          idx: 3,
          percentage: 0.10,
          pctText: '10%',
          amountText: '17,500 ج.م',
          name: '🛡️ احتياطي تشغيلي وسيولة أمان',
          subtitle: 'Runway Buffer & Working Capital (10%)',
          color: 0xa855f7,
          colorHex: '#a855f7',
          emissive: 0x7e22ce,
          bullets: [
            '• سيولة نقدية احتياطية للطوارئ تضمن استقرار العمليات دون انقطاع',
            '• مد مظلة الأمان المالي (Runway) من 12 إلى 18 شهراً بثقة كاملة',
            '• الوصول لنقطة التعادل التشغيلي والربحية المستدامة بأمان تام'
          ],
          quote: '🛡️ "انضباط مالي يوفر أقصى حماية لرأس المال المستثمر."'
        }
      ];

      // Helper function for round rect in canvas
      function drawRoundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      }

      // Percentage Disc Texture (for floating 3D badges on sectors)
      function makePercentageBadgeTexture(text, color) {
        const c = document.createElement('canvas');
        c.width = 160;
        c.height = 160;
        const ctx = c.getContext('2d');

        ctx.fillStyle = 'rgba(7, 17, 31, 0.95)';
        ctx.beginPath(); ctx.arc(80, 80, 76, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.font = 'bold 44px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = color;
        ctx.fillText(text, 80, 95);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 8;
        return tex;
      }

      // High-Res Detailed Financial Card Texture Generator (960x580)
      function makeFundCardTexture(name, subtitle, amount, bullets, quote, accentColor) {
        const c = document.createElement('canvas');
        c.width = 960;
        c.height = 580;
        const ctx = c.getContext('2d');

        // Background Gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 580);
        bgGrad.addColorStop(0, '#09152b');
        bgGrad.addColorStop(0.5, '#060d1b');
        bgGrad.addColorStop(1, '#030712');
        ctx.fillStyle = bgGrad;
        drawRoundRect(ctx, 0, 0, 960, 580, 26);
        ctx.fill();

        // Glowing Outer Border
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 4;
        drawRoundRect(ctx, 4, 4, 952, 572, 24);
        ctx.stroke();

        // Inner Subtle Rim
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1.5;
        drawRoundRect(ctx, 10, 10, 940, 560, 20);
        ctx.stroke();

        // Header Bar
        const headerGrad = ctx.createLinearGradient(0, 14, 960, 14);
        headerGrad.addColorStop(0, 'rgba(30, 58, 138, 0.2)');
        headerGrad.addColorStop(0.5, 'rgba(30, 58, 138, 0.5)');
        headerGrad.addColorStop(1, 'rgba(15, 23, 42, 0.7)');
        ctx.fillStyle = headerGrad;
        drawRoundRect(ctx, 14, 14, 932, 92, 18);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        drawRoundRect(ctx, 14, 14, 932, 92, 18);
        ctx.stroke();

        // Category Name (RTL right-aligned)
        ctx.direction = 'rtl';
        ctx.textAlign = 'right';
        ctx.font = 'bold 30px Cairo, sans-serif';
        ctx.fillStyle = accentColor;
        ctx.fillText(name, 915, 68);

        // Amount Badge (Left-aligned)
        ctx.direction = 'ltr';
        ctx.textAlign = 'left';
        ctx.font = 'bold 20px Outfit, sans-serif';
        const badgeW = 200;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        drawRoundRect(ctx, 36, 36, badgeW, 48, 12);
        ctx.fill();
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.5;
        drawRoundRect(ctx, 36, 36, badgeW, 48, 12);
        ctx.stroke();
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(amount, 54, 68);

        // Subtitle
        ctx.direction = 'rtl';
        ctx.textAlign = 'right';
        ctx.font = 'bold 23px Cairo, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(subtitle, 915, 148);

        // Glowing Divider
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

        // 3 Bullets
        bullets.forEach((b, idx) => {
          const bulletY = 226 + idx * 64;

          ctx.save();
          ctx.fillStyle = accentColor;
          ctx.beginPath();
          ctx.arc(905, bulletY - 8, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          ctx.font = '22px Cairo, sans-serif';
          ctx.fillStyle = '#e2e8f0';
          ctx.fillText(b, 885, bulletY);
        });

        // Bottom Callout Box
        const quoteGrad = ctx.createLinearGradient(36, 435, 36, 545);
        quoteGrad.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
        quoteGrad.addColorStop(1, 'rgba(10, 18, 36, 0.98)');
        ctx.fillStyle = quoteGrad;
        drawRoundRect(ctx, 36, 435, 888, 108, 16);
        ctx.fill();

        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        drawRoundRect(ctx, 36, 435, 888, 108, 16);
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

      // ------------------------------------------
      // 3D DONUT SLICES (EXTRUDED ANNULUS SECTORS)
      // ------------------------------------------
      const donutGroup = new THREE.Group();
      rootGroup.add(donutGroup);

      const rIn = 1.45;
      const rOut = 2.95;
      const gap = 0.055;
      let currentAngle = 0.0;
      const sectorSlices = [];

      fundSectorsData.forEach((sec) => {
        const span = (sec.percentage * Math.PI * 2) - gap;
        const startA = currentAngle + gap / 2;
        const endA = startA + span;
        const midA = (startA + endA) / 2;
        currentAngle += sec.percentage * Math.PI * 2;

        // Build 2D shape for arc annulus
        const shape = new THREE.Shape();
        const nSegs = 36;
        // Outer arc
        for (let i = 0; i <= nSegs; i++) {
          const theta = startA + (i / nSegs) * span;
          const x = Math.cos(theta) * rOut;
          const y = Math.sin(theta) * rOut;
          if (i === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
        }
        // Inner arc in reverse
        for (let i = nSegs; i >= 0; i--) {
          const theta = startA + (i / nSegs) * span;
          const x = Math.cos(theta) * rIn;
          const y = Math.sin(theta) * rIn;
          shape.lineTo(x, y);
        }
        shape.closePath();

        const geo = new THREE.ExtrudeGeometry(shape, {
          depth: 0.55,
          bevelEnabled: true,
          bevelSegments: 3,
          steps: 1,
          bevelSize: 0.035,
          bevelThickness: 0.035
        });
        geo.translate(0, 0, -0.275);

        const mat = new THREE.MeshStandardMaterial({
          color: sec.color,
          emissive: sec.emissive,
          emissiveIntensity: 0.35,
          metalness: 0.7,
          roughness: 0.25
        });
        const mesh = new THREE.Mesh(geo, mat);

        const edgeGeo = new THREE.EdgesGeometry(geo);
        const edgeLine = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({
          color: sec.color,
          transparent: true,
          opacity: 0.85
        }));
        mesh.add(edgeLine);

        // Floating percentage badge
        const badgeMesh = new THREE.Mesh(
          new THREE.CircleGeometry(0.38, 32),
          new THREE.MeshBasicMaterial({
            map: makePercentageBadgeTexture(sec.pctText, sec.colorHex),
            side: THREE.DoubleSide
          })
        );
        const badgeR = (rIn + rOut) / 2;
        badgeMesh.position.set(Math.cos(midA) * badgeR, Math.sin(midA) * badgeR, 0.38);
        mesh.add(badgeMesh);

        // Group for radial explosion animation
        const sliceGroup = new THREE.Group();
        donutGroup.add(sliceGroup);
        sliceGroup.add(mesh);

        sectorSlices.push({
          sec: sec,
          group: sliceGroup,
          mesh: mesh,
          midA: midA,
          currentExplode: 0,
          targetExplode: 0
        });
      });

      // ------------------------------------------
      // CENTRAL HOLOGRAM CORE (175,000 EGP ASK)
      // ------------------------------------------
      function makeAskCoreTexture() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 512;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#060d1b';
        ctx.beginPath(); ctx.arc(256, 256, 248, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(256, 256, 230, 0, Math.PI * 2); ctx.stroke();

        // Label Top
        ctx.font = 'bold 26px Cairo, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('🎯 المبلغ المطلوب | The Ask', 256, 140);

        // 175,000
        ctx.font = 'bold 64px Outfit, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('175,000', 256, 240);

        // Currency
        ctx.font = 'bold 30px Cairo, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText('جنيه مصري (EGP)', 256, 305);

        // Sub-badge
        ctx.fillStyle = 'rgba(30, 58, 138, 0.5)';
        ctx.beginPath();
        drawRoundRect(ctx, 86, 345, 340, 50, 12);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        drawRoundRect(ctx, 86, 345, 340, 50, 12);
        ctx.stroke();

        ctx.font = 'bold 22px Cairo, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('⚡ سيولة أمان 12 - 18 شهراً', 256, 378);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 8;
        return tex;
      }

      const coreGroup = new THREE.Group();
      rootGroup.add(coreGroup);

      const corePedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(1.25, 1.3, 0.35, 32),
        new THREE.MeshStandardMaterial({ color: 0x07111f, metalness: 0.9, roughness: 0.2 })
      );
      corePedestal.rotation.x = Math.PI / 2;
      coreGroup.add(corePedestal);

      const coreDisc = new THREE.Mesh(
        new THREE.CircleGeometry(1.22, 32),
        new THREE.MeshBasicMaterial({ map: makeAskCoreTexture(), side: THREE.DoubleSide })
      );
      coreDisc.position.z = 0.20;
      coreGroup.add(coreDisc);

      // Orbiting Golden & Cyan Rings
      const ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(1.38, 0.025, 16, 32),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      coreGroup.add(ring1);

      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(1.52, 0.02, 16, 32),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b })
      );
      coreGroup.add(ring2);

      // ------------------------------------------
      // DETAILED FINANCIAL CARDS GROUP
      // ------------------------------------------
      const cardGeo = new THREE.PlaneGeometry(2.65, 1.60);
      const frameGeo = new THREE.BoxGeometry(2.69, 1.64, 0.04);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x07111f,
        metalness: 0.9,
        roughness: 0.2
      });

      const fundDetailCardGroup = new THREE.Group();
      fundDetailCardGroup.position.set(0.0, -0.22, 0.55);
      scene.add(fundDetailCardGroup);

      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      frameMesh.position.set(0, 0, -0.02);
      fundDetailCardGroup.add(frameMesh);

      const sectorCards = fundSectorsData.map(sec => {
        const mat = new THREE.MeshBasicMaterial({
          map: makeFundCardTexture(sec.name, sec.subtitle, sec.amountText, sec.bullets, sec.quote, sec.colorHex),
          side: THREE.DoubleSide
        });
        const cardMesh = new THREE.Mesh(cardGeo, mat);
        cardMesh.visible = false;
        fundDetailCardGroup.add(cardMesh);
        return cardMesh;
      });

      fundDetailCardGroup.visible = false;

      // Ambient Space Particles
      const partGeo = new THREE.BufferGeometry();
      const partCount = 80;
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
        if (idx >= 0 && idx <= 3) {
          const dist = getZoomDistance();
          return {
            camPos: new THREE.Vector3(0.0, -0.22, 0.55 + dist),
            lookAt: new THREE.Vector3(0.0, -0.22, 0.55)
          };
        }
        // Overview (Mode 4)
        return {
          camPos: new THREE.Vector3(0.0, 0.25, 12.8),
          lookAt: new THREE.Vector3(0.0, -0.2, 0.0)
        };
      }

      let currentCamPos = new THREE.Vector3(0.0, 0.25, 12.8);
      let currentLookAt = new THREE.Vector3(0.0, -0.2, 0.0);
      let targetCamPos = new THREE.Vector3(0.0, 0.25, 12.8);
      let targetLookAt = new THREE.Vector3(0.0, -0.2, 0.0);
      let currentSelectedIdx = 4;

      fundSelector = {
        select(idx) {
          currentSelectedIdx = idx;
          const target = getTargetForIdx(idx);
          targetCamPos.copy(target.camPos);
          targetLookAt.copy(target.lookAt);

          // Sector explosion targets
          sectorSlices.forEach((sl, i) => {
            if (i === idx) {
              sl.targetExplode = 0.95;
              sl.mesh.material.emissiveIntensity = 0.75;
            } else {
              sl.targetExplode = 0.0;
              sl.mesh.material.emissiveIntensity = 0.35;
            }
          });

          // Show detail card when sector 0-3 is active
          if (idx >= 0 && idx <= 3) {
            fundDetailCardGroup.visible = true;
            sectorCards.forEach((cMesh, i) => {
              cMesh.visible = (i === idx);
            });
          } else {
            fundDetailCardGroup.visible = false;
          }

          // Sync buttons & right-hand cards
          for (let i = 0; i <= 4; i++) {
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

      // Set initial view: Overview (idx = 4)
      fundSelector.select(4);
      currentCamPos.copy(targetCamPos);
      currentLookAt.copy(targetLookAt);

      // Handle window resize to recompute zoom distance
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

          // Check click on any sector
          for (let i = 0; i < sectorSlices.length; i++) {
            const hits = raycaster.intersectObjects(sectorSlices[i].group.children, true);
            if (hits.length > 0) {
              if (currentSelectedIdx === i) fundSelector.select(4); // Toggle to overview
              else fundSelector.select(i);
              return;
            }
          }

          // Check click on central ask core
          const hitCore = raycaster.intersectObjects(coreGroup.children, true);
          if (hitCore.length > 0) {
            fundSelector.select(4);
            return;
          }

          // Check click on detail card
          const hitCard = raycaster.intersectObjects(fundDetailCardGroup.children, true);
          if (hitCard.length > 0) {
            fundSelector.select(4);
            return;
          }

          // Clicked empty background
          if (currentSelectedIdx !== 4) {
            fundSelector.select(4);
          }
        });

        // Hover cursor pointer feedback
        stageElem.addEventListener('mousemove', (e) => {
          const rect = stageElem.getBoundingClientRect();
          mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouseVec.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
          raycaster.setFromCamera(mouseVec, camera);

          const allClickables = [
            ...coreGroup.children,
            ...fundDetailCardGroup.children
          ];
          sectorSlices.forEach(sl => {
            allClickables.push(...sl.group.children);
          });

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

          // Smooth Radial Explosion of Slices
          sectorSlices.forEach(sl => {
            sl.currentExplode += (sl.targetExplode - sl.currentExplode) * 0.08;
            const ex = Math.cos(sl.midA) * sl.currentExplode;
            const ey = Math.sin(sl.midA) * sl.currentExplode;
            const ez = sl.currentExplode > 0.05 ? 0.25 : 0.0;
            sl.group.position.set(ex, ey, ez);
          });

          // In Overview mode: gentle continuous rotation of donut ring
          if (currentSelectedIdx === 4) {
            donutGroup.rotation.z = time * 0.12;
          } else {
            // Smoothly ease rotation to neutral so active slice faces comfortably
            donutGroup.rotation.z += (0.0 - donutGroup.rotation.z) * 0.08;
          }

          // Orbiting Rings Rotation
          ring1.rotation.x = time * 0.7;
          ring1.rotation.y = time * 0.35;
          ring2.rotation.y = -time * 0.6;
          ring2.rotation.z = time * 0.3;

          // Space dust gentle drift
          particles.rotation.y = time * 0.02;
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
      deck.init();

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
