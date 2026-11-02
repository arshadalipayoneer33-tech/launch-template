/**
 * ==============================================================================
 * CONTACT FORM HANDLER
 * Client-side validation, honeypot protection, serverless API submission
 * ==============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.textContent : "Send Message";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Reset Errors
    clearErrors();

    // 2. Extract and Sanitize Form Values
    const nameInput = form.querySelector("#name");
    const emailInput = form.querySelector("#email");
    const subjectInput = form.querySelector("#subject");
    const messageInput = form.querySelector("#message");
    const honeypotInput = form.querySelector("#website_hp"); // Anti-bot honeypot

    const payload = {
      name: nameInput ? nameInput.value.trim() : "",
      email: emailInput ? emailInput.value.trim() : "",
      subject: subjectInput ? subjectInput.value.trim() : "General Inquiry",
      message: messageInput ? messageInput.value.trim() : "",
      honeypot: honeypotInput ? honeypotInput.value.trim() : "",
    };

    // 3. Client-Side Validation
    let hasError = false;

    if (!payload.name || payload.name.length < 2) {
      showError("name", "Please enter your name (minimum 2 characters).");
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!payload.email || !emailRegex.test(payload.email)) {
      showError("email", "Please enter a valid email address.");
      hasError = true;
    }

    if (!payload.message || payload.message.length < 10) {
      showError("message", "Please enter a detailed message (minimum 10 characters).");
      hasError = true;
    }

    // Bot detection check
    if (payload.honeypot) {
      console.warn("[Security] Bot honeypot triggered.");
      showToast("Message submission rejected.", "error");
      return;
    }

    if (hasError) return;

    // 4. Submit to Backend / Serverless Function (/api/contact)
    try {
      setLoading(true);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        showToast(result.message || "Thank you! Your message has been sent successfully.", "success", 5000);
        form.reset();
      } else if (response.status === 429) {
        showToast("Rate limit exceeded: You have sent too many requests. Please wait a few minutes.", "error", 6000);
      } else {
        const errorMsg = result.error || "Unable to send message. Please try again later or contact support directly.";
        showToast(errorMsg, "error", 5000);
      }
    } catch (err) {
      console.error("[ContactForm] Network error:", err);
      showToast("Network connection error. If you are running locally without the backend API, submissions are simulated.", "info", 5000);
    } finally {
      setLoading(false);
    }
  });

  function showError(fieldId, message) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("is-visible");
    }
  }

  function clearErrors() {
    form.querySelectorAll(".form-error").forEach((el) => {
      el.textContent = "";
      el.classList.remove("is-visible");
    });
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "Sending Message..." : originalBtnText;
  }
});
