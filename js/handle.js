// Handles basic video stats response from Analytics API
function handleBasicVideoStats(response) {
  if (response) {
    console.log("Response received", "handleBasicVideoStats");
  }
}

// Handles channel info response from Data API
function handleChannelInfo(response) {
  if (response) {
    console.log("Response received", "handleChannelInfo");
  }
}

function handleChannelSearchTerms(response) {
  if (response) {
    console.log("Response received", "handleChannelSearchTerms");
    let searchTerms = response.result.rows;
    let xValues = [];
    let yValues = [];
    let numTerms = Math.min(9, searchTerms.length+ - 1);
    for (var i = numTerms; i >= 0; i--) {
      xValues.push(searchTerms[i][1]);
      yValues.push(searchTerms[i][0]);
    }
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
      font: {size: 24},
      margin: {
        b: 10,
        t: 10,
      },
      xaxis: {
        visible: false,
        automargin: true
      },
      yaxis: {
        showline: true,
        showticklabels: true,
        tickmode: 'linear',
        automargin: true
      }
    };
    
    var config = {
      staticPlot: true, 
      responsive: true
    };
    
    Plotly.newPlot('channel-search-terms', data, layout, config);
  }
}

// Handles impressions response from Analytics API
function handleImpressions(response) {
  if (response) {
    console.log("Response received", "handleImpressions");
  }
}

// Handles most watched videos response from Analytics API
function handleMostWatchedVideos(response, month) {
  if (response) {
    console.log("Response received", "handleMostWatchedVideos");
    var videos = response.result.rows;
    if (month != undefined) {
      var advertisedVideos = ["vio9VoZRkbQ", "dqkUlrFoZY4", "rNOoyOGBFK4", "Eyvv66xYwS8", "YfrmIjwDvXo"];
      var values = [month];
      var index = 0;
      var numVideos = 1;
      while (numVideos <= 10) {
        if (!advertisedVideos.includes(videos[index][0])) {
          values.push(videos[index][0]);
          numVideos++;
        }
        index++;
      }
      var body = {
        "values": values
      };
      requestAppendSheetData("1Srtu29kx9nwUe_5citZpsrPw20e27xXrlfcbMvRPPUw", "Top Ten", body);
    }
  }
}

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

// Handles subscribers gained response from Analytics API
function handleSubscribersGained(response) {
  if (response) {
    console.log("Response received", "handleSubscribersGained");
  }
}

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
      font: {size: 16},
      margin: {
        b: 0,
        t: 0,
      },
      xaxis: {
        automargin: true,
        tickangle: -90,
        tickformat: '%-m/%d',
        title: 'Day',
        type: 'date'
      },
      yaxis: {
        showline: true,
        showticklabels: true,
        automargin: true,
        title: 'Views'
      }
    };

    var config = {
      staticPlot: true, 
      responsive: true
    };

    Plotly.newPlot(dashboardId + '-views-graph', data, layout, config);
  }
}

// Handles video playlist response from Analytics API
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
      font: {size: 16},
      margin: {
        b: 0,
        t: 0,
      },
      xaxis: {
        visible: false,
        automargin: true
      },
      yaxis: {
        showline: true,
        showticklabels: true,
        tickmode: 'linear',
        automargin: true
      }
    };
    
    var config = {
      staticPlot: true, 
      responsive: true
    };
    
    Plotly.newPlot(dashboardId + '-search-terms', data, layout, config);
  }
}

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
    thumbnail.innerHTML = `<img class="top-video-thumbnail" src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" alt="thumbnail">`;

    // let tags = response.result.items[0].snippet.tags;
  }
}

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
      categoryTotals[categoryId]["views"] = categoryViews + viewCount;
      categoryTotals[categoryId]["likes"] = categoryLikes + likeCount;
      categoryTotals[categoryId]["duration"] = categoryDuration + duration;
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

function handleVideoTitle(response, dashboardId) {
  if (response) {
    console.log("Response received", "handleVideoStatisticsOverall");
    let title = response.result.items[0].snippet.title;
    let titleText = document.getElementById(dashboardId + "-title");
    titleText.innerText = title;
  }
}

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

// Handles video views by traffic source response from Analytics API
function handleVideoViewsByTrafficSource(response) {
  if (response) {
    console.log("Response received", "handleVideoViewsByTrafficSource");
  }
}

// Handles views by device type response from Analytics API
function handleViewsByDeviceType(response) {
  if (response) {
    console.log("Response received", "handleViewsByDeviceType");
    var rows = response.result.rows;
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
    var data = [{
      values: values,
      labels: labels,
      type: 'pie',
      textinfo: 'label+percent',
      rotation: -45,
      direction: 'clockwise'
    }];

    var layout = {
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

    Plotly.newPlot('channel-views-by-device', data, layout, config);
  }
}

// Handles views by traffic source response from Analytics API
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
    var labels = ["Advertising", "External", "YouTube<br>Search", "Related Video", "Other"];
    var data = [{
      values: values,
      labels: labels,
      type: 'pie',
      textinfo: 'label+percent',
      rotation: 90
    }];

    var layout = {
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
    
    Plotly.newPlot('channel-traffic-sources', data, layout, config);
  }
}

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

    var data = [{
      type: 'choropleth',
      locationmode: 'USA-states',
      locations: locations,
      z: z,
      autocolorscale: true
    }];

    var layout = {
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

    Plotly.plot('channel-views-by-state', data, layout, config);
  }
}

function handleSpreadsheetData(response, message) {
  if (response) {
    console.log("Response received", "handleSpreadsheetData");
    if (message == "Videos By Category") {
      localStorage.setItem("videosByCategorySheet", JSON.stringify(response.result.values));
      getVideosByCategoryData();
    } else if (message == "Video Stats") {
      localStorage.setItem("videoSheet", JSON.stringify(response.result.values));
      recordVideoData();
    } else if (message == "Category Stats") {
      localStorage.setItem("categoriesSheet", JSON.stringify(response.result.values));
      recordCategoryData();
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

function handleAppendSheetData(response) {
  if (response) {
    console.log("Response received", "handleAppendSheetData");
  }
}

function handleFileModifiedTime(response, message) {
  if (response) {
    console.log("Response received", "handleFileModifiedTime");
    var modifiedTime = new Date(response.result.modifiedTime);
    var lastUpdatedOn = new Date(localStorage.getItem("lastUpdatedOn"));
    console.log(message + " was last modified on " + modifiedTime.toString());
    if (message == "Videos By Category") {
      if (lastUpdatedOn - modifiedTime < 0) {
        requestSpreadsheetData("1rFuVMl_jarRY7IHxDZkpu9Ma-vA_YBFj-wvK-1XZDyM", "Videos By Category");
      } else {
        requestSpreadsheetData("1Srtu29kx9nwUe_5citZpsrPw20e27xXrlfcbMvRPPUw", "Video Stats");
        requestSpreadsheetData("1Srtu29kx9nwUe_5citZpsrPw20e27xXrlfcbMvRPPUw", "Category Stats");
      }
    }

  }
}