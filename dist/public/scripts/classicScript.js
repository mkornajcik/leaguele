export function setupClassic({
  champions,
  inputSelector = "#champion-input",
  suggSelector = "#suggestions",
  formSelector = "#input-form",
  comparisonsContainerSelector = "#comparisons-container",
}) {
  const input = document.querySelector(inputSelector);
  const sugg = document.querySelector(suggSelector);
  const inputForm = document.querySelector(formSelector);

  champions.forEach((c) => {
    const img = new Image();
    img.src = c.icon;
  });

  function markNavComplete(section) {
    const link = document.querySelector(`.nav-link[data-mode="${section}"]`);

    if (!link) return;

    if (link.querySelector(".completion-indicator")) return;

    const indicator = document.createElement("div");
    indicator.className = "completion-indicator";
    indicator.innerHTML = `
    <svg class="completion-icon" viewBox="0 0 24 24">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  `;
    const iconContainer = link.querySelector(".nav-icon-container");
    iconContainer.appendChild(indicator);
  }

  function initializeAnimations() {
    const header = document.querySelector(".comparison-header");
    const rows = document.querySelectorAll(".comparison-row");
    if (header) setTimeout(() => header.classList.add("animate-in"), 100);
    rows.forEach((row, rowIndex) => {
      const elements = row.querySelectorAll(".comparison-element");
      const rowDelay = 300 + rowIndex * 100;
      elements.forEach((element) => {
        setTimeout(() => element.classList.add("animate-in"), rowDelay);
      });
    });
  }

  async function submitForm() {
    const formData = new FormData(inputForm);
    const payload = {
      guessName: formData.get("guessName"),
      targetName: formData.get("targetName"),
    };

    const idxInChampions = champions.findIndex((c) => c.name === payload.guessName);
    if (idxInChampions !== -1) {
      champions.splice(idxInChampions, 1);
    }

    const li = sugg.querySelector(`li[data-name="${payload.guessName}"]`);
    if (li && li.parentNode) {
      li.parentNode.removeChild(li);
    }
    if (!sugg.querySelector("li")) {
      sugg.classList.add("hidden");
    }

    try {
      const res = await fetch("/classic", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.comparison) {
        prependComparisonRow(data.comparison);
        input.value = "";
        input.focus();
        sugg.classList.add("hidden");
      }
      if (data.isCorrect) {
        markNavComplete("classic");

        showSuccessBanner(data.guessName, data.guessCount);
        input.disabled = true;
        input.hidden = true;
      }
    } catch (error) {
      console.error("Classic form submit failed:", error);
    }
  }

  function prependComparisonRow(comp) {
    let comparisonsContainer = document.querySelector(comparisonsContainerSelector);
    if (!comparisonsContainer) {
      comparisonsContainer = document.createElement("div");
      comparisonsContainer.id = "comparisons-container";
      comparisonsContainer.className = "mt-6 space-y-2";
      const header = document.createElement("div");
      header.className =
        "grid grid-cols-8 gap-1 flex-1 text-[#f5f5f7] items-center text-sm comparison-header opacity-0 bg-gradient-to-r from-[#2a2a3e] to-[#1e1e2e] rounded-lg p-2 border border-[#45475a]/50";
      header.innerHTML = `
        <div class="text-center">Champion</div>
        <div class="text-center">Gender</div>
        <div class="text-center">Position</div>
        <div class="text-center">Species</div>
        <div class="text-center">Resource</div>
        <div class="text-center">Range</div>
        <div class="text-center">Region</div>
        <div class="text-center">Year</div>
      `;
      comparisonsContainer.appendChild(header);
      const formParent = inputForm.parentNode;
      formParent.insertBefore(comparisonsContainer, inputForm.nextSibling);
      setTimeout(() => header.classList.add("animate-in"), 100);
    }
    const row = document.createElement("div");
    row.className = "flex items-center gap-3 bg-[#1e1e2e] rounded-md comparison-row";
    row.innerHTML = `
      <div class="grid grid-cols-8 gap-1 flex-1 text-[#f5f5f7] items-center text-xs cursor-pointer comparison-grid">
        <div class="flex justify-center content-center comparison-element opacity-0 transform" data-element="icon">
          <img loading="lazy" src="${comp.icon}" alt="${comp.guessName} icon" title="${
      comp.guessName
    }" class="w-max h-max rounded-sm transition-transform duration-300 hover:scale-110" />
        </div>
        <div class="content-center min-h-18 transition-all duration-300 font-semibold text-center p-2 rounded-lg ${
          comp.gender.correct
            ? "text-[#20b2aa] border border-[#20b2aa] shadow-[0_0_10px_rgba(32,178,170,0.3)]"
            : "text-[#ff6f61] border border-[#ff6f61] shadow-[0_0_10px_rgba(255,111,97,0.3)]"
        } hover:scale-105 comparison-element opacity-0 transform" data-element="gender">
          ${comp.gender.guess}
        </div>
        <div class="content-center min-h-18 transition-all duration-300 font-semibold text-center p-2 rounded-lg
          ${
            comp.position.correct
              ? "text-[#20b2aa] border border-[#20b2aa] shadow-[0_0_10px_rgba(32,178,170,0.3)]"
              : comp.position.partial
              ? "text-[#ffc300] border border-[#ffc300] shadow-[0_0_10px_rgba(255,215,0,0.3)]"
              : "text-[#ff6f61] border border-[#ff6f61] shadow-[0_0_10px_rgba(255,111,97,0.3)]"
          }
          hover:scale-105 comparison-element opacity-0 transform" data-element="position">
          ${comp.position.guess}
        </div>
        <div class="content-center min-h-18 transition-all duration-300 font-semibold text-center p-2 rounded-lg
          ${
            comp.species.correct
              ? "text-[#20b2aa] border border-[#20b2aa] shadow-[0_0_10px_rgba(32,178,170,0.3)]"
              : comp.species.partial
              ? "text-[#ffc300] border border-[#ffc300] shadow-[0_0_10px_rgba(255,215,0,0.3)]"
              : "text-[#ff6f61] border border-[#ff6f61] shadow-[0_0_10px_rgba(255,111,97,0.3)]"
          }
          hover:scale-105 comparison-element opacity-0 transform" data-element="species">
          ${comp.species.guess}
        </div>
        <div class="content-center min-h-18 transition-all duration-300 font-semibold text-center p-2 rounded-lg ${
          comp.resource.correct
            ? "text-[#20b2aa] border border-[#20b2aa] shadow-[0_0_10px_rgba(32,178,170,0.3)]"
            : "text-[#ff6f61] border border-[#ff6f61] shadow-[0_0_10px_rgba(255,111,97,0.3)]"
        } hover:scale-105 comparison-element opacity-0 transform" data-element="resource">
          ${comp.resource.guess}
        </div>
        <div class="content-center min-h-18 transition-all duration-300 font-semibold text-center p-2 rounded-lg ${
          comp.attackType.correct
            ? "text-[#20b2aa] border border-[#20b2aa] shadow-[0_0_10px_rgba(32,178,170,0.3)]"
            : "text-[#ff6f61] border border-[#ff6f61] shadow-[0_0_10px_rgba(255,111,97,0.3)]"
        } hover:scale-105 comparison-element opacity-0 transform" data-element="attackType">
          ${comp.attackType.guess}
        </div>
        <div class="content-center min-h-18 transition-all duration-300 font-semibold text-center p-2 rounded-lg ${
          comp.region.correct
            ? "text-[#20b2aa] border border-[#20b2aa] shadow-[0_0_10px_rgba(32,178,170,0.3)]"
            : "text-[#ff6f61] border border-[#ff6f61] shadow-[0_0_10px_rgba(255,111,97,0.3)]"
        } hover:scale-105 comparison-element opacity-0 transform" data-element="region">
          ${comp.region.guess}
        </div>
        <div class="content-center min-h-18 transition-all duration-300 font-semibold text-center p-2 rounded-lg ${
          comp.releaseDate.correct
            ? "text-[#20b2aa] border border-[#20b2aa] shadow-[0_0_10px_rgba(32,178,170,0.3)]"
            : "text-[#ff6f61] border border-[#ff6f61] shadow-[0_0_10px_rgba(255,111,97,0.3)]"
        } hover:scale-105 comparison-element opacity-0 transform" data-element="releaseDate">
          ${comp.releaseDate.guess}
          ${
            !comp.releaseDate.correct
              ? `<div class="text-xs mt-1 text-gray-400 transition-opacity duration-300">
            ${comp.releaseDate.hint === "before" ? "Too early" : "Too late"}
          </div>`
              : ""
          }
        </div>
      </div>
    `;
    const header = comparisonsContainer.querySelector(".comparison-header");
    if (header && header.nextSibling) {
      comparisonsContainer.insertBefore(row, header.nextSibling);
    } else {
      comparisonsContainer.appendChild(row);
    }
    setTimeout(() => {
      row.querySelectorAll(".comparison-element").forEach((el) => el.classList.add("animate-in"));
    }, 100);
  }

  function showSuccessBanner(targetName, guessCount) {
    const attempts = document.createElement("div");
    attempts.className = "mt-2 text-center text-emerald-300 font-bold";
    attempts.innerText = `Attempts: ${guessCount}`;

    const banner = document.createElement("div");
    banner.className = "mt-6 text-center text-emerald-300 font-bold animate-bounce";
    banner.innerText = `🎉 You guessed it! It was ${targetName}.`;

    inputForm.parentNode.insertBefore(banner, inputForm.nextSibling);
    inputForm.parentNode.insertBefore(attempts, banner.nextSibling);
  }

  function updateSuggestions() {
    const val = input.value.toLowerCase().trim();
    if (!val) return sugg.classList.add("hidden");
    const matches = champions.filter((c) => c.name.toLowerCase().startsWith(val));
    if (!matches.length) return sugg.classList.add("hidden");
    sugg.innerHTML = matches
      .map(
        (c) => `
      <li
        class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#4b6bac]/30 transition-all duration-200"
        data-name="${c.name}"
      >
        <img loading="lazy" src="${c.icon}" alt="${c.name}" class="w-6 h-6 rounded-sm flex-shrink-0 transition-transform duration-200" />
        <span class="transition-colors duration-200">${c.name}</span>
      </li>
    `
      )
      .join("");
    sugg.classList.remove("hidden");
  }

  if (input) {
    input.addEventListener("input", updateSuggestions);
    input.addEventListener("focus", () => {
      input.style.borderColor = "#4b6bac";
    });
    input.addEventListener("blur", () => {
      sugg.classList.add("hidden");
    });
  }

  if (sugg) {
    sugg.addEventListener("mousedown", (e) => {
      const li = e.target.closest("li[data-name]");
      if (!li) return;
      e.preventDefault();
      input.value = li.dataset.name;
      sugg.classList.add("hidden");
      input.style.transform = "scale(0.98)";
      setTimeout(() => {
        input.style.transform = "scale(1)";
        submitForm();
      }, 100);
    });
  }

  if (inputForm) {
    inputForm.addEventListener("submit", async (e) => {
      e.preventDefault();
    });
  }

  document.addEventListener("DOMContentLoaded", initializeAnimations);
  document.addEventListener("submit", (e) => e.preventDefault());
}
