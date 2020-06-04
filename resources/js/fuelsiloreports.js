function displayChannelPlaylists() {
  return getChannelPlaylists()
    .then(playlists => {
      console.log("All Playlist Data");
      console.log(playlists);
      createPlaylistsTable(playlists);
      return Promise.resolve("Displayed Channel Playlists");
    })
    .catch(err => {
      const errorMsg = `Unable to display ADC channel playlists - `;
      displayError(errorMsg);
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    })
    .then(response => {
      const loadingCog = document.getElementById("table-loading");
      loadingCog.style.display = "none";
    })
}

function getChannelPlaylists(pageToken) {
  let request = {
    "maxResults": 25,
    "mine": true,
    "part": "snippet,contentDetails"
  };
  if (pageToken) {
    request["pageToken"] = pageToken;
  }

  return gapi.client.youtube.playlists.list(request)
    .then(response => {
      console.log("Channel Playlists");
      console.log(response);
      let playlistList = []
      let playlistData = response.result.items;
      for (let index = 0; index < playlistData.length; index++) {
        const playlist = playlistData[index];
        const id = playlist.id;
        const title = playlist.snippet.title;
        let thumbnail;
        try {
          thumbnail = playlist.snippet.thumbnails.maxres.url;
        } catch (err) {
          // MaxRes thumbnail does not exist
          thumbnail = playlist.snippet.thumbnails.high.url;
        }
        const description = playlist.snippet.description;
        const numVideos = playlist.contentDetails.itemCount;
        const publishedAt = playlist.snippet.publishedAt;
        playlistList.push({
          "id": id,
          "title": title,
          "thumbnail": thumbnail,
          "description": description,
          "numVideos": numVideos,
          "publishedAt": publishedAt
        });
      }

      let nextPageToken = response.result.nextPageToken;
      if (nextPageToken) {
        return getChannelPlaylists(nextPageToken)
          .then(morePlaylistList => {
            let allPlaylistList = [].concat.apply([],
              [playlistList, morePlaylistList]);
            return allPlaylistList;
          })
      } else {
        return playlistList;
      }
    })
    .catch(err => {
      const errorMsg = `Unable to get ADC channel playlists - `;
      displayError(errorMsg);
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

function createPlaylistsTable(playlists) {
  const playlistTableBody = document.getElementById("playlist-table-body");
  let output = ``;
  playlists.forEach(playlist => {
    const id = playlist.id;
    const title = playlist.title;
    const thumbnail = playlist.thumbnail;
    const description = playlist.description || "No Description";
    const numVideos = playlist.numVideos;
    let numVideosText;
    if (numVideos == 1) {
      numVideosText = "1 video";
    } else {
      numVideosText = `${numVideos} videos`;
    }
    const publishedAt = playlist.publishedAt;
    output += `
    <tr>
      <td>
        <a href="https://www.youtube.com/playlist?list=${id}" target="_blank"
          alt="${title}">
          <img class="table-thumbnail" src="${thumbnail}" 
            alt="thumbnail" title="${title}">
        </a>
      </td>
      <td class="h5"><strong>${title}</strong></td>
      <td>${description}</td>
      <td data-sort="${numVideos}">${numVideosText}</td>
      <td>
        <button class="btn btn-lg btn-primary"
          onclick="generateReportForPlaylist('${id}', '${title}')">
          Generate Report
        </button>
      </td>
      <td class="d-none">${id}</td>
      <td class="d-none">${publishedAt}</td>
    </tr>
    `;
  });
  playlistTableBody.innerHTML = output;
  $("#playlist-table").DataTable({
    "columnDefs": [
      {
        "orderable": false,
        "targets": [0, 4]
      },
      {
        "searchable": false,
        "targets": 6
      },
      {
        "width": "20%",
        "targets": 1
      }
    ],
    "order": [[6, 'desc']],
    "pageLength": 25
  });
}

function generateReportForPlaylist(playlistId, playlistTitle) {
  console.log(`Report generated for playlist: ${playlistId}`);

  $("html, body").animate({scrollTop: 0}, "slow");
  const reportLoadingDiv = document.getElementById("report-loading-div");
  reportLoadingDiv.style.display = "";
  const reportPlaylistTitle = document.getElementById("report-playlist-title");
  reportPlaylistTitle.innerText = playlistTitle;

  const startDate = "2010-01-01";
  const endDate = "2020-05-01";
  return getPlaylistVideos(playlistId)
    .then(videos => {
      console.log(videos);
      return getCumulativeViews(videos, startDate, endDate);
    })
    .then(monthlyViews => {
      console.log("Monthly Views");
      console.log(monthlyViews);
      createMonthlyViewsGraph(monthlyViews);
    })
    .catch(err => {
      const errorMsg = `Unable to generate report for playlist: ${playlistId}` +
        ` - `;
      displayError(errorMsg);
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    })
    .then(response => {
      const loadingCog = document.getElementById("report-loading");
      const generatingText = document.getElementById("generating-text");
      loadingCog.style.display = "none";
      generatingText.style.display = "none";
    })
}

function getPlaylistVideos(playlistId, pageToken) {
  let request = {
    "part": "snippet,status,contentDetails",
    "maxResults": 50,
    "playlistId": playlistId
  };
  if (pageToken) {
    request["pageToken"] = pageToken;
  }

  return gapi.client.youtube.playlistItems.list(request)
    .then(response => {
      console.log("Playlist Videos:");
      console.log(response);
      let videoList = [];
      let videoData = response.result.items;
      for (let index = 0; index < videoData.length; index++) {
        const video = videoData[index];
        const videoId = video.contentDetails.videoId;
        videoList.push(videoId);
      }

      let nextPageToken = response.result.nextPageToken;
      if (nextPageToken) {
        return getPlaylistVideos(playlistId, nextPageToken)
          .then(moreVideosList => {
            let allVideosList = [].concat.apply([],
              [videoList, moreVideosList]);
            return allVideosList;
          })
      } else {
        return videoList;
      }
    })
    .catch(err => {
      const errorMsg = `Unable to get videos for playlist: ${playlistId} - `;
      displayError(errorMsg);
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

function getCumulativeViews(videos, startDate, endDate) {
  let videoViewsRequests = [];
  videos.forEach(videoId => {
    videoViewsRequests.push(getVideoViewsByMonth(videoId, startDate, endDate));
  });

  return Promise.all(videoViewsRequests)
    .then(viewsData => {
      let monthlyViews = {};
      viewsData.forEach(videoViews => {
        videoViews.forEach(monthData => {
          const month = monthData[0];
          const views = monthData[1];
          if (!monthlyViews[month]) {
            monthlyViews[month] = 0;
          }
          monthlyViews[month] += views;
        });
      });
      return monthlyViews;
    })
    .catch(err => {
      const errorMsg = `Unable to combine all views data into one array - `;
      displayError(errorMsg);
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

function getVideoViewsByMonth(videoId, startDate, endDate) {
  const request = {
    "dimensions": "month",
    "endDate": endDate,
    "filters": `video==${videoId}`,
    "ids": "channel==MINE",
    "metrics": "views",
    "startDate": startDate
  };

  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      const viewsData = response.result.rows;
      return viewsData;
    })
    .catch(err => {
      const errorMsg = `Unable to get monthly views for video: ${videoId} - `;
      displayError(errorMsg);
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

function createMonthlyViewsGraph(monthlyViews) {
  let monthList = [];
  let viewsList = [];
  for (const month in monthlyViews) {
    if (monthlyViews.hasOwnProperty(month)) {
      const views = monthlyViews[month];
      monthList.push(month);
      viewsList.push(views);
    }
  }
  var graphHeight = 0.75;
  var graphWidth = 0.6603;
  var height = graphHeight * document.documentElement.clientHeight;
  var width = graphWidth * document.documentElement.clientWidth;
  var tickSize = Math.floor(0.0073 * document.documentElement.clientWidth);
  var axisTitleSize = Math.floor(0.0094 * document.documentElement.clientWidth);
  var titleSize = Math.floor(0.0104 * document.documentElement.clientWidth);
  const trace = [{
    "x": monthList,
    "y": viewsList,
    "type": "bar",
    "name": "Monthy Views"
  }];
  let layout = {
    height: height,
    width: width,
    title: {
      font: {
        size: titleSize
      },
      text: "Playlist Monthly Views"
    },
    xaxis: {
      automargin: true,
      hoverformat: "%b %Y",
      tickformat: "%b<br>%Y",
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
        text: "Views"
      }
    }
  };
  const config = {
    scrollZoom: false,
    displayModeBar: false
  };
  if (monthList.length < 7) {
    layout.xaxis.nticks = monthList.length;
  }
  console.log(trace);
  Plotly.newPlot("playlist-graph", trace, layout, config);
  document.getElementById("playlist-graph").style.display = "";
}

function displayError(errorMsg) {
  const alertContainer = document.getElementById("alert-container");
  const alertText = `
    <div class="alert alert-danger alert-dismissible fade show mb-2" id="error-alert" role="alert" style="display:inline-block;">
      <i class="fas fa-exclamation-triangle"></i>  <strong>An error occurred:</strong> ${errorMsg}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`;
  const alertDiv = createElement(alertText, "DIV");
  prependElement(alertContainer, alertDiv);
}

function loadSignedIn() {
  const loadingCog = document.getElementById("table-loading");
  loadingCog.style.display = "";
  displayChannelPlaylists();
}

/**
 * *Plan for Fuel Silo Reports page
 * 
 * Show a list of all ADC Playlists
 *  Maybe in a table
 * Selecting a playlist causes
 *  Playlists disapear/collapse
 *  Show the playlist title
 *  Show the views over time graph
 *  Perhaps save the graph to a sheet via graphData or actual image
 * 
 * *Technical Steps
 * 
 *  ✔ Request all ADC playlists
 *      Title, thumbnail, description, and playlistId
 *  ✔ Display playlists in a table/list
 *  ✔ Add playlist selector
 *  ✔ Create plotly graph
 *  Research saving images to Google Sheets
 *  Save image/graphData to Google Sheets
 *  Add error container & display error calls
 *  Add loading bar
 * 
 */