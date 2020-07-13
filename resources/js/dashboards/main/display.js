/* Platform Dashboard */

// Loads demographics table in platform dashboard
function displayChannelDemographics(response) {
  const rows = response.result.rows;
  let maleTotal = 0;
  let femaleTotal = 0;
  let maleMax = 0;
  let femaleMax = 0;
  for (var i = 0; i < rows.length; i++) {
    const percentage = parseFloat(rows[i][2]);
    if (rows[i][1] == "female") {
      femaleTotal += percentage;
      if (percentage > femaleMax) {
        femaleMax = percentage;
      }
    } else {
      maleTotal += percentage;
      if (percentage > maleMax) {
        maleMax = percentage;
      }
    }
  }
  for (var i = 0; i < rows.length; i++) {
    const range = rows[i][0].substr(3);
    const percentage = rows[i][2];
    let cell = document.getElementById(rows[i][1] + "-" + range);
    cell.innerHTML = `<span>${percentage}</span>%`;
    if (rows[i][1] == "female") {
      cell.style.opacity = ((parseFloat(percentage) / femaleMax) + 1.5) / 2.5;
    } else {
      cell.style.opacity = ((parseFloat(percentage) / maleMax) + 1.5) / 2.5;
    }
  }
  maleTotal = Math.round(maleTotal * 10) / 10;
  femaleTotal = Math.round(femaleTotal * 10) / 10;
  if (maleTotal + femaleTotal != 100) {
    const diff = 100 - (maleTotal + femaleTotal);
    femaleTotal += diff;
    femaleTotal = Math.round(femaleTotal * 10) / 10;
  }
  document.getElementById("male-title").innerHTML = `
    <i class="fas fa-male" style="font-size:3rem"></i>
    <br>
    <span style="font-size:2rem">${maleTotal}</span>
    %
  `;
  document.getElementById("female-title").innerHTML = `
    <i class="fas fa-female" style="font-size:3rem"></i>
    <br>
    <span style="font-size:2rem">${femaleTotal}</span>
    %
  `;

  const graphHeight = 0.0875;
  const graphWidth = 0.0500;
  const height = graphHeight * document.documentElement.clientHeight;
  const width = graphWidth * document.documentElement.clientWidth;

  const values = [maleTotal, femaleTotal];
  const labels = ["Male", "Female"];
  const data = [{
    values: values,
    labels: labels,
    textinfo: "none",
    hoverinfo: "none",
    marker: {
      colors: ["rgb(84, 157, 209)", "rgb(146, 111, 209)"]
    },
    type: 'pie',
  }];

  let layout = {
    height: height,
    weight: width,
    showlegend: false,
    margin: {
      l: 0,
      r: 0,
      t: 0,
      b: 0,
      pad: 4
    }
  };

  const config = {
    staticPlot: true
  };

  if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
    const theme = getCurrentDashboardTheme("platform");
    if (theme == "dark") {
      layout["plot_bgcolor"] = "#222";
      layout["paper_bgcolor"] = "#222";
    }
  }

  const graphIds = getDashboardGraphIds("platform");
  const graphId = graphIds.demographics;

  var graphContainer = document.getElementById(graphId);
  graphContainer.style.height = width + "px";
  graphContainer.style.width = width + "px";


  try {
    createGraph(graphId, data, layout, config, graphHeight, graphWidth);
  } catch (err) {
    recordError(err, "Unable to display channel demographics graph");
    return Promise.resolve("Error Displaying Channel Demographics");
  }

  if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
    const body = {
      values: [
        [
          JSON.stringify(rows)
        ]
      ]
    }
    return updateSheetData("Stats", "Channel Demographics", body)
      .then(response => {
        return "Displayed Channel Demographics";
      });
  }
  return Promise.resolve("Displayed Channel Demographics");
}

// Creates top search terms graph in platform dashboard
function displayChannelSearchTerms(response) {
  const searchTerms = response.result.rows;
  let xValues = [];
  let yValues = [];
  const numTerms = Math.min(9, searchTerms.length + -1);
  for (var i = numTerms; i >= 0; i--) {
    xValues.push(searchTerms[i][1]);
    yValues.push(searchTerms[i][0]);
  }
  var textValues = xValues.map(String);
  for (var i = 0; i < textValues.length; i++) {
    textValues[i] = numberWithCommas(textValues[i]);
  }

  const graphHeight = 0.2287;
  const graphWidth = 0.4681;
  const height = graphHeight * document.documentElement.clientHeight;
  const width = graphWidth * document.documentElement.clientWidth;
  const fontSize = Math.floor(0.0125 * document.documentElement.clientWidth);
  let yaxis = {
    showline: true,
    showticklabels: true,
    tickmode: 'linear',
    automargin: true
  };
  let automargin = {
    yaxis: yaxis
  };

  const data = [{
    x: xValues,
    y: yValues,
    type: 'bar',
    orientation: 'h',
    text: textValues,
    textposition: 'auto',
    marker: {
      color: 'rgb(255,0,0)'
    }
  }];

  let layout = {
    height: height,
    width: width,
    font: {
      size: fontSize
    },
    margin: {
      b: 10,
      r: 0,
      t: 10,
    },
    xaxis: {
      visible: false,
      automargin: true
    },
    yaxis: yaxis
  };

  const config = {
    staticPlot: true,
    responsive: true
  };

  const theme = getCurrentDashboardTheme("platform");
  if (theme == "dark") {
    layout["plot_bgcolor"] = "#222";
    layout["paper_bgcolor"] = "#222";
    layout["font"]["color"] = "#fff";
    yaxis["linecolor"] = "#fff";
    layout["yaxis"] = yaxis;
    automargin = {
      yaxis: yaxis
    };
  }

  const graphIds = getDashboardGraphIds("platform");
  const graphId = graphIds.searchTerms;

  try {
    createGraph(graphId, data, layout, config, graphHeight, graphWidth, true,
      automargin);
  } catch (err) {
    displayGraphError(graphId, err);
    return Promise.resolve("Error Displaying Channel Search Terms");
  }
  return Promise.resolve("Displayed Channel Search Terms");
}

// Creates minutes by subscribers graph in platform dashboard
function displayWatchTimeBySubscribedStatus(response) {
  const rows = response.result.rows;
  const labelConversion = {
    "UNSUBSCRIBED": "Not Subscribed",
    "SUBSCRIBED": "Subscribed"
  };
  var total = 0;
  var xValues = [];
  var yValues = [];
  for (var i = 0; i < rows.length; i++) {
    total += rows[i][1];
    xValues.push(rows[i][1]);
    yValues.push(labelConversion[rows[i][0]]);
  }
  var textValues = [];
  for (var i = 0; i < xValues.length; i++) {
    textValues[i] = decimalToPercent(xValues[i] / total) + "%";
  }
  if (xValues[0] > xValues[1]) {
    xValues.reverse();
    yValues.reverse();
    textValues.reverse();
  }

  const graphHeight = 0.1039;
  const graphWidth = 0.4681;
  const height = graphHeight * document.documentElement.clientHeight;
  const width = graphWidth * document.documentElement.clientWidth;
  const fontSize = Math.floor(0.0125 * document.documentElement.clientWidth);
  let yaxis = {
    showline: true,
    showticklabels: true,
    tickmode: 'linear',
    automargin: true
  };
  let automargin = {
    yaxis: yaxis
  };

  const data = [{
    x: xValues,
    y: yValues,
    type: 'bar',
    orientation: 'h',
    text: textValues,
    textposition: 'auto',
    marker: {
      color: 'rgb(255,0,0)'
    }
  }];

  let layout = {
    height: height,
    width: width,
    font: {
      size: fontSize
    },
    margin: {
      r: 0,
      t: 10,
      b: 10
    },
    xaxis: {
      visible: false,
      automargin: true
    },
    yaxis: yaxis,
  };

  const config = {
    staticPlot: true,
    responsive: true
  };

  const theme = getCurrentDashboardTheme("platform");
  if (theme == "dark") {
    layout["plot_bgcolor"] = "#222";
    layout["paper_bgcolor"] = "#222";
    layout["font"]["color"] = "#fff";
    yaxis["linecolor"] = "#fff";
    layout["yaxis"] = yaxis;
    automargin = {
      yaxis: yaxis
    };
  }

  const graphIds = getDashboardGraphIds("platform");
  const graphId = graphIds.watchTime;

  try {
    createGraph(graphId, data, layout, config, graphHeight, graphWidth, true,
      automargin);
  } catch (err) {
    displayGraphError(graphId, err);
    return Promise.resolve("Error Displaying Watch Time By Subscribed Status");
  }
  return Promise.resolve("Displayed Watch Time By Subscribed Status");
}

// Creates views by device type graph in platform dashboard
function displayViewsByDeviceType(response) {
  let rows = response.result.rows;
  const temp = rows[1];
  rows[1] = rows[3];
  rows[3] = temp;
  const labelConversion = {
    "DESKTOP": "Desktop",
    "MOBILE": "Mobile",
    "TABLET": "Tablet",
    "TV": "TV",
    "GAME_CONSOLE": "Game<br>Console"
  };
  let values = [];
  let labels = [];
  for (let i = 0; i < rows.length; i++) {
    values.push(rows[i][1]);
    labels.push(labelConversion[rows[i][0]]);
  }

  const graphHeight = 0.3742;
  const graphWidth = 0.3065;
  const height = graphHeight * document.documentElement.clientHeight;
  const width = graphWidth * document.documentElement.clientWidth;
  const fontSize = Math.floor(0.0125 * document.documentElement.clientWidth);
  const hoverFontSize = Math.floor(0.01 * document.documentElement.clientWidth);

  const data = [{
    values: values,
    labels: labels,
    direction: 'clockwise',
    hovertemplate: "<b>%{label}</b><br>%{value} views<br>" + 
      "%{percent} of total views<extra></extra>",
    rotation: -120,
    sort: false,
    textinfo: 'label+percent',
    textposition: ["inside", "outside", "outside", "inside", "outside"],
    type: 'pie'
  }];

  let layout = {
    height: height,
    width: width,
    automargin: true,
    autosize: true,
    font: {
      size: fontSize
    },
    hoverlabel: {
      font: {
        size: hoverFontSize
      }
    },
    margin: {
      b: 20,
      l: 0,
      r: 0,
      t: 0,
      pad: 4
    },
    showlegend: false
  };

  const config = {
    responsive: true,
    staticPlot: true
  };

  const theme = getCurrentDashboardTheme("platform");
  if (theme == "dark") {
    layout["plot_bgcolor"] = "#222";
    layout["paper_bgcolor"] = "#222";
    layout["font"]["color"] = "#fff";
  }

  const graphIds = getDashboardGraphIds("platform");
  const graphId = graphIds.deviceType;

  try {
    createGraph(graphId, data, layout, config, graphHeight, graphWidth);
  } catch (err) {
    displayGraphError(graphId, err);
    return Promise.resolve("Error Displaying Views By Device Type");
  }
  return Promise.resolve("Displayed Views By Device Type");
}

// Creates views by state cholorpleth map in platform dashboard
function displayViewsByState(response) {
  const rows = response.result.rows;

  const stateAbbrToName = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AS": "American Samoa",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District Of Columbia",
    "FM": "Federated States Of Micronesia",
    "FL": "Florida",
    "GA": "Georgia",
    "GU": "Guam",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MH": "Marshall Islands",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
  };

  let locations = [];
  let stateNames = [];
  let z = []
  let labels = [];
  for (let i = 0; i < rows.length; i++) {
    let location = rows[i][0].substr(3);
    locations.push(location);
    stateNames.push(stateAbbrToName[location]);
    z.push(rows[i][1]);
    labels.push(numberWithCommas(rows[i][1]) + " views")
  }

  const graphHeight = 0.3742;
  const graphWidth = 0.4681;
  const height = graphHeight * document.documentElement.clientHeight;
  const width = graphWidth * document.documentElement.clientWidth;
  const fontSize = Math.floor(0.0093 * document.documentElement.clientWidth);
  const hoverFontSize = Math.floor(0.01 * document.documentElement.clientWidth);

  let data = [{
    autocolorscale: true,
    colorbar: {
      tickfont: {
        size: fontSize
      }
    },
    customdata: stateNames,
    hovertemplate: "<b>%{customdata}</b><br>%{text}<extra></extra>",
    locationmode: 'USA-states',
    locations: locations,
    name: "Views By State",
    text: labels,
    type: 'choropleth',
    z: z
  }];

  let layout = {
    height: height,
    width: width,
    geo: {
      countrycolor: 'rgb(255, 255, 255)',
      lakecolor: 'rgb(255, 255, 255)',
      landcolor: 'rgb(217, 217, 217)',
      scope: 'usa',
      showlakes: true,
      showland: true,
      subunitcolor: 'rgb(255, 255, 255)'
    },
    hoverlabel: {
      font: {
        size: hoverFontSize
      }
    },
    margin: {
      b: 10,
      l: 0,
      r: 0,
      t: 0,
      pad: 4,
    }
  };

  const config = {
    displayModeBar: false,
    responsive: true,
    scrollZoom: false
  };

  const theme = getCurrentDashboardTheme("platform");
  if (theme == "dark") {
    layout["plot_bgcolor"] = "#222";
    layout["paper_bgcolor"] = "#222";
    data[0]["colorbar"] = {
      tickfont: {
        color: "#fff"
      }
    };
    layout["geo"]["bgcolor"] = "#222";
    layout["geo"]["showlakes"] = false;
  }

  const graphIds = getDashboardGraphIds("platform");
  const graphId = graphIds.states;

  try {
    createGraph(graphId, data, layout, config, graphHeight, graphWidth);
  } catch (err) {
    displayGraphError(graphId, err);
    return Promise.resolve("Error Displaying Views By State");
  }
  return Promise.resolve("Displayed Views By State");
}

// Creates views by traffic source graph in platform dashboard
function displayViewsByTrafficSource(response) {
  const rows = response.result.rows;
  let advertisingViews = 0;
  let externalViews = 0;
  let youtubeSearchViews = 0;
  let relatedViews = 0;
  let otherViews = 0;
  const advertisingSources = ["ADVERTISING", "PROMOTED"];
  const externalSources = ["EXT_URL", "NO_LINK_EMBEDDED", "NO_LINK_OTHER"];
  const youtubeSearchSources = ["YT_SEARCH"];
  const relatedSources = ["RELATED_VIDEO"];
  for (var i = 0; i < rows.length; i++) {
    if (advertisingSources.includes(rows[i][0])) {
      advertisingViews += rows[i][1];
    } else if (externalSources.includes(rows[i][0])) {
      externalViews += rows[i][1];
    } else if (youtubeSearchSources.includes(rows[i][0])) {
      youtubeSearchViews += rows[i][1];
    } else if (relatedSources.includes(rows[i][0])) {
      relatedViews += rows[i][1];
    } else {
      otherViews += rows[i][1];
    }
  }
  const values = [advertisingViews, externalViews, youtubeSearchViews,
    relatedViews, otherViews
  ];
  const labels = ["Advertising", "External", "YouTube<br>Search",
    "Related<br>Video", "Other"
  ];

  const graphHeight = 0.3742;
  const graphWidth = 0.3065;
  const height = graphHeight * document.documentElement.clientHeight;
  const width = graphWidth * document.documentElement.clientWidth;
  const fontSize = Math.floor(0.0125 * document.documentElement.clientWidth);
  const hoverFontSize = Math.floor(0.01 * document.documentElement.clientWidth);

  const data = [{
    values: values,
    labels: labels,
    hovertemplate:  "<b>%{label}</b><br>%{value} views<br>" + 
      "%{percent} of total views<extra></extra>",
    rotation: 90,
    textinfo: 'label+percent',
    textposition: "inside",
    type: 'pie'
  }];

  let layout = {
    height: height,
    width: width,
    automargin: true,
    autosize: true,
    font: {
      size: fontSize
    },
    hoverlabel: {
      font: {
        size: hoverFontSize
      }
    },
    margin: {
      b: 10,
      l: 0,
      r: 0,
      t: 0,
      pad: 4
    },
    showlegend: false
  };

  const config = {
    responsive: true,
    staticPlot: true
  };

  const theme = getCurrentDashboardTheme("platform");
  if (theme == "dark") {
    layout["plot_bgcolor"] = "#222";
    layout["paper_bgcolor"] = "#222";
    layout["font"]["color"] = "#fff";
  }

  const graphIds = getDashboardGraphIds("platform");
  const graphId = graphIds.trafficSource;

  try {
    createGraph(graphId, data, layout, config, graphHeight, graphWidth);
  } catch (err) {
    displayGraphError(graphId, err);
    return Promise.resolve("Error Displaying Views By Traffic Source");
  }
  return Promise.resolve("Displayed Views By Traffic Source");
}


/* Real Time Stats Dashboard */

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


/* Thumbnail Dashboard */

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


/* Top Video Dashboards */

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

// Displays video views, likes, comments, etc. in top video dashboard
function displayVideoBasicStats(response, dashboardIds, videoData) {
  const rows = response.result.rows;
  for (let index = 0; index < rows.length; index++) {
    const stats = rows[index];

    const videoId = stats[0];
    const dashboardId = dashboardIds[videoId];

    let views = document.getElementById(dashboardId + "-views");
    views.innerHTML = numberWithCommas(stats[1]);

    let subsNet = document.getElementById(dashboardId + "-subs-net");
    subsNet.innerHTML = numberWithCommas(stats[7] - stats[8]);

    let likeRatioElem = document.getElementById(dashboardId + "-like-ratio");
    let likes = document.getElementById(dashboardId + "-likes");
    let likeBar = document.getElementById(dashboardId + "-like-bar");
    const likeRatio = decimalToPercent(stats[3] / (stats[3] + stats[4]));
    likeRatioElem.innerHTML = likeRatio + "%";
    likes.innerHTML = numberWithCommas(stats[3]) + " Likes";
    likeBar.style.width = likeRatio + "%";
    likeBar.setAttribute("aria-valuenow", likeRatio);

    let dislikes = document.getElementById(dashboardId + "-dislikes");
    dislikes.innerHTML = stats[4] + " Dislikes";

    let comments = document.getElementById(dashboardId + "-comments");
    comments.innerHTML = numberWithCommas(stats[2]);

    let avgViewDuration =
      document.getElementById(dashboardId + "-avg-view-duration");
    const avd = stats[6];
    avgViewDuration.innerHTML = secondsToDuration(avd);
    const videoDuration =
      document.getElementById(dashboardId + "-duration-seconds").innerHTML;

    const avp = decimalToPercent(avd / videoDuration);
    let avgViewPercentage =
      document.getElementById(dashboardId + "-avg-view-percentage");
    avgViewPercentage.innerHTML = " (" + avp + "%)";

    let estimatedMinutesWatched =
      document.getElementById(dashboardId + "-minutes-watched");
    estimatedMinutesWatched.innerHTML = numberWithCommas(stats[5]);

    if (videoData != undefined) {
      videoData[videoId]["views"] = stats[1];
      videoData[videoId]["subscribersGained"] = stats[7] - stats[8];
      videoData[videoId]["avgViewDuration"] = stats[6];
      videoData[videoId]["minutesWatched"] = stats[5];
      videoData[videoId]["comments"] = stats[2];
      videoData[videoId]["likes"] = stats[3];
      videoData[videoId]["dislikes"] = stats[4];
    }
  }
  if (videoData == undefined) {
    return null;
  }
  return videoData;
}

// Creates top search terms graph for a video in top video dashboard
function displayVideoSearchTerms(response, dashboardId) {
  if (response) {
    let searchTerms = response.result.rows;
    let xValues = [];
    let yValues = [];
    let numTerms = Math.min(4, searchTerms.length - 1);
    for (var i = numTerms; i >= 0; i--) {
      xValues.push(searchTerms[i][1]);
      yValues.push(searchTerms[i][0]);
    }
    var textValues = xValues.map(String);
    for (var i = 0; i < textValues.length; i++) {
      textValues[i] = numberWithCommas(textValues[i]);
    }

    var graphHeight = 0.2280;
    var graphWidth = 0.4681;
    var height = graphHeight * document.documentElement.clientHeight;
    var width = graphWidth * document.documentElement.clientWidth;
    var fontSize = Math.floor(0.0125 * document.documentElement.clientWidth);
    var yaxis = {
      showline: true,
      showticklabels: true,
      tickmode: 'linear',
      automargin: true
    };
    var automargin = {
      yaxis: yaxis
    };

    var data = [{
      x: xValues,
      y: yValues,
      type: 'bar',
      orientation: 'h',
      text: textValues,
      textangle: 0,
      textposition: 'auto',
      marker: {
        color: 'rgb(255,0,0)'
      }
    }];

    var layout = {
      height: height,
      width: width,
      font: {
        size: fontSize
      },
      autosize: false,
      margin: {
        b: 0,
        r: 0,
        t: 0,
      },
      xaxis: {
        visible: false
      },
      yaxis: yaxis
    };

    var config = {
      staticPlot: true,
      responsive: true
    };

    const theme = getCurrentDashboardTheme(dashboardId);
    if (theme == "dark") {
      layout["plot_bgcolor"] = "#222";
      layout["paper_bgcolor"] = "#222";
      layout["font"]["color"] = "#fff";
      yaxis["linecolor"] = "#fff";
      layout["yaxis"] = yaxis;
      automargin = {
        yaxis: yaxis
      };
    }

    const graphIds = getDashboardGraphIds(dashboardId);
    const graphId = graphIds.searchTerms;

    try {
      createGraph(graphId, data, layout, config, graphHeight, graphWidth, true,
        automargin);
    } catch (err) {
      displayGraphError(graphId);
      throw err;
    }
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


/* Video Strength Dashboard */

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

/**
 * Sort videos in `allVideoStats` from highest strength to lowest strength.
 * Some videos' strength is set to `undefined`. Those videos are sorted to the
 * end of the array
 *
 * @param {*} a An element in `allVideoStats`
 * @param {*} b An element in `allVideoStats`
 * @returns The element with higher strength or higher `totalStrength` if the
 *  two strengths are equal
 */
function sortVideosByStrength(a, b) {
  if (a.strength == undefined) {
    return 1;
  }
  if (b.strength == undefined) {
    return -1;
  }
  if (a.strength == b.strength) {
    return b.totalStrength - a.totalStrength;
  } else {
    return b.strength - a.strength;
  }
}