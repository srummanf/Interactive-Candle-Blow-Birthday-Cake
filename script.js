document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  const blowButton = document.getElementById("blowButton");
  const blowStatus = document.getElementById("blowStatus");

  let candles = [];
  let blowMode = false;
  let blowCount = 0;
  let lastX = null;
  let lastDir = null;
  let isOverCandle = false;

  function updateCandleCount() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;
    candleCountDisplay.textContent = activeCandles;

    if (candles.length > 0) {
      blowButton.style.display = "inline-block";
    }

    if (activeCandles === 0 && candles.length > 0) {
      blowStatus.textContent = "🎉 All candles blown out! Well done!";
      blowButton.textContent = "🎉 Start Blowing";
      blowButton.disabled = false;
      blowMode = false;
    }
  }

  function addCandle(left, top) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = left + "px";
    candle.style.top = top + "px";

    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);

    cake.appendChild(candle);
    candles.push(candle);
    updateCandleCount();
  }

  function isMouseOverCandle(e) {
    const cakeRect = cake.getBoundingClientRect();
    const mouseX = e.clientX - cakeRect.left;
    const mouseY = e.clientY - cakeRect.top;

    return candles.some((candle) => {
      if (candle.classList.contains("out")) return false;

      const candleRect = candle.getBoundingClientRect();
      const cakeRect = cake.getBoundingClientRect();
      const candleX = candleRect.left - cakeRect.left;
      const candleY = candleRect.top - cakeRect.top;

      // Check if mouse is within candle area (including flame)
      return (
        mouseX >= candleX - 10 &&
        mouseX <= candleX + 32 &&
        mouseY >= candleY - 40 &&
        mouseY <= candleY + 35
      );
    });
  }

  cake.addEventListener("click", function (event) {
    if (blowMode) return; // Don't add candles while blowing

    const rect = cake.getBoundingClientRect();
    const left = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    addCandle(left, top);
  });

  function handleBlowGesture(e) {
    if (!blowMode) return;

    const overCandle = isMouseOverCandle(e);

    if (!overCandle) {
      // Reset if not over candle
      lastX = null;
      lastDir = null;
      isOverCandle = false;
      return;
    }

    const threshold = 30; // pixels to count a "sway"
    if (lastX === null) {
      lastX = e.clientX;
      isOverCandle = true;
      return;
    }

    const deltaX = e.clientX - lastX;
    const dir = deltaX > 0 ? "right" : "left";

    if (Math.abs(deltaX) > threshold && dir !== lastDir) {
      blowCount++;
      lastDir = dir;
      lastX = e.clientX;

      console.log("Blow motion detected over candle!", blowCount);
      blowStatus.textContent = `💨 Blowing... (${blowCount}/3 swipes)`;

      if (blowCount >= 3) {
        document.removeEventListener("mousemove", handleBlowGesture);
        blowStatus.textContent = "💨 Whoosh! Candles blown out!";
        blowOutCandles();
        blowMode = false;
        blowButton.disabled = false;
      }
    }
  }

  function blowOutCandles() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    );
    activeCandles.forEach((candle, index) => {
      setTimeout(() => {
        candle.classList.add("out");
        updateCandleCount();
      }, index * 300); // nice sequential blow animation
    });
  }

  blowButton.addEventListener("click", () => {
    if (candles.filter((c) => !c.classList.contains("out")).length === 0) {
      blowStatus.textContent = "No candles to blow out!";
      return;
    }

    blowMode = true;
    blowCount = 0;
    lastX = null;
    lastDir = null;
    isOverCandle = false;
    blowButton.disabled = true;
    blowStatus.textContent =
      "💨 Move your mouse left ↔️ right over the candles to blow them out!";
    document.addEventListener("mousemove", handleBlowGesture);

    // Auto-disable after 15 seconds
    setTimeout(() => {
      if (blowMode) {
        document.removeEventListener("mousemove", handleBlowGesture);
        blowMode = false;
        blowButton.disabled = false;
        blowStatus.textContent = "⏱️ Time's up! Try again.";
      }
    }, 15000);
  });
});
