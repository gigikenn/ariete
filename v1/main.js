// IV Partners prototype: scroll-driven hero reveal + tiny quality-of-life touches.

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
}

function setupHeroScrollReveal() {
  const track = document.getElementById("heroTrack");
  const img = document.getElementById("heroImage");
  const mark = document.getElementById("heroWordmark");
  const quoteText = document.querySelector("#heroQuote .hero__quoteText");
  const closing = document.getElementById("heroClosing");
  if (!track || !img) return;
  if (prefersReducedMotion()) return;

  let ticking = false;

  function update() {
    ticking = false;
    const rect = track.getBoundingClientRect();
    const viewportH = window.innerHeight;

    // Progress across the tall track: 0 at top, 1 at bottom.
    const total = rect.height - viewportH;
    if (total <= 1) return;
    const scrolled = clamp(-rect.top, 0, total);
    const p = scrolled / total;

    // How far can the image shift?
    // The image is taller than the viewport; reveal by translating upward.
    const imgH = img.getBoundingClientRect().height;
    const viewport = track.querySelector(".hero__viewport");
    const viewportHeight = viewport ? viewport.getBoundingClientRect().height : viewportH;
    const maxShift = -(imgH - viewportHeight);

    // Ease a bit to feel like "dragging" rather than linear camera.
    const eased = 1 - Math.pow(1 - p, 2.2);
    const shift = maxShift * eased;

    img.style.setProperty("--heroShift", `${shift}px`);

    // Keep the IV mark steady.
    if (mark) mark.style.setProperty("--heroMarkOpacity", "1");

    // Quote: floats in, then clears away (leaving a pause on pure image).
    if (quoteText) {
      const inStart = 0.16;
      const inEnd = 0.26;
      // Let it breathe: hold longer before fading out.
      const outStart = 0.52;
      const outEnd = 0.72;

      const tIn = clamp((p - inStart) / (inEnd - inStart), 0, 1);
      const easedIn = 1 - Math.pow(1 - tIn, 2.4);

      const tOut = clamp((p - outStart) / (outEnd - outStart), 0, 1);
      const easedOut = Math.pow(tOut, 1.8);

      const opacity = clamp(easedIn * (1 - easedOut), 0, 1);
      const y = 18 * (1 - easedIn) + -10 * easedOut;
      quoteText.style.setProperty("--heroQuoteOpacity", String(opacity));
      quoteText.style.setProperty("--heroQuoteY", `${y}px`);
    }

    // Closing overlay: appears late, after a clear “breathing” gap (~3s of scrolling).
    if (closing) {
      const start = 0.90;
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

  // Initial paint.
  requestTick();
}

function setupYear() {
  const el = document.getElementById("year");
  if (!el) return;
  el.textContent = String(new Date().getFullYear());
}

setupHeroScrollReveal();
setupYear();

