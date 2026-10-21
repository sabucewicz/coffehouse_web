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

  /* Nie pokazuj popupu na stronie aktualności — użytkownik już tam jest */
  if (/\/aktualnosci\/?$/i.test(location.pathname)) return;

  const storageKey = "kawonia-promo-seen:" + PROMO.id;
  try {
    if (sessionStorage.getItem(storageKey)) return;
  } catch (err) {
    /* private mode — still show */
  }

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
    '<a class="btn btn-primary" href="' +
    base +
    PROMO.href +
    '">' +
    PROMO.cta +
    "</a>" +
    '<button type="button" class="btn btn-ghost promo-dialog-dismiss">Zamknij</button>' +
    "</div>" +
    "</div>" +
    "</div>";

  function markSeen() {
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch (err) {
      /* ignore */
    }
  }

  function closePromo() {
    markSeen();
    if (typeof dialog.close === "function") dialog.close();
  }

  document.body.appendChild(dialog);

  dialog.querySelector(".promo-dialog-close").addEventListener("click", closePromo);
  dialog.querySelector(".promo-dialog-dismiss").addEventListener("click", closePromo);
  dialog.addEventListener("close", markSeen);
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) closePromo();
  });

  window.requestAnimationFrame(function () {
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    }
  });
})();
