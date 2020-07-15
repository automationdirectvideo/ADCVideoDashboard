function createGraph(graphId, data, layout, config, graphHeight, graphWidth,
  saveToSheets, automargin) {
  try {
    Plotly.newPlot(graphId, data, layout, config);
    if (saveToSheets == undefined || saveToSheets == true) {
      recordGraphData(graphId, data, layout, config, graphHeight, graphWidth,
        automargin);
    }
    recordGraphSize(graphId, graphHeight, graphWidth, automargin);
  } catch (err) {
    throw err;
  }
}

function recordGraphData(graphId, data, layout, config, graphHeight, graphWidth,
  automargin) {
  let totalNumGraphs = document.querySelectorAll('.graph-container').length;
  let graphData = lsGet("graphData");
  if (graphData) {
    if (!automargin) {
      automargin = "None";
    }
    graphData[graphId] = {
      "data": data,
      "layout": layout,
      "config": config,
      "graphHeight": graphHeight,
      "graphWidth": graphWidth,
      "automargin": automargin,
    };
    if (Object.keys(graphData).length == totalNumGraphs) {
      lsSet("graphData", graphData);
      if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        saveGraphDataToSheets();
      }
    } else {
      lsSet("graphData", graphData);
    }
  }
}

function recordGraphSize(graphId, graphHeight, graphWidth, automargin) {
  if (!lsGet("graphSizes")) {
    lsGet("graphSizes", {});
  }
  let graphSizes = lsGet("graphSizes");
  graphSizes[graphId] = {
    height: graphHeight,
    width: graphWidth
  };
  if (automargin) {
    graphSizes[graphId]["automargin"] = automargin;
  }
  lsSet("graphSizes", graphSizes);
}

// Empties graphData and graphSizes in local storage
function resetGraphData() {
  lsSet("graphData", {});
  lsSet("graphSizes", {});
}

function resizeGraphs() {
  const graphSizes = lsGet("graphSizes");
  const viewportHeight = document.documentElement.clientHeight;
  const viewportWidth = document.documentElement.clientWidth;
  for (const graphId in graphSizes) {
    if (graphSizes.hasOwnProperty(graphId)) {
      const graph = graphSizes[graphId];
      const height = graph.height * viewportHeight;
      const width = graph.width * viewportWidth;
      const update = {
        height: height,
        width: width
      };
      // console.log("Resizing graph: " + graphId);
      Plotly.relayout(graphId, update);
    }
  }
}

function displayGraphError(graphId, err) {
  if (err) {
    recordError(err, `Unable to display graph "${graphId}" - `);
  }
  let alert = `
    <div class="h-100 w-100 position-relative">
      <div class="alert alert-danger graph-error h3" role="alert">
        <i class="fas fa-exclamation-triangle"></i>
        Error loading graph
      </div>
    </div>
  `;
  const graph = document.getElementById(graphId);
  graph.innerHTML = alert;
}

function fixGraphMargins() {
  let graphSizes = lsGet("graphSizes");
  for (var graphId in graphSizes) {
    let automargin = graphSizes[graphId]["automargin"];
    if (automargin) {
      // console.log("Fixing margins for graph: " + graphId);
      Plotly.relayout(graphId, automargin);
    }
  }
}

function updateTheme(dashboardIndex) {
  try {
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
      var endDashboard =
        document.getElementsByClassName("carousel-item")[dashboardIndex];
      var body = document.getElementsByTagName("body")[0];
      if (endDashboard.getAttribute("theme") == "dark") {
        body.className = "dark";
        if (endDashboard.id == "platform") {
          document.getElementsByClassName("demographics-table")[0]
            .classList.add("table-dark");
        }
      } else {
        body.className = "";
      }
    }
  } catch (err) {
    console.error(err);
    recordError(err);
  }
}

function getDashboardGraphIds(dashboardId) {
  if (dashboardId == "categoryGraphs") {
    return currentSettings.categoryGraphs;
  }
  if (dashboardId == "videographerGraphs") {
    return currentSettings.videographerGraphs;
  }
  if (dashboardId == "contestGraphs") {
    return currentSettings.contestGraphs;
  }
  if (dashboardId.substr(0,14) == "contest-video-") {
    // Gets the number at the end of the dashboardId
    let dashboardNumber = /[^-]*$/.exec(dashboardId)[0];
    let graphIds = currentSettings.contestGraphs;
    let newGraphIds = {};
    for (const name in graphIds) {
      if (graphIds.hasOwnProperty(name)) {
        const graphId = graphIds[name];
        newGraphIds[name] = graphId.replace("#", dashboardNumber);
      }
    }
    return newGraphIds;
  }
  if (dashboardId.substr(0,10) == "top-video-") {
    // Gets the number at the end of the dashboardId
    let dashboardNumber = /[^-]*$/.exec(dashboardId)[0];
    let graphIds = currentSettings.topVideoGraphs;
    let newGraphIds = {};
    for (const name in graphIds) {
      if (graphIds.hasOwnProperty(name)) {
        const graphId = graphIds[name];
        newGraphIds[name] = graphId.replace("#", dashboardNumber);
      }
    }
    return newGraphIds;
  }
  const dashboards = currentSettings.dashboards;
  let index = 0;
  while (index < dashboards.length) {
    const dashboard = dashboards[index];
    if (dashboard.name == dashboardId) {
      return dashboard.graphIds;
    }
    index++;
  }
  return null;
}

function carouselNext() {
  $(".carousel-container.active > .carousel").carousel("next");
}

function carouselPrev() {
  $(".carousel-container.active > .carousel").carousel("prev");
}

function pauseDashboard() {
  let pauseText = document.getElementById("pause-text");
  let playText = document.getElementById("play-text");
  $(".dashboard-carousel").carousel('pause');
  pauseText.style.display = "initial";
  playText.style.display = "none";
  isPaused = true;
}

function playDashboard() {
  let pauseText = document.getElementById("pause-text");
  let playText = document.getElementById("play-text");
  $(".dashboard-carousel").carousel('cycle');
  pauseText.style.display = "none";
  playText.style.display = "initial";
  setTimeout(function () {
    if (playText.offsetHeight != 0) {
      $('#play-text').fadeOut();
    }
  }, 2000);
  isPaused = false;
}

function toggleDashboardPause() {
  if (isPaused) {
    playDashboard();
  } else {
    pauseDashboard();
  }
}

function temporarilyToggleDashboardPause(bool) {
  if (bool) {
    $(".dashboard-carousel").carousel('pause');
  } else if (!isPaused) {
    $(".dashboard-carousel").carousel('cycle');
  }
}

function goToCarouselItem(index) {
  $(".carousel-container.active > .carousel").carousel(index);
}

function hideMenu() {
  document.body.removeAttribute("menu");
  isMenuOpen = false;
}

function showMenu() {
  document.body.setAttribute("menu", "open");
  isMenuOpen = true;
}

function toggleMenuVisibility() {
  if (isMenuOpen) {
    hideMenu();
  } else {
    showMenu();
  }
}

function nextMenuItem() {
  switchMenuItem(1);
}

function prevMenuItem() {
  switchMenuItem(-1);
}

function switchMenuItem(direction) {
  let menuGroup = document.getElementById("menu-group");
  let numMenuItems = menuGroup.children.length;
  let activeMenuItem = document.activeElement;
  let activeNumber = parseInt(activeMenuItem.getAttribute("menu-index"));
  // When no menu item is focused, activeNumber is NaN
  if (isNaN(activeNumber)) {
    if (direction > 0) {
      activeNumber = -1;
    } else {
      activeNumber = 0;
    }
  }
  // Calculates the value of the next menu-item
  let next = activeNumber + direction;
  let nextActiveNumber = ((next % numMenuItems) + numMenuItems) % numMenuItems;
  let nextMenuItem =
    document.querySelector(`.menu-item[menu-index='${nextActiveNumber}']`);
  nextMenuItem.focus();
}

function selectMenuItem(number) {
  const menuItem = document.querySelector(`.menu-item.item-${number}`);
  if (menuItem) {
    menuItem.focus();
  }
}

function addDotsToLoadingText() {
  const loadingText = document.getElementById("loading-text");
  if (!loadingText.innerHTML.endsWith("...")) {
    loadingText.innerHTML += "...";
  }
}

function hideLoadingText() {
  const loadingText = document.getElementById("loading-text");
  loadingText.style.display = "none";
}

function showLoadingText() {
  const loadingText = document.getElementById("loading-text");
  loadingText.style.display = "initial";
}

function hideUpdatingText() {
  const updatingText = document.getElementById("updating-text");
  updatingText.style.display = "none";
}

function showUpdatingText() {
  const updatingText = document.getElementById("updating-text");
  updatingText.style.display = "initial";
}

function setLoadingStatus(bool) {
  isLoading = bool;
  temporarilyToggleDashboardPause();
}

function setUpdatingStatus(bool) {
  isUpdating = bool;
  temporarilyToggleDashboardPause();
}

function getCurrentSettings() {
  if (!lsGet("settings")) {
    lsSet("settings", defaultSettings);
  }
  window.currentSettings = lsGet("settings");
  const settingsVersion = currentSettings.version;
  const defaultVersion = defaultSettings.version;
  if (settingsVersion == undefined || defaultVersion > settingsVersion) {
    lsSet("settings", defaultSettings);
    window.currentSettings = defaultSettings;
  }
  window.cycleSpeed = currentSettings.cycleSpeed * 1000;
}

function createEventListeners() {
  // Handle carousel scrolling and keyboard shortcuts
  // NOTE: other keyboard shortcuts are implemented in the individual dashboard
  // files. These shortcuts apply to all dashboard pages
  document.addEventListener("keyup", function (e) {
    if (e.key.toUpperCase() == "M" &&
      gapi.auth2.getAuthInstance().isSignedIn.get()) {
      toggleMenuVisibility();
    }
    if (isMenuOpen) {
      // Keyboard shortcuts when the menu is open
      if (!isNaN(e.key) && e.which != 32) {
        selectMenuItem(e.key);
      } else if (e.key == "ArrowDown") {
        nextMenuItem();
      } else if (e.key == "ArrowUp") {
        prevMenuItem();
      } else if (e.key == "Escape") {
        hideMenu();
      }
    } else {
      // Normal keyboard shortcuts
      if (e.key == "ArrowLeft") {
        carouselPrev();
      } else if (e.key == "ArrowRight") {
        carouselNext();
      } else if (e.which == 32) {
        // Space Bar
        toggleDashboardPause();
      } else if (e.key == "F2") {
        signIn();
      } else if (e.key.toUpperCase() == "A") {
        goToCarouselItem(9);
      } else if (e.key.toUpperCase() == "B") {
        goToCarouselItem(10);
      } else if (e.key.toUpperCase() == "C") {
        goToCarouselItem(11);
      } else if (e.key.toUpperCase() == "D") {
        goToCarouselItem(12);
      } else if (e.key.toUpperCase() == "E") {
        goToCarouselItem(13);
      } else if (e.key.toUpperCase() == "F") {
        goToCarouselItem(14);
      } else if (!isNaN(e.key) && e.which != 32) {
        if (e.ctrlKey || e.altKey) {
          goToCarouselItem(parseInt(e.key) + 9);
        } else {
          goToCarouselItem(parseInt(e.key) - 1);
        }
      } else if (e.key.toUpperCase() == "U" && e.altKey &&
        gapi.auth2.getAuthInstance().isSignedIn.get()) {
        updateDashboards();
      } else if (e.key.toUpperCase() == "L" && e.altKey) {
        loadDashboards();
      }
    }
  });
  $(".carousel").on("slide.bs.carousel", function (e) {
    let carouselName = e.target.getAttribute("name");
    let indicatorName = carouselName + "-indicator-";
    let startIndicator = document.getElementById(indicatorName + e.from);
    let endIndicator = document.getElementById(indicatorName + e.to);
    startIndicator.classList.remove("active");
    endIndicator.classList.add("active");
  });
  $(".menu-item").on("mousemove", function () {
    document.activeElement.blur();
  })
  
  window.addEventListener('resize', function () {
    retry(resizeGraphs, 5, 5000);
  }, true);
}

getCurrentSettings();
initializeCarousels();
createEventListeners();

let isLoading = false;
let isMenuOpen = false;
let isPaused = false;
let isUpdating = false;