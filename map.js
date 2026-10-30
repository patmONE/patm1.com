// Home lab map: tap or hover a device to read its role; one packet runs outbound, Agents to Internet, when the map comes into view.
(() => {
  const map = document.querySelector("[data-map]");
  if (!map) return;
  const info = map.querySelector("[data-map-info]");
  const roles = {
    internet: "Internet.",
    sonicwall: "SonicWall at the edge.",
    core: "Cisco C1000 routed core.",
    pfsense: "pfSense enforces east-west policy for the IoT, Work VPN and Agents segments.",
    iot: "IoT: Home Assistant smart home on an isolated network, behind pfSense.",
    work: "Work VPN: isolated, internet-only, behind pfSense.",
    agents: "Agents: my Claude Code AI agents, each on its own VM with least-privilege access, behind pfSense.",
  };

  const nodes = map.querySelectorAll(".node");
  const show = (key) => {
    nodes.forEach((n) => n.classList.toggle("is-on", n.dataset.node === key));
    info.textContent = roles[key];
  };
  nodes.forEach((n) => {
    n.setAttribute("tabindex", "0");
    n.setAttribute("role", "button");
    n.setAttribute("aria-label", n.textContent);
    n.addEventListener("click", () => show(n.dataset.node));
    n.addEventListener("mouseenter", () => show(n.dataset.node));
    n.addEventListener("focus", () => show(n.dataset.node));
    n.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(n.dataset.node); }
    });
  });
  // With buttons inside, each drawing is a group, not one picture, so screen readers reach the devices.
  map.querySelectorAll("svg").forEach((s) => s.setAttribute("role", "group"));
  map.setAttribute("data-live", "");

  // The packet: once, only for visitors who allow motion.
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  const run = () => {
    const svg = [...map.querySelectorAll("svg")].find((s) => s.getBoundingClientRect().width > 0);
    const route = svg && svg.querySelector(".route");
    if (!route) return;
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("class", "packet");
    dot.setAttribute("r", "8");
    svg.appendChild(dot);
    show("agents");
    const length = route.getTotalLength();
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / 2400, 1);
      const p = route.getPointAtLength(length * (1 - Math.pow(1 - t, 2)));
      dot.setAttribute("cx", p.x);
      dot.setAttribute("cy", p.y);
      if (t < 1) requestAnimationFrame(step);
      else dot.remove();
    };
    requestAnimationFrame(step);
  };
  const seen = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { seen.disconnect(); run(); }
  }, { threshold: 0.5 });
  seen.observe(map);
})();
