/**
 * Resets the settings back to the default settings
 */
function resetSettings() {
  localStorage.setItem("settings", JSON.stringify(defaultSettings));
}

/**
 * Saves current settings to HTML local storage
 */
function saveNewSettings() {
  localStorage.setItem("settings", JSON.stringify(currentSettings));
}

/**
 * Records cycle speed to current settings
 *
 * @param {number} speed cycle speed in seconds
 */
function recordCycleSpeed(speed) {
  if (Number.isInteger(speed)) {
    if (speed < 0) {
      speed = 0;
    }
    currentSettings.cycleSpeed = speed;
  } else {
    console.error("Type Error: ", "Parameter speed is not an integer");
  }
}

/**
 * Records whether the footer is shown or hidden to current settings
 *
 * @param {string} display the display status of the footer
 */
function recordFooterDisplay(display) {
  if (display == "show" || display == "hide") {
    currentSettings.footer = display;
  } else {
    console.error("Type Error: ", "Parameter display is not a supported value");
  }
}

/**
 * Moves the dashboards in the startList to the bottom of the targetList
 *
 * @param {HTMLUListElement} startList starting unordered list of dashboards
 * @param {HTMLUListElement} targetList target unorderd list of dashboards
 */
function moveDashboards(startList, targetList) {
  while (startList.children.length > 0) {
    var dashboard = startList.children[0];
    dashboard.remove();
    targetList.appendChild(dashboard);
  }
}

/**
 * Sets the theme of all the dashboards to the parameter given
 *
 * @param {string} theme theme to change all the dashboards to
 */
function setAllDashboardThemes(theme) {
  if (supportedThemes.includes(theme)) {
    var dashboards = currentSettings.dashboards;
    for (var i = 0; i < dashboards.length; i++) {
      var badge = document.getElementById(dashboards[i].name + "-badge");
      badge.innerHTML = capitalizeFirstLetter(theme);
      badge.classList = "badge badge-pill badge-theme badge-" + theme;
      for (var j = 0; j < supportedThemes.length; j++) {
        var themeButton = document.getElementById(dashboards[i].name + "-" + 
            supportedThemes[j] + "-btn");
        if (supportedThemes[j] == theme) {
          themeButton.disabled = true;
        } else {
          themeButton.disabled = false;
        }
      }
    }
  } else {
    console.error("Type Error: ", "Parameter theme is not a supported value");
  }
}


/**
 * Records the order of enabled dashboards, which dashboards are disabled, and 
 * themes of all dashboards
 */
function recordDashboardOrderandThemes() {
  var enabledOrder = enabledSortable.toArray();
  var numEnabled = 0;
  for (var i = 0; i < currentSettings.dashboards.length; i++) {
    var dashboard = currentSettings.dashboards[i];
    // Order
    dashboard.index = enabledOrder.indexOf(dashboard.name);
    if (dashboard.index >= 0) {
      numEnabled++;
    }
    // Themes
    var badge = document.getElementById(dashboard.name + "-badge");
    dashboard.theme = badge.innerHTML.toLowerCase();
  }
  currentSettings.numEnabled = numEnabled;
}

/**
 * Hides footer and toggles display of show and hide footer buttons
 */
function hideFooter() {
  hideFooterButton.classList.add("d-none");
  showFooterButton.classList.remove("d-none");
  document.getElementsByTagName("footer")[0].classList.add("d-none");
}

/**
 * Shows footer and toggles display of show and hide footer buttons
 */
function showFooter() {
  showFooterButton.classList.add("d-none");
  hideFooterButton.classList.remove("d-none");
  document.getElementsByTagName("footer")[0].classList.remove("d-none");
}

/**
 * Reads the current settings and updates the page to match the current settings
 */
function loadSettings() {
  cycleSpeedInput.value = currentSettings.cycleSpeed;
  if (currentSettings.footer == "hide") {
    hideFooter();
  }
  var enabledOrder = new Array(currentSettings.numEnabled);
  var disabledOrder = new Array();
  for (var i = 0; i < currentSettings.dashboards.length; i++) {
    var dashboard = currentSettings.dashboards[i];
    if (dashboard.index >= 0) {
      enabledOrder.splice(dashboard.index, 1, dashboard.name);
    } else {
      disabledOrder.push(dashboard.name);
    }
    var badge = document.getElementById(dashboard.name + "-badge");
    badge.innerHTML = capitalizeFirstLetter(dashboard.theme);
    badge.classList.add("badge-" + dashboard.theme);
  }
  for (var i = 0; i < enabledOrder.length; i++) {
    var dashboardItem = document.getElementById(enabledOrder[i]);
    dashboardItem.remove();
    enabledDashboardsList.appendChild(dashboardItem);
  }
  for (var i = 0; i < disabledOrder.length; i++) {
    var dashboardItem = document.getElementById(disabledOrder[i]);
    dashboardItem.remove();
    disabledDashboardsList.appendChild(dashboardItem);
  }
  updateDashboardText();
}

/**
 * Displays text in the enabled and disabled dashboards list if they are empty
 */
function updateDashboardText() {
  if (disabledDashboardsList.children.length > 0) {
    document.getElementById("no-disabled-text").classList.add("d-none");
  } else {
    document.getElementById("no-disabled-text").classList.remove("d-none");
  }
  if (enabledDashboardsList.children.length > 0) {
    document.getElementById("no-enabled-text").classList.add("d-none");
  } else {
    document.getElementById("no-enabled-text").classList.remove("d-none");
  }
}

var currentSettings = JSON.parse(localStorage.getItem("settings"));
const supportedThemes = ["light", "dark"];

// Get buttons, input text, and dashboard lists
const cycleSpeedInput = document.getElementById("cycle-speed-input");
const allLightThemeButton = document.getElementById("all-light-btn");
const allDarkThemeButton = document.getElementById("all-dark-btn");
const enableAllButton = document.getElementById("enable-all-btn");
const disableAllButton = document.getElementById("disable-all-btn");
const showFooterButton = document.getElementById("show-footer-btn");
const hideFooterButton = document.getElementById("hide-footer-btn");
const resetButton = document.getElementById("confirm-reset-btn");
const saveButton = document.getElementById("save-btn");

var disabledDashboardsList = document.getElementById("disabledDashboards");
var enabledDashboardsList = document.getElementById("enabledDashboards");


// Create button press event listeners
allLightThemeButton.addEventListener("click", function () {
  setAllDashboardThemes("light");
});

allDarkThemeButton.addEventListener("click", function () {
  setAllDashboardThemes("dark");
});

enableAllButton.addEventListener("click", function () {
  moveDashboards(disabledDashboardsList, enabledDashboardsList);
  updateDashboardText();
});

disableAllButton.addEventListener("click", function () {
  moveDashboards(enabledDashboardsList, disabledDashboardsList);
  updateDashboardText();
});

showFooterButton.addEventListener("click", function () {
  recordFooterDisplay("show");
  showFooter();
});

hideFooterButton.addEventListener("click", function () {
  recordFooterDisplay("hide");
  hideFooter();
});

resetButton.addEventListener("click", function () {
  resetSettings();
  window.location = "index.html";
});

saveButton.addEventListener("click", function () {
  recordCycleSpeed(parseInt(cycleSpeedInput.value, 10));
  recordDashboardOrderandThemes();
  saveNewSettings();
  window.location = "index.html";
});

// Create button press event listeners for buttons in each dashboard
for (var i = 0; i < currentSettings.dashboards.length; i++) {
  (function () {
    var dashboardName = currentSettings.dashboards[i].name;
    let dashboard = document.getElementById(dashboardName);
    let enableButton = document.getElementById(dashboardName + "-enable-btn");
    let disableButton = document.getElementById(dashboardName + "-disable-btn");
    let lightButton = document.getElementById(dashboardName + "-light-btn");
    let darkButton = document.getElementById(dashboardName + "-dark-btn");
    enableButton.addEventListener("click", function () {
      enableButton.disabled = true;
      disableButton.disabled = false;
      dashboard.remove();
      enabledDashboardsList.appendChild(dashboard);
      updateDashboardText();
    });
    disableButton.addEventListener("click", function () {
      disableButton.disabled = true;
      enableButton.disabled = false;
      dashboard.remove();
      disabledDashboardsList.appendChild(dashboard);
      updateDashboardText();
    });
    lightButton.addEventListener("click", function () {
      lightButton.disabled = true;
      darkButton.disabled = false;
      let badge = document.getElementById(dashboardName + "-badge");
      badge.innerHTML = "Light";
      badge.className = "badge badge-pill badge-theme badge-light";
    });
    darkButton.addEventListener("click", function () {
      darkButton.disabled = true;
      lightButton.disabled = false;
      let badge = document.getElementById(dashboardName + "-badge");
      badge.innerHTML = "Dark";
      badge.className = "badge badge-pill badge-theme badge-dark";
    });
  }());
}


// Displays & loads current settings
console.log("Current Settings: ", currentSettings);
loadSettings();

// Create sortable lists
var enabledSortable = Sortable.create(enabledDashboards, {
  animation: 150,
  ghostClass: 'grey-background',
  group: "dashboards",
  handle: ".drag-handle",
  onAdd: function (e) {
    var enableButton = document.getElementById(e.item.id + "-enable-btn");
    var disableButton = document.getElementById(e.item.id + "-disable-btn");
    enableButton.disabled = true;
    disableButton.disabled = false;
  },
  onChange: function () {
    updateDashboardText();
  }
});

var disabledSortable = Sortable.create(disabledDashboards, {
  animation: 150,
  ghostClass: 'grey-background',
  group: "dashboards",
  handle: ".drag-handle",
  onAdd: function (e) {
    var enableButton = document.getElementById(e.item.id + "-enable-btn");
    var disableButton = document.getElementById(e.item.id + "-disable-btn");
    enableButton.disabled = false;
    disableButton.disabled = true;
  },
  onChange: function () {
    updateDashboardText();
  }
});