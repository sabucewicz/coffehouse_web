/**
 * Kawonia — site scripts
 * TODO: set FORM_ENDPOINT to Google Forms / Apps Script URL when ready
 */
const FORM_ENDPOINT = "";

/**
 * Aktualna oferta w popupie przy wejściu na stronę.
 * Żeby pokazać nową ofertę: zmień `id` (np. "2026-walentynki") oraz treść/zdjęcie.
 * Ustaw `enabled: false`, żeby wyłączyć popup.
 */
const PROMO = {
  enabled: true,
  id: "2026-10-jesien",
  eyebrow: "Aktualności",
  title: "Jesienna oferta florystyczna",
  text: "Kompozycje z kasztanami, orzechami i suszonymi kwiatami — zobacz, co teraz robimy w Kawonii.",
  image: "images/aktualnosci/jesienny-bukiet.jpg",
  imageAlt: "Jesienna kompozycja z kasztanami i suszonymi kwiatami",
  href: "aktualnosci/",
  cta: "Zobacz aktualności",
};

(function () {
  const form = document.getElementById("reservation-form");
  if (!form) return;

  const statusEl = document.getElementById("form-status");

  function setStatus(message, state) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.state = state || "";
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const honeypot = form.querySelector('[name="website"]');
    if (honeypot && honeypot.value) {
      setStatus("Dziękujemy za zgłoszenie.", "success");
      form.reset();
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus("Sprawdź zaznaczone pola — niektóre wymagają poprawy.", "error");
      return;
    }

    if (!FORM_ENDPOINT) {
      setStatus(
        "To wersja testowa formularza. Rezerwacja nie została wysłana — wkrótce podłączymy formularz kawiarni.",
        "success"
      );
      form.reset();
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    setStatus("Wysyłanie…", "");

    try {
      const data = new FormData(form);
      data.delete("website");

      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setStatus("Dziękujemy! Skontaktujemy się z Tobą, by potwierdzić rezerwację.", "success");
      form.reset();
    } catch (err) {
      setStatus("Nie udało się wysłać formularza. Zadzwoń do nas lub spróbuj ponownie.", "error");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();

(function () {
  if (!PROMO.enabled) return;

  const storageKey = "kawonia-promo-seen:" + PROMO.id;
  const onAktualnosci = /(?:^|\/)aktualnosci(?:\/|$)/i.test(location.pathname);

  function markSeen() {
    try {
      localStorage.setItem(storageKey, "1");
    } catch (err) {
      /* private mode / file:// — ignore */
    }
  }

  function hasSeen() {
    try {
      return localStorage.getItem(storageKey) === "1";
    } catch (err) {
      return false;
    }
  }

  /* Na aktualnościach nie pokazuj — i zapamiętaj, że ofertę już widziano */
  if (onAktualnosci) {
    markSeen();
    return;
  }

  if (hasSeen()) return;

  const script = document.querySelector('script[src*="js/main.js"]');
  const base = script ? script.getAttribute("src").replace(/js\/main\.js$/, "") : "";

  const dialog = document.createElement("dialog");
  dialog.className = "promo-dialog";
  dialog.setAttribute("aria-labelledby", "promo-title");
  dialog.innerHTML =
    '<div class="promo-dialog-shell">' +
    '<button type="button" class="promo-dialog-close" aria-label="Zamknij">&times;</button>' +
    '<figure class="promo-dialog-media">' +
    '<img src="' +
    base +
    PROMO.image +
    '" alt="' +
    PROMO.imageAlt +
    '" width="640" height="800">' +
    "</figure>" +
    '<div class="promo-dialog-body">' +
    '<p class="promo-dialog-eyebrow">' +
    PROMO.eyebrow +
    "</p>" +
    '<h2 id="promo-title">' +
    PROMO.title +
    "</h2>" +
    "<p>" +
    PROMO.text +
    "</p>" +
    '<div class="promo-dialog-actions">' +
    '<a class="btn btn-primary promo-dialog-cta" href="' +
    base +
    PROMO.href +
    '">' +
    PROMO.cta +
    "</a>" +
    '<button type="button" class="btn btn-ghost promo-dialog-dismiss">Zamknij</button>' +
    "</div>" +
    "</div>" +
    "</div>";

  function closePromo() {
    markSeen();
    if (typeof dialog.close === "function") dialog.close();
  }

  document.body.appendChild(dialog);

  dialog.querySelector(".promo-dialog-close").addEventListener("click", closePromo);
  dialog.querySelector(".promo-dialog-dismiss").addEventListener("click", closePromo);
  dialog.querySelector(".promo-dialog-cta").addEventListener("click", markSeen);
  dialog.addEventListener("close", markSeen);
  dialog.addEventListener("cancel", markSeen);
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) closePromo();
  });

  window.requestAnimationFrame(function () {
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    }
  });
})();

(function () {
  const list = document.querySelector("[data-highlight-today]");
  if (!list) return;
  const today = String(new Date().getDay());
  const row = list.querySelector('[data-day="' + today + '"]');
  if (row) row.classList.add("is-today");
})();

(function () {
  const map = document.querySelector("[data-map-embed]");
  if (!map) return;

  function activate() {
    map.classList.add("is-active");
  }

  function deactivate() {
    map.classList.remove("is-active");
  }

  map.addEventListener("click", activate);
  map.addEventListener("mouseleave", deactivate);
  map.addEventListener("blur", deactivate, true);
  document.addEventListener("scroll", deactivate, { passive: true });
})();

(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.documentElement.classList.add("motion-ready");

  const targets = document.querySelectorAll(
    ".section, .menu-board, .loyalty-card, .map-embed, .photo-grid figure, .home-tiles .tile, .news-spotlight, .news-photo, .about-story, .contact-grid > *"
  );
  if (!targets.length || !("IntersectionObserver" in window)) return;

  targets.forEach(function (el, index) {
    el.classList.add("reveal");
    if (el.classList.contains("news-photo") || el.classList.contains("tile-green")) {
      el.classList.add("reveal-right");
    } else if (el.classList.contains("news-spotlight") || el.classList.contains("tile-beige")) {
      el.classList.add("reveal-left");
    } else if (el.classList.contains("menu-board") || el.classList.contains("loyalty-card")) {
      el.classList.add("reveal-scale");
    }
    el.style.setProperty("--reveal-delay", Math.min(index * 0.04, 0.28) + "s");
  });

  document.querySelectorAll(".price-list li, .stamps li, .hours-list li, .news-offers li").forEach(function (el, index) {
    el.classList.add("stagger-child");
    el.style.setProperty("--stagger", (index % 8) * 0.06 + "s");
  });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        entry.target.querySelectorAll(".stagger-child").forEach(function (child) {
          child.classList.add("is-visible");
        });
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });

  /* Stagger items that sit outside reveal parents */
  document.querySelectorAll(".stagger-child").forEach(function (el) {
    if (el.closest(".reveal")) return;
    observer.observe(el);
  });
})();
