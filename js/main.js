"use strict";
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
let menuAnimation;
function setMenu(open) {
  menuAnimation?.cancel();
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
  document.body.classList.toggle("menu-open", open);
  mobileNav.inert = !open;
  if (open) {
    mobileNav.hidden = false;
    if (!motionPreference.matches) {
      menuAnimation = mobileNav.animate(
        [
          { opacity: 0, transform: "translateY(-12px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 320, easing: "cubic-bezier(.22,1,.36,1)" },
      );
      mobileNav.querySelectorAll("a").forEach((link, i) => {
        link.getAnimations().forEach((a) => a.cancel());
        link.animate(
          [
            { opacity: 0, transform: "translateY(14px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration: 400,
            delay: 65 + i * 38,
            easing: "cubic-bezier(.22,1,.36,1)",
            fill: "backwards",
          },
        );
      });
    }
  } else if (!mobileNav.hidden && !motionPreference.matches) {
    menuAnimation = mobileNav.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 180,
      easing: "ease-out",
    });
    menuAnimation.onfinish = () => {
      mobileNav.hidden = true;
    };
  } else mobileNav.hidden = true;
}
menuButton.addEventListener("click", () =>
  setMenu(menuButton.getAttribute("aria-expanded") !== "true"),
);
mobileNav.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    setMenu(false);
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  }),
);
document.addEventListener("keydown", (event) => {
  if (menuButton.getAttribute("aria-expanded") !== "true") return;
  if (event.key === "Escape") {
    setMenu(false);
    menuButton.focus();
  }
  if (event.key === "Tab") {
    const items = [menuButton, ...mobileNav.querySelectorAll("a")];
    const first = items[0],
      last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
matchMedia("(min-width: 761px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});

// Reveal only once. Delays belong to small related groups, never whole sections.
const revealGroups = [".portfolio-wall > div", ".locations > button"];
revealGroups.forEach((selector) =>
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add("reveal");
    el.style.setProperty("--reveal-delay", `${Math.min(i % 5, 4) * 55}ms`);
  }),
);
document.querySelector(".portfolio-wall")?.classList.remove("reveal");
document
  .querySelectorAll(".strategy")
  .forEach((el, i) =>
    el.style.setProperty("--reveal-delay", `${(i % 3) * 55}ms`),
  );
let revealObserver;
if ("IntersectionObserver" in window && !motionPreference.matches) {
  revealObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("pending");
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      }),
    { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
  );
  document.querySelectorAll(".reveal").forEach((el) => {
    el.classList.add("pending");
    revealObserver.observe(el);
  });
}

// One requested frame per scroll update; no background animation loop.
const header = document.querySelector(".masthead");
const hero = document.querySelector(".hero");
const sectionLinks = [
  ...document.querySelectorAll(".desktop-nav a, .nav-contact"),
];
let sectionPositions = [],
  pageHeight = 1,
  heroHeight = 1,
  scrollFrame = 0;
function measure() {
  sectionPositions = sectionLinks.map((link) => ({
    link,
    top: document.querySelector(link.hash)?.offsetTop ?? 0,
  }));
  pageHeight = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  heroHeight = hero.offsetHeight;
  requestScrollFrame();
}
function updateScroll() {
  scrollFrame = 0;
  const y = window.scrollY;
  header.classList.toggle("is-scrolled", y > 45);
  header.style.setProperty(
    "--reading-progress",
    Math.min(1, Math.max(0, y / pageHeight)),
  );
  const current = [...sectionPositions]
    .reverse()
    .find((item) => y + innerHeight * 0.32 >= item.top);
  sectionPositions.forEach(({ link }) => {
    if (link === current?.link) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  if (!motionPreference.matches && innerWidth > 760 && y < heroHeight)
    hero.style.setProperty("--hero-drift", `${Math.min(48, y * 0.075)}px`);
  else if (motionPreference.matches || innerWidth <= 760)
    hero.style.setProperty("--hero-drift", "0px");
}
function requestScrollFrame() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
}
window.addEventListener("scroll", requestScrollFrame, { passive: true });
window.addEventListener("resize", measure, { passive: true });
if ("ResizeObserver" in window)
  new ResizeObserver(measure).observe(document.body);
document.fonts.ready.then(measure);
measure();

// Preserve native details behavior without scripting or with reduced motion.
const accordions = [...document.querySelectorAll(".asset-list details")];
const accordionAnimations = new Map();
function transitionDetails(details, open) {
  const start = details.getBoundingClientRect().height;
  accordionAnimations.get(details)?.animation.cancel();
  details.open = true;
  details.style.height = "auto";
  const end = open
    ? details.getBoundingClientRect().height
    : details.querySelector("summary").getBoundingClientRect().height + 1;
  details.style.overflow = "hidden";
  const animation = details.animate(
    [{ height: `${start}px` }, { height: `${end}px` }],
    { duration: 360, easing: "cubic-bezier(.22,1,.36,1)" },
  );
  const record = { animation, open };
  accordionAnimations.set(details, record);
  animation.onfinish = () => {
    if (accordionAnimations.get(details) !== record) return;
    details.open = open;
    details.style.removeProperty("height");
    details.style.removeProperty("overflow");
    accordionAnimations.delete(details);
  };
}
accordions.forEach((details) =>
  details.querySelector("summary").addEventListener("click", (event) => {
    if (motionPreference.matches) return;
    event.preventDefault();
    // Native grouping is reinstated when reduced motion is requested.
    accordions.forEach((item) => item.removeAttribute("name"));
    const open = !(accordionAnimations.get(details)?.open ?? details.open);
    if (open)
      accordions.forEach((other) => {
        if (
          other !== details &&
          (accordionAnimations.get(other)?.open ?? other.open)
        )
          transitionDetails(other, false);
      });
    transitionDetails(details, open);
  }),
);
const heroVideo = document.querySelector("video.hero-image");
function syncHeroVideo() {
  if (!heroVideo) return;
  if (motionPreference.matches) heroVideo.pause();
  else heroVideo.play().catch(() => {});
}
syncHeroVideo();
motionPreference.addEventListener("change", () => {
  syncHeroVideo();
  if (motionPreference.matches) {
    revealObserver?.disconnect();
    document
      .querySelectorAll(".reveal.pending")
      .forEach((el) => el.classList.remove("pending"));
    for (const [details, record] of accordionAnimations) {
      record.animation.cancel();
      details.open = record.open;
      details.style.removeProperty("height");
      details.style.removeProperty("overflow");
    }
    accordionAnimations.clear();
    accordions.forEach((item) => item.setAttribute("name", "asset-class"));
    menuAnimation?.cancel();
    mobileNav.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    mobileNav.hidden = menuButton.getAttribute("aria-expanded") !== "true";
  }
  requestScrollFrame();
});
document.getElementById("year").textContent = new Date().getFullYear();

// Portfolio: one company note open at a time; Escape or a click elsewhere closes it.
const portfolioLogos = document.querySelectorAll(".portfolio-logo");
function setPortfolioNote(button, open) {
  button.setAttribute("aria-expanded", String(open));
  document.getElementById(button.getAttribute("aria-controls")).hidden = !open;
}
portfolioLogos.forEach((button) =>
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") !== "true";
    portfolioLogos.forEach((other) => setPortfolioNote(other, false));
    setPortfolioNote(button, open);
  }),
);
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const open = document.querySelector('.portfolio-logo[aria-expanded="true"]');
  if (open) {
    setPortfolioNote(open, false);
    open.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".portfolio-wall"))
    portfolioLogos.forEach((button) => setPortfolioNote(button, false));
});
