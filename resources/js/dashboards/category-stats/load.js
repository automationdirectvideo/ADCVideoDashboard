function loadSignedIn() {
  addDotsToLoadingText();
  const homeButton = document.getElementById("home-button");
  const controlPanelButton = document.getElementById("control-panel-button");
  const menuButtonContainer = document.getElementById("menu-button-container");
  homeButton.style.display = "inline";
  controlPanelButton.style.display = "inline";
  menuButtonContainer.style.display = "initial";
  initializeUpdater();
  loadDashboards();
  updateTheme(0);
  createShortcutListeners();
}

/**
 * Loads the page when the user is not signed into Google
 */
function loadSignedOut() {
  createSignInModal("dashboards");
  const authorizeButton = document.getElementById("authorize-button");
  authorizeButton.onclick = handleAuthClick;
  $('#signinModal').modal({
    backdrop: 'static',
    keyboard: false
  });
}

function loadDashboards() {
  // Prevents multiple simultaneous load/update dashboards calls
  if (!isLoading && !isUpdating) {
    setLoadingStatus(true);
    const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
    showLoadingText();
    resetGraphData();
    if (isSignedIn) {
      let categoryStats = lsGet("categoryStats");
      if (!categoryStats) {
        getBasicDashboardStats()
          .then(response => {
            loadDashboardsSignedIn();
          });
      } else {
        loadDashboardsSignedIn();
      }
    }
  }
}

function loadDashboardsSignedIn() {
  let requests = [];
  requests.push(loadProductCategoriesDashboard());
  requests.push(loadCategoryCharts());

  console.log("Starting Load Dashboards Requests");
  return Promise.all(requests)
    .then(response => {
      console.log("Load Dashboards Complete", response);
    })
    .catch(err => {
      const errorMsg = "Error occurred loading dashboards: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    })
    .finally(response => {
      setLoadingStatus(false);
      hideLoadingText();
    });
}

function initializeUpdater() {
  let midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();

  var updateId = window.setInterval(() => {
    const now = new Date();
    // updateCount calculates the seconds since midnight
    let updateCount = Math.floor((now - midnight) / 1000);
    if (isSignedIn) {
      if (updateCount == 3600) {
        recordUpdate("Reload Dashboards")
          .then(response => {
            window.location.reload();
          });
      } else if (updateCount % 900 == 0) {
        loadDashboards();
      }
    }
  }, 1000);
  return updateId;
}

function initializeCarousels() {
  const categoryStatsCarousel =
    document.getElementById("category-stats-carousel");
  categoryStatsCarousel.setAttribute("data-ride", "carousel");
  categoryStatsCarousel.setAttribute("data-interval", cycleSpeed);
  categoryStatsCarousel.setAttribute("data-pause", "false");
}

/**
 * Updates the data used in the dashboards then reloads the dashboards.
 * Data is taken from the input sheet and the YouTube APIs
 *
 * @returns {Promise} Status message
 */
function updateDashboards() {
  // Prevent multiple simultaneous load/update dashboard calls
  if (!isLoading && !isUpdating) {
    setUpdatingStatus(true);
    showUpdatingText();
    const now = new Date();
    let requests = [];
    // checks that today is between Jan 10-20 ish
    if (now.getMonth() == 0 && now.getDate() >= 10 &&
      now.getDate <= 20) {
      const lastYear = now.getFullYear() - 1;
      requests.push(getYearlyCategoryViews(lastYear));
    }
    requests.push(updateVideoAndCategoryStats());
    return Promise.all(requests)
      .then(response => {
        console.log("Update Dashboards Complete", response);
        recordUpdate("Dashboards Updated");
        hideUpdatingText();
        setUpdatingStatus(false);
        // Reload the dashboards with the new data
        return loadDashboards();
      })
      .catch(err => {
        recordUpdate("Update Failed");
        const errorMsg = "Error occurred updating dashboards: ";
        console.error(errorMsg, err);
        recordError(err, errorMsg);
      })
      .finally(response => {
        hideUpdatingText();
        setUpdatingStatus(false);
      });
  }
}

function createShortcutListeners() {
  document.addEventListener("keyup", function (e) {
    if (e.key.toUpperCase() == "H" && e.altKey &&
      gapi.auth2.getAuthInstance().isSignedIn.get()) {
      window.location = "index.html";
    } else if (!isMenuOpen) {
      if (e.key.toUpperCase() == "N" || e.key.toUpperCase() == "V") {
        swapNormalCharts();
      }
    }
  });
}

/**
 * Gets category views area chart data from the stats spreadsheet and displays
 * the graphs
 *
 * @returns {Promise} Status message
 */
function loadCategoryCharts() {
  return requestSpreadsheetData("Stats", "Category Views By Year")
    .then(sheetValues => {
      let categoryStats = lsGet("categoryStats");
      let categoryTraces = {};
      let years = [];
      for (var row = 1; row < sheetValues.length; row += 2) {
        let year = sheetValues[row][0].substr(0, 4);
        years.push(year);
      }
      categoryTraces["years"] = years;
      let yearlyTotals = new Array(years.length).fill(0);
      for (var column = 1; column < sheetValues[0].length; column++) {
        let categoryId = sheetValues[0][column];
        let categoryInfo = false;
        var index = 0;
        while (categoryInfo == false && index < categoryStats.length) {
          if (categoryStats[index]["categoryId"] == categoryId) {
            categoryInfo = categoryStats[index];
          }
          index++;
        }
        let root = categoryInfo["root"];
        if (root && categoryId != "A") {
          let viewTrace = [];
          let avgViewTrace = [];
          let cumulativeViews = [];
          let cumulativeAvgViewTrace = [];
          for (var row = 1; row < sheetValues.length; row += 2) {
            // Get views and numVideos for this year
            let yearViews = parseInt(sheetValues[row][column]);
            let numVideos = parseInt(sheetValues[row + 1][column]);
            viewTrace.push(yearViews);
            // Calculate cumulative views up to current year
            let previousSumViews = 0;
            if (row != 1) {
              previousSumViews = parseInt(cumulativeViews[((row - 1) / 2) - 1]);
            }
            let currentSumViews = previousSumViews + yearViews;
            cumulativeViews.push(currentSumViews);
            // Calculate average views for current year & cumulative average
            // view up to current year
            let avgView = 0;
            let cumulativeAvgView = 0;
            if (numVideos != 0) {
              avgView = (yearViews / numVideos).toFixed(0);
              cumulativeAvgView = (currentSumViews / numVideos).toFixed(0);
            }
            avgViewTrace.push(avgView);
            cumulativeAvgViewTrace.push(cumulativeAvgView);
            // Calculate yearly totals
            yearlyTotals[(row - 1) / 2] += parseInt(yearViews);
          }
          categoryTraces[categoryId] = {
            "name": categoryInfo["shortName"],
            "viewTrace": viewTrace,
            "avgViewTrace": avgViewTrace,
            "cumulativeViews": cumulativeViews,
            "cumulativeAvgViewTrace": cumulativeAvgViewTrace
          };
        }
      }
      categoryTraces["totals"] = yearlyTotals;
      return displayCategoryViewsAreaCharts(categoryTraces);
    })
    .catch(err => {
      recordError(err);
      const graphIds = getDashboardGraphIds("categoryGraphs");
      graphIds.forEach(graphId => {
        displayGraphError(graphId);
      });
    });
}

/**
 * Displays top categories graphs on the product categories dashboard
 *
 * @returns {Promise} Status message
 */
function loadProductCategoriesDashboard() {
  displayTopCategoriesGraphOne();
  displayTopCategoriesGraphTwo();
  displayTopCategoriesGraphThree();
  return Promise.resolve("Displayed Product Categories Dashboard");
}

function hideCategoryStrengthGraph() {
  document.getElementById("category-graph-container").style.display = "none";
}

function showCategoryStrengthGraph() {
  document.getElementById("category-graph-container").style.display = "";
  document.getElementById("popup-graph-loading").style.display = "";
  document.getElementById("category-strength-popup-graph").style.display =
    "none";
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