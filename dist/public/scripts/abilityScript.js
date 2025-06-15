// --- DOM Elements ---
const mainForm = document.getElementById("input-form");
const mainInput = document.getElementById("champion-input");
const mainSugg = document.getElementById("suggestions");
const toggle = document.getElementById("easy-toggle");
const image = document.getElementById("ability-image");
const easyLabel = document.getElementById("easy-mode-label");
const loader = document.getElementById("ability-loader");
const abilityDataElement = document.getElementById("ability-data");

let keyForm = document.querySelector('form[action="/ability/key"]');
let nameForm = document.querySelector('form[action="/ability/name"]');

// Get data from JSON script tag
const abilityData = JSON.parse(document.getElementById("ability-data").textContent);
const champions = abilityData.champions || [];
const keyGuesses = abilityData.keyGuesses || [];
const allAbilities = abilityData.allAbilities || [];
const abilityNameGuesses = abilityData.abilityNameGuesses || [];
const abilityRotation = abilityData.abilityRotation;
const abilityIcon = abilityData.abilityIcon;
const secondsUntilReset = abilityData.secondsUntilReset;

champions.forEach((c) => {
  const img = new Image();
  img.src = c.icon;
});

if (image && loader) {
  image.addEventListener("load", () => {
    loader.style.transition = "opacity 0.3s ease";
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
      image.style.transition = "opacity 0.5s ease";
      image.style.opacity = "1";
    }, 300);
  });

  if (image.complete) {
    image.dispatchEvent(new Event("load"));
  }
}

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

  setTimeout(() => {
    indicator.style.animation = "completionPulse 2s ease-in-out infinite";
  }, 100);
}

// --- Utility Functions ---
function createGuessBanner(text) {
  const banner = document.createElement("div");
  banner.className = "text-center text-emerald-300 font-bold";
  banner.innerText = text;
  banner.style.opacity = "0";
  banner.style.transform = "translateY(20px)";

  // Trigger animation
  setTimeout(() => {
    banner.style.transition = "all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)";
    banner.style.opacity = "1";
    banner.style.transform = "translateY(0)";
    banner.classList.add("animate-bounce");
  }, 50);

  return banner;
}

function createSuccessContainer() {
  const container = document.createElement("div");
  container.className =
    "success-container text-center text-[#f5f5f7] bg-gradient-to-br from-[#1e1e2e] to-[#2a2a3e] rounded-xl p-6 border-2 border-[#20b2aa] mb-4 relative overflow-hidden shadow-[0_0_25px_rgba(32,178,170,0.3)]";
  container.style.opacity = "0";
  container.style.transform = "translateY(20px) scale(0.95)";

  container.innerHTML = `
    <div class="absolute inset-0 bg-gradient-to-r from-[#20b2aa]/10 via-transparent to-[#20b2aa]/10"></div>
    <div class="relative z-10">
      <div class="flex justify-center">
        <img loading="lazy" src="${
          abilityIcon || ""
        }" alt="Champion ability" class="w-24 h-24 rounded-lg border-2 border-[#20b2aa] shadow-lg shadow-[#20b2aa]/30" />
      </div>
      <div class="success-divider w-16 h-0.5 bg-gradient-to-r from-transparent via-[#20b2aa] to-transparent mx-auto mt-4"></div>
    </div>
  `;

  // Trigger animation after element is added to DOM
  setTimeout(() => {
    container.style.transition = "all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)";
    container.style.opacity = "1";
    container.style.transform = "translateY(0) scale(1)";
  }, 50);

  return container;
}

function appendGuess(containerId, guess, headerClass = "ability-header") {
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    container.className = "mt-6 space-y-3";
    const header = document.createElement("div");
    header.className = `text-center text-[#f5f5f7] text-sm font-medium mb-4 ${headerClass}`;
    header.innerText = "Your Guesses";
    container.appendChild(header);
    document.querySelector("#ability .max-w-lg > div").appendChild(container);
  }

  const div = document.createElement("div");
  div.className = "ability-guess-container";
  div.style.opacity = "0";
  div.style.transform = "translateX(-20px) scale(0.95)";

  div.innerHTML = `
      <div class="flex flex-col items-center justify-center gap-0.5 bg-[#1e1e2e] rounded-lg p-1 ability-guess transition-all duration-300 ${
        guess.correct
          ? "border-2 border-[#20b2aa] shadow-[0_0_15px_rgba(32,178,170,0.4)]"
          : "border-2 border-[#ff6f61] shadow-[0_0_15px_rgba(255,111,97,0.4)]"
      }">
        <img loading="lazy" src="${guess.icon}" alt="${guess.guess} icon" class="w-12 h-12 rounded-lg ${
    guess.correct ? "ring-2 ring-[#20b2aa]" : "ring-2 ring-[#ff6f61]"
  }"/>
        <p class="text-center font-medium text-sm ${guess.correct ? "text-[#20b2aa]" : "text-[#ff6f61]"}">${
    guess.guess
  }</p>
      </div>
    `;

  const headerEl = container.querySelector(`.${headerClass}`);
  if (headerEl && headerEl.nextElementSibling) {
    container.insertBefore(div, headerEl.nextElementSibling);
  } else {
    container.appendChild(div);
  }

  // Trigger entrance animation
  setTimeout(() => {
    div.style.transition = "all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)";
    div.style.opacity = "1";
    div.style.transform = "translateX(0) scale(1)";
  }, 50);
}

function disableInputs(inputs) {
  inputs.forEach((input) => {
    if (input) {
      input.style.transition = "all 0.3s ease";
      input.style.opacity = "0.5";
      input.disabled = true;

      setTimeout(() => {
        input.hidden = true;
      }, 300);
    }
  });
}

// --- Suggestions ---
function updateSuggestions(input, sugg, champions) {
  const val = input.value.toLowerCase().trim();
  if (!val) return sugg.classList.add("hidden");
  const matches = champions.filter((c) => c.name.toLowerCase().startsWith(val)).slice(0, 8);
  if (!matches.length) return sugg.classList.add("hidden");
  sugg.innerHTML = matches
    .map(
      (c) => `
      <li
        class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#4b6bac]/30 transition-all duration-200"
        data-name="${c.name}"
      >
        <img loading="lazy" src="${c.icon}" alt="${c.name}" class="w-8 h-8 rounded-sm flex-shrink-0 transition-transform duration-200 hover:scale-110" />
        <span class="transition-colors duration-200">${c.name}</span>
      </li>
    `
    )
    .join("");
  sugg.classList.remove("hidden");
}

// --- Easy Mode Toggle ---
function easyMode() {
  if (image) {
    image.style.transition = "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
    image.classList.toggle("grayscale");
    image.classList.toggle(`rotate-${abilityRotation}`);
  }
}

// --- Bonus Section Renderers ---
function renderBonus1(keys, keyGuessesArr, correctKey) {
  return `
      <div id="bonus1-section" class="bonus-section flex flex-col justify-center content-center mt-6 p-4 bg-gradient-to-br from-[#1e1e2e]/50 to-[#2a2a3e]/50 rounded-xl border border-[#45475a]/30" style="opacity: 0; transform: translateY(20px);">
        <h2 class="text-[#abcde3] text-xl text-center font-bold text-shadow-2xl">Bonus #1:</h2>
        <h3 class="text-[#abcde3] text-lg text-center font-semibold text-shadow-2xl mb-4">Guess the ability</h3>
        <div class="bonus-divider w-24 h-0.5 bg-gradient-to-r from-transparent via-[#4b6bac] to-transparent mx-auto mb-4"></div>
        <div class="ml-5 mr-5">
          <form action="/ability/key" method="POST" class="grid grid-cols-5 ml-5 mr-5 gap-3">
            ${keys
              .map((key) => {
                const entry = keyGuessesArr.find((g) => g.guess === key);
                const isDisabled = correctKey || Boolean(entry);
                let extra = "";
                if (entry) {
                  extra = entry.correct
                    ? "ring-2 ring-[#20b2aa] text-[#20b2aa] bg-gradient-to-r from-[#20b2aa]/10 to-[#20b2aa]/5"
                    : "ring-2 ring-[#ff6f61] text-[#ff6f61] bg-gradient-to-r from-[#ff6f61]/10 to-[#ff6f61]/5";
                }
                return `
                <button name="guessKey" value="${key}" type="submit" ${
                  isDisabled ? "disabled" : ""
                } class="cursor-pointer text-center hover:scale-105 transition-all duration-300 py-3 px-2 mx-1.5 text-sm font-medium
                  ${
                    !entry ? "text-[#f5f5f7]" : ""
                  } focus:outline-none bg-gradient-to-r from-[#1e1e2e] to-[#252540] hover:from-[#2a2a41] hover:to-[#2f2f4a] rounded-xl border border-[#45475a] relative overflow-hidden ${extra}">
                  ${key}
                </button>
              `;
              })
              .join("")}
          </form>
        </div>
      </div>
    `;
}

function renderBonus2(allAbilitiesArr, abilityNameGuessesArr, gotNameRight) {
  return `
      <div id="bonus2-section" class="bonus-section flex flex-col justify-center content-center mt-6 p-4 bg-gradient-to-br from-[#1e1e2e]/50 to-[#2a2a3e]/50 rounded-xl border border-[#45475a]/30" style="opacity: 0; transform: translateY(20px);">
        <h2 class="text-[#abcde3] text-xl text-center font-bold text-shadow-2xl">
          Bonus #2:
        </h2>
        <h3 class="text-[#abcde3] text-lg text-center font-semibold text-shadow-2xl mb-4">
          Guess the name
        </h3>
        <div class="bonus-divider w-24 h-0.5 bg-gradient-to-r from-transparent via-[#4b6bac] to-transparent mx-auto mb-4"></div>
        <div class="ml-5 mr-5">
          <form action="/ability/name" method="POST" class="grid grid-cols-1 ml-5 mr-5 gap-3">
            ${allAbilitiesArr
              .map((ability) => {
                const entry = abilityNameGuessesArr.find((g) => g.guess === ability);
                const isDisabled = gotNameRight || Boolean(entry);
                let extra = "";
                if (entry) {
                  extra = entry.correct
                    ? "ring-2 ring-[#20b2aa] text-[#20b2aa] bg-gradient-to-r from-[#20b2aa]/10 to-[#20b2aa]/5"
                    : "ring-2 ring-[#ff6f61] text-[#ff6f61] bg-gradient-to-r from-[#ff6f61]/10 to-[#ff6f61]/5";
                }
                return `
                <button name="guessName" value="${ability}" type="submit" ${
                  isDisabled ? "disabled" : ""
                } class="cursor-pointer text-center hover:scale-105 transition-all duration-300 py-3 px-5 mx-1.5 text-sm font-medium
                  ${
                    !entry ? "text-[#f5f5f7]" : ""
                  } focus:outline-none bg-gradient-to-r from-[#1e1e2e] to-[#252540] hover:from-[#2a2a41] hover:to-[#2f2f4a] rounded-xl border border-[#45475a] relative overflow-hidden ${extra}">
                  ${ability}
                </button>
              `;
              })
              .join("")}
          </form>
        </div>
      </div>
    `;
}

function insertAfterBanner(html, afterSelector) {
  const banner = document.querySelector(afterSelector);
  if (banner) {
    banner.insertAdjacentHTML("afterend", html);

    const newElement = banner.nextElementSibling;
    if (newElement) {
      setTimeout(() => {
        newElement.style.transition = "all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)";
        newElement.style.opacity = "1";
        newElement.style.transform = "translateY(0)";
      }, 100);
    }
  }
}

// ---Bonus Section Handlers ---
async function showBonus1() {
  const KEYS = ["P", "Q", "W", "E", "R"];
  document.getElementById("bonus1-section")?.remove();
  document.getElementById("bonus2-section")?.remove();

  if (easyLabel) {
    easyLabel.style.transition = "all 0.3s ease";
    easyLabel.style.opacity = "0";
    setTimeout(() => {
      easyLabel.style.display = "none";
    }, 300);
  }

  const correctKey = keyGuesses.some((g) => g.correct);

  insertAfterBanner(renderBonus1(KEYS, keyGuesses, correctKey), ".attempts");

  if (image) {
    image.style.transition = "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
    image.classList.remove("grayscale");
    image.classList.remove(`rotate-${abilityRotation}`);
  }

  keyForm = document.querySelector("#bonus1-section form");
  if (keyForm) {
    keyForm.addEventListener("submit", (e) => e.preventDefault());
    keyForm.querySelectorAll('button[name="guessKey"]').forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        if (btn.disabled) return;

        // Add loading state
        const originalText = btn.innerText;
        btn.style.transition = "all 0.3s ease";
        btn.style.transform = "scale(0.95)";
        btn.innerText = "...";

        const payload = { guessKey: btn.value };
        try {
          const res = await fetch("/ability/key", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" },
          });
          const data = await res.json();

          // Update local keyGuesses state
          keyGuesses.push({ guess: btn.value, correct: data.correct });
          btn.disabled = true;
          btn.innerText = originalText;
          btn.style.transform = "scale(1)";

          if (data.correct) {
            btn.classList.remove("text-[#f5f5f7]");
            btn.classList.add(
              "ring-2",
              "ring-[#20b2aa]",
              "text-[#20b2aa]",
              "bg-gradient-to-r",
              "from-[#20b2aa]/10",
              "to-[#20b2aa]/5"
            );

            // Animate success state
            btn.style.animation = "correctPulse 1s ease-in-out";

            keyForm.querySelectorAll('button[name="guessKey"]').forEach((b) => {
              b.disabled = true;
              if (b !== btn) {
                b.style.transition = "all 0.3s ease";
                b.style.opacity = "0.5";
              }
            });

            setTimeout(() => {
              showBonus2();
            }, 500);
          } else {
            btn.classList.remove("text-[#f5f5f7]");
            btn.classList.add(
              "ring-2",
              "ring-[#ff6f61]",
              "text-[#ff6f61]",
              "bg-gradient-to-r",
              "from-[#ff6f61]/10",
              "to-[#ff6f61]/5"
            );

            // Animate error state
            btn.style.animation = "incorrectPulse 1s ease-in-out";
          }
        } catch (error) {
          console.error("Key guess failed:", error);
          btn.innerText = originalText;
          btn.style.transform = "scale(1)";
          btn.disabled = false;
        }
      });
    });
  }
}

async function showBonus2() {
  const gotNameRight = abilityNameGuesses.some((g) => g.correct);

  insertAfterBanner(renderBonus2(allAbilities, abilityNameGuesses, gotNameRight), "#bonus1-section");

  nameForm = document.querySelector("#bonus2-section form");
  if (nameForm) {
    nameForm.addEventListener("submit", (e) => e.preventDefault());
    nameForm.querySelectorAll('button[name="guessName"]').forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        if (btn.disabled) return;

        // Add loading state
        const originalText = btn.innerText;
        btn.style.transition = "all 0.3s ease";
        btn.style.transform = "scale(0.95)";
        btn.innerText = "...";

        const payload = { guessName: btn.value };
        try {
          const res = await fetch("/ability/name", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" },
          });
          const data = await res.json();

          // Update local abilityNameGuesses
          abilityNameGuesses.push({ guess: btn.value, correct: data.correct });
          btn.disabled = true;
          btn.innerText = originalText;
          btn.style.transform = "scale(1)";

          if (data.correct) {
            btn.classList.remove("text-[#f5f5f7]");
            btn.classList.add(
              "ring-2",
              "ring-[#20b2aa]",
              "text-[#20b2aa]",
              "bg-gradient-to-r",
              "from-[#20b2aa]/10",
              "to-[#20b2aa]/5"
            );

            // Animate success state
            btn.style.animation = "correctPulse 1s ease-in-out";

            nameForm.querySelectorAll('button[name="guessName"]').forEach((b) => {
              b.disabled = true;
              if (b !== btn) {
                b.style.transition = "all 0.3s ease";
                b.style.opacity = "0.5";
              }
            });
          } else {
            btn.classList.remove("text-[#f5f5f7]");
            btn.classList.add(
              "ring-2",
              "ring-[#ff6f61]",
              "text-[#ff6f61]",
              "bg-gradient-to-r",
              "from-[#ff6f61]/10",
              "to-[#ff6f61]/5"
            );

            // Animate error state
            btn.style.animation = "incorrectPulse 1s ease-in-out";
          }
        } catch (error) {
          console.error("Ability name guess failed:", error);
          btn.innerText = originalText;
          btn.style.transform = "scale(1)";
          btn.disabled = false;
        }
      });
    });
  }
}

// --- Main Ability Guess---
if (mainForm) {
  mainForm.addEventListener("submit", (e) => e.preventDefault());
  mainInput?.addEventListener("input", () => updateSuggestions(mainInput, mainSugg, champions));
  mainInput?.addEventListener("focus", () => {
    mainInput.style.borderColor = "#4b6bac";
    const glow = mainInput.parentElement.querySelector(".input-glow");
    if (glow) glow.style.opacity = "1";
  });
  mainInput?.addEventListener("blur", () => {
    const glow = mainInput.parentElement.querySelector(".input-glow");
    if (glow) glow.style.opacity = "0";
    mainSugg.classList.add("hidden");
  });
  if (mainSugg) {
    mainSugg.addEventListener("mousedown", (e) => {
      const li = e.target.closest("li[data-name]");
      if (!li) return;
      e.preventDefault();
      mainInput.value = li.dataset.name;
      mainSugg.classList.add("hidden");
      mainInput.style.transform = "scale(0.98)";
      setTimeout(() => {
        mainInput.style.transform = "scale(1)";
        submitMainForm();
      }, 100);
    });
  }
}

async function submitMainForm() {
  const formData = new FormData(mainForm);
  const payload = {
    guessName: formData.get("guessName"),
    targetName: formData.get("targetName"),
  };

  const idxInChampions = champions.findIndex((c) => c.name === payload.guessName);
  if (idxInChampions !== -1) {
    champions.splice(idxInChampions, 1);
  }

  const li = mainSugg.querySelector(`li[data-name="${payload.guessName}"]`);
  if (li && li.parentNode) {
    li.parentNode.removeChild(li);
  }
  if (!mainSugg.querySelector("li")) {
    mainSugg.classList.add("hidden");
  }

  try {
    const res = await fetch("/ability", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();

    appendGuess("ability-guesses-container", {
      guess: data.guessName,
      icon: data.icon,
      correct: data.correct,
    });

    if (data.correct) {
      // Mark navigation as complete
      markNavComplete("ability");

      // Create and show success container
      const successContainer = createSuccessContainer();
      const displayContainer = document.querySelector(".ability-display-container");
      if (displayContainer) {
        displayContainer.parentNode.replaceChild(successContainer, displayContainer);
      }

      // Disable inputs with animation
      disableInputs([mainInput]);

      // Create banner
      const banner = createGuessBanner(`🎉 You guessed it! It was ${data.guessName}.`);
      const guessesContainer = document.getElementById("ability-guesses-container");

      // Add attempts
      const guessCount = guessesContainer.querySelectorAll(".ability-guess-container").length;
      const attempts = document.createElement("div");
      attempts.className = "mt-2 text-center text-emerald-300 font-bold attempts";
      attempts.innerText = `Attempts: ${guessCount}`;
      attempts.style.opacity = "0";
      attempts.style.transform = "translateY(10px)";

      guessesContainer.prepend(attempts);
      guessesContainer.prepend(banner);

      setTimeout(() => {
        attempts.style.transition = "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)";
        attempts.style.opacity = "1";
        attempts.style.transform = "translateY(0)";
      }, 200);

      mainForm.style.transition = "all 0.5s ease";
      mainForm.style.opacity = "0";
      mainForm.style.transform = "translateY(-20px)";
      setTimeout(() => {
        mainForm.remove();
        showBonus1();
      }, 500);
    } else {
      mainInput.value = "";
      mainInput.focus();
    }
  } catch (error) {
    console.error("Ability form submit failed:", error);
  }
}

function updateTimer() {
  let seconds = secondsUntilReset;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  document.getElementById("timer").textContent = `Next champion in ${hours}h ${minutes}m ${secs}s`;
  if (seconds > 0) {
    seconds--;
    setTimeout(updateTimer, 1000);
  }
}

// --- Attach easy mode toggle ---
if (toggle) {
  toggle.addEventListener("change", easyMode);
}

window.addEventListener("DOMContentLoaded", () => {
  updateTimer();
  const mainGuesses = abilityData.guesses || [];
  if (mainGuesses.length && mainGuesses[mainGuesses.length - 1].correct) {
    showBonus1();
    const keyGuessesArr = keyGuesses || [];
    if (keyGuessesArr.some((g) => g.correct)) {
      showBonus2();
    }
  }
});
