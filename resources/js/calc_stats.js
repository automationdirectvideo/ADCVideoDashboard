/**
 * Updates video stats, category stats, and top ten video sheets by getting the
 * most recent data from the input sheet and YouTube APIs
 *
 * @returns {Promise} Status message
 */
function updateVideoAndCategoryStats() {
  // Get data from input spreadsheet
  const categoryPromise = getCategoryList();
  const videoPromise = getVideoList();
  return Promise.all([categoryPromise, videoPromise])
    .then(response => {
      const categoryTotals = response[0];
      const statsByVideoId = response[1][0];
      const uploads = response[1][1];
      return getAllVideoStats(uploads);
    })
    .then(response => {
      return getTopTenVideosForCurrMonth();
    });
}

/**
 * Gets category information from input spreadsheet
 *
 * @returns {Object} `categoryTotals`
 */
function getCategoryList() {
  return requestSpreadsheetData("Input Data", "Category List")
    .then(categoryList => {
      let categoryTotals = {};
      const columns = getColumnHeaders(categoryList);
      for (let i = 1; i < categoryList.length; i++) {
        const category = categoryList[i];
        let categoryId = category[columns["Category ID"]];
        const level1 = category[columns["L1 Category"]];
        const level2 = category[columns["L2 Category"]];
        const level3 = category[columns["L3 Category"]];
        let name = "";
        const shortName = category[columns["Short Name"]];
        let root = false;
        const leaf = true;

        // Set up root and leaf
        if (!/\d/.test(categoryId)) {
          root = true;
          name = level1;
        } else {
          const parentCategoryLvl1 = categoryId.match(/[A-Z]+/)[0];
          categoryTotals[parentCategoryLvl1].leaf = false;
          name = categoryTotals[parentCategoryLvl1].name + "->" + level2;
          if (categoryId.replace(/[A-Z]+[0-9]+/, "") != "") {
            const parentCategoryLvl2 = categoryId.match(/[A-Z]+[0-9]+/)[0];
            categoryTotals[parentCategoryLvl2].leaf = false;
            name = categoryTotals[parentCategoryLvl2].name + "->" + level3;
          }
        }

        // Initializes categoryTotals to help calculate categoryStats later
        categoryTotals[categoryId] = {
          "shortName": shortName,
          "name": name,
          "root": root,
          "leaf": leaf,
          "views": 0,
          "likes": 0,
          "duration": 0,
          "videos": [],
          "videosWithStrength": [],
          "strength": 0
        };
      }
      lsSet("categoryTotals", categoryTotals);
      return categoryTotals;
    });
}

/**
 * Gets video information from input spreadsheet & creates statsByVideoId and
 * a list of uploads for the channel
 *
 * @returns {Array} `statsByVideoId` and a list of `uploads` for the channel
 */
function getVideoList() {
  return requestSpreadsheetData("Input Data", "Video List")
    .then(videoList => {
      let statsByVideoId = {};
      let uploads = [];
      let columns = {};
      const columnHeaders = videoList[0];
      for (let i = 0; i < columnHeaders.length; i++) {
        columns[columnHeaders[i]] = i;
      }
      for (let i = 1; i < videoList.length; i++) {
        const video = videoList[i];
        const organic = ("TRUE" === video[columns["Organic"]]);
        const videoId = video[columns["Video ID"]];
        const title = video[columns["Title"]];
        const publishDate = video[columns["Publish Date"]];
        const duration = video[columns["Duration"]];
        let categoryString = video[columns["Categories"]];
        const createdBy = video[columns["Created By"]] || "Unknown";
        const privacy = video[columns["Privacy"]].toLowerCase();
        // Removes whitespace
        categoryString = categoryString.replace(/\s/g, '');
        const initialCategories = categoryString.split(",");
        // Parse through initialCategories to create a list of categories
        // that the video is in
        let allCategories = [];
        for (let j = 0; j < initialCategories.length; j++) {
          let categoryId = initialCategories[j];
          if (allCategories.indexOf(categoryId) == -1) {
            allCategories.push(categoryId);
          }
          if (/\d/.test(categoryId)) {
            const parentCategoryLvl1 = categoryId.match(/[A-Z]+/)[0];
            if (allCategories.indexOf(parentCategoryLvl1) == -1) {
              allCategories.push(parentCategoryLvl1);
            }
            if (categoryId.replace(/[A-Z]+[0-9]+/, "") != "") {
              const parentCategoryLvl2 = categoryId.match(/[A-Z]+[0-9]+/)[0];
              if (allCategories.indexOf(parentCategoryLvl2) == -1) {
                allCategories.push(parentCategoryLvl2);
              }
            }
          }
        }
        statsByVideoId[videoId] = {
          "categories": allCategories,
          "createdBy": createdBy,
          "duration": duration,
          "organic": organic,
          "privacy": privacy,
          "publishDate": publishDate,
          "title": title
        };

        // Array of video IDs for the channel
        uploads.push(videoId);
        // // Only include the video in the dashboards if it is organic
        // if (organic) {
        // }
      }
      lsSet("statsByVideoId", statsByVideoId);
      lsSet("uploads", uploads);
      return [statsByVideoId, uploads];
    });
}

/**
 * Gets and returns the category statistics from the stats spreadsheet
 *
 * @returns {Promise} A promise that resolves to `categoryStats`
 */
function getCategoryStats() {
  return requestSpreadsheetData("Stats", "Category Stats")
    .then(categoriesSheet => {
      const columns = getColumnHeaders(categoriesSheet);
      let categoryStats = [];
      for (let i = 1; i < categoriesSheet.length; i++) {
        const category = categoriesSheet[i];
        const categoryId = category[columns["Category ID"]]
        const name = category[columns["Name"]];
        const shortName = category[columns["Short Name"]];
        const views = parseInt(category[columns["Views"]]);
        const likes = parseInt(category[columns["Likes"]]);
        const duration = parseInt(category[columns["Duration (sec)"]]);
        const avgViews = parseFloat(category[columns["Average Video Views"]]);
        const avgLikes = parseFloat(category[columns["Average Video Likes"]]);
        const avgDuration =
          parseFloat(category[columns["Average Video Duration"]]);
        const strength = parseFloat(category[columns["Strength"]]);
        const videosString = category[columns["Videos"]];
        const videos = videosString.split(",");
        const videosWithStrengthString =
          category[columns["Videos With Strength"]];
        const videosWithStrength = videosWithStrengthString.split(",");
        const root = ("TRUE" === category[columns["Root"]]);
        const leaf = ("TRUE" === category[columns["Leaf"]]);
        categoryStats.push({
          "categoryId": categoryId,
          "name": name,
          "shortName": shortName,
          "views": views,
          "likes": likes,
          "duration": duration,
          "avgViews": avgViews,
          "avgLikes": avgLikes,
          "avgDuration": avgDuration,
          "avgStrength": strength,
          "videos": videos,
          "videosWithStrength": videosWithStrength,
          "root": root,
          "leaf": leaf,
        });
      }
      lsSet("categoryStats", categoryStats);
      return categoryStats;
    });
}

/**
 * Gets and returns all video statistics from the stats spreadsheet.
 * Saves `allVideoStats`, `statsByVideoId`, and `uploads` to local storage
 *
 * @returns {Promise} A promise that resolves when all stats have been saved to
 *    local storage
 */
function getVideoStats() {
  return requestSpreadsheetData("Stats", "Video Stats")
    .then(videoSheet => {
      const columns = getColumnHeaders(videoSheet);
      let uploads = [];
      let allVideoStats = [];
      let statsByVideoId = {};
      for (let i = 1; i < videoSheet.length; i++) {
        const video = videoSheet[i];
        const videoId = video[columns["Video ID"]];
        const title = video[columns["Title"]];
        const viewCount = parseInt(video[columns["Views"]]);
        const likeCount = parseInt(video[columns["Likes"]]);
        const dislikeCount = parseInt(video[columns["Dislikes"]]);
        const duration = parseInt(video[columns["Duration (sec)"]]);
        const commentCount = parseInt(video[columns["Comments"]]);
        const publishDate = video[columns["YouTube Publish Date"]].substr(0, 10);
        // Removes whitespace
        const categories = video[columns["Categories"]].replace(/\s/g, '');
        const createdBy = video[columns["Created By"]];
        const organic = ("TRUE" === video[columns["Organic"]]);
        const strength = parseFloat(video[columns["Strength"]]);
        const avgViewDuration = parseInt(video[columns["Average View Duration"]]);
        const avgViewPercentage =
          parseFloat(video[columns["Average View Percentage"]]);
        const avgViewsPerDay =
          parseFloat(video[columns["Average Views Per Day"]]);
        const daysSincePublished =
          parseInt(video[columns["Days Since Published"]]);
        const subscribersGained = parseInt(video[columns["Subscribers Gained"]]);
        const likesPerView = parseFloat(video[columns["Likes Per View"]]);
        const dislikesPerView = parseFloat(video[columns["Dislikes Per View"]]);
        const row = {
          "videoId": videoId,
          "views": viewCount,
          "likes": likeCount,
          "dislikes": dislikeCount,
          "comments": commentCount,
          "duration": duration,
          "strength": strength,
          "avgViewDuration": avgViewDuration,
          "avgViewPercentage": avgViewPercentage,
          "avgViewsPerDay": avgViewsPerDay,
          "daysSincePublished": daysSincePublished,
          "subscribersGained": subscribersGained,
          "likesPerView": likesPerView,
          "dislikesPerView": dislikesPerView,
          "organic": organic
        };
        allVideoStats.push(row);
        if (!statsByVideoId[videoId]) {
          statsByVideoId[videoId] = {};
        }
        statsByVideoId[videoId]["title"] = title;
        statsByVideoId[videoId]["publishDate"] = publishDate;
        statsByVideoId[videoId]["duration"] = duration;
        statsByVideoId[videoId]["categories"] = categories;
        statsByVideoId[videoId]["createdBy"] = createdBy;
        statsByVideoId[videoId]["organic"] = organic;
        // Array of video IDs for the channel
        uploads.push(videoId);
      }
      lsSet("allVideoStats", allVideoStats);
      lsSet("statsByVideoId", statsByVideoId);
      lsSet("uploads", uploads);
    });
}

/**
 * Gets category, video, and real time statistics from the stats spreadsheet and
 * weights from the video strength formula from the input data spreadsheet
 *
 * @returns {Promise} A promise that resolves when all stats have been saved to
 *    local storage
 */
function getBasicDashboardStats() {
  let requests = [];
  requests.push(getCategoryStats());
  requests.push(getVideoStats());
  requests.push(getVideoStrengthWeights());
  return Promise.all(requests);
}

/**
 * Gets the weights for the video strength formula from the input data Google
 * Sheet
 *
 * @returns {Promise} The promise resolves to an object whose keys are metric
 *    property names that correspond to their weight
 */
function getVideoStrengthWeights() {
  return requestSpreadsheetData("Input Data", "Video Strength Calculation")
    .then(sheetValues => {
      let weights = {};
      let calc = {};
      let column = getColumnHeaders(sheetValues);
      let index = 1;
      let metric = sheetValues[index];
      while (index < sheetValues.length && metric.length != 0) {
        let name = metric[column["Short Name"]];
        let weight = parseFloat(metric[column["Weight"]]);
        weights[name] = weight;

        index++;
        metric = sheetValues[index];
      }
      index++;
      while (index < sheetValues.length) {
        metric = sheetValues[index];
        let name = metric[column["Short Name"]];
        let value = parseFloat(metric[column["Weight"]]);
        calc[name] = value;
        index++;
      }
      calc.weights = weights;
      lsSet("strengthCalc", calc);
      return Promise.resolve(calc);
    });
}

// Updates total views, likes, etc. for each category given all video stats
function updateCategoryTotals(allVideoStats) {
  let statsByVideoId = lsGet("statsByVideoId");
  let categoryTotals = lsGet("categoryTotals");

  allVideoStats.forEach(videoInfo => {
    let videoId = videoInfo.videoId;
    let duration = videoInfo.duration;
    let viewCount = videoInfo.views;
    let likeCount = videoInfo.likes;
    let strength = videoInfo.strength;

    statsByVideoId[videoId]["duration"] = duration;
    let categories = statsByVideoId[videoId]["categories"];
    for (let i = 0; i < categories.length; i++) {
      let categoryId = categories[i];
      if (categoryTotals[categoryId] == undefined) {
        categoryTotals[categoryId] = {};
        categoryTotals[categoryId]["strength"] = 0;
        categoryTotals[categoryId]["videos"] = [];
        categoryTotals[categoryId]["videosWithStrength"] = [];
      }
      let category = categoryTotals[categoryId];
      let categoryViews = parseInt(category["views"]);
      let categoryLikes = parseInt(category["likes"]);
      let categoryDuration = parseInt(category["duration"]);
      let categoryStrength = parseFloat(category["strength"]);
      category["videos"].push(videoId);
      category["views"] = categoryViews + viewCount;
      category["likes"] = categoryLikes + likeCount;
      category["duration"] = categoryDuration + duration;
      if (strength != undefined) {
        category["strength"] = categoryStrength + strength;
        category["videosWithStrength"].push(videoId);
      }
    }
  });
  lsSet("categoryTotals", categoryTotals);
  lsSet("statsByVideoId", statsByVideoId);

  return categoryTotals;
}

// Calculate stats for each category given totals for each category
function calcCategoryStats(categoryTotals) {
  let categoryStats = [];
  for (let categoryId in categoryTotals) {
    if (categoryTotals.hasOwnProperty(categoryId)) {
      let totals = categoryTotals[categoryId];
      let shortName = totals["shortName"];
      let name = totals["name"];
      let root = totals["root"];
      let leaf = totals["leaf"];
      let views = parseInt(totals["views"]);
      let likes = parseInt(totals["likes"]);
      let duration = parseInt(totals["duration"]);
      let totalStrength = parseFloat(totals["strength"]);
      let videosWithStrength = totals["videosWithStrength"];
      let numVideosWithStrength = videosWithStrength.length;
      let videos = totals["videos"];
      let numVideos = videos.length;
      let avgViews = views / numVideos;
      let avgLikes = likes / numVideos;
      let avgDuration = duration / numVideos;
      let avgStrength = totalStrength / numVideosWithStrength;

      // Calculate the average z-score for the videos with strength
      let zTotal = {};
      let zAvg = {};
      videosWithStrength.forEach(videoId => {
        const avsIndex = allVideoStats.findIndex((element) => {
          return videoId == element.videoId;
        });
        const videoStats = allVideoStats[avsIndex];
        const zStats = videoStats.z;
        for (const metric in zStats) {
          if (zStats.hasOwnProperty(metric)) {
            if (zTotal[metric] == undefined) {
              zTotal[metric] = 0;
            }
            zTotal[metric] += zStats[metric];
          }
        }
      });
      for (const metric in zTotal) {
        if (zTotal.hasOwnProperty(metric)) {
          const total = zTotal[metric];
          zAvg[metric] = total / videosWithStrength.length;
        }
      }

      categoryStats.push({
        "avgDuration": avgDuration,
        "avgLikes": avgLikes,
        "avgViews": avgViews,
        "categoryId": categoryId,
        "duration": duration,
        "leaf": leaf,
        "likes": likes,
        "name": name,
        "root": root,
        "shortName": shortName,
        "totalStrength": totalStrength,
        "avgStrength": avgStrength,
        "videos": videos,
        "videosWithStrength": videosWithStrength,
        "views": views,
        "z": zAvg
      });
    }
  }
  lsSet("categoryStats", categoryStats);

  return categoryStats;
}

/* Statistics Functions */

/**
 * Calculates the average for a list of numerical data
 *
 * @param {Array<Number>} data An array of numerical data
 * @returns {Number} The average of the data
 */
function average(data) {
  const sum = data.reduce((sum, value) => {
    return sum + value;
  }, 0);

  const avg = sum / data.length;
  return avg;
}

/**
 * Calculates the standard deviation for a list of numerical data
 *
 * @param {Array<Number>} data An array of numerical data
 * @param {Number} avg The average of the data
 * @returns {Number} The standard deviation of the data
 */
function standardDeviation(data, avg) {
  const squareDiffs = data.map(value => {
    const diff = value - avg;
    const squareDiff = diff ** 2;
    return squareDiff;
  });
  const avgSquareDiff = average(squareDiffs);
  const stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

/**
 * Calculates the z-score of a value given data's average and standard deviation
 *
 * @param {Number} value The value to get the z-score for
 * @param {Number} avg The average of the data that the value came from
 * @param {Number} stdDev The standard deviation of the data that the value came
 *    from
 * @returns {Number} The z-score of the provided value
 */
function zScore(value, avg, stdDev) {
  let diff = value - avg;
  let z = diff / stdDev;
  return z;
}

/**
 * Calculates the z-score for every value in the list of numerical data
 *
 * @param {Array<Number>} data A list of numbers to normalize
 * @returns {Array<Number>} A list of z-scores corresponding to the values in 
 *    `data`
 */
function zScoreForList(data) {
  let avg = average(data);
  let stdDev = standardDeviation(data, avg);
  let zScores = data.map((value) => {
    return zScore(value, avg, stdDev);
  });
  return zScores;
}

/**
 * This function was designed to be used with a list of objects
 * e.g. stats = [{x: 2, y: 3}, {x: 1, y: 5}]
 * Creates a list of zScores corresponding to a key (`propertyName`) in each
 * element of `stats` like "x" or "y" in the example above
 *
 * @param {Array<Object>} stats A list of objects
 * @param {String} propertyName The name of the property to get for each object
 *    in `stats`
 * @returns {Array<Number>} List of z-scores
 */
function zScoreByPropertyName(stats, propertyName) {
  let data = stats.map((value) => {return value[propertyName]});
  let zScores = zScoreForList(data);
  let strengthCalc = lsGet("strengthCalc");
  let minZ = -4; // Default value
  let maxZ = 4; // Default value
  if (strengthCalc) {
    if (strengthCalc.minZ) {
      minZ = strengthCalc.minZ;
    }
    if (strengthCalc.maxZ) {
      maxZ = strengthCalc.maxZ;
    }
  }
  let zScoresUpdated = zScores.map((value) => {
    if (value > maxZ) {
      return maxZ;
    } else if (value < minZ) {
      return minZ;
    } else {
      return value;
    }
  });
  return zScoresUpdated;
}


/* Video Strength Functions */

/**
 * Calculates the "strength" of each video
 * See https://stats.stackexchange.com/q/154888 for concepts used to combine
 * multiple metrics into a single metric (strength)
 *
 * @param {Array<Object>} allVideoStats The stats for all videos
 * @returns {Array<Object>} The input `allVideoStats` with the "strength"
 *    property for each video
 */
function calcVideoStrength(allVideoStats, strengthCalc) {
  const statsByVideoId = lsGet("statsByVideoId");
  const weights = strengthCalc.weights;
  const numYears = strengthCalc.numYears;
  const numYearsInMilliSec = numYears * 1000 * 60 * 60 * 24 * 365;
  const now = new Date();
  // Only include videos if they are organic and were made in the last numYears
  let includedVideos = allVideoStats.filter((video) => {
    if (statsByVideoId[video.videoId].organic) {
      const publishDate = new Date(statsByVideoId[video.videoId].publishDate);
      const milliSecSincePublished = now - publishDate;
      return numYearsInMilliSec - milliSecSincePublished > 0;
    }
    return false;
  });
  // Normalizes each metric individually across all videos
  let zScoreData = {
    videoIds: includedVideos.map((video) => {return video["videoId"]}),
    views: zScoreByPropertyName(includedVideos, "views"),
    avgViewsPerDay: zScoreByPropertyName(includedVideos, "avgViewsPerDay"),
    duration: zScoreByPropertyName(includedVideos, "duration"),
    comments: zScoreByPropertyName(includedVideos, "comments"),
    likesPerView: zScoreByPropertyName(includedVideos, "likesPerView"),
    dislikesPerView: zScoreByPropertyName(includedVideos, "dislikesPerView"),
    subscribersGained: zScoreByPropertyName(includedVideos,
      "subscribersGained"),
    avgViewDuration: zScoreByPropertyName(includedVideos, "avgViewDuration"),
    avgViewPercentage: zScoreByPropertyName(includedVideos,
      "avgViewPercentage"),
    daysSincePublished: zScoreByPropertyName(includedVideos,
      "daysSincePublished")
  };
  let strengthArray = [];
  for (let index = 0; index < zScoreData.videoIds.length; index++) {
    const videoId = zScoreData.videoIds[index];
    const views = zScoreData.views[index];
    const avgViewsPerDay = zScoreData.avgViewsPerDay[index];
    const duration = zScoreData.duration[index];
    const comments = zScoreData.comments[index];
    const likesPerView = zScoreData.likesPerView[index];
    const dislikesPerView = zScoreData.dislikesPerView[index];
    const subscribersGained = zScoreData.subscribersGained[index];
    const avgViewDuration = zScoreData.avgViewDuration[index];
    const avgViewPercentage = zScoreData.avgViewPercentage[index];
    const daysSincePublished = zScoreData.daysSincePublished[index];
    let strength = 0;
    for (const name in weights) {
      if (weights.hasOwnProperty(name)) {
        const weight = weights[name];
        strength += (weight * zScoreData[name][index]);
      }
    }
    strengthArray.push({
      totalStrength: strength,
      videoId: videoId,
      z: {
        views: views,
        avgViewsPerDay: avgViewsPerDay,
        duration: duration,
        comments: comments,
        likesPerView: likesPerView,
        dislikesPerView: dislikesPerView,
        subscribersGained: subscribersGained,
        avgViewDuration: avgViewDuration,
        avgViewPercentage: avgViewPercentage,
        daysSincePublished: daysSincePublished
      }
    });
  }
  strengthArray.sort(function (a, b) {
    return a.totalStrength - b.totalStrength;
  });
  
  let zScoreStrengths = zScoreByPropertyName(strengthArray, "totalStrength");
  let length = zScoreStrengths.length;
  let lowPercentile = Math.floor(length * 0);
  let highPercentile = Math.floor(length - 1);
  let min = zScoreStrengths[lowPercentile]
  let range = zScoreStrengths[highPercentile] - min;
  if (range == 0) {
    // Avoid a divide by zero error later on
    range = 1;
  }
  // Normalize all strength values to between 0-100
  for (let index = 0; index < strengthArray.length; index++) {
    let strength = zScoreStrengths[index];
    let normalizedStrength = (((strength - min) / range) * 100);
    strengthArray[index].strength = normalizedStrength;
  }
  allVideoStats.forEach(video => {
    const videoId = video.videoId;
    const organic = video.organic;
    if (organic) {
      // Find video in strengthArray
      const index = strengthArray.findIndex((element) => {
        return videoId == element.videoId;
      });
      if (index >= 0) {
        video.strength = strengthArray[index].strength;
        video.totalStrength = strengthArray[index].totalStrength;
        video.z = strengthArray[index].z;
      }
    } else {
      // Video was not included in strengthArray
      video.strength = undefined;
      video.totalStrength = undefined;
      video.z = undefined;
    }
  });
  allVideoStats.sort(function (a, b) {
    return new Date(b.publishDate) - new Date(a.publishDate);
  });
  return allVideoStats;
}