const display = document.getElementById("display");
const keys = document.querySelectorAll(".key");
const themeToggle = document.getElementById("themeToggle");
const themeLabel = themeToggle.querySelector(".theme-toggle__label");
const themeIcon = themeToggle.querySelector(".theme-toggle__icon");

let expression = "";
let hasResult = false;

// Apply the selected theme and keep the toggle accessible as its state changes.
function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  themeLabel.textContent = isDark ? "Light" : "Dark";
  themeIcon.textContent = isDark ? "☀" : "◐";
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("calculator-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme || (prefersDark ? "dark" : "light"));
}

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("calculator-theme", nextTheme);
  applyTheme(nextTheme);
});

// Keep the display in sync with the expression currently being entered.
function updateDisplay(value = expression || "0") {
  display.textContent = value;
}

// Add a digit or operator to the expression, replacing a previous result when needed.
function addValue(value) {
  if (hasResult && /[0-9.]/.test(value)) {
    expression = "";
  }

  hasResult = false;
  expression += value;
  updateDisplay();
}

// Evaluate a complete expression after allowing only calculator characters.
function calculate() {
  if (!expression || !/[0-9]/.test(expression)) return;

  try {
    if (!/^[0-9+*/.\-\s]+$/.test(expression)) throw new Error("Invalid expression");
    const result = Function(`"use strict"; return (${expression})`)();

    if (!Number.isFinite(result)) throw new Error("Invalid result");
    expression = String(Number(result.toFixed(10)));
    hasResult = true;
    updateDisplay();
  } catch {
    expression = "";
    hasResult = true;
    updateDisplay("Error");
  }
}

// Reset both the expression and the visible result.
function clearCalculator() {
  expression = "";
  hasResult = false;
  updateDisplay();
}

function handleInput(value) {
  if (value === "clear") {
    clearCalculator();
  } else if (value === "calculate") {
    calculate();
  } else {
    addValue(value);
  }
}

keys.forEach((key) => {
  key.addEventListener("click", () => {
    handleInput(key.dataset.action || key.dataset.value);
  });
});

// Mirror the calculator buttons for quick keyboard entry.
document.addEventListener("keydown", (event) => {
  const key = event.key;
  if (/^[0-9.]$/.test(key) || ["+", "-", "*", "/"].includes(key)) {
    handleInput(key);
  } else if (key === "Enter" || key === "=") {
    handleInput("calculate");
  } else if (key === "Escape" || key === "Backspace") {
    event.preventDefault();
    if (key === "Escape") clearCalculator();
    else expression = expression.slice(0, -1) || "";
    updateDisplay();
  }
});

initializeTheme();