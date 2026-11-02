/**
 * ==============================================================================
 * APPLICATION FOUNDATION DEMO
 * Interactive dashboard state, CRUD management, Mock Auth, and API Health Check
 * ==============================================================================
 */

const AppDemo = {
  STORAGE_KEY_ITEMS: "launchflow_app_items",
  STORAGE_KEY_AUTH: "launchflow_app_user",
  DEMO_TOKEN: "launchflow-demo-session-token-v1",

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
        statusText.textContent = `Edge API Healthy (${duration}ms) • v${data.version || "1.0.1"}`;
      } else {
        throw new Error("Non-200 API response");
      }
    } catch (e) {
      statusPill.style.backgroundColor = "var(--color-warning)";
      statusText.textContent = "Edge API Simulated (Offline / Static Mode)";
    }
  },

  // 2. Authentication State (Demonstration Only)
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
              ${user.name ? user.name.charAt(0) : "D"}
            </div>
            <div>
              <div style="font-weight: 600; font-size: 0.95rem;">${escapeHtml(user.name)}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(user.email)} • <span style="color: var(--color-warning); font-weight: 600;">(Demo Mode)</span></div>
            </div>
          </div>
        `;
        authBtn.textContent = "Sign Out (Demo)";
        authBtn.className = "btn btn-secondary btn-sm";
      } else {
        authContainer.innerHTML = `
          <div style="font-size: 0.9rem; color: var(--text-muted);">
            Guest User (Signed Out)
          </div>
        `;
        authBtn.textContent = "Verify Demo Auth Token";
        authBtn.className = "btn btn-primary btn-sm";
      }
    };

    authBtn.addEventListener("click", async () => {
      const isAuthed = localStorage.getItem(this.STORAGE_KEY_AUTH);
      if (isAuthed) {
        localStorage.removeItem(this.STORAGE_KEY_AUTH);
        window.showToast("Signed out from demo session.", "info");
        renderAuth();
      } else {
        // Demonstrate real server verification using the configured demo token
        try {
          const res = await fetch("/api/auth", {
            headers: {
              Authorization: `Bearer ${this.DEMO_TOKEN}`,
            },
          });
          const data = await res.json();

          if (res.ok && data.authenticated) {
            const demoUser = {
              name: "Demo Founder",
              email: data.user?.email || "demo@example.com",
              role: data.user?.role || "demo_admin",
            };
            localStorage.setItem(this.STORAGE_KEY_AUTH, JSON.stringify(demoUser));
            window.showToast("Demo authentication verified with server.", "success");
          } else {
            window.showToast(data.error || "Demo authentication failed.", "error");
          }
        } catch (e) {
          // Local offline fallback
          const demoUser = { name: "Demo User", email: "demo@example.com", role: "demo" };
          localStorage.setItem(this.STORAGE_KEY_AUTH, JSON.stringify(demoUser));
          window.showToast("Demo mode active (Offline).", "info");
        }
        renderAuth();
      }
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
      const defaultItems = [
        { id: "demo_1", title: "Review security checklist in docs/SECURITY.md", status: "Pending", date: "Today" },
        { id: "demo_2", title: "Connect Supabase for persistent multi-user database", status: "Next Step", date: "Tomorrow" },
        { id: "demo_3", title: "Configure Resend API key for contact form emails", status: "Optional", date: "This Week" },
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
      if (countEl) countEl.textContent = `${items.length} Demo Records`;

      if (items.length === 0) {
        listEl.innerHTML = `
          <div style="padding: 2.5rem; text-align: center; color: var(--text-muted);">
            No records in demo store. Use the form above to add a new record.
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

      listEl.querySelectorAll("[data-delete-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-delete-id");
          const updated = loadItems().filter((i) => i.id !== id);
          saveItems(updated);
          window.showToast("Record deleted from demo store.", "info");
        });
      });
    };

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
        id: "demo_" + Date.now(),
        title: title,
        status: "Active",
        date: new Date().toLocaleDateString(),
      });

      saveItems(items);
      input.value = "";
      window.showToast("New demo record created in browser storage.", "success");
    });

    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const items = loadItems();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `launchflow_demo_data_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        window.showToast("Demo JSON backup downloaded.", "success");
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
