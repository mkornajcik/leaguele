document.addEventListener("DOMContentLoaded", () => {
  const splashData = JSON.parse(document.getElementById("splash-data").textContent);
  const champions = splashData.champions || [];
  const inputForm = document.getElementById("splash-form");
  const championInput = document.getElementById("champion-input");
  const sugg = document.getElementById("suggestions");
  const splashImg = document.getElementById("splash-image");
  const loader = document.getElementById("splash-loader");
  const initialSplashContainer = document.getElementById("initial-splash-container");
  const successSplashContainer = document.getElementById("success-splash-container");
  const bonusForm = document.getElementById("bonus-splash-form");

  let guessCount = splashData.guessCount || 0;
  let splashNameGuesses = splashData.splashNameGuesses || [];

  champions.forEach((c) => {
    const img = new Image();
    img.src = c.icon;
  });

  if (bonusForm) {
    bonusForm.addEventListener("submit", handleBonusSplashFormSubmit);
  }

  if (inputForm) {
    inputForm.addEventListener("submit", (e) => {
      e.preventDefault();
    });
  }

  // image loading
  if (splashImg && loader) {
    splashImg.addEventListener("load", () => {
      loader.style.transition = "opacity 0.3s ease";
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.style.display = "none";
        splashImg.style.transition = "opacity 0.5s ease";
        splashImg.style.opacity = "1";
      }, 300);
    });

    if (splashImg.complete) {
      splashImg.dispatchEvent(new Event("load"));
    }
  }

  if (championInput) {
    championInput.addEventListener("input", updateSuggestions);
    championInput.addEventListener("focus", () => {
      championInput.style.borderColor = "#4b6bac";
      const glow = championInput.parentElement.querySelector(".input-glow");
      if (glow) glow.style.opacity = "1";
    });

    championInput.addEventListener("blur", () => {
      sugg.classList.add("hidden");

      const glow = championInput.parentElement.querySelector(".input-glow");
      if (glow) glow.style.opacity = "0";
    });

    championInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitGuess();
      }
    });
  }

  if (sugg) {
    sugg.addEventListener("mousedown", (e) => {
      const li = e.target.closest("li[data-name]");
      if (!li) return;
      e.preventDefault();
      championInput.value = li.dataset.name;
      sugg.classList.add("hidden");
      submitGuess();
    });
  }

  function createSuccessContainer() {
    const container = document.createElement("div");
    container.className =
      "success-container text-center text-[#f5f5f7] bg-gradient-to-br from-[#1e1e2e] to-[#2a2a3e] rounded-xl p-4 border-2 border-[#20b2aa] mb-4 relative overflow-hidden shadow-[0_0_25px_rgba(32,178,170,0.3)]";
    container.style.opacity = "0";
    container.style.transform = "translateY(20px) scale(0.95)";

    container.innerHTML = `
      <div class="absolute inset-0 bg-gradient-to-r from-[#20b2aa]/10 via-transparent to-[#20b2aa]/10"></div>
      <div class="relative z-10">
        <div id="success-splash-container" class="splash-image-container relative w-full h-64 rounded-xl overflow-hidden border-2 border-[#20b2aa] shadow-[0_0_15px_rgba(32,178,170,0.4)]">
          <img loading="lazy" src="${splashData.splashImage}" alt="Champion splash art" class="w-full h-full object-cover transition-all duration-1000 ease-out" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#191222]/10 to-transparent pointer-events-none"></div>
          
          <!-- Success overlay -->
          <div class="absolute inset-0 flex items-center justify-center bg-[#20b2aa]/10">
            <div class="text-center">
              <div class="success-icon mb-2">
                <svg class="w-12 h-12 mx-auto text-[#20b2aa] animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div class="success-divider w-16 h-0.5 bg-gradient-to-r from-transparent via-[#20b2aa] to-transparent mx-auto mt-4"></div>
      </div>
    `;

    setTimeout(() => {
      container.style.transition = "all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)";
      container.style.opacity = "1";
      container.style.transform = "translateY(0) scale(1)";
    }, 50);

    return container;
  }

  function createBonusSection() {
    const allSplashes = splashData.allSplashes || [];
    const correctSplash = splashNameGuesses.some((g) => g.correct);

    function findGuess(k) {
      return splashNameGuesses.find((g) => g.guess === k);
    }

    const bonusDiv = document.createElement("div");
    bonusDiv.className =
      "bonus-section flex flex-col justify-center content-center mt-6 p-4 bg-gradient-to-br from-[#1e1e2e]/50 to-[#2a2a3e]/50 rounded-xl border border-[#45475a]/30";
    bonusDiv.style.opacity = "0";
    bonusDiv.style.transform = "translateY(20px)";

    bonusDiv.innerHTML = `
      <h2 class="text-[#abcde3] text-xl text-center font-bold text-shadow-2xl">Bonus Challenge</h2>
      <h3 class="text-[#abcde3] text-lg text-center font-semibold text-shadow-2xl mb-4">Guess the splash name</h3>
      <div class="bonus-divider w-24 h-0.5 bg-gradient-to-r from-transparent via-[#4b6bac] to-transparent mx-auto mb-4"></div>
      <form id="bonus-splash-form" action="/splash/name" method="POST" class="grid grid-cols-3 gap-3">
        ${allSplashes
          .map((splash) => {
            const entry = findGuess(splash);
            const isDisabled = correctSplash || Boolean(entry);
            let extra = "";
            if (entry) {
              if (entry.correct) {
                extra = "ring-2 ring-[#20b2aa] text-[#20b2aa] bg-gradient-to-r from-[#20b2aa]/10 to-[#20b2aa]/5";
              } else {
                extra = "ring-2 ring-[#ff6f61] text-[#ff6f61] bg-gradient-to-r from-[#ff6f61]/10 to-[#ff6f61]/5";
              }
            }
            return `
              <button name="guessSplash" value="${splash}" type="submit" ${
              isDisabled ? "disabled" : ""
            } class="splash-name-button focus:outline-none bg-gradient-to-r from-[#1e1e2e] to-[#252540] hover:from-[#2a2a41] hover:to-[#2f2f4a] rounded-xl border border-[#45475a] cursor-pointer text-center hover:scale-105 transition-all duration-300 py-3 px-4 text-sm font-medium relative overflow-hidden ${
              !entry ? "text-[#f5f5f7] hover:border-[#4b6bac]/50" : ""
            } ${extra}">
                ${splash}
              </button>
            `;
          })
          .join("")}
      </form>
    `;

    setTimeout(() => {
      bonusDiv.style.transition = "all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)";
      bonusDiv.style.opacity = "1";
      bonusDiv.style.transform = "translateY(0)";
    }, 300);

    return bonusDiv;
  }

  function submitGuess() {
    if (!championInput.value.trim()) return;
    championInput.style.transform = "scale(0.98)";
    championInput.style.boxShadow = "0 4px 15px rgba(75, 107, 172, 0.3)";

    setTimeout(() => {
      championInput.style.transform = "scale(1)";
      championInput.style.boxShadow = "";
      submitForm();
    }, 150);
  }

  async function submitForm() {
    const formData = new FormData(inputForm);
    const payload = {
      guessName: formData.get("guessName"),
      targetName: formData.get("splashTarget"),
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
      const res = await fetch("/splash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      appendGuess({
        guess: data.guessName,
        icon: data.icon,
        correct: data.correct,
      });
      successState(data);

      if (data.correct) {
        // Mark nav
        markNavComplete("splash");

        // Replace splash display to success container
        const displayContainer = document.querySelector(".splash-display-container");
        if (displayContainer) {
          const successContainer = createSuccessContainer();
          displayContainer.parentNode.replaceChild(successContainer, displayContainer);
        }

        renderSuccess(data);
      }
    } catch (error) {
      console.error("Splash form submit failed:", error);
    }
  }

  function appendGuess(guess) {
    let container = document.getElementById("splash-guesses-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "splash-guesses-container";
      container.className = "mt-6 space-y-3";
      const header = document.createElement("div");
      header.className = "text-center text-[#f5f5f7] text-sm font-medium mb-4 splash-header";
      header.innerText = "Your Guesses";
      container.appendChild(header);
      document.querySelector("#splash .max-w-lg > div").appendChild(container);
    }

    const div = document.createElement("div");
    div.className = "splash-guess-container";
    div.style.opacity = "0";
    div.style.transform = "translateX(-20px) scale(0.95)";

    div.innerHTML = `
      <div class="flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-[#1e1e2e] to-[#252540] rounded-xl p-3 splash-guess transition-all duration-300 hover:transform hover:scale-[1.02] ${
        guess.correct
          ? "border-2 border-[#20b2aa] shadow-[0_0_15px_rgba(32,178,170,0.4)] hover:shadow-[0_0_25px_rgba(32,178,170,0.6)]"
          : "border-2 border-[#ff6f61] shadow-[0_0_15px_rgba(255,111,97,0.4)] hover:shadow-[0_0_25px_rgba(255,111,97,0.6)]"
      }">
        <img loading="lazy" src="${guess.icon}" alt="${guess.guess} icon" title="${
      guess.guess
    }" class="w-14 h-14 rounded-xl transition-all duration-300 hover:scale-110 ${
      guess.correct ? "ring-2 ring-[#20b2aa]" : "ring-2 ring-[#ff6f61]"
    }"/>
        <p class="text-center font-semibold text-sm transition-all duration-300 ${
          guess.correct ? "text-[#20b2aa]" : "text-[#ff6f61]"
        }">${guess.guess}</p>
      </div>
    `;

    const headerEl = container.querySelector(".splash-header");
    if (headerEl && headerEl.nextElementSibling) {
      container.insertBefore(div, headerEl.nextElementSibling);
    } else {
      container.appendChild(div);
    }

    setTimeout(() => {
      div.style.transition = "all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)";
      div.style.opacity = "1";
      div.style.transform = "translateX(0) scale(1)";
    }, 50);
  }

  function successState(data) {
    if (data.correct) {
      championInput.style.transition = "all 0.3s ease";
      championInput.style.opacity = "0.5";
      championInput.disabled = true;

      setTimeout(() => {
        championInput.hidden = true;
      }, 300);

      championInput.value = "";
      const oldBanner = document.querySelector(".text-center.text-emerald-300.font-bold.animate-bounce");
      if (oldBanner) oldBanner.remove();
    } else {
      championInput.value = "";
      championInput.focus();
    }
  }

  function updateSuggestions() {
    const val = championInput.value.toLowerCase().trim();
    if (!val) return sugg.classList.add("hidden");

    const matches = champions.filter((c) => c.name.toLowerCase().startsWith(val)).slice(0, 8);

    if (!matches.length) return sugg.classList.add("hidden");

    sugg.innerHTML = matches
      .map(
        (c) => `
      <li
        class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#4b6bac]/30 transition-all duration-200 rounded-lg"
        data-name="${c.name}"
      >
        <img
          src="${c.icon}"
          alt="${c.name}"
          loading="lazy"
          class="w-6 h-6 rounded-sm flex-shrink-0 transition-transform duration-200"
        />
        <span class="transition-colors duration-200">${c.name}</span>
      </li>
    `
      )
      .join("");

    sugg.classList.remove("hidden");
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

  function adjustZoom() {
    const img = document.getElementById("splash-image");
    if (!img) return;
    const originX = splashData.originX;
    const originY = splashData.originY;
    const zoomLevel = Math.max(100, 420 - guessCount * 30);
    const zoomFactor = zoomLevel / 100;

    img.style.transition = "transform 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    img.style.transform = `scale(${zoomFactor})`;
    img.style.transformOrigin = `${originX}% ${originY}%`;

    const label = document.querySelector(".zoom-indicator");
    if (label) {
      label.querySelector("div").innerHTML = `
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
        Zoom: ${zoomLevel}%
      `;
    }
  }

  function renderSuccess(data) {
    document.querySelectorAll(".bonus-section").forEach((el) => el.remove());

    // Create banner and attempts elements
    const banner = document.createElement("div");
    banner.className = "mt-2 text-center text-emerald-300 font-bold";
    banner.innerText = `🎉 You guessed it! It was ${data.targetSplash || data.guessName}.`;
    banner.style.opacity = "0";
    banner.style.transform = "translateY(20px)";

    const attempts = document.createElement("div");
    attempts.className = "mt-2 text-center text-emerald-300 font-bold";
    attempts.innerText = `Attempts: ${guessCount}`;
    attempts.style.opacity = "0";
    attempts.style.transform = "translateY(10px)";

    // Create bonus section
    const bonusDiv = createBonusSection();

    const successContainer = document.querySelector(".success-container");
    if (successContainer) {
      successContainer.parentNode.insertBefore(banner, successContainer.nextSibling);
      successContainer.parentNode.insertBefore(attempts, banner.nextSibling);
      successContainer.parentNode.insertBefore(bonusDiv, attempts.nextSibling);

      // Animate banner
      setTimeout(() => {
        banner.style.transition = "all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)";
        banner.style.opacity = "1";
        banner.style.transform = "translateY(0)";
        banner.classList.add("animate-bounce");
      }, 100);

      // Animate attempts counter
      setTimeout(() => {
        attempts.style.transition = "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)";
        attempts.style.opacity = "1";
        attempts.style.transform = "translateY(0)";
      }, 200);

      // Hook up bonusForm event listener
      const bonusForm = bonusDiv.querySelector("#bonus-splash-form");
      if (bonusForm) {
        bonusForm.addEventListener("submit", handleBonusSplashFormSubmit);
      }
    } else {
      console.warn("renderSuccess: .success-container not found; cannot insert banner/bonus");
    }
  }

  // --- AJAX HANDLING FOR BONUS 1 ---
  async function handleBonusSplashFormSubmit(e) {
    e.preventDefault();
    const bonusForm = e.currentTarget;
    const btn = e.submitter;
    if (!btn) return;
    const guessSplash = btn.value;

    // Add loading state
    const originalText = btn.innerText;
    btn.style.transition = "all 0.3s ease";
    btn.style.transform = "scale(0.95)";
    btn.innerText = "...";

    // Disable all buttons to prevent double submit
    Array.from(bonusForm.elements).forEach((el) => {
      if (el.tagName === "BUTTON") el.disabled = true;
    });

    try {
      const res = await fetch("/splash/name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guessSplash }),
      });
      const result = await res.json();

      // Update splashNameGuesses in memory
      splashNameGuesses = splashNameGuesses.concat([{ guess: guessSplash, correct: result.correct }]);

      // Restore button text and transform
      btn.innerText = originalText;
      btn.style.transform = "scale(1)";

      // Update button styles
      Array.from(bonusForm.elements).forEach((el) => {
        if (el.tagName === "BUTTON") {
          const val = el.value;
          const entry = splashNameGuesses.find((g) => g.guess === val);
          el.disabled = result.correct || !!entry;
          el.classList.remove(
            "ring-2",
            "ring-[#20b2aa]",
            "ring-[#ff6f61]",
            "text-[#20b2aa]",
            "text-[#ff6f61]",
            "bg-gradient-to-r",
            "from-[#20b2aa]/10",
            "to-[#20b2aa]/5",
            "from-[#ff6f61]/10",
            "to-[#ff6f61]/5"
          );
          if (entry) {
            if (entry.correct) {
              el.classList.remove("text-[#f5f5f7]");
              el.classList.add(
                "ring-2",
                "ring-[#20b2aa]",
                "text-[#20b2aa]",
                "bg-gradient-to-r",
                "from-[#20b2aa]/10",
                "to-[#20b2aa]/5"
              );
              // Animate success state
              el.style.animation = "correctPulse 1s ease-in-out";
            } else {
              el.classList.add(
                "ring-2",
                "ring-[#ff6f61]",
                "text-[#ff6f61]",
                "bg-gradient-to-r",
                "from-[#ff6f61]/10",
                "to-[#ff6f61]/5"
              );
              // Animate error state
              el.style.animation = "incorrectPulse 1s ease-in-out";
            }
          }
        }
      });
    } catch (err) {
      // enable buttons if error
      Array.from(bonusForm.elements).forEach((el) => {
        if (el.tagName === "BUTTON") {
          el.disabled = false;
          el.innerText = el.value;
          el.style.transform = "scale(1)";
        }
      });
      console.error("Error submitting splash name guess:", err);
    }
  }

  if (guessCount > 0) {
    window.addEventListener("load", adjustZoom);
  }

  const originalAppend = appendGuess;
  appendGuess = (guess) => {
    guessCount++;
    originalAppend(guess);
    adjustZoom();
  };

  // Initialize animations
  document.addEventListener("DOMContentLoaded", () => {
    const guessCards = document.querySelectorAll(".splash-guess-container");
    guessCards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
    });

    // bonus button animations
    const bonusButtons = document.querySelectorAll(".splash-name-button");
    bonusButtons.forEach((button, index) => {
      button.style.animationDelay = `${index * 0.05}s`;

      button.addEventListener("mouseenter", () => {
        if (!button.disabled) {
          button.style.transform = "scale(1.05) translateY(-2px)";
          button.style.boxShadow = "0 8px 25px rgba(75, 107, 172, 0.2)";
        }
      });

      button.addEventListener("mouseleave", () => {
        if (!button.disabled) {
          button.style.transform = "";
          button.style.boxShadow = "";
        }
      });
    });

    // Add entrance animation
    const imageContainer = document.getElementById("initial-splash-container");
    if (imageContainer) {
      imageContainer.style.opacity = "0";
      imageContainer.style.transform = "scale(0.95)";

      setTimeout(() => {
        imageContainer.style.transition = "all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)";
        imageContainer.style.opacity = "1";
        imageContainer.style.transform = "scale(1)";
      }, 200);
    }
  });
});
