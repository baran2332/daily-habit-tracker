const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : {
  getItem: () => null,
  setItem: () => null
};

let currentLang = storage.getItem("app_lang") || "en";
let isProUser = storage.getItem("is_pro") === "true";
let isDarkMode = storage.getItem("dark_mode") === "true";
let habits = JSON.parse(storage.getItem("user_habits") || "[]");

const LocalNotifications = window.Capacitor?.Plugins?.LocalNotifications;

// HTML Elementleri
const langSelect = document.getElementById("lang-select");
const habitInput = document.getElementById("habit-input");
const habitTime = document.getElementById("habit-time");
const habitList = document.getElementById("habit-list");
const buyProBtn = document.getElementById("buy-pro-btn");
const adContainer = document.getElementById("ad-container");
const btnNotify = document.getElementById("btn-notify");
const themeToggle = document.getElementById("theme-toggle");

document.addEventListener("DOMContentLoaded", () => {
  if (langSelect) langSelect.value = currentLang;
  if (isDarkMode) document.body.classList.add("dark-mode");
  updateLanguage();
  checkProStatus();
  renderHabits();
});

// Koyu Mod Geçişi
themeToggle.addEventListener("click", () => {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle("dark-mode", isDarkMode);
  storage.setItem("dark_mode", isDarkMode ? "true" : "false");
  themeToggle.textContent = isDarkMode ? "☀️" : "🌙";
});

// Dil Değişimi
if (langSelect) {
  langSelect.addEventListener("change", (e) => {
    currentLang = e.target.value;
    storage.setItem("app_lang", currentLang);
    updateLanguage();
    renderHabits();
  });
}

function updateLanguage() {
  const t = translations[currentLang] || translations["en"];
  if (document.getElementById("app-title")) document.getElementById("app-title").textContent = t.title;
  if (habitInput) habitInput.placeholder = t.inputPlaceholder;
  if (document.getElementById("add-btn")) document.getElementById("add-btn").textContent = t.addBtn;
  if (document.getElementById("quick-add-title")) document.getElementById("quick-add-title").textContent = t.quickAddTitle;
  if (document.getElementById("quick-water")) document.getElementById("quick-water").textContent = t.drinkWater;
  if (document.getElementById("quick-book")) document.getElementById("quick-book").textContent = t.readBook;
  if (document.getElementById("quick-exercise")) document.getElementById("quick-exercise").textContent = t.exercise;
  if (btnNotify) btnNotify.textContent = t.notifyBtn;
  if (document.getElementById("progress-title")) document.getElementById("progress-title").textContent = t.progress;
  if (document.getElementById("badge-master")) document.getElementById("badge-master").textContent = t.badgeMaster;
  if (document.getElementById("btn-export")) document.getElementById("btn-export").textContent = t.backup + " 💾";
  if (document.getElementById("btn-import")) document.getElementById("btn-import").textContent = t.restore + " 📂";
  
  if (!isProUser && buyProBtn && adContainer) {
    buyProBtn.textContent = t.removeAds;
    adContainer.textContent = t.adBanner;
  }
}

// Alışkanlık Ekleme
const addBtn = document.getElementById("add-btn");
if (addBtn) {
  addBtn.addEventListener("click", () => {
    const text = habitInput.value.trim();
    const time = habitTime.value;
    if (!text) return;

    const newHabit = { id: Date.now(), title: text, time: time || null, streak: 0, completedToday: false };
    habits.push(newHabit);
    if (time) scheduleNotification(newHabit.id, newHabit.title, time);

    habitInput.value = "";
    habitTime.value = "";
    saveAndRender();
  });
}

function addQuickHabit(type) {
  const t = translations[currentLang] || translations["en"];
  let title = type === "water" ? t.drinkWater : type === "book" ? t.readBook : t.exercise;
  const time = habitTime ? habitTime.value : null;

  const newHabit = { id: Date.now(), title: title, time: time || null, streak: 0, completedToday: false };
  habits.push(newHabit);
  if (time) scheduleNotification(newHabit.id, newHabit.title, time);

  saveAndRender();
}

function toggleHabit(id) {
  habits = habits.map(item => {
    if (item.id === id) {
      const isDone = !item.completedToday;
      return { ...item, completedToday: isDone, streak: isDone ? item.streak + 1 : Math.max(0, item.streak - 1) };
    }
    return item;
  });
  saveAndRender();
}

function deleteHabit(id) {
  habits = habits.filter(item => item.id !== id);
  saveAndRender();
}

// Render & İlerleme Hesabı
function renderHabits() {
  const t = translations[currentLang] || translations["en"];
  if (!habitList) return;
  habitList.innerHTML = "";

  let completedCount = 0;

  habits.forEach(item => {
    if (item.completedToday) completedCount++;
    const li = document.createElement("li");
    const timeDisplay = item.time ? `<span class="time-tag">⏰ ${item.time}</span>` : "";
    
    li.innerHTML = `
      <div class="habit-left">
        <input type="checkbox" ${item.completedToday ? "checked" : ""} onchange="toggleHabit(${item.id})">
        <span style="${item.completedToday ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
          ${item.title} ${timeDisplay}
        </span>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <span class="streak-badge">🔥 ${item.streak} ${t.days}</span>
        <button class="btn-del" onclick="deleteHabit(${item.id})">✕</button>
      </div>
    `;
    habitList.appendChild(li);
  });

  // Progress Bar Hesaplama
  const total = habits.length;
  const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);
  document.getElementById("progress-fill").style.width = percent + "%";
  document.getElementById("progress-text").textContent = percent + "%";

  // Rozet Mantığı (%100 tamamlandıysa göster)
  const badge = document.getElementById("badge-master");
  badge.style.display = (total > 0 && percent === 100) ? "block" : "none";
}

function saveAndRender() {
  storage.setItem("user_habits", JSON.stringify(habits));
  renderHabits();
}

// Veri Yedekleme (Export)
document.getElementById("btn-export").addEventListener("click", () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(habits));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "habits_backup.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
});

// Veri Geri Yükleme (Import)
document.getElementById("btn-import").addEventListener("click", () => {
  document.getElementById("import-file").click();
});

document.getElementById("import-file").addEventListener("change", (e) => {
  const fileReader = new FileReader();
  fileReader.onload = (event) => {
    try {
      habits = JSON.parse(event.target.result);
      saveAndRender();
      alert("Yedek başarıyla yüklendi!");
    } catch (err) {
      alert("Geçersiz yedek dosyası.");
    }
  };
  if (e.target.files[0]) fileReader.readAsText(e.target.files[0]);
});

// Bildirim Mantığı
if (btnNotify) {
  btnNotify.addEventListener("click", async () => {
    if (LocalNotifications) {
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display === 'granted') alert("Bildirim izni verildi!");
    } else {
      console.log("APK derlemesi bekleniyor.");
    }
  });
}

async function scheduleNotification(id, title, timeStr) {
  if (!LocalNotifications || !timeStr) return;
  const [hours, minutes] = timeStr.split(':');
  const now = new Date();
  const scheduleTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  if (scheduleTime < now) scheduleTime.setDate(scheduleTime.getDate() + 1);

  await LocalNotifications.schedule({
    notifications: [{
      title: "Daily Tracker 🔔",
      body: `Hatırlatma: ${title}`,
      id: parseInt(id.toString().slice(-6)),
      schedule: { at: scheduleTime }
    }]
  });
}

// PRO Mantığı
if (buyProBtn) {
  buyProBtn.addEventListener("click", () => {
    isProUser = true;
    storage.setItem("is_pro", "true");
    checkProStatus();
  });
}

function checkProStatus() {
  const t = translations[currentLang] || translations["en"];
  if (isProUser && buyProBtn && adContainer) {
    adContainer.style.display = "none";
    buyProBtn.disabled = true;
    buyProBtn.style.background = "#10b981";
    buyProBtn.textContent = t.proActive;
  }
}
