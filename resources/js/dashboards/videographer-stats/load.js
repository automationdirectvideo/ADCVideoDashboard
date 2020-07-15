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
  console.log("Starting Load Dashboards Requests");
  try {
    loadVideographerDashboards();
    console.log("Load Dashboards Complete");
  } catch (err) {
    const errorMsg = "Error occurred loading dashboards: ";
    console.error(errorMsg, err);
    recordError(err, errorMsg);
  } finally {
    setLoadingStatus(false);
    hideLoadingText();
  }
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
  const videographerCarousel = document.getElementById("videographer-carousel");
  videographerCarousel.setAttribute("data-ride", "carousel");
  videographerCarousel.setAttribute("data-interval", cycleSpeed);
  videographerCarousel.setAttribute("data-pause", "false");

  createVideographerStatsDashboards();
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
    let requests = [];
    requests.push(getVideographerViewsForCurrMonth());
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
      if (e.key.toUpperCase() == "V") {
        swapDashboardGraphs();
      }
    }
  });
}

function swapDashboardGraphs() {
  const activeDashboard =
    $(".carousel-container.active >>> .carousel-item.active")[0].id;
  let graphOne;
  let graphTwo;
  let graphThree;

  if (activeDashboard.indexOf("videographer") == 0) {
    let graphIds;
    if (activeDashboard == "videographer-avg-views") {
      graphIds = getDashboardGraphIds("videographerGraphs").avgViews;
    } else if (activeDashboard == "videographer-cumulative-videos") {
      graphIds = getDashboardGraphIds("videographerGraphs").cumulativeVideos;
    } else if (activeDashboard == "videographer-yearly-videos") {
      graphIds = getDashboardGraphIds("videographerGraphs").yearlyVideos;
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
    if (activeDashboard.indexOf("vstat") == 0) {
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

/**
 * Calculates videographer statistics and displays graphs on the videographer
 * dashboards
 */
function loadVideographerDashboards() {
  try {
    let videographers = calcVideographerStats();
    displayVideographerMonthlyVideos(videographers);

    const request1 = requestVideographerAvgViews(videographers,
      getDateFromDaysAgo(34), getDateFromDaysAgo(4))
      .then(videographers => {
        displayVideographerAvgViews(videographers);
      })
      .catch(err => {
        // Displays graph errors for average views graphs
        const graphIds = getDashboardGraphIds("videographerGraphs").avgViews;
        for (const key in graphIds) {
          if (graphIds.hasOwnProperty(key)) {
            const graphId = graphIds[key];
            displayGraphError(graphId);
          }
        }
        recordError(err,
          "Unable to display videographer average views graphs - ");
      });

    const request2 = getVideographerMonthlyViews(videographers)
      .then(updatedVideographers => {
        displayVideographerMonthlyViews(updatedVideographers);
      })
      .catch(err => {
        // Displays graph errors for monthly views graphs
        const graphIds = [
          getDashboardGraphIds("videographerGraphs").cumulativeViews,
          getDashboardGraphIds("videographerGraphs").monthlyViews
        ];
        graphIds.forEach(dashboard => {
          for (const key in dashboard) {
            if (dashboard.hasOwnProperty(key)) {
              const graphId = dashboard[key];
              displayGraphError(graphId);
            }
          }
        });
        recordError(err,
          "Unable to display videographer monthly views graphs - ");
      });
    const request3 = requestVideographerEngagementStats(videographers,
      getDateFromDaysAgo(34), getDateFromDaysAgo(4));
    const request4 = requestVideographerEngagementStats(videographers);
    
    Promise.all([request1, request2, request3, request4])
      .then(response => {
        displayVideographerStats();
        saveVideographerStatsToSheets();
      }) 
  } catch (err) {
    // Displays graph errors for all graphs in the videographer dashboards
    const graphIds = [
      getDashboardGraphIds("videographerGraphs").avgViews,
      getDashboardGraphIds("videographerGraphs").cumulativeVideos,
      getDashboardGraphIds("videographerGraphs").cumulativeViews,
      getDashboardGraphIds("videographerGraphs").yearlyVideos,
      getDashboardGraphIds("videographerGraphs").monthlyViews
    ];
    graphIds.forEach(dashboard => {
      for (const key in dashboard) {
        if (dashboard.hasOwnProperty(key)) {
          const graphId = dashboard[key];
          displayGraphError(graphId);
        }
      }
    });
    recordError(err, "Unable to load videographer dashboards");
  }
}

/**
 * Adds the videographer stats (vstats) dashboards to the videographer carousel
 */
function createVideographerStatsDashboards() {
  const carouselInner = document.getElementById("videographer-carousel-inner");
  const indicatorList = document.getElementById("videographer-indicator-list");
  const people = ["Shane C", "Rick F", "Tim W"];
  const categories = {
    "all": "All Videos",
    "organic": "Organic Videos",
    "notOrganic": "Not Organic Videos"
  };
  let index = carouselInner.childElementCount;
  people.forEach(name => {
    const dashboardId = "vstats-" + name.replace(" ", "*");
    const dashboardOverallId = "vstats-overall-" + name.replace(" ", "*");

    let dashboardItem = document.getElementById("vstats-#").cloneNode(true);
    let dashboardText = dashboardItem.outerHTML;
    let mainGrids = "";
    let overallGrids = "";
    for (const category in categories) {
      if (categories.hasOwnProperty(category)) {
        const categoryName = categories[category];
        // Create multiple grids. One for each category
        const gridItem =
          document.getElementById("vstats-#-@-grid").cloneNode(true);
        if (category == "all") {
          gridItem.classList.add("active-grid");
        }
        let gridText = gridItem.outerHTML;
        gridText = gridText.replace(/@/g, category);
        gridText = gridText.replace(/\*Name\*/g, name);
        gridText = gridText.replace(/\*Category\*/g, categoryName);
        mainGrids += gridText;

        const gridOverallItem =
          document.getElementById("vstats-overall-#-@-grid").cloneNode(true);
        let gridOverallText = gridOverallItem.outerHTML;
        gridOverallText = gridOverallText.replace(/@/g, category);
        gridOverallText = gridOverallText.replace(/\*Name\*/g, name);
        gridOverallText =
          gridOverallText.replace(/\*Category\*/g, categoryName);
        overallGrids += gridOverallText;
      }
    }
    dashboardText =
      dashboardText.replace(/<div>MAIN GRID PLACEHOLDER<\/div>/, mainGrids);
    dashboardText = dashboardText
      .replace(/<div>OVERALL GRID PLACEHOLDER<\/div>/, overallGrids);
    dashboardText = dashboardText.replace(/vstats-#/g, dashboardId);
    dashboardText =
      dashboardText.replace(/vstats-overall-#/g, dashboardOverallId);
    let template = document.createElement("template");
    template.innerHTML = dashboardText;
    dashboardItem = template.content.firstChild;

    document.createElement("div", dashboardItem.outerText)
    dashboardItem.setAttribute("theme", "light");
    const indicator = document.getElementById("indicator").cloneNode();
    indicator.id = "videographer-indicator-" + index;
    indicator.setAttribute("onclick", `goToCarouselItem(${index})`);
    indicator.setAttribute("data-target", "#videographer-carousel");
    indicator.className = "fas fa-play-circle indicator";
    carouselInner.appendChild(dashboardItem);
    indicatorList.appendChild(indicator);
    index++;
  });
}

/**
 * Gets monthly views by videographer from the stats Google Sheet and adds the
 * data to the videographer stats
 *
 * @returns Updated videographer statistics
 */
function getVideographerMonthlyViews() {
  return requestSpreadsheetData("Stats", "Videographer Monthly Views")
    .then(sheetData => {
      const column = getColumnHeaders(sheetData);
      let categoryData = {};
      sheetData[0].forEach(categoryName => {
        if (categoryName != "Month") {
          categoryData[categoryName] = {};
        }
      });
      for (let index = 1; index < sheetData.length; index++) {
        const monthData = sheetData[index];
        const month = monthData[column["Month"]];
        sheetData[0].forEach(categoryName => {
          if (categoryName != "Month") {
            categoryData[categoryName][month] =
              parseInt(monthData[column[categoryName]]);
          }
        });
      }
      let videographers = lsGet("videographers");
      for (const categoryName in categoryData) {
        if (categoryData.hasOwnProperty(categoryName)) {
          const monthlyViews = categoryData[categoryName];
          const split = categoryName.indexOf("-");
          const videographerName = categoryName.substring(0, split);
          const category = categoryName.substring(split + 1);
          videographers[videographerName][category].monthlyViews = monthlyViews;
        }
      }
      lsSet("videographers", videographers);
      return videographers;
    });
}