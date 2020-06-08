/**
 * @fileoverview Functions and event listeners for the settings page.
 */

/**
 * Resets the settings back to the default settings
 */
function resetSettings() {
  lsSet("settings", defaultSettings);
}

/**
 * Saves current settings selected by user
 */
function saveNewSettings() {
  lsSet("settings", currentSettings);
}

/**
 * Records cycle speed to current settings
 *
 * @param {Number} speed The cycle speed in seconds
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
 * Records scroll speeds for dashboards to current settings
 */
function recordScrollSpeeds() {
  const dashboards = currentSettings.dashboards;
  for (let i = 0; i < dashboards.length; i++) {
    const dashboard = dashboards[i];
    if (dashboard.scrollSpeed != undefined) {
      scrollInput = document.getElementById(dashboard.name + "-scroll-input");
      currentSettings.dashboards[i].scrollSpeed = scrollInput.value;
    }
  }
}

/**
 * Moves the dashboards in the startList to the bottom of the targetList
 *
 * @param {HTMLUListElement} startList The starting unordered list of dashboards
 * @param {HTMLUListElement} targetList The target unordered list of dashboards
 */
function moveDashboards(startList, targetList) {
  while (startList.children.length > 0) {
    const dashboard = startList.children[0];
    dashboard.remove();
    targetList.appendChild(dashboard);
  }
}

/**
 * Sets the theme of all the dashboards to the parameter given
 *
 * @param {String} theme The theme to change all the dashboards to
 */
function setAllDashboardThemes(theme) {
  if (supportedThemes.includes(theme)) {
    const dashboards = currentSettings.dashboards;
    for (let i = 0; i < dashboards.length; i++) {
      const badge = document.getElementById(dashboards[i].name + "-badge");
      badge.innerHTML = capitalizeFirstLetter(theme);
      badge.classList = "badge badge-pill badge-theme badge-" + theme;
      for (let j = 0; j < supportedThemes.length; j++) {
        const themeButton = document.getElementById(dashboards[i].name + "-" +
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
  const enabledOrder = enabledSortable.toArray();
  let numEnabled = 0;
  for (let i = 0; i < currentSettings.dashboards.length; i++) {
    let dashboard = currentSettings.dashboards[i];
    // Order
    dashboard.index = enabledOrder.indexOf(dashboard.name);
    if (dashboard.index >= 0) {
      numEnabled++;
    }
    // Themes
    const badge = document.getElementById(dashboard.name + "-badge");
    dashboard.theme = badge.innerHTML.toLowerCase();
  }
  currentSettings.numEnabled = numEnabled;
}

/**
 * Duplicates the dashboard list item in settings.html for each dashboard
 */
function loadDashboardList() {
  for (let i = 0; i < currentSettings.dashboards.length; i++) {
    const dashboard = currentSettings.dashboards[i];
    let dashboardItem = document.getElementById("INSERT_ID").cloneNode(true);
    let dashboardText = dashboardItem.outerHTML;
    dashboardText = dashboardText.replace(/INSERT_ID/g, dashboard.name);
    dashboardText = dashboardText.replace(/TITLE PLACEHOLDER/, dashboard.title);
    const template = document.createElement("template");
    template.innerHTML = dashboardText;
    dashboardItem = template.content.firstChild;
    enabledDashboardsList.appendChild(dashboardItem);
    if (dashboard.scrollSpeed != undefined) {
      document.getElementById(dashboard.name + "-scroll-row").classList
        .remove("d-none");
      document.getElementById(dashboard.name + "-scroll-input")
        .setAttribute("value", dashboard.scrollSpeed);
    }
  }
}

/**
 * Reads the current settings and updates the page to match the current settings
 */
function loadSettings() {
  cycleSpeedInput.value = currentSettings.cycleSpeed;
  let enabledOrder = new Array(currentSettings.numEnabled);
  let disabledOrder = new Array();
  for (let i = 0; i < currentSettings.dashboards.length; i++) {
    const dashboard = currentSettings.dashboards[i];
    if (dashboard.index >= 0) {
      enabledOrder.splice(dashboard.index, 1, dashboard.name);
    } else {
      disabledOrder.push(dashboard.name);
    }
    const badge = document.getElementById(dashboard.name + "-badge");
    badge.innerHTML = capitalizeFirstLetter(dashboard.theme);
    badge.classList.add("badge-" + dashboard.theme);
  }
  for (let i = 0; i < enabledOrder.length; i++) {
    const dashboardItem = document.getElementById(enabledOrder[i]);
    dashboardItem.remove();
    enabledDashboardsList.appendChild(dashboardItem);
  }
  for (let i = 0; i < disabledOrder.length; i++) {
    const dashboardItem = document.getElementById(disabledOrder[i]);
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

let currentSettings = lsGet("settings");
const supportedThemes = ["light", "dark"];

// Get buttons, input text, and dashboard lists
const cycleSpeedInput = document.getElementById("cycle-speed-input");
const allLightThemeButton = document.getElementById("all-light-btn");
const allDarkThemeButton = document.getElementById("all-dark-btn");
const enableAllButton = document.getElementById("enable-all-btn");
const disableAllButton = document.getElementById("disable-all-btn");
const resetButton = document.getElementById("confirm-reset-btn");
const saveButton = document.getElementById("save-btn");

let disabledDashboardsList = document.getElementById("disabledDashboards");
let enabledDashboardsList = document.getElementById("enabledDashboards");


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

resetButton.addEventListener("click", function () {
  resetSettings();
  window.location = "index.html";
});

saveButton.addEventListener("click", function () {
  recordCycleSpeed(parseInt(cycleSpeedInput.value, 10));
  recordScrollSpeeds();
  recordDashboardOrderandThemes();
  saveNewSettings();
  window.location = "index.html";
});

loadDashboardList();

// Create button press event listeners for buttons in each dashboard
for (let i = 0; i < currentSettings.dashboards.length; i++) {
  (function () {
    const dashboardName = currentSettings.dashboards[i].name;
    const dashboard = document.getElementById(dashboardName);
    const enableButton = document.getElementById(dashboardName + "-enable-btn");
    const disableButton = document.getElementById(dashboardName + "-disable-btn");
    const lightButton = document.getElementById(dashboardName + "-light-btn");
    const darkButton = document.getElementById(dashboardName + "-dark-btn");
    if (currentSettings.dashboards[i].theme == "light") {
      lightButton.disabled = true;
      darkButton.disabled = false;
    } else {
      darkButton.disabled = true;
      lightButton.disabled = false;
    }
    if (currentSettings.dashboards[i].index == -1) {
      disableButton.disabled = true;
      enableButton.disabled = false;
    } else {
      enableButton.disabled = true;
      disableButton.disabled = false;
    }
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
      const badge = document.getElementById(dashboardName + "-badge");
      badge.innerHTML = "Light";
      badge.className = "badge badge-pill badge-theme badge-light";
    });
    darkButton.addEventListener("click", function () {
      darkButton.disabled = true;
      lightButton.disabled = false;
      const badge = document.getElementById(dashboardName + "-badge");
      badge.innerHTML = "Dark";
      badge.className = "badge badge-pill badge-theme badge-dark";
    });
  }());
}


// Displays & loads current settings
console.log("Current Settings: ", currentSettings);
loadSettings();

// Create sortable lists
let enabledSortable = Sortable.create(enabledDashboards, {
  animation: 150,
  ghostClass: 'grey-background',
  group: "dashboards",
  handle: ".drag-handle",
  onAdd: function (e) {
    const enableButton = document.getElementById(e.item.id + "-enable-btn");
    const disableButton = document.getElementById(e.item.id + "-disable-btn");
    enableButton.disabled = true;
    disableButton.disabled = false;
  },
  onChange: function () {
    updateDashboardText();
  }
});

let disabledSortable = Sortable.create(disabledDashboards, {
  animation: 150,
  ghostClass: 'grey-background',
  group: "dashboards",
  handle: ".drag-handle",
  onAdd: function (e) {
    const enableButton = document.getElementById(e.item.id + "-enable-btn");
    const disableButton = document.getElementById(e.item.id + "-disable-btn");
    enableButton.disabled = false;
    disableButton.disabled = true;
  },
  onChange: function () {
    updateDashboardText();
  }
});

// Toggle collapse/expand arrow buttons
$(".collapse").on('show.bs.collapse', function () {
  const id = this.id;
  const collapseId = this.id.substring(0, id.length - 4) + "collapse";
  const expandId = this.id.substring(0, id.length - 4) + "expand";
  const collapseButton = document.getElementById(collapseId);
  const expandButton = document.getElementById(expandId);
  expandButton.classList.add("d-none");
  collapseButton.classList.remove("d-none");
});
$(".collapse").on('hide.bs.collapse', function () {
  const id = this.id;
  const collapseId = this.id.substring(0, id.length - 4) + "collapse";
  const expandId = this.id.substring(0, id.length - 4) + "expand";
  const collapseButton = document.getElementById(collapseId);
  const expandButton = document.getElementById(expandId);
  collapseButton.classList.add("d-none");
  expandButton.classList.remove("d-none");
});