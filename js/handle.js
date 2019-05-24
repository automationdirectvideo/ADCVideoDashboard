// Handles basic video stats response from Analytics API
function handleBasicVideoStats(response) {
  if (response) {
    console.log("Response from Analytics API received");
  }
}

// Handles channel info response from Data API
function handleChannelInfo(response) {
  const channel = response.result.items[0];

  const output = `
    <ul class="list-group">
      <li class="list-group-item">Title: ${channel.snippet.title}</li>
      <li class="list-group-item">ID: ${channel.id}</li>
      <li class="list-group-item">Subscribers: ${numberWithCommas(channel.statistics.subscriberCount)}</li>
      <li class="list-group-item">Views: ${numberWithCommas(channel.statistics.viewCount)}</li>
      <li class="list-group-item">Videos: ${numberWithCommas(channel.statistics.videoCount)}</li>
    </ul>
    <p>${channel.snippet.description}</p>
    <hr>
    <a class="btn btn-dark" target="_blank" href="https://youtube.com/${channel.snippet.customUrl}">Visit Channel</a>
  `;
  showChannelData(output);

  // const playlistId = channel.contentDetails.relatedPlaylists.uploads;
  // requestVideoPlaylist(playlistId, 12);
}

// Handles impressions response from Analytics API
function handleImpressionsForLast(response) {
  if (response) {
    console.log("Response from Analytics API received");
  }
}

// Handles subscribers gained response from Analytics API
function handleSubscribersGained(response) {
  if (response) {
    console.log("Response from Analytics API received");
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

