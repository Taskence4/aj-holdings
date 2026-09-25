# Globe geography

- Source: Natural Earth, 1:110m land, public domain.
- Dataset: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson
- Terms: https://www.naturalearthdata.com/about/terms-of-use/
- Local source copy: `output/review/natural-earth-land.geojson`.
- Derived asset: `assets/globe-land.js`, a two-degree grid sampled within the land polygons, excluding Antarctica for this market-focused view.
- Rebuild: `python tools/build-globe-data.py`.
- Rendering: local canvas with orthographic projection. No remote dependencies or animation while idle.
- The six locations and labels come from the user's content document. Markers represent markets and do not assert office addresses.
