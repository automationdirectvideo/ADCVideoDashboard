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
    createGraph(graphId, data, layout, config, graphHeight, graphWidth, false);
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