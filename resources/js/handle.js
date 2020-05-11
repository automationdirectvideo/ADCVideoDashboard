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

// Creates top search terms graph in platform dashboard
function handleChannelSearchTerms(response) {
  if (response) {
    let searchTerms = response.result.rows;
    let xValues = [];
    let yValues = [];
    let numTerms = Math.min(9, searchTerms.length+ - 1);
    for (var i = numTerms; i >= 0; i--) {
      xValues.push(searchTerms[i][1]);
      yValues.push(searchTerms[i][0]);
    }
    var textValues = xValues.map(String);
    for (var i = 0; i < textValues.length; i++) {
      textValues[i] = numberWithCommas(textValues[i]);
    }

    var graphId = "channel-search-terms";
    var graphHeight = 0.2287;
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
    
    var config = {
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
  }
}

// Creates minutes by subscribers graph in platform dashboard
function handleMinutesSubscribedStatus(response) {
  if (response) {
    var rows = response.result.rows;
    var labelConversion = {
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

    var graphId = "channel-watch-time";
    var graphHeight = 0.1039;
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
    
    var data = [{
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
    
    var layout = {
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
    
    var config = {
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
  }
}

// Creates views by device type graph in platform dashboard
function handleViewsByDeviceType(response) {
  if (response) {
    var rows = response.result.rows;
    var temp = rows[1];
    rows[1] = rows[3];
    rows[3] = temp;
    var labelConversion = {
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
    
    var graphId = "channel-views-by-device";
    var graphHeight = 0.3742;
    var graphWidth = 0.3065;
    var height = graphHeight * document.documentElement.clientHeight;
    var width = graphWidth * document.documentElement.clientWidth;
    var fontSize = Math.floor(0.0125 * document.documentElement.clientWidth);
    
    var data = [{
      values: values,
      labels: labels,
      type: 'pie',
      sort: false,
      textinfo: 'label+percent',
      textposition: ["inside", "outside", "outside", "inside", "outside"],
      rotation: -120,
      direction: 'clockwise'
    }];
    
    var layout = {
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
    
    var config = {
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
  }
}

// Creates views by state cholorpleth map in platform dashboard
function handleViewsByState(response) {
  if (response) {
    var rows = response.result.rows;
    var locations = [];
    var z = []
    var labels = [];
    for (var i = 0; i < rows.length; i++) {
      locations.push(rows[i][0].substr(3));
      z.push(rows[i][1]);
      labels.push(numberWithCommas(rows[i][1]) + " views")
    }

    var graphId = "channel-views-by-state";
    var graphHeight = 0.3742;
    var graphWidth = 0.4681;
    var height = graphHeight * document.documentElement.clientHeight;
    var width = graphWidth * document.documentElement.clientWidth;
    var fontSize = Math.floor(0.0093 * document.documentElement.clientWidth);

    var data = [{
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

    var layout = {
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

    var config = {
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
  }
}

// Creates views by traffic source graph in platform dashboard
function handleViewsByTrafficSource(response) {
  if (response) {
    var rows = response.result.rows;
    var advertisingViews = 0;
    var externalViews = 0;
    var youtubeSearchViews = 0;
    var relatedViews = 0;
    var otherViews = 0;
    var advertisingSources = ["ADVERTISING", "PROMOTED"];
    var externalSources = ["EXT_URL", "NO_LINK_EMBEDDED", "NO_LINK_OTHER"];
    var youtubeSearchSources = ["YT_SEARCH"];
    var relatedSources = ["RELATED_VIDEO"];
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
    var values = [advertisingViews, externalViews, youtubeSearchViews,
        relatedViews, otherViews];
    var labels = ["Advertising", "External", "YouTube<br>Search",
        "Related<br>Video", "Other"];

    var graphId = "channel-traffic-sources";
    var graphHeight = 0.3742;
    var graphWidth = 0.3065;
    var height = graphHeight * document.documentElement.clientHeight;
    var width = graphWidth * document.documentElement.clientWidth;
    var fontSize = Math.floor(0.0125 * document.documentElement.clientWidth);

    var data = [{
      values: values,
      labels: labels,
      type: 'pie',
      textinfo: 'label+percent',
      textposition: "inside",
      rotation: 90
    }];

    var layout = {
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

    var config = {
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
  }
}


/* Real Time Stats Calls */

// Saves stats to realTimeStats then loads them
function handleRealTimeStats(response, message) {
  if (response) {
    if (!localStorage.getItem("realTimeStats")) {
      localStorage.setItem("realTimeStats", JSON.stringify({}));
    }
    let stats = JSON.parse(localStorage.getItem("realTimeStats"));
    
    let realTimeStats = {};
    let headers = response.result.columnHeaders;
    let row = response.result.rows[0];
    for (let i = 0; i < row.length; i++) {
      realTimeStats[headers[i].name] = row[i];
    }
    realTimeStats["netSubscribersGained"] = realTimeStats.subscribersGained -
        realTimeStats.subscribersLost;
    delete realTimeStats.subscribersGained;
    delete realTimeStats.subscribersLost;
    stats[message] = realTimeStats;
    localStorage.setItem("realTimeStats", JSON.stringify(stats));

    //console.log("Real Time Stats: ", stats);
    // message is either "cumulative", "month", or "today"
    if (message == "cumulative") {
      saveRealTimeStatsToSheets();
      displayRealTimeStats();
    }
  }
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
function handleVideoBasicStats(response, dashboardId) {
  if (response) {
    let stats = response.result.rows[0];

    let views = document.getElementById(dashboardId + "-views");
    views.innerHTML = numberWithCommas(stats[1]);

    let subsNet = document.getElementById(dashboardId + "-subs-net");
    subsNet.innerHTML = numberWithCommas(stats[7] - stats[8]);

    let likeRatioElem = document.getElementById(dashboardId + "-like-ratio");
    let likes = document.getElementById(dashboardId + "-likes");
    let likeBar = document.getElementById(dashboardId + "-like-bar");
    let likeRatio = decimalToPercent(stats[3] / (stats[3] + stats[4]));
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
    let avd = stats[6];
    avgViewDuration.innerHTML = secondsToDuration(avd);
    let videoDuration =
        document.getElementById(dashboardId + "-duration-seconds").innerHTML;

    let avp = decimalToPercent(avd / videoDuration);
    let avgViewPercentage =
        document.getElementById(dashboardId + "-avg-view-percentage");
    avgViewPercentage.innerHTML = " (" + avp + "%)";

    let estimatedMinutesWatched =
        document.getElementById(dashboardId + "-minutes-watched");
    estimatedMinutesWatched.innerHTML = numberWithCommas(stats[5]);

    let videoData = {
      "views": stats[1],
      "subscribersGained": stats[7] - stats[8],
      "avgViewDuration": stats[6],
      "minutesWatched": stats[5],
      "comments": stats[2],
      "likes": stats[3],
      "dislikes": stats[4]
    };
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
      recordTopVideoStats(dashboardId, videoData);
    }
  }
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

// Displays video title, duration, publish date, and thumbnail in top video
// dashboard
function handleVideoSnippet(response, dashboardId) {
  if (response) {
    let title = document.getElementById(dashboardId + "-title");
    title.innerHTML = response.result.items[0].snippet.title;
    duration = response.result.items[0].contentDetails.duration;
    let videoDuration = isoDurationToSeconds(duration);
    document.getElementById(dashboardId + "-duration").innerHTML =
        "Duration: " + secondsToDuration(videoDuration);
    document.getElementById(dashboardId + "-duration-seconds").innerHTML = 
        videoDuration;

    let publishDateText =
        document.getElementById(dashboardId + "-publish-date");
    let publishDate = response.result.items[0].snippet.publishedAt;
    let year = publishDate.slice(0, 4);
    let month = publishDate.slice(5, 7);
    let day = publishDate.slice(8, 10);
    publishDate = month + "/" + day + "/" + year;
    publishDateText.innerHTML = "Published: " + publishDate;

    let thumbnail = document.getElementById(dashboardId + "-thumbnail");
    let videoId = response.result.items[0].id;
    let videoTitle = "YouTube Video ID: " + videoId;
    let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
    if (statsByVideoId && statsByVideoId[videoId]) {
      videoTitle = statsByVideoId[videoId]["title"];
    }
    thumbnail.innerHTML = `
      <a href="https://youtu.be/${videoId}" target="_blank"
          onclick="closeFullscreen()" alt="${videoTitle}">
        <img class="top-video-thumbnail" onload="thumbnailCheck($(this), true)"
            src="https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg"
            alt="thumbnail" title="${videoTitle}">
      </a>`;
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
      let values = [monthData];
      let body = {
        "values": values
      };
      var row = 3 + monthDiff(new Date(2017, 9), new Date(month));
      var sheet = "Card Performance!A" + row;
      updateSheetData("Stats", sheet, body);
    } catch (err) {
      console.log("No card data exists for month: " + month);
    }
  }
}


/* Non-dashboard Related Calls */

function handleVideoDescription(response) {
  if (response) {
    var videoId = response.result.items[0].id;
    var description = response.result.items[0].snippet.description;
    var links = searchForURLs(description);
    //console.log(videoId, links);
  }
}
