/**
 * @fileoverview Creats a report of all comments from all channel videos.
 */

/**
 * Gets the comments from all videos and creates a report with all of the
 * comment data
 *
 * @returns {Promise} Status message
 */
function createCommentsReport() {
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
      const uploads = response[1];
      loadingBar.ariaValueMax = uploads.length;
      statusText.innerText = "Retrieving Comments...";
      // return getAllComments(uploads.slice(0, 50));
      return getAllComments(uploads);
    })
    .then(allCommentData => {
      statusText.innerText = "Generating Spreadsheet...";
      return saveCommentsReport(allCommentData);
    })
    .then(response => {
      statusText.innerText = "Finished!";
      loadingBar.classList.remove("progress-bar-animated");
      viewReportButton.style.display = "";
    })
    .catch(err => {
      statusText.innerText = "Process Failed";
      const errorMsg = `Error creating comments report`;
      displayError(errorMsg);
      console.log(errorMsg, err);
      recordError(err, errorMsg);
    });
}

/**
 * Gets the comments from all the videos from the YouTube Data API
 *
 * @param {Array<String>} uploads A list of videoIds
 * @returns {Array<Array<String>>} All comments for all videos
 */
function getAllComments(uploads) {
  let requests = [];
  for (let index = 0; index < uploads.length; index++) {
    const videoId = uploads[index];
    requests.push(getCommentsForVideo(videoId));
  }
  return Promise.all(requests)
    .then(commentDataArray => {
      const allCommentData = [].concat.apply([], commentDataArray);
      return allCommentData;
    })
    .catch(err => {
      const errorMsg = `Unable to combine all comment data into one array`;
      displayError(errorMsg);
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

/**
 * Gets the comments for a video from the YouTube Data API. Only includes top
 * level comments that were not written by AutomationDirect
 *
 * @param {String} videoId The desired video
 * @param {String} pageToken The value corresponding to the next page of the
 *    YouTube API response. Used for recursion
 * @returns {Array<Array<String>>} All comments for the video
 */
function getCommentsForVideo(videoId, pageToken) {
  let request = {
    "maxResults": 100,
    "part": "snippet",
    "textFormat": "plainText",
    "videoId": videoId
  };
  if (pageToken) {
    request["pageToken"] = pageToken;
  }
  const videoLink = `https://youtu.be/${videoId}`;

  return gapi.client.youtube.commentThreads.list(request)
    .then(response => {
      const comments = response.result.items;
      let commentData = [];
      for (let index = 0; index < comments.length; index++) {
        const comment = comments[index].snippet.topLevelComment.snippet;
        const author = comment.authorDisplayName;
        const publishedAt = comment.publishedAt;
        const text = comment.textDisplay;
        const authorId = comment.authorChannelId.value;
        if (authorId != "UCR5c2ZGLZY2FFbxZuSxzzJg") {
          // The author of the comment is not AutomationDirect.com
          commentData.push([
            videoId,
            videoLink,
            author,
            publishedAt,
            text
          ]);
        }
      }

      const nextPageToken = response.result.nextPageToken;
      if (nextPageToken) {
        // There are more results than could fit in the API response
        // Get the rest of the comments
        return getCommentsForVideo(videoId, nextPageToken)
          .then(moreCommentData => {
            // Combine the original results and the next page(s) into one array
            let allCommentData = [].concat.apply([],
              [commentData, moreCommentData]);
            return allCommentData;
          })
      } else {
        // This response was contained all of the comments or the last page of
        // the comments
        incrementLoadingBar();
        return commentData;
      }
    })
    .catch(err => {
      const errorMsg = `Unable to get comments for video: ${videoId}`;
      displayError(errorMsg);
      console.error(errorMsg, err);
      recordError(err, errorMsg);
      // Return an empty array since the response will be concatenated with
      // other arrays
      return [];
    });
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
 * Writes the description error report to the reports Google Sheet
 *
 * @param {Array<Array<String>>} commentData The list of comment details
 * @returns {Promise} Status message
 */
function saveCommentsReport(commentData) {
  const columnHeaders = [
    "Video ID", "YouTube Link", "Comment Author", "Published At", "Comment"
  ];
  commentData.unshift(columnHeaders);
  const body = {
    values: commentData
  };
  const updatePromise = clearSpreadsheet("Reports", "Comments")
    .then(response => {
      return updateSheetData("Reports", "Comments", body);
    });
  return updatePromise;
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
  scanButton.onclick = createCommentsReport;
}