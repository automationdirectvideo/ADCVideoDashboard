/* Sends requests to API call functions */

/* Platform Dashboard Calls */

// Request age group and gender of channel views
function requestChannelDemographics(startDate, endDate) {
  const request = {
    "dimensions": "ageGroup,gender",
    "endDate": endDate,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "viewerPercentage",
    "sort": "gender,ageGroup",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log(`Channel Demographics`, response);
      return displayChannelDemographics(response);
    })
    .catch(err => {
      const errorMsg = "Error getting Channel Demographics: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
      // We do not use displayGraphError() for this graph because of the graph's
      // small size
    });
}

function requestChannelSearchTerms(startDate, endDate) {
  const request = {
    "dimensions": "insightTrafficSourceDetail",
    "endDate": endDate,
    "filters": "insightTrafficSourceType==YT_SEARCH",
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "maxResults": 5,
    "metrics": "views",
    "sort": "-views",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log(`Channel Search Terms`, response);
      return displayChannelSearchTerms(response);
    })
    .catch(err => {
      const errorMsg = "Error getting Channel Search Terms: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
      const graphIds = getDashboardGraphIds("platform");
      const graphId = graphIds.searchTerms;
      displayGraphError(graphId);
    });
}

function requestWatchTimeBySubscribedStatus(startDate, endDate) {
  const request = {
    "dimensions": "subscribedStatus",
    "endDate": endDate,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "estimatedMinutesWatched",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log(`Watch Time By Subscribed Status`, response);
      return displayWatchTimeBySubscribedStatus(response);
    })
    .catch(err => {
      const errorMsg = "Error getting Watch Time By Subscribed Status: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
      const graphIds = getDashboardGraphIds("platform");
      const graphId = graphIds.watchTime;
      displayGraphError(graphId);
    });
}

function requestViewsByDeviceType(startDate, endDate) {
  const request = {
    "dimensions": "deviceType",
    "endDate": endDate,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "views",
    "sort": "-views",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log("Views By Device Type", response);
      return displayViewsByDeviceType(response);
    })
    .catch(err => {
      const errorMsg = "Error getting Views By Device Type: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
      const graphIds = getDashboardGraphIds("platform");
      const graphId = graphIds.deviceType;
      displayGraphError(graphId);
    });
}

function requestViewsByState(startDate, endDate) {
  const request = {
    "dimensions": "province",
    "endDate": endDate,
    "filters": "country==US",
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "views",
    "sort": "province",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log("Views By State", response);
      return displayViewsByState(response);
    })
    .catch(err => {
      const errorMsg = "Error getting Views By State: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
      const graphIds = getDashboardGraphIds("platform");
      const graphId = graphIds.states;
      displayGraphError(graphId);
    });
}

function requestViewsByTrafficSource(startDate, endDate) {
  const request = {
    "dimensions": "insightTrafficSourceType",
    "endDate": endDate,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "views",
    "sort": "-views",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log("Views By Traffic Source", response);
      return displayViewsByTrafficSource(response);
    })
    .catch(err => {
      const errorMsg = "Error getting Views By Traffic Source: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
      const graphIds = getDashboardGraphIds("platform");
      const graphId = graphIds.trafficSource;
      displayGraphError(graphId);
    });
}


/* Real Time Stats Calls */

function requestRealTimeStats(startDate, endDate) {
  const request = {
    "endDate": endDate,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "views,subscribersGained,subscribersLost," +
      "estimatedMinutesWatched,averageViewDuration",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log("Real Time Stats", response);

      let realTimeStats = {};
      const headers = response.result.columnHeaders;
      const row = response.result.rows[0];
      for (let i = 0; i < row.length; i++) {
        realTimeStats[headers[i].name] = row[i];
      }
      realTimeStats["netSubscribersGained"] = realTimeStats.subscribersGained -
        realTimeStats.subscribersLost;
      delete realTimeStats.subscribersGained;
      delete realTimeStats.subscribersLost;
      return realTimeStats;
    })
    .catch(err => {
      const errorMsg = "Error getting Real Time Stats: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
      throw err;
    });
}

function requestRealTimeStatsCumulative() {
  return requestRealTimeStats(joinDate, getDateFromDaysAgo(4));
}

function requestRealTimeStatsMonth() {
  return requestRealTimeStats(getDateFromDaysAgo(34), getDateFromDaysAgo(4));
}

function requestRealTimeStatsToday() {
  const date = getDateFromDaysAgo(3);
  return requestRealTimeStats(date, date);
}

// Requests data for real time stats dashboard
function realTimeStatsCalls() {
  let requests = [];
  requests.push(requestRealTimeStatsToday());
  requests.push(requestRealTimeStatsMonth());
  requests.push(requestRealTimeStatsCumulative());
  return Promise.all(requests)
    .then(response => {
      const realTimeStats = {
        "today": response[0],
        "month": response[1],
        "cumulative": response[2]
      };
      lsSet("realTimeStats", realTimeStats);
      displayRealTimeStats(realTimeStats);
      return saveRealTimeStatsToSheets(realTimeStats);
    })
    .then(response => {
      return "Real Time Stats Completed";
    })
    .catch(err => {
      const errorMsg = "Error occurred in Real Time Stats Calls: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}


/* Top Ten Dashboard Calls */

function getTopTenVideosByMonthSince(startDate) {
  startDate = startDate || new Date("2010-07-1");
  let requests = [];
  let firstMonth = undefined;
  const endDate = new Date();
  while (endDate - startDate > 0) {
    const firstDay = getYouTubeDateFormat(startDate);
    const lastDay = getYouTubeDateFormat(new Date(startDate.getFullYear(),
      startDate.getMonth() + 1, 0));
    const month = firstDay.substr(0, 7);
    if (firstMonth == undefined) {
      firstMonth = month;
    }
    requests.push(requestMostWatchedVideos(firstDay, lastDay, 20, month));
    startDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
  }
  return Promise.all(requests)
    .then(response => {
      const values = [].concat.apply([], response);
      const body = {
        "values": values
      };
      const row = 3 + monthDiff(new Date(2010, 6), new Date(firstMonth));
      const sheet = "Top Ten Videos!A" + row;
      return updateSheetData("Stats", sheet, body);
    })
    .catch(err => {
      const errorMsg = "Error occurred getting Top Ten Videos By Month: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}


/* Top Video Calls */

function requestVideoBasicStats(startDate, endDate, videoId, dashboardIds,
  videoData) {
  const stringVideoId = "video==" + videoId;
  const request = {
    "dimensions": "video",
    "endDate": endDate,
    "filters": stringVideoId,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "views,comments,likes,dislikes,estimatedMinutesWatched," +
      "averageViewDuration,subscribersGained,subscribersLost",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log("Top Video Basic Stats", response);
      const updatedVideoData = displayVideoBasicStats(response, dashboardIds,
        videoData);
      const sheetsPromise = saveTopVideoStatsToSheets(updatedVideoData);
      return "Displayed Top Video Basic Stats";
    })
    .catch(err => {
      const errorMsg = `Error getting basic stats for video: ${videoId} - `;
      console.error(errorMsg, err);
      recordError(err, errorMsg);
      throw new Error("Error in requestVideoBasicStats");
    });
}

function requestVideoSearchTerms(startDate, endDate, videoId, dashboardId) {
  const filters = "video==" + videoId + ";insightTrafficSourceType==YT_SEARCH";
  const request = {
    "dimensions": "insightTrafficSourceDetail",
    "endDate": endDate,
    "filters": filters,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "maxResults": 10,
    "metrics": "views",
    "sort": "-views",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log("Top Video Search Terms", response);
      displayVideoSearchTerms(response, dashboardId);
      return Promise.resolve(`Displayed Search Terms: ${videoId}`);
    })
    .catch(err => {
      const errorMsg = `Error getting search terms for video: ${videoId} - `;
      console.error(errorMsg, err);
      recordError(err, errorMsg);
      const graphIds = getDashboardGraphIds(dashboardId);
      const graphId = graphIds.searchTerms;
      displayGraphError(graphId);
      throw new Error("Error in requestVideoSearchTerms");
    });
}

// Makes requests data for top video dashboard
function topVideoCalls(startDate, endDate, videoId, dashboardIds) {
  let requests = [];
  const videoData = displayTopVideoTitles(dashboardIds);

  requests.push(requestVideoBasicStats(startDate, endDate, videoId,
    dashboardIds, videoData));
  for (const videoId in dashboardIds) {
    if (dashboardIds.hasOwnProperty(videoId)) {
      const dashboardId = dashboardIds[videoId];
      requests.push(requestVideoSearchTerms(startDate, endDate, videoId,
        dashboardId));
      requests.push(requestVideoDailyViews(getDateFromDaysAgo(32), endDate,
        videoId, dashboardId));
    }
  }
  return Promise.all(requests)
    .then(response => {
      console.log("Top Video Calls Result", response);
      return Promise.resolve("Top Video Calls completed");
    })
    .catch(err => {
      const errorMsg = `Error making Top Video Calls for video: ${videoId} - `;
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}


/* Card Performance Calls */

function getCardPerformanceByMonthSince(startDate) {
  // Oct. 2017 was the first month the ADC YT channel used impressions
  startDate = startDate || new Date("2017-10-1");
  let requests = [];
  let firstMonth = undefined;
  const endDate = new Date();
  while (endDate - startDate > 0) {
    const firstDay = getYouTubeDateFormat(startDate);
    const lastDay = getYouTubeDateFormat(new Date(startDate.getFullYear(),
      startDate.getMonth() + 1, 0));
    const month = firstDay.substr(0, 7);
    if (firstMonth == undefined) {
      firstMonth = month;
    }
    requests.push(requestCardPerformance(firstDay, lastDay, month));
    startDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
  }
  return Promise.all(requests)
    .then(response => {
      const cardData = [].concat.apply([], response);
      const body = {
        "values": cardData
      };
      const row = 3 + monthDiff(new Date(2017, 9), new Date(firstMonth));
      const sheet = "Card Performance!A" + row;
      return updateSheetData("Stats", sheet, body);
    })
    .catch(err => {
      const errorMsg = "Error occurred getting Card Performance By Month: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

function getCardPerformanceForCurrMonth() {
  const [startDate, endDate, month] = getCurrMonth();
  const request = requestCardPerformance(startDate, endDate, month);
  return request.then(cardData => {
    const body = {
      "values": [cardData]
    };
    const row = 3 + monthDiff(new Date(2017, 9), new Date(month));
    const sheet = "Card Performance!A" + row;
    return updateSheetData("Stats", sheet, body);
  });
}

function requestCardPerformance(startDate, endDate, month) {
  const request = {
    "endDate": endDate,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "cardImpressions,cardClickRate," +
      "cardTeaserImpressions,cardTeaserClickRate",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log(`Card Performance for month: ${month}`, response);
      let cardData = [month, 0, 0, 0, 0];
      try {
        const responseRow = response.result.rows[0];
        const cardImpressions = parseInt(responseRow[0]);
        const cardCTR = parseFloat(responseRow[1]).toFixed(4);
        const cardTeaserImpressions = parseInt(responseRow[2]);
        const cardTeaserCTR = parseFloat(responseRow[3]).toFixed(4);
        cardData[1] = cardImpressions;
        cardData[2] = cardCTR;
        cardData[3] = cardTeaserImpressions;
        cardData[4] = cardTeaserCTR;
      } catch (err) {
        const errorMsg = `No card data exists for month: "${month}" - `;
        console.log(errorMsg);
        recordError(err, errorMsg);
      }
      return cardData;
    })
    .catch(err => {
      const errorMsg = `Error getting card performance for month: ${month} - `;
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}