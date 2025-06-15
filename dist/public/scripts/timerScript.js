const timerData = JSON.parse(document.getElementById("timer-data").textContent);
let secondsUntilReset = timerData;

function updateTimer() {
  const hours = Math.floor(secondsUntilReset / 3600);
  const minutes = Math.floor((secondsUntilReset % 3600) / 60);
  const secs = secondsUntilReset % 60;
  document.getElementById("timer").textContent = `Next champion in ${hours}h ${minutes}m ${secs}s`;
  if (secondsUntilReset > 0) {
    secondsUntilReset--;
    setTimeout(updateTimer, 1000);
  }
}

updateTimer();
