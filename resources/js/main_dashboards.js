/* Load and display dashboards */

function loadSignedIn() {
  addDotsToLoadingText();
  const signinModalButton = document.getElementById("signin-modal-button");
  const signoutModalButton = document.getElementById("signout-modal-button");
  const controlPanelButton = document.getElementById("control-panel-button");
  signinModalButton.style.display = "none";
  signoutModalButton.style.display = "inline";
  controlPanelButton.style.display = "inline";
  initializeUpdater();
  loadDashboards();
  updateTheme(0);
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
      if (!categoryStats) {
        getBasicDashboardStats()
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

// Update odometers in real time stats dashboard
function updateRealTimeStats(updateCount) {
  let secondsPerIncrement = lsGet("secondsPerIncrement");
  let odometerCategories = lsGet("odometerCategories");
  for (var key in secondsPerIncrement) {
    if (secondsPerIncrement.hasOwnProperty(key)) {
      if (updateCount % secondsPerIncrement[key] == 0) {
        var odometers = odometerCategories[key];
        odometers.forEach(odometer => {
          var elemOdometer = document.getElementById(odometer);
          var newValue = parseInt(elemOdometer.getAttribute("value")) + 1;
          elemOdometer.innerHTML = newValue;
          elemOdometer.setAttribute("value", newValue);
        });
      }
    }
  }
}

// Initialize real time stats in real time stats dashboard
function displayRealTimeStats(stats) {
  stats = stats || lsGet("realTimeStats");
  if (stats.cumulative && stats.month && stats.today) {
    var secondsPerIncrement = {};
    for (const key in stats.today) {
      if (stats.today.hasOwnProperty(key) && key != "averageViewDuration") {
        secondsPerIncrement[key] = Math.round(43200 / stats.today[key]);
      }
    }
    lsSet("secondsPerIncrement", secondsPerIncrement);

    let startHour = new Date();
    startHour.setHours(6, 0, 0, 0);
    const now = new Date();
    // Calculates the seconds since startHour
    const diffInSeconds = Math.round((now - startHour) / 1000);

    var avgDurationOdometer = document.getElementById("stat-avg-duration");
    var odometerCategories = {
      "views": ["stat-views-cumulative", "stat-views-month"],
      "estimatedMinutesWatched": [
        "stat-minutes-cumulative",
        "stat-minutes-month"
      ],
      "netSubscribersGained": ["stat-subs-cumulative", "stat-subs-month"],
      "cumulative": {
        "views": "stat-views-cumulative",
        "estimatedMinutesWatched": "stat-minutes-cumulative",
        "netSubscribersGained": "stat-subs-cumulative"
      },
      "month": {
        "views": "stat-views-month",
        "estimatedMinutesWatched": "stat-minutes-month",
        "netSubscribersGained": "stat-subs-month"
      }
    };
    lsSet("odometerCategories", odometerCategories);

    // Load data into odometers
    ["cumulative", "month"].forEach(category => {
      const odometers = odometerCategories[category];
      for (const key in odometers) {
        if (odometers.hasOwnProperty(key)) {
          var odometer = odometers[key];
          var elemOdometer = document.getElementById(odometer);
          var value = stats[category][key];
          value += Math.round(diffInSeconds / secondsPerIncrement[key]);
          elemOdometer.setAttribute("value", value);
          elemOdometer.innerHTML = value;
        }
      }
    });
    const avgDurationCumulative =
      secondsToDurationMinSec(stats.cumulative.averageViewDuration);
    avgDurationOdometer.innerHTML = avgDurationCumulative;
    avgDurationOdometer.value = stats.cumulative.averageViewDuration;
    calcAvgVideoDuration(stats.cumulative.averageViewDuration);
    return Promise.resolve("Displayed Real Time Stats Dashboard");
  }
}

function calcAvgVideoDuration() {
  let statsByVideoId = lsGet("statsByVideoId");
  if (statsByVideoId) {
    let numVideos = 0;
    let totalDuration = 0;
    for (let videoId in statsByVideoId) {
      if (statsByVideoId.hasOwnProperty(videoId)) {
        totalDuration += parseInt(statsByVideoId[videoId]["duration"]);
        numVideos++;
      }
    }
    let avgDuration = totalDuration / numVideos;
    let avgViewDuration = document.getElementById("stat-avg-duration").value;
    let avgViewPercentage = decimalToPercent(avgViewDuration / avgDuration);
    if (isNaN(avgViewPercentage)) {
      avgViewPercentage = 36.1;
    }
    document.getElementById("stat-avg-percentage").innerText =
      avgViewPercentage + "%";
  } else {
    // Default value if statsByVideoId does not exist yet
    document.getElementById("stat-avg-percentage").innerText = "36.1%";
  }
}

function getTopVideoByCategory(categoryId, type, numVideos) {
  let categoryStats = lsGet("categoryStats");
  let allVideoStats = lsGet("allVideoStats");
  let statsByVideoId = lsGet("statsByVideoId");
  allVideoStats.sort(function (a, b) {
    return parseInt(b[type]) - parseInt(a[type]);
  });
  if (numVideos == undefined || numVideos <= 0) {
    numVideos = 1;
  }
  let topVideos = [];
  let i = 0;
  let categoryFound = false;
  while (i < categoryStats.length && !categoryFound) {
    if (categoryStats[i]["categoryId"] == categoryId) {
      categoryFound = true;
      let videos = categoryStats[i]["videos"];
      let j = 0;
      let numFound = 0;
      while (j < allVideoStats.length && numFound < numVideos) {
        const videoId = allVideoStats[j].videoId;
        const organic = statsByVideoId[videoId].organic;
        if (videos.includes(videoId) && organic) {
          topVideos.push(videoId);
          numFound++;
        }
        j++;
      }
    }
    i++;
  }
  return topVideos;
}

function displayTopVideoTitles(dashboardIds) {
  let videoData = {};
  for (const videoId in dashboardIds) {
    if (dashboardIds.hasOwnProperty(videoId)) {
      const dashboardId = dashboardIds[videoId];

      const statsByVideoId = lsGet("statsByVideoId");
      let title = document.getElementById(dashboardId + "-title");
      title.innerHTML = statsByVideoId[videoId]["title"];
      const duration = statsByVideoId[videoId]["duration"];
      document.getElementById(dashboardId + "-duration").innerHTML = "Duration: " +
        secondsToDuration(duration);
      document.getElementById(dashboardId + "-duration-seconds").innerHTML =
        duration;

      let publishDateText = document.getElementById(dashboardId + "-publish-date");
      let publishDate = statsByVideoId[videoId]["publishDate"];
      publishDate = dateToMMDDYYYY(publishDate);
      publishDateText.innerHTML = "Published: " + publishDate;

      let thumbnail = document.getElementById(dashboardId + "-thumbnail");
      let videoTitle = "YouTube Video ID: " + videoId;
      if (statsByVideoId && statsByVideoId[videoId]) {
        videoTitle = statsByVideoId[videoId]["title"];
      }
      let thumbnailText = `
        <a href="https://youtu.be/${videoId}" target="_blank"
            alt="${videoTitle}">
          <img class="top-video-thumbnail" onload="thumbnailCheck($(this), true)"
              src="https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg"
              alt="thumbnail" title="${videoTitle}">
        </a>`;
      thumbnail.innerHTML = thumbnailText;

      videoData[videoId] = {
        "dashboardId": dashboardId,
        "title": statsByVideoId[videoId]["title"],
        "duration": statsByVideoId[videoId]["duration"],
        "publishDate": publishDate,
        "thumbnail": thumbnailText
      };
    }
  }
  return videoData;
}

// Load thumbnails in 1000 thumbnail dashboard
function displayUploadThumbnails() {
  let statsByVideoId = lsGet("statsByVideoId");
  var carouselInner = document.getElementsByClassName("carousel-inner")[0];
  if (carouselInner.children.thumbnails) {
    let uploads = lsGet("uploads");
    if (!uploads) {
      const noUploadsErr = new Error("Uploads does not exist");
      recordError(noUploadsErr);
      throw noUploadsErr;
    }
    var uploadThumbnails = "";
    for (var i = 0; i < uploads.length; i++) {
      var videoTitle = "YouTube Video ID: " + uploads[i];
      if (statsByVideoId && statsByVideoId[uploads[i]]) {
        videoTitle = statsByVideoId[uploads[i]]["title"];
      }
      uploadThumbnails += `
        <a href="https://youtu.be/${uploads[i]}" target="_blank"
            alt="${videoTitle}">
          <img class="thumbnail"
              src="https://i.ytimg.com/vi/${uploads[i]}/mqdefault.jpg" 
              alt="thumbnail" title="${videoTitle}">
        </a>`;
    }
    var thumbnailContainer = document.getElementById("thumbnail-container");
    thumbnailContainer.innerHTML = uploadThumbnails;

    if (!autoScrollDivs.includes("thumbnail-wrapper")) {
      let currentSettings = lsGet("settings");
      let speed = -1;
      let index = 0;
      while (speed == -1 && index <= currentSettings.dashboards.length) {
        let dashboard = currentSettings.dashboards[index];
        if (dashboard.name == "thumbnails") {
          speed = dashboard.scrollSpeed;
        }
        index++;
      }
      if (speed <= 0) {
        speed = 0;
      } else {
        speed = Math.ceil(1000 / speed);
      }
      new AutoDivScroll("thumbnail-wrapper", speed, 1, 1);
      autoScrollDivs.push("thumbnail-wrapper");
    }
  }
  return Promise.resolve("Displayed Upload Thumbnails");
}

function displayVideoStrengthBars(videoStats, graphId) {
  const strengthCalc = lsGet("strengthCalc");
  const weights = strengthCalc.weights;
  let labels = [];
  let values = [];
  for (const name in weights) {
    if (weights.hasOwnProperty(name)) {
      const weight = weights[name];
      if (weight != 0) {
        if (name == "avgViewsPerDay") {
          labels.push("Average<br>Views<br>Per Day");
        } else if (name == "likesPerView") {
          labels.push("Likes<br>Per View");
        } else if (name == "subscribersGained") {
          labels.push("Subscribers<br>Gained");
        } else if (name == "avgViewPercentage") {
          labels.push("Average<br>View<br>Percentage");
        } else if (name == "dislikesPerView") {
          labels.push("Dislikes<br>Per View");
        } else {
          labels.push(capitalizeFirstLetter(name));
        }

        if (weight > 0) {
          values.push(videoStats.z[name]);
        } else {
          values.push(videoStats.z[name] * -1);
        }
      }
    }
  }
  const colors = [];
  const green = "rgb(50,171,96)";
  const red = "rgb(255,0,0)";
  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    if (value >= 0) {
      colors.push(green);
    } else {
      colors.push(red);
    }
  }

  const graphHeight = 0.3673;
  const graphWidth = 0.2864;
  const height = graphHeight * document.documentElement.clientHeight;
  const width = graphWidth * document.documentElement.clientWidth;
  const titleFontSize =
    Math.floor(0.0114 * document.documentElement.clientWidth);
  const xTickFontSize =
    Math.floor(0.0067 * document.documentElement.clientWidth);
  const yTickFontSize =
    Math.floor(0.0093 * document.documentElement.clientWidth);
  const axisTitleSize =
    Math.floor(0.0093 * document.documentElement.clientWidth);
  const topMargin = titleFontSize + 10;

  const data = [{
    x: labels,
    y: values,
    marker: {
      color: colors,
    },
    type: "bar",
  }];
  const layout = {
    height: height,
    width: width,
    hovermode: false,
    margin: {
      b: 0,
      l: 0,
      r: 0,
      t: topMargin
    },
    paper_bgcolor: "rgb(255,250,250)",
    plot_bgcolor: "rgb(255,250,250)",
    title: {
      font: {
        size: titleFontSize
      },
      text: "Contributions to Video Strength"
    },
    xaxis: {
      automargin: true,
      fixedrange: true,
      tickangle: 0,
      tickfont: {
        size: xTickFontSize
      }
    },
    yaxis: {
      automargin: true,
      fixedrange: true,
      gridcolor: "#aaaaaa",
      tickprefix: " ",
      tickfont: {
        size: yTickFontSize
      },
      title: {
        font: {
          size: axisTitleSize
        },
        text: "Contribution"
      },
      zerolinewidth: 2
    }
  };
  const config = {
    scrollZoom: false,
    displayModeBar: false,
    staticPlot: true,
    responsive: true
  }
  try {
    createGraph(graphId, data, layout, config, graphHeight, graphWidth);
  } catch (err) {
    displayGraphError(graphId, err);
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