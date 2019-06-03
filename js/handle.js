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

// Handles impressions response from Analytics API
function handleImpressions(response) {
  if (response) {
    console.log("Response received", "handleImpressions");
  }
}

// Handles most watched videos response from Analytics API
function handleMostWatchedVideos(response) {
  if (response) {
    console.log("Response received", "handleMostWatchedVideos");
    var videos = response.result.rows;
    videos.forEach(video => {
      const videoId = video[0];
      requestVideoViewsByTrafficSource(getDateFromDaysAgo(30), getTodaysDate(),
          videoId);
    });
  }
}

function handleRealTimeStats(response) {
  if (response) {
    console.log("Response received", "handleRealTimeStats");
    var rows = response.result.rows;
    var headers = response.result.columnHeaders;

    // // // localStorage.setItem("realTimeStatsResponse", response);

    // var realTimeStats = {};
    // if (!localStorage.getItem("realTimeStats")) {
    //   for (var i = 0; i < rows.length; i++) {
    //     realTimeStats[headers[i]] = rows[i];
    //   }
    //   realTimeStats["recorded"] = new Date().toString();
    //   localStorage.setItem("realTimeStats", realTimeStats);
    // }
    // realTimeStats = localStorage.getItem("realTimeStats");
    // console.log("Real Time Stats: ", JSON.stringify(realTimeStats));
  }
}

function handleRealTimeStatsByDay(response) {
  if (response) {
    console.log("Response received", "handleRealTimeStatsByDay");
    // localStorage.setItem("realTimeStatsByDayResponse", response);
  }
}

// Handles subscribers gained response from Analytics API
function handleSubscribersGained(response) {
  if (response) {
    console.log("Response received", "handleSubscribersGained");
  }
}

function handleVideoDailyViews(response) {
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

    Plotly.newPlot('top-video-1-views-graph', data, layout, {staticPlot: true, responsive: true});
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
    // let percentWatched = document.getElementById("top-video-1-percent-watched");
    // percentWatched.innerHTML = "See Console";
    // console.log("Percent Watched: ", response.result.rows);
  }
}

function handleVideoSearchTerms(response) {
  if (response) {
    console.log("Response received", "handleVideoSearchTerms");
    let searchTerms = response.result.rows;
    let xValues = [];
    let yValues = [];
    for (var i = 4; i >= 0; i--) {
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
    
    Plotly.newPlot('top-video-1-search-terms', data, layout, {staticPlot: true, responsive: true});
  }
}

function handleVideoSnippet(response) {
  if (response) {
    console.log("Response received", "handleVideoSnippet");
    let title = document.getElementById("top-video-1-title");
    title.innerHTML = response.result.items[0].snippet.title;
    duration = response.result.items[0].contentDetails.duration;
    duration = duration.replace("PT","").replace("H",":").replace("M",":")
        .replace("S","");
    durationArr = duration.split(":");
    let videoDuration;
    if (durationArr.length == 3) {
      videoDuration = Number(durationArr[0]) * 3600 + 
          Number(durationArr[1]) * 60 + Number(durationArr[2]);
    } else if (durationArr.length == 2) {
      videoDuration = Number(durationArr[0]) * 60 + Number(durationArr[1]);
    } else {
      videoDuration = duration;
    }
    document.getElementById("top-video-1-duration").innerHTML = "Duration: " +
        secondsToDuration(videoDuration);
    document.getElementById("top-video-1-duration-seconds").innerHTML = 
        videoDuration;

    let publishDateText = document.getElementById("top-video-1-publish-date");
    let publishDate = response.result.items[0].snippet.publishedAt;
    let year = publishDate.slice(0, 4);
    let month = publishDate.slice(5, 7);
    let day = publishDate.slice(8, 10);
    publishDate = month + "/" + day + "/" + year;
    publishDateText.innerHTML = "Published: " + publishDate;

    let thumbnail = document.getElementById("top-video-1-thumbnail");
    let videoId = response.result.items[0].id;
    thumbnail.innerHTML = `<img class="top-video-thumbnail" src="https://i.ytimg.com/vi/${videoId}/sddefault.jpg" alt="thumbnail">`;

    /*  Outputing tags  */
    // let output = `<ol class="text-left">`;
    // let tags = response.result.items[0].snippet.tags;
    // for (var i = 0; i < 5; i++) {
    //   output += "<li>" + tags[i] + "</li>";
    // }
    // output += "</ol>";
    // let tagsList = document.getElementById("top-video-1-tags");
    // tagsList.innerHTML = output;
    console.log("Tags: ", tags);
  }
}

function handleVideoStats(response) {
  if (response) {
    console.log("Response received", "handleVideoStats");
    let stats = response.result.rows[0];

    let views = document.getElementById("top-video-1-views");
    views.innerHTML = numberWithCommas(stats[1]);

    let subsNet = document.getElementById("top-video-1-subs-net");
    subsNet.innerHTML = numberWithCommas(stats[7] - stats[8]);

    let likeRatioElem = document.getElementById("top-video-1-like-ratio");
    let likes = document.getElementById("top-video-1-likes");
    let likeBar = document.getElementById("top-video-1-like-bar");
    let likeRatio = decimalToPercent(stats[3] / (stats[3] + stats[4]));
    likeRatioElem.innerHTML = likeRatio + "%";
    likes.innerHTML = numberWithCommas(stats[3]) + " Likes";
    likeBar.style.width = likeRatio + "%";
    likeBar.setAttribute("aria-valuenow", likeRatio);

    let dislikes = document.getElementById("top-video-1-dislikes");
    dislikes.innerHTML = stats[4] + " Dislikes";

    let comments = document.getElementById("top-video-1-comments");
    comments.innerHTML = numberWithCommas(stats[2]);

    let avgViewDuration =
        document.getElementById("top-video-1-avg-view-duration");
    let avd = stats[6];
    avgViewDuration.innerHTML = secondsToDuration(avd);
    let videoDuration = document.getElementById("top-video-1-duration-seconds").innerHTML;

    let avp = decimalToPercent(avd / videoDuration);
    let avgViewPercentage =
        document.getElementById("top-video-1-avg-view-percentage");
    avgViewPercentage.innerHTML = " (" + avp + "%)";

    let estimatedMinutesWatched =
        document.getElementById("top-video-1-minutes-watched");
    estimatedMinutesWatched.innerHTML = numberWithCommas(stats[5]);
  }
}

// Handles video views by traffic source response from Analytics API
function handleVideoViewsByTrafficSource(response) {
  if (response) {
    console.log("Response received", "handleVideoViewsByTrafficSource");
    // numVideosProcessed++;
    // // Get traffic source info from response
    // // Sum organic views
    // // Add to mostViewedVideos
    // console.log("Number of Videos Processed: " + numVideosProcessed);
    // if (numVideosProcessed == 25) {
    //   numVideosProcessed = 0;
    //   console.log("25 videos processed!");
    //   // Call function to organize and display top 10 organic videos
    // }
  }
}

// Handles views by device type response from Analytics API
function handleViewsByDeviceType(response) {
  if (response) {
    console.log("Response received", "handleViewsByDeviceType");
  }
}

// Handles views by traffic source response from Analytics API
function handleViewsByTrafficSource(response) {
  if (response) {
    console.log("Response received", "handleViewsByTrafficSource");
  }
}