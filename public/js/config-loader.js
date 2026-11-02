/**
 * ==============================================================================
 * CONFIG LOADER
 * Automatically synchronizes DOM elements with site.config.js values
 * ==============================================================================
 */

(function () {
  function applyConfig() {
    if (typeof siteConfig === "undefined") {
      console.warn("[ConfigLoader] siteConfig not found on window object.");
      return;
    }

    const { brand, colors, contact, social, seo } = siteConfig;

    // 1. Inject Dynamic Colors into CSS Variables
    const root = document.documentElement;
    if (colors) {
      if (colors.primary) root.style.setProperty("--color-primary", colors.primary);
      if (colors.primaryHover) root.style.setProperty("--color-primary-hover", colors.primaryHover);
      if (colors.secondary) root.style.setProperty("--color-secondary", colors.secondary);
      if (colors.accent) root.style.setProperty("--color-accent", colors.accent);
    }

    // 2. Synchronize Text Elements matching data-config
    document.querySelectorAll("[data-config]").forEach((el) => {
      const path = el.getAttribute("data-config");
      const value = getNestedValue(siteConfig, path);
      if (value !== undefined) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.value = value;
        } else {
          el.textContent = value;
        }
      }
    });

    // 3. Synchronize Hyperlink Hrefs matching data-config-href
    document.querySelectorAll("[data-config-href]").forEach((el) => {
      const path = el.getAttribute("data-config-href");
      const value = getNestedValue(siteConfig, path);
      if (value) {
        el.setAttribute("href", value);
      }
    });

    // 4. Update Document Title if placeholder present
    if (document.title.includes("{{brand.name}}")) {
      document.title = document.title.replace("{{brand.name}}", brand.name);
    }

    // 5. Update Dynamic Year in Footer
    const yearEl = document.getElementById("current-year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  // Safe nested property resolver (e.g., "brand.name" -> siteConfig.brand.name)
  function getNestedValue(obj, path) {
    return path.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  }

  // Execute immediately or on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyConfig);
  } else {
    applyConfig();
  }
})();
