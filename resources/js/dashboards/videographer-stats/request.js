function requestVideoEngagement(videos, startDate, endDate) {
  let requests = [];
  for (let i = 0; i < videos.length; i += 50) {
    const fiftyVideos = videos.slice(i, i + 50);
    const fiftyVideosStr = fiftyVideos.join(",");
    const filters = "video==" + fiftyVideosStr;
    const gapiRequest = {
      "endDate": endDate,
      "filters": filters,
      "ids": "channel==UCR5c2ZGLZY2FFbxZuSxzzJg",
      "metrics": "estimatedMinutesWatched,averageViewPercentage",
      "startDate": startDate
    };
    const request = gapi.client.youtubeAnalytics.reports.query(gapiRequest)
      .then(response => {
        return {
          "minWatched": response.result.rows[0][0],
          "avgViewPercentage": response.result.rows[0][1]
        };
      })
      .catch(err => {
        const errorMsg = `Error in fetching video engagement for video group` +
          ` ${i} - ${i + 49}: `;
        console.error(errorMsg, err);
        recordError(err, errorMsg);
        return errorMsg;
      });
    requests.push(request);
  }

  return Promise.all(requests)
    .then(response => {
      const totalMinWatched = response.reduce((sum, value) => {
        return sum + value.minWatched;
      }, 0);
      const overallAvgViewPercentage = average(response.map((value) => {
        return value.avgViewPercentage;
      }));
      return {
        "minWatched": totalMinWatched, 
        "avgViewPercentage": overallAvgViewPercentage
      };
    });
}

function requestVideographerAvgViews(videographers, startDate, endDate) {
  let requests = [];
  let names = [];
  for (const name in videographers) {
    if (videographers.hasOwnProperty(name)) {
      const categories = videographers[name];
      for (const category in categories) {
        if (categories.hasOwnProperty(category)) {
          const stats = categories[category];
          const videos = stats.videos;
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
    .then(responses => {
      let updatedVideographers = lsGet("videographers");
      for (let index = 0; index < responses.length; index++) {
        const views = responses[index];
        const name = names[index].name;
        const category = names[index].category;
        const numVideos = updatedVideographers[name][category].numVideos;
        updatedVideographers[name][category].lastXDaysAvgViews =
          views / numVideos;
      }
      lsSet("videographers", updatedVideographers);
      return updatedVideographers;
    })
    .catch(err => {
      const errorMsg = `Unable to get videographer average views - `;
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

function requestVideographerEngagementStats(videographers, startDate, endDate) {
  let lastXDays = true;
  if (startDate == undefined || startDate == "2010-07-01") {
    startDate = "2010-07-01";
    endDate = getTodaysDate();
    lastXDays = false;
  }
  let requests = [];
  let names = [];
  for (const name in videographers) {
    if (videographers.hasOwnProperty(name)) {
      const categories = videographers[name];
      for (const category in categories) {
        if (categories.hasOwnProperty(category)) {
          const stats = categories[category];
          const videos = stats.videos;
          names.push({
            "category": category,
            "name": name
          });
          requests.push(requestVideoEngagement(videos, startDate, endDate));
        }
      }
    }
  }
  return Promise.all(requests)
    .then(responses => {
      let updatedVideographers = lsGet("videographers");
      for (let index = 0; index < responses.length; index++) {
        // Aggregate the data
        const data = responses[index];
        const name = names[index].name;
        const category = names[index].category;
        let categoryStats = updatedVideographers[name][category];
        const minWatched = data.minWatched;
        const avgViewPercentage = data.avgViewPercentage;
        if (lastXDays) {
          categoryStats.minWatchedLastXDays = minWatched;
          categoryStats.avgViewPercentageLastXDays = avgViewPercentage;
        } else {
          categoryStats.minWatched = minWatched;
          categoryStats.avgViewPercentage = avgViewPercentage;
        }
      }
      lsSet("videographers", updatedVideographers);
      return updatedVideographers;
    });
}


/* Multiple Requests Functions */

function getVideographerViewsByMonthSince(videographers, startDate) {
  startDate = startDate || new Date("2010-07-1");
  console.log(startDate);
  let requests = [];
  isUpdating = true;
  let timeout = 3000;
  let waitTime = timeout;
  const endDate = new Date();
  while (endDate - startDate > 0) {
    const firstDay = getYouTubeDateFormat(startDate);
    waitTime += timeout;
    // Space out requests to prevent reaching the YouTube Analytics API quota
    // for number of requests in 100 seconds
    setTimeout(() => {
      requests.push(requestVideographerViewsForMonth(videographers, firstDay));
    }, waitTime);
    startDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
  }
  return Promise.all(requests)
    .then(response => {
      isUpdating = false;
      let updatedVideographers = lsGet("videographers");
      return updatedVideographers;
    })
    .catch(err => {
      isUpdating = false;
      const errorMsg = "Error occurred getting Card Performance By Month: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}