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

// Handles subscribers gained response from Analytics API
function handleSubscribersGained(response) {
  if (response) {
    console.log("Response received", "handleSubscribersGained");
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
    let output = `<ol class="text-left">`;
    let searchTerms = response.result.rows;
    for (var i = 0; i < 5; i++) {
      output += "<li>" + searchTerms[i][0] + " - " + searchTerms[i][1] + "</li>";
    }
    output += "</ol>";
    let searchTermsList = document.getElementById("top-video-1-search-terms");
    searchTermsList.innerHTML = output;
    console.log("Top Search Terms: ", searchTerms);
  }
}

function handleVideoSnippet(response) {
  if (response) {
    console.log("Response received", "handleVideoSnippet");
    let title = document.getElementById("top-video-1-title");
    title.innerHTML = "Title: " + response.result.items[0].snippet.title;
    duration = response.result.items[0].contentDetails.duration;
    duration = duration.replace("PT","").replace("H",":").replace("M",":").replace("S","");
    durationArr = duration.split(":");
    videoDuration = duration[0] * 3600 + duration[1] * 60 + duration[2];
    console.log("Set Video Duration: " + videoDuration);

    let publishDateText = document.getElementById("top-video-1-publish-date");
    let publishDate = response.result.items[0].snippet.publishedAt;
    let year = publishDate.slice(0, 4);
    let month = publishDate.slice(5, 7);
    let day = publishDate.slice(8, 10);
    publishDate = month + "/" + day + "/" + year;
    publishDateText.innerHTML = "Publish Date: " + publishDate;

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

    let likes = document.getElementById("top-video-1-likes");
    likes.innerHTML = numberWithCommas(stats[3]);

    let dislikes = document.getElementById("top-video-1-dislikes");
    dislikes.innerHTML = numberWithCommas(stats[4]);

    let comments = document.getElementById("top-video-1-comments");
    comments.innerHTML = numberWithCommas(stats[2]);

    let avgViewDuration =
        document.getElementById("top-video-1-avg-view-duration");
    let avd = stats[6];
    let avdMinutes = Math.floor(avd / 60);
    let avdSeconds = ('00' + avd % 60).substr(-2);
    avgViewDuration.innerHTML = avdMinutes + ":" + avdSeconds;
    console.log("Get Video Duration: " + videoDuration);
    let avp = Math.round(avd / videoDuration * 1000) / 10;
    let avgViewPercentage =
        document.getElementById("top-video-1-avg-view-percentage");
    avgViewPercentage.innerHTML = "(" + avp + ")%";

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