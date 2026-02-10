// Reveal-on-scroll (IntersectionObserver)
const els = document.querySelectorAll(".reveal");

const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      io.unobserve(e.target);
    }
  }
}, { threshold: 0.12 });

els.forEach(el => io.observe(el));

// Маленький "клик-эффект" для click me! (в макете просто подпрыгивает)
document.querySelectorAll("[data-bounce]").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.animate(
      [
        { transform: "translateY(0)" },
        { transform: "translateY(-6px)" },
        { transform: "translateY(0)" }
      ],
      { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)" }
    );
  });
});
