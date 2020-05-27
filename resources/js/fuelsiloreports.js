function getCategoryStatsByYear() {
  return requestSpreadsheetData("Stats", "Category Views By Year")
  .then(sheet => {
    console.log(sheet);
  });
}

function loadSignedIn() {
  const scanButton = document.getElementById("report-button");
  scanButton.disabled = "";
  scanButton.onclick = getCategoryStatsByYear;
}