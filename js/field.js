/* AJ Holdings — the field.
 *
 * One point cloud carries the whole narrative. Every particle knows six
 * positions, computed procedurally in the vertex shader from its own seed, and
 * scroll blends between them:
 *
 *   0  Opening    a whole sphere            — one platform
 *   1  Mandate    an ascending helix        — capital held, compounding
 *   2  Capital    five soft columns         — allocation made visible
 *   3  Portfolio  a far dust plane          — the field steps back
 *   4  Reach      a wire globe, six marks   — where the capital sits
 *   5  Contact    a single closing ring     — the aperture shuts
 *
 * Decorative only. Any failure here leaves the document intact.
 */

const canvas = document.getElementById('field');

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

if (canvas && supportsWebGL()) {
  init().catch(() => { /* field is optional; stay silent */ });
}

async function init() {
  const THREE = await import('three');

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;

  /* ------------------------------------------------------------- config */

  const COUNT = coarse || window.innerWidth < 720 ? 7000 : 17000;
  const MARKERS_PER_SITE = 85;
  const SITES = [
    [25.20, 55.27],   // United Arab Emirates
    [19.08, 72.88],   // India
    [22.32, 114.17],  // Hong Kong
    [1.35, 103.82],   // Singapore
    [40.71, -74.01],  // United States
    [51.51, -0.13]    // United Kingdom
  ];
  const GLOBE_R = 1.72;

  // Per-chapter camera distance. Subtle — the field moves, not the viewer.
  const CAM_Z = [5.0, 4.65, 5.25, 5.1, 4.75, 4.4];

  // Per-chapter brightness. Chapter 3 all but disappears so the logo wall
  // carries the frame; chapter 5 sits back so the ring reads as a halo
  // rather than a solid band.
  const GLOW = [0.82, 0.80, 0.78, 0.20, 0.80, 0.46];

  // Where each formation sits in frame. The copy is left-aligned, so on wide
  // screens the field is pushed into the right half and scaled to sit beside
  // it rather than under it. Chapter 3 is the exception: the dust plane is
  // meant to be full-bleed and nearly invisible.
  const LAYOUT = [
    { s: 0.74, x: 1.28 },   // 0 sphere
    { s: 0.62, x: 1.55 },   // 1 helix
    { s: 0.70, x: 1.78 },   // 2 columns
    { s: 1.00, x: 0.00 },   // 3 dust — full bleed
    { s: 0.72, x: 1.45 },   // 4 globe
    { s: 0.55, x: 1.42 }    // 5 ring
  ];

  /* ---------------------------------------------------------- attributes */

  const positions = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT * 3);
  const indices = new Float32Array(COUNT);
  const marker = new Float32Array(COUNT);
  const markerPos = new Float32Array(COUNT * 3);

  const markerStart = COUNT - SITES.length * MARKERS_PER_SITE;

  for (let i = 0; i < COUNT; i++) {
    const t = i / COUNT;

    // `position` exists only so three has sane bounds; the shader ignores it.
    const y = 1 - 2 * t;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const a = i * 2.399963;
    positions[i * 3] = Math.cos(a) * r * 1.8;
    positions[i * 3 + 1] = y * 1.8;
    positions[i * 3 + 2] = Math.sin(a) * r * 1.8;

    seeds[i * 3] = Math.random();
    seeds[i * 3 + 1] = Math.random();
    seeds[i * 3 + 2] = Math.random();

    indices[i] = i;

    if (i >= markerStart) {
      const site = SITES[Math.floor((i - markerStart) / MARKERS_PER_SITE)];
      const lat = (site[0] * Math.PI) / 180;
      const lon = (site[1] * Math.PI) / 180;
      // Scatter within a small cap around the site, then lift off the surface.
      const jr = Math.sqrt(Math.random()) * 0.06;
      const ja = Math.random() * Math.PI * 2;
      const la = lat + Math.cos(ja) * jr;
      const lo = lon + (Math.sin(ja) * jr) / Math.max(0.2, Math.cos(lat));
      const rr = GLOBE_R * (1 + Math.random() * 0.045);
      markerPos[i * 3] = Math.cos(la) * Math.cos(lo) * rr;
      markerPos[i * 3 + 1] = Math.sin(la) * rr;
      markerPos[i * 3 + 2] = Math.cos(la) * Math.sin(lo) * rr;
      marker[i] = 1;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
  geometry.setAttribute('aIndex', new THREE.BufferAttribute(indices, 1));
  geometry.setAttribute('aMarker', new THREE.BufferAttribute(marker, 1));
  geometry.setAttribute('aMarkerPos', new THREE.BufferAttribute(markerPos, 3));

  /* -------------------------------------------------------------- shader */

  const vertexShader = /* glsl */`
    attribute vec3  aSeed;
    attribute float aIndex;
    attribute float aMarker;
    attribute vec3  aMarkerPos;

    uniform float uTime;
    uniform float uForm;
    uniform float uCount;
    uniform float uSize;
    uniform float uDpr;
    uniform vec3  uColor;
    uniform vec3  uGold;

    varying vec3  vColor;
    varying float vFade;

    const float TAU = 6.2831853;

    float hash11(float p) {
      p = fract(p * 0.1031);
      p *= p + 33.33;
      p *= p + p;
      return fract(p);
    }

    mat2 rot(float a) {
      float c = cos(a), s = sin(a);
      return mat2(c, -s, s, c);
    }

    // 0 — Opening: an even sphere. The platform, whole.
    vec3 fSphere(float t, vec3 s) {
      float y = 1.0 - 2.0 * t;
      float r = sqrt(max(0.0, 1.0 - y * y));
      float a = aIndex * 2.399963;
      vec3 p = vec3(cos(a) * r, y, sin(a) * r);
      p *= 1.78 + (s.x - 0.5) * 0.07;
      p *= 1.0 + sin(uTime * 0.35) * 0.012;   // a slow breath
      p.xz *= rot(uTime * 0.055);
      return p;
    }

    // 1 — Mandate: an ascending helix. Held capital, compounding.
    vec3 fHelix(float t, vec3 s) {
      float a = t * TAU * 5.0 + uTime * 0.16;
      float r = 0.22 + t * 1.05 + (s.x - 0.5) * 0.07;
      vec3 p = vec3(cos(a) * r, (t - 0.5) * 2.5 + (s.y - 0.5) * 0.05, sin(a) * r);
      p.yz *= rot(0.14);
      return p;
    }

    // 2 — Capital: five columns. Allocation made visible.
    vec3 fColumns(float t, vec3 s) {
      float k = floor(s.x * 5.0);
      float h = 0.80 + hash11(k * 7.13) * 1.05;
      // Uniform along the column: any density gradient here reads as a stripe.
      float v = s.z * 2.0 - 1.0;
      return vec3(
        (k - 2.0) * 0.62 + (s.y - 0.5) * 0.17,
        v * h + sin(uTime * 0.5 + k * 1.7) * 0.05,
        (hash11(aIndex * 0.37) - 0.5) * 0.17
      );
    }

    // 3 — Portfolio: the field retreats so the logo wall carries the frame.
    vec3 fDust(float t, vec3 s) {
      return vec3(
        (s.x - 0.5) * 11.0 + sin(uTime * 0.07 + s.z * TAU) * 0.35,
        (s.y - 0.5) * 7.0,
        -4.0 - s.z * 7.0
      );
    }

    // 4 — Reach: a wire globe; six holdings burn gold.
    vec3 fGlobe(float t, vec3 s) {
      float pick = hash11(aIndex * 1.71);
      float lat, lon;
      if (pick < 0.5) {                                              // parallels
        lat = (floor(hash11(aIndex * 3.31) * 7.0) - 3.0) * 0.3490658;
        lon = hash11(aIndex * 5.93) * TAU;
      } else {                                                       // meridians
        lon = floor(hash11(aIndex * 7.77) * 12.0) * 0.5235988;
        lat = (hash11(aIndex * 11.13) - 0.5) * 3.1415927;
      }
      vec3 grid = vec3(cos(lat) * cos(lon), sin(lat), cos(lat) * sin(lon)) * 1.72;
      vec3 p = mix(grid, aMarkerPos, aMarker);
      p.xz *= rot(uTime * 0.075);
      p.yz *= rot(0.28);                       // tip the pole toward the viewer
      return p;
    }

    // 5 — Contact: everything closes to one ring.
    vec3 fRing(float t, vec3 s) {
      float a = t * TAU + uTime * 0.06;
      float r = 1.55 + (s.x - 0.5) * 0.34;   // a soft band, not a hard wire
      vec3 p = vec3(cos(a) * r, sin(a) * r * 0.60, (s.y - 0.5) * 0.30);
      p.yz *= rot(-0.22);
      return p;
    }

    float weight(float i) {
      return max(0.0, 1.0 - abs(uForm - i));
    }

    void main() {
      float t = aIndex / uCount;
      vec3 s = aSeed;

      // Only ever two of these are non-zero, but branchless is cheaper than
      // diverging across a warp.
      float w0 = weight(0.0), w1 = weight(1.0), w2 = weight(2.0);
      float w3 = weight(3.0), w4 = weight(4.0), w5 = weight(5.0);
      float sum = w0 + w1 + w2 + w3 + w4 + w5 + 1e-5;

      vec3 p =
        fSphere(t, s)  * w0 +
        fHelix(t, s)   * w1 +
        fColumns(t, s) * w2 +
        fDust(t, s)    * w3 +
        fGlobe(t, s)   * w4 +
        fRing(t, s)    * w5;
      p /= sum;

      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;

      float dist = max(-mv.z, 0.1);
      float globe = w4 / sum;

      gl_PointSize = uSize * uDpr * (3.4 / dist) * (1.0 + aMarker * globe * 0.9);
      gl_PointSize = clamp(gl_PointSize, 0.8, 16.0);

      vFade = smoothstep(17.0, 3.0, dist) * (0.34 + 0.66 * hash11(aIndex * 0.913));
      vColor = mix(uColor, uGold, clamp(aMarker * globe * 1.3 + t * 0.10, 0.0, 1.0));
    }
  `;

  const fragmentShader = /* glsl */`
    uniform float uOpacity;

    varying vec3  vColor;
    varying float vFade;

    void main() {
      float d = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.5, 0.06, d);
      if (a < 0.01) discard;
      gl_FragColor = vec4(vColor, a * vFade * uOpacity);
    }
  `;

  const uniforms = {
    uTime:    { value: 0 },
    uForm:    { value: 0 },
    uCount:   { value: COUNT },
    uSize:    { value: coarse ? 3.4 : 4.2 },
    uDpr:     { value: 1 },
    uOpacity: { value: 0 },
    uColor:   { value: new THREE.Color('#efe9e0') },
    uGold:    { value: new THREE.Color('#e0a94e') }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  /* --------------------------------------------------------------- scene */

  const scene = new THREE.Scene();
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, CAM_Z[0]);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,      // additive points do not alias; skip the cost
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setClearAlpha(0);

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    uniforms.uDpr.value = dpr;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* ---------------------------------------------------------------- loop */

  const story = window.__ajStory || { form: 0 };
  const pointer = window.__ajPointer || { x: 0, y: 0 };

  points.scale.setScalar(LAYOUT[0].s);
  let form = story.form;         // damped follower of the scroll target
  let camZ = CAM_Z[0];
  let px = 0, py = 0;
  let opacity = 0;
  let lastSig = NaN;
  let last = performance.now();
  let running = true;

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, k) => a + (b - a) * k;

  function sample(arr, x) {
    const i = clamp(Math.floor(x), 0, arr.length - 1);
    const j = clamp(i + 1, 0, arr.length - 1);
    return lerp(arr[i], arr[j], clamp(x - i, 0, 1));
  }

  function sampleKey(arr, x, key) {
    const i = clamp(Math.floor(x), 0, arr.length - 1);
    const j = clamp(i + 1, 0, arr.length - 1);
    return lerp(arr[i][key], arr[j][key], clamp(x - i, 0, 1));
  }

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);

    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    // Frame-rate independent easing toward the scroll-driven target.
    const k = 1 - Math.pow(0.001, dt);
    const target = clamp(story.form, 0, LAYOUT.length - 1);

    if (reduced) {
      form = target;
    } else {
      form = lerp(form, target, k);
      uniforms.uTime.value += dt;
    }
    uniforms.uForm.value = form;

    // How wide is the viewport, as 0..1 — drives how far right the field is
    // pushed and how large it can be before it crowds the copy.
    const wide = clamp((window.innerWidth - 900) / 460, 0, 1);

    const targetOpacity = sample(GLOW, form) * (0.6 + 0.4 * wide);
    opacity = lerp(opacity, targetOpacity, k);
    uniforms.uOpacity.value = opacity;

    points.position.x = lerp(points.position.x, sampleKey(LAYOUT, form, 'x') * wide, k);
    const s = sampleKey(LAYOUT, form, 's') * (0.74 + 0.26 * wide);
    points.scale.setScalar(lerp(points.scale.x, s, k));

    camZ = lerp(camZ, sample(CAM_Z, form), k);
    px = lerp(px, pointer.x * 0.42, k * 0.55);
    py = lerp(py, -pointer.y * 0.30, k * 0.55);

    camera.position.set(px, py, camZ);
    camera.lookAt(0, 0, 0);

    // With reduced motion nothing animates on its own, so redraw only when
    // scrolling has actually moved something.
    if (reduced) {
      const sig = form + opacity + points.position.x + camZ;
      if (Math.abs(sig - lastSig) < 1e-4) return;
      lastSig = sig;
    }

    renderer.render(scene, camera);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
    } else if (!running) {
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    }
  });

  requestAnimationFrame(frame);
  document.body.classList.add('field-ready');
}
