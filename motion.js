// Motion: section parts rise in as they scroll into view; the status figures count up to their real value.
// Nothing runs for visitors who ask for less motion, and without this script everything is simply shown.
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

  const parts = document.querySelectorAll(
    ".section > .wrap > h2, .job, .lab h2, .lab .lead, .lab li, .map, .skills .row, .contact h2, .contact .mail, .contact p"
  );
  const rise = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      rise.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  parts.forEach((el) => {
    // Only what is still below the screen; what the visitor already sees stays put.
    if (el.getBoundingClientRect().top < innerHeight) return;
    const order = [...el.parentElement.children].indexOf(el);
    el.style.setProperty("--delay", Math.min(order, 5) * 70 + "ms");
    el.classList.add("reveal");
    rise.observe(el);
  });

  // Figures: count from zero to the number already written in the page.
  const count = (dd) => {
    const text = [...dd.childNodes].find((n) => n.nodeType === 3 && /\d/.test(n.nodeValue));
    if (!text) return;
    const [, before, digits, after] = text.nodeValue.match(/^(\D*)([\d,]+)(.*)$/s) || [];
    if (!digits) return;
    const target = Number(digits.replace(/,/g, ""));
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / 1200, 1);
      const value = Math.round(target * (1 - Math.pow(1 - t, 3)));
      text.nodeValue = before + value.toLocaleString("en-US") + after;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const band = document.querySelector(".status");
  if (!band) return;
  const seen = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    seen.disconnect();
    band.querySelectorAll("dd").forEach(count);
  }, { threshold: 0.4 });
  seen.observe(band);
})();
