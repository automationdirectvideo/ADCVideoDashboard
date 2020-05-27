function createCommentsReport() {
  const statusText = document.getElementById("status-text");
  const loadingBar = document.getElementById("loading-bar");
  const loadingBarContainer = document.getElementById("loading-bar-container");
  loadingBarContainer.style.display = "";
  loadingBar.style.width = "0%";
  loadingBar.classList.add("progress-bar-animated");
  statusText.style.display = "";
  statusText.innerText = "Fetching YouTube Videos...";
  return getVideoList()
    .then(response => {
      let uploads = response[1];
      console.log("uploads");
      console.log(uploads);
      loadingBar.ariaValueMax = uploads.length;
      statusText.innerText = "Retrieving Comments...";
      // return getAllComments(uploads.slice(0, 50));
      return getAllComments(uploads);
    })
    .then(allCommentData => {
      statusText.style.display = "";
      statusText.innerText = "Generating Spreadsheet...";
      return saveCommentsReport(allCommentData);
    })
    .then(response => {
      statusText.innerText = "Finished!";
      loadingBar.classList.remove("progress-bar-animated");
    })
    .catch(err => {
      statusText.innerText = "Process Failed";
      const errorMsg = `Error creating comments report`;
      displayError(errorMsg);
      console.log(errorMsg, err);
      recordError(err, errorMsg);
    });
}

function getAllComments(uploads) {
  let requests = [];
  for (let index = 0; index < uploads.length; index++) {
    const videoId = uploads[index];
    requests.push(getCommentsForVideo(videoId));
  }
  return Promise.all(requests)
    .then(commentDataArray => {
      let allCommentData = [].concat.apply([], commentDataArray);
      return allCommentData;
    })
    .catch(err => {
      const errorMsg = `Unable to combine all comment data into one array`;
      displayError(errorMsg);
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

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

  return gapi.client.youtube.commentThreads.list(request)
    .then(response => {
      let comments = response.result.items;
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
            author,
            publishedAt,
            text
          ]);
        }
      }

      let nextPageToken = response.result.nextPageToken;
      if (nextPageToken) {
        return getCommentsForVideo(videoId, nextPageToken)
          .then(moreCommentData => {
            let allCommentData = [].concat.apply([],
              [commentData, moreCommentData]);
            return allCommentData;
          })
      } else {
        const loadingBar = document.getElementById("loading-bar");
        loadingBar.ariaValueNow++;
        let numFinished = loadingBar.ariaValueNow;
        let total = loadingBar.ariaValueMax;
        let percentage = (numFinished / total) * 100;
        let percentageText = percentage.toFixed(2) + "%";
        loadingBar.style.width = percentageText;
        return commentData;
      }
    })
    .catch(err => {
      const errorMsg = `Unable to get comments for video: ${videoId}`;
      displayError(errorMsg);
      console.error(errorMsg, err);
      recordError(err, errorMsg);
      return [];
    });
}

function saveCommentsReport(commentData) {
  const columnHeaders = [
    "Video ID", "Comment Author", "Published At", "Comment"
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
  console.log("Signed In");
}

function loadSignedOut() {
  console.log("Signed Out");
}