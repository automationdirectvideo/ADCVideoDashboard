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
        <a href="https://youtu.be/${uploads[i]}" target="_blank"><img class="thumbnail"
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
}

function loadUploads() {
  try {
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

var refreshBtn = document.getElementById("refresh-btn");
refreshBtn.addEventListener("click", loadUploads);

displayThumbnails();