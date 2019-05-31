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
  // const channel = response.result.items[0];

  // const output = `
  //   <ul class="list-group">
  //     <li class="list-group-item">Title: ${channel.snippet.title}</li>
  //     <li class="list-group-item">ID: ${channel.id}</li>
  //     <li class="list-group-item">Subscribers: ${numberWithCommas(channel.statistics.subscriberCount)}</li>
  //     <li class="list-group-item">Views: ${numberWithCommas(channel.statistics.viewCount)}</li>
  //     <li class="list-group-item">Videos: ${numberWithCommas(channel.statistics.videoCount)}</li>
  //   </ul>
  //   <p>${channel.snippet.description}</p>
  //   <hr>
  //   <a class="btn btn-dark" target="_blank" href="https://youtube.com/${channel.snippet.customUrl}">Visit Channel</a>
  // `;
  // showChannelData(output);

  // const playlistId = channel.contentDetails.relatedPlaylists.uploads;
  // requestVideoPlaylist(playlistId, 12);
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
  const playListItems = response.result.items;
  if (playListItems) {
    let output = `<h4 class="text-center col-12">Latest Videos</h4>`;

    // Loop though videos and append output
    playListItems.forEach(item => {
      const videoId = item.snippet.resourceId.videoId;

      output += `
        <div class="col-3">
        <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media;" allowfullscreen></iframe>
        </div>
      `;
    });

    // Output videos
    videoContainer.innerHTML = output;

  } else {
    videoContainer.innerHTML = "No Uploaded Videos";
  }
}

function handleVideoRetention(response) {
  if (response) {
    console.log("Response received", "handleVideoRetention");
    let percentWatched = document.getElementById("top-video-1-percent-watched");
    percentWatched.innerHTML = "See Console";
    console.log("Percent Watched: ", response.result.rows);
  }
}

function handleVideoSearchTerms(response) {
  if (response) {
    console.log("Response received", "handleVideoSearchTerms");
    let output = "<ol>";
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

    let publishDateText = document.getElementById("top-video-1-publish-date");
    let publishDate = response.result.items[0].snippet.publishedAt;
    let year = publishDate.slice(0, 4);
    let month = publishDate.slice(5, 7);
    let day = publishDate.slice(8, 10);
    publishDate = month + "/" + day + "/" + year;
    publishDateText.innerHTML = "Publish Date: " + publishDate;

    let output = "<ol>";
    let tags = response.result.items[0].snippet.tags;
    for (var i = 0; i < 5; i++) {
      output += "<li>" + tags[i] + "</li>";
    }
    output += "</ol>";
    let tagsList = document.getElementById("top-video-1-tags");
    tagsList.innerHTML = output;
    console.log("Tags: ", tags);
  }
}

function handleVideoStats(response) {
  if (response) {
    console.log("Response received", "handleVideoStats");
    let stats = response.result.rows[0];
    let views = document.getElementById("top-video-1-views");
    views.innerHTML = numberWithCommas(stats[1]);
    let subsGained = document.getElementById("top-video-1-subs-gained");
    subsGained.innerHTML = numberWithCommas(stats[7]);
    let subsLost = document.getElementById("top-video-1-subs-lost");
    subsLost.innerHTML = numberWithCommas(stats[8]);
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
    avgViewDuration.innerHTML = numberWithCommas(stats[6]);
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