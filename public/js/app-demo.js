/**
 * ==============================================================================
 * APPLICATION FOUNDATION DEMO
 * Interactive dashboard state, CRUD management, Mock Auth, and API Health Check
 * ==============================================================================
 */

const AppDemo = {
  STORAGE_KEY_ITEMS: "launchflow_app_items",
  STORAGE_KEY_AUTH: "launchflow_app_user",

  init() {
    this.checkApiHealth();
    this.initAuth();
    this.initItems();
  },

  // 1. Live API Health Check
  async checkApiHealth() {
    const statusPill = document.getElementById("api-status-pill");
    const statusText = document.getElementById("api-status-text");

    if (!statusPill || !statusText) return;

    try {
      const startTime = performance.now();
      const res = await fetch("/api/health");
      const duration = Math.round(performance.now() - startTime);

      if (res.ok) {
        const data = await res.json();
        statusPill.style.backgroundColor = "var(--color-accent)";
        statusText.textContent = `Edge API Healthy (${duration}ms) • v${data.version || "1.0.0"}`;
      } else {
        throw new Error("Non-200 API response");
      }
    } catch (e) {
      statusPill.style.backgroundColor = "var(--color-warning)";
      statusText.textContent = "Edge API Simulated (Offline / Static Mode)";
    }
  },

  // 2. Authentication State (Mock / Supabase Ready)
  initAuth() {
    const authContainer = document.getElementById("auth-status-container");
    const authBtn = document.getElementById("auth-toggle-btn");

    if (!authContainer || !authBtn) return;

    const renderAuth = () => {
      const userJson = localStorage.getItem(this.STORAGE_KEY_AUTH);
      if (userJson) {
        const user = JSON.parse(userJson);
        authContainer.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background-color: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold;">
              ${user.name.charAt(0)}
            </div>
            <div>
              <div style="font-weight: 600; font-size: 0.95rem;">${user.name}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${user.email}</div>
            </div>
          </div>
        `;
        authBtn.textContent = "Sign Out";
        authBtn.className = "btn btn-secondary btn-sm";
      } else {
        authContainer.innerHTML = `
          <div style="font-size: 0.9rem; color: var(--text-muted);">
            Guest User (Signed Out)
          </div>
        `;
        authBtn.textContent = "Simulate Demo Login";
        authBtn.className = "btn btn-primary btn-sm";
      }
    };

    authBtn.addEventListener("click", () => {
      const isAuthed = localStorage.getItem(this.STORAGE_KEY_AUTH);
      if (isAuthed) {
        localStorage.removeItem(this.STORAGE_KEY_AUTH);
        window.showToast("Signed out successfully.", "info");
      } else {
        const demoUser = {
          id: "usr_" + Math.random().toString(36).substring(2, 9),
          name: "Alex Vance",
          email: "alex@example.com",
          role: "Founder",
        };
        localStorage.setItem(this.STORAGE_KEY_AUTH, JSON.stringify(demoUser));
        window.showToast(`Welcome back, ${demoUser.name}!`, "success");
      }
      renderAuth();
    });

    renderAuth();
  },

  // 3. Reusable CRUD Data Foundation
  initItems() {
    const listEl = document.getElementById("items-list");
    const addForm = document.getElementById("add-item-form");
    const countEl = document.getElementById("items-count");
    const exportBtn = document.getElementById("export-data-btn");

    if (!listEl || !addForm) return;

    const loadItems = () => {
      const raw = localStorage.getItem(this.STORAGE_KEY_ITEMS);
      if (raw) {
        try { return JSON.parse(raw); } catch (e) { return []; }
      }
      // Initial default starter data
      const defaultItems = [
        { id: "1", title: "Launch MVP on Cloudflare Pages", status: "Completed", date: "Today" },
        { id: "2", title: "Validate first $100 service offer", status: "In Progress", date: "Tomorrow" },
        { id: "3", title: "Connect Supabase Database", status: "Pending", date: "Next Week" },
      ];
      localStorage.setItem(this.STORAGE_KEY_ITEMS, JSON.stringify(defaultItems));
      return defaultItems;
    };

    const saveItems = (items) => {
      localStorage.setItem(this.STORAGE_KEY_ITEMS, JSON.stringify(items));
      renderItems();
    };

    const renderItems = () => {
      const items = loadItems();
      if (countEl) countEl.textContent = `${items.length} Records`;

      if (items.length === 0) {
        listEl.innerHTML = `
          <div style="padding: 2.5rem; text-align: center; color: var(--text-muted);">
            No records found. Use the form above to create your first application entry.
          </div>
        `;
        return;
      }

      listEl.innerHTML = items
        .map(
          (item) => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-color); background-color: var(--bg-surface-elevated);">
            <div>
              <div style="font-weight: 600; font-size: 0.975rem;">${escapeHtml(item.title)}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">Added: ${item.date} • Status: <span class="badge" style="background: rgba(37,99,235,0.1); color: var(--color-primary);">${item.status}</span></div>
            </div>
            <button data-delete-id="${item.id}" class="btn btn-secondary btn-sm" style="color: var(--color-danger); border-color: rgba(239,68,68,0.2);">
              Delete
            </button>
          </div>
        `
        )
        .join("");

      // Bind delete handlers
      listEl.querySelectorAll("[data-delete-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-delete-id");
          const updated = loadItems().filter((i) => i.id !== id);
          saveItems(updated);
          window.showToast("Item deleted.", "info");
        });
      });
    };

    // Add item handler
    addForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("new-item-title");
      const title = input ? input.value.trim() : "";

      if (!title || title.length < 3) {
        window.showToast("Please enter a title (minimum 3 characters).", "error");
        return;
      }

      const items = loadItems();
      items.unshift({
        id: "item_" + Date.now(),
        title: title,
        status: "Active",
        date: new Date().toLocaleDateString(),
      });

      saveItems(items);
      input.value = "";
      window.showToast("New record created successfully!", "success");
    });

    // Export Data to JSON backup
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const items = loadItems();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `app_data_backup_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        window.showToast("Data backup file downloaded.", "success");
      });
    }

    renderItems();
  },
};

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => AppDemo.init());
