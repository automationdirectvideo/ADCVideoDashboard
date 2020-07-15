/* Get All Video Stats Calls */

function getAllVideoStats(videos) {
  const statsByVideoId = lsGet("statsByVideoId");
  let requests = [];
  for (let i = 0; i < videos.length; i += 50) {
    const fiftyVideos = videos.slice(i, i + 50);
    const fiftyVideosStr = fiftyVideos.join(",");
    const gapiRequest = {
      "part": "snippet,statistics,contentDetails",
      "id": fiftyVideosStr
    };
    const request = gapi.client.youtube.videos.list(gapiRequest)
      .then(response => {
        console.log(`Video Request`, response);
        let stats = [];
        const videoItems = response.result.items;
        for (let index = 0; index < videoItems.length; index++) {
          const video = videoItems[index];
          const videoId = video.id;
          const videoStats = video.statistics;
          const durationStr = video.contentDetails.duration;
          const duration = parseInt(isoDurationToSeconds(durationStr));
          const viewCount = parseInt(videoStats.viewCount);
          const likeCount = parseInt(videoStats.likeCount);
          const dislikeCount = parseInt(videoStats.dislikeCount);
          const commentCount = parseInt(videoStats.commentCount);
          let likesPerView = 0;
          let dislikesPerView = 0;
          if (viewCount != 0) {
            likesPerView = likeCount / viewCount;
            dislikesPerView = dislikeCount / viewCount;
          }
          const publishDate = video.snippet.publishedAt.substr(0, 10);
          const daysSincePublished = getNumberDaysSince(publishDate);
          let avgViewsPerDay = viewCount;
          if (daysSincePublished != 0) {
            avgViewsPerDay = viewCount / daysSincePublished;
          }
          const organic = statsByVideoId[videoId].organic;
          stats.push({
            "videoId": videoId,
            "views": viewCount,
            "likes": likeCount,
            "dislikes": dislikeCount,
            "likesPerView": likesPerView,
            "dislikesPerView": dislikesPerView,
            "comments": commentCount,
            "duration": duration,
            "daysSincePublished": daysSincePublished,
            "avgViewsPerDay": avgViewsPerDay,
            "publishDate": publishDate,
            "organic": organic
          });
        }
        // Return for post-processing of the data elsewhere
        return stats;
      })
      .catch(err => {
        const errorMsg = `Error in fetching stats for video group` +
          ` ${i} - ${i + 49}: `;
        console.log(errorMsg, err);
        recordError(err, errorMsg);
        return errorMsg;
      });
    requests.push(request);
  }

  return Promise.all(requests)
    .then(response => {
      console.log(response);
      let allVideoStats = [].concat.apply([], response);
      let videoRequest = getAnalyticsVideoStats(allVideoStats, videos);
      console.log("getAllVideoStats()");
      let weightsRequest = getVideoStrengthWeights();
      return Promise.all([videoRequest, weightsRequest]);
    })
    .then(response => {
      allVideoStats = response[0];
      const strengthCalc = response[1];
      allVideoStats = calcVideoStrength(allVideoStats, strengthCalc);
      lsSet("allVideoStats", allVideoStats);
      let categoryTotals = updateCategoryTotals(allVideoStats);
      let categoryStats = calcCategoryStats(categoryTotals, allVideoStats);

      const catRequest = saveCategoryStatsToSheets(categoryStats);
      const videoRequest = saveVideoStatsToSheets(allVideoStats);
      const topTenRequest = getTopTenVideosForCurrMonth();
      return Promise.all([catRequest, videoRequest, topTenRequest]);
    });

  function getAnalyticsVideoStats(allVideoStats, videos) {
    let endDate = getTodaysDate();
    let requests = [];
    for (let i = 0; i < videos.length; i += 50) {
      const fiftyVideos = videos.slice(i, i + 50);
      const fiftyVideosStr = fiftyVideos.join(",");
      const filters = "video==" + fiftyVideosStr;
      const gapiRequest = {
        "dimensions": "video",
        "endDate": endDate,
        "filters": filters,
        "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
        "metrics": "averageViewDuration,subscribersGained,subscribersLost",
        "startDate": joinDate
      };
      const request = gapi.client.youtubeAnalytics.reports.query(gapiRequest)
        .then(response => {
          console.log(`Video Request`, response);
          let stats = {};
          const videoItems = response.result.rows;
          for (let index = 0; index < videoItems.length; index++) {
            const video = videoItems[index];
            const videoId = video[0];
            const avgViewDuration = parseInt(video[1]);
            const subsGained = parseInt(video[2]);
            const subsLost = parseInt(video[3]);
            const subsChanged = subsGained - subsLost;
            stats[videoId] = {
              "avgViewDuration": avgViewDuration,
              "subsGained": subsChanged
            };
          }
          // Return for post-processing of the data elsewhere
          return stats;
        })
        .catch(err => {
          const errorMsg = `Error in fetching analytics stats for video group` +
            ` ${i} - ${i + 49}: `;
          console.log(errorMsg, err);
          recordError(err, errorMsg);
          return errorMsg;
        });
      requests.push(request);
    }

    return Promise.all(requests)
      .then(response => {
        console.log(response);
        let allStats = {};
        response.forEach(stats => {
          allStats = Object.assign(allStats, stats);
        });
        for (let index = 0; index < allVideoStats.length; index++) {
          const video = allVideoStats[index];
          const videoId = video.videoId;
          const duration = allVideoStats[index]["duration"];
          let avgViewDuration = 0;
          let subsGained = 0;
          if (allStats[videoId]) {
            avgViewDuration = allStats[videoId].avgViewDuration;
            subsGained = allStats[videoId].subsGained;  
          }
          let avgViewPercentage = avgViewDuration / duration;
          if (avgViewPercentage > 1) {
            avgViewPercentage = 1.0;
          }
          allVideoStats[index].avgViewDuration = avgViewDuration;
          allVideoStats[index].avgViewPercentage = avgViewPercentage;
          allVideoStats[index].subscribersGained = subsGained;
        };
        return allVideoStats;
      });
  }
}

function requestVideoViewsByYear(uploads, year) {
  let requests = [];
  const startDate = year + "-01-01";
  const endDate = year + "-12-31";

  for (let i = 0; i < uploads.length; i += 50) {
    const fiftyVideos = uploads.slice(i, i + 50);
    const fiftyVideosStr = fiftyVideos.join(",");
    const filters = "video==" + fiftyVideosStr;
    const gapiRequest = {
      "dimensions": "video",
      "endDate": endDate,
      "filters": filters,
      "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
      "metrics": "views",
      "startDate": startDate
    };
    const request = gapi.client.youtubeAnalytics.reports.query(gapiRequest)
      .then(response => {
        return response.result.rows;
      })
      .catch(err => {
        const errorMsg = `Error in fetching stats for video group` +
          ` ${i} - ${i + 49}: `;
        console.error(errorMsg, err);
        recordError(err, errorMsg);
        return errorMsg;
      });
    requests.push(request);
  }

  const viewsRequest = Promise.all(requests)
    .then(response => {
      const allVideoViews = [].concat.apply([], response);
      console.log(`${year} Views by Video:`, allVideoViews);
      const statsByVideoId = lsGet("statsByVideoId");
      const categoryStats = lsGet("categoryStats");
      let categoryYearlyTotals = {};
      for (let i = 0; i < categoryStats.length; i++) {
        const categoryId = categoryStats[i]["categoryId"];
        const shortName = categoryStats[i]["shortName"];
        categoryYearlyTotals[categoryId] = {
          "numVideos": 0,
          "shortName": shortName,
          "views": 0
        }
      }

      allVideoViews.forEach(video => {
        const videoId = video[0];
        const viewCount = video[1];
        const categories = statsByVideoId[videoId]["categories"];
        for (let i = 0; i < categories.length; i++) {
          const categoryId = categories[i];
          const categoryViews = parseInt(categoryYearlyTotals[categoryId]["views"]);
          const categoryNumVideos =
            parseInt(categoryYearlyTotals[categoryId]["numVideos"]);
          categoryYearlyTotals[categoryId]["views"] = categoryViews + viewCount;
          categoryYearlyTotals[categoryId]["numVideos"] = categoryNumVideos + 1;
        }

      });
      return saveCategoryYearlyStatsToSheets(categoryYearlyTotals, year);
    })
    .catch(err => {
      const errorMsg = "Unable to get video views by year: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
  return viewsRequest;
}

function requestVideoViews(videos, startDate, endDate) {
  let requests = [];
  for (let i = 0; i < videos.length; i += 50) {
    const fiftyVideos = videos.slice(i, i + 50);
    const fiftyVideosStr = fiftyVideos.join(",");
    const filters = "video==" + fiftyVideosStr;
    const gapiRequest = {
      "endDate": endDate,
      "filters": filters,
      "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
      "metrics": "views",
      "startDate": startDate
    };
    const request = gapi.client.youtubeAnalytics.reports.query(gapiRequest)
      .then(response => {
        const views = response.result.rows[0][0];
        return views;
      })
      .catch(err => {
        const errorMsg = `Error in fetching monthly views for video group` +
          ` ${i} - ${i + 49}: `;
        console.error(errorMsg, err);
        recordError(err, errorMsg);
        return errorMsg;
      });
    requests.push(request);
  }

  return Promise.all(requests)
    .then(response => {
      const totalViews = response.reduce((sum, value) => {
        return sum + value;
      }, 0);
      return totalViews;
    });
}


/* Top Ten Videos Calls */

// Saves top ten videos by views this month to Google Sheets
function getTopTenVideosForCurrMonth() {
  const [startDate, endDate, month] = getCurrMonth();
  const request = requestMostWatchedVideos(startDate, endDate, 20, month);
  return request.then(response => {
    const body = {
      "values": response
    };
    const row = 3 + monthDiff(new Date(2010, 6), new Date(month));
    const sheet = "Top Ten Videos!A" + row;
    return updateSheetData("Stats", sheet, body)
      .then(response => {
        return "Updated Top Ten Video Sheet";
      });
  });
}

// Requests the numVideos most watched videos from startDate to endDate
function requestMostWatchedVideos(startDate, endDate, numVideos, month) {
  const request = {
    "dimensions": "video",
    "endDate": endDate,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "maxResults": numVideos,
    "metrics": "views,estimatedMinutesWatched",
    "sort": "-views",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log("Most Watched Videos", response);
      const videos = response.result.rows;
      const statsByVideoId = lsGet("statsByVideoId");
      if (month == undefined) {
        throw new Error("Month is undefined");
      }
      var values = [
        [month]
      ];
      var index = 0;
      var numVideos = 1;
      while (numVideos <= 10) {
        const videoId = videos[index][0];
        const organic = statsByVideoId[videoId].organic;
        if (organic) {
          values[0][numVideos] = videos[index][0];
          values[0][numVideos + 10] = videos[index][1];
          values[0][numVideos + 20] = videos[index][2];
          numVideos++;
        }
        index++;
      }
      return values;
    })
    .catch(err => {
      const errorMsg = "Error getting Most Watched Videos: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}


/* Top Video Calls */

function requestVideoDailyViews(startDate, endDate, videoId, dashboardId) {
  const filters = "video==" + videoId;
  const request = {
    "dimensions": "day",
    "endDate": endDate,
    "filters": filters,
    "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
    "metrics": "views",
    "sort": "day",
    "startDate": startDate
  };
  return gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log("Top Video Daily Views", response);
      displayVideoDailyViews(response, dashboardId);
      return Promise.resolve(`Displayed Daily Views: ${videoId}`);
    })
    .catch(err => {
      const errorMsg = `Error getting daily views for video: ${videoId} - `;
      console.error(errorMsg, err);
      recordError(err, errorMsg);
      const graphIds = getDashboardGraphIds(dashboardId);
      const graphId = graphIds.dailyViews;
      displayGraphError(graphId);
      throw new Error("Error in requestVideoDailyViews");
    });
}


/* Videographer Stats Calls */

async function getVideographerViewsForAllMonths() {
  isUpdating = true;
  let startDate = "2010-07-01";
  const now = new Date();
  let months = [];
  while (now - new Date(startDate) >= 4 * 86400000) {
    months.push(startDate);
    let prevDate = new Date(startDate);
    startDate = getYouTubeDateFormat(new Date(prevDate.getUTCFullYear(),
      prevDate.getUTCMonth() + 1, prevDate.getUTCDate()));
  }
  try {
    let videographers = lsGet("videographers");
    let index = 0;
    for (const month of months) {
      console.log(month);
      // Each request consists of many calls to the YouTube Analytics API
      // Making the request for each month all at once would exceed the quota
      // There is an artificial delay between each call to prevent this
      videographers =
        await requestVideographerViewsForMonth(videographers, month);
      // Wait a few seconds before starting the next request
      index++;
      if (index % 10 == 0) {
        saveVideographerViewsToSheets(videographers);
      }
      await delay(8000);
    }
    saveVideographerViewsToSheets(videographers);
  } catch (err) {
    const errorMsg =
      "Unable to get videographer monthly views for all months: ";
    recordError(err, errorMsg);
  } finally {
    isUpdating = false;
  }
}

function getVideographerViewsForCurrMonth() {
  const [startDate, endDate, month] = getCurrMonth();
  const videographers = lsGet("videographers");
  return requestVideographerViewsForMonth(videographers, startDate)
    .then(updatedVideographers => {
      console.log(updatedVideographers);
      return saveVideographerViewsToSheets(updatedVideographers);
    });
}

function requestVideographerViewsForMonth(videographers, startDate) {
  const firstDay = new Date(startDate);
  const endDate = getYouTubeDateFormat(new Date(firstDay.getFullYear(),
    firstDay.getMonth() + 2, 0));
  const month = startDate.substr(0, 7);
  let requests = [];
  let names = [];
  for (const name in videographers) {
    if (videographers.hasOwnProperty(name)) {
      const categories = videographers[name];
      for (const category in categories) {
        if (categories.hasOwnProperty(category)) {
          const data = categories[category];
          const videos = data.videos;
          names.push({
            "category": category,
            "name": name
          });
          requests.push(requestVideoViews(videos, startDate, endDate));
        }
      }
    }
  }
  return Promise.all(requests)
    .then(viewsList => {
      let updatedVideographers = lsGet("videographers");
      for (let index = 0; index < names.length; index++) {
        const name = names[index].name;
        const category = names[index].category;
        const views = viewsList[index];
        if (!updatedVideographers[name][category]["monthlyViews"]) {
          updatedVideographers[name][category]["monthlyViews"] = {};
        }
        updatedVideographers[name][category]["monthlyViews"][month] = views;
      }
      lsSet("videographers", updatedVideographers);
      return updatedVideographers;
    })
    .catch(err => {
      const errorMsg = `Unable to get videographer views for month: ` +
        `${month} - `;
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}


/* Multiple Requests Functions */

function getYearlyCategoryViews(year) {
  const statsByVideoId = lsGet("statsByVideoId");
  let uploadsByYear = [];
  for (const videoId in statsByVideoId) {
    if (statsByVideoId.hasOwnProperty(videoId)) {
      const publishDate = statsByVideoId[videoId]["publishDate"];
      const publishYear = publishDate.substr(0, 4);
      if (year >= publishYear) {
        uploadsByYear.push(videoId);
      }
    }
  }
  return requestVideoViewsByYear(uploadsByYear, year);
}