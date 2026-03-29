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
  const quoteBlock = document.getElementById("heroQuoteInner");
  const tagline = document.getElementById("heroTagline");
  const quoteText = document.querySelector("#heroQuote .hero__quoteText");
  const closing = document.getElementById("heroClosing");
  if (!track || !img) return;
  if (prefersReducedMotion()) {
    if (mark) mark.style.setProperty("--heroMarkOpacity", "1");
    const quoteBlockRm = document.getElementById("heroQuoteInner");
    if (quoteBlockRm) {
      quoteBlockRm.style.setProperty("--heroQuoteOpacity", "1");
      quoteBlockRm.style.setProperty("--heroQuoteY", "0px");
    }
    if (tagline) {
      tagline.style.setProperty("--heroTaglineOpacity", "1");
      tagline.style.setProperty("--heroTaglineY", "0px");
      tagline.querySelectorAll(".hero__taglineList li").forEach((li) => {
        li.style.removeProperty("--heroTaglineLineOpacity");
        li.style.removeProperty("--heroTaglineLineY");
      });
    }
    if (quoteText) {
      quoteText.style.setProperty("--heroChiOpacity", "1");
      quoteText.style.setProperty("--heroChiY", "0px");
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
      quoteBlock.style.setProperty("--heroQuoteOpacity", "1");
      quoteBlock.style.setProperty("--heroQuoteY", "0px");
    }

    if (tagline) {
      const chiInStart = 0.76;
      const fadeInStart = 0.015;
      const fadeInEnd = 0.07;
      const fadeOutStart = 0.62;
      const fadeOutEnd = chiInStart;

      const tIn = clamp((p - fadeInStart) / (fadeInEnd - fadeInStart), 0, 1);
      const easedIn = 1 - Math.pow(1 - tIn, 2.4);

      const tOut = clamp((p - fadeOutStart) / (fadeOutEnd - fadeOutStart), 0, 1);
      const easedOut = Math.pow(tOut, 2);

      const envelope = clamp(easedIn * (1 - easedOut), 0, 1);
      const y = 12 * (1 - easedIn) + 6 * easedOut;
      tagline.style.setProperty("--heroTaglineOpacity", String(envelope));
      tagline.style.setProperty("--heroTaglineY", `${y}px`);

      const lines = tagline.querySelectorAll(".hero__taglineList li");
      const n = lines.length;
      if (n > 0) {
        const t = clamp((p - fadeInStart) / (chiInStart - fadeInStart), 0, 1);
        const idx = Math.min(Math.floor(t * n), n - 1);
        lines.forEach((li, i) => {
          const lineOpacity = i === idx ? 1 : 0;
          const combined = lineOpacity * envelope;
          li.style.setProperty("--heroTaglineLineOpacity", String(combined));
          li.style.setProperty("--heroTaglineLineY", "0em");
        });
      }
    }

    if (quoteText) {
      const inStart = 0.76;
      const inEnd = 0.88;
      const outStart = 0.95;
      const outEnd = 0.99;

      const tIn = clamp((p - inStart) / (inEnd - inStart), 0, 1);
      const easedIn = 1 - Math.pow(1 - tIn, 2.4);

      const tOut = clamp((p - outStart) / (outEnd - outStart), 0, 1);
      const easedOut = Math.pow(tOut, 1.8);

      const opacity = clamp(easedIn * (1 - easedOut), 0, 1);
      const y = 18 * (1 - easedIn) + -8 * easedOut;
      quoteText.style.setProperty("--heroChiOpacity", String(opacity));
      quoteText.style.setProperty("--heroChiY", `${y}px`);
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

setupHeroScrollReveal();

