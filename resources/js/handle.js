/* Handles responses of API calls */


/* Get All Video Stats Calls */

function handleVideoViewsByYear(response, settings) {
  if (response) {
    let stats = response.result.rows[0];
    if (stats) {
      let videoId = stats[0];
      let viewCount = stats[1];
      let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
      let categoryYearlyTotals =
          JSON.parse(localStorage.getItem("categoryYearlyTotals"));
      let categories = statsByVideoId[videoId]["categories"];
      for (let i = 0; i < categories.length; i++) {
        let categoryId = categories[i];
        let categoryViews = parseInt(categoryYearlyTotals[categoryId]["views"]);
        let categoryNumVideos =
            parseInt(categoryYearlyTotals[categoryId]["numVideos"]);
        categoryYearlyTotals[categoryId]["views"] = categoryViews + viewCount;
        categoryYearlyTotals[categoryId]["numVideos"] = categoryNumVideos + 1;
      }
      localStorage.setItem("categoryYearlyTotals",
          JSON.stringify(categoryYearlyTotals));
    }

    let uploads = settings["uploads"];
    let index = parseInt(settings["index"]);
    if (index + 1 < uploads.length) {
      settings["index"] = index + 1;
      requestVideoViewsByYear(settings);
    } else {
      let year = settings["year"];
      saveCategoryYearlyStatsToSheets(year);
    }
  }
}


/* Platform Dashboard Calls */

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

  const graphId = "demographics-graph";
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
    var currentSettings = JSON.parse(localStorage.getItem("settings"));
    var theme = "";
    var index = 0;
    while (index < currentSettings.dashboards.length && theme == "") {
      if (currentSettings.dashboards[index].name == "platform") {
        theme = currentSettings.dashboards[index].theme;
      }
      index++;
    }
    if (theme == "dark") {
      layout["plot_bgcolor"] = "#222";
      layout["paper_bgcolor"] = "#222";
    }
  }

  var graphContainer = document.getElementById(graphId);
  graphContainer.style.height = width + "px";
  graphContainer.style.width = width + "px";

  Plotly.newPlot(graphId, data, layout, config);

  recordGraphData(graphId, data, layout, config, graphHeight, graphWidth);
  recordGraphSize(graphId, graphHeight, graphWidth);

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
  const numTerms = Math.min(9, searchTerms.length+ - 1);
  for (var i = numTerms; i >= 0; i--) {
    xValues.push(searchTerms[i][1]);
    yValues.push(searchTerms[i][0]);
  }
  var textValues = xValues.map(String);
  for (var i = 0; i < textValues.length; i++) {
    textValues[i] = numberWithCommas(textValues[i]);
  }

  const graphId = "channel-search-terms";
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
  let automargin = {yaxis: yaxis};

  const data = [
    {
      x: xValues,
      y: yValues,
      type: 'bar',
      orientation: 'h',
      text: textValues,
      textposition: 'auto',
      marker: {
        color: 'rgb(255,0,0)'
      }
    }
  ];
  
  let layout = {
    height: height,
    width: width,
    font: {size: fontSize},
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

  var currentSettings = JSON.parse(localStorage.getItem("settings"));
  var theme = "";
  var index = 0;
  while (index < currentSettings.dashboards.length && theme == "") {
    if (currentSettings.dashboards[index].name == "platform") {
      theme = currentSettings.dashboards[index].theme;
    }
    index++;
  }
  if (theme == "dark") {
    layout["plot_bgcolor"] = "#222";
    layout["paper_bgcolor"] = "#222";
    layout["font"]["color"] = "#fff";
    yaxis["linecolor"] = "#fff";
    layout["yaxis"] = yaxis;
    automargin = {yaxis: yaxis};
  }
  
  Plotly.newPlot(graphId, data, layout, config);

  recordGraphData(graphId, data, layout, config, graphHeight, graphWidth,
    automargin);
  recordGraphSize(graphId, graphHeight, graphWidth, automargin);
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

  const graphId = "channel-watch-time";
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
  let automargin = {yaxis: yaxis};
  
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
    font: {size: fontSize},
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

  var currentSettings = JSON.parse(localStorage.getItem("settings"));
  var theme = "";
  var index = 0;
  while (index < currentSettings.dashboards.length && theme == "") {
    if (currentSettings.dashboards[index].name == "platform") {
      theme = currentSettings.dashboards[index].theme;
    }
    index++;
  }
  if (theme == "dark") {
    layout["plot_bgcolor"] = "#222";
    layout["paper_bgcolor"] = "#222";
    layout["font"]["color"] = "#fff";
    yaxis["linecolor"] = "#fff";
    layout["yaxis"] = yaxis;
    automargin = {yaxis: yaxis};
  }
  
  Plotly.newPlot(graphId, data, layout, config);

  recordGraphData(graphId, data, layout, config, graphHeight, graphWidth,
    automargin);
  recordGraphSize(graphId, graphHeight, graphWidth, automargin);
  return Promise.resolve("Displayed Watch Time By Subscribed Status");
}

// Creates views by device type graph in platform dashboard
function displayViewsByDeviceType(response) {
  var rows = response.result.rows;
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
  var values = [];
  var labels = [];
  for (var i = 0; i < rows.length; i++) {
    values.push(rows[i][1]);
    labels.push(labelConversion[rows[i][0]]);
  }
  
  const graphId = "channel-views-by-device";
  const graphHeight = 0.3742;
  const graphWidth = 0.3065;
  const height = graphHeight * document.documentElement.clientHeight;
  const width = graphWidth * document.documentElement.clientWidth;
  const fontSize = Math.floor(0.0125 * document.documentElement.clientWidth);
  
  const data = [{
    values: values,
    labels: labels,
    type: 'pie',
    sort: false,
    textinfo: 'label+percent',
    textposition: ["inside", "outside", "outside", "inside", "outside"],
    rotation: -120,
    direction: 'clockwise'
  }];
  
  let layout = {
    height: height,
    width: width,
    font: {size: fontSize},
    automargin: true,
    autosize: true,
    showlegend: false,
    margin: {
      l: 0,
      r: 0,
      t: 0,
      b: 20,
      pad: 4
    }
  };
  
  const config = {
    staticPlot: true,
    responsive: true
  };

  var currentSettings = JSON.parse(localStorage.getItem("settings"));
  var theme = "";
  var index = 0;
  while (index < currentSettings.dashboards.length && theme == "") {
    if (currentSettings.dashboards[index].name == "platform") {
      theme = currentSettings.dashboards[index].theme;
    }
    index++;
  }
  if (theme == "dark") {
    layout["plot_bgcolor"] = "#222";
    layout["paper_bgcolor"] = "#222";
    layout["font"]["color"] = "#fff";
  }
  
  Plotly.newPlot(graphId, data, layout, config);

  recordGraphData(graphId, data, layout, config, graphHeight, graphWidth);
  recordGraphSize(graphId, graphHeight, graphWidth);
  return Promise.resolve("Displayed Views By Device Type");
}

// Creates views by state cholorpleth map in platform dashboard
function displayViewsByState(response) {
  const rows = response.result.rows;
  var locations = [];
  var z = []
  var labels = [];
  for (var i = 0; i < rows.length; i++) {
    locations.push(rows[i][0].substr(3));
    z.push(rows[i][1]);
    labels.push(numberWithCommas(rows[i][1]) + " views")
  }

  const graphId = "channel-views-by-state";
  const graphHeight = 0.3742;
  const graphWidth = 0.4681;
  const height = graphHeight * document.documentElement.clientHeight;
  const width = graphWidth * document.documentElement.clientWidth;
  const fontSize = Math.floor(0.0093 * document.documentElement.clientWidth);

  let data = [{
    type: 'choropleth',
    locationmode: 'USA-states',
    locations: locations,
    z: z,
    text: labels,
    hovertemplate: "%{location}<br>%{text}",
    name: "Views By State",
    autocolorscale: true,
    colorbar: {
      tickfont: {
        size: fontSize
      }
    }
  }];

  let layout = {
    height: height,
    width: width,
    geo:{
        scope: 'usa',
        countrycolor: 'rgb(255, 255, 255)',
        showland: true,
        landcolor: 'rgb(217, 217, 217)',
        showlakes: true,
        lakecolor: 'rgb(255, 255, 255)',
        subunitcolor: 'rgb(255, 255, 255)'
    },
    margin: {
      l: 0,
      r: 0,
      t: 0,
      b: 10,
      pad: 4
    }
  };

  const config = {
    scrollZoom: false,
    displayModeBar: false,
    responsive: true
  };

  var currentSettings = JSON.parse(localStorage.getItem("settings"));
  var theme = "";
  var index = 0;
  while (index < currentSettings.dashboards.length && theme == "") {
    if (currentSettings.dashboards[index].name == "platform") {
      theme = currentSettings.dashboards[index].theme;
    }
    index++;
  }
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

  Plotly.plot(graphId, data, layout, config);

  recordGraphData(graphId, data, layout, config, graphHeight, graphWidth);
  recordGraphSize(graphId, graphHeight, graphWidth);
  return Promise.resolve("Displayed Views By State");
}

// Creates views by traffic source graph in platform dashboard
function displayViewsByTrafficSource(response) {
  const rows = response.result.rows;
  var advertisingViews = 0;
  var externalViews = 0;
  var youtubeSearchViews = 0;
  var relatedViews = 0;
  var otherViews = 0;
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
      relatedViews, otherViews];
  const labels = ["Advertising", "External", "YouTube<br>Search",
      "Related<br>Video", "Other"];

  const graphId = "channel-traffic-sources";
  const graphHeight = 0.3742;
  const graphWidth = 0.3065;
  const height = graphHeight * document.documentElement.clientHeight;
  const width = graphWidth * document.documentElement.clientWidth;
  const fontSize = Math.floor(0.0125 * document.documentElement.clientWidth);

  const data = [{
    values: values,
    labels: labels,
    type: 'pie',
    textinfo: 'label+percent',
    textposition: "inside",
    rotation: 90
  }];

  let layout = {
    height: height,
    width: width,
    font: {size: fontSize},
    automargin: true,
    autosize: true,
    showlegend: false,
    margin: {
      l: 0,
      r: 0,
      t: 0,
      b: 10,
      pad: 4
    }
  };

  const config = {
    staticPlot: true,
    responsive: true
  };

  var currentSettings = JSON.parse(localStorage.getItem("settings"));
  var theme = "";
  var index = 0;
  while (index < currentSettings.dashboards.length && theme == "") {
    if (currentSettings.dashboards[index].name == "platform") {
      theme = currentSettings.dashboards[index].theme;
    }
    index++;
  }
  if (theme == "dark") {
    layout["plot_bgcolor"] = "#222";
    layout["paper_bgcolor"] = "#222";
    layout["font"]["color"] = "#fff";
  }
  
  Plotly.newPlot(graphId, data, layout, config);

  recordGraphData(graphId, data, layout, config, graphHeight, graphWidth);
  recordGraphSize(graphId, graphHeight, graphWidth);
  return Promise.resolve("Displayed Views by Traffic Source");
}


/* Top Ten Dashboard Calls */

// Saves most watched videos by month to a Google Sheet
function handleMostWatchedVideos(response, month) {
  if (response) {
    var videos = response.result.rows;
    let uploads = JSON.parse(localStorage.getItem("uploads"));
    if (month != undefined) {
      var values = [[month]];
      var index = 0;
      var numVideos = 1;
      while (numVideos <= 10) {
        if (uploads.includes(videos[index][0])) {
          values[0][numVideos] = videos[index][0];
          values[0][numVideos + 10] = videos[index][1];
          values[0][numVideos + 20] = videos[index][2];
          numVideos++;
        }
        index++;
      }
      var body = {
        "values": values
      };
      var row = 3 + monthDiff(new Date(2010, 6), new Date(month));
      var sheet = "Top Ten Videos!A" + row;
      updateSheetData("Stats", sheet, body);
    }
  }
}


/* Top Video Calls */

// Displays video views, likes, comments, etc. in top video dashboard
function handleVideoBasicStats(response, dashboardIds, videoData) {
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

// Creates daily views graph for a video in top video dashboard
function handleVideoDailyViews(response, dashboardId) {
  if (response) {
    let rows = response.result.rows;
    var xValues = [];
    var yValues = [];

    for (var i = 0; i < rows.length; i++) {
      xValues.push(rows[i][0]);
      yValues.push(rows[i][1]);
    }

    var graphId = dashboardId + "-views-graph";
    var graphHeight = 0.2280;
    var graphWidth = 0.4681;
    var height = graphHeight * document.documentElement.clientHeight;
    var width = graphWidth * document.documentElement.clientWidth;
    var fontSize = Math.floor(0.0104 * document.documentElement.clientWidth);
    var xaxis = {
      automargin: true,
      fixedrange: true,
      tickangle: -60,
      tickformat: '%-m/%d',
      type: 'date'
    };
    var yaxis = {
      automargin: true,
      fixedrange: true,
      showline: true,
      showticklabels: true,
      title: 'Views'
    };
    var automargin = {
      xaxis: xaxis,
      yaxis: yaxis
    };

    var data = [
      {
        x: xValues,
        y: yValues,
        fill: 'tozeroy',
        type: 'scatter',
        marker: {
          color: 'rgb(255,0,0)'
        }
      }
    ];

    var layout = {
      height: height,
      width: width,
      font: {size: fontSize},
      margin: {
        b: 0,
        t: 0
      },
      xaxis: xaxis,
      yaxis: yaxis
    };

    var config = {
      displayModeBar: false,
      responsive: true
    };

    var currentSettings = JSON.parse(localStorage.getItem("settings"));
    var theme = "";
    var index = 0;
    while (index < currentSettings.dashboards.length && theme == "") {
      if (currentSettings.dashboards[index].name == dashboardId) {
        theme = currentSettings.dashboards[index].theme;
      }
      index++;
    }
    if (theme == "dark") {
      layout["plot_bgcolor"] = "#222";
      layout["paper_bgcolor"] = "#222";
      layout["font"]["color"] = "#fff";
      xaxis["linecolor"] = "#fff";
      yaxis["linecolor"] = "#fff";
      layout["xaxis"] = xaxis;
      layout["yaxis"] = yaxis;
      automargin = {
        xaxis: xaxis,
        yaxis: yaxis
      };
    }
    
    Plotly.newPlot(graphId, data, layout, config);

    recordGraphData(graphId, data, layout, config, graphHeight, graphWidth,
      automargin);
    recordGraphSize(graphId, graphHeight, graphWidth, automargin);
  }
}

// Creates top search terms graph for a video in top video dashboard
function handleVideoSearchTerms(response, dashboardId) {
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

    var graphId = dashboardId + "-search-terms";
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
    var automargin = {yaxis: yaxis};

    var data = [
      {
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
      }
    ];
    
    var layout = {
      height: height,
      width: width,
      font: {size: fontSize},
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

    var currentSettings = JSON.parse(localStorage.getItem("settings"));
    var theme = "";
    var index = 0;
    while (index < currentSettings.dashboards.length && theme == "") {
      if (currentSettings.dashboards[index].name == dashboardId) {
        theme = currentSettings.dashboards[index].theme;
      }
      index++;
    }
    if (theme == "dark") {
      layout["plot_bgcolor"] = "#222";
      layout["paper_bgcolor"] = "#222";
      layout["font"]["color"] = "#fff";
      yaxis["linecolor"] = "#fff";
      layout["yaxis"] = yaxis;
      automargin = {yaxis: yaxis};
    }
    
    Plotly.newPlot(graphId, data, layout, config);

    recordGraphData(graphId, data, layout, config, graphHeight, graphWidth,
      automargin);
    recordGraphSize(graphId, graphHeight, graphWidth, automargin);
  }
}


/* Card Performance Calls */

function handleCardPerformance(response, month) {
  if (response) {
    let monthData = [month, 0, 0, 0, 0];
    try {
      let responseRow = response.result.rows[0];
      let cardImpressions = parseInt(responseRow[0]);
      let cardCTR = parseFloat(responseRow[1]).toFixed(4);
      let cardTeaserImpressions = parseInt(responseRow[2]);
      let cardTeaserCTR = parseFloat(responseRow[3]).toFixed(4);
      monthData[1] = cardImpressions;
      monthData[2] = cardCTR;
      monthData[3] = cardTeaserImpressions;
      monthData[4] = cardTeaserCTR;
    } catch (err) {
      console.log("No card data exists for month: " + month);
    } finally {
      return monthData;
    }
  }
}