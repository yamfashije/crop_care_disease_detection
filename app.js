
/* SMART CROPCARE - JAVASCRIPT PROTOTYPE */

const STORAGE = {
  users: "smartcrop_users",
  current: "smartcrop_current_user",
  farms: "smartcrop_farms",
  tasks: "smartcrop_tasks",
  history: "smartcrop_history",
  theme: "smartcrop_theme"
};

let selectedImage = null;

function getData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function currentUser() {
  return JSON.parse(localStorage.getItem(STORAGE.current) || "null");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

/* PAGE NAVIGATION */

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.add("hidden");
  });

  const page = document.getElementById(pageId);

  if (!page) return;

  page.classList.remove("hidden");

  const user = currentUser();
  const bottomNav = document.getElementById("bottomNav");

  if (bottomNav) {
    bottomNav.classList.toggle(
      "hidden",
      !user || ["welcomePage", "loginPage", "registerPage"].includes(pageId)
    );
  }

  document.getElementById("phoneContent").scrollTop = 0;

  if (pageId === "farmerPage" || pageId === "adminPage") {
    updateDashboard();
  }

  if (pageId === "farmsPage") renderFarms();
  if (pageId === "historyPage") renderHistory();
  if (pageId === "calendarPage") renderTasks();
  if (pageId === "profilePage") renderProfile();
}

function goDashboard() {
  const user = currentUser();

  if (!user) {
    showPage("loginPage");
    return;
  }

  if (user.role === "admin") {
    showPage("adminPage");
  } else {
    showPage("farmerPage");
  }
}

/* INITIAL SETUP */

function setupDemoAdmin() {
  const users = getData(STORAGE.users);

  if (!users.some(user => user.email === "admin@smartcrop.rw")) {
    users.push({
      id: Date.now(),
      name: "Smart CropCare Admin",
      email: "admin@smartcrop.rw",
      phone: "",
      district: "",
      password: "Admin@123",
      role: "admin"
    });

    saveData(STORAGE.users, users);
  }
}

function initializeApp() {
  setupDemoAdmin();

  const theme = localStorage.getItem(STORAGE.theme);

  if (theme === "dark") {
    document.body.classList.add("dark-mode");
  }

  const user = currentUser();

  if (user) {
    goDashboard();
  } else {
    showPage("welcomePage");
  }

  updateClock();
  setInterval(updateClock, 30000);
}

function updateClock() {
  const time = document.getElementById("phoneTime");

  if (time) {
    time.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }
}

/* REGISTRATION */

document.getElementById("registerForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim().toLowerCase();
  const phone = document.getElementById("registerPhone").value.trim();
  const district = document.getElementById("registerDistrict").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirm = document.getElementById("confirmPassword").value;

  if (password.length < 8) {
    showToast("Password must contain at least 8 characters.");
    return;
  }

  if (password !== confirm) {
    showToast("Passwords do not match.");
    return;
  }

  const users = getData(STORAGE.users);

  if (users.some(user => user.email === email)) {
    showToast("This email is already registered.");
    return;
  }

  users.push({
    id: Date.now(),
    name,
    email,
    phone,
    district,
    password,
    role: "farmer"
  });

  saveData(STORAGE.users, users);

  this.reset();

  showToast("Account created successfully!");

  document.getElementById("loginEmail").value = email;
  showPage("loginPage");
});

/* LOGIN */

document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;
  const role = document.getElementById("loginRole").value;

  const users = getData(STORAGE.users);

  const user = users.find(item =>
    item.email === email &&
    item.password === password &&
    item.role === role
  );

  if (!user) {
    showToast("Invalid email, password or account role.");
    return;
  }

  localStorage.setItem(STORAGE.current, JSON.stringify(user));

  this.reset();

  showToast("Login successful!");

  if (user.role === "admin") {
    showPage("adminPage");
  } else {
    showPage("farmerPage");
  }
});

/* LOGOUT */

function logout() {
  localStorage.removeItem(STORAGE.current);
  showPage("welcomePage");
  showToast("You have signed out.");
}

/* DASHBOARD */

function updateDashboard() {
  const user = currentUser();

  if (!user) return;

  const farms = getData(STORAGE.farms);
  const history = getData(STORAGE.history);
  const users = getData(STORAGE.users);

  const myFarms = farms.filter(item => item.userEmail === user.email);
  const myHistory = history.filter(item => item.userEmail === user.email);

  const diseaseCount = myHistory.filter(item => item.status === "Disease").length;
  const healthyCount = myHistory.filter(item => item.status === "Healthy").length;

  setText("farmerWelcome", user.name.split(" ")[0]);
  setText("farmCount", myFarms.length);
  setText("detectionCount", myHistory.length);
  setText("diseaseCount", diseaseCount);
  setText("healthyCount", healthyCount);

  setText("adminFarmerCount", users.filter(item => item.role === "farmer").length);
  setText("adminFarmCount", farms.length);
  setText("adminDetectionCount", history.length);
  setText("adminDiseaseCount", history.filter(item => item.status === "Disease").length);

  renderRecentActivity(myHistory);
  renderAdminFarmers(users);
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function renderRecentActivity(items) {
  const container = document.getElementById("recentActivity");
  if (!container) return;

  const recent = [...items].reverse().slice(0, 3);

  if (!recent.length) {
    container.innerHTML = '<p class="muted">No activity yet. Start by scanning a crop.</p>';
    return;
  }

  container.innerHTML = recent.map(item => `
    <div class="list-item">
      <div class="list-icon">🔬</div>
      <div class="list-info">
        <strong>${escapeHTML(item.crop)} - ${escapeHTML(item.result)}</strong>
        <small>${escapeHTML(item.date)}</small>
      </div>
    </div>
  `).join("");
}

function renderAdminFarmers(users) {
  const container = document.getElementById("adminFarmers");
  if (!container) return;

  const farmers = users.filter(item => item.role === "farmer");

  if (!farmers.length) {
    container.innerHTML = '<p class="muted">No farmers registered yet.</p>';
    return;
  }

  container.innerHTML = farmers.map(farmer => `
    <div class="list-item">
      <div class="list-icon">👨‍🌾</div>
      <div class="list-info">
        <strong>${escapeHTML(farmer.name)}</strong>
        <small>${escapeHTML(farmer.email)} · ${escapeHTML(farmer.district)}</small>
      </div>
    </div>
  `).join("");
}

/* FARM MANAGEMENT */

document.getElementById("farmForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const user = currentUser();
  if (!user) return;

  const farms = getData(STORAGE.farms);

  farms.push({
    id: Date.now(),
    userEmail: user.email,
    name: document.getElementById("farmName").value.trim(),
    location: document.getElementById("farmLocation").value.trim(),
    crop: document.getElementById("farmCrop").value,
    size: document.getElementById("farmSize").value,
    date: new Date().toLocaleDateString()
  });

  saveData(STORAGE.farms, farms);

  this.reset();
  renderFarms();
  updateDashboard();
  showToast("Farm saved successfully!");
});

function renderFarms() {
  const user = currentUser();
  const container = document.getElementById("farmList");

  if (!user || !container) return;

  const farms = getData(STORAGE.farms)
    .filter(item => item.userEmail === user.email);

  if (!farms.length) {
    container.innerHTML = '<p class="muted">You have not added a farm yet.</p>';
    return;
  }

  container.innerHTML = farms.map(farm => `
    <div class="list-item">
      <div class="list-icon">🌾</div>
      <div class="list-info">
        <strong>${escapeHTML(farm.name)}</strong>
        <small>${escapeHTML(farm.crop)} · ${escapeHTML(farm.location)} · ${escapeHTML(farm.size)} ha</small>
      </div>
      <button onclick="deleteFarm(${farm.id})" aria-label="Delete farm">🗑️</button>
    </div>
  `).join("");
}

function deleteFarm(id) {
  const farms = getData(STORAGE.farms).filter(item => item.id !== id);
  saveData(STORAGE.farms, farms);
  renderFarms();
  updateDashboard();
  showToast("Farm deleted.");
}

/* CROP IMAGE PREVIEW */

document.getElementById("cropImage").addEventListener("change", function() {
  const file = this.files[0];

  if (!file) return;

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    showToast("Please choose a JPG, PNG or WEBP image.");
    this.value = "";
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showToast("Image must be smaller than 10 MB.");
    this.value = "";
    return;
  }

  selectedImage = file;

  const preview = document.getElementById("previewImage");
  preview.src = URL.createObjectURL(file);
  preview.classList.remove("hidden");
});

/* DEMO CROP DETECTION */

function analyzeCrop() {
  const imageInput = document.getElementById("cropImage");
  const crop = document.getElementById("cropType").value;
  const resultCard = document.getElementById("detectionResult");
  const resultText = document.getElementById("resultText");
  const advice = document.getElementById("resultAdvice");
  const button = document.getElementById("analyzeButton");

  if (!imageInput.files.length) {
    showToast("Please upload a crop image first.");
    return;
  }

  button.disabled = true;
  button.textContent = "Analyzing...";

  setTimeout(() => {
    const demoResults = [
      {
        status: "Healthy",
        result: "Healthy Leaf",
        advice: "The leaf appears healthy in this demo. Continue good crop management."
      },
      {
        status: "Disease",
        result: "Possible Leaf Disease",
        advice: "This is a simulated result. Inspect the plant and consult an agricultural expert."
      }
    ];

    const result = demoResults[Math.floor(Math.random() * demoResults.length)];

    resultText.textContent = `${result.result} - ${crop}`;
    advice.textContent = result.advice;

    resultCard.classList.remove("hidden");

    const user = currentUser();

    const history = getData(STORAGE.history);

    history.push({
      id: Date.now(),
      userEmail: user.email,
      crop,
      status: result.status,
      result: result.result,
      date: new Date().toLocaleString()
    });

    saveData(STORAGE.history, history);

    button.disabled = false;
    button.textContent = "Analyze Crop 🔍";

    updateDashboard();
    showToast("Demo analysis completed.");
  }, 1400);
}

/* HISTORY */

function renderHistory() {
  const user = currentUser();
  const container = document.getElementById("historyList");

  if (!user || !container) return;

  const history = getData(STORAGE.history)
    .filter(item => item.userEmail === user.email)
    .reverse();

  if (!history.length) {
    container.innerHTML = '<p class="muted">No detection history available.</p>';
    return;
  }

  container.innerHTML = history.map(item => `
    <div class="list-item">
      <div class="list-icon">${item.status === "Healthy" ? "✅" : "⚠️"}</div>
      <div class="list-info">
        <strong>${escapeHTML(item.crop)} - ${escapeHTML(item.result)}</strong>
        <small>${escapeHTML(item.date)}</small>
      </div>
    </div>
  `).join("");
}

/* FARM CALENDAR */

document.getElementById("taskForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const user = currentUser();
  if (!user) return;

  const tasks = getData(STORAGE.tasks);

  tasks.push({
    id: Date.now(),
    userEmail: user.email,
    name: document.getElementById("taskName").value.trim(),
    date: document.getElementById("taskDate").value,
    description: document.getElementById("taskDescription").value.trim()
  });

  saveData(STORAGE.tasks, tasks);
  this.reset();
  renderTasks();
  showToast("Farm activity added!");
});

function renderTasks() {
  const user = currentUser();
  const container = document.getElementById("taskList");

  if (!user || !container) return;

  const tasks = getData(STORAGE.tasks)
    .filter(item => item.userEmail === user.email)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!tasks.length) {
    container.innerHTML = '<p class="muted">No planned activities yet.</p>';
    return;
  }

  container.innerHTML = tasks.map(task => `
    <div class="list-item">
      <div class="list-icon">📅</div>
      <div class="list-info">
        <strong>${escapeHTML(task.name)}</strong>
        <small>${escapeHTML(task.date)} · ${escapeHTML(task.description)}</small>
      </div>
      <button onclick="deleteTask(${task.id})" aria-label="Delete activity">🗑️</button>
    </div>
  `).join("");
}

function deleteTask(id) {
  const tasks = getData(STORAGE.tasks).filter(item => item.id !== id);
  saveData(STORAGE.tasks, tasks);
  renderTasks();
  showToast("Activity deleted.");
}

/* FARM ASSISTANT - DEMO */

document.getElementById("assistantForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const input = document.getElementById("assistantQuestion");
  const messages = document.getElementById("assistantMessages");
  const question = input.value.trim();

  if (!question) return;

  messages.innerHTML += `
    <div class="chat-bubble user">${escapeHTML(question)}</div>
  `;

  input.value = "";

  const lower = question.toLowerCase();

  let answer = "For better crop management, inspect your plants regularly, use quality seeds and follow agricultural advice.";

  if (lower.includes("cassava") || lower.includes("imyumbati")) {
    answer = "Cassava farmers should inspect leaves regularly, remove badly affected plants where appropriate, and seek local agricultural advice about disease management.";
  } else if (lower.includes("bean") || lower.includes("ibishyimbo")) {
    answer = "For beans, use healthy seeds, maintain suitable spacing, remove weeds and monitor leaves for disease symptoms.";
  } else if (lower.includes("maize") || lower.includes("ibigori")) {
    answer = "For maize, monitor leaves and stems, use quality seeds, manage weeds and ask an agronomist when you notice unusual symptoms.";
  } else if (lower.includes("water") || lower.includes("amazi")) {
    answer = "Water crops according to their growth stage and soil condition. Avoid waterlogging and ensure good drainage.";
  } else if (lower.includes("disease") || lower.includes("indwara")) {
    answer = "Take a clear picture of affected leaves, inspect other plants and use the Crop Detection page. For a confirmed diagnosis, consult an agricultural expert.";
  }

  setTimeout(() => {
    messages.innerHTML += `
      <div class="chat-bubble bot">${escapeHTML(answer)}</div>
    `;

    messages.scrollTop = messages.scrollHeight;
  }, 500);

  messages.scrollTop = messages.scrollHeight;
});

/* PROFILE */

function renderProfile() {
  const user = currentUser();
  if (!user) return;

  setText("profileName", user.name);
  setText("profileRole", user.role === "admin" ? "Administrator" : "Farmer Account");
  setText("profileEmail", user.email);
  setText("profilePhone", user.phone || "Not provided");
  setText("profileDistrict", user.district || "Not provided");
}

/* THEME */

function toggleTheme() {
  document.body.classList.toggle("dark-mode");

  const theme = document.body.classList.contains("dark-mode")
    ? "dark"
    : "light";

  localStorage.setItem(STORAGE.theme, theme);
  showToast(theme === "dark" ? "Dark mode enabled." : "Light mode enabled.");
}

/* BASIC HTML ESCAPING */

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

/* START APP */

initializeApp();
