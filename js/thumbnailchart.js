var uploads = JSON.parse(localStorage.getItem("uploads"));

var refreshBtn = document.getElementById("refresh-btn");
refreshBtn.addEventListener("click", function () {
    requestSpreadsheetData("1LNVjw5Hf2Ykp89jtxaX9itH5NOoudwaz0T74E7flZZg",
        "Video List", "Thumbnail Chart Uploads");
});