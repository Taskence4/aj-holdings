/* Local, on-demand globe. No remote map service or continuous animation loop. */
(() => {
  "use strict";
  const canvas = document.querySelector("#globe");
  const land = window.AJ_GLOBE_LAND;
  if (!canvas || !land) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const figure = canvas.closest(".globe-figure");
  const label = document.querySelector("#globe-selection");
  const buttons = [...document.querySelectorAll("[data-market]")];
  // Representative geographic points for markets, not claimed office addresses.
  const markets = {
    ae: { name: "United Arab Emirates", lon: 54.5, lat: 24.5 },
    in: { name: "India", lon: 79, lat: 22 },
    hk: { name: "Hong Kong", lon: 114.2, lat: 22.3 },
    sg: { name: "Singapore", lon: 103.8, lat: 1.4 },
    us: { name: "United States", lon: -98, lat: 39 },
    gb: { name: "United Kingdom", lon: -2, lat: 54 },
  };
  const rad = Math.PI / 180;
  const tilt = 23 * rad;
  const styles = getComputedStyle(document.documentElement);
  const theme = {
    yellow: styles.getPropertyValue("--brand-yellow").trim(),
    paper: styles.getPropertyValue("--paper").trim(),
    forest: styles.getPropertyValue("--forest").trim(),
    deep: styles.getPropertyValue("--forest-deep").trim(),
    land: styles.getPropertyValue("--globe-land").trim(),
    highlight: styles.getPropertyValue("--globe-highlight").trim() || "#187243",
  };
  let longitude = 45,
    size = 640,
    radius = 253,
    selected = null,
    animation;
  let pointer = null;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  function project(lon, lat) {
    const a = (lon - longitude) * rad,
      b = lat * rad;
    const x = Math.cos(b) * Math.sin(a);
    const y =
      Math.sin(b) * Math.cos(tilt) - Math.cos(b) * Math.cos(a) * Math.sin(tilt);
    const z =
      Math.sin(b) * Math.sin(tilt) + Math.cos(b) * Math.cos(a) * Math.cos(tilt);
    return { x: size / 2 + x * radius, y: size / 2 - y * radius, z };
  }
  function line(points) {
    ctx.beginPath();
    let pen = false;
    for (const [lon, lat] of points) {
      const p = project(lon, lat);
      if (p.z < 0) {
        pen = false;
        continue;
      }
      if (pen) ctx.lineTo(p.x, p.y);
      else ctx.moveTo(p.x, p.y);
      pen = true;
    }
    ctx.stroke();
  }
  function draw() {
    ctx.clearRect(0, 0, size, size);
    const c = size / 2;
    const glow = ctx.createRadialGradient(
      c,
      c,
      radius * 0.85,
      c,
      c,
      radius * 1.17,
    );
    glow.addColorStop(0, theme.yellow + "12");
    glow.addColorStop(1, theme.yellow + "00");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);
    const ocean = ctx.createRadialGradient(
      c - radius * 0.35,
      c - radius * 0.4,
      0,
      c,
      c,
      radius,
    );
    ocean.addColorStop(0, theme.highlight);
    ocean.addColorStop(0.6, theme.forest);
    ocean.addColorStop(1, theme.deep);
    ctx.beginPath();
    ctx.arc(c, c, radius, 0, Math.PI * 2);
    ctx.fillStyle = ocean;
    ctx.fill();
    ctx.strokeStyle = theme.land + "24";
    ctx.lineWidth = 0.7;
    for (let lat = -60; lat <= 60; lat += 30)
      line(Array.from({ length: 181 }, (_, i) => [-180 + i * 2, lat]));
    for (let lon = -180; lon < 180; lon += 30)
      line(Array.from({ length: 91 }, (_, i) => [lon, -90 + i * 2]));
    for (const [lon, lat] of land) {
      const p = project(lon, lat);
      if (p.z <= 0) continue;
      ctx.fillStyle =
        theme.land +
        Math.round((0.3 + p.z * 0.6) * 255)
          .toString(16)
          .padStart(2, "0");
      ctx.beginPath();
      ctx.arc(
        p.x,
        p.y,
        Math.max(0.65, size * 0.0021) * (0.6 + p.z * 0.4),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.strokeStyle = theme.land + "55";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(c, c, radius, 0, Math.PI * 2);
    ctx.stroke();
    for (const [key, m] of Object.entries(markets)) {
      const p = project(m.lon, m.lat);
      if (p.z < 0.04) continue;
      const active = selected === key;
      ctx.beginPath();
      ctx.arc(p.x, p.y, active ? 10 : 7, 0, Math.PI * 2);
      ctx.fillStyle = active ? theme.yellow + "26" : theme.yellow + "12";
      ctx.fill();
      ctx.strokeStyle = active ? theme.yellow : theme.yellow + "80";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(p.x, p.y, active ? 3.4 : 2.4, 0, Math.PI * 2);
      ctx.fillStyle = theme.yellow;
      ctx.fill();
      if (active) {
        ctx.font = `500 ${Math.max(11, size * 0.02)}px Manrope, sans-serif`;
        ctx.textAlign = "center";
        const textWidth = ctx.measureText(m.name).width;
        const x = Math.min(
          size - textWidth / 2 - 10,
          Math.max(textWidth / 2 + 10, p.x),
        );
        ctx.fillStyle = theme.deep + "eb";
        ctx.fillRect(x - textWidth / 2 - 8, p.y - 37, textWidth + 16, 23);
        ctx.fillStyle = theme.paper;
        ctx.fillText(m.name, x, p.y - 21);
      }
    }
  }
  function resize() {
    size = canvas.getBoundingClientRect().width;
    if (size <= 0) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    radius = size * 0.415;
    draw();
  }
  function rotateTo(target) {
    cancelAnimationFrame(animation);
    const start = longitude,
      delta = ((((target - start) % 360) + 540) % 360) - 180;
    if (reducedMotion.matches) {
      longitude = start + delta;
      draw();
      return;
    }
    const startTime = performance.now();
    function frame(now) {
      const progress = Math.min(1, (now - startTime) / 700);
      longitude = start + delta * (1 - Math.pow(1 - progress, 3));
      draw();
      if (progress < 1) animation = requestAnimationFrame(frame);
    }
    animation = requestAnimationFrame(frame);
  }
  function clearSelection() {
    selected = null;
    buttons.forEach((b) => b.setAttribute("aria-pressed", "false"));
    label.textContent = "Six markets. One platform.";
  }
  buttons.forEach((button) => {
    button.disabled = false;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      selected = button.dataset.market;
      buttons.forEach((b) =>
        b.setAttribute("aria-pressed", String(b === button)),
      );
      label.textContent = markets[selected].name;
      rotateTo(markets[selected].lon);
    });
  });
  document.querySelector("#globe-left").addEventListener("click", () => {
    clearSelection();
    rotateTo(longitude - 35);
  });
  document.querySelector("#globe-right").addEventListener("click", () => {
    clearSelection();
    rotateTo(longitude + 35);
  });
  canvas.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    cancelAnimationFrame(animation);
    pointer = { id: event.pointerId, x: event.clientX, longitude };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    if (Math.abs(event.clientX - pointer.x) < 3) return;
    if (selected) clearSelection();
    longitude = pointer.longitude - (event.clientX - pointer.x) * 0.4;
    draw();
  });
  function release(event) {
    if (pointer?.id === event.pointerId) pointer = null;
  }
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);
  figure.classList.add("globe-ready");
  figure.querySelector(".globe-controls").hidden = false;
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener("resize", resize);
  document.fonts.ready.then(resize);
  resize();
})();
