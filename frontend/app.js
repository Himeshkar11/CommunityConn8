const state = {
  token: localStorage.getItem("cc_token") || "",
  user: JSON.parse(localStorage.getItem("cc_user") || "null"),
  apiBase: localStorage.getItem("cc_api_base") || "http://localhost:5000/api",
};

const els = {
  messages: document.getElementById("messages"),
  sessionUser: document.getElementById("sessionUser"),
  apiBase: document.getElementById("apiBase"),
  issuesList: document.getElementById("issuesList"),
  profileData: document.getElementById("profileData"),
};

function renderSession() {
  els.sessionUser.textContent = state.user
    ? `${state.user.name} (${state.user.role})`
    : "Not logged in";
  els.apiBase.value = state.apiBase;
}

function toast(message, isError = false) {
  els.messages.innerHTML = `<div class="msg ${isError ? "error" : ""}">${message}</div>`;
  setTimeout(() => {
    els.messages.innerHTML = "";
  }, 3000);
}

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${state.apiBase}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }

  return data;
}

function setAuth(payload) {
  state.token = payload.token;
  state.user = {
    _id: payload._id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
  };

  localStorage.setItem("cc_token", state.token);
  localStorage.setItem("cc_user", JSON.stringify(state.user));
  renderSession();
}

function logout() {
  state.token = "";
  state.user = null;
  localStorage.removeItem("cc_token");
  localStorage.removeItem("cc_user");
  renderSession();
  els.issuesList.innerHTML = "";
  els.profileData.textContent = "Login to load profile.";
}

async function loadIssues() {
  if (!state.token) {
    toast("Login required to view issues", true);
    return;
  }

  const issues = await api("/issues");
  els.issuesList.innerHTML = "";

  if (!issues.length) {
    els.issuesList.innerHTML = '<p class="muted">No issues found.</p>';
    return;
  }

  issues.forEach((issue) => {
    const div = document.createElement("div");
    div.className = "issue-item";
    div.innerHTML = `
      <strong>${issue.title}</strong>
      <p>${issue.description}</p>
      <div>
        <span class="badge ${issue.urgency}">${issue.urgency}</span>
        <span class="badge">${issue.type}</span>
        <span class="badge">${issue.status}</span>
      </div>
      <small class="muted">Location: ${issue.location?.lat ?? "-"}, ${issue.location?.lng ?? "-"}</small>
      <div class="issue-actions">
        <button data-action="assign" data-id="${issue._id}">Match & Assign</button>
      </div>
    `;

    div.querySelector('[data-action="assign"]').addEventListener("click", async () => {
      if (state.user?.role !== "admin") {
        toast("Only admins can assign volunteers", true);
        return;
      }
      try {
        const result = await api(`/issues/match/${issue._id}`, { method: "POST" });
        toast(`${result.message}. ${result.matches?.length || 0} match(es) created.`);
        await loadIssues();
      } catch (error) {
        toast(error.message, true);
      }
    });

    els.issuesList.appendChild(div);
  });
}

async function loadProfile() {
  if (!state.token) return;
  const profile = await api("/users/profile");
  els.profileData.textContent = JSON.stringify(profile, null, 2);
}

document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const payload = Object.fromEntries(form.entries());

  try {
    const user = await api("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setAuth(user);
    toast("Signup successful");
  } catch (error) {
    toast(error.message, true);
  }
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);

  try {
    const user = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    setAuth(user);
    toast("Login successful");
    await Promise.all([loadIssues(), loadProfile()]);
  } catch (error) {
    toast(error.message, true);
  }
});

document.getElementById("createIssueForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);

  const payload = {
    title: form.get("title"),
    description: form.get("description"),
    type: form.get("type"),
    urgency: form.get("urgency"),
    location: {
      lat: Number(form.get("lat")),
      lng: Number(form.get("lng")),
    },
  };

  try {
    await api("/issues", { method: "POST", body: JSON.stringify(payload) });
    toast("Issue created");
    e.target.reset();
    await loadIssues();
  } catch (error) {
    toast(error.message, true);
  }
});

document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const rawSkills = (form.get("skills") || "").trim();

  const payload = {
    skills: rawSkills ? rawSkills.split(",").map((s) => s.trim()).filter(Boolean) : [],
    location: {
      lat: form.get("lat") ? Number(form.get("lat")) : null,
      lng: form.get("lng") ? Number(form.get("lng")) : null,
    },
    availability: form.get("availability") === "on",
  };

  try {
    await api("/users/profile", { method: "PATCH", body: JSON.stringify(payload) });
    toast("Profile updated");
    await loadProfile();
  } catch (error) {
    toast(error.message, true);
  }
});

document.getElementById("refreshIssues").addEventListener("click", async () => {
  try {
    await loadIssues();
    toast("Issues refreshed");
  } catch (error) {
    toast(error.message, true);
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  logout();
  toast("Logged out");
});

document.getElementById("saveApiBase").addEventListener("click", () => {
  state.apiBase = els.apiBase.value.trim().replace(/\/$/, "");
  localStorage.setItem("cc_api_base", state.apiBase);
  toast("API base saved");
});

document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".panel").forEach((panel) => panel.classList.add("hidden"));
    document.getElementById(btn.dataset.target).classList.remove("hidden");
  });
});

renderSession();
if (state.token) {
  loadIssues().catch((e) => toast(e.message, true));
  loadProfile().catch((e) => toast(e.message, true));
}
