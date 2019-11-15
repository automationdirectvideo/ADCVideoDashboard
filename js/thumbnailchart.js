function displayThumbnails() {
  let uploads = JSON.parse(localStorage.getItem("uploads"));
  var thumbnailContainer = document.getElementById("thumbnail-container");
  if (!uploads) {
    loadUploads();
  } else {
    var uploadThumbnails = "";
    for (var i = 0; i < uploads.length; i++) {
      uploadThumbnails += `
        <a href="https://youtu.be/${uploads[i]}" target="_blank">
          <img class="thumbnail"
              src="https://i.ytimg.com/vi/${uploads[i]}/hqdefault.jpg" 
              alt="thumbnail">
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