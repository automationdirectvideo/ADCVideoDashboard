/* Load and display dashboards */

function loadSignedIn() {
  addDotsToLoadingText();
  const signinModalButton = document.getElementById("signin-modal-button");
  const signoutModalButton = document.getElementById("signout-modal-button");
  const controlPanelButton = document.getElementById("control-panel-button");
  const menuButtonContainer = document.getElementById("menu-button-container");
  signinModalButton.style.display = "none";
  signoutModalButton.style.display = "inline";
  controlPanelButton.style.display = "inline";
  menuButtonContainer.style.display = "initial";
  initializeUpdater();
  loadDashboards();
  updateTheme(0);
  createShortcutListeners();
}

function loadSignedOut() {
  addDotsToLoadingText();
  const signinModalButton = document.getElementById("signin-modal-button");
  const signoutModalButton = document.getElementById("signout-modal-button");
  const controlPanelButton = document.getElementById("control-panel-button");
  signinModalButton.style.display = "inline";
  signoutModalButton.style.display = "none";
  controlPanelButton.style.display = "none";
  initializeUpdater();
  loadDashboards();
  updateTheme(0);
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
      let realTimeStats = lsGet("realTimeStats");
      if (!categoryStats || !realTimeStats) {
        Promise.all([getBasicDashboardStats(), realTimeStatsCalls()])
          .then(response => {
            loadDashboardsSignedIn();
          });
      } else {
        loadDashboardsSignedIn();
      }
    } else {
      loadDashboardsSignedOut();
    }
  }
}

function loadDashboardsSignedIn() {
  const carouselInner = document.getElementsByClassName("carousel-inner")[0];
  let requests = [];
  if (carouselInner.children["intro-animation"]) {
    loadIntroAnimation();
  }
  if (carouselInner.children["video-strength"]) {
    loadVideoStrengthDashboard();
  }
  if (carouselInner.children["real-time-stats"]) {
    requests.push(loadRealTimeStatsDashboard());
  }
  if (carouselInner.children["thumbnails"]) {
    requests.push(loadThumbnailDashboard());
  }
  if (carouselInner.children["platform"]) {
    requests.push(loadPlatformDashboard());
  }
  if (carouselInner.children["top-ten"]) {
    requests.push(loadTopTenDashboard());
  }
  if (carouselInner.children["feedback"]) {
    requests.push(loadUserFeedbackDashboard());
  }
  if (carouselInner.children["card-performance"]) {
    requests.push(loadCardPerformanceDashboard());
  }
  if (carouselInner.children["product-categories"]) {
    requests.push(displayTopCategoriesGraphOne());
  }
  requests.push(loadTopVideoDashboards());

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

function loadDashboardsSignedOut() {
  const carouselInner = document.getElementsByClassName("carousel-inner")[0];
  let requests = [];
  if (carouselInner.children["intro-animation"]) {
    loadIntroAnimation();
  }
  return getVideoStats()
    .then(response => {
      if (carouselInner.children["video-strength"]) {
        loadVideoStrengthDashboard();
      }
      if (carouselInner.children["real-time-stats"]) {
        requests.push(loadRealTimeStatsDashboard());
      }
      if (carouselInner.children["thumbnails"]) {
        requests.push(loadThumbnailDashboard());
      }
      if (carouselInner.children["platform"]) {
        requests.push(loadChannelDemographics());
      }
      if (carouselInner.children["top-ten"]) {
        requests.push(loadTopTenDashboard());
      }
      if (carouselInner.children["feedback"]) {
        requests.push(loadUserFeedbackDashboard());
      }
      if (carouselInner.children["card-performance"]) {
        requests.push(loadCardPerformanceDashboard());
      }
      requests.push(loadGraphsFromSheets());
      requests.push(loadTopVideoStats());
    
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
      } else if (updateCount % 3600 == 0) {
        updateDashboards();

      } else if (updateCount % 900 == 0) {
        loadDashboards();
      }
    } else {
      if (updateCount % 3600 == 0) {
        reloadIntroAnimation();
      }
    }
    const carouselInner = document.getElementsByClassName("carousel-inner")[0];
    if (carouselInner.children["real-time-stats"]) {
      //console.log("Update");
      updateRealTimeStats(updateCount);
    }
  }, 1000);
  return updateId;
}

function initializeCarousels() {
  var carouselInner = document.getElementById("main-carousel-inner");
  var indicatorList = document.getElementById("main-indicator-list");
  var carousel = document.getElementById("dashboard-carousel");
  carousel.setAttribute("data-ride", "carousel");
  carousel.setAttribute("data-interval", cycleSpeed);
  carousel.setAttribute("data-pause", "false");

  // Set order of dashboards
  var enabledOrder = new Array(currentSettings.numEnabled);
  for (var i = 0; i < currentSettings.dashboards.length; i++) {
    var dashboard = currentSettings.dashboards[i];
    if (dashboard.index >= 0) {
      enabledOrder.splice(dashboard.index, 1, {
        "name": dashboard.name,
        "icon": dashboard.icon,
        "theme": dashboard.theme,
        "title": dashboard.title
      });
    }
  }
  for (var i = 0; i < enabledOrder.length; i++) {
    var dashboardItem = document.getElementById(enabledOrder[i].name);
    var indicator = document.getElementById("indicator").cloneNode();
    if (enabledOrder[i].name.includes("top-video-")) {
      dashboardItem = document.getElementById("top-video-#").cloneNode(true);
      dashboardText = dashboardItem.outerHTML;
      dashboardText =
        dashboardText.replace(/top-video-#/g, enabledOrder[i].name);
      dashboardText =
        dashboardText.replace(/TITLE PLACEHOLDER/, enabledOrder[i].title);
      var template = document.createElement("template");
      template.innerHTML = dashboardText;
      dashboardItem = template.content.firstChild;
    } else {
      dashboardItem.remove();
    }
    document.createElement("div", dashboardItem.outerText)
    dashboardItem.setAttribute("theme", enabledOrder[i].theme);
    indicator.id = "main-indicator-" + i;
    indicator.setAttribute("onclick", "goToCarouselItem(" + i + ")");
    indicator.className = enabledOrder[i].icon + " indicator";
    carouselInner.appendChild(dashboardItem);
    indicatorList.appendChild(indicator);
    if (i == 0) {
      dashboardItem.classList.add("active");
      indicator.classList.add("active");
    }
  }
  document.getElementById("top-video-#").remove();
}

function createShortcutListeners() {
  document.addEventListener("keyup", function (e) {
    if (!isMenuOpen) {
      if (e.key.toUpperCase() == "R" && e.altKey) {
        console.log("Reload Intro Animation");
        reloadIntroAnimation();
      }
    }
  });
}

/**
 * Plays the intro animation
 */
function loadIntroAnimation() {
  const introImage = document.getElementById("intro-img");
  const introVideo = document.getElementById("intro-video");
  if (introVideo.readyState != 4) {
    introVideo.load();
  }
  if (introVideo.paused) {
    const promise = introVideo.play();
    if (promise !== undefined) {
      promise
        .then(_ => {
        // Autoplay started!
        introImage.style.display = "none";
        introVideo.style.display = "initial";
        })
        .catch(error => {
          document.getElementsByTagName("VIDEO")[0].play();
          introImage.style.display = "none";
          introVideo.style.display = "initial";
        });
    }
  }
}

/**
 * Removes and reloads the intro animation. The animation sometimes turns black
 * after many hours on the dashboard. This function prevents this problem.
 */
function reloadIntroAnimation() {
  const introImage = document.getElementById("intro-img");
  const introVideo = document.getElementById("intro-video");
  introVideo.style.display = "none";
  const newIntroVideo = document.createElement("div");
  const container = document.getElementById("animation-container");
  introImage.style.display = "";
  introVideo.remove();
  prependElement(container, newIntroVideo);
  newIntroVideo.outerHTML = introVideo.outerHTML;
  loadIntroAnimation();
}

/**
 * Gets channel platform and demographics statistics from the YouTube API and
 * displays graphs on the platform dashboard
 *
 * @returns {Promise} Status message
 */
function loadPlatformDashboard() {
  const startDate = joinDate;
  const endDate = getTodaysDate();
  let requests = [];
  requests.push(requestChannelSearchTerms(startDate, endDate));
  requests.push(requestViewsByDeviceType(startDate, endDate));
  requests.push(requestViewsByTrafficSource(startDate, endDate));
  requests.push(requestViewsByState(startDate, endDate));
  requests.push(requestChannelDemographics(startDate, endDate));
  requests.push(requestWatchTimeBySubscribedStatus(startDate, endDate));
  return Promise.all(requests)
    .then(response => {
      console.log("Platform Dashboard Calls Status:", response);
      return "Displayed Platform Dashboard";
    })
    .catch(err => {
      const errorMsg = "Error loading the Platform Dashboard: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

/**
 * Gets the channel demographics graph information from the stats spreadsheet
 * and displays the graph
 *
 * @returns {Promise} Status message
 */
function loadChannelDemographics() {
  return requestSpreadsheetData("Stats", "Channel Demographics")
    .then(response => {
      const rows = JSON.parse(response[0][0]);
      const newResponse = {
        "result": {
          "rows": rows
        }
      };
      return displayChannelDemographics(newResponse);
      // We do not use displayGraphError() for this graph because of the graph's
      // small size
    });
}

/**
 * Gets Top Ten Video data from the stats spreadsheet and displays the
 * thumbnails with arrows
 *
 * @returns {Promise} Status message
 */
function loadTopTenDashboard() {
  return requestSpreadsheetData("Stats", "Top Ten Videos")
    .then(topTenSheet => {
      const statsByVideoId = lsGet("statsByVideoId");
      let output = ``;
      for (let j = 1; j < topTenSheet.length; j++) {
        for (let i = 0; i < 11; i++) {
          const month = topTenSheet[j];
          if (i == 0) {
            output += 
              `<div class="column-title"><h4>${month[i]}</h4></div>`;
          } else {
            const videoId = month[i];
            const views = numberWithCommas(parseInt(month[i + 10]));
            const minutesWatched =numberWithCommas(parseInt(month[i + 20]));
            let videoTitle = "YouTube Video ID: " + videoId;
            if (statsByVideoId && statsByVideoId[videoId]) {
              videoTitle = statsByVideoId[videoId]["title"];
            }
            videoTitle +=
              ` | ${views} views & ${minutesWatched} minutes watched`;
            output += `
              <div class="top-ten-thumbnail-holder column-thumbnail">
                <a href="https://youtu.be/${videoId}" target="_blank"
                    alt="${videoTitle}">
                  <img class="top-ten-thumbnail"
                      src="https://i.ytimg.com/vi/${videoId}/mqdefault.jpg" 
                      alt="thumbnail" title="${videoTitle}">`;
            if (j != 1) {
              const currPosition = i;
              const prevMonth = topTenSheet[j - 1];
              const prevPosition = prevMonth.indexOf(videoId);
              if (prevPosition == -1) {
                // Add + up arrow
                output += `
                  <span class="oi oi-arrow-thick-top arrow-green"></span>
                  <span class="arrow-text-black">+</span>
                `;
              } else if (prevPosition != currPosition) {
                const change = prevPosition - currPosition;
                if (change < 0) {
                  // Add down arrow
                  output += `
                    <span class="oi oi-arrow-thick-bottom arrow-red"></span>
                    <span class="arrow-text-white">${Math.abs(change)}</span>
                  `;
                } else if (change > 0) {
                  // Add up arrow
                  output += `
                    <span class="oi oi-arrow-thick-top arrow-green"></span>
                    <span class="arrow-text-black">${change}</span>
                  `;
                }
              }
            }
            output += `</a></div>`;
          }
        }
      }
      let thumbnailContainer =
        document.getElementById("top-ten-thumbnail-container");
      thumbnailContainer.innerHTML = output;
      let thumbnailWrapper =
        document.getElementById("top-ten-thumbnail-wrapper");
      thumbnailWrapper.scrollLeft = thumbnailWrapper.scrollWidth;
      return Promise.resolve("Displayed Top Ten Videos Dashboard");
    });
}

/**
 * Gets user feedback data from the stats spreadsheet and displays them on the
 * user feedback dashboard
 *
 * @returns {Promise} Statsus message
 */
function loadUserFeedbackDashboard() {
  return requestSpreadsheetData("Input Data", "User Feedback List")
    .then(feedbackSheet => {
      const statsByVideoId = lsGet("statsByVideoId");
      let output = ``;
      for (let i = 1; i < feedbackSheet.length; i++) {
        const videoId = feedbackSheet[i][0];
        const feedbackText = feedbackSheet[i][1];
        let videoTitle = "YouTube Video ID: " + videoId;
        if (statsByVideoId && statsByVideoId[videoId]) {
          videoTitle = statsByVideoId[videoId]["title"];
        }
        const thumbnail = `
          <div class="col-4">
            <a href="https://youtu.be/${videoId}" target="_blank"
                alt="${videoTitle}">
              <img class="feedback-thumbnail" onload="thumbnailCheck($(this), true)"
                  src="https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg"
                  alt="thumbnail" title="${videoTitle}">
            </a>
          </div>`;
        const feedback = `
          <div class="col-8">
            <h1 class="feedback-text">"${feedbackText}"</h1>
          </div>
        `;
        const spacer = `<div class="col-12"><hr></div>`;
        if (i % 2 == 0) {
          output += feedback + thumbnail;
        } else {
          output += thumbnail + feedback;
        }
        if (i != feedbackSheet.length - 1) {
          output += spacer;
        }
      }
      let feedbackContainer = document.getElementById("feedback-container");
      feedbackContainer.innerHTML = output;
      if (!autoScrollDivs.includes("feedback-wrapper")) {
        const currentSettings = lsGet("settings");
        let speed = -1;
        let index = 0;
        while (speed == -1 && index <= currentSettings.dashboards.length) {
          const dashboard = currentSettings.dashboards[index];
          if (dashboard.name == "top-ten") {
            speed = dashboard.scrollSpeed;
          }
          index++;
        }
        if (speed <= 0) {
          speed = 0;
        } else {
          speed = Math.ceil(1000 / speed);
        }
        new AutoDivScroll("feedback-wrapper", speed, 1, 1);
        autoScrollDivs.push("feedback-wrapper");
      }
      return Promise.resolve("Displayed User Feedback Dashboard");
    });
}

/**
 * Gets card performance data from the stats spreadsheet and displays a graph on
 * the card performance dashboard
 *
 * @returns {Promise} Status message
 */
function loadCardPerformanceDashboard() {
  const graphIds = getDashboardGraphIds("card-performance");
  const cardTeaserGraph = graphIds.cardTeaser;
  const cardGraph = graphIds.card;
  return requestSpreadsheetData("Stats", "Card Performance")
    .then(cardData => {
      cardData.shift(); // Remove the headers from the sheet

      let months = [];
      let cardImpressions = [];
      let cardCTR = [];
      let cardTeaserImpressions = [];
      let cardTeaserCTR = [];

      // If the last month has no data (all zeros), omit it from the graph
      let numMonths = cardData.length;
      const lastMonth = cardData[cardData.length - 1];
      if (lastMonth[1] == 0 && lastMonth[3] == 0) {
        numMonths--;
      }

      for (let i = 0; i < numMonths; i++) {
        months.push(cardData[i][0]);
        cardImpressions.push(cardData[i][1]);
        cardCTR.push(cardData[i][2] * 100);
        cardTeaserImpressions.push(cardData[i][3]);
        cardTeaserCTR.push(cardData[i][4] * 100);
      }

      const impressionsTrace = {
        "x": months,
        "y": cardImpressions,
        "type": "bar",
        "hovertemplate": "%{y} Impressions<extra></extra>",
        "name": "Card Impressions"
      };

      const ctrTrace = {
        "x": months,
        "y": cardCTR,
        "type": "scatter",
        "hovertemplate": "%{y} Click Rate<extra></extra>",
        "line": {
          "width": 4,
        },
        "name": "Card Click Rate",
        "yaxis": "y2"
      };

      const teaserImpressionsTrace = {
        "x": months,
        "y": cardTeaserImpressions,
        "type": "bar",
        "hovertemplate": "%{y:,g} Teaser Impressions<extra></extra>",
        "name": "Card Teaser Impressions"
      };

      const teaserCTRTrace = {
        "x": months,
        "y": cardTeaserCTR,
        "type": "scatter",
        "hovertemplate": "%{y} Teaser Click Rate<extra></extra>",
        "line": {
          "width": 4,
        },
        "name": "Card Teaser Click Rate",
        "yaxis": "y2"
      };

      const cardTraces = [impressionsTrace, ctrTrace];
      const cardTeaserTraces = [teaserImpressionsTrace, teaserCTRTrace];

      const graphHeight = 0.4159;
      const graphWidth = 0.9192;
      const teaserGraphWidth = 0.9528;
      const height = graphHeight * document.documentElement.clientHeight;
      const width = graphWidth * document.documentElement.clientWidth;
      const teaserWidth =
        teaserGraphWidth * document.documentElement.clientWidth;
      const legendFontSize =
        Math.floor(0.017 * document.documentElement.clientHeight);
      const tickSize =
        Math.floor(0.0094 * document.documentElement.clientWidth);
      const axisTitleSize =
        Math.floor(0.013 * document.documentElement.clientWidth);
      const titleSize =
        Math.floor(0.0156 * document.documentElement.clientWidth);
      const topMargin =
        Math.floor(0.03 * document.documentElement.clientWidth);
      const bottomMargin =
        Math.floor(0.0104 * document.documentElement.clientWidth);
      const hoverFontSize =
        Math.floor(0.01 * document.documentElement.clientWidth);

      const cardLayout = {
        "height": height,
        "width": width,
        "hoverlabel": {
          "font": {
            "size": hoverFontSize
          }
        },
        "legend": {
          "bgcolor": "#eeeeee",
          "font": {
            "size": legendFontSize
          },
          "x": 1.1,
          "y": 0.5
        },
        "margin": {
          "b": bottomMargin,
          "t": topMargin
        },
        "title": {
          "font": {
            "size": titleSize
          },
          "text": "Card Performance"
        },
        "xaxis": {
          "automargin": true,
          "fixedrange": true,
          "hoverformat": "%b %Y",
          "tickformat": "%b<br>%Y",
          "tickfont": {
            "size": tickSize
          },
          "title": {
            "font": {
              "size": axisTitleSize
            },
            "text": "Month"
          }
        },
        "yaxis": {
          "automargin": true,
          "fixedrange": true,
          "tickfont": {
            "size": tickSize
          },
          "title": {
            "font": {
              "size": axisTitleSize
            },
            "text": "Card Impressions"
          }
        },
        "yaxis2": {
          "automargin": true,
          "fixedrange": true,
          "showgrid": false,
          "tickfont": {
            "size": tickSize
          },
          "title": {
            "font": {
              "size": axisTitleSize
            },
            "text": "Card Click Rate"
          },
          "overlaying": "y",
          "side": "right",
          "ticksuffix": "%",
          "zeroline": false
        }
      };

      const config = {
        "displayModeBar": false,
        "scrollZoom": false
      }

      // Creates a copy of `cardLayout`
      let teaserLayout = JSON.parse(JSON.stringify(cardLayout));
      teaserLayout.title.text = "Card Teaser Performance";
      teaserLayout.yaxis.title.text = "Card Teaser Impressions";
      teaserLayout.width = teaserWidth;

      let numErrors = 0;

      try {
        createGraph(cardTeaserGraph, cardTeaserTraces, teaserLayout, config,
          graphHeight, graphWidth);
      } catch (err) {
        numErrors++;
        displayGraphError(cardTeaserGraph, err);
      }

      try {
        createGraph(cardGraph, cardTraces, cardLayout, config, graphHeight,
          graphWidth);
      } catch (err) {
        numErrors++;
        displayGraphError(cardGraph, err);
      }
      if (numErrors > 0) {
        return Promise.resolve("Error Displaying Card Performance Dashboard")
      } else {
        return Promise.resolve("Displayed Card Performance Dashboard");
      }
    })
    .catch(err => {
      displayGraphError(cardTeaserGraph, err);
      displayGraphError(cardGraph, err);
    });
}

/**
 * Displays real time stats and may retrieve the data from the stats spreadsheet
 * or the YouTube APIs
 *
 * @returns {Promise} Status message
 */
function loadRealTimeStatsDashboard() {
  const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
  if (isSignedIn) {
    try {
      return displayRealTimeStats();
    } catch (err) {
      recordError(err);
      return realTimeStatsCalls();
    }
  } else {
    return requestSpreadsheetData("Stats", "Real Time Stats")
      .then(realTimeStatsSheet => {
        let realTimeStats = {};
        const columns = getColumnHeaders(realTimeStatsSheet);
        for (let i = 1; i < realTimeStatsSheet.length; i++) {
          const row = realTimeStatsSheet[i];
          const timeRange = row[columns["Time Range"]];
          const views = row[columns["Views"]];
          const estimatedMinutesWatched =
            row[columns["Estimated Minutes Watched"]];
          const averageViewDuration = row[columns["Average View Duration"]];
          const netSubscribersGained = row[columns["Subscribers Gained"]];
          realTimeStats[timeRange] = {
            "views": parseInt(views),
            "estimatedMinutesWatched": parseInt(estimatedMinutesWatched),
            "averageViewDuration": parseInt(averageViewDuration),
            "netSubscribersGained": parseInt(netSubscribersGained),
          };
        }
        lsSet("realTimeStats", realTimeStats);
        return displayRealTimeStats(realTimeStats);
      });
  }
}

/**
 * Gets graph data from the stats spreadsheet and displays them
 *
 * @returns {Promise} Status message
 */
function loadGraphsFromSheets() {
  return requestSpreadsheetData("Stats", "Graph Data")
    .then(graphData => {
      let numErrors = 0;
      const columns = getColumnHeaders(graphData);
      for (let i = 1; i < graphData.length; i++) {
        const row = graphData[i];
        const graphId = row[columns["Graph ID"]];
        const data = JSON.parse(row[columns["Data"]]);
        const layout = JSON.parse(row[columns["Layout"]]);
        const config = JSON.parse(row[columns["Config"]]);
        const graphHeight = parseFloat(row[columns["Graph Height"]]);
        const graphWidth = parseFloat(row[columns["Graph Width"]]);
        const automargin = JSON.parse(row[columns["Automargin"]]);
        // Display graphs
        try {
          if (document.getElementById(graphId) != null) {
            Plotly.newPlot(graphId, data, layout, config);
            if (automargin != "None") {
              recordGraphSize(graphId, graphHeight, graphWidth, automargin);
            } else {
              recordGraphSize(graphId, graphHeight, graphWidth);
            }
          }
        } catch (err) {
          console.error(err);
          recordError(err);
          displayGraphError(graphId);
          numErrors++;
        }
      }
      return Promise.resolve("Displayed Graphs From Sheets with " + numErrors +
        " errors");
    });
}

/**
 * Gets top video statistics from the stats spreadsheet and displays the data in
 * the top video dashboards
 *
 * @returns {Promise} Status message
 */
function loadTopVideoStats() {
  return requestSpreadsheetData("Stats", "Top Video Stats")
    .then(topVideoStatsSheet => {
      const columns = getColumnHeaders(topVideoStatsSheet);
      let dashboardIds = {};
      let rows = [];
      for (let i = 1; i < topVideoStatsSheet.length; i++) {
        const row = topVideoStatsSheet[i];
        const videoId = row[columns["Video ID"]];
        const dashboardId = row[columns["Dashboard ID"]];
        const title = row[columns["Title"]];
        const duration = row[columns["Duration"]];
        const publishDate = row[columns["Publish Date"]];
        const thumbnail = row[columns["Thumbnail"]];
        const views = row[columns["Views"]];
        const subscribersGained = row[columns["Subscribers Gained"]];
        const avgViewDuration = row[columns["Average View Duration"]];
        const minutesWatched = row[columns["Estimated Minutes Watched"]];
        const comments = row[columns["Comments"]];
        const likes = parseInt(row[columns["Likes"]]);
        const dislikes = parseInt(row[columns["Dislikes"]]);
        try {
          document.getElementById(dashboardId + "-title").innerHTML = title;
          document.getElementById(dashboardId + "-duration").innerHTML =
            "Duration: " + secondsToDuration(duration);
          document.getElementById(dashboardId + "-duration-seconds").innerHTML =
            duration;
          document.getElementById(dashboardId + "-publish-date").innerHTML =
            "Published: " + publishDate;
          document.getElementById(dashboardId + "-thumbnail").innerHTML =
            thumbnail;
          const row = [
            videoId,
            views,
            comments,
            likes,
            dislikes,
            minutesWatched,
            avgViewDuration,
            subscribersGained,
            0
          ];
          rows.push(row);
          dashboardIds[videoId] = dashboardId;
        } catch (err) {
          const errorMsg = `Dashboard "${dashboardId}" does not exist - `;
          console.error(errorMsg, err);
          recordError(err, errorMsg);
        }
      }
      const response = {
        "result": {
          "rows": rows
        }
      };
      displayVideoBasicStats(response, dashboardIds);
      return Promise.resolve("Displayed Top Video Dashboards");
    });
}

/**
 * Displays the all upload thumbnails and gets the number of videos on the
 * AutomationDirect YouTube channel
 *
 * @returns {Promise} Status message
 */
function loadThumbnailDashboard() {
  const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
  if (isSignedIn) {
    const thumbnailsRequest = displayUploadThumbnails();
    // Gets the total number of listed and unlisted videos on the channel
    const request = {
      part: "statistics",
      forUsername: "automationdirect"
    };
    const numVideosRequest = gapi.client.youtube.channels.list(request)
      .then(response => {
        const numVideos = response.result.items[0].statistics.videoCount;
        document.getElementById("num-videos").innerText = numVideos;
      })
      .catch(err => {
        const errorMsg = "Unable to get number of channel videos: ";
        console.error(errorMsg, err);
        recordError(err, errorMsg);
      });
    return Promise.all([numVideosRequest, thumbnailsRequest]);
  } else {
    return displayUploadThumbnails();
  }
}

/**
 * Finds the most watched video for selected categories, fetches data on these
 * videos from the YouTube APIs, displays the data on the Top Video Dashboards
 *
 * @returns {Promise} Status message
 */
function loadTopVideoDashboards() {
  const carouselInner = document.getElementsByClassName("carousel-inner")[0];
  const todayDate = getTodaysDate();
  let topVideoList = [];
  let dashboardIds = {};
  if (carouselInner.children["top-video-1"]) {
    const plcVideo = getTopVideoByCategory("B", "views")[0];
    if (plcVideo != undefined) {
      dashboardIds[plcVideo] = "top-video-1";
      topVideoList.push(plcVideo);
    }
  }
  if (carouselInner.children["top-video-2"]) {
    const drivesVideo = getTopVideoByCategory("C", "views")[0];
    if (drivesVideo != undefined) {
      dashboardIds[drivesVideo] = "top-video-2";
      topVideoList.push(drivesVideo);
    }
  }
  if (carouselInner.children["top-video-3"]) {
    const hmiVideo = getTopVideoByCategory("D", "views")[0];
    if (hmiVideo != undefined) {
      dashboardIds[hmiVideo] = "top-video-3";
      topVideoList.push(hmiVideo);
    }
  }
  if (carouselInner.children["top-video-4"]) {
    const motionControlVideo = getTopVideoByCategory("F", "views")[0];
    if (motionControlVideo != undefined) {
      dashboardIds[motionControlVideo] = "top-video-4";
      topVideoList.push(motionControlVideo);
    }
  }
  if (carouselInner.children["top-video-5"]) {
    const sensorsVideo = getTopVideoByCategory("H", "views")[0];
    if (sensorsVideo != undefined) {
      dashboardIds[sensorsVideo] = "top-video-5";
      topVideoList.push(sensorsVideo);
    }
  }
  if (carouselInner.children["top-video-6"]) {
    const motorsVideo = getTopVideoByCategory("I", "views")[0];
    if (motorsVideo != undefined) {
      dashboardIds[motorsVideo] = "top-video-6";
      topVideoList.push(motorsVideo);
    }
  }
  if (topVideoList.length == 0) {
    return null;
  }
  const topVideosStr = topVideoList.join(",");
  return topVideoCalls(joinDate, todayDate, topVideosStr, dashboardIds);
}

/**
 * Gets the top twenty organic videos by strengths and displays them
 */
function loadVideoStrengthDashboard() {
  const statsByVideoId = lsGet("statsByVideoId");
  const allVideoStats = lsGet("allVideoStats");
  allVideoStats.sort(sortVideosByStrength);
  let numVideos = 20;
  let output = ``;
  let graphData = [];
  let i = 0;
  let numFound = 0;
  while (i < allVideoStats.length && numFound < numVideos) {
    const videoStats = allVideoStats[i];
    const videoId = videoStats["videoId"];
    const organic = statsByVideoId[videoId].organic;
    if (organic) {
      numFound++;
      const strength = Math.round(videoStats["strength"] * 100) / 100;
      let videoTitle = "YouTube Video ID: " + videoId;
      let graphId = `video-strength-bars-${numFound}`;
      graphData.push({
        videoStats: videoStats,
        graphId: graphId
      });
      if (statsByVideoId && statsByVideoId[videoId]) {
        videoTitle = statsByVideoId[videoId]["title"];
      }
  
      output += `
        <div class="col-1">
          <h1 style="font-size:5rem;">${numFound}.</h1>
        </div>
        <div class="col-3">
          <a href="https://youtu.be/${videoId}" target="_blank"
              alt="${videoTitle}">
            <img class="feedback-thumbnail"
                onload="thumbnailCheck($(this), true)"
                src="https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg"
                alt="thumbnail" title="${videoTitle}">
          </a>
        </div>
        <div class="col-4">
          <h1 class="video-strength-title">${videoTitle}</h1>
          <br>
          <h2 class="video-strength-value">Strength: ${strength}</h2>
        </div>
        <div class="col-4">
          <div class="h-100 w-100 graph-container" id="${graphId}"></div>
        </div>
      `;
      const spacer = `
        <div class="col-12">
          <hr style="border-top:0.25rem solid rgba(0,0,0,.3);">
        </div>
      `;
      if (numFound != numVideos) {
        output += spacer;
      }
    }
    i++;
  }
  let videoStrengthContainer =
    document.getElementById("video-strength-container");
  videoStrengthContainer.innerHTML = output;
  if (!autoScrollDivs.includes("video-strength-wrapper")) {
    let currentSettings = lsGet("settings");
    let speed = -1;
    let index = 0;
    while (speed == -1 && index <= currentSettings.dashboards.length) {
      let dashboard = currentSettings.dashboards[index];
      if (dashboard.name == "video-strength") {
        speed = dashboard.scrollSpeed;
      }
      index++;
    }
    if (speed <= 0) {
      speed = 0;
    } else {
      speed = Math.ceil(1000 / speed);
    }
    new AutoDivScroll("video-strength-wrapper", speed, 1, 1);
    autoScrollDivs.push("video-strength-wrapper");
  }

  if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
    if (allVideoStats[0].z === undefined) {
      reloadVideoStrengthDashboard();
    } else {
      for (let index = 0; index < graphData.length; index++) {
        const graph = graphData[index];
        displayVideoStrengthBars(graph.videoStats, graph.graphId);
      }
    }
  }
}

/**
 * Recalculates the strength for all videos and loads the video strength
 * dashboard
 *
 * @returns {Promise} Status message
 */
function reloadVideoStrengthDashboard() {
  return getVideoStrengthWeights()
    .then(strengthCalc => {
      try {
        const allVideoStats = lsGet("allVideoStats");
        let updatedAllVideoStats = calcVideoStrength(allVideoStats,
          strengthCalc);
        lsSet("allVideoStats", updatedAllVideoStats);
        loadVideoStrengthDashboard();
      } catch (err) {
        const errorMsg = "Unable to recalculate video strengths";
        console.error(errorMsg, err);
        recordError(err, errorMsg);
        return errorMsg;
      }
    });
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
    requests.push(getCardPerformanceForCurrMonth());
    requests.push(realTimeStatsCalls());
    requests.push(updateVideoAndCategoryStats());
    const videographers = calcVideographerStats();
    requests.push(getVideographerViewsForCurrMonth());
    reloadIntroAnimation();
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

$(".carousel").on("slide.bs.carousel", function (e) {
  window.setTimeout(function () {
    updateTheme(e.to);
    // Scroll top ten dashboard to the end on load
    let topTenWrapper = document.getElementById("top-ten-thumbnail-wrapper");
    if (topTenWrapper.scrollLeft != topTenWrapper.scrollWidth) {
      topTenWrapper.scrollLeft = topTenWrapper.scrollWidth;
    }
  }, 250);
});

window.addEventListener('resize', function () {
  let topTenDashboard = document.getElementById("top-ten");
  if (topTenDashboard.classList.contains("active")) {
    let thumbnailContainer =
      document.getElementById("top-ten-thumbnail-container");
    thumbnailContainer.style.display = "none";
    this.window.setTimeout(function () {
      thumbnailContainer.style.display = "flex";
    }, 500);
  }
}, true);