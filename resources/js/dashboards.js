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

function swapNormalCharts() {
  var activeDashboard =
    $(".carousel-container.active >>> .carousel-item.active")[0].id;
  var standardChartId = activeDashboard + "-chart";
  var standardChart = document.getElementById(standardChartId);
  if (standardChart) {
    if (standardChart.style.display == "none") {
      standardChart.style.display = "";
    } else {
      standardChart.style.display = "none";
    }
  }
}

function swapDashboardGraphs() {
  const activeDashboard =
    $(".carousel-container.active >>> .carousel-item.active")[0].id;
  let graphOne;
  let graphTwo;
  let graphThree;

  if (activeDashboard == "product-categories") {
    const graphIds = getDashboardGraphIds(activeDashboard);
    graphOne = document.getElementById(graphIds.graphOne);
    graphTwo = document.getElementById(graphIds.graphTwo);
    graphThree = document.getElementById(graphIds.graphThree);
  } else if (activeDashboard.indexOf("videographer") == 0) {
    let graphIds;
    if (activeDashboard == "videographer-avg-views") {
      graphIds = getDashboardGraphIds("videographerGraphs").avgViews;
    } else if (activeDashboard == "videographer-cumulative-videos") {
      graphIds = getDashboardGraphIds("videographerGraphs").cumulativeVideos;
    } else if (activeDashboard == "videographer-monthly-videos") {
      graphIds = getDashboardGraphIds("videographerGraphs").monthlyVideos;
    } else if (activeDashboard == "videographer-cumulative-views") {
      graphIds = getDashboardGraphIds("videographerGraphs").cumulativeViews;
    } else if (activeDashboard == "videographer-monthly-views") {
      graphIds = getDashboardGraphIds("videographerGraphs").monthlyViews;
    }
    graphOne = document.getElementById(graphIds.all);
    graphTwo = document.getElementById(graphIds.organic);
    graphThree = document.getElementById(graphIds.notOrganic);
  }
  if (graphOne && graphTwo && graphThree) {
    if (graphOne.style.display == "") {
      graphOne.style.display = "none";
      graphTwo.style.display = "";
      graphThree.style.display = "none";
    } else if (graphTwo.style.display == "") {
      graphOne.style.display = "none";
      graphTwo.style.display = "none";
      graphThree.style.display = "";
    } else if (graphThree.style.display == "") {
      graphOne.style.display = "";
      graphTwo.style.display = "none";
      graphThree.style.display = "none";
    }
  } else {
    const activeCarouselContainer = $(".carousel-container.active")[0].id;
    if (activeCarouselContainer == "category-stats-content") {
      swapNormalCharts();
    } else if (activeDashboard.indexOf("vstat") == 0) {
      // Handles switching grids for vstats dashboards
      const activeDashboardElem = document.getElementById(activeDashboard);
      const activeGrid = activeDashboardElem
        .querySelector(".vstats-grid-container.active-grid");
      let nextGrid = activeGrid.nextElementSibling;
      if (nextGrid == null) {
        const gridGroupContainer = activeGrid.parentElement;
        nextGrid = gridGroupContainer.firstElementChild;
      }
      activeGrid.classList.remove("active-grid");
      nextGrid.classList.add("active-grid");
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
  let playText = document.getElementById("play-text");
  $(".dashboard-carousel").carousel('cycle');
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
  document.addEventListener("keyup", function (e) {
    if (e.key == "ArrowLeft") {
      carouselPrev();
    } else if (e.key == "ArrowRight") {
      carouselNext();
    } else if (e.which == 32) {
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
    } else if (e.key.toUpperCase() == "N") {
      swapNormalCharts();
    } else if (e.key.toUpperCase() == "R") {
      reloadVideoStrengthDashboard();
    } else if (e.key.toUpperCase() == "V") {
      swapDashboardGraphs();
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
  });
  $(".carousel").on("slide.bs.carousel", function (e) {
    let carouselName = e.target.getAttribute("name");
    let indicatorName = carouselName + "-indicator-";
    let startIndicator = document.getElementById(indicatorName + e.from);
    let endIndicator = document.getElementById(indicatorName + e.to);
    startIndicator.classList.remove("active");
    endIndicator.classList.add("active");
  });
  
  window.addEventListener('resize', function () {
    retry(resizeGraphs, 5, 5000);
  }, true);
}

getCurrentSettings();

initializeCarousels();

createEventListeners();

let isLoading = false;
let isPaused = false;
let isUpdating = false;