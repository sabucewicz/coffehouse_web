/**
 * Kawonia — site scripts
 * TODO: set FORM_ENDPOINT to Google Forms / Apps Script URL when ready
 */
const FORM_ENDPOINT = "";

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
