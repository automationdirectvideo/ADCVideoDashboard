/**
 * Updates the data used in the dashboards then reloads the dashboards.
 * Data is taken from the input sheet and the YouTube APIs
 *
 * @returns {Promise} Status message
 */
function updateDashboards() {
  // Prevent multiple simultaneous load/update dashboard calls
  if (!isLoading && !isUpdating) {
    setUpdatingStatus(true);
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
    requests.push(getVideographerViewsForCurrMonth());
    requests.push(realTimeStatsCalls());
    requests.push(updateVideoAndCategoryStats());
    reloadIntroAnimation();
    return Promise.all(requests)
      .then(response => {
        console.log("Update Dashboards Complete", response);
        recordUpdate("Dashboards Updated");
        hideUpdatingText();
        setUpdatingStatus(false);
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
        setUpdatingStatus(false);
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
        const videoId = video[columns["Video ID"]];
        const title = video[columns["Title"]];
        const publishDate = video[columns["Publish Date"]];
        const duration = video[columns["Duration"]];
        let categoryString = video[columns["Categories"]];
        const createdBy = video[columns["Created By"]];
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
 * Gets monthly views by videographer from the stats Google Sheet and adds the
 * data to the videographer stats
 *
 * @returns Updated videographer statistics
 */
function getVideographerMonthlyViews() {
  return requestSpreadsheetData("Stats", "Videographer Monthly Views")
    .then(sheetData => {
      const column = getColumnHeaders(sheetData);
      let categoryData = {};
      sheetData[0].forEach(categoryName => {
        if (categoryName != "Month") {
          categoryData[categoryName] = {};
        }
      });
      for (let index = 1; index < sheetData.length; index++) {
        const monthData = sheetData[index];
        const month = monthData[column["Month"]];
        sheetData[0].forEach(categoryName => {
          if (categoryName != "Month") {
            categoryData[categoryName][month] =
              parseInt(monthData[column[categoryName]]);
          }
        });
      }
      let videographers = lsGet("videographers");
      for (const categoryName in categoryData) {
        if (categoryData.hasOwnProperty(categoryName)) {
          const monthlyViews = categoryData[categoryName];
          const split = categoryName.indexOf("-");
          const videographerName = categoryName.substring(0, split);
          const category = categoryName.substring(split + 1);
          videographers[videographerName][category].monthlyViews = monthlyViews;
        }
      }
      lsSet("videographers", videographers);
      return videographers;
    });
}

/**
 * Gets videographer average and total stats from the stats Google Sheet
 *
 * @returns {Promise} The videographer stats
 */
function getVideographerStats() {
  return requestSpreadsheetData("Stats", "Videographer Stats")
    .then(sheetValues => {
      let videographers = {};
      let column = getColumnHeaders(sheetValues);
      let properties = sheetValues[0];
      console.log(properties);
      for (let index = 1; index < sheetValues.length; index++) {
        const row = sheetValues[index];
        const label = row[column["Label"]];
        const split = label.indexOf("-");
        const name = label.substring(0, split);
        const category = label.substring(split + 1);
        if (videographers[name] == undefined) {
          videographers[name] = {};
        }
        videographers[name][category] = {};
        for (let j = 1; j < properties.length; j++) {
          const property = properties[j];
          videographers[name][category][property] = parseFloat(row[j]);
        }
      }
      console.log(videographers);
      return Promise.resolve(videographers);
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
  requests.push(realTimeStatsCalls());
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
      let column = getColumnHeaders(sheetValues);
      for (let index = 1; index < sheetValues.length; index++) {
        const metric = sheetValues[index];
        let name = metric[column["Short Name"]];
        let weight = parseFloat(metric[column["Weight"]]);
        weights[name] = weight;
      }
      lsSet("weights", weights);
      return Promise.resolve(weights);
    });
}

/**
 * Plays the intro animation
 */
function loadIntroAnimation() {
  const introImage = document.getElementById("intro-img");
  const introVideo = document.getElementById("intro-video");
  if (introVideo.readyState != 4) {
    introVideo.load();
  }
  if (introVideo.paused) {
    const promise = introVideo.play();
    if (promise !== undefined) {
      promise
        .then(_ => {
        // Autoplay started!
        introImage.style.display = "none";
        introVideo.style.display = "initial";
        })
        .catch(error => {
          document.getElementsByTagName("VIDEO")[0].play();
          introImage.style.display = "none";
          introVideo.style.display = "initial";
        });
    }
  }
}

/**
 * Removes and reloads the intro animation. The animation sometimes turns black
 * after many hours on the dashboard. This function prevents this problem.
 */
function reloadIntroAnimation() {
  const introImage = document.getElementById("intro-img");
  const introVideo = document.getElementById("intro-video");
  const container = document.getElementById("animation-container");
  introImage.style.display = "";
  introVideo.remove();
  prependElement(container, introVideo);
  loadIntroAnimation();
}

/**
 * Gets channel platform and demographics statistics from the YouTube API and
 * displays graphs on the platform dashboard
 *
 * @returns {Promise} Status message
 */
function loadPlatformDashboard() {
  const startDate = joinDate;
  const endDate = getTodaysDate();
  let requests = [];
  requests.push(requestChannelSearchTerms(startDate, endDate));
  requests.push(requestViewsByDeviceType(startDate, endDate));
  requests.push(requestViewsByTrafficSource(startDate, endDate));
  requests.push(requestViewsByState(startDate, endDate));
  requests.push(requestChannelDemographics(startDate, endDate));
  requests.push(requestWatchTimeBySubscribedStatus(startDate, endDate));
  return Promise.all(requests)
    .then(response => {
      console.log("Platform Dashboard Calls Status:", response);
      return "Displayed Platform Dashboard";
    })
    .catch(err => {
      const errorMsg = "Error loading the Platform Dashboard: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
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
    })
    .catch(err => {
      const graphIds = getDashboardGraphIds("platform");
      const graphId = graphIds.demographics;
      displayGraphError(graphId, err);
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
      const statsByVideoId = lsGet("statsByVideoId");
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
        const currentSettings = lsGet("settings");
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
  const graphIds = getDashboardGraphIds("card-performance");
  const cardTeaserGraph = graphIds.cardTeaser;
  const cardGraph = graphIds.card;
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

      let numErrors = 0;

      try {
        createGraph(cardTeaserGraph, cardTeaserTraces, teaserLayout, config,
          graphHeight, graphWidth);
      } catch (err) {
        numErrors++;
        displayGraphError(cardTeaserGraph, err);
      }

      try {
        createGraph(cardGraph, cardTraces, cardLayout, config, graphHeight,
          graphWidth);
      } catch (err) {
        numErrors++;
        displayGraphError(cardGraph, err);
      }
      if (numErrors > 0) {
        return Promise.resolve("Error Displaying Card Performance Dashboard")
      } else {
        return Promise.resolve("Displayed Card Performance Dashboard");
      }
    })
    .catch(err => {
      displayGraphError(cardTeaserGraph, err);
      displayGraphError(cardGraph, err);
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
          displayGraphError(graphId);
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
  return requestSpreadsheetData("Stats", "Category Views By Year")
    .then(viewsSheet => {
      const categoryTraces = recordYearlyCategoryViews(viewsSheet);
      return displayCategoryViewsAreaCharts(categoryTraces);
    })
    .catch(err => {
      recordError(err);
      const graphIds = getDashboardGraphIds("categoryGraphs");
      graphIds.forEach(graphId => {
        displayGraphError(graphId);
      });
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

/**
 * Gets the top twenty organic videos by strengths and displays them
 */
function loadVideoStrengthDashboard() {
  const statsByVideoId = lsGet("statsByVideoId");
  const allVideoStats = lsGet("allVideoStats");
  allVideoStats.sort(function (a, b) {
    if (a.strength == b.strength) {
      return b.totalStrength - a.totalStrength;
    } else {
      return b.strength - a.strength;
    }
  });
  let numVideos = 20;
  let output = ``;
  let graphData = [];
  let i = 0;
  let numFound = 0;
  while (i < allVideoStats.length && numFound < numVideos) {
    const videoStats = allVideoStats[i];
    const videoId = videoStats["videoId"];
    const organic = statsByVideoId[videoId].organic;
    if (organic) {
      numFound++;
      const strength = Math.round(videoStats["strength"] * 100) / 100;
      let videoTitle = "YouTube Video ID: " + videoId;
      let graphId = `video-strength-bars-${numFound}`;
      graphData.push({
        videoStats: videoStats,
        graphId: graphId
      });
      if (statsByVideoId && statsByVideoId[videoId]) {
        videoTitle = statsByVideoId[videoId]["title"];
      }
  
      output += `
        <div class="col-1">
          <h1 style="font-size:5rem;">${numFound}.</h1>
        </div>
        <div class="col-3">
          <a href="https://youtu.be/${videoId}" target="_blank"
              alt="${videoTitle}">
            <img class="feedback-thumbnail"
                onload="thumbnailCheck($(this), true)"
                src="https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg"
                alt="thumbnail" title="${videoTitle}">
          </a>
        </div>
        <div class="col-4">
          <h1 class="video-strength-title">${videoTitle}</h1>
          <br>
          <h2 class="video-strength-value">Strength: ${strength}</h2>
        </div>
        <div class="col-4">
          <div class="h-100 w-100 graph-container" id="${graphId}"></div>
        </div>
      `;
      const spacer = `
        <div class="col-12">
          <hr style="border-top:0.25rem solid rgba(0,0,0,.3);">
        </div>
      `;
      if (numFound != numVideos) {
        output += spacer;
      }
    }
    i++;
  }
  let videoStrengthContainer =
    document.getElementById("video-strength-container");
  videoStrengthContainer.innerHTML = output;
  if (!autoScrollDivs.includes("video-strength-wrapper")) {
    let currentSettings = lsGet("settings");
    let speed = -1;
    let index = 0;
    while (speed == -1 && index <= currentSettings.dashboards.length) {
      let dashboard = currentSettings.dashboards[index];
      if (dashboard.name == "video-strength") {
        speed = dashboard.scrollSpeed;
      }
      index++;
    }
    if (speed <= 0) {
      speed = 0;
    } else {
      speed = Math.ceil(1000 / speed);
    }
    new AutoDivScroll("video-strength-wrapper", speed, 1, 1);
    autoScrollDivs.push("video-strength-wrapper");
  }

  if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
    if (allVideoStats[0].z === undefined) {
      reloadVideoStrengthDashboard();
    } else {
      for (let index = 0; index < graphData.length; index++) {
        const graph = graphData[index];
        displayVideoStrengthBars(graph.videoStats, graph.graphId);
      }
    }
  }
}

/**
 * Recalculates the strength for all videos and loads the video strength
 * dashboard
 *
 * @returns {Promise} Status message
 */
function reloadVideoStrengthDashboard() {
  return getVideoStrengthWeights()
    .then(weights => {
      try {
        const allVideoStats = lsGet("allVideoStats");
        let updatedAllVideoStats = calcVideoStrength(allVideoStats, weights);
        lsSet("allVideoStats", updatedAllVideoStats);
        loadVideoStrengthDashboard();
      } catch (err) {
        const errorMsg = "Unable to recalculate video strengths";
        console.error(errorMsg, err);
        recordError(err, errorMsg);
        return errorMsg;
      }
    });
}

/**
 * Calculates videographer statistics and displays graphs on the videographer
 * dashboards
 */
function loadVideographerDashboards() {
  try {
    let videographers = calcVideographerStats();
    displayVideographerMonthlyVideos(videographers);

    const request1 = requestVideographerAvgViews(videographers,
      getDateFromDaysAgo(34), getDateFromDaysAgo(4))
      .then(videographers => {
        displayVideographerAvgViews(videographers);
      })
      .catch(err => {
        // Displays graph errors for average views graphs
        const graphIds = getDashboardGraphIds("videographerGraphs").avgViews;
        for (const key in graphIds) {
          if (graphIds.hasOwnProperty(key)) {
            const graphId = graphIds[key];
            displayGraphError(graphId);
          }
        }
        recordError(err,
          "Unable to display videographer average views graphs - ");
      });

    const request2 = getVideographerMonthlyViews(videographers)
      .then(updatedVideographers => {
        displayVideographerMonthlyViews(updatedVideographers);
      })
      .catch(err => {
        // Displays graph errors for monthly views graphs
        const graphIds = [
          getDashboardGraphIds("videographerGraphs").cumulativeViews,
          getDashboardGraphIds("videographerGraphs").monthlyViews
        ];
        graphIds.forEach(dashboard => {
          for (const key in dashboard) {
            if (dashboard.hasOwnProperty(key)) {
              const graphId = dashboard[key];
              displayGraphError(graphId);
            }
          }
        });
        recordError(err,
          "Unable to display videographer monthly views graphs - ");
      });
    const request3 = requestVideographerEngagementStats(videographers,
      getDateFromDaysAgo(34), getDateFromDaysAgo(4));
    const request4 = requestVideographerEngagementStats(videographers);
    
    Promise.all([request1, request2, request3, request4])
      .then(response => {
        displayVideographerStats();
        saveVideographerStatsToSheets();
      }) 
  } catch (err) {
    // Displays graph errors for all graphs in the videographer dashboards
    const graphIds = [
      getDashboardGraphIds("videographerGraphs").avgViews,
      getDashboardGraphIds("videographerGraphs").cumulativeVideos,
      getDashboardGraphIds("videographerGraphs").cumulativeViews,
      getDashboardGraphIds("videographerGraphs").monthlyVideos,
      getDashboardGraphIds("videographerGraphs").monthlyViews
    ];
    graphIds.forEach(dashboard => {
      for (const key in dashboard) {
        if (dashboard.hasOwnProperty(key)) {
          const graphId = dashboard[key];
          displayGraphError(graphId);
        }
      }
    });
    recordError(err, "Unable to load videographer dashboards");
  }
}

/**
 * Gets videographer stats from Google Sheets and displays them on the
 * videographer stats dashboards. For when the user is not signed in to Google.
 * Other dashboards in the videographer carousel are loaded through the graph
 * data Google Sheet
 *
 * @returns {Promise} Status message
 */
function loadVideographerDashboardsSignedOut() {
  return getVideographerStats()
    .then(videographers => {
      displayVideographerStats(videographers);
    });
}

/**
 * Adds the videographer stats (vstats) dashboards to the videographer carousel
 */
function createVideographerStatsDashboards() {
  const carouselInner = document.getElementById("videographer-carousel-inner");
  const indicatorList = document.getElementById("videographer-indicator-list");
  const people = ["Shane C", "Rick F", "Tim W"];
  const categories = {
    "all": "All Videos",
    "organic": "Organic Videos",
    "notOrganic": "Not Organic Videos"
  };
  let index = carouselInner.childElementCount;
  people.forEach(name => {
    const dashboardId = "vstats-" + name.replace(" ", "*");
    const dashboardOverallId = "vstats-overall-" + name.replace(" ", "*");

    let dashboardItem = document.getElementById("vstats-#").cloneNode(true);
    let dashboardText = dashboardItem.outerHTML;
    let mainGrids = "";
    let overallGrids = "";
    for (const category in categories) {
      if (categories.hasOwnProperty(category)) {
        const categoryName = categories[category];
        // Create multiple grids. One for each category
        const gridItem =
          document.getElementById("vstats-#-@-grid").cloneNode(true);
        if (category == "all") {
          gridItem.classList.add("active-grid");
        }
        let gridText = gridItem.outerHTML;
        gridText = gridText.replace(/@/g, category);
        gridText = gridText.replace(/\*Name\*/g, name);
        gridText = gridText.replace(/\*Category\*/g, categoryName);
        mainGrids += gridText;

        const gridOverallItem =
          document.getElementById("vstats-overall-#-@-grid").cloneNode(true);
        let gridOverallText = gridOverallItem.outerHTML;
        gridOverallText = gridOverallText.replace(/@/g, category);
        gridOverallText = gridOverallText.replace(/\*Name\*/g, name);
        gridOverallText =
          gridOverallText.replace(/\*Category\*/g, categoryName);
        overallGrids += gridOverallText;
      }
    }
    dashboardText =
      dashboardText.replace(/<div>MAIN GRID PLACEHOLDER<\/div>/, mainGrids);
    dashboardText = dashboardText
      .replace(/<div>OVERALL GRID PLACEHOLDER<\/div>/, overallGrids);
    dashboardText = dashboardText.replace(/vstats-#/g, dashboardId);
    dashboardText =
      dashboardText.replace(/vstats-overall-#/g, dashboardOverallId);
    let template = document.createElement("template");
    template.innerHTML = dashboardText;
    dashboardItem = template.content.firstChild;

    document.createElement("div", dashboardItem.outerText)
    dashboardItem.setAttribute("theme", "light");
    const indicator = document.getElementById("indicator").cloneNode();
    indicator.id = "videographer-indicator-" + index;
    indicator.setAttribute("onclick", `goToCarouselItem(${index})`);
    indicator.setAttribute("data-target", "#videographer-carousel");
    indicator.className = "fas fa-play-circle indicator";
    carouselInner.appendChild(dashboardItem);
    indicatorList.appendChild(indicator);
    index++;
  });
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
function calcVideoStrength(allVideoStats, weights) {
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
    let strength = 0;
    for (const name in weights) {
      if (weights.hasOwnProperty(name)) {
        const weight = weights[name];
        strength += (weight * zScoreData[name][index]);
      }
    }
    allVideoStats[index].totalStrength = strength;
    allVideoStats[index].z = {
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
    };
  }
  allVideoStats.sort(function (a,b) {
    return a.totalStrength - b.totalStrength;
  });
  let zScoreStrengths = zScoreByPropertyName(allVideoStats, "totalStrength");
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

/**
 * Calculates the basic stats of each videographer from the videos that they
 * created
 *
 * @returns {Object} The videographer statistics
 */
function calcVideographerStats() {
  const allVideoStats = lsGet("allVideoStats");
  const statsByVideoId = lsGet("statsByVideoId");
  let videographers = {};

  for (let index = 0; index < allVideoStats.length; index++) {
    const videoStats = allVideoStats[index];
    const videoId = videoStats.videoId;
    const createdBy = statsByVideoId[videoId].createdBy;
    const organic = statsByVideoId[videoId].organic;
    if (!videographers[createdBy]) {
      videographers[createdBy] = {
        "all": {
          "totalComments": 0,
          "totalDislikes": 0,
          "totalDuration": 0,
          "totalLikeRatio": 0.0,
          "totalLikes": 0,
          "totalSubsGained": 0,
          "totalViews": 0,
          "videos": []
        },
        "organic": {
          "totalComments": 0,
          "totalDislikes": 0,
          "totalDuration": 0,
          "totalLikeRatio": 0.0,
          "totalLikes": 0,
          "totalSubsGained": 0,
          "totalViews": 0,
          "videos": []
        },
        "notOrganic": {
          "totalComments": 0,
          "totalDislikes": 0,
          "totalDuration": 0,
          "totalLikeRatio": 0.0,
          "totalLikes": 0,
          "totalSubsGained": 0,
          "totalViews": 0,
          "videos": []
        }
      };
    }
    let categories = [videographers[createdBy].all];
    if (organic) {
      categories.push(videographers[createdBy].organic);
    } else {
      categories.push(videographers[createdBy].notOrganic);
    }
    const comments = videoStats.comments;
    const dislikes = videoStats.dislikes;
    const duration = videoStats.duration;
    const likeRatio = videoStats.likes /
      (videoStats.likes + videoStats.dislikes);
    const likes = videoStats.likes;
    const subsGained = videoStats.subscribersGained;
    const views = videoStats.views;
    categories.forEach(category => {
      category.totalComments += comments;
      category.totalDislikes += dislikes;
      category.totalDuration += duration;
      if (!isNaN(likeRatio)) {
        category.totalLikeRatio += likeRatio;
      }
      category.totalLikes += likes;
      category.totalSubsGained += subsGained;
      category.totalViews += views;
      category.videos.push(videoId);
    });
  }
  for (const name in videographers) {
    if (videographers.hasOwnProperty(name)) {
      const categories = videographers[name];
      for (const category in categories) {
        if (categories.hasOwnProperty(category)) {
          const data = categories[category];
          let numVideos = data.videos.length;
          data.numVideos = numVideos;
          if (numVideos == 0) {
            numVideos = 1;
          }
          data.avgComments = data.totalComments / numVideos;
          data.avgDislikes = data.totalDislikes / numVideos;
          data.avgDuration = data.totalDuration / numVideos;
          data.avgLikeRatio = data.totalLikeRatio / numVideos;
          data.avgLikes = data.totalLikes / numVideos;
          data.avgSubsGained = data.totalSubsGained / numVideos;
          data.avgViews = data.totalViews / numVideos;
          let likeRatio = data.avgLikes / (data.avgLikes + data.avgDislikes);
          if (isNaN(likeRatio)) {
            likeRatio = undefined;
          }
          data.cumLikeRatio = likeRatio;
        }
      }
    }
  }
  videographers = calcVideographerVideosByMonth(videographers);
  lsSet("videographers", videographers);
  return videographers;
}

/**
 * Gets the number of videos produced by each videographer for each month
 *
 * @param {Object} videographers The videographer statistics
 * @returns {Object} `videographers` updated with the monthly videos statistics
 */
function calcVideographerVideosByMonth(videographers) {
  const statsByVideoId = lsGet("statsByVideoId");
  const today = new Date();
  // The number of days in `lastXDays`
  const X = 30;
  for (const name in videographers) {
    if (videographers.hasOwnProperty(name)) {
      const categories = videographers[name];
      for (const category in categories) {
        if (categories.hasOwnProperty(category)) {
          const data = categories[category];
          let monthlyVideos = {};
          let numVideosLastXDays = 0;
          const videos = data.videos;
          videos.forEach(videoId => {
            const publishDate = statsByVideoId[videoId].publishDate;
            const month = publishDate.substr(0, 7);
            if (monthlyVideos[month] == undefined) {
              monthlyVideos[month] = 0;
            }
            monthlyVideos[month] += 1;
            if (today - new Date(publishDate) <= X * 86400000) {
              numVideosLastXDays++;
            }
          });
          const allMonths = getMonthsSince(2010, 7);
          allMonths.forEach(month => {
            if (monthlyVideos[month] == undefined) {
              monthlyVideos[month] = 0;
            }
          });
          data.monthlyVideos = monthlyVideos;
          data.numVideosLastXDays = numVideosLastXDays;
        }
      }
    }
  }
  return videographers;
}

/**
 * Creates the Monthly Videos and Cumulative Videos By Videographer stacked line
 * graphs
 *
 * @param {Object} videographers Videographer statistics
 */
function displayVideographerMonthlyVideos(videographers) {
  videographers = videographers || lsGet("videographers");
  const people = ["Shane C", "Rick F", "Tim W"];
  const graphIds = [
    getDashboardGraphIds("videographerGraphs").cumulativeVideos,
    getDashboardGraphIds("videographerGraphs").monthlyVideos
  ];
  const categories = {
    "all": {
      "cumulative": {
        "graphId": graphIds[0].all,
        "title": "Cumulative Videos By Videographer (All Videos)"
      },
      "monthly": {
        "graphId": graphIds[1].all,
        "title": "Monthly Videos By Videographer (All Videos)"
      }
    },
    "organic": {
      "cumulative": {
        "graphId": graphIds[0].organic,
        "title": "Cumulative Videos By Videographer (Organic Videos)"
      },
      "monthly": {
        "graphId": graphIds[1].organic,
        "title": "Monthly Videos By Videographer (Organic Videos)"
      }
    },
    "notOrganic": {
      "cumulative": {
        "graphId": graphIds[0].notOrganic,
        "title": "Cumulative Videos By Videographer (Not Organic Videos)"
      },
      "monthly": {
        "graphId": graphIds[1].notOrganic,
        "title": "Monthly Videos By Videographer (Not Organic Videos)"
      }
    }
  };
  for (const category in categories) {
    if (categories.hasOwnProperty(category)) {
      const cumulativeGraphTitle = categories[category].cumulative.title;
      const cumulativeGraphId = categories[category].cumulative.graphId;
      const monthlyGraphTitle = categories[category].monthly.title;
      const monthlyGraphId = categories[category].monthly.graphId;
      let cumulativeData = [];
      let monthlyData = [];

      people.forEach(name => {
        const stats = videographers[name][category];
        const monthlyVideos = stats.monthlyVideos;
        let sortList = [];
        for (const month in monthlyVideos) {
          if (monthlyVideos.hasOwnProperty(month)) {
            const numVideos = monthlyVideos[month];
            sortList.push({
              month: month,
              numVideos: numVideos
            });
          }
        }
        sortList.sort(function (a, b) {
          return a.month > b.month ? 1 :
            a.month == b.month ? 0 :
            -1;
        });
        let months = [];
        let cumulativeNumVideos = [];
        let monthlyNumVideos = [];
        let videoTotal = 0;
        let cumulativeCustomData = [];
        let monthlyCustomData = [];
        sortList.forEach(elem => {
          videoTotal += elem.numVideos;
          months.push(elem.month);
          cumulativeNumVideos.push(videoTotal);
          monthlyNumVideos.push(elem.numVideos);
          let cumulativeText = [];
          if (elem.numVideos == 1) {
            cumulativeText.push("1 new video");
            monthlyCustomData.push("1 video");
          } else {
            cumulativeText.push(`${elem.numVideos} new videos`);
            monthlyCustomData.push(`${elem.numVideos} videos`);
          }
          if (videoTotal == 1) {
            cumulativeText.push("1 video total");
          } else {
            cumulativeText.push(`${videoTotal} videos total`);
          }
          cumulativeCustomData.push(cumulativeText);
        });
        let cumulativeTrace = {
          x: months,
          y: cumulativeNumVideos,
          name: name,
          customdata: cumulativeCustomData,
          stackgroup: "one",
          hovertemplate: "%{customdata[0]} in %{x}" +
            "<br>%{customdata[1]}<extra>" + name + "</extra>",
        };
        let monthlyTrace = {
          x: months,
          y: monthlyNumVideos,
          name: name,
          customdata: monthlyCustomData,
          stackgroup: "one",
          groupnorm: "percent",
          hovertemplate: "%{y:.0f}% of total videos<br>%{customdata}<extra>" +
            name +"</extra>",
        };
        cumulativeData.push(cumulativeTrace);
        monthlyData.push(monthlyTrace);
      });

      const graphHeight = 0.8583;
      const graphWidth = 0.9528;
      const height = graphHeight * document.documentElement.clientHeight;
      const width = graphWidth * document.documentElement.clientWidth;
      const titleFontSize =
        Math.floor(0.0208 * document.documentElement.clientWidth);
      const legendFontSize =
        Math.floor(0.0100 * document.documentElement.clientWidth);
      const axisTitleSize =
        Math.floor(0.0156 * document.documentElement.clientWidth);
      const tickSize =
        Math.floor(0.0104 * document.documentElement.clientWidth);
      const topMargin = Math.floor(0.03 * document.documentElement.clientWidth);
      const bottomMargin =
        Math.floor(0.0104 * document.documentElement.clientWidth);

      const cumulativeLayout = {
        height: height,
        width: width,
        hoverlabel: {
          font: {
            size: tickSize
          },
          namelength: -1
        },
        legend: {
          bgcolor: "#eeeeee",
          font: {
            size: legendFontSize
          },
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
          text: cumulativeGraphTitle
        },
        xaxis: {
          automargin: true,
          fixedrange: true,
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
            text: "Cumulative Videos Created"
          }
        }
      };
      let monthlyLayout = JSON.parse(JSON.stringify(cumulativeLayout));
      monthlyLayout.title.text = monthlyGraphTitle;
      monthlyLayout.yaxis.ticksuffix = "%";
      monthlyLayout.yaxis.title.text = "Percentage of Videos Created";

      const config = {
        scrollZoom: false,
        displayModeBar: false,
      }

      try {
        createGraph(cumulativeGraphId, cumulativeData, cumulativeLayout, config,
          graphHeight, graphWidth);
      } catch (err) {
        displayGraphError(cumulativeGraphId, err);
      }
      try {
        createGraph(monthlyGraphId, monthlyData, monthlyLayout, config,
          graphHeight, graphWidth);
      } catch (err) {
        displayGraphError(monthlyGraphId, err);
      }
    }
  }
}

/**
 * Creates the Monthly Views and Cumulative Views By Videographer stacked line
 * graphs
 *
 * @param {Object} videographers Videographer statistics
 */
function displayVideographerMonthlyViews(videographers) {
  videographers = videographers || lsGet("videographers");
  const people = ["Shane C", "Rick F", "Tim W"];
  const graphIds = [
    getDashboardGraphIds("videographerGraphs").cumulativeViews,
    getDashboardGraphIds("videographerGraphs").monthlyViews
  ];
  const categories = {
    "all": {
      "cumulative": {
        "graphId": graphIds[0].all,
        "title": "Cumulative Views By Videographer (All Videos)"
      },
      "monthly": {
        "graphId": graphIds[1].all,
        "title": "Monthly Views By Videographer (All Videos)"
      }
    },
    "organic": {
      "cumulative": {
        "graphId": graphIds[0].organic,
        "title": "Cumulative Views By Videographer (Organic Videos)"
      },
      "monthly": {
        "graphId": graphIds[1].organic,
        "title": "Monthly Views By Videographer (Organic Videos)"
      }
    },
    "notOrganic": {
      "cumulative": {
        "graphId": graphIds[0].notOrganic,
        "title": "Cumulative Views By Videographer (Not Organic Videos)"
      },
      "monthly": {
        "graphId": graphIds[1].notOrganic,
        "title": "Monthly Views By Videographer (Not Organic Videos)"
      }
    }
  };
  for (const category in categories) {
    if (categories.hasOwnProperty(category)) {
      const cumulativeGraphTitle = categories[category].cumulative.title;
      const cumulativeGraphId = categories[category].cumulative.graphId;
      const monthlyGraphTitle = categories[category].monthly.title;
      const monthlyGraphId = categories[category].monthly.graphId;
      let cumulativeData = [];
      let monthlyData = [];

      people.forEach(name => {
        const stats = videographers[name][category];
        const monthlyViews = stats.monthlyViews;
        let sortList = [];
        for (const month in monthlyViews) {
          if (monthlyViews.hasOwnProperty(month)) {
            const numViews = monthlyViews[month];
            sortList.push({
              month: month,
              numViews: numViews
            });
          }
        }
        sortList.sort(function (a, b) {
          return a.month > b.month ? 1 :
            a.month == b.month ? 0 :
            -1;
        });
        let months = [];
        let cumulativeNumViews = [];
        let monthlyNumViews = [];
        let viewTotal = 0;
        let cumulativeCustomData = [];
        let monthlyCustomData = [];
        sortList.forEach(elem => {
          viewTotal += elem.numViews;
          months.push(elem.month);
          cumulativeNumViews.push(viewTotal);
          monthlyNumViews.push(elem.numViews);
          let cumulativeText = [];
          if (elem.numViews == 1) {
            cumulativeText.push("1 new view");
            monthlyCustomData.push("1 view");
          } else {
            cumulativeText.push(`${numberWithCommas(elem.numViews)} new views`);
            monthlyCustomData.push(`${numberWithCommas(elem.numViews)} views`);
          }
          if (viewTotal == 1) {
            cumulativeText.push("1 view total");
          } else {
            cumulativeText.push(`${numberWithCommas(viewTotal)} views total`);
          }
          cumulativeCustomData.push(cumulativeText);
        });
        let cumulativeTrace = {
          x: months,
          y: cumulativeNumViews,
          name: name,
          customdata: cumulativeCustomData,
          stackgroup: "one",
          hovertemplate: "%{customdata[0]} in %{x}" +
            "<br>%{customdata[1]}<extra>" + name + "</extra>",
        };
        let monthlyTrace = {
          x: months,
          y: monthlyNumViews,
          name: name,
          customdata: monthlyCustomData,
          stackgroup: "one",
          groupnorm: "percent",
          hovertemplate: "%{y:.0f}% of total videos<br>%{customdata}<extra>" +
            name +"</extra>",
        };
        cumulativeData.push(cumulativeTrace);
        monthlyData.push(monthlyTrace);
      });

      const graphHeight = 0.8583;
      const graphWidth = 0.9528;
      const height = graphHeight * document.documentElement.clientHeight;
      const width = graphWidth * document.documentElement.clientWidth;
      const titleFontSize =
        Math.floor(0.0208 * document.documentElement.clientWidth);
      const legendFontSize =
        Math.floor(0.0100 * document.documentElement.clientWidth);
      const axisTitleSize =
        Math.floor(0.0156 * document.documentElement.clientWidth);
      const tickSize =
        Math.floor(0.0104 * document.documentElement.clientWidth);
      const topMargin = Math.floor(0.03 * document.documentElement.clientWidth);
      const bottomMargin =
        Math.floor(0.0104 * document.documentElement.clientWidth);

      const cumulativeLayout = {
        height: height,
        width: width,
        hoverlabel: {
          font: {
            size: tickSize
          },
          namelength: -1
        },
        legend: {
          bgcolor: "#eeeeee",
          font: {
            size: legendFontSize
          },
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
          text: cumulativeGraphTitle
        },
        xaxis: {
          automargin: true,
          fixedrange: true,
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
            text: "Cumulative Views"
          }
        }
      };
      let monthlyLayout = JSON.parse(JSON.stringify(cumulativeLayout));
      monthlyLayout.title.text = monthlyGraphTitle;
      monthlyLayout.yaxis.ticksuffix = "%";
      monthlyLayout.yaxis.title.text = "Percentage of Views";

      const config = {
        scrollZoom: false,
        displayModeBar: false,
      }

      try {
        createGraph(cumulativeGraphId, cumulativeData, cumulativeLayout, config,
          graphHeight, graphWidth);
      } catch (err) {
        displayGraphError(cumulativeGraphId, err);
      }
      try {
        createGraph(monthlyGraphId, monthlyData, monthlyLayout, config,
          graphHeight, graphWidth);
      } catch (err) {
        displayGraphError(monthlyGraphId, err);
      }
    }
  }
}

/**
 * Creates the Videographer - Average Views Per Video stacked bar graph
 *
 * @param {Object} videographers Videographer statistics
 */
function displayVideographerAvgViews(videographers) {
  videographers = videographers || lsGet("videographers");
  const graphIds = getDashboardGraphIds("videographerGraphs").avgViews;
  const categories = {
    "all": {
      "graphId": graphIds.all,
      "title": "Average Views Per Video By Videographer (All Videos)",
    },
    "organic": {
      "graphId": graphIds.organic,
      "title": "Average Views Per Video By Videographer (Organic Videos)",
    },
    "notOrganic": {
      "graphId": graphIds.notOrganic,
      "title": "Average Views Per Video By Videographer (Not Organic Videos)",
    },
  };
  for (const category in categories) {
    if (categories.hasOwnProperty(category)) {
      const graphTitle = categories[category].title;
      const graphId = categories[category].graphId;
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
      const textSize =
        Math.floor(0.0156 * document.documentElement.clientWidth);
      const tickSize =
        Math.floor(0.0128 * document.documentElement.clientWidth);
      const topMargin = Math.floor(0.03 * document.documentElement.clientWidth);
      const bottomMargin =
        Math.floor(0.0104 * document.documentElement.clientWidth);

      let allTime = [];
      let lastXDays = [];
      const people = ["Shane C", "Rick F", "Tim W"];
      people.forEach(name => {
        const stats = videographers[name][category];
        const avgViews = Math.round(stats.avgViews);
        const lastXDaysAvgViews = Math.round(stats.lastXDaysAvgViews);
        allTime.push(avgViews);
        lastXDays.push(lastXDaysAvgViews);
      });
      const trace1 = {
        x: people,
        y: allTime,
        name: "All Time",
        offsetgroup: 1,
        textfont: {
          size: textSize
        },
        textposition: "auto",
        texttemplate: "~%{y:,}<br>views",
        type: "bar",
        yaxis: "y"
      };
      let trace2 = JSON.parse(JSON.stringify(trace1));
      trace2.y = lastXDays;
      trace2.name = "Last 30 Days";
      trace2.offsetgroup = 2;
      trace2.yaxis = "y2";
      let data = [trace1, trace2];

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
          xanchor: 'left',
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
          text: graphTitle
        },
        xaxis: {
          automargin: true,
          fixedrange: true,
          tickfont: {
            size: tickSize
          },
          title: {
            font: {
              size: axisTitleSize
            },
            text: "Videographers"
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
            text: "Average Views Per Video (All Time)"
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
            text: "Average Views Per Video (Last 30 Days)"
          }
        }
      };

      const config = {
        scrollZoom: false,
        displayModeBar: false,
        staticPlot: true,
        responsive: true
      }

      try {
        createGraph(graphId, data, layout, config, graphHeight, graphWidth);
      } catch (err) {
        displayGraphError(graphId, err);
      }
    }
  }
}