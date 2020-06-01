function createDescriptionReport() {
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
    })
    .catch(err => {
      statusText.innerText = "Process Failed";
      const errorMsg = `Error creating description report`;
      displayError(errorMsg);
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

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
      let descriptions = [].concat.apply([], response);
      console.log("Descriptions")
      console.log(descriptions);
      return descriptions;
    });
}

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
  console.log("allLinks");
  console.log(allLinks);
  let sortable = [];
  for (var link in allLinks) {
    sortable.push([link, allLinks[link]]);
  }
  sortable.sort(function (a, b) {
    return b[1] - a[1];
  });
  console.log(sortable);
  return allLinks;
}

function saveDescriptionsErrors(formatErrors) {
  const columnHeaders = [
    "Video ID", "(VID-**-****)", "Subscribe Link", "Facebook Link",
    "Twitter Link", "LinkedIn Link", "'Prices Were Valid' Sentence",
    "'Check out all videos' sentence"
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

function checkFormat(video) {
  const videoId = video["videoId"];
  const description = video["description"];
  let errors = [videoId];
  errors.push(checkVID(description));
  errors.push(checkSocialLinks(description));
  errors.push(checkPricesWereValid(description));
  errors.push(checkAllVideoLink(description));
  errors = [].concat.apply([], errors);
  // console.log(`Video ID: ${videoId} - Errors: ${JSON.stringify(errors)}`);
  return errors;
}

function checkVID(description) {
  let regexVID = /\(VID-[a-zA-Z0-9]{2,3}-([0-9]{2}|[0-9]{4})\)/g;
  let match = regexVID.exec(description);
  if (!match) {
    return ["MISSING"];
  } else {
    return ["Present"];
  }
}

function checkSocialLinks(description) {
  let errors = [];

  const regexYT = /https:\/\/www\.youtube\.com\/(user\/automationdirect\?sub_confirmation=1|subscription_center\?add_user=automationdirect)(?:\s|$)/g;
  let matchYT = regexYT.exec(description);
  if (!matchYT) {
    errors.push("MISSING");
  } else {
    errors.push("Present");
  }

  const regexFB = /https:\/\/www\.facebook\.com\/[aA]utomation[dD]irect(?:\s|$)/g;
  let matchFB = regexFB.exec(description);
  if (!matchFB) {
    errors.push("MISSING");
  } else {
    errors.push("Present");
  }
  const regexTwitter = /https:\/\/(?:www\.)?twitter\.com\/[aA]utomation[dD]irec(?:\s|$)/g;
  let matchTwitter = regexTwitter.exec(description);
  if (!matchTwitter) {
    errors.push("MISSING");
  } else {
    errors.push("Present");
  }

  const regexLinkedIn = /https:\/\/www\.linkedin\.com\/company\/automationdirect/;
  let matchLinkedIn = regexLinkedIn.exec(description);
  if (!matchLinkedIn) {
    errors.push("MISSING");
  } else {
    errors.push("Present");
  }

  return errors;
}

function checkPricesWereValid(description) {
  let pricesSentence = "Prices were valid at the time the video was released and are subject to change";
  if (description.indexOf(pricesSentence) === -1) {
    return ["MISSING"];
  } else {
    return ["Present"];
  }
}

function checkAllVideoLink(description) {
  let regexSentence = /Check out all of our videos at:? https:\/\/www\.[aA]utomation[dD]irect\.com\/[vV]ideos/;
  let match = regexSentence.exec(description);
  if (!match) {
    return ["MISSING"];
  } else {
    return ["Present"];
  }
}

function incrementLoadingBar() {
  const loadingBar = document.getElementById("loading-bar");
  loadingBar.ariaValueNow++;
  let numFinished = loadingBar.ariaValueNow;
  let total = loadingBar.ariaValueMax;
  let percentage = (numFinished / total) * 100;
  let percentageText = percentage.toFixed(2) + "%";
  loadingBar.style.width = percentageText;
}

// Searches input text for URLs and returns list of found URLs
function searchForURLs(inputText) {
  let findURLs = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
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
  const scanButton = document.getElementById("scan-button");
  scanButton.disabled = "";
  scanButton.onclick = createDescriptionReport;
}

/* Individual Video Functions */

function findLinksForVideo(videoId) {
  return requestVideoDescription(videoId)
    .then(description => {
      let links = searchForURLs(description);
      return links;
    })
    .catch(err => {
      const errorMsg = `Error getting description links for video: ${videoId} - `;
      displayError(errorMsg);
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

// Returns description of given video
function requestVideoDescription(videoId) {
  const request = {
    "part": "snippet",
    "id": videoId
  };
  return gapi.client.youtube.videos.list(request)
    .then(response => {
      console.log(`Video Description for video: ${videoId}`, response);
      let videoId = response.result.items[0].id;
      let description = response.result.items[0].snippet.description;
      return description;
    })
    .catch(err => {
      const errorMsg = `Error getting video description for video: ${videoId} - `;
      displayError(errorMsg);
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}