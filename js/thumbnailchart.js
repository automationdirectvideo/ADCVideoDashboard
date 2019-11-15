function displayThumbnails() {
  let uploads = JSON.parse(localStorage.getItem("uploads"));
  var thumbnailContainer = document.getElementById("thumbnail-container");
  if (!uploads) {
    loadUploads();
  } else {
    var uploadThumbnails = "";
    for (var i = 0; i < uploads.length; i++) {
      var videoTitle = "YouTube Video ID: " + uploads[i];
      if (statsByVideoId && statsByVideoId[uploads[i]]) {
        videoTitle = statsByVideoId[uploads[i]]["title"];
      }
      uploadThumbnails += `
        <a href="https://youtu.be/${uploads[i]}" target="_blank"
            onclick="closeFullscreen()" alt="${videoTitle}">
          <img class="thumbnail"
              src="https://i.ytimg.com/vi/${uploads[i]}/hqdefault.jpg" 
              alt="thumbnail" title="${videoTitle}">
        </a>`;
    }
    thumbnailContainer.innerHTML = uploadThumbnails;
  }
}

function loadUploads() {
  requestSpreadsheetData("1LNVjw5Hf2Ykp89jtxaX9itH5NOoudwaz0T74E7flZZg",
      "Video List", "Thumbnail Chart Uploads");
}

var uploads = JSON.parse(localStorage.getItem("uploads"));

var refreshBtn = document.getElementById("refresh-btn");
refreshBtn.addEventListener("click", loadUploads);

displayThumbnails();