/**
 * @fileoverview Creates a report of the formatting all video descriptions on
 * YouTube.
 */

/**
 * Gets the channel uploads, description for each video, checks the format of
 * each description, and generates a report of the results
 *
 * @returns {Promise} Status message
 */
function createDescriptionReport() {
  const statusText = document.getElementById("status-text");
  const loadingBar = document.getElementById("loading-bar");
  const loadingBarContainer = document.getElementById("loading-bar-container");
  const viewReportButton = document.getElementById("view-report-button");
  loadingBarContainer.style.display = "";
  loadingBar.style.width = "0%";
  loadingBar.classList.add("progress-bar-animated");
  statusText.style.display = "";
  statusText.innerText = "Fetching YouTube Videos...";
  viewReportButton.style.display = "none";
  return getVideoList()
    .then(response => {
      const statsByVideoId = response[0];
      let uploads = [];
      for (const videoId in statsByVideoId) {
        if (statsByVideoId.hasOwnProperty(videoId)) {
          const video = statsByVideoId[videoId];
          const privacy = video.privacy;
          if (privacy == "public") {
            uploads.push(videoId);
          }
        }
      }
      // First half of loading bar is for fetching descriptions
      // Second half is for checking format
      let numUploads = uploads.length;
      loadingBar.ariaValueMax = numUploads + Math.ceil(numUploads / 50);
      statusText.innerText = "Retrieving Descriptions...";
      // return getAllDescriptions(uploads.slice(0, 50));
      return getAllDescriptions(uploads);
    })
    .then(descriptions => {
      // const allLinks = scanDescriptionsForLinks(descriptions);
      statusText.innerText = "Verifying Description Format...";
      let formatErrors = [];
      for (let index = 0; index < descriptions.length; index++) {
        const video = descriptions[index];
        formatErrors.push(checkFormat(video));
        incrementLoadingBar();
      }
      statusText.innerText = "Generating Spreadsheet...";
      return saveDescriptionsErrors(formatErrors);
    })
    .then(response => {
      statusText.innerText = "Finished!";
      loadingBar.classList.remove("progress-bar-animated");
      viewReportButton.style.display = "";
    })
    .catch(err => {
      statusText.innerText = "Process Failed";
      const errorMsg = `Error creating description report`;
      displayError(errorMsg);
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

/**
 * Gets the descriptions of the videos from the YouTube Data API
 *
 * @param {Array<String>} videos A list of videoIds
 * @returns {Array<String>} A list of descriptions for the provided videos
 */
function getAllDescriptions(videos) {
  let requests = [];
  for (let i = 0; i < videos.length; i += 50) {
    const fiftyVideos = videos.slice(i, i + 50);
    const fiftyVideosStr = fiftyVideos.join(",");
    const gapiRequest = {
      "part": "snippet",
      "id": fiftyVideosStr
    };
    const request = gapi.client.youtube.videos.list(gapiRequest)
      .then(response => {
        console.log(`Video Request`, response);
        let descriptions = [];
        const videoItems = response.result.items;
        for (let index = 0; index < videoItems.length; index++) {
          const video = videoItems[index];
          const videoId = video.id;
          const description = video.snippet.description;
          descriptions.push({
            "videoId": videoId,
            "description": description
          });
        }
        incrementLoadingBar();
        // Return for post-processing of the data elsewhere
        return descriptions;
      })
      .catch(err => {
        const errorMsg = `Error in fetching descriptions for video group` +
          ` ${i} - ${i + 49}: `;
        displayError(errorMsg,);
        console.error(errorMsg, err);
        recordError(err, errorMsg);
        return errorMsg;
      });
    requests.push(request);
  }

  return Promise.all(requests)
    .then(response => {
      const descriptions = [].concat.apply([], response);
      return descriptions;
    });
}

/**
 * Tallies the number of appearances for links across the given descriptions
 *
 * @param {Array<String>} descriptions A list of video descriptions
 * @returns {Object} An object where keys are links which correspond to their
 *    number of appearances
 */
function scanDescriptionsForLinks(descriptions) {
  let allLinks = {};
  for (let index = 0; index < descriptions.length; index++) {
    const video = descriptions[index];
    const videoId = video["videoId"];
    const description = video["description"];
    const links = searchForURLs(description);
    for (let linkIndex = 0; linkIndex < links.length; linkIndex++) {
      const url = links[linkIndex];
      if (allLinks[url] == undefined) {
        allLinks[url] = 1;
      } else {
        allLinks[url] += 1;
      }
    }
  }
  // Sort the links by most appearances in description to least
  let sortable = [];
  for (const link in allLinks) {
    sortable.push([link, allLinks[link]]);
  }
  sortable.sort(function (a, b) {
    return b[1] - a[1];
  });
  console.log(sortable);
  return allLinks;
}

/**
 * Writes the description error report to the reports Google Sheet
 *
 * @param {Array<Array<String>>} formatErrors The list of format errors for each
 *    video description
 * @returns {Promise} Status message
 */
function saveDescriptionsErrors(formatErrors) {
  const columnHeaders = [
    "Video ID", "YouTube Link", "(VID-**-****)", "Subscribe Link",
    "Facebook Link", "Twitter Link", "LinkedIn Link",
    "'Prices Were Valid' Sentence", "'Check out all videos' sentence"
  ];
  formatErrors.unshift(columnHeaders);
  const body = {
    values: formatErrors
  };
  const updatePromise = clearSpreadsheet("Reports", "Description Format")
    .then(response => {
      return updateSheetData("Reports", "Description Format", body);
    });
  return updatePromise;
}

/**
 * Checks if the video description contains all required elements
 *
 * @param {Object} video The desired video as with "videoId" and "description"
 *    attributes
 * @returns {Array<String>} A report of what is present and missing
 */
function checkFormat(video) {
  const videoId = video["videoId"];
  const description = video["description"];
  const videoLink = `https://youtu.be/${videoId}`;
  let errors = [videoId, videoLink];
  errors.push(checkVID(description));
  errors.push(checkSocialLinks(description));
  errors.push(checkPricesWereValid(description));
  errors.push(checkAllVideoLink(description));
  errors = [].concat.apply([], errors);
  return errors;
}

/**
 * Checks if the description contains the a ADC VID of the form (VID-**-****)
 *
 * @param {String} description The text to search through
 * @returns {Array<String>} Either ["Present"] or ["MISSING"]
 */
function checkVID(description) {
  const regexVID = /\(VID-[a-zA-Z0-9]{2,3}-([0-9]{2}|[0-9]{4})\)/g;
  const match = regexVID.exec(description);
  if (!match) {
    return ["MISSING"];
  } else {
    return ["Present"];
  }
}

/**
 * Checks if the description contains the Subscribe, Facebook, Twitter, and
 * LinkedIn links
 *
 * @param {String} description The text to search through
 * @returns {Array<String>} Contains a combination of "Present" and "MISSING"
 */
function checkSocialLinks(description) {
  let errors = [];

  const regexYT = /https:\/\/www\.youtube\.com\/(user\/automationdirect\?sub_confirmation=1|subscription_center\?add_user=automationdirect)(?:\s|$)/g;
  const matchYT = regexYT.exec(description);
  if (!matchYT) {
    errors.push("MISSING");
  } else {
    errors.push("Present");
  }

  const regexFB = /https:\/\/www\.facebook\.com\/[aA]utomation[dD]irect(?:\s|$)/g;
  const matchFB = regexFB.exec(description);
  if (!matchFB) {
    errors.push("MISSING");
  } else {
    errors.push("Present");
  }
  const regexTwitter = /https:\/\/(?:www\.)?twitter\.com\/[aA]utomation[dD]irec(?:\s|$)/g;
  const matchTwitter = regexTwitter.exec(description);
  if (!matchTwitter) {
    errors.push("MISSING");
  } else {
    errors.push("Present");
  }

  const regexLinkedIn = /https:\/\/www\.linkedin\.com\/company\/automationdirect/;
  const matchLinkedIn = regexLinkedIn.exec(description);
  if (!matchLinkedIn) {
    errors.push("MISSING");
  } else {
    errors.push("Present");
  }

  return errors;
}

/**
 * Checks if the description contains the "Prices were valid" sentence
 *
 * @param {String} description The text to search through
 * @returns {Array<String>} Either ["Present"] or ["MISSING"]
 */
function checkPricesWereValid(description) {
  const pricesSentence = "Prices were valid at the time the video was" +
    " released and are subject to change";
  if (description.indexOf(pricesSentence) === -1) {
    return ["MISSING"];
  } else {
    return ["Present"];
  }
}

/**
 * Checks if the description contains the "Check out all of our videos" sentence
 *
 * @param {String} description The text to search through
 * @returns {Array<String>} Either ["Present"] or ["MISSING"]
 */
function checkAllVideoLink(description) {
  const regexSentence = /Check out all of our videos at:? https:\/\/www\.[aA]utomation[dD]irect\.com\/[vV]ideos/;
  const match = regexSentence.exec(description);
  if (!match) {
    return ["MISSING"];
  } else {
    return ["Present"];
  }
}

/**
 * Increments the loading bar by one
 */
function incrementLoadingBar() {
  const loadingBar = document.getElementById("loading-bar");
  loadingBar.ariaValueNow++;
  const numFinished = loadingBar.ariaValueNow;
  const total = loadingBar.ariaValueMax;
  const percentage = (numFinished / total) * 100;
  const percentageText = percentage.toFixed(2) + "%";
  loadingBar.style.width = percentageText;
}

/**
 * Searches input text for URLs and returns list of found URLs
 *
 * @param {*} inputText The text to search through for URLs
 * @returns {Array<String>} A list of URLs
 */
function searchForURLs(inputText) {
  const findURLs = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
  let links = [];
  let match;
  do {
    match = findURLs.exec(inputText);
    if (match) {
      links.push(match[0]);
    }
  } while (match);
  return links;
}

/**
 * Creates and displays an error alert with the provided error
 *
 * @param {String} errorMsg The error message to display
 */
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

/**
 * Loads the page once the user has signed into Google
 */
function loadSignedIn() {
  const scanButton = document.getElementById("scan-button");
  scanButton.disabled = "";
  scanButton.onclick = createDescriptionReport;
}

/* Individual Video Functions */

/**
 * Finds all URLs in the description of a video
 *
 * @param {String} videoId The desired video
 * @returns {Promise} A list of links in the provided video's description
 */
function findLinksForVideo(videoId) {
  return requestVideoDescription(videoId)
    .then(description => {
      const links = searchForURLs(description);
      return links;
    })
    .catch(err => {
      const errorMsg = `Error getting description links for video:` +
        ` ${videoId} - `;
      displayError(errorMsg);
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

/**
 * Gets the description of a video from the YouTube API
 *
 * @param {String} videoId The desired video
 * @returns {String} The description of the desired video
 */
function requestVideoDescription(videoId) {
  const request = {
    "part": "snippet",
    "id": videoId
  };
  return gapi.client.youtube.videos.list(request)
    .then(response => {
      console.log(`Video Description for video: ${videoId}`, response);
      const description = response.result.items[0].snippet.description;
      return description;
    })
    .catch(err => {
      const errorMsg = `Error getting video description for video:` +
        ` ${videoId} - `;
      displayError(errorMsg);
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}