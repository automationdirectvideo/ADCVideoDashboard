/* Load and display dashboards */

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
    requests.push(loadProductCategoriesDashboard());
    // Initiate Category Area Charts
    requests.push(loadCategoryCharts());
  }
  requests.push(loadTopVideoDashboards());
  requests.push(loadVideographerDashboards());

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
  var sortDescByLastY = function (a, b) {
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

  const graphIds = getDashboardGraphIds("categoryGraphs");

  let plotViews = graphIds[0];
  let plotViewsNorm = graphIds[1];
  let plotCumViews = graphIds[2];
  let plotCumViewsNorm = graphIds[3];
  let plotAvgViews = graphIds[4];
  let plotAvgViewsNorm = graphIds[5];
  let plotCumAvgViews = graphIds[6];
  let plotCumAvgViewsNorm = graphIds[7];


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
      normalCumulativeAvgViewLayout
    ],
  ];
  let numErrors = 0;
  for (var i = 0; i < plotInfo.length; i++) {
    let [graphId, trace, layout] = plotInfo[i];
    try {
      createGraph(graphId, trace, layout, config, graphHeight, graphWidth);
    } catch (err) {
      displayGraphError(graphId, err)
      numErrors++;
    }
  }
  return Promise.resolve("Displayed Category Views Area Charts with " +
    numErrors + " errors");
}

function displayTopCategoriesGraphOne(categoryStats) {
  categoryStats = categoryStats || lsGet("categoryStats");
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
    font: {
      size: labelFontSize
    },
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
      b: 5,
      l: 5,
      r: 5,
      t: 5
    }
  };

  var config = {
    staticPlot: true,
    responsive: true
  };

  const graphIds = getDashboardGraphIds("product-categories");
  const graphId = graphIds.graphOne;

  const theme = getCurrentDashboardTheme("product-categories");
  if (theme == "dark") {
    layout["plot_bgcolor"] = "#222";
    layout["paper_bgcolor"] = "#222";
    layout["font"]["color"] = "#fff";
    layout["legend"]["bgcolor"] = "#444";
    layout["legend"]["font"]["color"] = "#fff";
  }

  try {
    createGraph(graphId, data, layout, config, graphHeight, graphWidth);
  } catch (err) {
    displayGraphError(graphId, err);
  }
}

function displayTopCategoriesGraphTwo(categoryStats) {
  categoryStats = categoryStats || lsGet("categoryStats");
  var excludeKeys = ["SPECIAL CATEGORIES", "OTHER", "MISC"];

  var graphHeight = 0.8583;
  var graphWidth = 0.9528;
  var height = graphHeight * document.documentElement.clientHeight;
  var width = graphWidth * document.documentElement.clientWidth;
  var titleFontSize = Math.floor(0.0156 * document.documentElement.clientWidth);
  var labelFontSize = Math.floor(0.0100 * document.documentElement.clientWidth);
  var legendFontSize =
    Math.floor(0.0100 * document.documentElement.clientWidth);
  var axisTitleSize = Math.floor(0.013 * document.documentElement.clientWidth);

  var values = [];
  var labels = [];
  var list = [];
  var type = "views";

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
      list.push({
        "value": value,
        "label": category.shortName
      });
    }
  }
  // Sort by value from largest to smallest
  list.sort(function(a,b) {
    return a.value > b.value ? -1 :
      a.value == b.value ? 0 :
      1;
  });
  for (let index = 0; index < list.length; index++) {
    const category = list[index];
    values.push(category.value);
    labels.push(category.label);
  }

  var data1 = {
    x: labels,
    y: values,
    name: "Total Views<br>By Category",
    type: 'bar',
    yaxis: "y",
    offsetgroup: 1,
    hoverlabel: {
      namelength: "-1"
    },
    hovertemplate: "%{label}<br>%{value:,} views"
  };

  // Avg Views Trace

  values = [];
  labels = [];
  list = [];
  type = "avgViews";

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
      list.push({
        "value": value,
        "label": category.shortName
      });
    }
  }
  // Sort by value from largest to smallest
  list.sort(function(a,b) {
    return a.value > b.value ? -1 :
      a.value == b.value ? 0 :
      1;
  });
  for (let index = 0; index < list.length; index++) {
    const category = list[index];
    values.push(category.value);
    labels.push(category.label);
  }

  var data2 = {
    x: labels,
    y: values,
    name: "Average Views Per Video<br>By Category",
    type: 'bar',
    yaxis: "y2",
    offsetgroup: 2,
    hoverlabel: {
      namelength: "-1"
    },
    hovertemplate: "%{label}<br>~%{value:,} views per video"
  };

  var data = [data1, data2];

  var layout = {
    height: height,
    width: width,
    font: {
      size: labelFontSize
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    legend: {
      bgcolor: "#eeeeee",
      font: {
        size: legendFontSize
      },
      x: 0.8
    },
    title: {
      font: {
        size: titleFontSize
      },
      text: "Product Category Performance"
    },
    xaxis: {
      automargin: true,
      fixedrange: true,
      title: {
        font: {
          size: axisTitleSize
        },
        text: "Category"
      }
    },
    yaxis: {
      automargin: true,
      fixedrange: true,
      title: {
        font: {
          size: axisTitleSize
        },
        text: "Total Category Views"
      }
    },
    yaxis2: {
      automargin: true,
      fixedrange: true,
      showgrid: false,
      overlaying: "y",
      side: "right",
      zeroline: false,
      title: {
        font: {
          size: axisTitleSize
        },
        text: "Average Views Per Video"
      },
    }
  };

  let config = {
    scrollZoom: false,
    displayModeBar: false,
  }

  const graphIds = getDashboardGraphIds("product-categories");
  const graphId = graphIds.graphTwo;

  const theme = getCurrentDashboardTheme("product-categories");
  if (theme == "dark") {
    layout["plot_bgcolor"] = "#222";
    layout["paper_bgcolor"] = "#222";
    layout["font"]["color"] = "#fff";
    layout["legend"]["bgcolor"] = "#444";
    layout["legend"]["font"]["color"] = "#fff";
  }

  try {
    createGraph(graphId, data, layout, config, graphHeight, graphWidth);
  } catch (err) {
    displayGraphError(graphId, err);
  }
}

function displayTopCategoriesGraphThree(categoryStats) {
  categoryStats = categoryStats || lsGet("categoryStats");
  var excludeKeys = ["SPECIAL CATEGORIES", "OTHER", "MISC"];

  let minStrength = 1;
  categoryStats.forEach(category => {
    if (category.root) {
      let strength = category.strength;
      if (strength < minStrength) {
        minStrength = strength;
      }
    }
  });

  var graphHeight = 0.8583;
  var graphWidth = 0.9528;
  var height = graphHeight * document.documentElement.clientHeight;
  var width = graphWidth * document.documentElement.clientWidth;
  var titleFontSize = Math.floor(0.0125 * document.documentElement.clientWidth);
  var labelFontSize = Math.floor(0.0100 * document.documentElement.clientWidth);
  var legendFontSize =
    Math.floor(0.0100 * document.documentElement.clientWidth);
  var axisTitleSize = Math.floor(0.013 * document.documentElement.clientWidth);

  let viewsList = [];
  let avgViewsList = [];
  let numVideosList = [];
  let labelList = [];
  let colors = [];
  let data = [];

  let labelConversion = categoryColors;

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
      let views = Math.round(category["views"]);
      let avgViews = Math.round(category["avgViews"]);
      let strength = Math.round(category["avgStrength"] * 100);
      let numVideos = category["videos"].length;
      let label = category.shortName;
      let color = labelConversion[category.shortName].color
      viewsList.push(views);
      avgViewsList.push(avgViews);
      numVideosList.push(numVideos);
      labelList.push(label);
      colors.push(color);
      data.push({
        x: [views],
        y: [numVideos],
        mode: "markers",
        type: 'scatter',
        marker: {
          color: [color],
          size: [strength],
          sizemode: "area"
        },
        customdata: [Math.round(category["avgStrength"])],
        name: label,
        text: [label],
        hoverlabel: {
          namelength: "-1"
        },
        hovertemplate: "<b>%{text}</b><br>%{x:,} views<br>%{y} videos<br>Category Strength: %{customdata:,}<extra></extra>"
      });
    }
  }

  var layout = {
    height: height,
    width: width,
    font: {
      size: labelFontSize
    },
    hovermode: "closest",
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    legend: {
      bgcolor: "#eeeeee",
      font: {
        size: legendFontSize
      },
      y: 0.5
    },
    title: {
      font: {
        size: titleFontSize
      },
      text: "<b>Product Category Performance</b><br>Circle Area is proportional to Category Strength"
    },
    xaxis: {
      automargin: true,
      fixedrange: true,
      gridcolor: "#aaaaaa",
      title: {
        font: {
          size: axisTitleSize
        },
        text: "Total Category Views"
      },
      type: "log"
    },
    yaxis: {
      automargin: true,
      fixedrange: true,
      gridcolor: "#888888",
      title: {
        font: {
          size: axisTitleSize
        },
        text: "Number of Videos"
      },
      type: "log"
    }
  };

  let config = {
    scrollZoom: false,
    displayModeBar: false,
  }

  const graphIds = getDashboardGraphIds("product-categories");
  const graphId = graphIds.graphThree;

  const theme = getCurrentDashboardTheme("product-categories");
  if (theme == "dark") {
    layout["plot_bgcolor"] = "#222";
    layout["paper_bgcolor"] = "#222";
    layout["font"]["color"] = "#fff";
    layout["legend"]["bgcolor"] = "#444";
    layout["legend"]["font"]["color"] = "#fff";
  }

  try {
    createGraph(graphId, data, layout, config, graphHeight, graphWidth);
  } catch (err) {
    displayGraphError(graphId, err);
  }
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
  const weights = lsGet("weights");
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

// Updates total views, likes, etc. for each category given all video stats
function updateCategoryTotals(allVideoStats) {
  let statsByVideoId = lsGet("statsByVideoId");
  let categoryTotals = lsGet("categoryTotals");

  allVideoStats.forEach(videoInfo => {
    let videoId = videoInfo.videoId;
    let duration = videoInfo.duration;
    let viewCount = videoInfo.views;
    let likeCount = videoInfo.likes;
    let strength = videoInfo.strength;

    statsByVideoId[videoId]["duration"] = duration;
    let categories = statsByVideoId[videoId]["categories"];
    for (let i = 0; i < categories.length; i++) {
      let categoryId = categories[i];
      if (categoryTotals[categoryId] == undefined) {
        categoryTotals[categoryId] = {};
        categoryTotals[categoryId]["videos"] = [];
      }
      let categoryViews = parseInt(categoryTotals[categoryId]["views"]);
      let categoryLikes = parseInt(categoryTotals[categoryId]["likes"]);
      let categoryDuration = parseInt(categoryTotals[categoryId]["duration"]);
      let categoryStrength = parseFloat(categoryTotals[categoryId]["strength"]);
      let categoryVideos = categoryTotals[categoryId]["videos"];
      categoryVideos.push(videoId);
      categoryTotals[categoryId]["views"] = categoryViews + viewCount;
      categoryTotals[categoryId]["likes"] = categoryLikes + likeCount;
      categoryTotals[categoryId]["duration"] = categoryDuration + duration;
      categoryTotals[categoryId]["strength"] = categoryStrength + strength;
      categoryTotals[categoryId]["videos"] = categoryVideos;
    }
  });
  lsSet("categoryTotals", categoryTotals);
  lsSet("statsByVideoId", statsByVideoId);

  return categoryTotals;
}

// Calculate stats for each category given totals for each category
function calcCategoryStats(categoryTotals) {
  let categoryStats = [];
  for (let categoryId in categoryTotals) {
    if (categoryTotals.hasOwnProperty(categoryId)) {
      let totals = categoryTotals[categoryId];
      let shortName = totals["shortName"];
      let name = totals["name"];
      let root = totals["root"];
      let leaf = totals["leaf"];
      let views = parseInt(totals["views"]);
      let likes = parseInt(totals["likes"]);
      let duration = parseInt(totals["duration"]);
      let totalStrength = parseFloat(totals["strength"]);
      let videos = totals["videos"];
      let numVideos = videos.length;
      let avgViews = views / numVideos;
      let avgLikes = likes / numVideos;
      let avgDuration = duration / numVideos;
      let avgStrength = totalStrength / numVideos;
      categoryStats.push({
        "avgDuration": avgDuration,
        "avgLikes": avgLikes,
        "avgViews": avgViews,
        "categoryId": categoryId,
        "duration": duration,
        "leaf": leaf,
        "likes": likes,
        "name": name,
        "root": root,
        "shortName": shortName,
        "totalStrength": totalStrength,
        "avgStrength": avgStrength,
        "videos": videos,
        "views": views
      });
    }
  }
  lsSet("categoryStats", categoryStats);

  return categoryStats;
}

function createGraph(graphId, data, layout, config, graphHeight, graphWidth,
  automargin) {
  try {
    Plotly.newPlot(graphId, data, layout, config);
    recordGraphData(graphId, data, layout, config, graphHeight, graphWidth,
      automargin);
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

// Empties localStorage.graphData and .graphSizes
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

function swapProductCategoriesGraphs() {
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
  } else if (activeDashboard == "videographer-avg-views") {
    const graphIds = getDashboardGraphIds("videographerGraphs").avgViews;
    graphOne = document.getElementById(graphIds.all);
    graphTwo = document.getElementById(graphIds.organic);
    graphThree = document.getElementById(graphIds.notOrganic);
  } else if (activeDashboard == "videographer-cumulative-videos") {
    const graphIds =
      getDashboardGraphIds("videographerGraphs").cumulativeVideos;
    graphOne = document.getElementById(graphIds.all);
    graphTwo = document.getElementById(graphIds.organic);
    graphThree = document.getElementById(graphIds.notOrganic);
  } else if (activeDashboard == "videographer-monthly-videos") {
    const graphIds = getDashboardGraphIds("videographerGraphs").monthlyVideos;
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
  $("#dashboard-carousel").carousel('pause');
  pauseText.style.display = "initial";
  playText.style.display = "none";
  isPaused = true;
}

function playDashboard() {
  let pauseText = document.getElementById("pause-text");
  let playText = document.getElementById("play-text");
  $("#dashboard-carousel").carousel('cycle');
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

function goToCarouselItem(index) {
  $(".carousel-container.active > .carousel").carousel(index);
}

function swapCarousels(direction) {
  let carouselList = $("#carousel-list");
  let numCarousels = carouselList.children().length;
  let activeCarouselContainer = $(".carousel-container.active");
  let activeNumber = parseInt(activeCarouselContainer.attr("carousel"));
  // Calculates the value of the next carousel
  let next = activeNumber + direction;
  let nextActiveNumber = ((next % numCarousels) + numCarousels) % numCarousels;
  let nextCarouselContainer = $(`.carousel-container[carousel='${nextActiveNumber}']`);
  pauseDashboard();
  activeCarouselContainer.removeClass("active");
  nextCarouselContainer.addClass("active");
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
  if (bool) {
    $("#dashboard-carousel").carousel('pause');
  } else if (!isPaused) {
    $("#dashboard-carousel").carousel('cycle');
  }
}

function setUpdatingStatus(bool) {
  isUpdating = bool;
  if (bool) {
    $("#dashboard-carousel").carousel('pause');
  } else if (!isPaused) {
    $("#dashboard-carousel").carousel('cycle');
  }
}

// Get current settings
if (!lsGet("settings")) {
  lsSet("settings", defaultSettings);
}
let currentSettings = lsGet("settings");
const settingsVersion = currentSettings.version;
const defaultVersion = defaultSettings.version;
if (settingsVersion == undefined || defaultVersion > settingsVersion) {
  lsSet("settings", defaultSettings);
  currentSettings = defaultSettings;
}
//console.log("Current Settings: ", currentSettings);


// Initialize carousels
var carouselInner = document.getElementById("main-carousel-inner");
var indicatorList = document.getElementById("main-indicator-list");
const cycleSpeed = currentSettings.cycleSpeed * 1000;
var carousel = document.getElementById("dashboard-carousel");
carousel.setAttribute("data-interval", cycleSpeed);
carousel.setAttribute("data-pause", "false");

const categoryStatsCarousel = document.getElementById("category-stats-carousel");
categoryStatsCarousel.setAttribute("data-interval", 0);
categoryStatsCarousel.setAttribute("data-pause", "false");

const videographerCarousel = document.getElementById("videographer-carousel");
videographerCarousel.setAttribute("data-interval", 0);
videographerCarousel.setAttribute("data-pause", "false");

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

// Handle carousel scrolling and keyboard shortcuts
document.addEventListener("keyup", function (e) {
  if (e.key == "ArrowLeft") {
    carouselPrev();
  } else if (e.key == "ArrowRight") {
    carouselNext();
  } else if (e.key == "ArrowDown") {
    swapCarousels(1);
  } else if (e.key == "ArrowUp") {
    swapCarousels(-1);
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
    swapProductCategoriesGraphs();
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
  // showLoadingText();
  var carouselName = e.target.getAttribute("name");
  var indicatorName = carouselName + "-indicator-";
  var startIndicator = document.getElementById(indicatorName + e.from);
  var endIndicator = document.getElementById(indicatorName + e.to);
  startIndicator.classList.remove("active");
  endIndicator.classList.add("active");
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

let isLoading = false;
let isPaused = false;
let isUpdating = false;