from pathlib import Path
import re
p=Path('index.html')
s=p.read_text(encoding='utf-8-sig')
head=s[:s.index('<body>')]
head=head.replace('Invested in the long view.','Built for lasting value.').replace('One platform. Global reach. Aligned interest. Patient capital for enduring businesses.','A global investment platform focused on long term value creation across markets, assets and opportunities.')
head=head.replace('<script src="js/main.js" defer></script>', '<script src="js/main.js" defer></script>\n<script src="assets/globe-land.js" defer></script>\n<script src="js/globe.js" defer></script>')
body='''<body>
<a class="skip" href="#about">Skip to content</a>
<header class="masthead" id="masthead">
<a class="wordmark" href="#home" aria-label="AJ Holdings home">aj.holdings</a>
<nav class="desktop-nav" aria-label="Primary navigation"><a href="#about">About</a><a href="#investments">Investments</a><a href="#portfolio">Portfolio</a><a href="#global">Global</a><a href="#leadership">Leadership</a></nav>
<a class="button button-outline nav-contact" href="#contact">Get in Touch <span aria-hidden="true">↗</span></a>
<button class="menu-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open navigation"><span></span><span></span></button>
</header>
<nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation" hidden><a href="#about">About</a><a href="#investments">Investments</a><a href="#strategies">Strategies</a><a href="#portfolio">Portfolio</a><a href="#global">Global</a><a href="#leadership">Leadership</a><a href="#contact">Contact ↗</a></nav>
<main>
<section class="hero" id="home" aria-labelledby="hero-title">
<img class="hero-image" src="assets/waterfront.webp" alt="Dubai-inspired waterfront skyline at blue hour" width="1672" height="941" fetchpriority="high"><div class="hero-shade"></div>
<div class="hero-content"><p class="pill">Global Investment Platform</p><h1 id="hero-title">Built for<br><em>lasting value.</em></h1><p class="hero-description">AJ Holdings invests across public and private markets, real assets and digital opportunities with a long term, disciplined approach to capital.</p><div class="hero-actions"><a class="button button-light" href="#investments">Explore Investments <span aria-hidden="true">↗</span></a><a class="hero-secondary" href="#about">Our Approach <span aria-hidden="true">↗</span></a></div></div>
<div class="hero-bottom"><a href="#about" class="scroll-link"><span aria-hidden="true">↓</span> EXPLORE AJ HOLDINGS</a></div>
</section>
<section class="section about dark" id="about" aria-labelledby="about-title">
<div class="section-heading reveal"><div><p class="eyebrow">[ OUR APPROACH ]</p><h2 id="about-title">Long term capital.<br><em>Independent thinking.</em></h2></div></div>
<div class="about-grid"><div class="about-copy reveal"><p class="positioning">A global investment platform focused on long term value creation across markets, assets and opportunities.</p><p>We invest with a long term perspective, allocating capital across markets, strategies and geographies where we see durable value.</p><p>Our approach combines disciplined underwriting, selective conviction and the flexibility to invest across cycles.</p><a class="text-link" href="#investments">Explore our investments <span aria-hidden="true">↗</span></a></div><figure class="about-image reveal"><img src="assets/architecture.webp" alt="Curved limestone and glass facades framing an open sky" width="1536" height="1024" loading="lazy"></figure></div>
</section>
<section class="section investments" id="investments" aria-labelledby="investments-title">
<div class="section-heading reveal"><div><p class="eyebrow">[ INVESTMENTS ]</p><h2 id="investments-title">Investing across<br>the <em>opportunity spectrum.</em></h2></div><p class="heading-copy">A diversified investment approach across five core asset classes.</p></div>
<div class="capital-grid"><figure class="capital-image reveal"><img src="assets/energy.webp" alt="Solar panels in an expansive landscape at sunrise" width="1536" height="1024" loading="lazy"></figure><div class="asset-list reveal">
<details name="asset-class" open><summary><span>01</span>Public Markets<i aria-hidden="true">+</i></summary><p>Investments across global listed markets with a focus on long term value and market opportunity.</p></details>
<details name="asset-class"><summary><span>02</span>Private Equity<i aria-hidden="true">+</i></summary><p>Direct and strategic investments in established businesses with potential for long term value creation.</p></details>
<details name="asset-class"><summary><span>03</span>Venture Capital<i aria-hidden="true">+</i></summary><p>Backing emerging businesses and technologies with the potential to shape future markets.</p></details>
<details name="asset-class"><summary><span>04</span>Real Estate<i aria-hidden="true">+</i></summary><p>Selective investments across real estate assets and development opportunities.</p></details>
<details name="asset-class"><summary><span>05</span>Digital Assets<i aria-hidden="true">+</i></summary><p>Strategic exposure to digital assets and the evolving digital economy.</p></details>
</div></div>
</section>
<section class="section strategies" id="strategies" aria-labelledby="strategies-title">
<div class="section-heading reveal"><div><p class="eyebrow">[ STRATEGIES ]</p><h2 id="strategies-title">Flexible capital.<br><em>Focused execution.</em></h2></div><p class="heading-copy">We invest through a range of strategies designed to capture opportunity across different market environments.</p></div>
<div class="strategy-list">
<article class="strategy reveal"><span class="index">01 /</span><h3>Buyouts</h3><p>Control and significant ownership investments in businesses with clear potential for long term growth.</p></article>
<article class="strategy reveal"><span class="index">02 /</span><h3>Structured Investments</h3><p>Tailored capital solutions designed around specific opportunities, risk profiles and outcomes.</p></article>
<article class="strategy reveal"><span class="index">03 /</span><h3>Special Situations</h3><p>Investments arising from complexity, transition or market dislocation.</p></article>
<article class="strategy reveal"><span class="index">04 /</span><h3>Distressed Assets</h3><p>Selective investment in assets where market conditions create compelling value opportunities.</p></article>
<article class="strategy reveal"><span class="index">05 /</span><h3>Turnarounds</h3><p>Capital deployed into businesses and assets with potential for operational and strategic transformation.</p></article>
</div>
</section>
<section class="section portfolio" id="portfolio" aria-labelledby="portfolio-title">
<div class="section-heading reveal"><div><p class="eyebrow">[ PORTFOLIO ]</p><h2 id="portfolio-title">Companies <em>we back.</em></h2></div><p class="heading-copy">Selected investments across technology, infrastructure, energy, real estate and emerging industries.</p></div>
<div class="portfolio-wall reveal">
<div><img src="portfolio/web/skyroot.svg" alt="Skyroot" width="125" height="55" loading="lazy"></div><div><img src="portfolio/web/pace-digitek.png" alt="Pace Digitek" width="125" height="55" loading="lazy"></div><div><img src="portfolio/web/GH2Solar.png" alt="GH2 Solar" width="125" height="55" loading="lazy"></div><div><img src="portfolio/web/88eightyeight.png" alt="88 Eighty Eight Pictures" width="125" height="55" loading="lazy"></div><div><img src="portfolio/web/skyy-development.png" alt="Skyy Development" width="125" height="55" loading="lazy"></div><div><img src="portfolio/web/solana.svg" alt="Solana" width="125" height="55" loading="lazy"></div><div><img src="portfolio/web/grew-solar.svg" alt="Grew Solar" width="125" height="55" loading="lazy"></div><div><img src="portfolio/web/trident.png" alt="Trident Fruits" width="125" height="55" loading="lazy"></div><div><img src="portfolio/web/hydgen.svg" alt="Hydgen" width="125" height="55" loading="lazy"></div><div><img src="portfolio/web/greenzo-energy.png" alt="Greenzo Energy" width="125" height="55" loading="lazy"></div>
</div>
</section>
<section class="section global dark" id="global" aria-labelledby="global-title">
<div class="section-heading reveal"><div><p class="eyebrow">[ GLOBAL REACH ]</p><h2 id="global-title">One platform.<br><em>Global perspective.</em></h2></div><p class="heading-copy">AJ Holdings operates across key global markets, combining centralised investment strategy with local insight and execution.</p></div>
<div class="global-grid"><div class="global-markets reveal"><p class="global-statement">Centralised strategy.<br>Local expertise.<br><em>Global opportunity.</em></p><div class="locations" aria-label="Global markets">
<button type="button" data-market="ae" disabled><img src="flags/ae.svg" alt="" width="24" height="24"><span>United Arab Emirates</span><small>01</small></button>
<button type="button" data-market="in" disabled><img src="flags/in.svg" alt="" width="24" height="24"><span>India</span><small>02</small></button>
<button type="button" data-market="hk" disabled><img src="flags/hk.svg" alt="" width="24" height="24"><span>Hong Kong</span><small>03</small></button>
<button type="button" data-market="sg" disabled><img src="flags/sg.svg" alt="" width="24" height="24"><span>Singapore</span><small>04</small></button>
<button type="button" data-market="us" disabled><img src="flags/us.svg" alt="" width="24" height="24"><span>United States</span><small>05</small></button>
<button type="button" data-market="gb" disabled><img src="flags/gb.svg" alt="" width="24" height="24"><span>United Kingdom</span><small>06</small></button>
</div></div><figure class="globe-figure reveal"><div class="globe-stage"><canvas id="globe" width="640" height="640" role="img" aria-label="Globe showing AJ Holdings’ six markets. Select a country from the list to locate it."></canvas><div class="globe-fallback" aria-hidden="true"><span></span><span></span><span></span></div></div><figcaption><p id="globe-selection" aria-live="polite">Six markets. One platform.</p><div class="globe-controls" hidden><button type="button" id="globe-left" aria-label="Rotate globe west">←</button><span>DRAG TO EXPLORE</span><button type="button" id="globe-right" aria-label="Rotate globe east">→</button></div></figcaption></figure></div>
</section>
<section class="leadership-contact dark" id="leadership" aria-labelledby="leadership-title">
<div class="leadership-row reveal"><div><p class="eyebrow">[ LEADERSHIP ]</p><h2 id="leadership-title">Ankith Jain</h2><p class="leadership-role">Chairman</p></div><p class="leadership-profile">Ankith Jain leads AJ Holdings' investment strategy and long term capital allocation across its global portfolio.</p></div>
<div class="contact-top reveal" id="contact"><div><h2>Building value<br><em>across generations.</em></h2><p>For investment, corporate and strategic enquiries,<br class="desktop-break"> connect with AJ Holdings.</p><a class="button button-light" href="mailto:ankithjain@aj.holdings">Get in Touch <span aria-hidden="true">↗</span></a></div><a class="contact-email" href="mailto:ankithjain@aj.holdings">ankithjain@aj.holdings <span aria-hidden="true">↗</span></a></div>
<a href="#home" class="footer-wordmark" aria-label="AJ Holdings back to top">aj.holdings<span aria-hidden="true">↗</span></a>
</section>
</main>
<footer class="footer dark"><span>© <span id="year">2026</span> AJ Holdings. All rights reserved.</span><p>One platform. Global reach. Aligned interests.</p><a href="#home">Back to top ↑</a></footer>
</body></html>'''
p.write_text(head+body,encoding='utf-8')
