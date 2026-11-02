/**
 * ==============================================================================
 * LAUNCHFLOW CORE JAVASCRIPT
 * Theme switching, mobile drawer navigation, toast notifications
 * ==============================================================================
 */

// 1. Theme Management (Dark / Light Mode with localStorage persistence)
const ThemeManager = {
  STORAGE_KEY: "launchflow_theme",

  init() {
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

    this.setTheme(initialTheme);
    this.bindEvents();
  },

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.updateToggleIcons(theme);
  },

  toggle() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    this.setTheme(nextTheme);
  },

  updateToggleIcons(theme) {
    document.querySelectorAll(".theme-toggle-icon").forEach((icon) => {
      icon.textContent = theme === "dark" ? "☀️" : "🌙";
    });
  },

  bindEvents() {
    document.querySelectorAll(".theme-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.toggle());
    });
  },
};

// 2. Mobile Navigation Drawer
const NavigationManager = {
  init() {
    const mobileBtn = document.querySelector(".mobile-menu-btn");
    const navLinks = document.querySelector(".nav-links");

    if (!mobileBtn || !navLinks) return;

    mobileBtn.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      mobileBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      mobileBtn.textContent = isOpen ? "✕" : "☰";
    });

    // Close menu when clicking outside or clicking any nav link
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        mobileBtn.setAttribute("aria-expanded", "false");
        mobileBtn.textContent = "☰";
      });
    });

    this.highlightActiveRoute();
  },

  highlightActiveRoute() {
    const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
    document.querySelectorAll(".nav-link").forEach((link) => {
      const href = link.getAttribute("href").replace(/\/$/, "") || "/";
      if (href === currentPath || (href !== "/" && currentPath.endsWith(href))) {
        link.classList.add("active");
      }
    });
  },
};

// 3. Global Toast Notifications
window.showToast = function (message, type = "info", duration = 4000) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  const icon = type === "success" ? "✓" : type === "error" ? "⚠️" : "ℹ️";
  toast.innerHTML = `
    <span style="font-size: 1.1rem; line-height: 1;">${icon}</span>
    <div style="flex: 1; font-size: 0.925rem;">${message}</div>
    <button style="background: none; border: none; cursor: pointer; color: inherit; font-size: 1rem; opacity: 0.6;" aria-label="Close">✕</button>
  `;

  const closeBtn = toast.querySelector("button");
  closeBtn.addEventListener("click", () => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 300);
  });

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  // Auto dismiss
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.remove("is-visible");
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
};

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  ThemeManager.init();
  NavigationManager.init();
});
