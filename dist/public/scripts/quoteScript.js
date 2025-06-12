document.addEventListener("DOMContentLoaded", () => {
  const quoteData = JSON.parse(document.getElementById("quote-data").textContent);
  const champions = quoteData.champions || [];
  const championInput = document.getElementById("champion-input");
  const sugg = document.getElementById("suggestions");
  const inputForm = document.getElementById("input-form");

  champions.forEach((c) => {
    const img = new Image();
    img.src = c.icon;
  });

  if (inputForm) {
    inputForm.addEventListener("submit", (e) => e.preventDefault());
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
  }

  function createSuccessContainer(targetQuote) {
    const container = document.createElement("div");
    container.className =
      "success-container text-center text-[#f5f5f7] bg-gradient-to-br from-[#1e1e2e] to-[#2a2a3e] rounded-xl p-6 border-2 border-[#20b2aa] mb-4 relative overflow-hidden shadow-[0_0_25px_rgba(32,178,170,0.3)]";
    container.style.opacity = "0";
    container.style.transform = "translateY(20px) scale(0.95)";

    container.innerHTML = `
      <div class="absolute inset-0 bg-gradient-to-r from-[#20b2aa]/10 via-transparent to-[#20b2aa]/10"></div>
      <div class="relative z-10">
        <div class="success-icon mb-3">
          <svg class="w-8 h-8 mx-auto text-[#20b2aa]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z" />
          </svg>
        </div>
        <p class="mb-4 text-lg font-medium leading-relaxed">${targetQuote}</p>
        <div class="success-divider w-16 h-0.5 bg-gradient-to-r from-transparent via-[#20b2aa] to-transparent mx-auto mb-4"></div>
      </div>
    `;

    setTimeout(() => {
      container.style.transition = "all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)";
      container.style.opacity = "1";
      container.style.transform = "translateY(0) scale(1)";
    }, 50);

    return container;
  }

  function updateSuggestions() {
    const val = championInput.value.toLowerCase().trim();
    if (!val) return sugg.classList.add("hidden");

    const matches = champions.filter((c) => c.name.toLowerCase().startsWith(val)).slice(0, 8);
    if (!matches.length) return sugg.classList.add("hidden");

    sugg.innerHTML = matches
      .map(
        (c) => `
      <li data-name="${c.name}" class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#4b6bac]/30 transition-all duration-200 rounded-lg">
        <img loading="lazy" src="${c.icon}" alt="${c.name}" class="w-6 h-6 rounded-sm flex-shrink-0"/>
        <span>${c.name}</span>
      </li>
    `
      )
      .join("");
    sugg.classList.remove("hidden");
  }

  async function submitForm() {
    const formData = new FormData(inputForm);
    const guessName = formData.get("guessName");
    const targetName = formData.get("targetName");
    const targetQuote = formData.get("targetQuote");
    const payload = {
      guessName,
      targetName,
    };

    const idxInChampions = champions.findIndex((c) => c.name === guessName);
    if (idxInChampions !== -1) {
      champions.splice(idxInChampions, 1);
    }

    const li = sugg.querySelector(`li[data-name="${guessName}"]`);
    if (li && li.parentNode) {
      li.parentNode.removeChild(li);
    }
    if (!sugg.querySelector("li")) {
      sugg.classList.add("hidden");
    }

    try {
      const res = await fetch("/quote", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      appendGuess({
        guess: data.guessName,
        icon: data.icon,
        correct: data.correct,
      });

      successState(data, targetQuote);

      if (data.correct) {
        markNavComplete("quote");

        // Replace quote display to success container
        const displayContainer = document.querySelector(".quote-display-container");
        if (displayContainer) {
          const successContainer = createSuccessContainer(targetQuote);
          displayContainer.parentNode.replaceChild(successContainer, displayContainer);
        }
      }
    } catch (error) {
      console.error("Quote form submit failed:", error);
    }
  }

  function appendGuess(guess) {
    let container = document.getElementById("quote-guesses-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "quote-guesses-container";
      container.className = "mt-6 space-y-3";
      const header = document.createElement("div");
      header.className = "text-center text-[#f5f5f7] text-sm font-medium mb-4 quote-header";
      header.innerText = "Your Guesses";
      container.appendChild(header);
      document.querySelector("#quote .max-w-lg > div").appendChild(container);
    }

    const div = document.createElement("div");
    div.className = "quote-guess-container";
    div.style.opacity = "0";
    div.style.transform = "translateX(-20px) scale(0.95)";

    div.innerHTML = `
      <div class="flex flex-col items-center justify-center gap-0.5 bg-gradient-to-r from-[#1e1e2e] to-[#252540] rounded-xl p-3 quote-guess transition-all duration-300 hover:transform hover:scale-[1.02] ${
        guess.correct
          ? "border-2 border-[#20b2aa] shadow-[0_0_15px_rgba(32,178,170,0.4)] hover:shadow-[0_0_25px_rgba(32,178,170,0.6)]"
          : "border-2 border-[#ff6f61] shadow-[0_0_15px_rgba(255,111,97,0.4)] hover:shadow-[0_0_25px_rgba(255,111,97,0.6)]"
      }">
        <img loading="lazy" src="${guess.icon}" alt="${
      guess.guess
    } icon" class="w-14 h-14 rounded-xl transition-all duration-300 hover:scale-110 ${
      guess.correct ? "ring-2 ring-[#20b2aa]" : "ring-2 ring-[#ff6f61]"
    }"/>
        <p class="text-center font-semibold text-sm transition-all duration-300 ${
          guess.correct ? "text-[#20b2aa]" : "text-[#ff6f61]"
        }">${guess.guess}</p>
      </div>
    `;

    const headerEl = container.querySelector(".quote-header");
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

  function successState(data, targetQuote) {
    if (data.correct) {
      const guessCount = data.guessCount;

      championInput.style.transition = "all 0.3s ease";
      championInput.style.opacity = "0.5";
      championInput.disabled = true;

      setTimeout(() => {
        championInput.hidden = true;
      }, 300);

      championInput.value = "";

      const attempts = document.createElement("div");
      attempts.className = "mt-2 text-center text-emerald-300 font-bold";
      attempts.innerText = `Attempts: ${guessCount}`;
      attempts.style.opacity = "0";
      attempts.style.transform = "translateY(10px)";

      const banner = document.createElement("div");
      banner.className = "text-center text-emerald-300 font-bold";
      banner.innerText = `🎉 You guessed it! It was ${data.guessName}.`;
      banner.style.opacity = "0";
      banner.style.transform = "translateY(20px)";

      const guessesContainer = document.querySelector("#quote-guesses-container");
      if (guessesContainer) {
        guessesContainer.prepend(attempts);
        guessesContainer.prepend(banner);

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
        }, 300);
      }

      // Hide form
      if (inputForm) {
        inputForm.style.transition = "all 0.5s ease";
        inputForm.style.opacity = "0";
        inputForm.style.transform = "translateY(-20px)";
        setTimeout(() => {
          inputForm.remove();
        }, 500);
      }
    } else {
      championInput.value = "";
      championInput.focus();
    }
  }

  if (sugg) {
    sugg.addEventListener("mousedown", (e) => {
      const li = e.target.closest("li[data-name]");
      if (!li) return;
      e.preventDefault();
      championInput.value = li.dataset.name;
      sugg.classList.add("hidden");
      championInput.style.transform = "scale(0.98)";
      setTimeout(() => {
        championInput.style.transform = "";
        submitForm();
      }, 100);
    });
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
});
