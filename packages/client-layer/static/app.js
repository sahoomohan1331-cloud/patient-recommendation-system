// ==========================================================================
// Triage Clinical AI - Application Logic (Inspired by Figma Thumbnails)
// ==========================================================================

const OPD_PATIENT_QUEUE = [
  {
    id: "PT-77014",
    name: "Robert Miller",
    age: 58,
    gender: "Male",
    acuity: "emergent",
    acuity_label: "ESI 2 • Emergent",
    chief_complaint: "Retrosternal crushing chest pain radiating to left arm",
    symptoms: ["Chest Pain", "Shortness of Breath", "Sweating", "Radiating Pain to Left Arm", "Nausea"],
    symptom_duration_days: 1,
    medical_history: ["Hypertension", "Hyperlipidemia", "Smoking"],
    allergies: ["Penicillin"],
    current_medications: ["Atorvastatin 20mg", "Amlodipine 5mg"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    vitals: {
      heart_rate: 106,
      blood_pressure_sys: 168,
      blood_pressure_dia: 96,
      oxygen_saturation: 93.5,
      temperature: 37.1,
      temperature_unit: "C",
      respiratory_rate: 22
    }
  },
  {
    id: "PT-32901",
    name: "Sarah Jenkins",
    age: 24,
    gender: "Female",
    acuity: "emergent",
    acuity_label: "ESI 2 • Emergent",
    chief_complaint: "Severe expiratory wheezing & acute hypoxia following viral cold",
    symptoms: ["Wheezing", "Shortness of Breath", "Cough", "Chest Tightness", "Rapid Breathing"],
    symptom_duration_days: 2,
    medical_history: ["Asthma", "Seasonal Allergies"],
    allergies: ["Aspirin", "NSAIDs"],
    current_medications: ["Albuterol inhaler PRN", "Fluticasone propionate"],
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    vitals: {
      heart_rate: 114,
      blood_pressure_sys: 128,
      blood_pressure_dia: 82,
      oxygen_saturation: 91.0,
      temperature: 37.4,
      temperature_unit: "C",
      respiratory_rate: 26
    }
  },
  {
    id: "PT-94182",
    name: "David Chen",
    age: 62,
    gender: "Male",
    acuity: "urgent",
    acuity_label: "ESI 3 • Urgent",
    chief_complaint: "Marked polydipsia, frequent nocturia, blurred vision, fatigue",
    symptoms: ["Frequent Urination", "Excessive Thirst", "Blurred Vision", "Fatigue", "Dry Mouth"],
    symptom_duration_days: 10,
    medical_history: ["Type 2 Diabetes", "Obesity", "Hypertension"],
    allergies: [],
    current_medications: ["Metformin 1000mg BID", "Lisinopril 10mg"],
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    vitals: {
      heart_rate: 84,
      blood_pressure_sys: 138,
      blood_pressure_dia: 86,
      oxygen_saturation: 98.0,
      temperature: 36.8,
      temperature_unit: "C",
      respiratory_rate: 16
    }
  },
  {
    id: "PT-44810",
    name: "Elena Rostova",
    age: 31,
    gender: "Female",
    acuity: "routine",
    acuity_label: "ESI 4 • Routine",
    chief_complaint: "Unilateral throbbing right temporal headache with scintillating aura",
    symptoms: ["Headache", "Throbbing Headache", "Photophobia", "Nausea", "Visual Aura"],
    symptom_duration_days: 1,
    medical_history: ["Migraine history"],
    allergies: ["Sulfa"],
    current_medications: ["Sumatriptan 50mg PRN"],
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    vitals: {
      heart_rate: 78,
      blood_pressure_sys: 118,
      blood_pressure_dia: 76,
      oxygen_saturation: 99.0,
      temperature: 36.6,
      temperature_unit: "C",
      respiratory_rate: 15
    }
  }
];

const SYMPTOM_DATA = [
  { name: "Chest Pain", region: "cardio" },
  { name: "Shortness of Breath", region: "cardio" },
  { name: "Radiating Pain to Left Arm", region: "cardio" },
  { name: "Palpitations", region: "cardio" },
  { name: "Chest Tightness", region: "cardio" },
  { name: "Wheezing", region: "respiratory" },
  { name: "Cough", region: "respiratory" },
  { name: "Rapid Breathing", region: "respiratory" },
  { name: "Pleuritic Chest Pain", region: "respiratory" },
  { name: "Headache", region: "neuro" },
  { name: "Throbbing Headache", region: "neuro" },
  { name: "Photophobia", region: "neuro" },
  { name: "Visual Aura", region: "neuro" },
  { name: "Dizziness", region: "neuro" },
  { name: "Heartburn", region: "gi" },
  { name: "Acid Reflux", region: "gi" },
  { name: "Nausea", region: "gi" },
  { name: "Vomiting", region: "gi" },
  { name: "Diarrhea", region: "gi" },
  { name: "Frequent Urination", region: "systemic" },
  { name: "Excessive Thirst", region: "systemic" },
  { name: "Blurred Vision", region: "systemic" },
  { name: "Fatigue", region: "systemic" },
  { name: "Fever", region: "systemic" },
  { name: "Sweating", region: "systemic" }
];

let selectedSymptoms = new Set(["Chest Pain", "Shortness of Breath", "Sweating", "Radiating Pain to Left Arm"]);
let currentPatient = OPD_PATIENT_QUEUE[0];
let currentOrchestrationResult = null;
let currentFhirBundle = null;
let activeRegionFilter = "all";
let activeQueueFilter = "all";
let dictationActive = false;
let orderedTests = new Set();
let aiRecommendationsEnabled = true;
let queueAiPreviewEnabled = true;
let autoAiTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initSearch();
  initNotifications();
  initClinicMenu();
  initDateFilter();
  initCalendarStrip();
  initKpiFilters();
  initEditIntake();
  initAiRecommendationToggle();
  initDropdownDismissal();
  initAnatomicalSelector();
  initSymptomChips();
  initLiveVitalsEvaluator();
  initVoiceDictation();
  initQueue();
  initLiveKioskBridge();
  initMarketplace();
  initEventHandlers();
  initPipelineNodes();
  initCopilot();
  initModals();
  initNewFeatures();

  // Load first patient into details
  loadPatientToDetail(OPD_PATIENT_QUEUE[0], false);
});

// Theme Toggle
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const savedTheme = localStorage.getItem('triage_theme') || localStorage.getItem('isaree_theme') || 'light';

  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme, themeIcon);

  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('triage_theme', target);
    updateThemeIcon(target, themeIcon);
  });
}

function updateThemeIcon(theme, iconEl) {
  iconEl.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

// Navigation (Header Pills + Bottom Dock)
function initNavigation() {
  const segButtons = document.querySelectorAll('.seg-pill-btn');
  const dockButtons = document.querySelectorAll('.dock-nav-item');

  function switchScreen(viewId) {
    document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.seg-pill-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.dock-nav-item').forEach(b => b.classList.remove('active'));

    const targetScreen = document.getElementById(viewId);
    if (targetScreen) targetScreen.classList.add('active');

    const matchingSeg = document.querySelector(`.seg-pill-btn[data-view="${viewId}"]`);
    if (matchingSeg) matchingSeg.classList.add('active');

    const matchingDock = document.querySelector(`.dock-nav-item[data-nav="${viewId}"]`);
    if (matchingDock) matchingDock.classList.add('active');

    if (typeof handleScreenSwitchHook === 'function') {
      handleScreenSwitchHook(viewId);
    }
  }

  segButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchScreen(btn.getAttribute('data-view'));
    });
  });

  dockButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchScreen(btn.getAttribute('data-nav'));
    });
  });

  document.getElementById('btn-back-to-queue').addEventListener('click', () => {
    switchScreen('view-opd-queue');
  });

  // FAB button
  document.getElementById('fab-new-patient').addEventListener('click', () => {
    switchScreen('view-patient-detail');
    resetIntakeForm();
  });

  document.getElementById('btn-quick-new-patient').addEventListener('click', () => {
    switchScreen('view-patient-detail');
    resetIntakeForm();
  });
}

// Global Patient Search
function initSearch() {
  const searchInput = document.getElementById('global-patient-search');
  const clearBtn = document.getElementById('btn-clear-search');

  searchInput.addEventListener('input', () => {
    const val = searchInput.value.toLowerCase().trim();
    clearBtn.style.display = val ? 'block' : 'none';
    renderQueue(val);
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    renderQueue('');
  });
}

// ==============================================================================
// Date Filter & Calendar Navigation
// ==============================================================================
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAY_NAMES_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// --- Date helpers (all based on the user's real local system date) ---
function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function getToday() { return startOfDay(new Date()); }
function weekStartOf(d) { return addDays(startOfDay(d), -startOfDay(d).getDay()); }
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function toIsoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function fromIsoDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function shortDate(d) {
  const base = `${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
  return d.getFullYear() === getToday().getFullYear() ? base : `${base}, ${d.getFullYear()}`;
}
function longDate(d) { return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; }

let selectedDate = getToday();
let visibleWeekStart = weekStartOf(selectedDate);
let weekModeActive = false;
let lastKnownToday = getToday();

function relativeDayName(d) {
  const t = getToday();
  if (isSameDay(d, t)) return 'Today';
  if (isSameDay(d, addDays(t, -1))) return 'Yesterday';
  if (isSameDay(d, addDays(t, 1))) return 'Tomorrow';
  return null;
}

function refreshDateMenuLabels() {
  const t = getToday();
  const ws = weekStartOf(t);
  const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  set('date-opt-today', `Today (${longDate(t)})`);
  set('date-opt-yesterday', `Yesterday (${longDate(addDays(t, -1))})`);
  set('date-opt-tomorrow', `Tomorrow (${longDate(addDays(t, 1))})`);
  set('date-opt-week', `This Week (${shortDate(ws)} – ${shortDate(addDays(ws, 6))})`);
}

function updateMonthDisplay() {
  const monthDisplay = document.getElementById('cal-month-display');
  if (!monthDisplay) return;
  const first = visibleWeekStart;
  const last = addDays(visibleWeekStart, 6);
  if (first.getMonth() === last.getMonth()) {
    monthDisplay.textContent = `${MONTH_NAMES[first.getMonth()]} ${first.getFullYear()}`;
  } else if (first.getFullYear() === last.getFullYear()) {
    monthDisplay.textContent = `${MONTH_NAMES[first.getMonth()].slice(0, 3)} – ${MONTH_NAMES[last.getMonth()].slice(0, 3)} ${last.getFullYear()}`;
  } else {
    monthDisplay.textContent = `${MONTH_NAMES[first.getMonth()].slice(0, 3)} ${first.getFullYear()} – ${MONTH_NAMES[last.getMonth()].slice(0, 3)} ${last.getFullYear()}`;
  }
}

function renderCalendarDays() {
  const daysTrack = document.getElementById('cal-days-track');
  if (!daysTrack) return;
  const today = getToday();
  const selectedWeekStart = weekStartOf(selectedDate);
  let html = "";
  for (let i = 0; i < 7; i++) {
    const d = addDays(visibleWeekStart, i);
    const isSelected = weekModeActive
      ? isSameDay(visibleWeekStart, selectedWeekStart)
      : isSameDay(d, selectedDate);
    const classes = ['cal-day-cell'];
    if (isSelected) classes.push('active');
    if (isSameDay(d, today)) classes.push('is-today');
    html += `
      <div class="${classes.join(' ')}" data-date="${toIsoDate(d)}" title="${longDate(d)}">
        <span class="day-name">${DAY_NAMES_SHORT[d.getDay()]}</span>
        <span class="day-num">${d.getDate()}</span>
      </div>
    `;
  }
  daysTrack.innerHTML = html;
  attachDayCellListeners();
  updateMonthDisplay();
}

function attachDayCellListeners() {
  document.querySelectorAll('.cal-day-cell').forEach(cell => {
    cell.addEventListener('click', (e) => {
      e.stopPropagation();
      const iso = cell.getAttribute('data-date');
      if (iso) selectDate(fromIsoDate(iso));
    });
  });
}

function syncDateUI() {
  const label = document.getElementById('date-filter-label');
  if (label) {
    if (weekModeActive) {
      const ws = weekStartOf(selectedDate);
      label.textContent = `${shortDate(ws)} – ${shortDate(addDays(ws, 6))}`;
    } else {
      const rel = relativeDayName(selectedDate);
      label.textContent = rel ? `${rel}, ${shortDate(selectedDate)}` : shortDate(selectedDate);
    }
  }

  const iso = toIsoDate(selectedDate);
  const customInput = document.getElementById('custom-date-select-input');
  const nativeInput = document.getElementById('native-date-picker');
  if (customInput) customInput.value = iso;
  if (nativeInput) nativeInput.value = iso;

  // Highlight the matching preset in the dropdown
  const t = getToday();
  let activeKey = null;
  if (weekModeActive && isSameDay(weekStartOf(selectedDate), weekStartOf(t))) activeKey = 'week';
  else if (!weekModeActive && isSameDay(selectedDate, t)) activeKey = 'today';
  else if (!weekModeActive && isSameDay(selectedDate, addDays(t, -1))) activeKey = 'yesterday';
  else if (!weekModeActive && isSameDay(selectedDate, addDays(t, 1))) activeKey = 'tomorrow';
  document.querySelectorAll('.date-menu-option').forEach(o => {
    o.classList.toggle('active', o.getAttribute('data-date-val') === activeKey);
  });

  refreshDateMenuLabels();
  renderCalendarDays();
}

function selectDate(date, { weekMode = false, silent = false } = {}) {
  selectedDate = startOfDay(date);
  weekModeActive = weekMode;
  visibleWeekStart = weekStartOf(selectedDate);
  syncDateUI();
  if (!silent) {
    if (weekMode) {
      const ws = weekStartOf(selectedDate);
      showToast(`Showing week: ${longDate(ws)} – ${longDate(addDays(ws, 6))}`, 'info');
    } else {
      const rel = relativeDayName(selectedDate);
      showToast(`Date selected: ${rel ? rel + ' (' + longDate(selectedDate) + ')' : longDate(selectedDate)}`, 'info');
    }
  }
}

function initDateFilter() {
  const dateBtn = document.getElementById('btn-date-filter');
  const calIconBtn = document.getElementById('btn-calendar-icon');
  const dropdown = document.getElementById('date-filter-dropdown');
  const customInput = document.getElementById('custom-date-select-input');
  const nativeInput = document.getElementById('native-date-picker');

  if (!dateBtn || !dropdown) return;

  const closeDropdown = () => {
    dropdown.style.display = 'none';
    dateBtn.setAttribute('aria-expanded', 'false');
  };

  const toggleDropdown = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const isVisible = dropdown.style.display === 'block';
    closeAllDropdowns(isVisible ? null : dropdown);
    if (!isVisible) refreshDateMenuLabels();
    dropdown.style.display = isVisible ? 'none' : 'block';
    dateBtn.setAttribute('aria-expanded', isVisible ? 'false' : 'true');
  };

  dateBtn.addEventListener('click', toggleDropdown);

  if (calIconBtn) {
    calIconBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Prefer the browser's native calendar popup when supported
      if (nativeInput && typeof nativeInput.showPicker === 'function') {
        try {
          nativeInput.showPicker();
          return;
        } catch (err) {
          // showPicker can be blocked (e.g. in iframes) - fall back to the dropdown
        }
      }
      toggleDropdown(e);
      if (customInput && dropdown.style.display === 'block') {
        setTimeout(() => customInput.focus(), 50);
      }
    });
  }

  // Preset options are computed relative to the real current date
  document.querySelectorAll('.date-menu-option').forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const t = getToday();
      const val = opt.getAttribute('data-date-val');
      if (val === 'today') selectDate(t);
      else if (val === 'yesterday') selectDate(addDays(t, -1));
      else if (val === 'tomorrow') selectDate(addDays(t, 1));
      else if (val === 'week') selectDate(t, { weekMode: true });
      closeDropdown();
    });
  });

  const handleDateChange = (val) => {
    if (!val) return;
    selectDate(fromIsoDate(val));
    closeDropdown();
  };

  if (customInput) {
    customInput.addEventListener('click', (e) => e.stopPropagation());
    customInput.addEventListener('change', (e) => {
      e.stopPropagation();
      handleDateChange(customInput.value);
    });
  }

  if (nativeInput) {
    nativeInput.addEventListener('change', (e) => {
      e.stopPropagation();
      handleDateChange(nativeInput.value);
    });
  }
}

function initCalendarStrip() {
  const prevBtn = document.getElementById('cal-prev-btn');
  const nextBtn = document.getElementById('cal-next-btn');
  const monthDisplay = document.getElementById('cal-month-display');

  // Initial render from today's real date
  selectDate(getToday(), { silent: true });

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      visibleWeekStart = addDays(visibleWeekStart, -7);
      renderCalendarDays();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      visibleWeekStart = addDays(visibleWeekStart, 7);
      renderCalendarDays();
    });
  }

  // Clicking the month title jumps back to today
  if (monthDisplay) {
    monthDisplay.addEventListener('click', (e) => {
      e.stopPropagation();
      selectDate(getToday());
    });
  }

  // Handle midnight rollover so "Today" stays accurate if the dashboard stays open
  setInterval(() => {
    const now = getToday();
    if (!isSameDay(now, lastKnownToday)) {
      const wasOnToday = !weekModeActive && isSameDay(selectedDate, lastKnownToday);
      lastKnownToday = now;
      if (wasOnToday) selectDate(now, { silent: true });
      else syncDateUI();
    }
  }, 60 * 1000);
}

// Queue Rendering (Matching Thumbnail Figma Cards)
function initQueue() {
  const queueTabs = document.querySelectorAll('.queue-tab');
  queueTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      queueTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeQueueFilter = tab.getAttribute('data-filter');
      renderQueue(document.getElementById('global-patient-search').value.toLowerCase().trim());
    });
  });

  renderQueue('');
}

// ==============================================================================
// Live Patient Kiosk & Easy Mode Ingestion Bridge
// ==============================================================================
let kioskPollTimer = null;

const LANG_NAMES = {
  en: "English",
  hi: "हिन्दी (Hindi)",
  or: "ଓଡ଼ିଆ (Odia)",
  bn: "বাংলা (Bengali)",
  ta: "தமிழ் (Tamil)",
  te: "తెలుగు (Telugu)",
  mr: "मराठी (Marathi)",
  gu: "ગુજરાતી (Gujarati)"
};

function initLiveKioskBridge() {
  fetchAndRenderKioskQueue();
  if (kioskPollTimer) clearInterval(kioskPollTimer);
  kioskPollTimer = setInterval(fetchAndRenderKioskQueue, 3000);
}

async function fetchAndRenderKioskQueue() {
  try {
    const res = await fetch('/api/queue/active');
    if (!res.ok) return;
    const data = await res.json();
    renderKioskCards(data);
  } catch (e) {
    console.warn("Kiosk stream fetch error:", e);
  }
}

function renderKioskCards(data) {
  const container = document.getElementById('kiosk-feed-cards');
  const countBadge = document.getElementById('kiosk-waiting-count');
  if (!container || !countBadge) return;

  const queue = data.queue || [];
  const waitingItems = queue.filter(q => q.status === "waiting");
  countBadge.textContent = `${waitingItems.length} In Queue (${data.red_count || 0} Critical)`;
  if (data.red_count > 0) {
    countBadge.style.background = 'rgba(238, 93, 80, 0.2)';
    countBadge.style.color = '#ee5d50';
  } else {
    countBadge.style.background = 'rgba(67, 24, 255, 0.12)';
    countBadge.style.color = '#4318ff';
  }

  if (queue.length === 0) {
    container.innerHTML = `<div style="font-size:12px; color:var(--text-muted); padding:10px;">No incoming kiosk submissions yet. New intakes from /patient will appear here in real-time.</div>`;
    return;
  }

  container.innerHTML = '';
  queue.slice(0, 6).forEach(item => {
    const card = document.createElement('div');
    const isCalled = item.status === "called";
    card.className = `kiosk-token-card triage-${item.triage_color} ${isCalled ? 'is-called' : ''}`;
    
    const colorBadge = item.triage_color === 'red'
      ? '<span class="status-pill-danger" style="background:#fee4e2;color:#d92d20;font-weight:800;font-size:10px;padding:2px 8px;border-radius:20px;">🔴 Emergent (Red)</span>'
      : item.triage_color === 'yellow'
      ? '<span class="status-pill-warning" style="background:#fef0c7;color:#b54708;font-weight:800;font-size:10px;padding:2px 8px;border-radius:20px;">🟡 Urgent (Yellow)</span>'
      : '<span class="status-pill-success" style="background:#dcfae6;color:#067647;font-weight:800;font-size:10px;padding:2px 8px;border-radius:20px;">🟢 Routine (Green)</span>';

    const langName = LANG_NAMES[item.language] || item.language;

    card.innerHTML = `
      <div class="kt-top-row">
        <span class="kt-token-num">🎫 ${item.token_id}</span>
        <span class="kt-lang-badge"><i class="fa-solid fa-language"></i> ${langName}</span>
        ${colorBadge}
      </div>
      <div class="kt-symptoms-line">
        ${(item.symptoms_text || []).join(', ') || 'General Malaise'}
      </div>
      <div class="kt-meta-line">
        <span><i class="fa-solid fa-user"></i> ${(item.age_group || 'adult').toUpperCase()}</span>
        <span><i class="fa-solid fa-face-frown"></i> Pain: <strong>${item.pain_score}/10</strong></span>
        <span><i class="fa-solid fa-clock"></i> ${item.status === 'called' ? '📢 Called (' + (item.called_room || 'Room 2') + ')' : '⏳ In Queue'}</span>
      </div>
      <div class="kt-action-row">
        <button class="btn-kt-load" title="Load into Clinical AI workspace">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Run AI Intake
        </button>
        <button class="btn-kt-call ${isCalled ? 'called-done' : ''}" title="Broadcast call to patient screen">
          <i class="fa-solid fa-bullhorn"></i> ${isCalled ? 'Called' : 'Call into Room 2'}
        </button>
      </div>
    `;

    // Action 1: Load into AI Intake Workspace
    card.querySelector('.btn-kt-load').addEventListener('click', () => {
      loadKioskPatientToIntake(item);
    });

    // Action 2: Call patient
    const callBtn = card.querySelector('.btn-kt-call');
    callBtn.addEventListener('click', async () => {
      try {
        callBtn.disabled = true;
        callBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Calling…`;
        const res = await fetch('/api/queue/call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token_id: item.token_id, room: 'OPD Room 2' })
        });
        if (res.ok) {
          callBtn.className = 'btn-kt-call called-done';
          callBtn.innerHTML = `<i class="fa-solid fa-check"></i> Called (Room 2)`;
          fetchAndRenderKioskQueue();
        }
      } catch (err) {
        console.error("Call error:", err);
      }
    });

    container.appendChild(card);
  });
}

function loadKioskPatientToIntake(item) {
  const p = {
    id: item.token_id,
    name: item.patient_name || `Kiosk Patient ${item.token_id}`,
    age: item.age_group === "elderly" ? 70 : item.age_group === "child" ? 8 : item.age_group === "baby" ? 1 : 35,
    gender: "Other",
    acuity: item.triage_color === "red" ? "emergent" : item.triage_color === "yellow" ? "urgent" : "routine",
    acuity_label: item.triage_color === "red" ? "ESI 2 • Emergent" : item.triage_color === "yellow" ? "ESI 3 • Urgent" : "ESI 4 • Routine",
    chief_complaint: `Kiosk Reported: ${(item.symptoms_text || []).join(', ')} (Pain ${item.pain_score}/10, Audio: ${item.audio_notes || 'None'})`,
    symptoms: item.symptoms_text || [],
    symptom_duration_days: 1,
    medical_history: [],
    allergies: [],
    current_medications: [],
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    vitals: item.vitals_estimate
  };

  loadPatientToDetail(p, true);
}

function renderQueue(query = '') {
  const container = document.getElementById('opd-patient-list');
  container.innerHTML = '';

  const filtered = OPD_PATIENT_QUEUE.filter(p => {
    const matchesFilter = activeQueueFilter === 'all' || p.acuity === activeQueueFilter;
    const matchesQuery = !query || 
      p.name.toLowerCase().includes(query) || 
      p.id.toLowerCase().includes(query) || 
      p.chief_complaint.toLowerCase().includes(query);
    return matchesFilter && matchesQuery;
  });

  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'patient-card-figma';
    card.innerHTML = `
      <div class="p-card-top">
        <div class="p-avatar-wrap">
          <img src="${p.avatar}" alt="${p.name}">
          <span class="p-acuity-dot dot-${p.acuity}"></span>
        </div>
        <div class="p-info-main">
          <div class="p-name-line">${p.name} <small style="font-size:11px; color:var(--text-muted);">(${p.id})</small></div>
          <div class="p-complaint-sub">${p.age}yo ${p.gender} • ${p.chief_complaint}</div>
        </div>
        <span class="p-triage-badge badge-${p.acuity}">${p.acuity_label.split('•')[1]?.trim() || p.acuity}</span>
      </div>

      <div class="p-vitals-strip">
        <div class="p-vital-unit">HR: <span>${p.vitals.heart_rate} bpm</span></div>
        <div class="p-vital-unit">BP: <span>${p.vitals.blood_pressure_sys}/${p.vitals.blood_pressure_dia}</span></div>
        <div class="p-vital-unit">SpO2: <span>${p.vitals.oxygen_saturation}%</span></div>
      </div>

      ${queueAiPreviewEnabled ? `
        <div style="margin: 4px 0 8px;">
          <span class="queue-ai-badge">
            <i class="fa-solid fa-brain text-primary"></i> AI Clue: <strong>${getQuickAiPreview(p)}</strong>
          </span>
        </div>
      ` : ''}

      <div class="p-card-actions">
        <button class="btn-solid-navy btn-view-ai" data-id="${p.id}">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Run AI Recommendation
        </button>
        <button class="btn-outline-navy btn-quick-book" data-id="${p.id}">
          <i class="fa-solid fa-calendar-check"></i> Consult
        </button>
        <div class="p-quick-contact-icons">
          <button class="p-contact-btn" title="Call Patient"><i class="fa-solid fa-phone"></i></button>
          <button class="p-contact-btn" title="Message"><i class="fa-brands fa-whatsapp"></i></button>
        </div>
      </div>
    `;

    card.querySelector('.btn-view-ai').addEventListener('click', (e) => {
      e.stopPropagation();
      loadPatientToDetail(p, true);
    });

    card.querySelector('.btn-quick-book').addEventListener('click', (e) => {
      e.stopPropagation();
      loadPatientToDetail(p, false);
      openBookingModal();
    });

    card.addEventListener('click', () => {
      loadPatientToDetail(p, true);
    });

    container.appendChild(card);
  });
}

function loadPatientToDetail(patient, autoExecute = true) {
  currentPatient = patient;

  // Update Hero Card
  document.getElementById('hero-img').src = patient.avatar;
  document.getElementById('hero-name').textContent = patient.name;
  document.getElementById('hero-id').innerHTML = `<i class="fa-solid fa-id-card"></i> ${patient.id}`;
  document.getElementById('hero-demographics').innerHTML = `<i class="fa-solid fa-user"></i> ${patient.age}, ${patient.gender}`;
  document.getElementById('hero-chief-short').innerHTML = `<i class="fa-solid fa-stethoscope"></i> ${patient.chief_complaint}`;

  const acuityBadge = document.getElementById('hero-acuity-badge');
  acuityBadge.textContent = patient.acuity_label;
  acuityBadge.className = `badge-acuity badge-${patient.acuity}`;

  if (patient.vitals) {
    document.getElementById('hero-bp').textContent = `${patient.vitals.blood_pressure_sys}/${patient.vitals.blood_pressure_dia}`;
    document.getElementById('hero-hr').textContent = `${patient.vitals.heart_rate} bpm`;
    document.getElementById('hero-spo2').textContent = `${patient.vitals.oxygen_saturation}%`;

    // Fill form inputs
    document.getElementById('vital-hr').value = patient.vitals.heart_rate || '';
    document.getElementById('vital-bpsys').value = patient.vitals.blood_pressure_sys || '';
    document.getElementById('vital-bpdia').value = patient.vitals.blood_pressure_dia || '';
    document.getElementById('vital-spo2').value = patient.vitals.oxygen_saturation || '';
    document.getElementById('vital-temp').value = patient.vitals.temperature || '';
    document.getElementById('vital-rr').value = patient.vitals.respiratory_rate || '';
  }

  document.getElementById('input-patient-id').value = patient.id;
  document.getElementById('input-patient-name').value = patient.name;
  document.getElementById('input-patient-age').value = patient.age;
  document.getElementById('select-patient-gender').value = patient.gender;
  document.getElementById('input-symptom-duration').value = patient.symptom_duration_days || 1;
  document.getElementById('input-chief-complaint').value = patient.chief_complaint || '';

  document.getElementById('input-medical-history').value = (patient.medical_history || []).join(', ');
  document.getElementById('input-allergies').value = (patient.allergies || []).join(', ');
  document.getElementById('input-medications').value = (patient.current_medications || []).join(', ');

  selectedSymptoms.clear();
  (patient.symptoms || []).forEach(s => selectedSymptoms.add(s));
  renderSymptomChips();
  updateLiveVitals();

  // Switch to detail view
  document.querySelector('.seg-pill-btn[data-view="view-patient-detail"]').click();

  const wrapper = document.getElementById('ai-recommendations-wrapper');
  const pausedBanner = document.getElementById('ai-disabled-banner');
  if (aiRecommendationsEnabled) {
    if (wrapper) wrapper.style.display = 'block';
    if (pausedBanner) pausedBanner.style.display = 'none';
    if (autoExecute) {
      executeOrchestration();
    }
  } else {
    if (wrapper) wrapper.style.display = 'none';
    if (pausedBanner) pausedBanner.style.display = 'block';
  }
}

function resetIntakeForm() {
  document.getElementById('patient-intake-form').reset();
  document.getElementById('hero-name').textContent = "New Patient Intake";
  document.getElementById('hero-id').textContent = "PT-NEW";
  document.getElementById('input-patient-id').value = `PT-${Math.floor(10000 + Math.random() * 90000)}`;
  selectedSymptoms.clear();
  renderSymptomChips();
  updateLiveVitals();
}

// Anatomical System Filter
function initAnatomicalSelector() {
  const buttons = document.querySelectorAll('.body-zone-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeRegionFilter = btn.getAttribute('data-region');
      renderSymptomChips();
    });
  });
}

// Symptom Chips
function initSymptomChips() {
  renderSymptomChips();
  document.getElementById('btn-clear-symptoms').addEventListener('click', () => {
    selectedSymptoms.clear();
    renderSymptomChips();
  });
}

function renderSymptomChips() {
  const container = document.getElementById('symptom-chips-container');
  container.innerHTML = '';

  const filtered = SYMPTOM_DATA.filter(s => activeRegionFilter === 'all' || s.region === activeRegionFilter);

  filtered.forEach(item => {
    const chip = document.createElement('div');
    chip.className = `symptom-chip ${selectedSymptoms.has(item.name) ? 'selected' : ''}`;
    chip.textContent = item.name;
    chip.addEventListener('click', () => {
      if (selectedSymptoms.has(item.name)) {
        selectedSymptoms.delete(item.name);
        chip.classList.remove('selected');
      } else {
        selectedSymptoms.add(item.name);
        chip.classList.add('selected');
      }
      document.getElementById('symptom-selected-count').textContent = selectedSymptoms.size;
      if (aiRecommendationsEnabled) scheduleAutoAiRun();
    });
    container.appendChild(chip);
  });

  document.getElementById('symptom-selected-count').textContent = selectedSymptoms.size;

  document.getElementById('btn-clear-symptoms')?.addEventListener('click', () => {
    selectedSymptoms.clear();
    renderSymptomChips();
    if (aiRecommendationsEnabled) scheduleAutoAiRun();
  });
}

// Live Vitals Real-Time Evaluator
function initLiveVitalsEvaluator() {
  ['vital-hr', 'vital-bpsys', 'vital-bpdia', 'vital-spo2', 'vital-temp', 'vital-rr'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateLiveVitals);
  });
}

function updateLiveVitals() {
  const hr = parseInt(document.getElementById('vital-hr').value);
  const sys = parseInt(document.getElementById('vital-bpsys').value);
  const dia = parseInt(document.getElementById('vital-bpdia').value);
  const spo2 = parseFloat(document.getElementById('vital-spo2').value);
  const temp = parseFloat(document.getElementById('vital-temp').value);
  const rr = parseInt(document.getElementById('vital-rr').value);

  let warningCount = 0;
  let criticalCount = 0;

  // HR
  const hrBadge = document.getElementById('badge-hr');
  if (!isNaN(hr)) {
    if (hr > 130 || hr < 45) { setBadge(hrBadge, 'Critical', 'danger'); criticalCount++; }
    else if (hr > 100) { setBadge(hrBadge, 'Tachycardia', 'warning'); warningCount++; }
    else if (hr < 55) { setBadge(hrBadge, 'Bradycardia', 'warning'); warningCount++; }
    else { setBadge(hrBadge, 'Normal', 'normal'); }
  }

  // BP Sys
  const bpSysBadge = document.getElementById('badge-bpsys');
  if (!isNaN(sys)) {
    if (sys >= 180 || sys < 85) { setBadge(bpSysBadge, 'Crisis/Low', 'danger'); criticalCount++; }
    else if (sys >= 140) { setBadge(bpSysBadge, 'Stage 2 HTN', 'danger'); warningCount++; }
    else if (sys > 120) { setBadge(bpSysBadge, 'Elevated', 'warning'); warningCount++; }
    else { setBadge(bpSysBadge, 'Optimal', 'normal'); }
  }

  // BP Dia
  const bpDiaBadge = document.getElementById('badge-bpdia');
  if (!isNaN(dia)) {
    if (dia >= 110 || dia < 55) { setBadge(bpDiaBadge, 'Critical', 'danger'); criticalCount++; }
    else if (dia >= 90) { setBadge(bpDiaBadge, 'High', 'warning'); warningCount++; }
    else { setBadge(bpDiaBadge, 'Normal', 'normal'); }
  }

  // SpO2
  const spo2Badge = document.getElementById('badge-spo2');
  if (!isNaN(spo2)) {
    if (spo2 < 90) { setBadge(spo2Badge, 'Severe Hypoxia', 'danger'); criticalCount++; }
    else if (spo2 < 94) { setBadge(spo2Badge, 'Mild Hypoxia', 'warning'); warningCount++; }
    else { setBadge(spo2Badge, 'Normal', 'normal'); }
  }

  // Temp
  const tempBadge = document.getElementById('badge-temp');
  if (!isNaN(temp)) {
    if (temp >= 39.5 || temp < 35.0) { setBadge(tempBadge, 'High Fever/Hypo', 'danger'); criticalCount++; }
    else if (temp >= 38.0) { setBadge(tempBadge, 'Febrile', 'warning'); warningCount++; }
    else { setBadge(tempBadge, 'Afebrile', 'normal'); }
  }

  // Respiration Rate
  const rrBadge = document.getElementById('badge-rr');
  if (!isNaN(rr)) {
    if (rr >= 28 || rr < 10) { setBadge(rrBadge, 'Severe Distress', 'danger'); criticalCount++; }
    else if (rr > 20) { setBadge(rrBadge, 'Tachypnea', 'warning'); warningCount++; }
    else { setBadge(rrBadge, 'Normal', 'normal'); }
  }

  const overall = document.getElementById('vitals-overall-status');
  if (criticalCount > 0) {
    overall.className = 'vital-summary-pill badge-danger';
    overall.textContent = `${criticalCount} Critical Alerts`;
  } else if (warningCount > 0) {
    overall.className = 'vital-summary-pill badge-warning';
    overall.textContent = `${warningCount} Warning Vitals`;
  } else {
    overall.className = 'vital-summary-pill badge-normal';
    overall.textContent = 'Normal Vitals';
  }

  if (aiRecommendationsEnabled) {
    scheduleAutoAiRun();
  }
}

function setBadge(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = `v-eval-badge badge-${type}`;
}

// Voice Dictation (Uses real Web Speech Recognition when available)
function initVoiceDictation() {
  const dictBtn = document.getElementById('btn-voice-dictate');
  const micIcon = document.getElementById('mic-icon');
  const dictText = document.getElementById('dictation-text');
  const wave = document.getElementById('dictation-wave');
  const textarea = document.getElementById('input-chief-complaint');

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  dictBtn.addEventListener('click', () => {
    dictationActive = !dictationActive;
    if (dictationActive) {
      dictBtn.classList.add('recording');
      micIcon.className = 'fa-solid fa-microphone-lines text-emergent';
      dictText.textContent = 'Listening...';
      wave.style.display = 'flex';

      if (SR) {
        try {
          const rec = new SR();
          rec.lang = 'en-US';
          rec.interimResults = false;
          rec.maxAlternatives = 1;

          rec.onresult = (evt) => {
            const transcript = evt.results[0][0].transcript;
            if (textarea.value.trim()) {
              textarea.value += ' ' + transcript;
            } else {
              textarea.value = transcript;
            }
            stopDictation();
          };

          rec.onerror = (err) => {
            console.warn('SpeechRecognition error:', err);
            stopDictation();
          };

          rec.onend = () => stopDictation();
          rec.start();
          return;
        } catch (e) {
          console.warn('Failed to start SpeechRecognition:', e);
        }
      }

      // Fallback message if SpeechRecognition is not supported or permitted in environment
      setTimeout(() => {
        if (!textarea.value.trim()) {
          textarea.value = "Patient presents with acute chest pain, shortness of breath, and cold sweating.";
        }
        stopDictation();
      }, 1800);
    } else {
      stopDictation();
    }
  });

  function stopDictation() {
    dictationActive = false;
    dictBtn.classList.remove('recording');
    micIcon.className = 'fa-solid fa-microphone';
    dictText.textContent = 'AI Voice Dictate';
    wave.style.display = 'none';
  }
}

// Pipeline Nodes
const PIPELINE_NODES = [
  { id: 'step-compliance', name: 'HIPAA Guardrail' },
  { id: 'step-triage', name: 'ESI Triage' },
  { id: 'step-dx', name: 'Differential Dx' },
  { id: 'step-specialist', name: 'Specialist Match' },
  { id: 'step-protocol', name: 'Care Plan' }
];

function initPipelineNodes() {
  const container = document.getElementById('pipeline-nodes-container');
  container.innerHTML = '';
  PIPELINE_NODES.forEach((n, idx) => {
    const el = document.createElement('div');
    el.id = n.id;
    el.className = 'p-step-cell';
    el.innerHTML = `
      <span class="p-step-num">AGENT 0${idx + 1}</span>
      <span class="p-step-title">${n.name}</span>
      <span class="p-step-ms" id="${n.id}-ms">-- ms</span>
    `;
    container.appendChild(el);
  });
}

// Orchestration Execution
function initEventHandlers() {
  const form = document.getElementById('patient-intake-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await executeOrchestration();
  });

  document.getElementById('btn-copy-fhir')?.addEventListener('click', copyFhir);
  document.getElementById('btn-download-fhir')?.addEventListener('click', downloadFhir);
}

async function executeOrchestration(silent = false) {
  if (!aiRecommendationsEnabled) return;

  const btn = document.getElementById('btn-run-orchestrator');
  const statusBadge = document.getElementById('orchestrator-status-badge');
  if (!silent) {
    btn.classList.add('loading');
    btn.disabled = true;
  }

  const hrVal = parseInt(document.getElementById('vital-hr').value);
  const bpSysVal = parseInt(document.getElementById('vital-bpsys').value);
  const bpDiaVal = parseInt(document.getElementById('vital-bpdia').value);
  const spo2Val = parseFloat(document.getElementById('vital-spo2').value);
  const tempVal = parseFloat(document.getElementById('vital-temp').value);
  const rrVal = parseInt(document.getElementById('vital-rr').value);

  const payload = {
    patient_id: document.getElementById('input-patient-id').value || "PT-UNKNOWN",
    name: document.getElementById('input-patient-name').value || "Anonymous Patient",
    age: parseInt(document.getElementById('input-patient-age').value) || 45,
    gender: document.getElementById('select-patient-gender').value,
    chief_complaint: document.getElementById('input-chief-complaint').value,
    symptoms: Array.from(selectedSymptoms),
    symptom_duration_days: parseInt(document.getElementById('input-symptom-duration').value) || 1,
    medical_history: document.getElementById('input-medical-history').value.split(',').map(s => s.trim()).filter(Boolean),
    allergies: document.getElementById('input-allergies').value.split(',').map(s => s.trim()).filter(Boolean),
    current_medications: document.getElementById('input-medications').value.split(',').map(s => s.trim()).filter(Boolean),
    vitals: {
      heart_rate: isNaN(hrVal) ? null : hrVal,
      blood_pressure_sys: isNaN(bpSysVal) ? null : bpSysVal,
      blood_pressure_dia: isNaN(bpDiaVal) ? null : bpDiaVal,
      oxygen_saturation: isNaN(spo2Val) ? null : spo2Val,
      temperature: isNaN(tempVal) ? null : tempVal,
      temperature_unit: "C",
      respiratory_rate: isNaN(rrVal) ? null : rrVal
    }
  };

  try {
    const res = await fetch('/api/orchestrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    currentOrchestrationResult = data;
    currentFhirBundle = data.fhir_bundle;

    renderResults(data);

    // Update latencies
    if (data.orchestration_traces) {
      data.orchestration_traces.forEach((trace, idx) => {
        if (idx < PIPELINE_NODES.length) {
          const id = PIPELINE_NODES[idx].id;
          const cell = document.getElementById(id);
          const ms = document.getElementById(`${id}-ms`);
          if (cell) cell.classList.add('success');
          if (ms) ms.textContent = `${trace.execution_time_ms} ms`;
        }
      });
    }

    statusBadge.textContent = 'Orchestration Completed';
  } catch (err) {
    console.error('Orchestration failed:', err);
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

function renderResults(data) {
  // Specialist
  const spec = data.specialist;
  document.getElementById('specialist-name').textContent = spec.specialty;
  document.getElementById('specialist-facility').innerHTML = `<i class="fa-solid fa-hospital"></i> ${spec.recommended_facility}`;
  document.getElementById('specialist-rationale').textContent = spec.rationale;
  document.getElementById('specialist-urgency-badge').textContent = spec.urgency;

  // Diagnoses
  const dxList = document.getElementById('differential-dx-list');
  dxList.innerHTML = '';
  document.getElementById('dx-count-tag').textContent = `${data.differential_diagnoses.length} Matches`;

  data.differential_diagnoses.forEach(dx => {
    const card = document.createElement('div');
    card.className = 'dx-item-card';
    card.innerHTML = `
      <div class="dx-item-top">
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="dx-item-title">${dx.condition}</span>
          <span class="dx-icd-pill">ICD-10: ${dx.icd10}</span>
        </div>
        <div class="dx-conf-bar-wrap">
          <div class="dx-conf-track">
            <div class="dx-conf-fill" style="width: ${dx.confidence}%;"></div>
          </div>
          <span class="dx-conf-num">${dx.confidence}%</span>
        </div>
      </div>
      <div class="dx-item-desc">${dx.description}</div>
      <div style="font-size:11px; color:var(--text-muted);">
        Matched: <strong>${(dx.matching_symptoms || []).join(', ')}</strong>
      </div>
    `;
    card.addEventListener('click', () => openDxModal(dx));
    dxList.appendChild(card);
  });

  // Care plan
  const plan = data.care_plan;
  populateBulletList('plan-immediate-actions', plan.initial_actions);
  populateBulletList('plan-non-pharm', plan.non_pharmacological);
  populateBulletList('plan-cautions', plan.medication_cautions);
  populateBulletList('plan-red-flags', plan.red_flag_warnings);

  // Diagnostic tests checklist
  orderedTests.clear();
  const testBox = document.getElementById('plan-tests-checklist');
  testBox.innerHTML = '';
  (plan.recommended_tests || []).forEach((test, idx) => {
    const item = document.createElement('label');
    item.className = 'plan-check-item';
    item.innerHTML = `
      <input type="checkbox" id="test-check-${idx}">
      <span>${test}</span>
    `;
    const cb = item.querySelector('input');
    cb.addEventListener('change', () => {
      if (cb.checked) {
        orderedTests.add(test);
        item.classList.add('ordered');
      } else {
        orderedTests.delete(test);
        item.classList.remove('ordered');
      }
      document.getElementById('test-order-counter').textContent = `${orderedTests.size} of ${plan.recommended_tests.length} Tests Ordered`;
    });
    testBox.appendChild(item);
  });
  document.getElementById('test-order-counter').textContent = `0 of ${plan.recommended_tests.length} Tests Ordered`;

  // Update FHIR & Audit views
  const fhirCode = document.getElementById('fhir-json-code');
  if (fhirCode) fhirCode.textContent = JSON.stringify(data.fhir_bundle, null, 2);

  const audit = data.hipaa_compliance;
  document.getElementById('audit-masked-name').textContent = audit.masked_patient_identity || 'N/A';
  document.getElementById('audit-hash-val').textContent = audit.audit_hash || 'N/A';

  const phiList = document.getElementById('phi-mitigations-list');
  phiList.innerHTML = '';
  (audit.phi_types_flagged || []).forEach(type => {
    const tag = document.createElement('div');
    tag.className = 'phi-tag';
    tag.innerHTML = `<i class="fa-solid fa-lock text-primary"></i> Masked Token: <strong>${type}</strong>`;
    phiList.appendChild(tag);
  });
}

function populateBulletList(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '';
  (items || []).forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    el.appendChild(li);
  });
}

// Marketplace
async function initMarketplace() {
  const grid = document.getElementById('marketplace-agents-grid');
  try {
    const res = await fetch('/api/agents');
    const agents = await res.json();
    grid.innerHTML = '';

    agents.forEach(agent => {
      const card = document.createElement('div');
      card.className = 'm-agent-card';
      card.innerHTML = `
        <div>
          <span style="font-size:10px; font-weight:800; text-transform:uppercase; color:var(--blue-accent);">${agent.category}</span>
          <h4 style="font-size:15px; font-weight:800; margin: 4px 0;">${agent.name}</h4>
          <p style="font-size:12px; color:var(--text-secondary);">${agent.description}</p>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); padding-top:8px; border-top:1px solid var(--card-border);">
          <span>${agent.certification}</span>
          <span style="color:var(--color-success); font-weight:700;">~${agent.latency_avg_ms}ms</span>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.warn('Failed to load agents:', err);
  }
}

// Modals
function initModals() {
  const bModal = document.getElementById('booking-modal');
  const dxModal = document.getElementById('dx-modal');
  const refModal = document.getElementById('referral-modal');
  const profModal = document.getElementById('profile-modal');

  document.getElementById('btn-close-modal')?.addEventListener('click', () => bModal && (bModal.style.display = 'none'));
  document.getElementById('btn-close-dx-modal')?.addEventListener('click', () => dxModal && (dxModal.style.display = 'none'));
  document.getElementById('btn-close-referral-modal')?.addEventListener('click', () => refModal && (refModal.style.display = 'none'));
  document.getElementById('btn-close-profile-modal')?.addEventListener('click', () => profModal && (profModal.style.display = 'none'));

  document.getElementById('btn-book-consult')?.addEventListener('click', openBookingModal);
  document.getElementById('btn-transfer-referral')?.addEventListener('click', openReferralModal);
  document.getElementById('doctor-profile-btn')?.addEventListener('click', openProfileModal);

  window.addEventListener('click', (e) => {
    if (e.target === bModal) bModal.style.display = 'none';
    if (e.target === dxModal) dxModal.style.display = 'none';
    if (e.target === refModal) refModal.style.display = 'none';
    if (e.target === profModal) profModal.style.display = 'none';
  });
}

// ==============================================================================
// Toast Notifications System
// ==============================================================================
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: 'fa-circle-check',
    warning: 'fa-triangle-exclamation',
    error: 'fa-circle-exclamation',
    info: 'fa-circle-info'
  };

  const toast = document.createElement('div');
  toast.className = `toast-msg toast-${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

// ==============================================================================
// Header Notifications Dropdown
// ==============================================================================
function initNotifications() {
  const btn = document.getElementById('btn-notifications');
  const dropdown = document.getElementById('notifications-dropdown');
  const markReadBtn = document.getElementById('btn-mark-all-read');
  const badge = document.getElementById('notif-badge-count');

  if (!btn || !dropdown) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllDropdowns(dropdown);
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  });

  if (markReadBtn) {
    markReadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.notification-item.unread').forEach(item => {
        item.classList.remove('unread');
      });
      if (badge) badge.style.display = 'none';
      showToast('All notifications marked as read', 'success');
    });
  }

  // Clicking on a notification item
  document.querySelectorAll('.notification-item').forEach(item => {
    item.addEventListener('click', () => {
      const patientId = item.getAttribute('data-patient-id');
      dropdown.style.display = 'none';
      if (patientId) {
        const patient = OPD_PATIENT_QUEUE.find(p => p.id === patientId);
        if (patient) {
          loadPatientToDetail(patient);
          showToast(`Loaded ${patient.name} (${patientId}) into workspace`, 'info');
        }
      }
    });
  });
}

// ==============================================================================
// Header Clinic Management Menu
// ==============================================================================
function initClinicMenu() {
  const btn = document.getElementById('btn-header-menu');
  const dropdown = document.getElementById('header-menu-dropdown');
  const clinicDisplay = document.getElementById('clinic-name-display');

  if (!btn || !dropdown) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllDropdowns(dropdown);
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  });

  // Export CSV
  document.getElementById('menu-export-csv')?.addEventListener('click', () => {
    dropdown.style.display = 'none';
    exportQueueCsv();
  });

  // Switch Department
  const depts = [
    "Cardiothoracic & Acute OPD Clinic",
    "Emergency Medicine & Trauma Center",
    "General Internal Medicine & OPD",
    "Pediatric & Maternal Health OPD"
  ];
  let currentDeptIdx = 0;
  document.getElementById('menu-switch-dept')?.addEventListener('click', () => {
    currentDeptIdx = (currentDeptIdx + 1) % depts.length;
    if (clinicDisplay) clinicDisplay.textContent = depts[currentDeptIdx];
    dropdown.style.display = 'none';
    showToast(`Switched active clinic to: ${depts[currentDeptIdx]}`, 'success');
  });

  // Reset Queue
  document.getElementById('menu-reset-queue')?.addEventListener('click', () => {
    dropdown.style.display = 'none';
    activeQueueFilter = 'all';
    document.querySelectorAll('.queue-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.queue-tab[data-filter="all"]')?.classList.add('active');
    renderQueue('');
    showToast('OPD Patient Queue restored to initial state', 'info');
  });

  // Toggle Fullscreen
  document.getElementById('menu-toggle-fullscreen')?.addEventListener('click', () => {
    dropdown.style.display = 'none';
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      showToast('Entered Fullscreen OPD Kiosk mode', 'info');
    } else {
      document.exitFullscreen?.().catch(() => {});
      showToast('Exited Fullscreen mode', 'info');
    }
  });
}

function exportQueueCsv() {
  const headers = ["Patient ID", "Name", "Age", "Gender", "Acuity", "Chief Complaint", "BP", "HR", "SpO2"];
  const rows = OPD_PATIENT_QUEUE.map(p => [
    p.id,
    `"${p.name}"`,
    p.age,
    p.gender,
    `"${p.acuity_label || p.acuity}"`,
    `"${p.chief_complaint}"`,
    `"${p.vitals.blood_pressure_sys}/${p.vitals.blood_pressure_dia}"`,
    p.vitals.heart_rate,
    p.vitals.oxygen_saturation
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `OPD_Shift_Log_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  showToast("OPD Shift Log CSV exported successfully", "success");
}

// ==============================================================================
// KPI Header Filters
// ==============================================================================
function initKpiFilters() {
  document.querySelectorAll('.clickable-kpi').forEach(kpi => {
    kpi.addEventListener('click', () => {
      const target = kpi.getAttribute('data-filter-target');
      if (target === 'all' || target === 'emergent') {
        document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
        document.getElementById('view-opd-queue')?.classList.add('active');
        document.querySelectorAll('.seg-pill-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.seg-pill-btn[data-view="view-opd-queue"]')?.classList.add('active');

        activeQueueFilter = target;
        document.querySelectorAll('.queue-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.queue-tab[data-filter="${target}"]`)?.classList.add('active');
        renderQueue('');
        showToast(`Filtered OPD queue by ${target === 'all' ? 'All Patients' : 'Emergent / Urgent'}`, 'info');
      } else if (target === 'routine') {
        document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
        document.getElementById('view-patient-detail')?.classList.add('active');
        document.querySelectorAll('.seg-pill-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.seg-pill-btn[data-view="view-patient-detail"]')?.classList.add('active');
        showToast('Viewing AI Clinical Decision Support Workspace', 'info');
      }
    });
  });
}

// ==============================================================================
// Edit Intake Details
// ==============================================================================
function initEditIntake() {
  const btn = document.getElementById('btn-edit-intake');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const nameInput = document.getElementById('input-patient-name');
    const complaintInput = document.getElementById('input-complaint');
    const ageInput = document.getElementById('input-patient-age');

    [nameInput, complaintInput, ageInput].forEach(inp => {
      if (inp) {
        inp.classList.add('intake-edit-glow');
        setTimeout(() => inp.classList.remove('intake-edit-glow'), 3000);
      }
    });

    if (nameInput) {
      nameInput.focus();
      nameInput.select();
    }
    showToast('Intake form fields highlighted & ready for editing', 'info');
  });
}

// ==============================================================================
// Dispatch Referral Modal
// ==============================================================================
function openReferralModal() {
  const modal = document.getElementById('referral-modal');
  const content = document.getElementById('referral-modal-content');
  if (!modal || !content) return;

  const spec = currentOrchestrationResult?.specialist || { specialty: "Cardiology & Interventional Cardiac Care", recommended_facility: "Emergency Cardiac Care Unit / Cath Lab", urgency: "Emergent" };
  const pName = document.getElementById('input-patient-name')?.value || "Current Patient";
  const pId = document.getElementById('input-patient-id')?.value || "PT-77014";

  content.innerHTML = `
    <div style="background:var(--bg-app); padding:16px; border-radius:var(--radius-md); margin-bottom:16px; border:1px solid var(--card-border);">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
        <div>
          <span style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Patient</span>
          <h4 style="font-size:16px; font-weight:800; color:var(--navy-primary);">${pName} (${pId})</h4>
        </div>
        <span class="urgency-pill pill-emergent">${spec.urgency || "Emergent (1-2 Hours)"}</span>
      </div>
      <div style="margin-bottom:8px;">
        <span style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Target Specialty</span>
        <div style="font-size:14px; font-weight:700; color:var(--blue-accent);">${spec.specialty}</div>
      </div>
      <div>
        <span style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Receiving Facility</span>
        <div style="font-size:13px; color:var(--text-secondary);"><i class="fa-solid fa-hospital text-primary"></i> ${spec.recommended_facility}</div>
      </div>
    </div>

    <div style="margin-bottom:16px;">
      <label style="font-size:12px; font-weight:700; color:var(--navy-primary); display:block; margin-bottom:8px;">Referral Protocol Options:</label>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
          <input type="checkbox" id="chk-ref-ambulance" checked>
          <span>Dispatch Level-1 Ambulance Transport</span>
        </label>
        <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
          <input type="checkbox" id="chk-ref-telemetry" checked>
          <span>Transmit Live Continuous ECG & SpO2 Telemetry</span>
        </label>
        <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
          <input type="checkbox" id="chk-ref-fhir" checked>
          <span>Transmit HL7 FHIR R4 Bundle to Receiving EHR</span>
        </label>
      </div>
    </div>

    <div style="display:flex; gap:10px;">
      <button type="button" id="btn-confirm-dispatch-referral" class="btn-solid-blue" style="flex:1; justify-content:center;">
        <i class="fa-solid fa-paper-plane"></i> Confirm & Dispatch Referral
      </button>
      <button type="button" id="btn-cancel-referral" class="btn-outline-navy">Cancel</button>
    </div>
  `;

  modal.style.display = 'flex';

  content.querySelector('#btn-confirm-dispatch-referral')?.addEventListener('click', () => {
    const refNum = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
    content.innerHTML = `
      <div style="text-align:center; padding:24px 10px;">
        <i class="fa-solid fa-circle-check text-success" style="font-size:46px; margin-bottom:12px;"></i>
        <h3 style="font-size:20px; font-weight:800; color:var(--navy-primary); margin-bottom:6px;">Referral Dispatched!</h3>
        <p style="font-size:13.5px; color:var(--text-secondary); margin-bottom:14px;">
          Direct handover package sent to <strong>${spec.specialty}</strong> at ${spec.recommended_facility}.
        </p>
        <div style="display:inline-block; background:rgba(67,24,255,0.08); border:1px solid rgba(67,24,255,0.2); border-radius:var(--radius-pill); padding:6px 14px; font-size:12px; font-weight:700; color:var(--navy-primary); margin-bottom:18px;">
          Tracking Token: ${refNum}
        </div>
        <br>
        <button type="button" id="btn-done-referral" class="btn-primary-pill" style="min-width:140px; margin:0 auto;">
          Done
        </button>
      </div>
    `;
    showToast(`Referral ${refNum} dispatched to ${spec.specialty}`, 'success');
    content.querySelector('#btn-done-referral')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  });

  content.querySelector('#btn-cancel-referral')?.addEventListener('click', () => {
    modal.style.display = 'none';
  });
}

// ==============================================================================
// Doctor Profile Modal
// ==============================================================================
function openProfileModal() {
  const modal = document.getElementById('profile-modal');
  const content = document.getElementById('profile-modal-content');
  if (!modal || !content) return;

  content.innerHTML = `
    <div style="display:flex; align-items:center; gap:16px; margin-bottom:16px;">
      <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=160&auto=format&fit=crop&q=80" alt="Doctor" style="width:70px; height:70px; border-radius:50%; object-fit:cover; border:3px solid var(--blue-accent);">
      <div>
        <h3 style="font-size:18px; font-weight:800; color:var(--navy-primary); margin-bottom:2px;">Dr. Rajesh Sharma, MD, FACC</h3>
        <p style="font-size:12.5px; color:var(--blue-accent); font-weight:700; margin-bottom:2px;">Lead Consultant Cardiologist</p>
        <small style="color:var(--text-muted); font-size:11.5px;">Medical License: MCI-DEL-89421 • 14 Years Exp</small>
      </div>
    </div>

    <div style="background:var(--bg-app); border-radius:var(--radius-md); padding:14px; margin-bottom:16px; border:1px solid var(--card-border);">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div>
          <span style="font-size:11px; font-weight:700; color:var(--text-muted); display:block;">Active Shift:</span>
          <span style="font-size:13px; font-weight:700; color:var(--navy-primary);">08:00 – 16:00 (Room 4)</span>
        </div>
        <div>
          <span style="font-size:11px; font-weight:700; color:var(--text-muted); display:block;">OPD Consultations:</span>
          <span style="font-size:13px; font-weight:700; color:var(--navy-primary);">39 Patients (15 Urgent)</span>
        </div>
        <div>
          <span style="font-size:11px; font-weight:700; color:var(--text-muted); display:block;">Hospital:</span>
          <span style="font-size:13px; font-weight:700; color:var(--navy-primary);">Apollo Heart Institute</span>
        </div>
        <div>
          <span style="font-size:11px; font-weight:700; color:var(--text-muted); display:block;">AI Co-Pilot:</span>
          <span style="font-size:13px; font-weight:700; color:#05cd99;"><i class="fa-solid fa-circle-check"></i> Ollama Connected</span>
        </div>
      </div>
    </div>

    <button type="button" id="btn-close-prof-action" class="btn-solid-navy" style="width:100%; justify-content:center;">
      Close Profile
    </button>
  `;

  modal.style.display = 'flex';
  content.querySelector('#btn-close-prof-action')?.addEventListener('click', () => {
    modal.style.display = 'none';
  });
}

function closeAllDropdowns(except = null) {
  const dropdowns = [
    document.getElementById('notifications-dropdown'),
    document.getElementById('header-menu-dropdown'),
    document.getElementById('date-filter-dropdown')
  ];
  dropdowns.forEach(d => {
    if (d && d !== except) d.style.display = 'none';
  });
}

function initDropdownDismissal() {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.action-dropdown-wrap') && !e.target.closest('.date-dropdown-wrap')) {
      closeAllDropdowns();
    }
  });
}

function openBookingModal() {
  const modal = document.getElementById('booking-modal');
  const content = document.getElementById('booking-modal-content');
  const spec = currentOrchestrationResult?.specialist || { specialty: "Cardiology", recommended_facility: "Cardiac Unit" };

  content.innerHTML = `
    <div style="background:var(--bg-app); padding:14px; border-radius:var(--radius-md); margin-bottom:14px;">
      <h4 style="font-size:16px; font-weight:800; margin-bottom:2px;">Dr. Marcus Vance, MD, FACC</h4>
      <p style="font-size:12px; color:var(--blue-accent);">${spec.specialty}</p>
      <small style="color:var(--text-muted);">${spec.recommended_facility}</small>
    </div>

    <div style="margin-bottom:16px;">
      <label style="font-size:11px; font-weight:700; display:block; margin-bottom:6px;">Select Priority Time Slot:</label>
      <div style="display:flex; gap:8px;">
        <button class="btn-solid-blue" style="font-size:11px; padding:6px 12px;">Today, 14:30</button>
        <button class="btn-outline-navy" style="font-size:11px; padding:6px 12px;">Today, 16:15</button>
        <button class="btn-outline-navy" style="font-size:11px; padding:6px 12px;">Tomorrow, 09:00</button>
      </div>
    </div>

    <button id="btn-confirm-booking-now" class="btn-solid-navy" style="width:100%;">
      Confirm Consultation & Referral
    </button>
  `;

  content.querySelector('#btn-confirm-booking-now').addEventListener('click', () => {
    content.innerHTML = `
      <div style="text-align:center; padding:20px 0;">
        <i class="fa-solid fa-circle-check text-success" style="font-size:40px; margin-bottom:10px;"></i>
        <h3 style="font-size:18px; font-weight:800; margin-bottom:6px;">Referral Confirmed!</h3>
        <p style="font-size:13px; color:var(--text-secondary); margin-bottom:8px;">Appointment booked with Dr. Marcus Vance for Today at 14:30.</p>
        <span class="v-eval-badge badge-normal" style="font-size:11px; padding:4px 8px;">Token: #REF-${Math.floor(100000 + Math.random() * 900000)}</span>
      </div>
    `;
  });

  modal.style.display = 'flex';
}

function openDxModal(dx) {
  const modal = document.getElementById('dx-modal');
  const title = document.getElementById('dx-modal-title');
  const content = document.getElementById('dx-modal-content');

  title.textContent = dx.condition;
  content.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
      <span class="dx-icd-pill" style="font-size:12px;">ICD-10: ${dx.icd10}</span>
      <span class="v-eval-badge badge-${dx.severity === 'Critical' ? 'danger' : 'warning'}">${dx.severity} Acuity</span>
    </div>
    <p style="font-size:13px; color:var(--text-secondary); line-height:1.5; margin-bottom:14px;">${dx.description}</p>
    <div style="background:var(--bg-app); padding:10px; border-radius:var(--radius-sm); font-size:12px;">
      <strong>Matched Symptoms (${dx.confidence}% Confidence):</strong>
      <div style="margin-top:4px; color:var(--blue-accent); font-weight:700;">${(dx.matching_symptoms || []).join(', ')}</div>
    </div>
  `;
  modal.style.display = 'flex';
}

// Co-Pilot Chat
function initCopilot() {
  const toggleBtn = document.getElementById('copilot-toggle-btn');
  const drawer = document.getElementById('copilot-drawer');
  const closeBtn = document.getElementById('btn-close-copilot');
  const sendBtn = document.getElementById('copilot-send-btn');
  const inputEl = document.getElementById('copilot-input');
  const msgBox = document.getElementById('copilot-messages');

  toggleBtn.addEventListener('click', () => {
    drawer.style.display = drawer.style.display === 'none' ? 'flex' : 'none';
  });

  closeBtn.addEventListener('click', () => drawer.style.display = 'none');

  const send = async (text) => {
    if (!text.trim()) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'chat-msg user';
    userMsg.innerHTML = `<div class="msg-bubble">${text}</div>`;
    msgBox.appendChild(userMsg);
    inputEl.value = '';
    msgBox.scrollTop = msgBox.scrollHeight;

    const typingMsg = document.createElement('div');
    typingMsg.className = 'chat-msg bot typing';
    typingMsg.innerHTML = `<div class="msg-bubble"><i class="fa-solid fa-brain fa-fade" style="color:var(--blue-accent);"></i> <small style="color:var(--text-muted);">Consulting local medical model…</small></div>`;
    msgBox.appendChild(typingMsg);
    msgBox.scrollTop = msgBox.scrollHeight;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          patient_context: currentPatient,
          orchestration_result: currentOrchestrationResult
        })
      });
      const data = await res.json();
      typingMsg.remove();

      const botMsg = document.createElement('div');
      botMsg.className = 'chat-msg bot';
      const formatted = (data.response || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
      const modelTag = data.active_model ? `<div style="font-size:9.5px; color:var(--text-muted); margin-top:6px; display:flex; align-items:center; gap:4px;"><i class="fa-solid fa-shield-halved text-success"></i> ${data.llm_provider || 'Local LLM'} • <code>${data.active_model}</code></div>` : '';
      botMsg.innerHTML = `<div class="msg-bubble">${formatted}${modelTag}</div>`;
      msgBox.appendChild(botMsg);
      msgBox.scrollTop = msgBox.scrollHeight;
    } catch (e) {
      typingMsg.remove();
      console.warn('Chat error:', e);
    }
  };

  sendBtn.addEventListener('click', () => send(inputEl.value));
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); send(inputEl.value); }
  });

  document.querySelectorAll('.prompt-pill').forEach(pill => {
    pill.addEventListener('click', () => send(pill.getAttribute('data-prompt')));
  });
}

function copyFhir() {
  const text = document.getElementById('fhir-json-code')?.textContent;
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('HL7 FHIR R4 JSON Bundle copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Copied to clipboard', 'info');
    });
  }
}

function downloadFhir() {
  if (!currentFhirBundle) {
    showToast('Please run an AI evaluation to generate a FHIR Bundle first', 'warning');
    return;
  }
  const blob = new Blob([JSON.stringify(currentFhirBundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fhir-bundle-${currentFhirBundle.id || 'export'}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('HL7 FHIR R4 Bundle JSON downloaded successfully', 'success');
}

// ==============================================================================
// AI Recommendation Toggle & Queue Preview Helpers
// ==============================================================================
function initAiRecommendationToggle() {
  const toggle = document.getElementById('ai-recommendation-toggle');
  const statusText = document.getElementById('ai-toggle-status-text');
  const wrapper = document.getElementById('ai-recommendations-wrapper');
  const pausedBanner = document.getElementById('ai-disabled-banner');
  const quickEnableBtn = document.getElementById('btn-enable-ai-quick');
  const queueToggle = document.getElementById('queue-ai-preview-toggle');

  const updateAiState = (enabled) => {
    aiRecommendationsEnabled = enabled;
    if (toggle) toggle.checked = enabled;

    if (enabled) {
      if (wrapper) wrapper.style.display = 'block';
      if (pausedBanner) pausedBanner.style.display = 'none';
      if (statusText) {
        statusText.textContent = 'Live Auto-Assist ON';
        statusText.classList.remove('paused');
      }
      showToast('AI Decision Support & Consensus Enabled', 'success');
      executeOrchestration();
    } else {
      if (wrapper) wrapper.style.display = 'none';
      if (pausedBanner) pausedBanner.style.display = 'block';
      if (statusText) {
        statusText.textContent = 'AI Guidance Paused';
        statusText.classList.add('paused');
      }
      showToast('Doctor-Independent Mode active (AI recommendations paused)', 'info');
    }
  };

  if (toggle) {
    toggle.addEventListener('change', () => {
      updateAiState(toggle.checked);
    });
  }

  if (quickEnableBtn) {
    quickEnableBtn.addEventListener('click', () => {
      updateAiState(true);
    });
  }

  if (queueToggle) {
    queueToggle.addEventListener('change', () => {
      queueAiPreviewEnabled = queueToggle.checked;
      renderQueue(document.getElementById('global-patient-search')?.value.toLowerCase().trim() || '');
      showToast(`Queue AI Preview ${queueAiPreviewEnabled ? 'enabled' : 'hidden'}`, 'info');
    });
  }
}

function scheduleAutoAiRun() {
  if (autoAiTimer) clearTimeout(autoAiTimer);
  autoAiTimer = setTimeout(() => {
    if (aiRecommendationsEnabled && document.getElementById('view-patient-detail')?.classList.contains('active')) {
      executeOrchestration(true);
    }
  }, 800);
}

function getQuickAiPreview(patient) {
  const c = (patient.chief_complaint || '').toLowerCase();
  const symptoms = (patient.symptoms || []).map(s => s.toLowerCase());

  if (c.includes('chest') || symptoms.some(s => s.includes('chest'))) {
    return 'Acute Coronary Syndrome (I20.9 • 96.5%)';
  }
  if (c.includes('breath') || c.includes('wheez') || symptoms.some(s => s.includes('wheez'))) {
    return 'Acute Asthma Exacerbation (J45.9 • 88.0%)';
  }
  if (c.includes('fever') || c.includes('cough') || symptoms.some(s => s.includes('cough'))) {
    return 'Community-Acquired Pneumonia (J18.9 • 82.5%)';
  }
  if (c.includes('urine') || c.includes('burning') || symptoms.some(s => s.includes('urine'))) {
    return 'Urinary Tract Infection (N39.0 • 91.2%)';
  }
  return 'Clinical Evaluation Pending';
}

// ==============================================================================
// 8 MULTIPURPOSE CLINICAL FEATURES IMPLEMENTATION
// ==============================================================================

let currentActiveSosId = null;

function handleScreenSwitchHook(viewId) {
  if (viewId === 'view-analytics') {
    loadAnalytics();
  } else if (viewId === 'view-appointments') {
    loadAppointments();
  }
}

function initNewFeatures() {
  initAnalytics();
  initDrugChecker();
  initHealthCalculator();
  initAppointments();
  initEmergencySOS();
  initPdfReport();
  initPatientTimeline();
  initQrCode();
}

// ------------------------------------------------------------------------------
// FEATURE 1: OPD Analytics Dashboard
// ------------------------------------------------------------------------------
function initAnalytics() {
  const refreshBtn = document.getElementById('btn-refresh-analytics');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadAnalytics);
  }
}

async function loadAnalytics() {
  try {
    const res = await fetch('/api/analytics');
    if (!res.ok) throw new Error('Failed to load analytics');
    const data = await res.json();

    // KPIs
    const elTotal = document.getElementById('analytics-total');
    const elWait = document.getElementById('analytics-wait');
    const elAi = document.getElementById('analytics-ai');
    const elFhir = document.getElementById('analytics-fhir');

    if (elTotal) elTotal.textContent = data.total_patients_today;
    if (elWait) elWait.textContent = data.avg_wait_time_minutes;
    if (elAi) elAi.textContent = `${data.ai_assisted_percentage}%`;
    if (elFhir) elFhir.textContent = data.fhir_exports_today;

    // 1. Triage Distribution Chart
    const triageContainer = document.getElementById('chart-triage-dist');
    if (triageContainer) {
      const dist = data.triage_distribution || {};
      const total = (dist.red || 0) + (dist.yellow || 0) + (dist.green || 0) || 1;
      const redPct = Math.round(((dist.red || 0) / total) * 100);
      const yelPct = Math.round(((dist.yellow || 0) / total) * 100);
      const grnPct = Math.round(((dist.green || 0) / total) * 100);

      triageContainer.innerHTML = `
        <div class="chart-bar-row">
          <span class="chart-bar-label"><i class="fa-solid fa-circle text-danger" style="font-size:10px;"></i> Emergent</span>
          <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${redPct}%;background:#dc2626;"></div></div>
          <span class="chart-bar-val">${dist.red || 0} (${redPct}%)</span>
        </div>
        <div class="chart-bar-row">
          <span class="chart-bar-label"><i class="fa-solid fa-circle text-warning" style="font-size:10px;"></i> Urgent</span>
          <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${yelPct}%;background:#f59e0b;"></div></div>
          <span class="chart-bar-val">${dist.yellow || 0} (${yelPct}%)</span>
        </div>
        <div class="chart-bar-row">
          <span class="chart-bar-label"><i class="fa-solid fa-circle text-success" style="font-size:10px;"></i> Routine</span>
          <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${grnPct}%;background:#10b981;"></div></div>
          <span class="chart-bar-val">${dist.green || 0} (${grnPct}%)</span>
        </div>
      `;
    }

    // 2. Hourly Patient Flow
    const hourlyContainer = document.getElementById('chart-hourly-flow');
    if (hourlyContainer) {
      const flow = data.hourly_patient_flow || {};
      const entries = Object.entries(flow).slice(0, 7);
      const maxVal = Math.max(...entries.map(([, v]) => v), 1);
      hourlyContainer.innerHTML = entries.map(([hour, count]) => {
        const pct = Math.round((count / maxVal) * 100);
        return `
          <div class="chart-bar-row">
            <span class="chart-bar-label">${hour}</span>
            <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${pct}%;background:#4318ff;"></div></div>
            <span class="chart-bar-val">${count} pts</span>
          </div>
        `;
      }).join('');
    }

    // 3. Age Distribution
    const ageContainer = document.getElementById('chart-age-dist');
    if (ageContainer) {
      const ages = data.age_distribution || {};
      const maxAge = Math.max(...Object.values(ages), 1);
      ageContainer.innerHTML = Object.entries(ages).map(([bracket, count]) => {
        const pct = Math.round((count / maxAge) * 100);
        return `
          <div class="chart-bar-row">
            <span class="chart-bar-label">${bracket} yrs</span>
            <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${pct}%;background:#05cd99;"></div></div>
            <span class="chart-bar-val">${count}</span>
          </div>
        `;
      }).join('');
    }

    // 4. Top Symptoms
    const symptomsContainer = document.getElementById('chart-top-symptoms');
    if (symptomsContainer) {
      const symptoms = data.top_symptoms || [];
      const maxSym = symptoms.length ? Math.max(...symptoms.map(s => s.count)) : 1;
      symptomsContainer.innerHTML = symptoms.slice(0, 5).map(s => {
        const pct = Math.round((s.count / maxSym) * 100);
        return `
          <div class="chart-bar-row">
            <span class="chart-bar-label" title="${s.symptom}">${s.symptom}</span>
            <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${pct}%;background:#7c3aed;"></div></div>
            <span class="chart-bar-val">${s.count}</span>
          </div>
        `;
      }).join('');
    }
  } catch (err) {
    console.error('Analytics error:', err);
  }
}

// ------------------------------------------------------------------------------
// FEATURE 2: Drug Interaction Checker
// ------------------------------------------------------------------------------
function initDrugChecker() {
  const checkBtn = document.getElementById('btn-check-interactions');
  const inputEl = document.getElementById('drug-input-meds');

  if (checkBtn && inputEl) {
    checkBtn.addEventListener('click', () => {
      runDrugCheck(inputEl.value);
    });
  }

  // Preset pill listeners
  document.querySelectorAll('.preset-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const meds = pill.getAttribute('data-meds');
      if (inputEl && meds) {
        inputEl.value = meds;
        runDrugCheck(meds);
      }
    });
  });
}

async function runDrugCheck(rawText) {
  const resultsContainer = document.getElementById('drug-results-content');
  if (!resultsContainer) return;

  const meds = rawText.split(/[,\n]/).map(m => m.trim()).filter(Boolean);
  if (meds.length < 2) {
    showToast('Please enter at least 2 medications to check interactions', 'warning');
    resultsContainer.innerHTML = `
      <div class="drug-empty-state" style="color:#f59e0b;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size:36px;"></i>
        <p>Please enter at least 2 medications separated by commas</p>
      </div>
    `;
    return;
  }

  resultsContainer.innerHTML = `
    <div style="text-align:center;padding:30px;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size:28px;color:var(--blue-accent);"></i>
      <p style="margin-top:10px;font-size:13px;color:var(--text-secondary);">Cross-checking clinical pharmacology databases...</p>
    </div>
  `;

  try {
    const res = await fetch('/api/drug-interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medications: meds })
    });
    const data = await res.json();

    if (!data.interactions || data.interactions.length === 0) {
      resultsContainer.innerHTML = `
        <div style="background:#ecfdf5;border:1px solid #10b981;border-radius:12px;padding:20px;text-align:center;">
          <i class="fa-solid fa-circle-check text-success" style="font-size:36px;margin-bottom:8px;"></i>
          <h4 style="color:#065f46;margin:0 0 6px 0;">No Known Interactions Detected</h4>
          <p style="color:#047857;font-size:13px;margin:0;">The checked combination (<strong>${meds.join(', ')}</strong>) does not have major or moderate contraindications in the current registry.</p>
        </div>
      `;
    } else {
      let html = `
        <div style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:13px;font-weight:700;color:var(--navy-primary);">
            <i class="fa-solid fa-triangle-exclamation text-warning"></i> Found ${data.interactions.length} Interaction(s)
          </span>
          <span style="font-size:11px;color:var(--text-secondary);">${data.pairs_analyzed} pairs checked</span>
        </div>
      `;
      data.interactions.forEach(inter => {
        const sev = (inter.severity || 'moderate').toLowerCase();
        html += `
          <div class="interaction-item-card sev-${sev}">
            <div class="interaction-header">
              <span class="interaction-drugs">${inter.drug_a} ↔ ${inter.drug_b}</span>
              <span class="sev-tag ${sev}">${sev.toUpperCase()}</span>
            </div>
            <div class="interaction-effect">${inter.effect}</div>
            <div class="interaction-mech"><strong>Mechanism:</strong> ${inter.mechanism}</div>
          </div>
        `;
      });
      resultsContainer.innerHTML = html;
    }
  } catch (err) {
    console.error('Drug check error:', err);
    resultsContainer.innerHTML = `<p class="text-danger">Failed to check drug interactions. Ensure server is active.</p>`;
  }
}

// ------------------------------------------------------------------------------
// FEATURE 3: Health Metrics Calculator
// ------------------------------------------------------------------------------
function initHealthCalculator() {
  const calcBtn = document.getElementById('btn-calc-metrics');
  const fillBtn = document.getElementById('btn-calc-fill-patient');

  if (calcBtn) {
    calcBtn.addEventListener('click', runHealthCalculations);
  }

  if (fillBtn) {
    fillBtn.addEventListener('click', () => {
      // Auto-fill from active patient
      const ageInput = document.getElementById('input-patient-age');
      const genderSelect = document.getElementById('select-patient-gender');
      const hrInput = document.getElementById('vitals-hr');
      const bpSysInput = document.getElementById('vitals-bp-sys');
      const rrInput = document.getElementById('vitals-rr');
      const tempInput = document.getElementById('vitals-temp');

      if (ageInput) document.getElementById('calc-age').value = ageInput.value || 58;
      if (genderSelect) document.getElementById('calc-gender').value = genderSelect.value || 'Male';
      if (hrInput) document.getElementById('calc-hr').value = hrInput.value || 92;
      if (bpSysInput) document.getElementById('calc-bp').value = bpSysInput.value || 135;
      if (rrInput) document.getElementById('calc-rr').value = rrInput.value || 18;
      if (tempInput) document.getElementById('calc-temp').value = tempInput.value || 37.1;

      // Provide sensible default height/weight/creatinine if blank
      if (!document.getElementById('calc-weight').value) document.getElementById('calc-weight').value = 76;
      if (!document.getElementById('calc-height').value) document.getElementById('calc-height').value = 175;
      if (!document.getElementById('calc-creatinine').value) document.getElementById('calc-creatinine').value = 1.05;

      showToast('Loaded patient vitals and demographics into calculator', 'info');
      runHealthCalculations();
    });
  }
}

async function runHealthCalculations() {
  const resultsContainer = document.getElementById('health-results-content');
  if (!resultsContainer) return;

  const payload = {
    weight_kg: parseFloat(document.getElementById('calc-weight')?.value) || null,
    height_cm: parseFloat(document.getElementById('calc-height')?.value) || null,
    age: parseInt(document.getElementById('calc-age')?.value) || null,
    gender: document.getElementById('calc-gender')?.value || null,
    serum_creatinine: parseFloat(document.getElementById('calc-creatinine')?.value) || null,
    heart_rate: parseInt(document.getElementById('calc-hr')?.value) || null,
    systolic_bp: parseInt(document.getElementById('calc-bp')?.value) || null,
    respiratory_rate: parseInt(document.getElementById('calc-rr')?.value) || null,
    temperature_c: parseFloat(document.getElementById('calc-temp')?.value) || null,
    avpu: document.getElementById('calc-avpu')?.value || 'A'
  };

  try {
    const res = await fetch('/api/health-metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    const m = data.metrics || {};

    let html = '<div class="metric-summary-grid">';

    // BMI Card
    if (m.bmi) {
      const bColor = m.bmi.risk_level === 'normal' ? '#10b981' : m.bmi.risk_level === 'elevated' ? '#f59e0b' : '#dc2626';
      html += `
        <div class="metric-result-card">
          <div class="m-title">BMI Index</div>
          <div class="m-val" style="color:${bColor};">${m.bmi.value}</div>
          <div class="m-badge" style="background:${bColor}22;color:${bColor};">${m.bmi.category}</div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:6px;">Ideal: ${m.bmi.ideal_range_kg} kg</div>
        </div>
      `;
    }

    // BSA Card
    if (m.bsa) {
      html += `
        <div class="metric-result-card">
          <div class="m-title">Body Surface Area (BSA)</div>
          <div class="m-val" style="color:#2563eb;">${m.bsa.value_m2} <span style="font-size:14px;">m²</span></div>
          <div class="m-badge" style="background:#dbeafe;color:#2563eb;">${m.bsa.formula} Formula</div>
        </div>
      `;
    }

    // eGFR Card
    if (m.egfr) {
      const gfrVal = m.egfr.value;
      const gColor = gfrVal >= 60 ? '#10b981' : gfrVal >= 30 ? '#f59e0b' : '#dc2626';
      html += `
        <div class="metric-result-card">
          <div class="m-title">eGFR Renal Function</div>
          <div class="m-val" style="color:${gColor};">${gfrVal}</div>
          <div class="m-badge" style="background:${gColor}22;color:${gColor};">${m.egfr.ckd_stage}</div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:6px;">CKD-EPI equation</div>
        </div>
      `;
    }

    // MEWS Card
    if (m.mews) {
      const s = m.mews.score;
      const mColor = s <= 2 ? '#10b981' : s <= 4 ? '#f59e0b' : '#dc2626';
      html += `
        <div class="metric-result-card">
          <div class="m-title">MEWS Deterioration Score</div>
          <div class="m-val" style="color:${mColor};">${s} / 14</div>
          <div class="m-badge" style="background:${mColor}22;color:${mColor};">${m.mews.risk}</div>
        </div>
      `;
    }

    html += '</div>';

    if (m.mews && m.mews.score >= 4) {
      html += `
        <div style="background:#fef2f2;border:1px solid #f87171;border-radius:10px;padding:12px;margin-top:12px;font-size:12.5px;color:#991b1b;">
          <strong><i class="fa-solid fa-triangle-exclamation"></i> MEWS Clinical Alert:</strong> Patient score indicates elevated clinical deterioration risk. Increase vitals monitoring interval to q30m and consider critical care evaluation.
        </div>
      `;
    }

    resultsContainer.innerHTML = html;
  } catch (err) {
    console.error('Calculation error:', err);
    resultsContainer.innerHTML = `<p class="text-danger">Failed to calculate health metrics.</p>`;
  }
}

// ------------------------------------------------------------------------------
// FEATURE 4: Appointment & Follow-Up Scheduler
// ------------------------------------------------------------------------------
function initAppointments() {
  const createBtn = document.getElementById('btn-create-appointment');
  const refreshBtn = document.getElementById('btn-refresh-appointments');
  const dateInput = document.getElementById('appt-date');

  // Set default appointment date to tomorrow
  if (dateInput) {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    dateInput.value = tmrw.toISOString().split('T')[0];
  }

  if (createBtn) {
    createBtn.addEventListener('click', createAppointment);
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadAppointments);
  }
}

async function loadAppointments() {
  const container = document.getElementById('appointments-list-content');
  const badge = document.getElementById('appt-count-badge');
  if (!container) return;

  try {
    const res = await fetch('/api/appointments');
    const data = await res.json();
    const appts = data.appointments || [];

    if (badge) badge.textContent = appts.length;

    if (appts.length === 0) {
      container.innerHTML = `
        <div class="drug-empty-state">
          <i class="fa-solid fa-calendar-xmark" style="font-size:40px;color:var(--text-muted);"></i>
          <p>No follow-up appointments scheduled yet</p>
        </div>
      `;
      return;
    }

    container.innerHTML = appts.map(apt => {
      const isUrgent = apt.urgency === 'urgent';
      const isPriority = apt.urgency === 'priority';
      const uColor = isUrgent ? '#dc2626' : isPriority ? '#d97706' : '#2563eb';

      return `
        <div class="appointment-card" id="appt-card-${apt.appointment_id}">
          <div class="appt-info-main">
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="appt-title">${apt.patient_name} (${apt.patient_id})</span>
              <span class="appt-badge" style="background:${uColor}22;color:${uColor};">${apt.urgency}</span>
              ${apt.follow_up ? '<span class="appt-badge" style="background:#ede9fe;color:#7c3aed;">Follow-up</span>' : ''}
            </div>
            <div class="appt-sub">
              <i class="fa-regular fa-calendar"></i> ${apt.date} at ${apt.time_slot} • 
              <i class="fa-solid fa-user-doctor"></i> ${apt.doctor_name} (${apt.specialty})
            </div>
            ${apt.notes ? `<div style="font-size:12px;color:var(--text-dark);margin-top:4px;"><i class="fa-solid fa-note-sticky text-muted"></i> ${apt.notes}</div>` : ''}
          </div>
          <div>
            <button class="btn-ghost-icon" onclick="cancelAppointment('${apt.appointment_id}')" title="Cancel Appointment" style="color:#dc2626;">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load appointments:', err);
  }
}

async function createAppointment() {
  const pId = document.getElementById('appt-patient-id')?.value.trim() || document.getElementById('input-patient-id')?.value.trim() || 'PT-77014';
  const pName = document.getElementById('appt-patient-name')?.value.trim() || document.getElementById('input-patient-name')?.value.trim() || 'Patient';
  const specialty = document.getElementById('appt-specialty')?.value || 'General Medicine';
  const doctor = document.getElementById('appt-doctor')?.value.trim() || 'Dr. Rajesh';
  const date = document.getElementById('appt-date')?.value;
  const timeSlot = document.getElementById('appt-time')?.value || '10:00 AM';
  const notes = document.getElementById('appt-notes')?.value.trim() || '';
  const urgency = document.getElementById('appt-urgency')?.value || 'routine';
  const followUp = document.getElementById('appt-followup')?.checked || false;

  if (!date) {
    showToast('Please select an appointment date', 'warning');
    return;
  }

  try {
    const res = await fetch('/api/appointments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: pId,
        patient_name: pName,
        specialty: specialty,
        doctor_name: doctor,
        date: date,
        time_slot: timeSlot,
        notes: notes,
        urgency: urgency,
        follow_up: followUp
      })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Appointment ${data.appointment.appointment_id} scheduled!`, 'success');
      if (document.getElementById('appt-notes')) document.getElementById('appt-notes').value = '';
      loadAppointments();
    }
  } catch (err) {
    console.error('Appointment creation failed:', err);
    showToast('Failed to schedule appointment', 'danger');
  }
}

window.cancelAppointment = async function(appointmentId) {
  try {
    const res = await fetch(`/api/appointments/${appointmentId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(`Appointment ${appointmentId} cancelled`, 'info');
      loadAppointments();
    }
  } catch (err) {
    showToast('Failed to cancel appointment', 'danger');
  }
};

// ------------------------------------------------------------------------------
// FEATURE 5: Emergency SOS Protocol
// ------------------------------------------------------------------------------
function initEmergencySOS() {
  const sosBtn = document.getElementById('sos-emergency-btn');
  const sosModal = document.getElementById('sos-modal');
  const closeBtn = document.getElementById('btn-close-sos-modal');
  const triggerBtn = document.getElementById('btn-trigger-sos');
  const resolveBannerBtn = document.getElementById('btn-resolve-sos-banner');

  if (sosBtn && sosModal) {
    sosBtn.addEventListener('click', () => {
      // Auto-prefill active patient
      const pId = document.getElementById('input-patient-id')?.value || 'PT-77014';
      const pName = document.getElementById('input-patient-name')?.value || 'Robert Miller';
      if (document.getElementById('sos-patient-id')) document.getElementById('sos-patient-id').value = pId;
      if (document.getElementById('sos-patient-name')) document.getElementById('sos-patient-name').value = pName;
      sosModal.style.display = 'flex';
    });
  }

  if (closeBtn && sosModal) {
    closeBtn.addEventListener('click', () => {
      sosModal.style.display = 'none';
    });
  }

  if (triggerBtn) {
    triggerBtn.addEventListener('click', async () => {
      const pId = document.getElementById('sos-patient-id')?.value.trim() || 'PT-UNKNOWN';
      const pName = document.getElementById('sos-patient-name')?.value.trim() || 'Patient';
      const location = document.getElementById('sos-location')?.value.trim() || 'OPD Room 1';
      const alertType = document.getElementById('sos-type')?.value || 'code_blue';
      const notes = document.getElementById('sos-notes')?.value.trim() || '';

      try {
        const res = await fetch('/api/sos/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient_id: pId,
            patient_name: pName,
            location: location,
            alert_type: alertType,
            notes: notes
          })
        });
        const data = await res.json();
        if (data.success) {
          currentActiveSosId = data.alert.sos_id;
          if (sosModal) sosModal.style.display = 'none';

          // Show flashing top alert banner
          const banner = document.getElementById('sos-active-banner');
          const bannerText = document.getElementById('sos-banner-text');
          if (banner && bannerText) {
            bannerText.innerHTML = `🚨 <strong>${data.alert.label}</strong> — Patient: ${pName} (${pId}) @ ${location}. Immediate Action: ${data.alert.immediate_actions[0]}`;
            banner.style.display = 'block';
          }
          showToast(`🚨 ${data.alert.label} ACTIVATED!`, 'danger');
        }
      } catch (err) {
        showToast('Failed to trigger SOS protocol', 'danger');
      }
    });
  }

  if (resolveBannerBtn) {
    resolveBannerBtn.addEventListener('click', async () => {
      if (!currentActiveSosId) {
        document.getElementById('sos-active-banner').style.display = 'none';
        return;
      }
      try {
        await fetch(`/api/sos/resolve/${currentActiveSosId}`, { method: 'POST' });
        document.getElementById('sos-active-banner').style.display = 'none';
        currentActiveSosId = null;
        showToast('Emergency SOS protocol resolved and archived to audit log', 'success');
      } catch (err) {
        document.getElementById('sos-active-banner').style.display = 'none';
      }
    });
  }
}

// ------------------------------------------------------------------------------
// FEATURE 6: Clinical PDF Reports
// ------------------------------------------------------------------------------
function initPdfReport() {
  const downloadBtn = document.getElementById('btn-download-pdf');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', generateClinicalPdf);
  }
}

async function generateClinicalPdf() {
  showToast('Generating clinical PDF report...', 'info');

  const payload = {
    patient_id: document.getElementById('input-patient-id')?.value || 'PT-77014',
    patient_name: document.getElementById('input-patient-name')?.value || 'Robert Miller',
    age: parseInt(document.getElementById('input-patient-age')?.value) || 58,
    gender: document.getElementById('select-patient-gender')?.value || 'Male',
    chief_complaint: document.getElementById('input-chief-complaint')?.value || '',
    vitals: {
      heart_rate: parseInt(document.getElementById('vitals-hr')?.value) || 106,
      blood_pressure_sys: parseInt(document.getElementById('vitals-bp-sys')?.value) || 168,
      blood_pressure_dia: parseInt(document.getElementById('vitals-bp-dia')?.value) || 96,
      oxygen_saturation: parseFloat(document.getElementById('vitals-spo2')?.value) || 93.5,
      temperature: parseFloat(document.getElementById('vitals-temp')?.value) || 37.2,
      respiratory_rate: parseInt(document.getElementById('vitals-rr')?.value) || 22
    },
    diagnoses: currentOrchestrationResult?.differential_diagnoses || [
      { condition: 'Acute Coronary Syndrome', icd10: 'I20.9', confidence: 96, severity: 'Emergent' },
      { condition: 'Unstable Angina', icd10: 'I20.0', confidence: 84, severity: 'Urgent' }
    ],
    care_plan: currentOrchestrationResult?.care_plan || {
      initial_actions: ['Administer Aspirin 325mg PO STAT', 'Obtain 12-lead ECG STAT', 'Establish IV access'],
      recommended_tests: ['STAT 12-Lead ECG', 'High-Sensitivity Troponin I', 'Chest X-Ray'],
      red_flag_warnings: ['Monitor for hemodynamic instability', 'Prepare for cath lab transfer']
    },
    specialist: currentOrchestrationResult?.specialist_recommendation || {
      specialty: 'Cardiology (Interventional)',
      urgency: 'STAT / Emergent',
      rationale: 'Suspected acute coronary syndrome with ongoing chest pain.'
    },
    triage_category: 'Level 1: Emergent',
    triage_level: 1
  };

  try {
    const res = await fetch('/api/report/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.report_html) {
      // Open printable window
      const printWin = window.open('', '_blank');
      printWin.document.write(data.report_html);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
      }, 500);
      showToast('Clinical report opened for PDF export/print', 'success');
    }
  } catch (err) {
    console.error('PDF report generation error:', err);
    showToast('Failed to generate PDF report', 'danger');
  }
}

// ------------------------------------------------------------------------------
// FEATURE 7: Patient History Timeline
// ------------------------------------------------------------------------------
function initPatientTimeline() {
  const historyBtn = document.getElementById('btn-view-history');
  const historyModal = document.getElementById('history-modal');
  const closeBtn = document.getElementById('btn-close-history-modal');

  if (historyBtn && historyModal) {
    historyBtn.addEventListener('click', async () => {
      const pId = document.getElementById('input-patient-id')?.value || 'PT-77014';
      historyModal.style.display = 'flex';
      const content = document.getElementById('history-modal-content');
      if (content) {
        content.innerHTML = `<div style="text-align:center;padding:20px;"><i class="fa-solid fa-spinner fa-spin"></i> Loading timeline...</div>`;
      }

      try {
        const res = await fetch(`/api/patient-history/${pId}`);
        const data = await res.json();
        const events = data.timeline || [];

        if (events.length === 0) {
          content.innerHTML = `<p class="text-muted" style="text-align:center;padding:20px;">No previous history records for ${pId}.</p>`;
          return;
        }

        let html = '<div class="timeline-list">';
        events.forEach(ev => {
          const dt = new Date(ev.timestamp * 1000);
          const dateStr = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
          const timeStr = dt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

          html += `
            <div class="timeline-node">
              <div class="timeline-dot"></div>
              <div class="timeline-card">
                <div class="timeline-card-header">
                  <span class="timeline-title">${ev.title}</span>
                  <span class="timeline-time">${dateStr} • ${timeStr}</span>
                </div>
                <div class="timeline-desc">${ev.description}</div>
                <div class="timeline-provider"><i class="fa-solid fa-user-md"></i> Recorded by: ${ev.provider}</div>
              </div>
            </div>
          `;
        });
        html += '</div>';
        content.innerHTML = html;
      } catch (err) {
        content.innerHTML = `<p class="text-danger">Failed to load patient history timeline.</p>`;
      }
    });
  }

  if (closeBtn && historyModal) {
    closeBtn.addEventListener('click', () => {
      historyModal.style.display = 'none';
    });
  }
}

// ------------------------------------------------------------------------------
// FEATURE 8: QR Code Queue Token System
// ------------------------------------------------------------------------------
function initQrCode() {
  const qrBtn = document.getElementById('btn-view-qr');
  const qrModal = document.getElementById('qr-modal');
  const closeBtn = document.getElementById('btn-close-qr-modal');

  if (qrBtn && qrModal) {
    qrBtn.addEventListener('click', async () => {
      const tokenId = 'T-101'; // active patient token
      qrModal.style.display = 'flex';
      const content = document.getElementById('qr-modal-content');
      if (content) {
        content.innerHTML = `<div style="text-align:center;padding:20px;"><i class="fa-solid fa-spinner fa-spin"></i> Generating QR token...</div>`;
      }

      try {
        const res = await fetch(`/api/qr/${tokenId}`);
        const data = await res.json();

        const qrUri = data.qr_data_uri || data.svg_data_uri || `data:image/svg+xml;base64,${data.qr_svg_base64}`;
        const prio = (data.triage_color || data.priority || 'standard').toUpperCase();
        content.innerHTML = `
          <div style="background:white;padding:20px;border-radius:12px;border:1px solid #e2e8f0;display:inline-block;margin:0 auto 16px;">
            <img src="${qrUri}" alt="Token QR Code" style="width:160px;height:160px;display:block;margin:0 auto;">
          </div>
          <h3 style="margin:0;font-size:24px;color:var(--navy-primary);">${data.token_id}</h3>
          <p style="font-weight:700;margin:4px 0 12px;color:var(--text-dark);">${data.patient_name}</p>
          <div style="font-size:12px;color:var(--text-secondary);margin-bottom:16px;">
            <div>Priority: <strong>${prio}</strong></div>
            <div>Scannable for OPD Nurse Station check-in</div>
          </div>
          <button class="btn-solid-blue" onclick="window.print()" style="width:100%;">
            <i class="fa-solid fa-print"></i> Print Patient Token
          </button>
        `;
      } catch (err) {
        content.innerHTML = `<p class="text-danger">Failed to generate QR token.</p>`;
      }
    });
  }

  if (closeBtn && qrModal) {
    closeBtn.addEventListener('click', () => {
      qrModal.style.display = 'none';
    });
  }
}

