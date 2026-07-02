const data = {
  "studie": "EINWURF - Zukunft der Demokratie 01.2021",
  "herausgeber": "Bertelsmann Stiftung",
  "thema": "Rechtsextreme Einstellungen der Wähler:innen vor der Bundestagswahl 2021",
  "methodik": {
    "antwortkategorien_punkte": {
      "lehne völlig ab": 1,
      "lehne überwiegend ab": 2,
      "teils/teils": 3,
      "stimme überwiegend zu": 4,
      "stimme voll und ganz zu": 5
    },
    "auswertung_pro_dimension": {
      "schwellenwerte": {
        "manifest rechtsextrem (Zustimmung)": "Mittelwert >= 4.0 (Summenindex >= 12)",
        "latent rechtsextrem": "Mittelwert >= 3.0 (Summenindex >= 9)",
        "nicht rechtsextrem": "Summenindex < 9"
      }
    },
    "auswertung_gesamt": {
      "schwellenwerte": {
        "manifest rechtsextrem": "Summenindex >= 63 (Durchschnitt >= 3.5)",
        "latent rechtsextrem": "Summenindex >= 54 (Durchschnitt >= 3.0)",
        "nicht rechtsextrem": "Summenindex < 54"
      }
    }
  },
  "dimensionen": [
    {
      "id": 1,
      "name": "Befürwortung einer rechtsgerichteten Diktatur",
      "items": [
        { "text": "Im nationalen Interesse ist unter bestimmten Umständen eine Diktatur die bessere Staatsform." },
        { "text": "Was Deutschland jetzt braucht, ist eine einzige starke Partei, die die Volksgemeinschaft insgesamt verkörpert." },
        { "text": "Wir sollten einen Führer haben, der Deutschland zum Wohle aller mit starker Hand regiert." }
      ]
    },
    {
      "id": 2,
      "name": "Chauvinismus",
      "items": [
        { "text": "Wir sollten endlich wieder Mut zu einem starken Nationalgefühl haben." },
        { "text": "Was unser Land heute braucht, ist ein hartes und energisches Durchsetzen deutscher Interessen gegenüber dem Ausland." },
        { "text": "Das oberste Ziel der deutschen Politik sollte es sein, Deutschland die Macht und Geltung zu verschaffen, die ihm zusteht." }
      ]
    },
    {
      "id": 3,
      "name": "Verharmlosung des Nationalsozialismus",
      "items": [
        { "text": "Ohne Judenvernichtung würde man Hitler heute als großen Staatsmann ansehen." },
        { "text": "Die Verbrechen des Nationalsozialismus sind in der Geschichtsschreibung weit übertrieben worden." },
        { "text": "Der Nationalsozialismus hatte auch seine guten Seiten." }
      ]
    },
    {
      "id": 4,
      "name": "Fremdenfeindlichkeit",
      "items": [
        { "text": "Die Ausländer kommen nur hierher, um unseren Sozialstaat auszunutzen." },
        { "text": "Wenn Arbeitsplätze knapp werden, sollte man die Ausländer wieder in ihre Heimat zurückschicken." },
        { "text": "Die Bundesrepublik ist durch die vielen Ausländer in einem gefährlichen Maß überfremdet." }
      ]
    },
    {
      "id": 5,
      "name": "Antisemitismus",
      "items": [
        { "text": "Auch heute noch ist der Einfluss der Juden zu groß." },
        { "text": "Die Juden arbeiten mehr als andere Menschen mit üblen Tricks, um das zu erreichen, was sie wollen." },
        { "text": "Die Juden haben einfach etwas Besonderes und Eigentümliches an sich und passen nicht so recht zu uns." }
      ]
    },
    {
      "id": 6,
      "name": "Sozialdarwinismus",
      "items": [
        { "text": "Wie in der Natur sollte sich in der Gesellschaft immer der Stärkere durchsetzen." },
        { "text": "Eigentlich sind die Deutschen anderen Völkern von Natur aus überlegen." },
        { "text": "Es gibt wertvolles und unwertes Leben." }
      ]
    }
  ]
};

const QUESTIONS = (() => {
  const qs = [];
  data.dimensionen.forEach(dim => {
    dim.items.forEach(item => {
      qs.push({ dimName: dim.name, text: item.text });
    });
  });
  return qs;
})();

const TOTAL = QUESTIONS.length;

const BADGE_COLORS = ["#66bb6a", "#26a69a", "#ffb74d", "#ff7043", "#ef5350", "#ab47bc"];

const OPTIONS = [
  { label: "Lehne völlig ab", value: 1, cls: "opt-1", icon: "\u2716" },
  { label: "Lehne überwiegend ab", value: 2, cls: "opt-2", icon: "\u25B7" },
  { label: "Teils/teils", value: 3, cls: "opt-3", icon: "\u2014" },
  { label: "Stimme überwiegend zu", value: 4, cls: "opt-4", icon: "\u25B9" },
  { label: "Stimme voll und ganz zu", value: 5, cls: "opt-5", icon: "\u2605" }
];

const DIM_THRESHOLDS = [
  { max: 8, label: "Nicht rechtsextrem", css: "green" },
  { min: 9, max: 11, label: "Latent rechtsextrem", css: "yellow" },
  { min: 12, label: "Manifest rechtsextrem", css: "red" }
];

const OVERALL_THRESHOLDS = [
  { max: 53, label: "Nicht rechtsextrem", css: "green" },
  { min: 54, max: 62, label: "Latent rechtsextrem", css: "yellow" },
  { min: 63, label: "Manifest rechtsextrem", css: "red" }
];

const answers = {};
let currentIdx = 0;

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function getDimItem(idx) {
  let dimIdx = 0, itemIdx = idx;
  while (itemIdx >= data.dimensionen[dimIdx].items.length) {
    itemIdx -= data.dimensionen[dimIdx].items.length;
    dimIdx++;
  }
  return { dimIdx, itemIdx };
}

function answerKey(idx) {
  const { dimIdx, itemIdx } = getDimItem(idx);
  return `${dimIdx}_${itemIdx}`;
}

function renderQuestion(idx) {
  const q = QUESTIONS[idx];
  const { dimIdx } = getDimItem(idx);
  const container = document.getElementById("questions-container");
  const title = document.getElementById("dimension-title");
  document.getElementById("question-number-badge").textContent = `Frage ${idx + 1}`;
  document.getElementById("question-number-badge").style.background = BADGE_COLORS[idx % BADGE_COLORS.length];
  document.getElementById("dimension-name").textContent = q.dimName;

  container.innerHTML = "";
  const key = answerKey(idx);
  const div = document.createElement("div");
  div.className = "question-item";

  const qText = document.createElement("div");
  qText.className = "question-text";
  qText.textContent = q.text;
  div.appendChild(qText);

  const accentBar = document.createElement("div");
  accentBar.className = "question-accent-bar";
  accentBar.style.background = BADGE_COLORS[idx % BADGE_COLORS.length];
  div.appendChild(accentBar);

  const optsDiv = document.createElement("div");
  optsDiv.className = "options";

  OPTIONS.forEach(opt => {
    const label = document.createElement("label");
    label.className = "option-label " + opt.cls;

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "q";
    radio.value = opt.value;
    if (answers[key] === opt.value) {
      radio.checked = true;
      label.classList.add("selected");
    }

    radio.addEventListener("change", () => {
      document.querySelectorAll("input[name='q']").forEach(r => {
        r.closest(".option-label").classList.remove("selected");
      });
      if (radio.checked) {
        label.classList.add("selected");
        answers[key] = opt.value;
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
    textSpan.textContent = opt.label;
    label.appendChild(textSpan);
    optsDiv.appendChild(label);
  });

  div.appendChild(optsDiv);
  container.appendChild(div);

  updateProgress();
  updateNavButtons();
}

function updateProgress() {
  const fill = document.getElementById("progress-fill");
  const text = document.getElementById("progress-text");
  const pct = Math.round(((currentIdx + 1) / TOTAL) * 100);
  fill.style.width = pct + "%";
  text.textContent = `Frage ${currentIdx + 1} von ${TOTAL}`;
}

function updateNavButtons() {
  const prev = document.getElementById("prev-btn");
  const next = document.getElementById("next-btn");
  prev.disabled = currentIdx === 0;
  next.disabled = answers[answerKey(currentIdx)] === undefined;
  next.textContent = currentIdx === TOTAL - 1 ? "Ergebnisse anzeigen" : "Weiter";
}

function evaluateDimension(dimIdx) {
  const dim = data.dimensionen[dimIdx];
  let sum = 0;
  dim.items.forEach((_, itemIdx) => {
    const key = `${dimIdx}_${itemIdx}`;
    sum += answers[key] || 0;
  });
  const mean = sum / dim.items.length;
  for (const t of DIM_THRESHOLDS) {
    if ((t.min === undefined || sum >= t.min) && (t.max === undefined || sum <= t.max)) {
      return { sum, mean, label: t.label, css: t.css };
    }
  }
}

function evaluateOverall() {
  let total = 0;
  data.dimensionen.forEach((dim, dimIdx) => {
    dim.items.forEach((_, itemIdx) => {
      total += answers[`${dimIdx}_${itemIdx}`] || 0;
    });
  });
  const mean = total / TOTAL;
  for (const t of OVERALL_THRESHOLDS) {
    if ((t.min === undefined || total >= t.min) && (t.max === undefined || total <= t.max)) {
      return { total, mean, label: t.label, css: t.css };
    }
  }
}

function showResults() {
  showScreen("results-screen");

  const overall = evaluateOverall();

  const ringColor = overall.css === "green" ? "#4caf50" : overall.css === "yellow" ? "#ffc107" : "#ef5350";
  const pct = Math.round((overall.total / 90) * 100);

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
    <div class="overall-label ${overall.css}">${overall.label}</div>
    <div class="overall-avg">Durchschnitt: ${overall.mean.toFixed(2)}</div>`;

  requestAnimationFrame(() => {
    document.getElementById("score-ring-fill").style.strokeDashoffset = 328 - pct * 3.267;
  });

  const dimResults = document.getElementById("dimension-results");
  dimResults.innerHTML = "";
  data.dimensionen.forEach((dim, dimIdx) => {
    const res = evaluateDimension(dimIdx);
    const dpct = Math.round((res.sum / 15) * 100);
    const box = document.createElement("div");
    box.className = "dim-result";
    box.innerHTML =
      `<div class="dim-header">
        <span class="dim-name">${dimIdx + 1}. ${dim.name}</span>
        <span class="dim-score ${res.css}">${res.sum} / 15</span>
      </div>
      <div class="dim-bar-bg">
        <div class="dim-bar-fill ${res.css}" style="width:${dpct}%"></div>
      </div>
      <div class="dim-status ${res.css}">${res.label}</div>`;
    dimResults.appendChild(box);
  });

  document.getElementById("score-details").innerHTML =
    `<strong>Auswertungsschlüssel (Bertelsmann Stiftung)</strong><br>
    <strong>Pro Dimension</strong> (3 Items, 3–15 Punkte):<br>
    &bull; &lt; 9 = nicht rechtsextrem<br>
    &bull; 9–11 = latent rechtsextrem<br>
    &bull; ≥ 12 = manifest rechtsextrem (MW ≥ 4.0)<br><br>
    <strong>Gesamtergebnis</strong> (18 Items, 18–90 Punkte):<br>
    &bull; &lt; 54 = nicht rechtsextrem<br>
    &bull; 54–62 = latent rechtsextrem<br>
    &bull; ≥ 63 = manifest rechtsextrem (MW ≥ 3.5)`;

  const helpContainer = document.getElementById("help-btn-container");
  helpContainer.innerHTML = "";
  const helpBtn = document.createElement("button");
  helpBtn.id = "help-btn-results";
  helpBtn.textContent = "Hilfe & Beratung";
  if (overall.css === "green") {
    helpBtn.className = "btn-help btn-help-subtle";
  } else if (overall.css === "yellow") {
    helpBtn.className = "btn-help btn-help-notice";
  } else {
    helpBtn.className = "btn-help btn-help-urgent";
  }
  helpBtn.addEventListener("click", () => showScreen("help-screen"));
  helpContainer.appendChild(helpBtn);
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme, persist) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.innerHTML = theme === "dark" ? "&#9728;" : "&#9790;";
  if (persist !== false) localStorage.setItem("theme", theme);
}

document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("theme");
  const theme = saved || getSystemTheme();
  applyTheme(theme, !!saved);

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const isDark = document.documentElement.classList.contains("dark");
    applyTheme(isDark ? "light" : "dark", true);
  });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (!localStorage.getItem("theme")) {
      applyTheme(getSystemTheme(), false);
    }
  });

  document.getElementById("start-btn").addEventListener("click", () => {
    showScreen("test-screen");
    currentIdx = 0;
    renderQuestion(currentIdx);
  });

  document.getElementById("prev-btn").addEventListener("click", () => {
    if (currentIdx > 0) {
      currentIdx--;
      renderQuestion(currentIdx);
    }
  });

  document.getElementById("next-btn").addEventListener("click", () => {
    if (currentIdx < TOTAL - 1) {
      currentIdx++;
      renderQuestion(currentIdx);
    } else {
      showResults();
    }
  });

  document.getElementById("help-back-btn").addEventListener("click", () => {
    if (Object.keys(answers).length > 0) {
      showScreen("results-screen");
    } else {
      showScreen("welcome-screen");
    }
  });

  document.getElementById("toggle-details-btn").addEventListener("click", () => {
    const section = document.getElementById("details-section");
    const btn = document.getElementById("toggle-details-btn");
    const isHidden = section.classList.toggle("hidden");
    btn.textContent = isHidden ? "Details anzeigen" : "Details ausblenden";
  });

  document.getElementById("restart-btn").addEventListener("click", () => {
    Object.keys(answers).forEach(k => delete answers[k]);
    currentIdx = 0;
    showScreen("welcome-screen");
  });
});
