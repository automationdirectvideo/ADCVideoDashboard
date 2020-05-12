/* Load and display dashboards */

function loadDashboards( insteadOfRealTime=false ) {
  console.log( "loadDashboards run instead of realTimeStatsCalls in updateStats function? ", insteadOfRealTime );
  showLoadingText();
  resetGraphData();
  const carouselInner = document.getElementsByClassName("carousel-inner")[0];
  const todayDate = getTodaysDate();
  var requests = [];
  if (carouselInner.children["intro-animation"]) {
    loadIntroAnimation();
  }
  if (carouselInner.children["real-time-stats"]) {
    try {
      // QUESTION: when are realTimeStats updated/initialized when logged in?
      displayRealTimeStats();
    } catch (err) {
      //console.log(err);
      requests.push(realTimeStatsCalls());
    }
  }
  if (carouselInner.children["thumbnails"]) {
    try {
      requests.push(requestChannelNumVideos());
    } catch (err) {
      //console.log(err);
      // FIXME: Change error handling to retry X times
      window.setTimeout(requestChannelNumVideos, 5000);
    }
    try {
      displayUploadThumbnails();
    } catch (err) {
      //console.log(err);
      window.setTimeout(displayUploadThumbnails, 5000);
    }
    displayUploadThumbnails();
  }
  if (carouselInner.children["platform"]) {
    requests.push(platformDashboardCalls(joinDate, todayDate));
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
  try {
    requests.push(loadTopVideoDashboards());
  } catch (err) {
    //console.log(err);
    const retryPromise = getVideoStats()
      .then(loadTopVideoDashboards);
    requests.push(retryPromise);
  }
  if (carouselInner.children["product-categories"]) {
    try {
      requests.push(displayTopCategories());
    } catch (TypeError) {
      console.error(TypeError);
      const retryPromise = getCategoryStats()
        .then(categoryStats => displayTopCategories(categoryStats));
      requests.push(retryPromise);
    }
    // Initiate Category Area Charts
    requests.push(loadCategoryCharts());
    
  }
  console.log("Starting Load Dashboards Requests");
  Promise.all(requests)
    .then(response => {
      console.log("Load Dashboards Complete", response);
      hideLoadingText();
    })
    .catch(err => {
      console.error("Error occurred loading dashboards", err);
      hideLoadingText();
    });
}

function loadTopVideoDashboards() {
  const carouselInner = document.getElementsByClassName("carousel-inner")[0];
  const todayDate = getTodaysDate();
  let topVideoList = []
  let dashboardIds = {};
  if (carouselInner.children["top-video-1"]) {
    let plcVideo = getTopVideoByCategory("B", "views")[0];
    if (plcVideo != undefined) {
        dashboardIds[plcVideo] = "top-video-1";
        topVideoList.push(plcVideo);
    }
  }
  if (carouselInner.children["top-video-2"]) {
    let drivesVideo = getTopVideoByCategory("C", "views")[0];
    if (drivesVideo != undefined) {
        dashboardIds[drivesVideo] = "top-video-2";
        topVideoList.push(drivesVideo);
    }
  }
  if (carouselInner.children["top-video-3"]) {
    let hmiVideo = getTopVideoByCategory("D", "views")[0];
    if (hmiVideo != undefined) {
        dashboardIds[hmiVideo] = "top-video-3";
        topVideoList.push(hmiVideo);
    }
  }
  if (carouselInner.children["top-video-4"]) {
    let motionControlVideo = getTopVideoByCategory("F", "views")[0];
    if (motionControlVideo != undefined) {
        dashboardIds[motionControlVideo] = "top-video-4";
        topVideoList.push(motionControlVideo);
    }
  }
  if (carouselInner.children["top-video-5"]) {
    let sensorsVideo = getTopVideoByCategory("H", "views")[0];
    if (sensorsVideo != undefined) {
        dashboardIds[sensorsVideo] = "top-video-5";
        topVideoList.push(sensorsVideo);
    }
  }
  if (carouselInner.children["top-video-6"]) {
    let motorsVideo = getTopVideoByCategory("I", "views")[0];
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

function loadDashboardsSignedOut() {
  showLoadingText();
  resetGraphData();
  const carouselInner = document.getElementsByClassName("carousel-inner")[0];
  let requests = [];
  if (carouselInner.children["intro-animation"]) {
    loadIntroAnimation();
  }
  if (carouselInner.children["real-time-stats"]) {
    requests.push(loadRealTimeStatsDashboard());
  }
  if (carouselInner.children["thumbnails"]) {
    try {
      const thumbnailPromise = getVideoStats()
        .then(displayUploadThumbnails);
      requests.push(thumbnailPromise);
    } catch (err) {
      //console.log(err);
      window.setTimeout(displayUploadThumbnails, 5000);
    }
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
  Promise.all(requests)
    .then(response => {
      console.log("Load Dashboards Complete", response);
      hideLoadingText();
    })
    .catch(err => {
      console.error("Error occurred loading dashboards", err);
      hideLoadingText();
    });
}

function initializeUpdater() {
  var updateId = window.setInterval(updateStats, 1000);
}

function updateStats() {
  let isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
  if (isSignedIn) {
    if (!localStorage.getItem("lastUpdatedOn")) {
      let oldDate = new Date(0);
      localStorage.setItem("lastUpdatedOn", oldDate.toString());
    }
    let lastUpdatedOn = localStorage.getItem("lastUpdatedOn");
    let updateCount = Math.floor((new Date() - new Date(lastUpdatedOn)) / 1000);
    if (updateCount % 3600 == 0) {
      console.log("Update Dashboards");
      let newUpdate = new Date();
      newUpdate.setHours(10, 30, 0, 0);
      localStorage.setItem("lastUpdatedOn", newUpdate.toString());
      if (newUpdate.getMonth() == 0 && newUpdate.getDate() >= 10 &&
          newUpdate.getDate <= 20) {
        let lastYear = newUpdate.getFullYear() - 1;
        getYearlyCategoryViews(lastYear);
      }
      getTopTenVideosForCurrMonth();
      updateCardPerformanceSheet();
      realTimeStatsCalls();
      updateVideoAndCategoryStats();
    } else if (updateCount % 900 == 0) {
      loadDashboards(true);
    }
    var carouselInner = document.getElementsByClassName("carousel-inner")[0];
    if (carouselInner.children["real-time-stats"]) {
      //console.log("Update");
      updateRealTimeStats(updateCount);
    }
  } else {
    if (!localStorage.getItem("lastUpdatedOn")) {
      let lastUpdatedOn = new Date();
      lastUpdatedOn.setHours(10, 30, 0, 0);
      localStorage.setItem("lastUpdatedOn", lastUpdatedOn.toString());
    }
    let lastUpdatedOn = localStorage.getItem("lastUpdatedOn");
    let updateCount = Math.floor((new Date() - new Date(lastUpdatedOn)) / 1000);
    var carouselInner = document.getElementsByClassName("carousel-inner")[0];
    if (carouselInner.children["real-time-stats"]) {
      //console.log("Update");
      updateRealTimeStats(updateCount);
    }
  }
}

// Update odometers in real time stats dashboard
function updateRealTimeStats(updateCount) {
  let secondsPerIncrement = 
      JSON.parse(localStorage.getItem("secondsPerIncrement"));
  let odometerCategories = 
      JSON.parse(localStorage.getItem("odometerCategories"));
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
  stats = stats || JSON.parse(localStorage.getItem("realTimeStats"));
  if (stats.cumulative && stats.month && stats.today) {

    //console.log("Real Time Stats: ", stats);
    
    var secondsPerIncrement = {};
    for (var key in stats.today) {
      if (stats.today.hasOwnProperty(key) && key != "averageViewDuration") {
        secondsPerIncrement[key] = Math.round(43200 / stats.today[key]);
      }
    }
    //console.log(secondsPerIncrement);
    localStorage.setItem("secondsPerIncrement",
        JSON.stringify(secondsPerIncrement));
    
    if (!localStorage.getItem("lastUpdatedOn")) {
      let lastUpdatedOn = new Date();
      lastUpdatedOn.setHours(10, 30, 0, 0);
      localStorage.setItem("lastUpdatedOn", lastUpdatedOn.toString());
    }

    var recordDate = new Date(localStorage.getItem("lastUpdatedOn"));
    var now = new Date();
    var diffInSeconds = Math.round((now - recordDate) / 1000);
    
    var avgDurationOdometer = document.getElementById("stat-avg-duration");
    var odometerCategories = {
      "views": ["stat-views-cumulative", "stat-views-month"],
      "estimatedMinutesWatched": ["stat-minutes-cumulative",
          "stat-minutes-month"],
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
    localStorage.setItem("odometerCategories",
        JSON.stringify(odometerCategories));
    
    // Load data into odometers
    ["cumulative", "month"].forEach(category => {
      var odometers = odometerCategories[category];
      for (var key in odometers) {
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
    var avgDurationCumulative =
        secondsToDurationMinSec(stats.cumulative.averageViewDuration);
    avgDurationOdometer.innerHTML = avgDurationCumulative;
    avgDurationOdometer.value = stats.cumulative.averageViewDuration;
    calcAvgVideoDuration(stats.cumulative.averageViewDuration);
  }
}

function loadIntroAnimation() {
  let introImage = document.getElementById("intro-img");
  let introVideo = document.getElementById("intro-video");
  if (introVideo.readyState != 4) {
    introVideo.load();
  }
  if (introVideo.paused) {
    var promise = introVideo.play();
    if (promise !== undefined) {
      promise.then(_ => {
        // Autoplay started!
        introImage.style.display = "none";
        introVideo.style.display = "initial";
      }).catch(error => {
        document.getElementsByTagName("VIDEO")[0].play();
        introImage.style.display = "none";
        introVideo.style.display = "initial";
      });
    }
  }
}

function calcAvgVideoDuration() {
  let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
  if (statsByVideoId) {
    let numVideos = 0;
    let totalDuration = 0;
    for (let videoId in statsByVideoId) {
      if (statsByVideoId.hasOwnProperty(videoId)) {
        totalDuration += statsByVideoId[videoId]["duration"];
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
  let categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
  let allVideoStats = JSON.parse(localStorage.getItem("allVideoStats"));
  allVideoStats.sort(function(a, b) {
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
        if (videos.includes(allVideoStats[j]["videoId"])) {
          topVideos.push(allVideoStats[j]["videoId"]);
          numFound++;
        }
        j++;
      }
    }
    i++;
  }
  return topVideos;
}

function displayCategoryViewsAreaCharts(categoryTraces) {
  let years = categoryTraces["years"];
  let numYears = years.length;
  let yearlyTotals = categoryTraces["totals"];
  let viewTraces = [];
  let avgViewTraces = [];
  let cumulativeViewTraces = [];
  let cumulativeAvgViewTraces = [];

  for (var categoryId in categoryTraces) {
    if (categoryTraces.hasOwnProperty(categoryId) && categoryId != "years" &&
        categoryId != "totals") {
      let viewTrace = categoryTraces[categoryId]["viewTrace"];
      let avgViewTrace = categoryTraces[categoryId]["avgViewTrace"];
      let cumulativeViewTrace = categoryTraces[categoryId]["cumulativeViews"];
      let cumulativeAvgViewTrace =
          categoryTraces[categoryId]["cumulativeAvgViewTrace"];
      let categoryName = categoryTraces[categoryId]["name"];
      let percentageTrace = [];
      for (var i = 0; i < viewTrace.length; i++) {
        let percentage = (100 * (viewTrace[i] / yearlyTotals[i])).toFixed(2);
        percentageTrace.push(percentage);
      }
      let lineColor = categoryColors[categoryName].color;
      if (lineColor == undefined) {
        lineColor = "#a0a0a0"
      }
      let fillColor = lineColor + "80";
      viewTraces.push({
        "x": years,
        "y": viewTrace,
        "stackgroup": "one",
        "fillcolor": fillColor,
        "line": {
          "color": lineColor
        },
        "hovertemplate": "%{text}% of %{x} views: <i>" + categoryName + "</i><extra></extra>",
        "name": categoryName,
        "text": percentageTrace
      });
      avgViewTraces.push({
        "x": years,
        "y": avgViewTrace,
        "stackgroup": "one",
        "fillcolor": fillColor,
        "line": {
          "color": lineColor
        },
        "hovertemplate": "~%{y:,g} views per video in %{x}: <i>" + categoryName + "</i><extra></extra>",
        "name": categoryName,
      });
      cumulativeViewTraces.push({
        "x": years,
        "y": cumulativeViewTrace,
        "stackgroup": "one",
        "fillcolor": fillColor,
        "line": {
          "color": lineColor
        },
        "hovertemplate": "%{y:,g} views: <i>" + categoryName + "</i><extra></extra>",
        "name": categoryName
      });
      cumulativeAvgViewTraces.push({
        "x": years,
        "y": cumulativeAvgViewTrace,
        "stackgroup": "one",
        "fillcolor": fillColor,
        "line": {
          "color": lineColor
        },
        "hovertemplate": "~%{y:,g} views per video: <i>" + categoryName + "</i><extra></extra>",
        "name": categoryName
      });
    }
  }
  var sortDescByLastY = function(a,b) {
    return parseInt(b["y"][numYears - 1]) - parseInt(a["y"][numYears - 1]);
  };
  viewTraces.sort(sortDescByLastY);
  avgViewTraces.sort(sortDescByLastY);
  cumulativeViewTraces.sort(sortDescByLastY);
  cumulativeAvgViewTraces.sort(sortDescByLastY);

  var graphHeight = 0.8583;
  var graphWidth = 0.9528;
  var height = graphHeight * document.documentElement.clientHeight;
  var width = graphWidth * document.documentElement.clientWidth;
  var legendFontSize = 
        Math.floor(0.017 * document.documentElement.clientHeight);
  var tickSize = Math.floor(0.0104 * document.documentElement.clientWidth);
  var axisTitleSize = Math.floor(0.0156 * document.documentElement.clientWidth);
  var titleSize = Math.floor(0.0208 * document.documentElement.clientWidth);
  var hoverDistance = Math.floor(0.0260 * document.documentElement.clientWidth);
  var topMargin = Math.floor(0.03 * document.documentElement.clientWidth);
  var bottomMargin = Math.floor(0.0104 * document.documentElement.clientWidth);

  let viewLayout = {
    height: height,
    width: width,
    hoverdistance: hoverDistance,
    hoverlabel: {
      font: {
        size: tickSize
      },
      namelength: -1
    },
    hovermode: "x",
    hovertemplate: "Test",
    legend: {
      bgcolor: "#eeeeee",
      font: {
        size: legendFontSize
      },
      y: 0.5
    },
    margin: {
      b: bottomMargin,
      t: topMargin
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    title: {
      font: {
        size: titleSize
      },
      text: "Views By Category"
    },
    xaxis: {
      automargin: true,
      fixedrange: true,
      tickfont: {
        size: tickSize
      },
      ticks: "outside",
      title: {
        font: {
          size: axisTitleSize
        },
        text: "Year"
      }
    },
    yaxis: {
      automargin: true,
      fixedrange: true,
      tickfont: {
        size: tickSize
      },
      ticks: "outside",
      tickprefix: "  ", // To give extra space between ticks and axis title
      title: {
        font: {
          size: axisTitleSize
        },
        text: "Yearly Views"
      }
    }
  }

  let config = {
    scrollZoom: false,
    displayModeBar: false,
  }

  let plotViews = "categories-views-chart";
  let plotViewsNorm = "categories-normal-views-chart";
  let plotCumViews = "categories-cum-views-chart";
  let plotCumViewsNorm = "categories-normal-cum-views-chart";
  let plotAvgViews = "categories-avg-views-chart";
  let plotAvgViewsNorm = "categories-normal-avg-views-chart";
  let plotCumAvgViews = "categories-cum-avg-views-chart";
  let plotCumAvgViewsNorm = "categories-normal-cum-avg-views-chart";


  let normalViewTraces = JSON.parse(JSON.stringify(viewTraces));
  normalViewTraces[0]["groupnorm"] = "percent";
  let normalViewLayout = JSON.parse(JSON.stringify(viewLayout));
  normalViewLayout.title.text = "Views By Category, Normalized"
  normalViewLayout.yaxis.title.text = "Percent Views";
  normalViewLayout.yaxis.ticksuffix = "%";


  let cumulativeViewLayout = JSON.parse(JSON.stringify(viewLayout));
  cumulativeViewLayout.title.text = "Cumulative Views By Category";
  cumulativeViewLayout.yaxis.title.text = "Cumulative Views";

  let normalCumulativeViewTraces = JSON.parse(JSON.stringify(cumulativeViewTraces));
  normalCumulativeViewTraces[0]["groupnorm"] = "percent";
  let normalCumulativeViewLayout = JSON.parse(JSON.stringify(cumulativeViewLayout));
  normalCumulativeViewLayout.title.text = "Cumulative Views By Category, Normalized";
  normalCumulativeViewLayout.yaxis.title.text = "Percent Cumulative Views";
  normalCumulativeViewLayout.yaxis.ticksuffix = "%";
  for (var i = 0; i < normalCumulativeViewTraces.length; i++) {
    var trace = normalCumulativeViewTraces[i];
    var categoryName = trace.name;
    trace.hovertemplate = "%{y:.2f}% of total views: <i>" + categoryName + "</i><extra></extra>";
  }


  let avgViewLayout = JSON.parse(JSON.stringify(viewLayout));
  avgViewLayout.title.text = "Average Views Per Video By Category";
  avgViewLayout.yaxis.title.text = "Average Views Per Video";
  avgViewLayout.yaxis.tickformat = ",g";

  let normalAvgViewTraces = JSON.parse(JSON.stringify(avgViewTraces));
  normalAvgViewTraces[0]["groupnorm"] = "percent";
  let normalAvgViewLayout = JSON.parse(JSON.stringify(avgViewLayout));
  normalAvgViewLayout.title.text = "Average Views Per Video By Category, Normalized";
  normalAvgViewLayout.yaxis.title.text = "Percent Average Views Per Video";
  normalAvgViewLayout.yaxis.ticksuffix = "%";
  for (var i = 0; i < normalAvgViewTraces.length; i++) {
    var trace = normalAvgViewTraces[i];
    var categoryName = trace.name;
    trace.hovertemplate = "%{y:.2f}%: <i>" + categoryName + "</i><extra></extra>";
  }


  let cumulativeAvgViewLayout = JSON.parse(JSON.stringify(viewLayout));
  cumulativeAvgViewLayout.title.text = "Cumulative Average Views Per Video By Category";
  cumulativeAvgViewLayout.yaxis.title.text = "Average Views Per Video";
  cumulativeAvgViewLayout.yaxis.tickformat = ",g";

  let normalCumulativeAvgViewTraces = JSON.parse(JSON.stringify(cumulativeAvgViewTraces));
  normalCumulativeAvgViewTraces[0]["groupnorm"] = "percent";
  let normalCumulativeAvgViewLayout = JSON.parse(JSON.stringify(cumulativeAvgViewLayout));
  normalCumulativeAvgViewLayout.title.text = "Cumulative Average Views Per Video By Category, Normalized";
  normalCumulativeAvgViewLayout.yaxis.title.text = "Percent Average Views Per Video";
  normalCumulativeAvgViewLayout.yaxis.ticksuffix = "%";
  for (var i = 0; i < normalCumulativeAvgViewTraces.length; i++) {
    var trace = normalCumulativeAvgViewTraces[i];
    var categoryName = trace.name;
    trace.hovertemplate = "%{y:.2f}%: <i>" + categoryName + "</i><extra></extra>";
  }
  
  let plotInfo = [
    [plotViews, viewTraces, viewLayout],
    [plotViewsNorm, normalViewTraces, normalViewLayout],
    [plotCumViews, cumulativeViewTraces, cumulativeViewLayout],
    [plotCumViewsNorm, normalCumulativeViewTraces, normalCumulativeViewLayout],
    [plotAvgViews, avgViewTraces, avgViewLayout],
    [plotAvgViewsNorm, normalAvgViewTraces, normalAvgViewLayout],
    [plotCumAvgViews, cumulativeAvgViewTraces, cumulativeAvgViewLayout],
    [plotCumAvgViewsNorm, normalCumulativeAvgViewTraces,
          normalCumulativeAvgViewLayout],
  ];
  categoryGraphData = {};
  for (var i = 0; i < plotInfo.length; i++) {
    let [graphId, trace, layout] = plotInfo[i];
    try {
      Plotly.newPlot(graphId, trace, layout, config);
      recordGraphData(graphId, trace, layout, config, graphHeight, graphWidth);
      recordGraphSize(graphId, graphHeight, graphWidth);
      categoryGraphData[graphId] = {
        "data": trace,
        "layout": layout,
        "config": config,
        "graphHeight": graphHeight,
        "graphWidth": graphWidth,
        "automargin": "None",
      };
    } catch (err) {
      console.log("There was an error initiating graph: " + graphId + ", Error: ", err);
    }
  }
}

function displayCardPerformanceCharts(cardData) {
  cardData.shift(); // Remove the headers from the sheet

  let months = [];
  let cardImpressions = [];
  let cardCTR = [];
  let cardTeaserImpressions = [];
  let cardTeaserCTR = [];

  // If the last month has no data (all zeros), omit it from the graph
  let numMonths = cardData.length;
  let lastMonth = cardData[cardData.length - 1];
  if (lastMonth[1] == 0 && lastMonth[3] == 0) {
    numMonths--;
  }

  for (var i = 0; i < numMonths; i++) {
    months.push(cardData[i][0]);
    cardImpressions.push(cardData[i][1]);
    cardCTR.push(cardData[i][2] * 100);
    cardTeaserImpressions.push(cardData[i][3]);
    cardTeaserCTR.push(cardData[i][4] * 100);
  }

  var impressionsTrace = {
    "x": months,
    "y": cardImpressions,
    "type": "bar",
    "hovertemplate": "%{y} Impressions<extra></extra>",
    "name": "Card Impressions"
  };

  var ctrTrace = {
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

  var teaserImpressionsTrace = {
    "x": months,
    "y": cardTeaserImpressions,
    "type": "bar",
    "hovertemplate": "%{y:,g} Teaser Impressions<extra></extra>",
    "name": "Card Teaser Impressions"
  };

  var teaserCTRTrace = {
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

  var cardTraces = [impressionsTrace, ctrTrace];
  var cardTeaserTraces = [teaserImpressionsTrace, teaserCTRTrace];

  var graphHeight = 0.4159;
  var graphWidth = 0.9192;
  var teaserGraphWidth = 0.9528;
  var height = graphHeight * document.documentElement.clientHeight;
  var width = graphWidth * document.documentElement.clientWidth;
  var teaserWidth = teaserGraphWidth * document.documentElement.clientWidth;
  var legendFontSize = 
        Math.floor(0.017 * document.documentElement.clientHeight);
  var tickSize = Math.floor(0.0094 * document.documentElement.clientWidth);
  var axisTitleSize = Math.floor(0.013 * document.documentElement.clientWidth);
  var titleSize = Math.floor(0.0156 * document.documentElement.clientWidth);
  var topMargin = Math.floor(0.03 * document.documentElement.clientWidth);
  var bottomMargin = Math.floor(0.0104 * document.documentElement.clientWidth);

  var cardLayout = {
    height: height,
    width: width,
    legend: {
      bgcolor: "#eeeeee",
      font: {
        size: legendFontSize
      },
      x: 1.1,
      y: 0.5
    },
    margin: {
      b: bottomMargin,
      t: topMargin
    },
    title: {
      font: {
        size: titleSize
      },
      text: "Card Performance"
    },
    xaxis: {
      automargin: true,
      fixedrange: true,
      hoverformat: "%b %Y",
      tickformat: "%b<br>%Y",
      tickfont: {
        size: tickSize
      },
      title: {
        font: {
          size: axisTitleSize
        },
        text: "Month"
      }
    },
    yaxis: {
      automargin: true,
      fixedrange: true,
      tickfont: {
        size: tickSize
      },
      title: {
        font: {
          size: axisTitleSize
        },
        text: "Card Impressions"
      }
    },
    yaxis2: {
      automargin: true,
      fixedrange: true,
      showgrid: false,
      tickfont: {
        size: tickSize
      },
      title: {
        font: {
          size: axisTitleSize
        },
        text: "Card Click Rate"
      },
      overlaying: "y",
      side: "right",
      ticksuffix: "%",
      zeroline: false
    }
  };

  let config = {
    scrollZoom: false,
    displayModeBar: false,
  }

  let teaserLayout = JSON.parse(JSON.stringify(cardLayout));
  teaserLayout.title.text = "Card Teaser Performance";
  teaserLayout.yaxis.title.text = "Card Teaser Impressions";
  teaserLayout.width = teaserWidth;

  let cardTeaserGraph = "card-teaser-performance-graph";
  let cardGraph = "card-performance-graph";

  Plotly.newPlot(cardTeaserGraph, cardTeaserTraces, teaserLayout, config);
  recordGraphData(cardTeaserGraph, cardTeaserTraces, teaserLayout, config,
      graphHeight, graphWidth);
  recordGraphSize(cardTeaserGraph, graphHeight, teaserGraphWidth);

  Plotly.newPlot(cardGraph, cardTraces, cardLayout, config);
  recordGraphData(cardGraph, cardTraces, cardLayout, config, graphHeight,
      graphWidth);
  recordGraphSize(cardGraph, graphHeight, graphWidth);
}

function displayTopCategories(categoryStats) {
  categoryStats = categoryStats ||
      JSON.parse(localStorage.getItem("categoryStats"));
  var excludeKeys = ["SPECIAL CATEGORIES", "OTHER", "MISC"];

  var total = 0;
  let otherTotal = 0;
  var graphHeight = 0.8583;
  var graphWidth = 0.9528;
  var height = graphHeight * document.documentElement.clientHeight;
  var width = graphWidth * document.documentElement.clientWidth;
  var titleFontSize = Math.floor(0.0234 * document.documentElement.clientWidth);
  var labelFontSize = Math.floor(0.0200 * document.documentElement.clientWidth);
  var legendFontSize = 
      Math.floor(0.0125 * document.documentElement.clientWidth);
  var values = [];
  var labels = [];
  var colors = [];
  var type = "views";
  var cutoff = 0.025;

  var labelConversion = categoryColors;

  for (var i = 0; i < categoryStats.length; i++) {
    let category = categoryStats[i];
    let include = category.root;
    if (include) {
      for (var j = 0; j < excludeKeys.length; j++) {
        if (category.name.includes(excludeKeys[j])) {
          include = false;
        }
      }
    }
    if (include) {
      total += Math.round(category[type]);
    }
  }
  for (var i = 0; i < categoryStats.length; i++) {
    let category = categoryStats[i];
    let include = category.root;
    if (include) {
      for (var j = 0; j < excludeKeys.length; j++) {
        if (category.name.includes(excludeKeys[j])) {
          include = false;
        }
      }
    }
    if (include) {
      let value = Math.round(category[type]);
      if (value / total <= cutoff) {
        otherTotal += value;
      } else {
        values.push(value);
        labels.push(labelConversion[category.shortName].name);
        colors.push(labelConversion[category.shortName].color);
      }
    }
  }
  if (cutoff != undefined && cutoff > 0) {
    values.push(otherTotal);
    labels.push("Other");
    colors.push("#5fe0ed");
  }

  var data1 = {
    values: values,
    labels: labels,
    marker: {
      colors: colors
    },
    domain: {
      row: 0,
      column: 0
    },
    name: "Total Views<br>By Category",
    title: {
      text: "Total Views<br>By Category",
      font: {
        size: titleFontSize
      }
    },
    textinfo: "label",
    textposition: "inside",
    hoverlabel: {
      namelength: "-1"
    },
    hovertemplate: "%{label}<br>%{value} views<br>%{percent}",
    sort: false,
    type: 'pie',
    rotation: 90
  };

  // Avg Views Graph

  total = 0;
  otherTotal = 0;
  values = [];
  labels = [];
  colors = [];
  type = "avgViews";
  cutoff = 0.025;

  for (var i = 0; i < categoryStats.length; i++) {
    let category = categoryStats[i];
    let include = category.root;
    if (include) {
      for (var j = 0; j < excludeKeys.length; j++) {
        if (category.name.includes(excludeKeys[j])) {
          include = false;
        }
      }
    }
    if (include) {
      total += Math.round(category[type]);
    }
  }
  for (var i = 0; i < categoryStats.length; i++) {
    let category = categoryStats[i];
    let include = category.root;
    if (include) {
      for (var j = 0; j < excludeKeys.length; j++) {
        if (category.name.includes(excludeKeys[j])) {
          include = false;
        }
      }
    }
    if (include) {
      let value = Math.round(category[type]);
      if (value / total <= cutoff) {
        otherTotal += value;
      } else {
        values.push(value);
        labels.push(labelConversion[category.shortName].name);
        colors.push(labelConversion[category.shortName].color);
      }
    }
  }
  if (cutoff != undefined && cutoff > 0) {
    values.push(otherTotal);
    labels.push("Other");
    colors.push("#5fe0ed");
  }

  var data2 = {
    values: values,
    labels: labels,
    marker: {
      colors: colors
    },
    domain: {
      row: 0,
      column: 1
    },
    name: "Average Views Per Video<br>By Category",
    title: {
      text: "Average Views Per Video<br>By Category",
      font: {
        size: titleFontSize
      }
    },
    textinfo: "label",
    textposition: "inside",
    hoverlabel: {
      namelength: "-1"
    },
    hovertemplate: "%{label}<br>~%{value} views per video<br>%{percent}",
    sort: false,
    type: 'pie',
    rotation: 140
  };

  var data = [data2, data1];

  var layout = {
    height: height,
    width: width,
    font: {size: labelFontSize},
    automargin: true,
    autosize: true,
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    legend: {
      bgcolor: "#eeeeee",
      font: {
        size: legendFontSize
      },
      y: 0.5
    },
    grid: {
      rows: 1,
      columns: 2
    },
    margin: {
      b:5,
      l:5,
      r:5,
      t:5
    }
  };

  var config = {
    staticPlot: true,
    responsive: true
  };

  var graphId = "categories-double-views-chart";

  var currentSettings = JSON.parse(localStorage.getItem("settings"));
  var theme = "";
  var index = 0;
  while (index < currentSettings.dashboards.length && theme == "") {
    if (currentSettings.dashboards[index].name == "product-categories") {
      theme = currentSettings.dashboards[index].theme;
    }
    index++;
  }
  if (theme == "dark") {
    layout["plot_bgcolor"] = "#222";
    layout["paper_bgcolor"] = "#222";
    layout["font"]["color"] = "#fff";
    layout["legend"]["bgcolor"] = "#444";
    layout["legend"]["font"]["color"] = "#fff";
  }

  Plotly.newPlot(graphId, data, layout, config);

  recordGraphData(graphId, data, layout, config, graphHeight, graphWidth);
  recordGraphSize(graphId, graphHeight, graphWidth);
}

// Displays thumbnails with arrows on Top Ten Dashboard
function displayTopTenThumbnails(topTenSheet) {
  let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
  let output = ``;
  for (var j = 1; j < topTenSheet.length; j++) {
    for (var i = 0; i < 11; i++) {
      if (i == 0) {
        output += `<div class="column-title"><h4>${topTenSheet[j][i]}</h4></div>`;
      } else {
        var videoId = topTenSheet[j][i];
        var views = numberWithCommas(parseInt(topTenSheet[j][i + 10]));
        var minutesWatched = numberWithCommas(parseInt(topTenSheet[j][i + 20]));
        var videoTitle = "YouTube Video ID: " + videoId;
        if (statsByVideoId && statsByVideoId[videoId]) {
          videoTitle = statsByVideoId[videoId]["title"];
        }
        videoTitle += ` | ${views} views & ${minutesWatched} minutes watched`;
        output += `
          <div class="top-ten-thumbnail-holder column-thumbnail">
            <a href="https://youtu.be/${videoId}" target="_blank"
                onclick="closeFullscreen()" alt="${videoTitle}">
              <img class="top-ten-thumbnail"
                  src="https://i.ytimg.com/vi/${videoId}/mqdefault.jpg" 
                  alt="thumbnail" title="${videoTitle}">`;
        if (j != 1) {
          var currPosition = i;
          var prevPosition = topTenSheet[j - 1].indexOf(videoId);
          if (prevPosition == -1) {
            // Add + up arrow
            output += `
              <span class="oi oi-arrow-thick-top arrow-green"></span>
              <span class="arrow-text-black">+</span>
            `;
          } else if (prevPosition != currPosition) {
            var change = prevPosition - currPosition;
            if (change < 0) {
              // Add down arrow
              output += `
                <span class="oi oi-arrow-thick-bottom arrow-red"></span>
                <span class="arrow-text-white">${Math.abs(change)}</span>
              `;
            } else if(change > 0) {
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
  let thumbnailWrapper = document.getElementById("top-ten-thumbnail-wrapper");
  thumbnailWrapper.scrollLeft = thumbnailWrapper.scrollWidth;
}

function displayTopVideoTitles(dashboardIds) {
  let videoData = {};
  for (const videoId in dashboardIds) {
    if (dashboardIds.hasOwnProperty(videoId)) {
      const dashboardId = dashboardIds[videoId];
      
      const statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
      let title = document.getElementById(dashboardId + "-title");
      title.innerHTML = statsByVideoId[videoId]["title"];
      const duration = statsByVideoId[videoId]["duration"];
      document.getElementById(dashboardId + "-duration").innerHTML = "Duration: " +
          secondsToDuration(duration);
      document.getElementById(dashboardId + "-duration-seconds").innerHTML = 
          duration;
    
      let publishDateText = document.getElementById(dashboardId + "-publish-date");
      let publishDate = statsByVideoId[videoId]["publishDate"];
      const year = publishDate.slice(0, 4);
      const month = publishDate.slice(5, 7);
      const day = publishDate.slice(8, 10);
      publishDate = month + "/" + day + "/" + year;
      publishDateText.innerHTML = "Published: " + publishDate;
    
      let thumbnail = document.getElementById(dashboardId + "-thumbnail");
      let videoTitle = "YouTube Video ID: " + videoId;
      if (statsByVideoId && statsByVideoId[videoId]) {
        videoTitle = statsByVideoId[videoId]["title"];
      }
      let thumbnailText = `
        <a href="https://youtu.be/${videoId}" target="_blank"
            onclick="closeFullscreen()" alt="${videoTitle}">
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
  try {
    let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
    var carouselInner = document.getElementsByClassName("carousel-inner")[0];
    if (carouselInner.children.thumbnails) {
      let uploads = JSON.parse(localStorage.getItem("uploads"));
      if (!uploads) {
        throw "Uploads does not exist";
      } else {
        var uploadThumbnails = "";
        for (var i = 0; i < uploads.length; i++) {
          var videoTitle = "YouTube Video ID: " + uploads[i];
          if (statsByVideoId && statsByVideoId[uploads[i]]) {
            videoTitle = statsByVideoId[uploads[i]]["title"];
          }
          uploadThumbnails += `
            <a href="https://youtu.be/${uploads[i]}" target="_blank"
                onclick="closeFullscreen()" alt="${videoTitle}">
              <img class="thumbnail"
                  src="https://i.ytimg.com/vi/${uploads[i]}/mqdefault.jpg" 
                  alt="thumbnail" title="${videoTitle}">
            </a>`;
        }
        var thumbnailContainer = document.getElementById("thumbnail-container");
        thumbnailContainer.innerHTML = uploadThumbnails;

        if (!autoScrollDivs.includes("thumbnail-wrapper")) {
          let currentSettings = JSON.parse(localStorage.getItem("settings"));
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
    }
  } catch (err) {
    //console.log(err);
    // TODO: Stop retrying after X attempts
    window.setTimeout(displayUploadThumbnails, 5000);
  }
}

function displayUserFeedback(feedbackSheet) {
  let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
  let output = ``;
  for (var i = 1; i < feedbackSheet.length; i++) {
    var videoId = feedbackSheet[i][0];
    var feedbackText = feedbackSheet[i][1];
    let videoTitle = "YouTube Video ID: " + videoId;
    if (statsByVideoId && statsByVideoId[videoId]) {
      videoTitle = statsByVideoId[videoId]["title"];
    }
    var thumbnail = `
      <div class="col-4">
        <a href="https://youtu.be/${videoId}" target="_blank"
            onclick="closeFullscreen()" alt="${videoTitle}">
          <img class="feedback-thumbnail" onload="thumbnailCheck($(this), true)"
              src="https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg"
              alt="thumbnail" title="${videoTitle}">
        </a>
      </div>`;
    var feedback = `
      <div class="col-8">
        <h1 class="feedback-text">"${feedbackText}"</h1>
      </div>
    `;
    var spacer = `<div class="col-12"><hr></div>`;
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
    let currentSettings = JSON.parse(localStorage.getItem("settings"));
    let speed = -1;
    let index = 0;
    while (speed == -1 && index <= currentSettings.dashboards.length) {
      let dashboard = currentSettings.dashboards[index];
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
  
}

function recordGraphData(graphId, data, layout, config, graphHeight, graphWidth,
        automargin) {
  totalNumGraphs = document.querySelectorAll('.graph-container').length;
  let graphData = JSON.parse(localStorage.getItem("graphData"));
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
    localStorage.setItem("graphData", JSON.stringify(graphData));
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
      saveGraphDataToSheets();
    }
  } else {
    localStorage.setItem("graphData", JSON.stringify(graphData));
  }
}

function recordGraphSize(graphId, graphHeight, graphWidth, automargin) {
  if (!localStorage.getItem("graphSizes")) {
    localStorage.setItem("graphSizes", JSON.stringify({}));
  }
  let graphSizes = JSON.parse(localStorage.getItem("graphSizes"));
  graphSizes[graphId] = {
    height: graphHeight,
    width: graphWidth
  };
  if (automargin) {
    graphSizes[graphId]["automargin"] = automargin;
  }
  localStorage.setItem("graphSizes", JSON.stringify(graphSizes));
}

// Empties localStorage.graphData
function resetGraphData() {
  localStorage.setItem("graphData", "{}");
}

function resizeGraphs() {
  //this.//console.log("Resize");
  let graphSizes = JSON.parse(this.localStorage.getItem("graphSizes"));
  let viewportHeight = document.documentElement.clientHeight;
  let viewportWidth = document.documentElement.clientWidth;
  for (var graphId in graphSizes) {
    let height = graphSizes[graphId].height * viewportHeight;
    let width = graphSizes[graphId].width * viewportWidth;
    let update = {
      height: height,
      width: width
    };
    // console.log("Resizing graph: " + graphId);
    Plotly.relayout(graphId, update);
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

function fixGraphMargins() {
  let graphSizes = JSON.parse(this.localStorage.getItem("graphSizes"));
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
  }
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
  $("#dashboard-carousel").carousel('pause');
  pauseText.style.display = "initial";
  playText.style.display = "none";
}

function playDashboard() {
  let pauseText = document.getElementById("pause-text");
  let playText = document.getElementById("play-text");
  $("#dashboard-carousel").carousel('cycle');
  pauseText.style.display = "none";
  playText.style.display = "initial";
  setTimeout(function() {
    if (playText.offsetHeight != 0) {
      $('#play-text').fadeOut();
    }
  }, 2000);
}

function toggleDashboardPause() {
  let pauseText = document.getElementById("pause-text");
  if (pauseText.offsetHeight == 0) {
    pauseDashboard();
  } else {
    playDashboard();
  }
}

function goToCarouselItem(index) {
  $(".carousel-container.active > .carousel").carousel(index);
}

function swapCarousels() {
  let activeCarouselContainer = $(".carousel-container.active");
  let inactiveCarouselContainer = $(".carousel-container:not(.active)");
  pauseDashboard();
  activeCarouselContainer.removeClass("active");
  inactiveCarouselContainer.addClass("active");
}

function loadSignedIn() {
  var signinModalButton = document.getElementById("signin-modal-button");
  var signoutModalButton = document.getElementById("signout-modal-button");
  signinModalButton.style.display = "none";
  signoutModalButton.style.display = "inline";
  initializeUpdater();
  loadDashboards();
  updateTheme(0);
}

function loadSignedOut() {
  var signinModalButton = document.getElementById("signin-modal-button");
  var signoutModalButton = document.getElementById("signout-modal-button");
  signinModalButton.style.display = "inline";
  signoutModalButton.style.display = "none";
  initializeUpdater();
  loadDashboardsSignedOut();
}

function hideLoadingText() {
  var loadingText = document.getElementById("loading-text");
  loadingText.style.display = "none";
}

function showLoadingText() {
  var loadingText = document.getElementById("loading-text");
  loadingText.style.display = "initial";
}

// Get current settings
if (!localStorage.getItem("settings")) {
  localStorage.setItem("settings", JSON.stringify(defaultSettings));
}
var currentSettings = JSON.parse(localStorage.getItem("settings"));
//console.log("Current Settings: ", currentSettings);


// Initialize carousels
var carouselInner = document.getElementById("main-carousel-inner");
var indicatorList = document.getElementById("main-indicator-list");
const cycleSpeed = currentSettings.cycleSpeed * 1000;
var carousel = document.getElementById("dashboard-carousel");
carousel.setAttribute("data-interval", cycleSpeed);
carousel.setAttribute("data-pause", "false");

var categoryStatsCarousel = document.getElementById("category-stats-carousel");
categoryStatsCarousel.setAttribute("data-interval", 0);
categoryStatsCarousel.setAttribute("data-pause", "false");

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
    dashboardText = dashboardText.replace(/top-video-#/g, enabledOrder[i].name);
    dashboardText =
        dashboardText.replace(/TITLE PLACEHOLDER/, enabledOrder[i].title);
    var template = document.createElement("template");
    template.innerHTML = dashboardText;
    dashboardItem = template.content.firstChild;
  } else {
    dashboardItem.remove();
  }
  document.createElement("div",dashboardItem.outerText)
  dashboardItem.setAttribute("theme", enabledOrder[i].theme);
  indicator.id = "main-indicator-" + i;
  indicator.setAttribute("onclick", "goToCarouselItem("+ i +")");
  indicator.className = enabledOrder[i].icon + " indicator";
  carouselInner.appendChild(dashboardItem);
  indicatorList.appendChild(indicator);
  if (i == 0) {
    dashboardItem.classList.add("active");
    indicator.classList.add("active");
  }
}
document.getElementById("top-video-#").remove();

// Handle carousel scrolling and keyboard shortcuts
document.addEventListener("keyup", function (e) {
  if (e.key == "ArrowLeft") {
    carouselPrev();
  } else if (e.key == "ArrowRight") {
    carouselNext();
  } else if (e.key == "ArrowUp" || e.key == "ArrowDown") {
    swapCarousels();
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
    loadCategoryCharts();
  } else if (!isNaN(e.key) && e.which != 32) {
    if (e.ctrlKey || e.altKey) {
      goToCarouselItem(parseInt(e.key) + 9);
    } else {
      goToCarouselItem(parseInt(e.key) - 1);
    }
  }
});
$(".carousel").on("slide.bs.carousel", function (e) {
  // showLoadingText();
  var carouselName = e.target.getAttribute("name");
  var indicatorName = carouselName + "-indicator-";
  var startIndicator = document.getElementById(indicatorName + e.from);
  var endIndicator = document.getElementById(indicatorName + e.to);
  startIndicator.classList.remove("active");
  endIndicator.classList.add("active");
  window.setTimeout(function(){
    updateTheme(e.to);
    // Scroll top ten dashboard to the end on load
    let topTenWrapper = document.getElementById("top-ten-thumbnail-wrapper");
    if (topTenWrapper.scrollLeft != topTenWrapper.scrollWidth) {
      topTenWrapper.scrollLeft = topTenWrapper.scrollWidth;
    }
  }, 250);
});

// $(".carousel").on("slid.bs.carousel", hideLoadingText);

window.addEventListener('resize', function () {
  retry(resizeGraphs, 5, 5000);
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
