/* Handles responses of API calls */


/* 1000 Thumbnail Dashboard Calls */

// Displays the number of videos the channel has
function handleChannelNumVideos(response) {
  if (response) {
    console.log("Response received", "handleChannelNumVideos");

    let numVideos = response.result.items[0].statistics.videoCount;
    document.getElementById("num-videos").innerText = numVideos;
  }
}


/* Get All Video Stats Calls */

// Saves video stats to allVideoStats and categoryTotals
// Semi-recursively calls requestVideoStatisticsOverall for all uploads
function handleVideoStatisticsOverall(response, settings) {
  if (response) {
    console.log("Response received", "handleVideoStatisticsOverall");
    let videoId = response.result.items[0].id;
    let videoStats = response.result.items[0].statistics;
    let durationStr = response.result.items[0].contentDetails.duration;
    let duration = parseInt(isoDurationToSeconds(durationStr));
    let viewCount = parseInt(videoStats.viewCount);
    let likeCount = parseInt(videoStats.likeCount);
    let dislikeCount = parseInt(videoStats.dislikeCount);
    let commentCount = parseInt(videoStats.commentCount);
    let allVideoStats = JSON.parse(localStorage.getItem("allVideoStats"));
    let categoriesByVideoId = JSON.parse(localStorage.getItem("categoriesByVideoId"));
    let categoryTotals = JSON.parse(localStorage.getItem("categoryTotals"));
    let row = {
      "videoId": videoId,
      "views": viewCount,
      "likes": likeCount,
      "dislikes": dislikeCount,
      "duration": duration,
      "comments": commentCount
    };
    allVideoStats.push(row);
    let categories = categoriesByVideoId[videoId];
    for (let i = 0; i < categories.length; i++) {
      let categoryId = categories[i];
      let categoryViews = parseInt(categoryTotals[categoryId]["views"]);
      let categoryLikes = parseInt(categoryTotals[categoryId]["likes"]);
      let categoryDuration = parseInt(categoryTotals[categoryId]["duration"]);
      let categoryVideos = categoryTotals[categoryId]["videos"];
      categoryVideos.push(videoId);
      categoryTotals[categoryId]["views"] = categoryViews + viewCount;
      categoryTotals[categoryId]["likes"] = categoryLikes + likeCount;
      categoryTotals[categoryId]["duration"] = categoryDuration + duration;
      categoryTotals[categoryId]["videos"] = categoryVideos;
    }
    localStorage.setItem("categoryTotals", JSON.stringify(categoryTotals));
    localStorage.setItem("allVideoStats", JSON.stringify(allVideoStats));

    let uploads = settings["uploads"];
    let index = parseInt(settings["index"]);
    if (index + 1 < uploads.length) {
      settings["index"] = index + 1;
      requestVideoStatisticsOverall(settings);
    } else {
      calcCategoryStats();
    }
  }
}


/* Platform Dashboard Calls */

// Loads demographics table in platform dashboard
function handleChannelDemographics(response) {
  if (response) {
    console.log("Response received", "handleViewsByTrafficSource");
    var rows = response.result.rows;
    let maleTotal = 0;
    let femaleTotal = 0;
    let maleMax = 0;
    let femaleMax = 0;
    for (var i = 0; i < rows.length; i++) {
      let percentage = parseFloat(rows[i][2]);
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
      let range = rows[i][0].substr(3);
      let percentage = rows[i][2];
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
    document.getElementById("male-title").innerHTML = `<i class="fas fa-male" style="font-size:3rem"></i><br><span style="font-size:2rem">${maleTotal}</span>%`;
    document.getElementById("female-title").innerHTML = `<i class="fas fa-female" style="font-size:3rem"></i><br><span style="font-size:2rem">${femaleTotal}</span>%`;

    var values = [maleTotal, femaleTotal];
    var labels = ["Male", "Female"];
    var data = [{
      values: values,
      labels: labels,
      textinfo: "none",
      hoverinfo: "none",
      marker: {
        colors: ["rgb(84, 157, 209)", "rgb(146, 111, 209)"]
      },
      type: 'pie',
    }];

    var layout = {
      height: 100,
      weight: 100,
      showlegend: false,
      margin: {
        l: 0,
        r: 0,
        t: 0,
        b: 0,
        pad: 4
      }
    };

    var config = {
      staticPlot: true
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
      layout["plot_bgcolor"] = "#343a40";
      layout["paper_bgcolor"] = "#343a40";
    }

    Plotly.newPlot('demographics-graph', data, layout, config);
  }
}

// Creates top search terms graph in platform dashboard
function handleChannelSearchTerms(response) {
  if (response) {
    console.log("Response received", "handleChannelSearchTerms");
    let searchTerms = response.result.rows;
    let xValues = [];
    let yValues = [];
    let numTerms = Math.min(9, searchTerms.length+ - 1);
    for (var i = numTerms; i >= 0; i--) {
      xValues.push(searchTerms[i][1]);
      yValues.push(searchTerms[i][0].replace("proximity ", "proximity<br>")
          .replace("plc ", "plc<br>"));
    }

    var graphId = "channel-search-terms";
    var graphHeight = 0.33;
    var graphWidth = 0.33;
    var height = graphHeight * document.documentElement.clientHeight;
    var width = graphWidth * document.documentElement.clientHeight;
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
        text: xValues.map(String),
        textposition: 'auto',
        marker: {
          color: 'rgb(255,0,0)'
        }
      }
    ];
    
    var layout = {
      height: height,
      width: width,
      font: {size: 24},
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

    recordGraphSize(graphId, graphHeight, graphWidth, automargin);
  }
}

// Creates minutes by subscribers graph in platform dashboard
function handleMinutesSubscribedStatus(response) {
  if (response) {
    console.log("Response received", "handleMinutesSubscribedStatus");
    var rows = response.result.rows;
    var labelConversion = {
      "UNSUBSCRIBED": "Not Subscribed",
      "SUBSCRIBED": "Subscribed"
    };
    var values = [];
    var labels = [];
    for (var i = 0; i < rows.length; i++) {
      values.push(rows[i][1]);
      labels.push(labelConversion[rows[i][0]]);
    }
    var graphId = "channel-watch-time";
    var graphHeight = 0.33;
    var graphWidth = 0.33;
    var height = graphHeight * document.documentElement.clientHeight;
    var width = graphWidth * document.documentElement.clientHeight;
    
    var data = [{
      values: values,
      labels: labels,
      textinfo: "label+percent",
      hoverinfo: "none",
      type: 'pie',
      rotation: 180,
      direction: "clockwise"
    }];
    
    var layout = {
      height: height,
      width: width,
      font: {size: 18},
      automargin: true,
      autosize: true,
      showlegend: false,
      margin: {
        l: 0,
        r: 0,
        t: 0,
        b: 50,
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
    
    recordGraphSize(graphId, graphHeight, graphWidth);
  }
}

// Creates views by device type graph in platform dashboard
function handleViewsByDeviceType(response) {
  if (response) {
    console.log("Response received", "handleViewsByDeviceType");
    var rows = response.result.rows;
    var labelConversion = {
      "DESKTOP": "Desktop",
      "MOBILE": "Mobile",
      "TABLET": "Tablet",
      "TV": "TV",
      "GAME_CONSOLE": "Game Console"
    };
    var values = [];
    var labels = [];
    for (var i = 0; i < rows.length; i++) {
      values.push(rows[i][1]);
      labels.push(labelConversion[rows[i][0]]);
    }
    
    var graphId = "channel-views-by-device";
    var graphHeight = 0.33;
    var graphWidth = 0.33;
    var height = graphHeight * document.documentElement.clientHeight;
    var width = graphWidth * document.documentElement.clientHeight;
    
    var data = [{
      values: values,
      labels: labels,
      type: 'pie',
      textinfo: 'label+percent',
      textposition: ["inside", "inside", "outside", "outside", "outside"],
      rotation: 200,
      direction: 'clockwise'
    }];
    
    var layout = {
      height: height,
      width: width,
      font: {size: 18},
      automargin: true,
      autosize: true,
      showlegend: false,
      margin: {
        l: 20,
        r: 0,
        t: 0,
        b: 60,
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

    recordGraphSize(graphId, graphHeight, graphWidth);
  }
}

// Creates views by state cholorpleth map in platform dashboard
function handleViewsByState(response) {
  if (response) {
    console.log("Response received", "handleViewsByState");
    var rows = response.result.rows;
    var locations = [];
    var z = []
    for (var i = 0; i < rows.length; i++) {
      locations.push(rows[i][0].substr(3));
      z.push(rows[i][1]);
    }

    var graphId = "channel-views-by-state";
    var graphHeight = 0.33;
    var graphWidth = 0.33;
    var height = graphHeight * document.documentElement.clientHeight;
    var width = graphWidth * document.documentElement.clientHeight;

    var data = [{
      type: 'choropleth',
      locationmode: 'USA-states',
      locations: locations,
      z: z,
      autocolorscale: true
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
          subunitcolor: 'rgb(255, 255, 255)',
          lonaxis: {},
          lataxis: {}
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
      data[0]["colorbar"] = {
        tickfont: {
          color: "#fff"
        }
      };
      layout["geo"]["bgcolor"] = "#222";
    }

    Plotly.plot(graphId, data, layout, config);

    recordGraphSize(graphId, graphHeight, graphWidth);
  }
}

// Creates views by traffic source graph in platform dashboard
function handleViewsByTrafficSource(response) {
  if (response) {
    console.log("Response received", "handleViewsByTrafficSource");
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
    var values = [advertisingViews, externalViews, youtubeSearchViews, relatedViews, otherViews];
    var labels = ["Advertising", "External", "YouTube<br>Search", "Related<br>Video", "Other"];

    var graphId = "channel-traffic-sources";
    var graphHeight = 0.33;
    var graphWidth = 0.33;
    var height = graphHeight * document.documentElement.clientHeight;
    var width = graphWidth * document.documentElement.clientHeight;

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
      font: {size: 18},
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

    recordGraphSize(graphId, graphHeight, graphWidth);
  }
}


/* Real Time Stats Calls */

// Saves stats to realTimeStats then loads them
function handleRealTimeStats(response, message) {
  if (response) {
    console.log("Response received", "handleRealTimeStats");

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

    console.log("Real Time Stats: ", stats);
    // message is either "cumulative", "month", or "today"
    if (message == "cumulative") {
      loadRealTimeStats();
    }
  }
}


/* Top Ten Dashboard Calls */

// Saves most watched videos by month to a Google Sheet
function handleMostWatchedVideos(response, month) {
  if (response) {
    console.log("Response received", "handleMostWatchedVideos");
    var videos = response.result.rows;
    if (month != undefined) {
      var nonOrganicVideos = ["vio9VoZRkbQ", "dqkUlrFoZY4", "YfrmIjwDvXo",
          "k40iosW6WWA", "nac3gBfz1W4", "dE2Svgsrex0", "5Ci3PlLr8Oo"];
      var values = [[month]];
      var index = 0;
      var numVideos = 1;
      while (numVideos <= 10) {
        if (!nonOrganicVideos.includes(videos[index][0])) {
          values[0].push(videos[index][0]);
          numVideos++;
        }
        index++;
      }
      var body = {
        "values": values
      };
      var row = 3 + monthDiff(new Date(2010, 6), new Date(month));
      var sheet = "Top Ten Videos!A" + row;
      requestUpdateSheetData("1Srtu29kx9nwUe_5citZpsrPw20e27xXrlfcbMvRPPUw", sheet, body);
    }
  }
}


/* Top Video Calls */

// Displays video views, likes, comments, etc. in top video dashboard
function handleVideoBasicStats(response, dashboardId) {
  if (response) {
    console.log("Response received", "handleVideoBasicStats");
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
    let videoDuration = document.getElementById(dashboardId + "-duration-seconds").innerHTML;

    let avp = decimalToPercent(avd / videoDuration);
    let avgViewPercentage =
        document.getElementById(dashboardId + "-avg-view-percentage");
    avgViewPercentage.innerHTML = " (" + avp + "%)";

    let estimatedMinutesWatched =
        document.getElementById(dashboardId + "-minutes-watched");
    estimatedMinutesWatched.innerHTML = numberWithCommas(stats[5]);
  }
}

// Creates daily views graph for a video in top video dashboard
function handleVideoDailyViews(response, dashboardId) {
  if (response) {
    console.log("Response received", "handleVideoDailyViews");
    let rows = response.result.rows;
    var xValues = [];
    var yValues = [];

    for (var i = 0; i < rows.length; i++) {
      xValues.push(rows[i][0]);
      yValues.push(rows[i][1]);
    }

    var graphId = dashboardId + "-views-graph";
    var graphHeight = 0.17;
    var graphWidth = 0.51;
    var height = graphHeight * document.documentElement.clientHeight;
    var width = graphWidth * document.documentElement.clientHeight;
    var xaxis = {
      automargin: true,
      tickangle: -90,
      tickformat: '%-m/%d',
      title: 'Day',
      type: 'date'
    };
    var yaxis = {
      showline: true,
      showticklabels: true,
      automargin: true,
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
      font: {size: 16},
      margin: {
        b: 0,
        t: 0,
      },
      xaxis: xaxis,
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

    recordGraphSize(graphId, graphHeight, graphWidth, automargin);
  }
}

// Creates top search terms graph for a video in top video dashboard
function handleVideoSearchTerms(response, dashboardId) {
  if (response) {
    console.log("Response received", "handleVideoSearchTerms");
    let searchTerms = response.result.rows;
    let xValues = [];
    let yValues = [];
    let numTerms = Math.min(4, searchTerms.length - 1);
    for (var i = numTerms; i >= 0; i--) {
      xValues.push(searchTerms[i][1]);
      yValues.push(searchTerms[i][0]);
    }

    var graphId = dashboardId + "-search-terms";
    var graphHeight = 0.17;
    var graphWidth = 0.51;
    var height = graphHeight * document.documentElement.clientHeight;
    var width = graphWidth * document.documentElement.clientHeight;
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
        text: xValues.map(String),
        textposition: 'auto',
        marker: {
          color: 'rgb(255,0,0)'
        }
      }
    ];
    
    var layout = {
      height: height,
      width: width,
      font: {size: 16},
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

    recordGraphSize(graphId, graphHeight, graphWidth, automargin);
  }
}

// Displays video title, duration, publish date, and thumbnail in top video
// dashboard
function handleVideoSnippet(response, dashboardId) {
  if (response) {
    console.log("Response received", "handleVideoSnippet");
    let title = document.getElementById(dashboardId + "-title");
    title.innerHTML = response.result.items[0].snippet.title;
    duration = response.result.items[0].contentDetails.duration;
    let videoDuration = isoDurationToSeconds(duration);
    document.getElementById(dashboardId + "-duration").innerHTML = "Duration: " +
        secondsToDuration(videoDuration);
    document.getElementById(dashboardId + "-duration-seconds").innerHTML = 
        videoDuration;

    let publishDateText = document.getElementById(dashboardId + "-publish-date");
    let publishDate = response.result.items[0].snippet.publishedAt;
    let year = publishDate.slice(0, 4);
    let month = publishDate.slice(5, 7);
    let day = publishDate.slice(8, 10);
    publishDate = month + "/" + day + "/" + year;
    publishDateText.innerHTML = "Published: " + publishDate;

    let thumbnail = document.getElementById(dashboardId + "-thumbnail");
    let videoId = response.result.items[0].id;
    thumbnail.innerHTML = `<img class="top-video-thumbnail" src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" alt="thumbnail" title="YouTube Video ID: ${videoId}">`;

    // let tags = response.result.items[0].snippet.tags;
  }
}


/* Google Sheets/Drive Calls */

function handleAppendSheetData(response) {
  if (response) {
    console.log("Response received", "handleAppendSheetData");
  }
}

// Requests spreadsheet data based on when sheet was last modified
function handleFileModifiedTime(response, message) {
  if (response) {
    console.log("Response received", "handleFileModifiedTime");
    var modifiedTime = new Date(response.result.modifiedTime);
    var lastUpdatedOn = new Date(localStorage.getItem("lastUpdatedOn"));
    console.log(message + " was last modified on " + modifiedTime.toString());
    if (message == "Video List") {
      if (lastUpdatedOn - modifiedTime < 0) {
        requestSpreadsheetData("1rFuVMl_jarRY7IHxDZkpu9Ma-vA_YBFj-wvK-1XZDyM", "Category List");
      } else {
        requestSpreadsheetData("1Srtu29kx9nwUe_5citZpsrPw20e27xXrlfcbMvRPPUw", "Video Stats");
        requestSpreadsheetData("1Srtu29kx9nwUe_5citZpsrPw20e27xXrlfcbMvRPPUw", "Category Stats");
        requestSpreadsheetData("1Srtu29kx9nwUe_5citZpsrPw20e27xXrlfcbMvRPPUw", "Top Ten Videos");
      }
    }

  }
}

// Calls different functions based on what sheet data was requested
function handleSpreadsheetData(response, message) {
  if (response) {
    console.log("Response received", "handleSpreadsheetData");
    if (message == "Category List") {
      localStorage.setItem("categoryListSheet", JSON.stringify(response.result.values));
      recordCategoryListData();
    } else if (message == "Video List") {
      localStorage.setItem("videoListSheet", JSON.stringify(response.result.values));
      recordVideoListData();
    } else if (message == "Video Stats") {
      localStorage.setItem("videoSheet", JSON.stringify(response.result.values));
      recordVideoData();
    } else if (message == "Category Stats") {
      localStorage.setItem("categoriesSheet", JSON.stringify(response.result.values));
      recordCategoryData();
    } else if (message == "Top Ten Videos") {
      localStorage.setItem("topTenSheet", JSON.stringify(response.result.values));
      displayTopTenThumbnails();
    }
    let date = new Date();
    date.setHours(6, 0, 0, 0);
    localStorage.setItem("lastUpdatedOn", date.toString());
  }
}

function handleUpdateSheetData(response) {
  if (response) {
    console.log("Response received", "handleUpdateSheetData");
  }
}


/* Miscellaneous Calls */

function handleChannelInfo(response) {
  if (response) {
    console.log("Response received", "handleChannelInfo");
  }
}

function handleSubscribersGained(response) {
  if (response) {
    console.log("Response received", "handleSubscribersGained");
  }
}

function handleVideoPlaylist(response) {
  const playlistItems = response.result.items;
  if (playlistItems) {
    console.log("Response received", "handleVideoPlaylist");
  }
}

function handleVideoRetention(response) {
  if (response) {
    console.log("Response received", "handleVideoRetention");
    // console.log("Percent Watched: ", response.result.rows);
  }
}

function handleVideoViewsByTrafficSource(response) {
  if (response) {
    console.log("Response received", "handleVideoViewsByTrafficSource");
  }
}