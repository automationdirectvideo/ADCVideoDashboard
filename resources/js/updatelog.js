function loadUpdateLog() { 
  return requestSpreadsheetData("Logs", "Update Log")
    .then(updateValues => {
      console.log("UpdateValues: ", updateValues);
      const updateTableBody = document.getElementById("update-table-body");
      let output = ``;

      let columns = {};
      let columnHeaders = updateValues[0];
      for (let i = 0; i < columnHeaders.length; i++) {
        columns[columnHeaders[i]] = i;
      }
      for (let index = updateValues.length - 1; index >= 1; index--) {
        const update = updateValues[index];
        const time = update[columns["Time"]];
        const browser = update[columns["Browser"]];
        let loginStatus;
        if (update[columns["Login Status"]].toUpperCase() == "TRUE") {
          loginStatus = "Logged In";
        } else {
          loginStatus = "Not Logged In";
        }
        const message = update[columns["Message"]];
        output += `
        <tr>
          <td>${time}</td>
          <td>${browser}</td>
          <td>${loginStatus}</td>
          <td>${message}</td>
        </tr>
        `;
      }
      updateTableBody.innerHTML = output;
      $("#update-table").DataTable({
        "order": [[0, 'desc']]
      });
      document.getElementById("table-loading").style.display = "none";
    })
    .catch(err => {
      const errorMsg = "Unable to display error log: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

function loadSignedIn() {
  console.log("Signed In");
  loadUpdateLog();
}

function loadSignedOut() {
  console.log("Signed Out");
}