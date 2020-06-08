// Updates total views, likes, etc. for each category given all video stats
function updateCategoryTotals(allVideoStats) {
  let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
  let categoryTotals = JSON.parse(localStorage.getItem("categoryTotals"));

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
        categoryTotals[categoryId]["videos"] = [];
      }
      let categoryViews = parseInt(categoryTotals[categoryId]["views"]);
      let categoryLikes = parseInt(categoryTotals[categoryId]["likes"]);
      let categoryDuration = parseInt(categoryTotals[categoryId]["duration"]);
      let categoryStrength = parseFloat(categoryTotals[categoryId]["strength"]);
      let categoryVideos = categoryTotals[categoryId]["videos"];
      categoryVideos.push(videoId);
      categoryTotals[categoryId]["views"] = categoryViews + viewCount;
      categoryTotals[categoryId]["likes"] = categoryLikes + likeCount;
      categoryTotals[categoryId]["duration"] = categoryDuration + duration;
      categoryTotals[categoryId]["strength"] = categoryStrength + strength;
      categoryTotals[categoryId]["videos"] = categoryVideos;
    }
  });
  localStorage.setItem("categoryTotals", JSON.stringify(categoryTotals));
  localStorage.setItem("statsByVideoId", JSON.stringify(statsByVideoId));

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
      let videos = totals["videos"];
      let numVideos = videos.length;
      let avgViews = views / numVideos;
      let avgLikes = likes / numVideos;
      let avgDuration = duration / numVideos;
      let avgStrength = totalStrength / numVideos;
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
        "views": views
      });
    }
  }
  localStorage.setItem("categoryStats", JSON.stringify(categoryStats));

  return categoryStats;
}

/**
 * Updates the data used in the dashboards then reloads the dashboards.
 * Data is taken from the input sheet and the YouTube APIs
 *
 * @returns {Promise} Status message
 */
function updateDashboards() {
  // Prevent multiple simultaneous load/update dashboard calls
  if (!isLoading && !isUpdating) {
    isUpdating = true;
    showUpdatingText();
    const now = new Date();
    let requests = [];
    // checks that today is between Jan 10-20 ish
    if (now.getMonth() == 0 && now.getDate() >= 10 &&
      now.getDate <= 20) {
      const lastYear = now.getFullYear() - 1;
      requests.push(getYearlyCategoryViews(lastYear));
    }
    requests.push(getCardPerformanceForCurrMonth());
    requests.push(realTimeStatsCalls());
    requests.push(updateVideoAndCategoryStats());
    return Promise.all(requests)
      .then(response => {
        console.log("Update Dashboards Complete", response);
        recordUpdate("Dashboards Updated");
        hideUpdatingText();
        isUpdating = false;
        // Reload the dashboards with the new data
        return loadDashboards();
      })
      .catch(err => {
        recordUpdate("Update Failed");
        const errorMsg = "Error occurred updating dashboards: ";
        console.error(errorMsg, err);
        recordError(err, errorMsg);
      })
      .finally(response => {
        hideUpdatingText();
        isUpdating = false;
      });
  }
}

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
        // Only include the video in the dashboards if it is organic
        if (organic) {
          const videoId = video[columns["Video ID"]];
          const title = video[columns["Title"]];
          const publishDate = video[columns["Publish Date"]];
          const duration = video[columns["Duration"]];
          let categoryString = video[columns["Categories"]];
          const createdBy = video[columns["Created By"]];
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
            "title": title,
            "publishDate": publishDate,
            "duration": duration,
            "createdBy": createdBy
          };

          // Array of video IDs for the channel
          uploads.push(videoId);
        }
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
        const publishDate = video[columns["Publish Date"]].substr(0, 10);
        // Removes whitespace
        const categories = video[columns["Categories"]].replace(/\s/g, '');
        const createdBy = video[columns["Created By"]];
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
        // Array of video IDs for the channel
        uploads.push(videoId);
      }
      lsSet("allVideoStats", allVideoStats);
      lsSet("statsByVideoId", statsByVideoId);
      lsSet("uploads", uploads);
    });
}

/**
 * Gets category and video statistics from the stats spreadsheet
 *
 * @returns {Promise} A promise that resolves when all stats have been saved to
 *    local storage
 */
function getCategoryAndVideoStats() {
  const categoryPromise = getCategoryStats();
  const videoPromise = getVideoStats();
  return Promise.all([categoryPromise, videoPromise]);
}

/**
 * Gets the channel demographics graph information from the stats spreadsheet
 * and displays the graph
 *
 * @returns {Promise} Status message
 */
function loadChannelDemographics() {
  return requestSpreadsheetData("Stats", "Channel Demographics")
    .then(response => {
      const rows = JSON.parse(response[0][0]);
      const newResponse = {
        "result": {
          "rows": rows
        }
      };
      return displayChannelDemographics(newResponse);
    });
}

/**
 * Gets Top Ten Video data from the stats spreadsheet and displays the
 * thumbnails with arrows
 *
 * @returns {Promise} Status message
 */
function loadTopTenDashboard() {
  return requestSpreadsheetData("Stats", "Top Ten Videos")
    .then(topTenSheet => {
      const statsByVideoId = lsGet("statsByVideoId");
      let output = ``;
      for (let j = 1; j < topTenSheet.length; j++) {
        for (let i = 0; i < 11; i++) {
          const month = topTenSheet[j];
          if (i == 0) {
            output += 
              `<div class="column-title"><h4>${month[i]}</h4></div>`;
          } else {
            const videoId = month[i];
            const views = numberWithCommas(parseInt(month[i + 10]));
            const minutesWatched =numberWithCommas(parseInt(month[i + 20]));
            let videoTitle = "YouTube Video ID: " + videoId;
            if (statsByVideoId && statsByVideoId[videoId]) {
              videoTitle = statsByVideoId[videoId]["title"];
            }
            videoTitle +=
              ` | ${views} views & ${minutesWatched} minutes watched`;
            output += `
              <div class="top-ten-thumbnail-holder column-thumbnail">
                <a href="https://youtu.be/${videoId}" target="_blank"
                    alt="${videoTitle}">
                  <img class="top-ten-thumbnail"
                      src="https://i.ytimg.com/vi/${videoId}/mqdefault.jpg" 
                      alt="thumbnail" title="${videoTitle}">`;
            if (j != 1) {
              const currPosition = i;
              const prevMonth = topTenSheet[j - 1];
              const prevPosition = prevMonth.indexOf(videoId);
              if (prevPosition == -1) {
                // Add + up arrow
                output += `
                  <span class="oi oi-arrow-thick-top arrow-green"></span>
                  <span class="arrow-text-black">+</span>
                `;
              } else if (prevPosition != currPosition) {
                const change = prevPosition - currPosition;
                if (change < 0) {
                  // Add down arrow
                  output += `
                    <span class="oi oi-arrow-thick-bottom arrow-red"></span>
                    <span class="arrow-text-white">${Math.abs(change)}</span>
                  `;
                } else if (change > 0) {
                  // Add up arrow
                  output += `
                    <span class="oi oi-arrow-thick-top arrow-green"></span>
                    <span class="arrow-text-black">${change}</span>
                  `;
                }
              }
            }
            output += `</a></div>`;
          }
        }
      }
      let thumbnailContainer =
        document.getElementById("top-ten-thumbnail-container");
      thumbnailContainer.innerHTML = output;
      let thumbnailWrapper =
        document.getElementById("top-ten-thumbnail-wrapper");
      thumbnailWrapper.scrollLeft = thumbnailWrapper.scrollWidth;
      return Promise.resolve("Displayed Top Ten Videos Dashboard");
    });
}

/**
 * Gets user feedback data from the stats spreadsheet and displays them on the
 * user feedback dashboard
 *
 * @returns {Promise} Statsus message
 */
function loadUserFeedbackDashboard() {
  return requestSpreadsheetData("Input Data", "User Feedback List")
    .then(feedbackSheet => {
      const statsByVideoId = lsSet("statsByVideoId");
      let output = ``;
      for (let i = 1; i < feedbackSheet.length; i++) {
        const videoId = feedbackSheet[i][0];
        const feedbackText = feedbackSheet[i][1];
        let videoTitle = "YouTube Video ID: " + videoId;
        if (statsByVideoId && statsByVideoId[videoId]) {
          videoTitle = statsByVideoId[videoId]["title"];
        }
        const thumbnail = `
          <div class="col-4">
            <a href="https://youtu.be/${videoId}" target="_blank"
                alt="${videoTitle}">
              <img class="feedback-thumbnail" onload="thumbnailCheck($(this), true)"
                  src="https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg"
                  alt="thumbnail" title="${videoTitle}">
            </a>
          </div>`;
        const feedback = `
          <div class="col-8">
            <h1 class="feedback-text">"${feedbackText}"</h1>
          </div>
        `;
        const spacer = `<div class="col-12"><hr></div>`;
        if (i % 2 == 0) {
          output += feedback + thumbnail;
        } else {
          output += thumbnail + feedback;
        }
        if (i != feedbackSheet.length - 1) {
          output += spacer;
        }
      }
      let feedbackContainer = document.getElementById("feedback-container");
      feedbackContainer.innerHTML = output;
      if (!autoScrollDivs.includes("feedback-wrapper")) {
        const currentSettings = JSON.parse(localStorage.getItem("settings"));
        let speed = -1;
        let index = 0;
        while (speed == -1 && index <= currentSettings.dashboards.length) {
          const dashboard = currentSettings.dashboards[index];
          if (dashboard.name == "top-ten") {
            speed = dashboard.scrollSpeed;
          }
          index++;
        }
        if (speed <= 0) {
          speed = 0;
        } else {
          speed = Math.ceil(1000 / speed);
        }
        new AutoDivScroll("feedback-wrapper", speed, 1, 1);
        autoScrollDivs.push("feedback-wrapper");
      }
      return Promise.resolve("Displayed User Feedback Dashboard");
    });
}

/**
 * Gets card performance data from the stats spreadsheet and displays a graph on
 * the card performance dashboard
 *
 * @returns {Promise} Status message
 */
function loadCardPerformanceDashboard() {
  return requestSpreadsheetData("Stats", "Card Performance")
    .then(cardData => {
      cardData.shift(); // Remove the headers from the sheet

      let months = [];
      let cardImpressions = [];
      let cardCTR = [];
      let cardTeaserImpressions = [];
      let cardTeaserCTR = [];

      // If the last month has no data (all zeros), omit it from the graph
      let numMonths = cardData.length;
      const lastMonth = cardData[cardData.length - 1];
      if (lastMonth[1] == 0 && lastMonth[3] == 0) {
        numMonths--;
      }

      for (let i = 0; i < numMonths; i++) {
        months.push(cardData[i][0]);
        cardImpressions.push(cardData[i][1]);
        cardCTR.push(cardData[i][2] * 100);
        cardTeaserImpressions.push(cardData[i][3]);
        cardTeaserCTR.push(cardData[i][4] * 100);
      }

      const impressionsTrace = {
        "x": months,
        "y": cardImpressions,
        "type": "bar",
        "hovertemplate": "%{y} Impressions<extra></extra>",
        "name": "Card Impressions"
      };

      const ctrTrace = {
        "x": months,
        "y": cardCTR,
        "type": "scatter",
        "hovertemplate": "%{y} Click Rate<extra></extra>",
        "line": {
          "width": 4,
        },
        "name": "Card Click Rate",
        "yaxis": "y2"
      };

      const teaserImpressionsTrace = {
        "x": months,
        "y": cardTeaserImpressions,
        "type": "bar",
        "hovertemplate": "%{y:,g} Teaser Impressions<extra></extra>",
        "name": "Card Teaser Impressions"
      };

      const teaserCTRTrace = {
        "x": months,
        "y": cardTeaserCTR,
        "type": "scatter",
        "hovertemplate": "%{y} Teaser Click Rate<extra></extra>",
        "line": {
          "width": 4,
        },
        "name": "Card Teaser Click Rate",
        "yaxis": "y2"
      };

      const cardTraces = [impressionsTrace, ctrTrace];
      const cardTeaserTraces = [teaserImpressionsTrace, teaserCTRTrace];

      const graphHeight = 0.4159;
      const graphWidth = 0.9192;
      const teaserGraphWidth = 0.9528;
      const height = graphHeight * document.documentElement.clientHeight;
      const width = graphWidth * document.documentElement.clientWidth;
      const teaserWidth =
        teaserGraphWidth * document.documentElement.clientWidth;
      const legendFontSize =
        Math.floor(0.017 * document.documentElement.clientHeight);
      const tickSize =
        Math.floor(0.0094 * document.documentElement.clientWidth);
      const axisTitleSize =
        Math.floor(0.013 * document.documentElement.clientWidth);
      const titleSize =
        Math.floor(0.0156 * document.documentElement.clientWidth);
      const topMargin =
        Math.floor(0.03 * document.documentElement.clientWidth);
      const bottomMargin =
        Math.floor(0.0104 * document.documentElement.clientWidth);

      const cardLayout = {
        "height": height,
        "width": width,
        "legend": {
          "bgcolor": "#eeeeee",
          "font": {
            "size": legendFontSize
          },
          "x": 1.1,
          "y": 0.5
        },
        "margin": {
          "b": bottomMargin,
          "t": topMargin
        },
        "title": {
          "font": {
            "size": titleSize
          },
          "text": "Card Performance"
        },
        "xaxis": {
          "automargin": true,
          "fixedrange": true,
          "hoverformat": "%b %Y",
          "tickformat": "%b<br>%Y",
          "tickfont": {
            "size": tickSize
          },
          "title": {
            "font": {
              "size": axisTitleSize
            },
            "text": "Month"
          }
        },
        "yaxis": {
          "automargin": true,
          "fixedrange": true,
          "tickfont": {
            "size": tickSize
          },
          "title": {
            "font": {
              "size": axisTitleSize
            },
            "text": "Card Impressions"
          }
        },
        "yaxis2": {
          "automargin": true,
          "fixedrange": true,
          "showgrid": false,
          "tickfont": {
            "size": tickSize
          },
          "title": {
            "font": {
              "size": axisTitleSize
            },
            "text": "Card Click Rate"
          },
          "overlaying": "y",
          "side": "right",
          "ticksuffix": "%",
          "zeroline": false
        }
      };

      const config = {
        "scrollZoom": false,
        "displayModeBar": false,
      }

      // Creates a copy of `cardLayout`
      let teaserLayout = JSON.parse(JSON.stringify(cardLayout));
      teaserLayout.title.text = "Card Teaser Performance";
      teaserLayout.yaxis.title.text = "Card Teaser Impressions";
      teaserLayout.width = teaserWidth;

      const cardTeaserGraph = "card-teaser-performance-graph";
      const cardGraph = "card-performance-graph";

      Plotly.newPlot(cardTeaserGraph, cardTeaserTraces, teaserLayout, config);
      recordGraphData(cardTeaserGraph, cardTeaserTraces, teaserLayout, config,
        graphHeight, graphWidth);
      recordGraphSize(cardTeaserGraph, graphHeight, teaserGraphWidth);

      Plotly.newPlot(cardGraph, cardTraces, cardLayout, config);
      recordGraphData(cardGraph, cardTraces, cardLayout, config, graphHeight,
        graphWidth);
      recordGraphSize(cardGraph, graphHeight, graphWidth);
      return Promise.resolve("Displayed Card Performance Dashboard");
    });
}

/**
 * Displays real time stats and may retrieve the data from the stats spreadsheet
 * or the YouTube APIs
 *
 * @returns {Promise} Status message
 */
function loadRealTimeStatsDashboard() {
  const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
  if (isSignedIn) {
    try {
      return displayRealTimeStats();
    } catch (err) {
      recordError(err);
      return realTimeStatsCalls();
    }
  } else {
    return requestSpreadsheetData("Stats", "Real Time Stats")
      .then(realTimeStatsSheet => {
        let realTimeStats = {};
        const columns = getColumnHeaders(realTimeStatsSheet);
        for (let i = 1; i < realTimeStatsSheet.length; i++) {
          const row = realTimeStatsSheet[i];
          const timeRange = row[columns["Time Range"]];
          const views = row[columns["Views"]];
          const estimatedMinutesWatched =
            row[columns["Estimated Minutes Watched"]];
          const averageViewDuration = row[columns["Average View Duration"]];
          const netSubscribersGained = row[columns["Subscribers Gained"]];
          realTimeStats[timeRange] = {
            "views": parseInt(views),
            "estimatedMinutesWatched": parseInt(estimatedMinutesWatched),
            "averageViewDuration": parseInt(averageViewDuration),
            "netSubscribersGained": parseInt(netSubscribersGained),
          };
        }
        lsSet("realTimeStats", realTimeStats);
        return displayRealTimeStats(realTimeStats);
      });
  }
}

/**
 * Gets graph data from the stats spreadsheet and displays them
 *
 * @returns {Promise} Status message
 */
function loadGraphsFromSheets() {
  return requestSpreadsheetData("Stats", "Graph Data")
    .then(graphData => {
      let numErrors = 0;
      const columns = getColumnHeaders(graphData);
      for (let i = 1; i < graphData.length; i++) {
        const row = graphData[i];
        const graphId = row[columns["Graph ID"]];
        const data = JSON.parse(row[columns["Data"]]);
        const layout = JSON.parse(row[columns["Layout"]]);
        const config = JSON.parse(row[columns["Config"]]);
        const graphHeight = parseFloat(row[columns["Graph Height"]]);
        const graphWidth = parseFloat(row[columns["Graph Width"]]);
        const automargin = JSON.parse(row[columns["Automargin"]]);
        // Display graphs
        try {
          Plotly.newPlot(graphId, data, layout, config);
          if (automargin != "None") {
            recordGraphSize(graphId, graphHeight, graphWidth, automargin);
          } else {
            recordGraphSize(graphId, graphHeight, graphWidth);
          }
        } catch (err) {
          console.error(err);
          recordError(err);
          numErrors++;
        }
      }
      return Promise.resolve("Displayed Graphs From Sheets with " + numErrors +
        " errors");
    });
}

/**
 * Gets top video statistics from the stats spreadsheet and displays the data in
 * the top video dashboards
 *
 * @returns {Promise} Status message
 */
function loadTopVideoStats() {
  return requestSpreadsheetData("Stats", "Top Video Stats")
    .then(topVideoStatsSheet => {
      const columns = getColumnHeaders(topVideoStatsSheet);
      let dashboardIds = {};
      let rows = [];
      for (let i = 1; i < topVideoStatsSheet.length; i++) {
        const row = topVideoStatsSheet[i];
        const videoId = row[columns["Video ID"]];
        const dashboardId = row[columns["Dashboard ID"]];
        const title = row[columns["Title"]];
        const duration = row[columns["Duration"]];
        const publishDate = row[columns["Publish Date"]];
        const thumbnail = row[columns["Thumbnail"]];
        const views = row[columns["Views"]];
        const subscribersGained = row[columns["Subscribers Gained"]];
        const avgViewDuration = row[columns["Average View Duration"]];
        const minutesWatched = row[columns["Estimated Minutes Watched"]];
        const comments = row[columns["Comments"]];
        const likes = parseInt(row[columns["Likes"]]);
        const dislikes = parseInt(row[columns["Dislikes"]]);
        try {
          document.getElementById(dashboardId + "-title").innerHTML = title;
          document.getElementById(dashboardId + "-duration").innerHTML =
            "Duration: " + secondsToDuration(duration);
          document.getElementById(dashboardId + "-duration-seconds").innerHTML =
            duration;
          document.getElementById(dashboardId + "-publish-date").innerHTML =
            "Published: " + publishDate;
          document.getElementById(dashboardId + "-thumbnail").innerHTML =
            thumbnail;
          const row = [
            videoId,
            views,
            comments,
            likes,
            dislikes,
            minutesWatched,
            avgViewDuration,
            subscribersGained,
            0
          ];
          rows.push(row);
          dashboardIds[videoId] = dashboardId;
        } catch (err) {
          const errorMsg = `Dashboard "${dashboardId}" does not exist - `;
          console.error(errorMsg, err);
          recordError(err, errorMsg);
        }
      }
      const response = {
        "result": {
          "rows": rows
        }
      };
      displayVideoBasicStats(response, dashboardIds);
      return Promise.resolve("Displayed Top Video Dashboards");
    });
}

/**
 * Gets category views area chart data from the stats spreadsheet and displays
 * the graphs
 *
 * @returns {Promise} Status message
 */
function loadCategoryCharts() {
  return requestSpreadsheetData("Stats", "Category Traces")
    .then(response => {
      const categoryTraces = JSON.parse(response[0][0]);
      return displayCategoryViewsAreaCharts(categoryTraces);
    });
}

/**
 * Displays top categories graphs on the product categories dashboard
 *
 * @returns {Promise} Status message
 */
function loadProductCategoriesDashboard() {
  displayTopCategoriesGraphOne();
  displayTopCategoriesGraphTwo();
  displayTopCategoriesGraphThree();
  return Promise.resolve("Displayed Product Categories Dashboard");
}

/**
 * Displays the all upload thumbnails and gets the number of videos on the
 * AutomationDirect YouTube channel
 *
 * @returns {Promise} Status message
 */
function loadThumbnailDashboard() {
  const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
  if (isSignedIn) {
    const thumbnailsRequest = displayUploadThumbnails();
    // Gets the total number of listed and unlisted videos on the channel
    const request = {
      part: "statistics",
      forUsername: "automationdirect"
    };
    const numVideosRequest = gapi.client.youtube.channels.list(request)
      .then(response => {
        const numVideos = response.result.items[0].statistics.videoCount;
        document.getElementById("num-videos").innerText = numVideos;
      })
      .catch(err => {
        const errorMsg = "Unable to get number of channel videos: ";
        console.error(errorMsg, err);
        recordError(err, errorMsg);
      });
    return Promise.all([numVideosRequest, thumbnailsRequest]);
  } else {
    return displayUploadThumbnails();
  }
}

/**
 * Finds the most watched video for selected categories, fetches data on these
 * videos from the YouTube APIs, displays the data on the Top Video Dashboards
 *
 * @returns {Promise} Status message
 */
function loadTopVideoDashboards() {
  const carouselInner = document.getElementsByClassName("carousel-inner")[0];
  const todayDate = getTodaysDate();
  let topVideoList = [];
  let dashboardIds = {};
  if (carouselInner.children["top-video-1"]) {
    const plcVideo = getTopVideoByCategory("B", "views")[0];
    if (plcVideo != undefined) {
      dashboardIds[plcVideo] = "top-video-1";
      topVideoList.push(plcVideo);
    }
  }
  if (carouselInner.children["top-video-2"]) {
    const drivesVideo = getTopVideoByCategory("C", "views")[0];
    if (drivesVideo != undefined) {
      dashboardIds[drivesVideo] = "top-video-2";
      topVideoList.push(drivesVideo);
    }
  }
  if (carouselInner.children["top-video-3"]) {
    const hmiVideo = getTopVideoByCategory("D", "views")[0];
    if (hmiVideo != undefined) {
      dashboardIds[hmiVideo] = "top-video-3";
      topVideoList.push(hmiVideo);
    }
  }
  if (carouselInner.children["top-video-4"]) {
    const motionControlVideo = getTopVideoByCategory("F", "views")[0];
    if (motionControlVideo != undefined) {
      dashboardIds[motionControlVideo] = "top-video-4";
      topVideoList.push(motionControlVideo);
    }
  }
  if (carouselInner.children["top-video-5"]) {
    const sensorsVideo = getTopVideoByCategory("H", "views")[0];
    if (sensorsVideo != undefined) {
      dashboardIds[sensorsVideo] = "top-video-5";
      topVideoList.push(sensorsVideo);
    }
  }
  if (carouselInner.children["top-video-6"]) {
    const motorsVideo = getTopVideoByCategory("I", "views")[0];
    if (motorsVideo != undefined) {
      dashboardIds[motorsVideo] = "top-video-6";
      topVideoList.push(motorsVideo);
    }
  }
  if (topVideoList.length == 0) {
    return null;
  }
  const topVideosStr = topVideoList.join(",");
  return topVideoCalls(joinDate, todayDate, topVideosStr, dashboardIds);
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
  let zScoresUpdated = zScores.map((value) => {
    if (value > 4) {
      return 4;
    } else if (value < -4) {
      return -4;
    } else {
      return value;
    }
  });
  return zScoresUpdated;
}

/**
 * Calculates the "strength" of each video
 * See https://stats.stackexchange.com/q/154888 for concepts used to combine
 * multiple metrics into a single metric (strength)
 *
 * @param {Array<Object>} allVideoStats The stats for all videos
 * @returns {Array<Object>} The input `allVideoStats` with the "strength"
 *    property for each video
 */
function calcVideoStrength(allVideoStats) {
  // Normalizes each metric individually across all videos
  let zScoreData = {
    videoIds: allVideoStats.map((video) => {return video["videoId"]}),
    views: zScoreByPropertyName(allVideoStats, "views"),
    avgViewsPerDay: zScoreByPropertyName(allVideoStats, "avgViewsPerDay"),
    duration: zScoreByPropertyName(allVideoStats, "duration"),
    comments: zScoreByPropertyName(allVideoStats, "comments"),
    likesPerView: zScoreByPropertyName(allVideoStats, "likesPerView"),
    dislikesPerView: zScoreByPropertyName(allVideoStats, "dislikesPerView"),
    subscribersGained: zScoreByPropertyName(allVideoStats, "subscribersGained"),
    avgViewDuration: zScoreByPropertyName(allVideoStats, "avgViewDuration"),
    avgViewPercentage: zScoreByPropertyName(allVideoStats, "avgViewPercentage"),
    daysSincePublished: zScoreByPropertyName(allVideoStats,
      "daysSincePublished")
  };
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
    // Change the integers (weights) to balance each metric's contribution
    let strength =
      (1.5 * views) +
      (1 * avgViewsPerDay) +
      (0.5 * comments) +
      (0.5 * likesPerView) +
      (1.5 * subscribersGained) +
      (1 * avgViewPercentage) -
      (0.5 * dislikesPerView);
    allVideoStats[index].strength = strength;
  }
  allVideoStats.sort(function (a,b) {
    return a.strength - b.strength;
  });
  let zScoreStrengths = zScoreByPropertyName(allVideoStats, "strength");
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
  for (let index = 0; index < allVideoStats.length; index++) {
    let strength = zScoreStrengths[index];
    let normalizedStrength = (((strength - min) / range) * 100);
    allVideoStats[index].strength = normalizedStrength;
  }
  return allVideoStats;
}