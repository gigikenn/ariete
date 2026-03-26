function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
}

const HERO_TAGLINE =
  "advising capital and luxury brands on entering elite sport";

function setupTaglineTypewriter() {
  const el = document.getElementById("heroTagline");
  if (!el) return;

  if (prefersReducedMotion()) {
    el.textContent = HERO_TAGLINE;
    return;
  }

  el.textContent = "";
  el.classList.add("hero__tagline--typing");

  let i = 0;
  const msPerChar = 26;

  function tick() {
    if (i < HERO_TAGLINE.length) {
      el.textContent += HERO_TAGLINE[i];
      i += 1;
      window.setTimeout(tick, msPerChar);
    } else {
      el.classList.remove("hero__tagline--typing");
    }
  }

  window.requestAnimationFrame(() => {
    window.setTimeout(tick, 180);
  });
}

function setupHeroScrollReveal() {
  const track = document.getElementById("heroTrack");
  const img = document.getElementById("heroImage");
  const mark = document.getElementById("heroWordmark");
  const quoteBlock = document.getElementById("heroQuoteInner");
  const closing = document.getElementById("heroClosing");
  if (!track || !img) return;
  if (prefersReducedMotion()) {
    if (mark) mark.style.setProperty("--heroMarkOpacity", "1");
    const quoteBlockRm = document.getElementById("heroQuoteInner");
    if (quoteBlockRm) {
      quoteBlockRm.style.setProperty("--heroQuoteOpacity", "1");
      quoteBlockRm.style.setProperty("--heroQuoteY", "0px");
    }
    return;
  }

  let ticking = false;

  function update() {
    ticking = false;
    const rect = track.getBoundingClientRect();
    const viewportH = window.innerHeight;

    const total = rect.height - viewportH;
    if (total <= 1) return;
    const scrolled = clamp(-rect.top, 0, total);
    const p = scrolled / total;

    const imgH = img.getBoundingClientRect().height;
    const viewport = track.querySelector(".hero__viewport");
    const viewportHeight = viewport ? viewport.getBoundingClientRect().height : viewportH;
    const maxShift = -(imgH - viewportHeight);

    const eased = 1 - Math.pow(1 - p, 2.2);
    const shift = maxShift * eased;

    img.style.setProperty("--heroShift", `${shift}px`);

    if (mark) mark.style.setProperty("--heroMarkOpacity", "1");

    if (quoteBlock) {
      const inStart = 0.16;
      const inEnd = 0.26;
      const outStart = 0.52;
      const outEnd = 0.72;

      const tIn = clamp((p - inStart) / (inEnd - inStart), 0, 1);
      const easedIn = 1 - Math.pow(1 - tIn, 2.4);

      const tOut = clamp((p - outStart) / (outEnd - outStart), 0, 1);
      const easedOut = Math.pow(tOut, 1.8);

      const scrollOpacity = clamp(easedIn * (1 - easedOut), 0, 1);
      const scrollY = 18 * (1 - easedIn) + -10 * easedOut;
      /* Keep copy visible at load so the tagline typewriter can be read */
      const introBlend = clamp(1 - p / 0.18, 0, 1);
      const opacity = Math.max(scrollOpacity, introBlend);
      const y = introBlend > 0 ? 0 : scrollY;
      quoteBlock.style.setProperty("--heroQuoteOpacity", String(opacity));
      quoteBlock.style.setProperty("--heroQuoteY", `${y}px`);
    }

    if (closing) {
      const start = 0.9;
      const end = 0.96;
      const t = clamp((p - start) / (end - start), 0, 1);
      const easedIn = 1 - Math.pow(1 - t, 2.2);
      closing.style.setProperty("--heroClosingOpacity", String(easedIn));
      closing.style.setProperty("--heroClosingY", `${18 * (1 - easedIn)}px`);
    }
  }

  function requestTick() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);

  requestTick();
}

setupTaglineTypewriter();
setupHeroScrollReveal();

