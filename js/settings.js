const supportedThemes = ["light", "dark"];

// Get buttons & textbox
const cycleSpeedInput = document.getElementById("cycle-speed-input");
const allLightThemeButton = document.getElementById("all-light-btn");
const allDarkThemeButton = document.getElementById("all-dark-btn");
const enableAllButton = document.getElementById("enable-all-btn");
const disableAllButton = document.getElementById("disable-all-btn");
const showFooterButton = document.getElementById("show-footer-btn");
const hideFooterButton = document.getElementById("hide-footer-btn");
const resetButton = document.getElementById("confirm-reset-btn");
const saveButton = document.getElementById("save-btn");


// Create button press event listeners
allLightThemeButton.addEventListener("click", function() {
  setAllDashboardThemes("light");
});

allDarkThemeButton.addEventListener("click", function() {
  setAllDashboardThemes("dark");
});

enableAllButton.addEventListener("click", function() {
  //
});

disableAllButton.addEventListener("click", function() {
  //
});

showFooterButton.addEventListener("click", function() {
  setFooterDisplay("show");
  showFooterButton.classList.add("d-none");
  hideFooterButton.classList.remove("d-none");
  document.getElementsByTagName("footer")[0].classList.remove("d-none");
});

hideFooterButton.addEventListener("click", function() {
  setFooterDisplay("hide");
  hideFooter();
});

resetButton.addEventListener("click", function() {
  resetSettings();
});

saveButton.addEventListener("click", function() {
  setCycleSpeed(parseInt(cycleSpeedInput.value, 10));
  // Get order of dashboards
  saveNewSettings();
  window.location = "index.html";
});


// Displays current settings
console.log("Cycle Speed: ", currentSettings.cycleSpeed);
console.log("Footer: ", currentSettings.footer);
for (var i = 0; i < currentSettings.dashboards.length; i++) {
  const dashboard = currentSettings.dashboards[i];
  console.log("Dashboard Name: " + dashboard.name + "\n\tIndex: " + dashboard.index + "\n\tTheme: " + dashboard.theme);
}
console.log("Current Settings: ", currentSettings);
console.log("Current Settings (String): ", JSON.stringify(currentSettings));



// Tests
console.log("Window Location: ", window.location.pathname);
loadSettings();


function resetSettings() {
  localStorage.setItem("settings", JSON.stringify(defaultSettings));
}

function saveNewSettings() {
  localStorage.setItem("settings", JSON.stringify(currentSettings));
}

function setCycleSpeed(speed) {
  if (Number.isInteger(speed)) {
    currentSettings.cycleSpeed = speed;
  } else {
    console.error("Type Error: ", "Parameter speed is not an integer");
  }
}

function setFooterDisplay(display) {
  if (display == "show" || display == "hide") {
    currentSettings.footer = display;
  } else {
    console.error("Type Error: ", "Parameter display is not a supported value");
  }
}

function setDashboardTheme(name, theme) {
  if (supportedThemes.includes(theme)) {
    var dashboards = currentSettings.dashboards;
    var i = 0;
    var dashboardFound
    while (i < dashboards.length && !dashboardFound) {
      if (dashboards[i].name == name) {
        dashboards[i].theme = theme;
        dashboardFound = true;
      }
      i++;
    }
    if (!dashboardFound) {
      console.error("Range Error: ",
          "No such dashboard found with name " + name);
    }
  } else {
    console.error("Type Error: ", "Parameter theme is not a supported value");
  }
}

function setAllDashboardThemes(theme) {
  if (supportedThemes.includes(theme)) {
    var dashboards = currentSettings.dashboards;
    for (var i = 0; i < dashboards.length; i++) {
        dashboards[i].theme = theme;
    }
  } else {
    console.error("Type Error: ", "Parameter theme is not a supported value");
  }
}

function hideFooter() {
  hideFooterButton.classList.add("d-none");
  showFooterButton.classList.remove("d-none");
  document.getElementsByTagName("footer")[0].classList.add("d-none");
}

function loadSettings() {
  cycleSpeedInput.value = currentSettings.cycleSpeed;
  if (currentSettings.footer == "hide") {
    hideFooter();
  }
}