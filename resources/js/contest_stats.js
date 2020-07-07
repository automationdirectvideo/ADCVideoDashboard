function loadSignedIn() {
  addDotsToLoadingText();
  const homeButton = document.getElementById("home-button");
  const controlPanelButton = document.getElementById("control-panel-button");
  homeButton.style.display = "inline";
  controlPanelButton.style.display = "inline";
  initializeUpdater();
  loadDashboards();
  updateTheme(0);
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
    } else {
      // TODO: update this logic
      loadDashboardsSignedOut();
    }
  }
}

function loadDashboardsSignedIn() {
  console.log("Starting Load Dashboards Requests");
  return loadContestDashboards()
    .then(response => {
      console.log("Load Dashboards Complete", response);
      setLoadingStatus(false);
      hideLoadingText();
    })
    .catch(err => {
      const errorMsg = "Error occurred loading dashboards: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
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
  const contestCarousel = document.getElementById("contest-carousel");
  contestCarousel.setAttribute("data-interval", cycleSpeed);
  contestCarousel.setAttribute("data-pause", "false");
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
    return updateVideoAndCategoryStats()
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

/**
 * Gets contest video information from the input Google Sheet
 *
 * @returns {Promise} The contest videos
 */
function getContestVideos() {
  return requestSpreadsheetData("Input Data", "Contest Videos")
    .then(sheetValues => {
      let contestVideos = {};
      let column = getColumnHeaders(sheetValues);
      for (let index = 1; index < sheetValues.length; index++) {
        const row = sheetValues[index];
        const videoId = row[column["Video ID"]];
        const exampleComment = row[column["Example Comment"]];
        const endDate = row[column["Contest End Date"]];
        const shortTitle = row[column["Short Video Title"]];
        const startDate = row[column["Contest Start Date"]];
        contestVideos[videoId] = {
          exampleComment: exampleComment,
          endDate: endDate,
          shortTitle: shortTitle,
          startDate: startDate
        }
      }
      return Promise.resolve(contestVideos);
    });
}

/**
 * Gets the contest videos and displays contest/giveaway statistics on the
 * contest dashboards
 *
 * @returns {Promise} Status message
 */
function loadContestDashboards() {
  return getContestVideos()
    .then(contestVideos => {
      createContestVideoDashboards(Object.keys(contestVideos).length);
      try {
        displayContestComparisonGraph(contestVideos);
      } catch (err) {
        const graphId = getDashboardGraphIds("contest-video-#").comparison;
        displayGraphError(graphId);
        recordError(err, "Unable to load contest comparison graph - ");
      }
      try {
        displayContestVideoStats(contestVideos);
      } catch (err) {
        // Displays graph errors for daily views graphs
        const graphId = getDashboardGraphIds("contest-video-#").dailyViews;
        const numVideos = Object.keys(contestVideos).length;
        for (let index = 0; index < numVideos; index++) {
          const newGraphId = graphId.replace("#", index);
          displayGraphError(newGraphId);
        }
        recordError(err, "Unable to load contest video stats dashboards - ");
      }
      return Promise.resolve("Displayed Contest Videos");
    })
    .catch(err => {
      // Displays graph errors for daily views graphs
      let graphIds = [];
      const comparisonId = getDashboardGraphIds("contest-video-#").comparison;
      graphIds.push(comparisonId);
      const viewsGraphId = getDashboardGraphIds("contest-video-#").dailyViews;
      if (typeof cotnestVideos != "undefined") {
        const numVideos = Object.keys(contestVideos).length;
        for (let index = 0; index < numVideos; index++) {
          const newGraphId = viewsGraphId.replace("#", index);
          graphIds.push(newGraphId);
        }
      }
      graphIds.forEach(graphId => {
        displayGraphError(graphId);
      });
      recordError(err, "Unable to load contest dashboards - ");
    });
}

/**
 * Adds the contest video dashboards to the contest carousel
 *
 * @param {Number} numDashboards The number of dashboards to create
 */
function createContestVideoDashboards(numDashboards) {
  if (document.getElementById("contest-video-#") != null) {
    const carouselInner = document.getElementById("contest-carousel-inner");
    const indicatorList = document.getElementById("contest-indicator-list");
    let carouselIndex = carouselInner.childElementCount;
    for (let contestIndex = 0; contestIndex < numDashboards; contestIndex++) {
      const dashboardId = `contest-video-${contestIndex}`;
  
      let dashboardItem =
        document.getElementById("contest-video-#").cloneNode(true);
      let dashboardText = dashboardItem.outerHTML;
      dashboardText = dashboardText.replace(/contest-video-#/g, dashboardId);
      let template = document.createElement("template");
      template.innerHTML = dashboardText;
      dashboardItem = template.content.firstChild;
  
      document.createElement("div", dashboardItem.outerText)
      dashboardItem.setAttribute("theme", "light");
      const indicator = document.getElementById("indicator").cloneNode(true);
      indicator.id = "contest-indicator-" + carouselIndex;
      indicator.setAttribute("onclick", `goToCarouselItem(${carouselIndex})`);
      indicator.setAttribute("data-target", "#contest-carousel");
      indicator.className = "fas fa-gift indicator";
      carouselInner.appendChild(dashboardItem);
      indicatorList.appendChild(indicator);
      carouselIndex++;
    }
    document.getElementById("contest-video-#").remove();
  }
}