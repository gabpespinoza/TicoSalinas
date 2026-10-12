document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Animación de aparición al hacer scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  revealEls.forEach((el) => io.observe(el));

  /* ---------- 2. Parallax leve en el hero (fondo y foto) ---------- */
  const parallaxEls = document.querySelectorAll("[data-parallax]");
  const hero = document.querySelector(".hero");
  let ticking = false;

  function updateParallax() {
    const y = window.scrollY;
    if (y < hero.offsetHeight + 100) {
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax);
        const offset = y * speed;
        if (el.classList.contains("hero__photo")) {
          el.style.setProperty("--py", offset + "px");
        } else {
          el.style.transform = `translateY(${offset}px)`;
        }
      });
    }
    ticking = false;
  }

  /* ---------- 3. Header: sombra al hacer scroll + link activo ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const links = document.querySelectorAll(".header__nav a");

  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 40);

    let current = "";
    sections.forEach((s) => {
      if (window.scrollY >= s.offsetTop - 140) current = s.id;
    });
    links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + current));

    if (!reduceMotion && !ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 4. Menú móvil ---------- */
  burger.addEventListener("click", () => nav.classList.toggle("open"));
  links.forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));

  /* ---------- 5. Desplegable "Conocer más" en servicios ---------- */
  document.querySelectorAll(".card__link").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".card");
      const isOpen = card.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(isOpen));
    });
  });

  /* ---------- 6. Carrusel automático (Sobre mí) ---------- */
  const carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    const track = carousel.querySelector(".carousel__track");
    const slides = Array.from(track.children);
    const dotsWrap = carousel.querySelector(".carousel__dots");
    const prevBtn = carousel.querySelector(".carousel__btn--prev");
    const nextBtn = carousel.querySelector(".carousel__btn--next");
    const INTERVAL = 4500; // ms entre slides
    let index = 0;
    let timer = null;

    if (slides.length < 2) carousel.classList.add("is-single");

    const dots = slides.map((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Ir a la imagen " + (i + 1));
      dot.addEventListener("click", () => { goTo(i); restart(); });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      dots.forEach((d, n) => d.classList.toggle("active", n === index));
    }
    function start() {
      if (reduceMotion || slides.length < 2 || timer) return;
      timer = setInterval(() => goTo(index + 1), INTERVAL);
    }
    function stop() { clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }

    prevBtn.addEventListener("click", () => { goTo(index - 1); restart(); });
    nextBtn.addEventListener("click", () => { goTo(index + 1); restart(); });

    // Pausa al pasar el mouse, al cambiar de pestaña o al salir de pantalla
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    new IntersectionObserver((entries) => (entries[0].isIntersecting ? start() : stop()), { threshold: 0.2 }).observe(carousel);

    // Deslizar con el dedo en móvil
    let startX = 0;
    carousel.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; stop(); }, { passive: true });
    carousel.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
      start();
    }, { passive: true });

    goTo(0);
    start();
  }

  /* ---------- 7. Botón Compartir ---------- */
  const shareBtn = document.getElementById("shareBtn");
  shareBtn.addEventListener("click", async () => {
    const data = {
      title: "Dr. Tico Salinas",
      text: "Cirugía Laparoscópica Avanzada & Trasplantes",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(data.url);
        shareBtn.textContent = "¡Enlace copiado!";
        setTimeout(() => (shareBtn.textContent = "Compartir"), 2000);
      }
    } catch (e) { /* el usuario canceló */ }
  });
});
