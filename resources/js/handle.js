/* Handles responses of API calls */


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
    createGraph(graphId, data, layout, config, graphHeight, graphWidth,
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
    createGraph(graphId, data, layout, config, graphHeight, graphWidth,
      automargin);
  } catch (err) {
    displayGraphError(graphId, err);
    return Promise.resolve("Error Displaying Watch Time By Subscribed Status");
  }
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
    font: {
      size: fontSize
    },
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
  var locations = [];
  var z = []
  var labels = [];
  for (var i = 0; i < rows.length; i++) {
    locations.push(rows[i][0].substr(3));
    z.push(rows[i][1]);
    labels.push(numberWithCommas(rows[i][1]) + " views")
  }

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
    geo: {
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
    font: {
      size: fontSize
    },
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


/* Top Video Calls */

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

// Creates daily views graph for a video in top video dashboard
function displayVideoDailyViews(response, dashboardId) {
  if (response) {
    let rows = response.result.rows;
    var xValues = [];
    var yValues = [];

    for (var i = 0; i < rows.length; i++) {
      xValues.push(rows[i][0]);
      yValues.push(rows[i][1]);
    }

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

    var data = [{
      x: xValues,
      y: yValues,
      fill: 'tozeroy',
      marker: {
        color: 'rgb(255,0,0)'
      },
      mode: 'lines',
      type: 'scatter'
    }];

    var layout = {
      height: height,
      width: width,
      font: {
        size: fontSize
      },
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

    const theme = getCurrentDashboardTheme(dashboardId);
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

    const graphIds = getDashboardGraphIds(dashboardId);
    const graphId = graphIds.dailyViews;

    try {
      createGraph(graphId, data, layout, config, graphHeight, graphWidth,
        automargin);
    } catch (err) {
      displayGraphError(graphId);
      throw err;
    }
  }
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
      createGraph(graphId, data, layout, config, graphHeight, graphWidth,
        automargin);
    } catch (err) {
      displayGraphError(graphId);
      throw err;
    }
  }
}


/* Card Performance Calls */

function parseCardPerformance(response, month) {
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
      const errorMsg = `No card data exists for month: "${month}" - `;
      console.log(errorMsg);
      recordError(err, errorMsg);
    } finally {
      return monthData;
    }
  }
}


/* Videographer Dashboard Calls */

/**
 * Creates the Videographer - Average Views Per Video stacked bar graph
 *
 * @param {Object} videographers Videographer statistics
 */
function displayVideographerAvgViews(videographers) {
  videographers = videographers || lsGet("videographers");
  const graphIds = getDashboardGraphIds("videographerGraphs").avgViews;
  const categories = {
    "all": {
      "graphId": graphIds.all,
      "title": "Average Views Per Video By Videographer (All Videos)",
    },
    "organic": {
      "graphId": graphIds.organic,
      "title": "Average Views Per Video By Videographer (Organic Videos)",
    },
    "notOrganic": {
      "graphId": graphIds.notOrganic,
      "title": "Average Views Per Video By Videographer (Not Organic Videos)",
    },
  };
  for (const category in categories) {
    if (categories.hasOwnProperty(category)) {
      const graphTitle = categories[category].title;
      const graphId = categories[category].graphId;
      const graphHeight = 0.8583;
      const graphWidth = 0.9528;
      const height = graphHeight * document.documentElement.clientHeight;
      const width = graphWidth * document.documentElement.clientWidth;
      const titleFontSize =
        Math.floor(0.0208 * document.documentElement.clientWidth);
      const legendFontSize =
        Math.floor(0.0128 * document.documentElement.clientWidth);
      const axisTitleSize =
        Math.floor(0.0156 * document.documentElement.clientWidth);
      const textSize =
        Math.floor(0.0156 * document.documentElement.clientWidth);
      const tickSize =
        Math.floor(0.0128 * document.documentElement.clientWidth);
      const topMargin = Math.floor(0.03 * document.documentElement.clientWidth);
      const bottomMargin =
        Math.floor(0.0104 * document.documentElement.clientWidth);

      let allTime = [];
      let lastXDays = [];
      const people = ["Shane C", "Rick F", "Tim W"];
      people.forEach(name => {
        const stats = videographers[name][category];
        const avgViews = Math.round(stats.avgViews);
        const lastXDaysAvgViews = Math.round(stats.lastXDaysAvgViews);
        allTime.push(avgViews);
        lastXDays.push(lastXDaysAvgViews);
      });
      const trace1 = {
        x: people,
        y: allTime,
        name: "All Time",
        offsetgroup: 1,
        textfont: {
          size: textSize
        },
        textposition: "auto",
        texttemplate: "~%{y:,}<br>views",
        type: "bar",
        yaxis: "y"
      };
      let trace2 = JSON.parse(JSON.stringify(trace1));
      trace2.y = lastXDays;
      trace2.name = "Last 30 Days";
      trace2.offsetgroup = 2;
      trace2.yaxis = "y2";
      let data = [trace1, trace2];

      const layout = {
        height: height,
        width: width,
        barmode: "group",
        hovermode: false,
        legend: {
          bgcolor: "#eeeeee",
          font: {
            size: legendFontSize
          },
          x: 1.1,
          xanchor: 'left',
          y: 0.5
        },
        margin: {
          b: bottomMargin,
          t: topMargin
        },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        title: {
          font: {
            size: titleFontSize
          },
          text: graphTitle
        },
        xaxis: {
          automargin: true,
          fixedrange: true,
          tickfont: {
            size: tickSize
          },
          title: {
            font: {
              size: axisTitleSize
            },
            text: "Videographers"
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
            text: "Average Views Per Video (All Time)"
          }
        },
        yaxis2: {
          automargin: true,
          fixedrange: true,
          showgrid: false,
          overlaying: "y",
          side: "right",
          zeroline: false,
          tickfont: {
            size: tickSize
          },
          title: {
            font: {
              size: axisTitleSize
            },
            text: "Average Views Per Video (Last 30 Days)"
          }
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
  }
}

/**
 * Creates the Monthly Videos and Cumulative Videos By Videographer stacked line
 * graphs
 *
 * @param {Object} videographers Videographer statistics
 */
function displayVideographerMonthlyVideos(videographers) {
  videographers = videographers || lsGet("videographers");
  const people = ["Shane C", "Rick F", "Tim W"];
  const graphIds = [
    getDashboardGraphIds("videographerGraphs").cumulativeVideos,
    getDashboardGraphIds("videographerGraphs").monthlyVideos
  ];
  const categories = {
    "all": {
      "cumulative": {
        "graphId": graphIds[0].all,
        "title": "Cumulative Videos By Videographer (All Videos)"
      },
      "monthly": {
        "graphId": graphIds[1].all,
        "title": "Monthly Videos By Videographer (All Videos)"
      }
    },
    "organic": {
      "cumulative": {
        "graphId": graphIds[0].organic,
        "title": "Cumulative Videos By Videographer (Organic Videos)"
      },
      "monthly": {
        "graphId": graphIds[1].organic,
        "title": "Monthly Videos By Videographer (Organic Videos)"
      }
    },
    "notOrganic": {
      "cumulative": {
        "graphId": graphIds[0].notOrganic,
        "title": "Cumulative Videos By Videographer (Not Organic Videos)"
      },
      "monthly": {
        "graphId": graphIds[1].notOrganic,
        "title": "Monthly Videos By Videographer (Not Organic Videos)"
      }
    }
  };
  for (const category in categories) {
    if (categories.hasOwnProperty(category)) {
      const cumulativeGraphTitle = categories[category].cumulative.title;
      const cumulativeGraphId = categories[category].cumulative.graphId;
      const monthlyGraphTitle = categories[category].monthly.title;
      const monthlyGraphId = categories[category].monthly.graphId;
      let cumulativeData = [];
      let monthlyData = [];

      people.forEach(name => {
        const stats = videographers[name][category];
        const monthlyVideos = stats.monthlyVideos;
        let sortList = [];
        for (const month in monthlyVideos) {
          if (monthlyVideos.hasOwnProperty(month)) {
            const numVideos = monthlyVideos[month];
            sortList.push({
              month: month,
              numVideos: numVideos
            });
          }
        }
        sortList.sort(function (a, b) {
          return a.month > b.month ? 1 :
            a.month == b.month ? 0 :
            -1;
        });
        let months = [];
        let cumulativeNumVideos = [];
        let monthlyNumVideos = [];
        let videoTotal = 0;
        let cumulativeCustomData = [];
        let monthlyCustomData = [];
        sortList.forEach(elem => {
          videoTotal += elem.numVideos;
          months.push(elem.month);
          cumulativeNumVideos.push(videoTotal);
          monthlyNumVideos.push(elem.numVideos);
          let cumulativeText = [];
          if (elem.numVideos == 1) {
            cumulativeText.push("1 new video");
            monthlyCustomData.push("1 video");
          } else {
            cumulativeText.push(`${elem.numVideos} new videos`);
            monthlyCustomData.push(`${elem.numVideos} videos`);
          }
          if (videoTotal == 1) {
            cumulativeText.push("1 video total");
          } else {
            cumulativeText.push(`${videoTotal} videos total`);
          }
          cumulativeCustomData.push(cumulativeText);
        });
        let cumulativeTrace = {
          x: months,
          y: cumulativeNumVideos,
          name: name,
          customdata: cumulativeCustomData,
          stackgroup: "one",
          hovertemplate: "%{customdata[0]} in %{x}" +
            "<br>%{customdata[1]}<extra>" + name + "</extra>",
        };
        let monthlyTrace = {
          x: months,
          y: monthlyNumVideos,
          name: name,
          customdata: monthlyCustomData,
          stackgroup: "one",
          groupnorm: "percent",
          hovertemplate: "%{y:.0f}% of total videos<br>%{customdata}<extra>" +
            name +"</extra>",
        };
        cumulativeData.push(cumulativeTrace);
        monthlyData.push(monthlyTrace);
      });

      const graphHeight = 0.8583;
      const graphWidth = 0.9528;
      const height = graphHeight * document.documentElement.clientHeight;
      const width = graphWidth * document.documentElement.clientWidth;
      const titleFontSize =
        Math.floor(0.0208 * document.documentElement.clientWidth);
      const legendFontSize =
        Math.floor(0.0100 * document.documentElement.clientWidth);
      const axisTitleSize =
        Math.floor(0.0156 * document.documentElement.clientWidth);
      const tickSize =
        Math.floor(0.0104 * document.documentElement.clientWidth);
      const topMargin = Math.floor(0.03 * document.documentElement.clientWidth);
      const bottomMargin =
        Math.floor(0.0104 * document.documentElement.clientWidth);

      const cumulativeLayout = {
        height: height,
        width: width,
        hoverlabel: {
          font: {
            size: tickSize
          },
          namelength: -1
        },
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
        plot_bgcolor: "rgba(0,0,0,0)",
        title: {
          font: {
            size: titleFontSize
          },
          text: cumulativeGraphTitle
        },
        xaxis: {
          automargin: true,
          fixedrange: true,
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
            text: "Cumulative Videos Created"
          }
        }
      };
      let monthlyLayout = JSON.parse(JSON.stringify(cumulativeLayout));
      monthlyLayout.title.text = monthlyGraphTitle;
      monthlyLayout.yaxis.ticksuffix = "%";
      monthlyLayout.yaxis.title.text = "Percentage of Videos Created";

      const config = {
        scrollZoom: false,
        displayModeBar: false,
      }

      try {
        createGraph(cumulativeGraphId, cumulativeData, cumulativeLayout, config,
          graphHeight, graphWidth);
      } catch (err) {
        displayGraphError(cumulativeGraphId, err);
      }
      try {
        createGraph(monthlyGraphId, monthlyData, monthlyLayout, config,
          graphHeight, graphWidth);
      } catch (err) {
        displayGraphError(monthlyGraphId, err);
      }
    }
  }
}

/**
 * Creates the Monthly Views and Cumulative Views By Videographer stacked line
 * graphs
 *
 * @param {Object} videographers Videographer statistics
 */
function displayVideographerMonthlyViews(videographers) {
  videographers = videographers || lsGet("videographers");
  const people = ["Shane C", "Rick F", "Tim W"];
  const graphIds = [
    getDashboardGraphIds("videographerGraphs").cumulativeViews,
    getDashboardGraphIds("videographerGraphs").monthlyViews
  ];
  const categories = {
    "all": {
      "cumulative": {
        "graphId": graphIds[0].all,
        "title": "Cumulative Views By Videographer (All Videos)"
      },
      "monthly": {
        "graphId": graphIds[1].all,
        "title": "Monthly Views By Videographer (All Videos)"
      }
    },
    "organic": {
      "cumulative": {
        "graphId": graphIds[0].organic,
        "title": "Cumulative Views By Videographer (Organic Videos)"
      },
      "monthly": {
        "graphId": graphIds[1].organic,
        "title": "Monthly Views By Videographer (Organic Videos)"
      }
    },
    "notOrganic": {
      "cumulative": {
        "graphId": graphIds[0].notOrganic,
        "title": "Cumulative Views By Videographer (Not Organic Videos)"
      },
      "monthly": {
        "graphId": graphIds[1].notOrganic,
        "title": "Monthly Views By Videographer (Not Organic Videos)"
      }
    }
  };
  for (const category in categories) {
    if (categories.hasOwnProperty(category)) {
      const cumulativeGraphTitle = categories[category].cumulative.title;
      const cumulativeGraphId = categories[category].cumulative.graphId;
      const monthlyGraphTitle = categories[category].monthly.title;
      const monthlyGraphId = categories[category].monthly.graphId;
      let cumulativeData = [];
      let monthlyData = [];

      people.forEach(name => {
        const stats = videographers[name][category];
        const monthlyViews = stats.monthlyViews;
        let sortList = [];
        for (const month in monthlyViews) {
          if (monthlyViews.hasOwnProperty(month)) {
            const numViews = monthlyViews[month];
            sortList.push({
              month: month,
              numViews: numViews
            });
          }
        }
        sortList.sort(function (a, b) {
          return a.month > b.month ? 1 :
            a.month == b.month ? 0 :
            -1;
        });
        let months = [];
        let cumulativeNumViews = [];
        let monthlyNumViews = [];
        let viewTotal = 0;
        let cumulativeCustomData = [];
        let monthlyCustomData = [];
        sortList.forEach(elem => {
          viewTotal += elem.numViews;
          months.push(elem.month);
          cumulativeNumViews.push(viewTotal);
          monthlyNumViews.push(elem.numViews);
          let cumulativeText = [];
          if (elem.numViews == 1) {
            cumulativeText.push("1 new view");
            monthlyCustomData.push("1 view");
          } else {
            cumulativeText.push(`${numberWithCommas(elem.numViews)} new views`);
            monthlyCustomData.push(`${numberWithCommas(elem.numViews)} views`);
          }
          if (viewTotal == 1) {
            cumulativeText.push("1 view total");
          } else {
            cumulativeText.push(`${numberWithCommas(viewTotal)} views total`);
          }
          cumulativeCustomData.push(cumulativeText);
        });
        let cumulativeTrace = {
          x: months,
          y: cumulativeNumViews,
          name: name,
          customdata: cumulativeCustomData,
          stackgroup: "one",
          hovertemplate: "%{customdata[0]} in %{x}" +
            "<br>%{customdata[1]}<extra>" + name + "</extra>",
        };
        let monthlyTrace = {
          x: months,
          y: monthlyNumViews,
          name: name,
          customdata: monthlyCustomData,
          stackgroup: "one",
          groupnorm: "percent",
          hovertemplate: "%{y:.0f}% of total videos<br>%{customdata}<extra>" +
            name +"</extra>",
        };
        cumulativeData.push(cumulativeTrace);
        monthlyData.push(monthlyTrace);
      });

      const graphHeight = 0.8583;
      const graphWidth = 0.9528;
      const height = graphHeight * document.documentElement.clientHeight;
      const width = graphWidth * document.documentElement.clientWidth;
      const titleFontSize =
        Math.floor(0.0208 * document.documentElement.clientWidth);
      const legendFontSize =
        Math.floor(0.0100 * document.documentElement.clientWidth);
      const axisTitleSize =
        Math.floor(0.0156 * document.documentElement.clientWidth);
      const tickSize =
        Math.floor(0.0104 * document.documentElement.clientWidth);
      const topMargin = Math.floor(0.03 * document.documentElement.clientWidth);
      const bottomMargin =
        Math.floor(0.0104 * document.documentElement.clientWidth);

      const cumulativeLayout = {
        height: height,
        width: width,
        hoverlabel: {
          font: {
            size: tickSize
          },
          namelength: -1
        },
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
        plot_bgcolor: "rgba(0,0,0,0)",
        title: {
          font: {
            size: titleFontSize
          },
          text: cumulativeGraphTitle
        },
        xaxis: {
          automargin: true,
          fixedrange: true,
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
            text: "Cumulative Views"
          }
        }
      };
      let monthlyLayout = JSON.parse(JSON.stringify(cumulativeLayout));
      monthlyLayout.title.text = monthlyGraphTitle;
      monthlyLayout.yaxis.ticksuffix = "%";
      monthlyLayout.yaxis.title.text = "Percentage of Views";

      const config = {
        scrollZoom: false,
        displayModeBar: false,
      }

      try {
        createGraph(cumulativeGraphId, cumulativeData, cumulativeLayout, config,
          graphHeight, graphWidth);
      } catch (err) {
        displayGraphError(cumulativeGraphId, err);
      }
      try {
        createGraph(monthlyGraphId, monthlyData, monthlyLayout, config,
          graphHeight, graphWidth);
      } catch (err) {
        displayGraphError(monthlyGraphId, err);
      }
    }
  }
}

function displayVideographerStats(videographers = lsGet("videographers")) {
  const people = ["Shane C", "Rick F", "Tim W"];
  people.forEach(name => {
    const updatedName = name.replace(" ", "*");
    for (const category in videographers[name]) {
      if (videographers[name].hasOwnProperty(category)) {
        const vStats = videographers[name][category];
        // Main vstats dashboard
        const preCatId = `vstats-${updatedName}-`;
        const dashboardId = `${preCatId}${category}-`;
        const viewsTotal = document.getElementById(`${dashboardId}views-total`);
        const viewsAvg = document.getElementById(`${dashboardId}views-avg`);
        const subsTotal = document.getElementById(`${dashboardId}subs-total`);
        const subsAvg = document.getElementById(`${dashboardId}subs-avg`);
        const commentsTotal =
          document.getElementById(`${dashboardId}comments-total`);
        const commentsAvg =
          document.getElementById(`${dashboardId}comments-avg`);
        const likesTotal = document.getElementById(`${dashboardId}likes-total`);
        const likesAvg = document.getElementById(`${dashboardId}likes-avg`);
        const dislikesTotal =
          document.getElementById(`${dashboardId}dislikes-total`);
        const dislikesAvg =
          document.getElementById(`${dashboardId}dislikes-avg`);
        const likeRatioTotal =
          document.getElementById(`${dashboardId}like-ratio-total`);
        const likeRatioAvg =
          document.getElementById(`${dashboardId}like-ratio-avg`);
        const likeBarTotal =
          document.getElementById(`${dashboardId}like-bar-total`);
        const likeBarAvg =
          document.getElementById(`${dashboardId}like-bar-avg`);
        const durationTotal =
          document.getElementById(`${dashboardId}duration-total`);
        const durationAvg =
          document.getElementById(`${dashboardId}duration-avg`);
        viewsTotal.innerHTML = numberWithCommas(vStats.totalViews);
        viewsAvg.innerHTML = numberWithCommas(roundTo(vStats.avgViews, 0));
        subsTotal.innerHTML = numberWithCommas(vStats.totalSubsGained);
        subsAvg.innerHTML = roundTo(vStats.avgSubsGained, 2);
        commentsTotal.innerHTML = numberWithCommas(vStats.totalComments);
        commentsAvg.innerHTML = roundTo(vStats.avgComments, 1);
        likesTotal.innerHTML = numberWithCommas(vStats.totalLikes);
        likesAvg.innerHTML = roundTo(vStats.avgLikes, 2);
        dislikesTotal.innerHTML = numberWithCommas(vStats.totalDislikes);
        dislikesAvg.innerHTML = roundTo(vStats.avgDislikes, 2);
        const totalLikeRatio = decimalToPercent(vStats.cumLikeRatio);
        const avgLikeRatio = decimalToPercent(vStats.avgLikeRatio);
        likeRatioTotal.innerHTML = totalLikeRatio + "%";
        likeRatioAvg.innerHTML = avgLikeRatio + "%";
        likeBarTotal.style.width = totalLikeRatio + "%";
        likeBarAvg.style.width = avgLikeRatio + "%";
        durationTotal.innerHTML =
          secondsToDurationLabeled(vStats.totalDuration.toFixed(0));
        durationAvg.innerHTML =
          secondsToDurationLabeled(vStats.avgDuration.toFixed(0));

        // Overall vstats dashboard
        const preCatOverallId = `vstats-overall-${updatedName}-`;
        const dashboardOverallId = `${preCatOverallId}${category}-`;
        const videosTotal =
          document.getElementById(`${dashboardOverallId}videos-total`);
        const videosLast =
          document.getElementById(`${dashboardOverallId}videos-last`);
        const avpTotal =
          document.getElementById(`${dashboardOverallId}avp-total`);
        const avpLast =
          document.getElementById(`${dashboardOverallId}avp-last`);
        const minWatchedTotal =
          document.getElementById(`${dashboardOverallId}watched-total`);
        const minWatchedLast =
          document.getElementById(`${dashboardOverallId}watched-last`);
        videosTotal.innerHTML = vStats.numVideos;
        videosLast.innerHTML = numberWithCommas(vStats.numVideosLastXDays);
        avpTotal.innerHTML = roundTo(vStats.avgViewPercentage, 1) + "%";
        avpLast.innerHTML = roundTo(vStats.avgViewPercentageLastXDays, 1) + "%";
        minWatchedTotal.innerHTML = numberWithCommas(vStats.minWatched);
        minWatchedLast.innerHTML = numberWithCommas(vStats.minWatchedLastXDays);

        let ids = [{
            "dashboardId": dashboardId,
            "preCatId": preCatId,
            "leftBtn": {
              "id": null,
              "target": null
            },
            "rightBtn": {
              "id": `${dashboardId}more`,
              "target": `${dashboardOverallId}grid`
            }
          },
          {
            "dashboardId": dashboardOverallId,
            "preCatId": preCatOverallId,
            "leftBtn": {
              "id": null,
              "target": null
            },
            "rightBtn": {
              "id": `${dashboardOverallId}more`,
              "target": `${dashboardId}grid`
            }
          }
        ];
        ids.forEach(dashboard => {
          for (const category2 in videographers[name]) {
            if (videographers[name].hasOwnProperty(category2)) {
              // Add onclick functions to category buttons
              const currGrid =
                document.getElementById(`${dashboard.dashboardId}grid`);
              const gridBtn = document
                .getElementById(`${dashboard.dashboardId}btn-${category2}`);
              if (category == category2) {
                gridBtn.disabled = "disabled";
              } else {
                const targetGrid = document.getElementById(
                  `${dashboard.preCatId}${category2}-grid`);
                gridBtn.onclick = function () {
                  currGrid.classList.remove("active-grid");
                  targetGrid.classList.add("active-grid");
                }
              }
              // Add onclick functions to more stats and top videos buttons
              const rightBtn = document.getElementById(dashboard.rightBtn.id);
              const targetGrid =
                document.getElementById(dashboard.rightBtn.target);
              rightBtn.onclick = function () {
                currGrid.classList.remove("active-grid");
                targetGrid.classList.add("active-grid");
              }
            }
          }
        });
      }
    }
  });
}


/* Contest Dashboard Calls */

function displayContestComparisonGraph(contestVideos) {
  const allVideoStats = lsGet("allVideoStats");

  const graphHeight = 0.8583;
  const graphWidth = 0.9528;
  const height = graphHeight * document.documentElement.clientHeight;
  const width = graphWidth * document.documentElement.clientWidth;
  const titleFontSize =
    Math.floor(0.0208 * document.documentElement.clientWidth);
  const legendFontSize =
    Math.floor(0.0128 * document.documentElement.clientWidth);
  const axisTitleSize =
    Math.floor(0.0156 * document.documentElement.clientWidth);
  const textSize = Math.floor(0.0156 * document.documentElement.clientWidth);
  const tickSize = Math.floor(0.0128 * document.documentElement.clientWidth);
  const topMargin = Math.floor(0.03 * document.documentElement.clientWidth);
  const bottomMargin =
    Math.floor(0.0104 * document.documentElement.clientWidth);

  let titles = [];
  let views = [];
  let subs = [];
  for (const videoId in contestVideos) {
    if (contestVideos.hasOwnProperty(videoId)) {
      const video = contestVideos[videoId];
      titles.push(video.shortTitle);
      const index = allVideoStats.findIndex((element) => {
        return videoId == element.videoId;
      });
      views.push(allVideoStats[index].views);
      subs.push(allVideoStats[index].subscribersGained);
    }
  }
  // Wraps the titles to be no longer than 20 characters per line
  titles = titles.map((title) => {
    return title.replace(/(?![^\n]{1,20}$)([^\n]{1,20})\s/g, '$1<br>');
  });
  const trace1 = {
    x: titles,
    y: views,
    name: "Views",
    offsetgroup: 1,
    textfont: {
      size: textSize
    },
    textposition: "auto",
    texttemplate: "%{y:,}",
    type: "bar",
    yaxis: "y"
  };
  let trace2 = JSON.parse(JSON.stringify(trace1));
  trace2.y = subs;
  trace2.name = "Subscribers<br>Gained";
  trace2.offsetgroup = 2;
  trace2.texttemplate = "%{y:,}";
  trace2.yaxis = "y2";
  const data = [trace1, trace2];
  const layout = {
    height: height,
    width: width,
    barmode: "group",
    hovermode: false,
    legend: {
      bgcolor: "#eeeeee",
      font: {
        size: legendFontSize
      },
      x: 1.1,
      xanchor: "left",
      y: 0.5
    },
    margin: {
      b: bottomMargin,
      t: topMargin
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    title: {
      font: {
        size: titleFontSize
      },
      text: "Contest Video Views and Subscribers Gained"
    },
    xaxis: {
      automargin: true,
      fixedrange: true,
      tickangle: 0,
      tickfont: {
        size: tickSize
      },
      title: {
        font: {
          size: axisTitleSize
        },
        text: "Contest Video"
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
        text: "Video Views"
      }
    },
    yaxis2: {
      automargin: true,
      fixedrange: true,
      showgrid: false,
      overlaying: "y",
      side: "right",
      zeroline: false,
      tickfont: {
        size: tickSize
      },
      title: {
        font: {
          size: axisTitleSize
        },
        text: "Subscribers Gained"
      }
    }
  };
  const config = {
    scrollZoom: false,
    displayModeBar: false,
    staticPlot: true,
    responsive: true
  };

  const graphIds = getDashboardGraphIds("contestGraphs");
  const graphId = graphIds.comparison;

  try {
    createGraph(graphId, data, layout, config, graphHeight, graphWidth);
  } catch (err) {
    displayGraphError(graphId, err);
  }
}

function displayContestVideoStats(contestVideos) {
  const allVideoStats = lsGet("allVideoStats");
  const statsByVideoId = lsGet("statsByVideoId");
  let contestIndex = 0;
  for (const videoId in contestVideos) {
    if (contestVideos.hasOwnProperty(videoId)) {
      const video = contestVideos[videoId];
      const avsIndex = allVideoStats.findIndex((element) => {
        return videoId == element.videoId;
      });
      const dashboardId = `contest-video-${contestIndex}`;
      const views = document.getElementById(`${dashboardId}-views`);
      const comments = document.getElementById(`${dashboardId}-comments`);
      const subsGained = document.getElementById(`${dashboardId}-subs-gained`);
      const dates = document.getElementById(`${dashboardId}-dates`);
      const numDays = document.getElementById(`${dashboardId}-num-days`);
      const thumbnail = document.getElementById(`${dashboardId}-thumbnail`);
      const title = document.getElementById(`${dashboardId}-title`);
      const publishDate =
        document.getElementById(`${dashboardId}-publish-date`);
      const duration = document.getElementById(`${dashboardId}-duration`);
      const likeRatio = document.getElementById(`${dashboardId}-like-ratio`);
      const likeBar = document.getElementById(`${dashboardId}-like-bar`);
      const likes = document.getElementById(`${dashboardId}-likes`);
      const dislikes = document.getElementById(`${dashboardId}-dislikes`);
      const exampleComment =
        document.getElementById(`${dashboardId}-example-comment`);

      views.innerHTML = numberWithCommas(allVideoStats[avsIndex].views);
      comments.innerHTML = numberWithCommas(allVideoStats[avsIndex].comments);
      subsGained.innerHTML =
        numberWithCommas(allVideoStats[avsIndex].subscribersGained);
      
      const startDate = new Date(video.startDate);
      const endDate = new Date(video.endDate);
      const startMonth = startDate.toLocaleString("default", {
        "month": "short",
        "timeZone": "UTC"
      });
      let timeString = startMonth +
        ". " + startDate.getUTCDate();
      if (startDate.getUTCFullYear() != endDate.getUTCFullYear()) {
        timeString +=  ", " + startDate.getUTCFullYear();
      }
      timeString += " - <br>" +
        endDate.toLocaleString("default", {"month": "short"}) +
        ". " + endDate.getUTCDate() + ", " + endDate.getUTCFullYear();
      dates.innerHTML = timeString;
      const daysBtwn = Math.round((endDate - startDate) / 86400000);
      numDays.innerHTML = `(${daysBtwn} Days)`;

      const videoTitle = statsByVideoId[videoId].title;
      const thumbnailText = `
        <a href="https://youtu.be/${videoId}" target="_blank"
            alt="${videoTitle}">
          <img class="top-video-thumbnail" onload="thumbnailCheck($(this), true)"
              src="https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg"
              alt="thumbnail" title="${videoTitle}">
        </a>`;
      thumbnail.innerHTML = thumbnailText;
      title.innerHTML = videoTitle;
      publishDate.innerHTML = "Published: " +
        dateToMMDDYYYY(statsByVideoId[videoId].publishDate);
      duration.innerHTML = "Duration: " +
        secondsToDuration(allVideoStats[avsIndex].duration);

      const likeCount = allVideoStats[avsIndex].likes;
      const dislikeCount = allVideoStats[avsIndex].dislikes;
      let ratio = likeCount / (likeCount + dislikeCount);
      if (isNaN(ratio)) {
        ratio = 0;
      }
      ratio = decimalToPercent(ratio);
      likes.innerHTML = `${likeCount} Likes`;
      dislikes.innerHTML = `${dislikeCount} Dislikes`;
      likeRatio.innerHTML = ratio + "%";
      likeBar.style.width = ratio + "%";

      exampleComment.innerHTML = video.exampleComment;

      requestVideoDailyViews(video.startDate, video.endDate, videoId,
        dashboardId);

      contestIndex++;
    }
  }
}