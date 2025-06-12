document.addEventListener("DOMContentLoaded", () => {
  const emojiData = JSON.parse(document.getElementById("emoji-data").textContent);
  const champions = emojiData.champions || [];
  const inputForm = document.getElementById("emoji-form");
  const championInput = document.getElementById("champion-input");
  const sugg = document.getElementById("suggestions");
  const allEmojisContainer = document.getElementById("all-emojis-container");
  const targetName = emojiData.targetName;
  let emojisToShow = emojiData.displayedEmojis;
  const totalEmojis = emojiData.totalEmojis;

  showNextEmoji(emojisToShow);

  champions.forEach((c) => {
    const img = new Image();
    img.src = c.icon;
  });

  if (inputForm) {
    inputForm.addEventListener("submit", async (e) => {
      e.preventDefault();
    });
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

  function showNextEmoji(count) {
    if (allEmojisContainer) {
      const containers = allEmojisContainer.querySelectorAll(".emoji-container");
      containers.forEach((container, idx) => {
        const emoji = container.querySelector(".emoji-revealed");
        const hidden = container.querySelector(".emoji-hidden");
        if (idx < count) {
          if (emoji.style.display === "none") {
            emoji.style.display = "";
            emoji.style.opacity = "0";
            emoji.style.transform = "scale(0.3) rotate(-180deg)";

            setTimeout(() => {
              emoji.style.transition = "all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
              emoji.style.opacity = "1";
              emoji.style.transform = "scale(1) rotate(0deg)";
            }, 50);
          }
          hidden.style.display = "none";
        } else {
          emoji.style.display = "none";
          hidden.style.display = "";
        }
      });
      // Update progress text
      const progress = document.getElementById("emoji-progress");
      if (progress) {
        progress.style.transition = "all 0.3s ease";
        progress.style.transform = "scale(1.05)";
        progress.textContent = `${Math.min(count, totalEmojis)} of ${totalEmojis} emojis revealed`;
        setTimeout(() => {
          progress.style.transform = "scale(1)";
        }, 300);
      }
    }
  }

  function showAllEmojis() {
    if (allEmojisContainer) {
      const containers = allEmojisContainer.querySelectorAll(".emoji-container");
      const progress = document.getElementById("emoji-progress");

      if (progress) {
        progress.style.transition = "all 0.3s ease";
        progress.style.opacity = "0";
        setTimeout(() => {
          progress.style.display = "none";
        }, 300);
      }

      if (inputForm) {
        inputForm.style.transition = "all 0.5s ease";
        inputForm.style.opacity = "0";
        inputForm.style.transform = "translateY(-20px)";
        setTimeout(() => {
          inputForm.remove();
        }, 500);
      }

      containers.forEach((container, idx) => {
        const emoji = container.querySelector(".emoji-revealed");
        const hidden = container.querySelector(".emoji-hidden");

        emoji.style.display = "";
        hidden.style.display = "none";

        setTimeout(() => {
          emoji.style.animation = `emojiCelebration 1s ease-in-out infinite alternate`;
          emoji.style.animationDelay = `${idx * 0.1}s`;
        }, idx * 100);
      });
    }
  }

  function createSuccessContainer() {
    const container = document.createElement("div");
    container.className =
      "emoji-success-container text-center text-[#f5f5f7] bg-gradient-to-br from-[#1e1e2e] to-[#2a2a3e] rounded-xl p-6 border-2 border-[#20b2aa] mb-4 relative overflow-hidden shadow-[0_0_25px_rgba(32,178,170,0.3)]";
    container.style.opacity = "0";
    container.style.transform = "translateY(20px) scale(0.95)";

    // Get target emojis
    const existingEmojis = Array.from(allEmojisContainer.querySelectorAll(".emoji-revealed")).map((el) =>
      el.textContent.trim()
    );

    container.innerHTML = `
      <div class="absolute inset-0 bg-gradient-to-r from-[#20b2aa]/10 via-transparent to-[#20b2aa]/10"></div>
      <div class="relative z-10">
        <div class="flex flex-wrap justify-center items-center gap-4 min-h-[100px]">
          ${existingEmojis
            .map(
              (emoji, index) => `
            <span class="text-6xl transition-all duration-300 transform hover:scale-110 cursor-default animate-bounce" style="animation-delay: ${
              index * 0.1
            }s;">
              ${emoji}
            </span>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    // Trigger animation
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
      <li
        class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#4b6bac]/30 transition-all duration-200 rounded-lg"
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
      const res = await fetch("/emoji", {
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

      // Reveal next emoji
      emojisToShow++;
      showNextEmoji(emojisToShow);
      successState(data);

      if (data.correct) {
        // Mark nav
        markNavComplete("emoji");

        // Replace emoji display to success container
        const displayContainer = document.querySelector(".emoji-display-container");
        if (displayContainer) {
          const successContainer = createSuccessContainer();
          displayContainer.parentNode.replaceChild(successContainer, displayContainer);
        }

        showAllEmojis();
      }
    } catch (error) {
      console.error("Emoji form submit failed:", error);
    }
  }

  function appendGuess(guess) {
    let container = document.getElementById("emoji-guesses-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "emoji-guesses-container";
      container.className = "mt-6 space-y-3";
      const header = document.createElement("div");
      header.className = "text-center text-[#f5f5f7] text-sm font-medium mb-4 emoji-header";
      header.innerText = "Your Guesses";
      container.appendChild(header);
      document.querySelector("#emoji .max-w-lg > div").appendChild(container);
    }

    const div = document.createElement("div");
    div.className = "emoji-guess-container";
    div.style.opacity = "0";
    div.style.transform = "translateX(-20px) scale(0.95)";

    div.innerHTML = `
      <div class="flex flex-col items-center justify-center gap-0.5 bg-gradient-to-r from-[#1e1e2e] to-[#252540] rounded-xl p-3 emoji-guess transition-all duration-300 hover:transform hover:scale-[1.02] ${
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

    const headerEl = container.querySelector(".emoji-header");
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
      const guessCount = data.guessCount;

      championInput.disabled = true;
      championInput.hidden = true;
      championInput.value = "";

      const attempts = document.createElement("div");
      attempts.className = "mt-2 text-center text-emerald-300 font-bold";
      attempts.innerText = `Attempts: ${guessCount}`;
      attempts.style.opacity = "0";
      attempts.style.transform = "translateY(10px)";

      const banner = document.createElement("div");
      banner.className = "mb-0 text-center text-emerald-300 font-bold";
      banner.innerText = `🎉 You guessed it! It was ${data.guessName}.`;
      banner.style.opacity = "0";
      banner.style.transform = "translateY(20px)";

      const guessesContainer = document.getElementById("emoji-guesses-container");
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
    } else {
      championInput.value = "";
      championInput.focus();
    }
  }

  function submitGuess() {
    if (!championInput.value.trim()) return;

    championInput.style.transform = "scale(0.98)";
    setTimeout(() => {
      championInput.style.transform = "scale(1)";
      submitForm();
    }, 100);
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
