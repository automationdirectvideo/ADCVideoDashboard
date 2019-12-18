function displayThumbnails() {
  var uploads = JSON.parse(localStorage.getItem("uploads"));
  var thumbnailContainer = document.getElementById("thumbnail-container");
  if (!uploads) {
    loadUploads();
  } else {
    var uploadThumbnails = "";
    uploadThumbnails += `<div class="thumbnail-page">`;
    for (var i = 0; i < uploads.length; i++) {
      uploadThumbnails += `
        <a href="https://youtu.be/${uploads[i]}" target="_blank">
          <img class="thumbnail" onload="thumbnailCheck($(this))"
              src="https://i.ytimg.com/vi/${uploads[i]}/maxresdefault.jpg" 
              alt="thumbnail"></a>`;
        if (i % 100 == 99) {
          uploadThumbnails += `</div><div class="thumbnail-page">`;
        } else if (i % 10 == 9) {
          uploadThumbnails += `<br>`;
        }
    }
    thumbnailContainer.innerHTML = uploadThumbnails;
  }
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
  try {
    document.getElementById("thumbnail-container").innerHTML = `
      <div class="text-center"><i class="fas fa-cog fa-3x fa-spin"></i></div>
    `;
    requestSpreadsheetData("1LNVjw5Hf2Ykp89jtxaX9itH5NOoudwaz0T74E7flZZg",
        "Video List", "Thumbnail Chart Uploads");
    document.getElementById("error-container").className = "d-none"
  } catch (err) {
    console.log(err);
    document.getElementById("thumbnail-container").innerHTML = "";
    document.getElementById("error-container").className = "d-block";
    document.getElementById("error-message").innerText = err.message;
  }
}

var uploads = JSON.parse(localStorage.getItem("uploads"));