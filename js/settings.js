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
  localStorage.removeItem("graphSizes");
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
 * Records scroll speeds for dashboards to current settings
 */
function recordScrollSpeeds() {
  var dashboards = currentSettings.dashboards;
  for (var i = 0; i < dashboards.length; i++) {
    var dashboard = dashboards[i];
    if (dashboard.scrollSpeed != undefined) {
      scrollInput = document.getElementById(dashboard.name + "-scroll-input");
      currentSettings.dashboards[i].scrollSpeed = scrollInput.value;
    }
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
 * Duplicates the dashboard list item in settings.html for each dashboard
 */
function loadDashboardList() {
  for (let i = 0; i < currentSettings.dashboards.length; i++) {
    let dashboard = currentSettings.dashboards[i];
    let dashboardItem = document.getElementById("INSERT_ID").cloneNode(true);
    let dashboardText = dashboardItem.outerHTML;
    dashboardText = dashboardText.replace(/INSERT_ID/g, dashboard.name);
    dashboardText = dashboardText.replace(/TITLE PLACEHOLDER/, dashboard.title);
    var template = document.createElement("template");
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
for (var i = 0; i < currentSettings.dashboards.length; i++) {
  (function () {
    var dashboardName = currentSettings.dashboards[i].name;
    let dashboard = document.getElementById(dashboardName);
    let enableButton = document.getElementById(dashboardName + "-enable-btn");
    let disableButton = document.getElementById(dashboardName + "-disable-btn");
    let lightButton = document.getElementById(dashboardName + "-light-btn");
    let darkButton = document.getElementById(dashboardName + "-dark-btn");
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

// Toggle collapse/expand arrow buttons
$(".collapse").on('show.bs.collapse', function () {
  var id = this.id;
  var collapseId = this.id.substring(0, id.length - 4) + "collapse";
  var expandId = this.id.substring(0, id.length - 4) + "expand";
  var collapseButton = document.getElementById(collapseId);
  var expandButton = document.getElementById(expandId);
  expandButton.classList.add("d-none");
  collapseButton.classList.remove("d-none");
});
$(".collapse").on('hide.bs.collapse', function () {
  var id = this.id;
  var collapseId = this.id.substring(0, id.length - 4) + "collapse";
  var expandId = this.id.substring(0, id.length - 4) + "expand";
  var collapseButton = document.getElementById(collapseId);
  var expandButton = document.getElementById(expandId);
  collapseButton.classList.add("d-none");
  expandButton.classList.remove("d-none");
});