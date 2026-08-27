/* =========================================================
   NEXUS CODING CLUB — SOCIAL HUB
   Ambient "node network" background animation.

   This is purely decorative and represents the idea of a
   "nexus": many points connecting to one another. It is kept
   deliberately subtle and pauses automatically for visitors
   who prefer reduced motion.
   ========================================================= */

(function () {
  const canvas = document.getElementById("nexus-canvas");
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Respect the user's motion preference: skip the animation entirely.
  if (prefersReducedMotion) return;

  const ctx = canvas.getContext("2d");
  let width, height, nodes;
  let animationFrameId;

  const NODE_COUNT_DENSITY = 18000; // higher = fewer nodes
  const MAX_LINK_DISTANCE = 150;
  const NODE_SPEED = 0.18;

  const ACCENT_A = { r: 62, g: 207, b: 94 };   // brand green
  const ACCENT_B = { r: 124, g: 242, b: 154 }; // bright green highlight

  function lerpColor(t) {
    const r = Math.round(ACCENT_A.r + (ACCENT_B.r - ACCENT_A.r) * t);
    const g = Math.round(ACCENT_A.g + (ACCENT_B.g - ACCENT_A.g) * t);
    const b = Math.round(ACCENT_A.b + (ACCENT_B.b - ACCENT_A.b) * t);
    return `${r}, ${g}, ${b}`;
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = Math.max(window.innerHeight, 700);
    createNodes();
  }

  function createNodes() {
    const count = Math.min(70, Math.floor((width * height) / NODE_COUNT_DENSITY));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * NODE_SPEED,
      vy: (Math.random() - 0.5) * NODE_SPEED,
      t: Math.random(),
    }));
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    // Move nodes
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;

      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    }

    // Draw links between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_LINK_DISTANCE) {
          const opacity = (1 - dist / MAX_LINK_DISTANCE) * 0.35;
          const color = lerpColor((a.t + b.t) / 2);
          ctx.strokeStyle = `rgba(${color}, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (const n of nodes) {
      const color = lerpColor(n.t);
      ctx.fillStyle = `rgba(${color}, 0.8)`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    animationFrameId = requestAnimationFrame(step);
  }

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 150);
  });

  // Pause the animation when the tab is hidden to save battery/CPU.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrameId);
    } else {
      animationFrameId = requestAnimationFrame(step);
    }
  });

  resize();
  animationFrameId = requestAnimationFrame(step);
})();
