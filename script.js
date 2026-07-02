let langData = {};
let LANG_META = {};
let lang = "de";
let variant = "standard";

const BADGE_COLORS = ["#66bb6a", "#26a69a", "#ffb74d", "#ff7043", "#ef5350", "#ab47bc"];

const OPTIONS = [
  { cls: "opt-1", icon: "\u2716" },
  { cls: "opt-2", icon: "\u25B7" },
  { cls: "opt-3", icon: "\u2014" },
  { cls: "opt-4", icon: "\u25B9" },
  { cls: "opt-5", icon: "\u2605" }
];

const DIM_THRESHOLDS = [
  { max: 8, css: "green" },
  { min: 9, max: 11, css: "yellow" },
  { min: 12, css: "red" }
];

const OVERALL_THRESHOLDS = [
  { max: 53, css: "green" },
  { min: 54, max: 62, css: "yellow" },
  { min: 63, css: "red" }
];

const answers = {};
let currentIdx = 0;

function t(key, ...args) {
  let val = langData;
  const parts = key.split(".");
  for (const p of parts) val = val[p];
  if (args.length && typeof val === "string") {
    return val.replace(/\{(\w+)\}/g, (_, k) => args[0][k] !== undefined ? args[0][k] : _);
  }
  return val;
}

function getQuestions() {
  return t("questions");
}

function getDimNames() {
  return t("dimNames");
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function getDimItem(idx) {
  let dimIdx = 0, itemIdx = idx;
  while (itemIdx >= 3) { itemIdx -= 3; dimIdx++; }
  return { dimIdx, itemIdx };
}

function answerKey(idx) {
  const { dimIdx, itemIdx } = getDimItem(idx);
  return `${dimIdx}_${itemIdx}`;
}

function updateVariantOptions() {
  const meta = LANG_META[lang];
  const sel = document.getElementById("variant-select");
  const current = sel.value;
  sel.innerHTML = meta.variants.map(v =>
    `<option value="${v}">${meta.variantLabels[v]}</option>`
  ).join("");
  if (meta.variants.includes(current)) sel.value = current;
  else sel.value = meta.variants[0];
  sel.style.display = meta.variants.length > 1 ? "" : "none";
}

function renderLanguage() {
  document.documentElement.lang = lang === "de" ? "de" : "en";

  document.getElementById("welcome-title").textContent = t("welcomeTitle");
  document.getElementById("welcome-subtitle").textContent = t("welcomeSubtitle");
  document.getElementById("welcome-desc").innerHTML = t("welcomeDesc");

  const scaleLabels = t("welcomeScale");
  document.getElementById("welcome-scale").innerHTML = scaleLabels.map((l, i) =>
    `<li><span class="dot opt-${i + 1}-bg"></span> <strong>${i + 1}</strong> – ${l}</li>`
  ).join("");

  document.getElementById("welcome-disclaimer").textContent = t("welcomeDisclaimer");
  document.getElementById("start-btn").textContent = t("startBtn");
  document.getElementById("prev-btn").textContent = t("prevBtn");

  document.getElementById("results-title").textContent = t("resultsTitle");
  document.getElementById("toggle-details-btn").textContent = t("detailsBtn");
  document.getElementById("restart-btn").textContent = t("restartBtn");

  document.getElementById("help-title").textContent = t("helpTitle");
  document.getElementById("help-desc").textContent = t("helpDesc");
  document.getElementById("help-map-hint").textContent = t("helpMapHint");
  document.getElementById("help-back-btn").textContent = t("helpBack");

  const helpEntries = t("helpEntries");
  const container = document.getElementById("help-entries");
  container.innerHTML = "";
  helpEntries.forEach(e => {
    const div = document.createElement("div");
    div.className = "help-section";
    div.innerHTML = `<h3>${e.title}</h3><p>${e.desc}</p><a href="${e.url}" target="_blank" rel="noopener">${e.url}</a>`;
    container.appendChild(div);
  });

  if (document.getElementById("test-screen").classList.contains("active")) {
    renderQuestion(currentIdx);
  }
  if (document.getElementById("results-screen").classList.contains("active")) {
    showResults();
  }
}

function renderQuestion(idx) {
  const qs = getQuestions();
  const q = qs[idx];
  const dimNames = getDimNames();
  const { dimIdx } = getDimItem(idx);
  const qLabel = lang === "en" ? "Q" : "Frage";

  document.getElementById("question-number-badge").textContent = `${qLabel} ${idx + 1}`;
  document.getElementById("question-number-badge").style.background = BADGE_COLORS[idx % BADGE_COLORS.length];
  document.getElementById("dimension-name").textContent = dimNames[dimIdx];

  const container = document.getElementById("questions-container");
  container.innerHTML = "";
  const key = answerKey(idx);
  const div = document.createElement("div");
  div.className = "question-item";

  const qText = document.createElement("div");
  qText.className = "question-text";
  qText.textContent = q;
  div.appendChild(qText);

  const accentBar = document.createElement("div");
  accentBar.className = "question-accent-bar";
  accentBar.style.background = BADGE_COLORS[idx % BADGE_COLORS.length];
  div.appendChild(accentBar);

  const optsDiv = document.createElement("div");
  optsDiv.className = "options";
  const scaleLabels = t("welcomeScale");

  OPTIONS.forEach((opt, oi) => {
    const label = document.createElement("label");
    label.className = "option-label " + opt.cls;

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "q";
    radio.value = oi + 1;
    if (answers[key] === oi + 1) {
      radio.checked = true;
      label.classList.add("selected");
    }

    radio.addEventListener("change", () => {
      document.querySelectorAll("input[name='q']").forEach(r => {
        r.closest(".option-label").classList.remove("selected");
      });
      if (radio.checked) {
        label.classList.add("selected");
        answers[key] = oi + 1;
        setTimeout(() => document.getElementById("next-btn").click(), 200);
      }
      updateNavButtons();
    });

    const iconSpan = document.createElement("span");
    iconSpan.className = "option-icon";
    iconSpan.textContent = opt.icon;
    label.appendChild(radio);
    label.appendChild(iconSpan);
    const textSpan = document.createElement("span");
    textSpan.textContent = scaleLabels[oi];
    label.appendChild(textSpan);
    optsDiv.appendChild(label);
  });

  div.appendChild(optsDiv);
  container.appendChild(div);

  updateProgress();
  updateNavButtons();
}

function updateProgress() {
  const total = getQuestions().length;
  const fill = document.getElementById("progress-fill");
  const text = document.getElementById("progress-text");
  const pct = Math.round(((currentIdx + 1) / total) * 100);
  fill.style.width = pct + "%";
  text.textContent = t("progressQ", { n: currentIdx + 1, total });
}

function updateNavButtons() {
  const total = getQuestions().length;
  document.getElementById("prev-btn").disabled = currentIdx === 0;
  document.getElementById("next-btn").disabled = answers[answerKey(currentIdx)] === undefined;
  document.getElementById("next-btn").textContent = currentIdx === total - 1 ? t("resultsBtn") : t("nextBtn");
}

function evaluateDimension(dimIdx) {
  let sum = 0;
  for (let itemIdx = 0; itemIdx < 3; itemIdx++) sum += answers[`${dimIdx}_${itemIdx}`] || 0;
  const mean = sum / 3;
  for (const t of DIM_THRESHOLDS) {
    if ((t.min === undefined || sum >= t.min) && (t.max === undefined || sum <= t.max))
      return { sum, mean, labelIdx: DIM_THRESHOLDS.indexOf(t), css: t.css };
  }
}

function evaluateOverall() {
  let total = 0;
  for (let i = 0; i < 18; i++) {
    const { dimIdx, itemIdx } = getDimItem(i);
    total += answers[`${dimIdx}_${itemIdx}`] || 0;
  }
  const mean = total / 18;
  for (const t of OVERALL_THRESHOLDS) {
    if ((t.min === undefined || total >= t.min) && (t.max === undefined || total <= t.max))
      return { total, mean, labelIdx: OVERALL_THRESHOLDS.indexOf(t), css: t.css };
  }
}

function showResults() {
  showScreen("results-screen");

  const overall = evaluateOverall();
  const ringColor = overall.css === "green" ? "#4caf50" : overall.css === "yellow" ? "#ffc107" : "#ef5350";
  const pct = Math.round((overall.total / 90) * 100);
  const overallLabels = t("overallLabel");

  document.getElementById("overall-result").innerHTML =
    `<div class="score-ring-wrap">
      <svg class="score-ring" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" fill="none" stroke="#e0e0e0" stroke-width="8"/>
        <circle id="score-ring-fill" cx="60" cy="60" r="52" fill="none" stroke="${ringColor}" stroke-width="8"
          stroke-linecap="round" stroke-dasharray="${pct * 3.267}" stroke-dashoffset="328"
          transform="rotate(-90 60 60)" style="transition: stroke-dashoffset 1s ease"/>
      </svg>
      <div class="score-ring-text">
        <div class="score-number">${overall.total}</div>
        <div class="score-max">/ 90</div>
      </div>
    </div>
    <div class="overall-label ${overall.css}">${overallLabels[overall.labelIdx]}</div>
    <div class="overall-avg">${t("avgLabel", { n: overall.mean.toFixed(2) })}</div>`;

  requestAnimationFrame(() => {
    document.getElementById("score-ring-fill").style.strokeDashoffset = 328 - pct * 3.267;
  });

  const dimResults = document.getElementById("dimension-results");
  dimResults.innerHTML = "";
  const dimNames = getDimNames();
  const dimLabels = t("dimLabels");

  for (let dimIdx = 0; dimIdx < 6; dimIdx++) {
    const res = evaluateDimension(dimIdx);
    const dpct = Math.round((res.sum / 15) * 100);
    const box = document.createElement("div");
    box.className = "dim-result";
    box.innerHTML =
      `<div class="dim-header">
        <span class="dim-name">${dimIdx + 1}. ${dimNames[dimIdx]}</span>
        <span class="dim-score ${res.css}">${res.sum} / 15</span>
      </div>
      <div class="dim-bar-bg">
        <div class="dim-bar-fill ${res.css}" style="width:${dpct}%"></div>
      </div>
      <div class="dim-status ${res.css}">${dimLabels[res.labelIdx]}</div>`;
    dimResults.appendChild(box);
  }

  document.getElementById("score-details").innerHTML =
    `<strong>${t("scoreDetailsTitle")}</strong><br>
    <strong>${t("scoreDetailsDim")}</strong><br>
    &bull; ${t("scoreDetailsDimRule1")}<br>
    &bull; ${t("scoreDetailsDimRule2")}<br>
    &bull; ${t("scoreDetailsDimRule3")}<br><br>
    <strong>${t("scoreDetailsTotal")}</strong><br>
    &bull; ${t("scoreDetailsTotalRule1")}<br>
    &bull; ${t("scoreDetailsTotalRule2")}<br>
    &bull; ${t("scoreDetailsTotalRule3")}`;

  const helpContainer = document.getElementById("help-btn-container");
  helpContainer.innerHTML = "";
  const helpBtn = document.createElement("button");
  helpBtn.id = "help-btn-results";
  helpBtn.textContent = t("helpResultBtn");
  if (overall.css === "green") helpBtn.className = "btn-help btn-help-subtle";
  else if (overall.css === "yellow") helpBtn.className = "btn-help btn-help-notice";
  else helpBtn.className = "btn-help btn-help-urgent";
  helpBtn.addEventListener("click", () => showScreen("help-screen"));
  helpContainer.appendChild(helpBtn);
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme, persist) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.innerHTML = theme === "dark" ? "&#9728;" : "&#9790;";
    btn.setAttribute("aria-label", theme === "dark" ? "Light mode" : "Dark mode");
  }
  if (persist !== false) localStorage.setItem("theme", theme);
}

async function loadLanguage(l, v) {
  const metaResp = await fetch("i18n/meta.json");
  LANG_META = await metaResp.json();

  if (!LANG_META[l]) { l = "de"; v = "standard"; }
  if (!LANG_META[l].variants.includes(v)) v = LANG_META[l].variants[0];

  const resp = await fetch(`i18n/${l}/${v}.json`);
  langData = await resp.json();

  lang = l;
  variant = v;
}

document.addEventListener("DOMContentLoaded", async () => {
  const savedTheme = localStorage.getItem("theme");
  applyTheme(savedTheme || getSystemTheme(), !!savedTheme);

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (!localStorage.getItem("theme")) applyTheme(getSystemTheme(), false);
  });

  const saved = localStorage.getItem("lang");
  let initLang = "de";
  let initVariant = "standard";
  if (saved) {
    const parts = saved.split("_");
    initLang = parts[0] || "de";
    initVariant = parts[1] || "standard";
  }

  await loadLanguage(initLang, initVariant);

  document.getElementById("lang-select").value = lang;
  updateVariantOptions();
  document.getElementById("variant-select").value = variant;

  renderLanguage();

  document.getElementById("lang-select").addEventListener("change", async (e) => {
    const newLang = e.target.value;
    if (!LANG_META[newLang]) return;
    variant = LANG_META[newLang].variants[0];
    const resp = await fetch(`i18n/${newLang}/${variant}.json`);
    langData = await resp.json();
    lang = newLang;
    document.getElementById("variant-select").value = variant;
    updateVariantOptions();
    localStorage.setItem("lang", lang + "_" + variant);
    renderLanguage();
  });

  document.getElementById("variant-select").addEventListener("change", async (e) => {
    const newVariant = e.target.value;
    const resp = await fetch(`i18n/${lang}/${newVariant}.json`);
    langData = await resp.json();
    variant = newVariant;
    localStorage.setItem("lang", lang + "_" + variant);
    renderLanguage();
  });

  document.getElementById("theme-toggle").addEventListener("click", () => {
    applyTheme(document.documentElement.classList.contains("dark") ? "light" : "dark", true);
  });

  document.getElementById("start-btn").addEventListener("click", () => {
    showScreen("test-screen");
    currentIdx = 0;
    renderQuestion(currentIdx);
  });

  document.getElementById("prev-btn").addEventListener("click", () => {
    if (currentIdx > 0) { currentIdx--; renderQuestion(currentIdx); }
  });

  document.getElementById("next-btn").addEventListener("click", () => {
    const total = getQuestions().length;
    if (currentIdx < total - 1) { currentIdx++; renderQuestion(currentIdx); }
    else showResults();
  });

  document.getElementById("help-back-btn").addEventListener("click", () => {
    showScreen(Object.keys(answers).length > 0 ? "results-screen" : "welcome-screen");
  });

  document.getElementById("toggle-details-btn").addEventListener("click", () => {
    const section = document.getElementById("details-section");
    const btn = document.getElementById("toggle-details-btn");
    const isHidden = section.classList.toggle("hidden");
    btn.textContent = isHidden ? t("detailsBtn") : t("detailsHide");
  });

  document.getElementById("restart-btn").addEventListener("click", () => {
    Object.keys(answers).forEach(k => delete answers[k]);
    currentIdx = 0;
    showScreen("welcome-screen");
  });
});
