function displayThumbnails(uploads) {
  var thumbnailContainer = document.getElementById("thumbnail-container");
  var uploadThumbnails = "";
  uploadThumbnails += `<div class="thumbnail-page">`;
  for (var i = 0; i < uploads.length; i++) {
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

function loadSignedIn() {
  document.getElementById("menu").innerHTML +=
    `<button class="btn btn-lg btn-primary mt-3" id="refresh-btn">Refresh Thumbnails</button>`;
  document.getElementById("thumbnail-container").innerHTML =
    `<h5>No thumbnails are loaded. Press the "Refresh Thumbnails" button to view the thumbnails.</h5>`;
  document.getElementById("about-list").innerHTML +=
    `<li>Thumbnails not loading? Try <a href="" id="signout-text">signing out</a> and signing back in.</li>`;

  var signoutText = document.getElementById("signout-text");
  signoutText.addEventListener("click", handleSignout);
  var refreshBtn = document.getElementById("refresh-btn");
  refreshBtn.addEventListener("click", loadUploads);
  loadUploads();
}

function loadSignedOut() {
  // add hr, sign in text and sign in button
  document.getElementById("menu").innerHTML += `
    <hr>
    <h5>Sign In with your Google Account (the same account you use to edit the "ADC Video Dashboard Input Data" Google Sheet) to load the thumbnails.</h5>
    <button class="btn btn-lg btn-primary mt-3" id="signin-btn">Sign In</button>
  `;

  var signinBtn = document.getElementById("signin-btn");
  signinBtn.addEventListener("click", handleAuthClick);
}

function loadUploads() {
  document.getElementById("thumbnail-container").innerHTML = `
    <div class="text-center"><i class="fas fa-cog fa-3x fa-spin"></i></div>
  `;
  requestSpreadsheetData("Input Data", "Video List")
    .then(videoList => {
      const uploads = recordUploads(videoList);
      displayThumbnails(uploads);
      document.getElementById("error-container").className = "d-none";
    })
    .catch(err => {
      document.getElementById("thumbnail-container").innerHTML = "";
      document.getElementById("error-container").className = "d-block";
      document.getElementById("error-message").innerText = err.message;
    });
}

function recordUploads(videoList) {
  let uploads = [];
  let columns = {};
  let columnHeaders = videoList[0];
  for (let i = 0; i < columnHeaders.length; i++) {
    columns[columnHeaders[i]] = i;
  }
  for (let i = videoList.length - 1; i >= 1; i--) {
    let row = videoList[i];
    let videoId = row[columns["Video ID"]];
    uploads.push(videoId);
  }
  return uploads;
}