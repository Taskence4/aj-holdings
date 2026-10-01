# AJ Holdings

A responsive, static website inspired by the visual direction of https://verkas.framer.website/. Content and homepage order follow the supplied **Recommended AJ Holdings website structure.docx.pdf**. The header and footer wordmarks use the local Orbitron Medium font.

## Homepage structure

1. Hero — Built for lasting value.
2. About / investment philosophy — Long term capital. Independent thinking.
3. Asset classes — the five supplied categories and descriptions.
4. Investment strategies — the five supplied strategies and descriptions.
5. Portfolio — seven company logos plus one digital-assets tile (Bitcoin, Ethereum, Solana); selecting one shows a one-sentence company note (draft copy, pending client confirmation).
6. Global platform — six markets and an interactive globe.
7. Leadership and contact — supplied Chairman profile and final contact CTA.

The navigation points to existing sections. Insights is omitted because no editorial content was supplied. FAQs, duplicated portfolio strips, promotional statements, and numeric proof-point blocks have been removed.

## Color palette

The palette is visually matched to the supplied logo and off-white reference:

- Green `#087930`: primary brand accents and highlighted headings on light backgrounds.
- Golden yellow `#E6A50A`: calls to action, highlights on dark sections, and globe markers.
- Off-white `#F7F6F1`: light surfaces and text on dark sections.
- Supporting forest tones `#063B25`, `#042D1C`, and `#085032`: dark sections and image overlays.
- Darker green `#006B24`: small labels on off-white for text contrast.

The globe reads its palette from the same CSS variables as the page.

## Preview

- `index.html`: green, golden yellow, and off-white version.
- `classic.html`: alternate version using the original ivory, muted gold, and charcoal-green palette. Open this file directly or visit `/classic.html` when serving the project.

Both versions share assets, layout styles, and scripts. `themes/classic.css` restores the original colors only for the alternate version. The HTML entries contain the same current content; keep them synchronized when making future content changes.

Open `index.html` in a browser, or serve the directory:

```sh
python -m http.server 8000
```

There is no build step. The site uses local fonts, optimized images, native HTML accordions, and JavaScript for navigation, progressive reveal effects, and the globe. Contact buttons open the visitor's email client. Select a market or drag the globe to explore; rotation buttons provide a keyboard-accessible alternative. Reduced-motion preferences are respected. All six market names remain visible without JavaScript.

## Assets

Three original images were generated with the built-in imagegen tool. The site serves optimized WebP versions in `assets/`. Generation prompts are recorded in `assets/IMAGE-PROMPTS.md`; PNG originals are retained. Imagery is conceptual and does not document AJ-owned properties or facilities. Existing portfolio logos and flags are reused. The user-supplied founder portrait is preserved in `assets/founder-original.png` and served as the optimized `assets/founder.webp`.

The globe uses locally stored geographic points sampled from [Natural Earth's public-domain 1:110m land dataset](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson). Source and derivation details are in `assets/GLOBE-SOURCE.md`. There are no runtime map-service requests. Market markers indicate representative geography, not office addresses.

## Validation

Motion enhancements include a staged hero entrance, subtle desktop hero parallax, staggered one-time section reveals, a compact fixed header with reading progress and active-section links, animated mobile navigation, reversible investment accordions, and restrained image and link hover feedback. Scrolling remains native. Reduced-motion preferences disable decorative movement, including when the preference changes during a session. No animation library or continuous animation loop is added.

`tools/motion-check.cjs` checks normal-motion behavior at desktop and mobile sizes, keyboard operation, rapid accordion changes, menu interruption, live reduced-motion changes, completed reveals, and browser errors.

Checked in Chrome at widths of 1440, 768, 390, and 320 pixels: eight-section order, content counts, Orbitron loading, images, overflow, anchors, investment accordions, globe selection/rotation/drag, mobile navigation, Escape dismissal, and JavaScript errors. Readable content and the globe fallback are checked with JavaScript disabled. Review screenshots are in `output/review/`.

Changes are local; publishing is a separate step.
