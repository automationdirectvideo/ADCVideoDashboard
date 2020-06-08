/**
 * @fileoverview Gets channel uploads and displays their thumbnails in a table
 */

/**
 * Displays the upload thumbnails in a grid
 *
 * @param {Array<String>} uploads A list of videoIds
 */
function displayThumbnails(uploads) {
  let thumbnailContainer = document.getElementById("thumbnail-container");
  let uploadThumbnails = "";
  uploadThumbnails += `<div class="thumbnail-page">`;
  for (let i = 0; i < uploads.length; i++) {
    uploadThumbnails += `
      <a href="https://youtu.be/${uploads[i]}" target="_blank">
        <img class="thumbnail"
            src="https://i.ytimg.com/vi/${uploads[i]}/mqdefault.jpg" 
            alt="thumbnail"></a>`;
    if (i % 100 == 99) {
      uploadThumbnails += `</div><div class="thumbnail-page">`;
    } else if (i % 10 == 9) {
      uploadThumbnails += `<br>`;
    }
  }
  thumbnailContainer.innerHTML = uploadThumbnails;
}

/**
 * Gets the list of channel uploads from the input data Google Sheet and
 * displays the uploads thumbnails in a grid
 */
function loadUploads() {
  document.getElementById("thumbnail-container").innerHTML = `
    <div class="text-center"><i class="fas fa-cog fa-3x fa-spin"></i></div>
  `;
  requestSpreadsheetData("Input Data", "Video List")
    .then(videoList => {
      let uploads = [];
      let columns = getColumnHeaders(videoList);
      for (let i = videoList.length - 1; i >= 1; i--) {
        const row = videoList[i];
        const videoId = row[columns["Video ID"]];
        uploads.push(videoId);
      }
      displayThumbnails(uploads);
      document.getElementById("error-container").className = "d-none";
    })
    .catch(err => {
      document.getElementById("thumbnail-container").innerHTML = "";
      document.getElementById("error-container").className = "d-block";
      document.getElementById("error-message").innerText = err.message;
    });
}

/**
 * Loads the page once the user has signed into Google
 */
function loadSignedIn() {
  document.getElementById("menu").innerHTML +=
    `<button class="btn btn-lg btn-primary mt-3" id="refresh-btn">Refresh Thumbnails</button>`;
  document.getElementById("thumbnail-container").innerHTML =
    `<h5>No thumbnails are loaded. Press the "Refresh Thumbnails" button to view the thumbnails.</h5>`;
  document.getElementById("about-list").innerHTML +=
    `
      <li>Thumbnails not loading? Try <a href="" id="signout-text">signing out</a> and signing back in.</li>
      <li>
        Missing some thumbnails? Make sure the missing videos are listed in the 
        <a href="https://docs.google.com/spreadsheets/d/1LNVjw5Hf2Ykp89jtxaX9itH5NOoudwaz0T74E7flZZg/edit#gid=485839191?usp=sharing"
          target="_blank">"ADC Video Dashboard Input Data" Google Sheet</a>.
      </li>
    `;

  let signoutText = document.getElementById("signout-text");
  signoutText.addEventListener("click", handleSignout);
  let refreshBtn = document.getElementById("refresh-btn");
  refreshBtn.addEventListener("click", loadUploads);
  loadUploads();
}